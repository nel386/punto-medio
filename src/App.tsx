import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { ArrowDown, ArrowRight, Beer, Check, Flame, LockKeyhole, MessageCircle, Minus, PenLine, Plus, Settings2, Sparkles, Sprout, Target, Trophy, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories, getFilteredScales, getCategoryName, allScales } from "./content/catalog";
import { chooseModifier, chooseScale, isCustomMode, modifiers, randomPosition, scoreNeedle } from "./domain/engine";
import type { GameMode, GameSession, Scale, Tone } from "./domain/types";
import { ads } from "./platform/ads";
import { clearSnapshot, loadSnapshot, saveSnapshot } from "./platform/storage";

type Screen = "setup" | "secret" | "handoff" | "guess" | "result" | "finished";

const toneOptions: { id: Tone; label: string; icon: LucideIcon }[] = [
  { id: "familiar", label: "Familiar", icon: Sprout },
  { id: "amigos", label: "Amigos", icon: Beer },
  { id: "adulto", label: "Adulto", icon: Flame },
];

const modeOptions: { id: GameMode; label: string; description: string; icon: LucideIcon }[] = [
  { id: "classic", label: "Clásico", description: "La pista y el debate de siempre.", icon: Target },
  { id: "modifiers", label: "Modificadores", description: "Cada ronda trae una regla inesperada.", icon: Sparkles },
  { id: "custom-scale", label: "A vuestra medida", description: "Inventad los dos extremos.", icon: PenLine },
];

const quickPacks: { id: string; label: string; description: string; categoryIds: string[] }[] = [
  { id: "conocerse", label: "Para conocerse", description: "Personalidad, amistad y relaciones", categoryIds: ["personalidad", "amistad", "relaciones"] },
  { id: "bar", label: "Debate de bar", description: "Cultura, deporte y pantalla", categoryIds: ["cultura", "deporte", "television-cine"] },
  { id: "finde", label: "Plan de finde", description: "Fiesta, comida, viajes y ocio", categoryIds: ["fiesta", "comida-bebida", "viajes", "ocio"] },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

let gearAudioContext: AudioContext | null = null;
let lastGearTickAt = 0;

function playPlasticGearTick(direction: number) {
  const now = performance.now();
  if (now - lastGearTickAt < 34) return;
  lastGearTickAt = now;
  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  gearAudioContext ??= new AudioContextCtor();
  const context = gearAudioContext;
  if (context.state === "suspended") void context.resume();
  const start = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(direction >= 0 ? 230 : 205, start);
  oscillator.frequency.exponentialRampToValueAtTime(92, start + 0.028);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.035, start + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.034);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.036);
}

function displayScale(session: GameSession | null): Scale | null {
  if (!session?.selectedScaleId) return null;
  if (session.customScale) {
    return { id: session.selectedScaleId, categoryId: "custom", leftLabel: session.customScale.leftLabel, rightLabel: session.customScale.rightLabel, tone: session.tones[0] ?? "amigos", enabled: true };
  }
  return allScales.find((scale) => scale.id === session.selectedScaleId) ?? null;
}

// Punto físico común medido sobre los PNG maestros: centro del rail, nacimiento
// de la fan y centro del hub. Las piezas giran; este punto nunca se traslada.
const WHEEL_PIVOT_Y = 0.505;
const WHEEL_ANIMATION_MS = 1200;

const WHEEL_LAYER_KEYS = ["gear", "background", "target", "screen", "shell", "opener", "needle"] as const;
type WheelLayerKey = (typeof WHEEL_LAYER_KEYS)[number];
type WheelLayerCalibration = { x: number; y: number; scale: number; rotate: number; opacity: number; z: number };
type WheelCalibration = Record<WheelLayerKey, WheelLayerCalibration>;
type WheelCalibrationState = "closed" | "open";
type WheelCalibrationProfiles = Record<WheelCalibrationState, WheelCalibration>;

const WHEEL_LAYER_LABELS: Record<WheelLayerKey, string> = {
  gear: "Rueda dentada",
  background: "Fondo blanco",
  target: "Puntuación",
  screen: "Tapa celeste",
  shell: "Carcasa azul",
  opener: "Abridor",
  needle: "Aguja",
};

const DEFAULT_WHEEL_CALIBRATION: WheelCalibration = {
  gear: { x: -0.4, y: -1, scale: 0.96, rotate: 0, opacity: 1, z: 1 },
  background: { x: -5.551115123125783e-17, y: 6.85185185185185, scale: 1, rotate: 0, opacity: 1, z: 2 },
  target: { x: -0.7407407407407409, y: 39.8, scale: 0.96, rotate: 0, opacity: 1, z: 3 },
  screen: { x: -1.7, y: -4, scale: 1.04, rotate: 0, opacity: 1, z: 4 },
  shell: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, z: 5 },
  opener: { x: -67.1, y: 0.8, scale: 0.9, rotate: 180, opacity: 1, z: 5 },
  needle: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, z: 7 },
};

const DEFAULT_WHEEL_CALIBRATION_PROFILES: WheelCalibrationProfiles = {
  closed: {
    ...DEFAULT_WHEEL_CALIBRATION,
    screen: { ...DEFAULT_WHEEL_CALIBRATION.screen, y: 4.7 },
    opener: { ...DEFAULT_WHEEL_CALIBRATION.opener, y: -0.2 },
  },
  open: DEFAULT_WHEEL_CALIBRATION,
};

const WHEEL_CALIBRATION_STORAGE_KEY = "punto-medio-wheel-calibration-v8";

function cloneWheelCalibration(source: WheelCalibration = DEFAULT_WHEEL_CALIBRATION): WheelCalibration {
  return Object.fromEntries(WHEEL_LAYER_KEYS.map((key) => [key, { ...source[key] }])) as WheelCalibration;
}

function cloneDefaultWheelCalibrationProfiles(): WheelCalibrationProfiles {
  return {
    closed: cloneWheelCalibration(DEFAULT_WHEEL_CALIBRATION_PROFILES.closed),
    open: cloneWheelCalibration(DEFAULT_WHEEL_CALIBRATION_PROFILES.open),
  };
}

function mergeWheelCalibration(saved: Partial<WheelCalibration> | undefined, fallback: WheelCalibration): WheelCalibration {
  const merged = cloneWheelCalibration(fallback);
  if (!saved) return merged;
  for (const key of WHEEL_LAYER_KEYS) merged[key] = { ...merged[key], ...(saved[key] ?? {}) };
  return merged;
}

function loadWheelCalibrationProfiles(): WheelCalibrationProfiles {
  const defaults = cloneDefaultWheelCalibrationProfiles();
  try {
    const stored = window.localStorage.getItem(WHEEL_CALIBRATION_STORAGE_KEY);
    if (stored) {
      const saved = JSON.parse(stored) as Partial<WheelCalibrationProfiles>;
      return {
        closed: mergeWheelCalibration(saved.closed, defaults.closed),
        open: mergeWheelCalibration(saved.open, defaults.open),
      };
    }
  } catch {
    // Una configuración dañada no debe impedir que arranque el juego.
  }
  return defaults;
}

function calibratedVisualStyle(calibration: WheelCalibration, layer: WheelLayerKey): CSSProperties {
  const value = calibration[layer];
  return {
    marginLeft: `${value.x}%`,
    marginTop: `${value.y}%`,
    scale: String(value.scale),
    rotate: `${value.rotate}deg`,
    opacity: value.opacity,
  };
}

function positionFromPointer(event: { clientX: number; clientY: number }, element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  const pivotX = bounds.left + bounds.width / 2;
  const pivotY = bounds.top + bounds.height * WHEEL_PIVOT_Y;
  const angle = Math.atan2(event.clientX - pivotX, pivotY - event.clientY) * (180 / Math.PI);
  const clampedAngle = Math.max(-67.5, Math.min(67.5, angle));
  return Math.round(Math.max(0, Math.min(100, 50 + clampedAngle / 1.35)));
}

function ScoreWheel({ target, gearRotation = 0, needle, showTarget, isOpening, isClosing, shuffleInteractive = false, showOpener = false, interactive = false, calibration = DEFAULT_WHEEL_CALIBRATION, animationCalibration, calibrationMode = false, selectedCalibrationLayer, onNeedleChange, onTargetRotate, onCalibrationMove, onCalibrationScale }: { target: number; gearRotation?: number; needle?: number | null; showTarget: boolean; isOpening: boolean; isClosing: boolean; shuffleInteractive?: boolean; showOpener?: boolean; interactive?: boolean; calibration?: WheelCalibration; animationCalibration?: WheelCalibration; calibrationMode?: boolean; selectedCalibrationLayer?: WheelLayerKey; onNeedleChange?: (value: number) => void; onTargetRotate?: (delta: number) => void; onCalibrationMove?: (x: number, y: number) => void; onCalibrationScale?: (delta: number) => void }) {
  const targetAngle = (target - 50) * 1.35;
  const needleValue = needle ?? 50;
  const needleAngle = (needleValue - 50) * 1.35;
  const showNeedle = needle !== null && needle !== undefined;
  const targetDrag = useRef<{ pointerId: number; lastAngle: number } | null>(null);
  const calibrationDrag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const gearTickAccumulator = useRef(0);
  function pointerMetrics(event: { clientX: number; clientY: number; currentTarget: EventTarget & HTMLElement }) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height * WHEEL_PIVOT_Y);
    return { angle: Math.atan2(y, x) * (180 / Math.PI), radius: Math.hypot(x, y) / bounds.width };
  }
  function handlePointerDown(event: { clientX: number; clientY: number; pointerId: number; currentTarget: EventTarget & HTMLElement; preventDefault: () => void }) {
    if (calibrationMode && onCalibrationMove) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      calibrationDrag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      return;
    }
    if (shuffleInteractive && onTargetRotate) {
      const metrics = pointerMetrics(event);
      if (metrics.radius >= 0.39 && metrics.radius <= 0.54) {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        targetDrag.current = { pointerId: event.pointerId, lastAngle: metrics.angle };
        gearTickAccumulator.current = 0;
        playPlasticGearTick(1);
        return;
      }
    }
    if (!interactive || !onNeedleChange) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onNeedleChange(positionFromPointer(event, event.currentTarget));
  }
  function handlePointerMove(event: { clientX: number; clientY: number; pointerId: number; currentTarget: EventTarget & HTMLElement; preventDefault: () => void }) {
    if (calibrationDrag.current?.pointerId === event.pointerId && onCalibrationMove) {
      event.preventDefault();
      const bounds = event.currentTarget.getBoundingClientRect();
      const deltaX = ((event.clientX - calibrationDrag.current.x) / bounds.width) * 100;
      const deltaY = ((event.clientY - calibrationDrag.current.y) / bounds.height) * 100;
      calibrationDrag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      onCalibrationMove(deltaX, deltaY);
      return;
    }
    if (targetDrag.current?.pointerId === event.pointerId && onTargetRotate) {
      event.preventDefault();
      const metrics = pointerMetrics(event);
      let delta = metrics.angle - targetDrag.current.lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      targetDrag.current.lastAngle = metrics.angle;
      if (Math.abs(delta) < 0.08) return;
      onTargetRotate(delta / 1.35);
      gearTickAccumulator.current += delta;
      if (Math.abs(gearTickAccumulator.current) >= 5.5) {
        playPlasticGearTick(gearTickAccumulator.current);
        gearTickAccumulator.current = 0;
      }
      return;
    }
    if (!interactive || !onNeedleChange || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    onNeedleChange(positionFromPointer(event, event.currentTarget));
  }
  function handlePointerUp(event: { pointerId: number; currentTarget: EventTarget & HTMLElement }) {
    if (calibrationDrag.current?.pointerId === event.pointerId) calibrationDrag.current = null;
    if (targetDrag.current?.pointerId === event.pointerId) targetDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function handleKeyDown(event: { key: string; preventDefault: () => void }) {
    if (!shuffleInteractive || !onTargetRotate || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 2 : -2;
    onTargetRotate(delta);
    playPlasticGearTick(delta);
  }
  function handleCalibrationWheel(event: { deltaY: number; preventDefault: () => void }) {
    if (!calibrationMode || !onCalibrationScale) return;
    event.preventDefault();
    onCalibrationScale(event.deltaY < 0 ? 0.02 : -0.02);
  }
  const selectedClass = (layer: WheelLayerKey) => calibrationMode && selectedCalibrationLayer === layer ? " is-calibration-selected" : "";
  const motionStyle = (layer: "screen" | "opener") => {
    if (!animationCalibration) return calibratedVisualStyle(calibration, layer);
    return { ...calibratedVisualStyle(calibration, layer), "--motion-y-delta": `${animationCalibration[layer].y - calibration[layer].y}%` } as CSSProperties;
  };
  return (
    <div className={`score-wheel ${showTarget ? "target-open" : "target-closed"} ${isOpening ? "target-opening" : ""} ${isClosing ? "target-closing" : ""} ${shuffleInteractive ? "wheel-shuffle-enabled" : ""} ${interactive ? "wheel-interactive" : ""} ${calibrationMode ? "wheel-calibration-mode" : ""}`} tabIndex={shuffleInteractive ? 0 : undefined} role={shuffleInteractive ? "slider" : undefined} aria-valuemin={shuffleInteractive ? 6 : undefined} aria-valuemax={shuffleInteractive ? 94 : undefined} aria-valuenow={shuffleInteractive ? Math.round(target) : undefined} onKeyDown={handleKeyDown} onWheel={handleCalibrationWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} aria-label={calibrationMode ? `Ajustando ${selectedCalibrationLayer ? WHEEL_LAYER_LABELS[selectedCalibrationLayer] : "capa"}` : shuffleInteractive ? "Rueda dentada: desliza sobre el borde para colocar la puntuación secreta" : "Ruleta de puntuación: 2, 3, 4, 3 y 2 puntos; más lejos, 1 o 0 puntos"}>
      <div className="wheel-face">
        <div className="wheel-gear-pivot" style={{ "--gear-angle": `${gearRotation}deg`, zIndex: calibration.gear.z } as CSSProperties} aria-hidden="true">
          <img className={`wheel-gear wheel-calibratable${selectedClass("gear")}`} style={calibratedVisualStyle(calibration, "gear")} src="/assets/wheel/parts/gear-ring.png" alt="" draggable="false" />
        </div>
        <img className={`wheel-background wheel-calibratable${selectedClass("background")}`} style={{ ...calibratedVisualStyle(calibration, "background"), zIndex: calibration.background.z }} src="/assets/wheel/parts/background-white.png" alt="" aria-hidden="true" draggable="false" />
        <div className="wheel-target-pivot" style={{ "--target-angle": `${targetAngle}deg`, zIndex: calibration.target.z } as CSSProperties} aria-hidden="true">
          <img className={`wheel-target wheel-calibratable${selectedClass("target")}`} style={calibratedVisualStyle(calibration, "target")} src="/assets/wheel/parts/score-fan.png" alt="" draggable="false" />
        </div>
        <div className="wheel-screen-motion" style={{ zIndex: calibration.screen.z }} aria-hidden="true"><img className={`wheel-screen wheel-calibratable${selectedClass("screen")}`} style={motionStyle("screen")} src="/assets/wheel/parts/screen-mint.png" alt="" draggable="false" /></div>
        <img className={`wheel-shell wheel-calibratable${selectedClass("shell")}`} style={{ ...calibratedVisualStyle(calibration, "shell"), zIndex: calibration.shell.z }} src="/assets/wheel/parts/shell-blue.png" alt="" aria-hidden="true" draggable="false" />
        {showOpener && <div className="wheel-opener-motion" style={{ zIndex: calibration.opener.z }}><img className={`wheel-opener wheel-calibratable${selectedClass("opener")}`} style={motionStyle("opener")} src="/assets/wheel/parts/opener.png" alt="" aria-hidden="true" draggable="false" /></div>}
        {showNeedle && <div className="wheel-needle-pivot" style={{ transform: `rotate(${needleAngle}deg)`, zIndex: calibration.needle.z }}><img className={`wheel-needle wheel-calibratable${selectedClass("needle")}`} style={calibratedVisualStyle(calibration, "needle")} src="/assets/wheel/parts/needle.png" alt="" aria-hidden="true" draggable="false" aria-label={`Aguja en ${Math.round(needleValue)}%`} /></div>}
      </div>
    </div>
  );
}

function ScaleBar({ scale, target, gearRotation = 0, needle, reveal = false, showTarget, isOpening = false, isClosing = false, shuffleInteractive = false, showOpener = false, interactiveWheel = false, calibration, animationCalibration, onNeedleChange, onTargetRotate }: { scale: Scale; target: number; gearRotation?: number; needle?: number | null; reveal?: boolean; showTarget?: boolean; isOpening?: boolean; isClosing?: boolean; shuffleInteractive?: boolean; showOpener?: boolean; interactiveWheel?: boolean; calibration?: WheelCalibration; animationCalibration?: WheelCalibration; onNeedleChange?: (value: number) => void; onTargetRotate?: (delta: number) => void }) {
  const hasNeedle = needle !== null && needle !== undefined;
  const targetIsVisible = showTarget ?? reveal;
  const showRevealLegend = reveal && targetIsVisible && !isOpening && !isClosing;
  const showNeedleLegend = hasNeedle && (!reveal || showRevealLegend);
  return (
    <div className="scale-wrap" aria-label={`Escala entre ${scale.leftLabel} y ${scale.rightLabel}`}>
      <div className="scale-labels"><span>{scale.leftLabel}</span><span>{scale.rightLabel}</span></div>
      {reveal || interactiveWheel ? <ScoreWheel target={target} gearRotation={gearRotation} needle={hasNeedle || reveal ? (needle ?? 50) : null} showTarget={targetIsVisible} isOpening={isOpening} isClosing={isClosing} shuffleInteractive={shuffleInteractive} showOpener={showOpener} interactive={interactiveWheel} calibration={calibration} animationCalibration={animationCalibration} onNeedleChange={onNeedleChange} onTargetRotate={onTargetRotate} /> : <div className="scale-track is-guessing">
        <span className="scale-band band-warm" />
        <span className="scale-band band-neutral" />
        <span className="scale-band band-cool" />
        <span className="scale-divider divider-one" />
        <span className="scale-divider divider-two" />
        {hasNeedle && <span className="scale-needle" style={{ left: `${needle}%` }} aria-label={`Aguja en ${needle}%`}><b /></span>}
      </div>}
      {(showRevealLegend || showNeedleLegend) && <div className="scale-legend"><span>{showRevealLegend && <i className="legend-dot target" />} {showRevealLegend ? "Puntuación: 2 · 3 · 4 · 3 · 2 · fuera 1/0" : "Colocad la aguja"}</span>{showNeedleLegend && <span><i className="legend-dot guess" /> Aguja</span>}</div>}
    </div>
  );
}

function CalibrationNumberField({ label, value, decimals = 1, min, max, step, onChange }: { label: string; value: number; decimals?: number; min?: number; max?: number; step: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(() => value.toFixed(decimals));
  const isEditing = useRef(false);

  useEffect(() => {
    if (!isEditing.current) setDraft(value.toFixed(decimals));
  }, [decimals, value]);

  function parseDraft(rawValue: string) {
    const normalized = rawValue.trim().replace(",", ".");
    if (!normalized || normalized === "-" || normalized === "+" || normalized === "." || normalized === "-.") return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function handleChange(rawValue: string) {
    setDraft(rawValue);
    const parsed = parseDraft(rawValue);
    if (parsed !== null) onChange(parsed);
  }

  function handleBlur() {
    isEditing.current = false;
    const parsed = parseDraft(draft);
    if (parsed === null) {
      setDraft(value.toFixed(decimals));
      return;
    }
    const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, parsed));
    const rounded = Number(clamped.toFixed(decimals));
    onChange(rounded);
    setDraft(rounded.toFixed(decimals));
  }

  return <label>{label}<input type="number" inputMode="decimal" min={min} max={max} step={step} value={draft} onFocus={() => { isEditing.current = true; }} onChange={(event) => handleChange(event.target.value)} onBlur={handleBlur} /></label>;
}

function WheelCalibrationStudio({ calibrations, onChange, onClose }: { calibrations: WheelCalibrationProfiles; onChange: Dispatch<SetStateAction<WheelCalibrationProfiles>>; onClose: () => void }) {
  const [selectedLayer, setSelectedLayer] = useState<WheelLayerKey>("screen");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [showNeedle, setShowNeedle] = useState(true);
  const [copied, setCopied] = useState(false);
  const calibrationState: WheelCalibrationState = previewOpen ? "open" : "closed";
  const calibration = calibrations[calibrationState];
  const selected = calibration[selectedLayer];

  function updateSelected(patch: Partial<WheelLayerCalibration>) {
    onChange((current) => {
      const currentCalibration = current[calibrationState];
      return {
        ...current,
        [calibrationState]: {
          ...currentCalibration,
          [selectedLayer]: { ...currentCalibration[selectedLayer], ...patch },
        },
      };
    });
  }

  function moveSelected(deltaX: number, deltaY: number) {
    onChange((current) => {
      const currentCalibration = current[calibrationState];
      const currentSelected = currentCalibration[selectedLayer];
      return {
        ...current,
        [calibrationState]: {
          ...currentCalibration,
          [selectedLayer]: { ...currentSelected, x: currentSelected.x + deltaX, y: currentSelected.y + deltaY },
        },
      };
    });
  }

  function scaleSelected(delta: number) {
    onChange((current) => {
      const currentCalibration = current[calibrationState];
      const currentSelected = currentCalibration[selectedLayer];
      return {
        ...current,
        [calibrationState]: {
          ...currentCalibration,
          [selectedLayer]: { ...currentSelected, scale: Math.max(0.25, Math.min(2.5, currentSelected.scale + delta)) },
        },
      };
    });
  }

  function changeNumber(field: keyof WheelLayerCalibration, rawValue: string) {
    const value = Number(rawValue);
    if (!Number.isFinite(value)) return;
    updateSelected({ [field]: value });
  }

  function resetSelected() {
    onChange((current) => ({
      ...current,
      [calibrationState]: { ...current[calibrationState], [selectedLayer]: { ...DEFAULT_WHEEL_CALIBRATION_PROFILES[calibrationState][selectedLayer] } },
    }));
  }

  function resetCurrentState() {
    onChange((current) => ({ ...current, [calibrationState]: cloneWheelCalibration(DEFAULT_WHEEL_CALIBRATION_PROFILES[calibrationState]) }));
  }

  async function copyConfiguration() {
    await navigator.clipboard.writeText(JSON.stringify(calibrations, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="wheel-calibration-backdrop" role="dialog" aria-modal="true" aria-label="Editor visual de capas">
      <div className="wheel-calibration-studio">
        <header className="wheel-calibration-header">
          <div><small>HERRAMIENTA DE AJUSTE</small><h2>Editor visual de la ruleta</h2></div>
          <button className="wheel-calibration-close" onClick={onClose} aria-label="Cerrar editor">×</button>
        </header>
        <div className="wheel-calibration-workspace">
          <section className="wheel-calibration-preview">
            <div className="wheel-calibration-previewbar">
              <div className="calibration-segmented" aria-label="Estado de la ruleta">
                <button className={!previewOpen ? "active" : ""} onClick={() => setPreviewOpen(false)}>Cerrada</button>
                <button className={previewOpen ? "active" : ""} onClick={() => setPreviewOpen(true)}>Abierta</button>
              </div>
              <label><input type="checkbox" checked={showNeedle} onChange={(event) => setShowNeedle(event.target.checked)} /> Aguja</label>
            </div>
            <ScoreWheel target={56} gearRotation={18} needle={showNeedle ? 51 : null} showTarget={previewOpen} isOpening={false} isClosing={false} showOpener calibration={calibration} calibrationMode selectedCalibrationLayer={selectedLayer} onCalibrationMove={moveSelected} onCalibrationScale={scaleSelected} />
            <p className="wheel-calibration-help"><strong>{WHEEL_LAYER_LABELS[selectedLayer]} · {previewOpen ? "abierta" : "cerrada"}</strong> · arrastra para mover · usa la rueda del ratón para escalar</p>
          </section>
          <aside className="wheel-calibration-panel">
            <label className="calibration-layer-select">Capa<select value={selectedLayer} onChange={(event) => setSelectedLayer(event.target.value as WheelLayerKey)}>{WHEEL_LAYER_KEYS.map((key) => <option key={key} value={key}>{WHEEL_LAYER_LABELS[key]}</option>)}</select></label>
            <div className="calibration-fields">
              <CalibrationNumberField label="X (%)" value={selected.x} step={0.1} onChange={(value) => updateSelected({ x: value })} />
              <CalibrationNumberField label="Y (%)" value={selected.y} step={0.1} onChange={(value) => updateSelected({ y: value })} />
              <CalibrationNumberField label="Escala" value={selected.scale} decimals={2} min={0.25} max={2.5} step={0.01} onChange={(value) => updateSelected({ scale: value })} />
              <CalibrationNumberField label="Giro (°)" value={selected.rotate} step={0.5} onChange={(value) => updateSelected({ rotate: value })} />
              <CalibrationNumberField label="Opacidad" value={selected.opacity} decimals={2} min={0} max={1} step={0.05} onChange={(value) => updateSelected({ opacity: value })} />
              <CalibrationNumberField label="Orden" value={selected.z} decimals={0} min={0} max={20} step={1} onChange={(value) => updateSelected({ z: value })} />
            </div>
            <label className="calibration-slider">Tamaño <span>{Math.round(selected.scale * 100)}%</span><input type="range" min="0.25" max="2.5" step="0.01" value={selected.scale} onChange={(event) => changeNumber("scale", event.target.value)} /></label>
            <label className="calibration-slider">Giro <span>{selected.rotate.toFixed(1)}°</span><input type="range" min="-180" max="180" step="0.5" value={selected.rotate} onChange={(event) => changeNumber("rotate", event.target.value)} /></label>
            <div className="calibration-actions">
              <button onClick={resetSelected}>Restaurar capa</button>
              <button onClick={resetCurrentState}>Restaurar estado</button>
              <button onClick={() => onChange(cloneDefaultWheelCalibrationProfiles())}>Restaurar ambos</button>
              <button onClick={() => void copyConfiguration()}>{copied ? "Copiado ✓" : "Copiar configuración"}</button>
            </div>
            <p className="calibration-save-note">Estás editando sólo el estado <strong>{previewOpen ? "abierto" : "cerrado"}</strong>. Los cambios se guardan automáticamente y se aplican también al juego.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const initialSnapshot = loadSnapshot();
  const [screen, setScreen] = useState<Screen>((initialSnapshot?.screen as Screen | undefined) ?? "setup");
  const [session, setSession] = useState<GameSession | null>(initialSnapshot?.session ?? null);
  const [mode, setMode] = useState<GameMode>("classic");
  const [tones, setTones] = useState<Tone[]>(["amigos"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories.map((category) => category.categoryId));
  const [teamNames, setTeamNames] = useState(["Lima", "Naranja"]);
  const [roundsPerTeam, setRoundsPerTeam] = useState(1);
  const [customLeft, setCustomLeft] = useState("");
  const [customRight, setCustomRight] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [clue, setClue] = useState("");
  const [needle, setNeedle] = useState(50);
  const [usedScaleIds, setUsedScaleIds] = useState<string[]>([]);
  const [usedModifierIds, setUsedModifierIds] = useState<string[]>([]);
  const [selectedQuickPack, setSelectedQuickPack] = useState<string | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);
  const [targetOpening, setTargetOpening] = useState(false);
  const [targetClosing, setTargetClosing] = useState(false);
  const [hasSeenTarget, setHasSeenTarget] = useState(false);
  const [gearRotation, setGearRotation] = useState(0);
  const [wheelCalibrations, setWheelCalibrations] = useState<WheelCalibrationProfiles>(loadWheelCalibrationProfiles);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const calibrationEnabled = import.meta.env.DEV && new URLSearchParams(window.location.search).get("calibrate") === "1";
  const hideTargetTimer = useRef<number | null>(null);
  const closeTargetTimer = useRef<number | null>(null);
  const openTargetTimer = useRef<number | null>(null);

  const currentScale = displayScale(session);
  const currentModifier = session?.currentModifierId ? modifiers.find((modifier) => modifier.id === session.currentModifierId) : null;
  const filteredCount = useMemo(() => getFilteredScales(tones, selectedCategories).length, [tones, selectedCategories]);
  const categoryToneCounts = useMemo(() => new Map(categories.map((category) => [
    category.categoryId,
    category.scales.filter((scale) => scale.enabled && tones.includes(scale.tone)).length,
  ])), [tones]);
  const currentTeam = session?.teams[session.currentTeamIndex];
  const currentScore = session?.targetPosition !== null && session?.targetPosition !== undefined && session?.needlePosition !== null && session?.needlePosition !== undefined
    ? scoreNeedle(session.targetPosition, session.needlePosition)
    : 0;
  const targetIsShown = targetVisible || targetClosing;
  // Durante la transición mantenemos el perfil del estado de origen y
  // desplazamos suavemente sólo las capas que cambian de altura (tapa y
  // abridor). Así no saltan antes de llegar a su posición natural.
  const wheelCalibration = targetOpening
    ? wheelCalibrations.closed
    : targetClosing
      ? wheelCalibrations.open
      : targetIsShown
        ? wheelCalibrations.open
        : wheelCalibrations.closed;
  const wheelAnimationCalibration = targetOpening
    ? wheelCalibrations.open
    : targetClosing
      ? wheelCalibrations.closed
      : undefined;

  useEffect(() => {
    void ads.initialize();
  }, []);

  useEffect(() => {
    if (session && screen !== "setup") saveSnapshot({ session, screen });
  }, [session, screen]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const updateKeyboardState = () => {
      setKeyboardOpen(viewport.height < window.innerHeight - 120);
    };
    updateKeyboardState();
    viewport.addEventListener("resize", updateKeyboardState);
    viewport.addEventListener("scroll", updateKeyboardState);
    return () => {
      viewport.removeEventListener("resize", updateKeyboardState);
      viewport.removeEventListener("scroll", updateKeyboardState);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(WHEEL_CALIBRATION_STORAGE_KEY, JSON.stringify(wheelCalibrations));
  }, [wheelCalibrations]);

  useEffect(() => () => {
    if (hideTargetTimer.current !== null) window.clearTimeout(hideTargetTimer.current);
    if (closeTargetTimer.current !== null) window.clearTimeout(closeTargetTimer.current);
    if (openTargetTimer.current !== null) window.clearTimeout(openTargetTimer.current);
  }, []);

  function toggleCategory(id: string) {
    setSelectedQuickPack(null);
    setSelectedCategories((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleTone(nextTone: Tone) {
    setTones((current) => {
      if (current.includes(nextTone)) {
        return current.length === 1 ? current : current.filter((tone) => tone !== nextTone);
      }
      return [...current, nextTone];
    });
  }

  function applyQuickPack(pack: typeof quickPacks[number]) {
    setSelectedQuickPack(pack.id);
    setSelectedCategories(pack.categoryIds);
  }

  function closeTarget(animate = false) {
    if (hideTargetTimer.current !== null) window.clearTimeout(hideTargetTimer.current);
    if (closeTargetTimer.current !== null) window.clearTimeout(closeTargetTimer.current);
    if (openTargetTimer.current !== null) window.clearTimeout(openTargetTimer.current);
    hideTargetTimer.current = null;
    openTargetTimer.current = null;
    setTargetOpening(false);
    if (animate && targetVisible) {
      setTargetClosing(true);
      closeTargetTimer.current = window.setTimeout(() => {
        setTargetVisible(false);
        setTargetClosing(false);
        closeTargetTimer.current = null;
      }, WHEEL_ANIMATION_MS);
    } else {
      setTargetClosing(false);
      setTargetVisible(false);
    }
  }

  function openTarget() {
    if (!session || targetOpening || targetClosing) return;
    if (hideTargetTimer.current !== null) window.clearTimeout(hideTargetTimer.current);
    if (closeTargetTimer.current !== null) window.clearTimeout(closeTargetTimer.current);
    if (openTargetTimer.current !== null) window.clearTimeout(openTargetTimer.current);
    setTargetClosing(false);
    setTargetOpening(true);
    setTargetVisible(true);
    setHasSeenTarget(true);
    openTargetTimer.current = window.setTimeout(() => {
      setTargetOpening(false);
      openTargetTimer.current = null;
    }, WHEEL_ANIMATION_MS);
    hideTargetTimer.current = window.setTimeout(() => {
      hideTargetTimer.current = null;
      closeTarget(true);
    }, 4200);
  }

  function buildRound(base: GameSession, nextUsedScales: string[], nextUsedModifiers: string[]) {
    closeTarget();
    setHasSeenTarget(false);
    setGearRotation(0);
    let scale: Scale | null = null;
    let modifierId: string | null = null;
    let scaleUsed = nextUsedScales;
    let modifierUsed = nextUsedModifiers;
    if (isCustomMode(base.mode)) {
      scale = { id: `custom-${base.id}-${base.currentRound}`, categoryId: "custom", leftLabel: base.customScale?.leftLabel ?? "Antes", rightLabel: base.customScale?.rightLabel ?? "Después", tone: base.tones[0] ?? "amigos", enabled: true };
    } else {
      scale = chooseScale(getFilteredScales(base.tones, selectedCategories), nextUsedScales);
      if (scale) scaleUsed = [...nextUsedScales, scale.id];
    }
    if (base.mode === "modifiers") {
      const modifier = chooseModifier(nextUsedModifiers);
      modifierId = modifier?.id ?? null;
      if (modifier) modifierUsed = [...nextUsedModifiers, modifier.id];
    }
    const updated: GameSession = {
      ...base,
      selectedScaleId: scale?.id ?? null,
      currentModifierId: modifierId,
      targetPosition: randomPosition(),
      clue: null,
      needlePosition: null,
      revealed: false,
    };
    setUsedScaleIds(scaleUsed);
    setUsedModifierIds(modifierUsed);
    setNeedle(50);
    setClue("");
    setSession(updated);
    setScreen("secret");
  }

  function startGame() {
    const names = teamNames.map((name, index) => name.trim() || `Equipo ${index + 1}`);
    if (isCustomMode(mode) && (!customLeft.trim() || !customRight.trim())) return;
    const customScale = isCustomMode(mode) ? { leftLabel: customLeft.trim(), rightLabel: customRight.trim(), tag: customTag.trim() || undefined } : null;
    const base: GameSession = {
      id: makeId(), mode, tones, teams: names.map((name, index) => ({ id: `team-${index}`, name, score: 0 })),
      currentTeamIndex: 0, currentRound: 1, totalRounds: names.length * roundsPerTeam,
      selectedScaleId: null, currentModifierId: null, customScale, targetPosition: null,
      clue: null, needlePosition: null, revealed: false,
    };
    setUsedScaleIds([]);
    setUsedModifierIds([]);
    buildRound(base, [], []);
  }

  function submitClue() {
    closeTarget();
    setSession((current) => current ? { ...current, clue: clue.trim() || "(pista sin palabras)" } : current);
    setScreen("handoff");
  }

  function reveal() {
    setSession((current) => current ? { ...current, needlePosition: needle, revealed: true } : current);
    setScreen("result");
  }

  function rotateHiddenTarget(delta: number) {
    if (hasSeenTarget) return;
    setGearRotation((current) => current + delta * 1.35);
    setSession((current) => current ? { ...current, targetPosition: Math.max(6, Math.min(94, (current.targetPosition ?? 50) + delta)) } : current);
  }

  function nextRound() {
    if (!session) return;
    const nextRoundNumber = session.currentRound + 1;
    if (nextRoundNumber > session.totalRounds) {
      clearSnapshot();
      setScreen("finished");
      return;
    }
    const next: GameSession = {
      ...session,
      currentRound: nextRoundNumber,
      currentTeamIndex: (session.currentTeamIndex + 1) % session.teams.length,
      teams: session.teams.map((team) => team.id === currentTeam?.id ? { ...team, score: team.score + currentScore } : team),
    };
    void ads.showInterstitial("between-rounds");
    buildRound(next, usedScaleIds, usedModifierIds);
  }

  function finishGame() {
    if (!session) return;
    const finalTeams = session.teams.map((team) => team.id === currentTeam?.id ? { ...team, score: team.score + currentScore } : team);
    setSession({ ...session, teams: finalTeams });
    clearSnapshot();
    setScreen("finished");
    void ads.showInterstitial("end-game");
  }

  function restart() {
    closeTarget();
    clearSnapshot();
    setSession(null);
    setScreen("setup");
    setUsedScaleIds([]);
    setUsedModifierIds([]);
  }

  async function shareGame() {
    const shareText = "¿A qué punto pondrías la aguja? Prueba Punto Medio con tu grupo.";
    if (navigator.share) await navigator.share({ title: "Punto Medio", text: shareText, url: window.location.href });
    else if (navigator.clipboard) await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <main className={`app-shell ${keyboardOpen ? "keyboard-open" : ""}`}>
      <header className="topbar">
        <button className="brand" onClick={() => screen === "setup" ? undefined : restart()} aria-label="Volver al inicio"><span className="brand-mark">◒</span><span>Punto Medio</span></button>
      </header>

      {screen === "setup" && (
        <section className="page setup-page">
          <div className="hero">
            <h1>Nueva partida</h1>
            <p className="hero-copy">Elegid una persona, un plan o una opinión. Dad una pista y defended vuestro punto.</p>
          </div>
          <div id="game-settings" className="settings-grid">
            <div className="settings-main">
              <div className="section-heading"><div><p className="eyebrow">01 · Elige el caos</p><h2>¿Cómo queréis jugar?</h2></div></div>
              <div className="mode-grid">
                {modeOptions.map((option) => { const ModeIcon = option.icon; return <button key={option.id} className={`mode-card ${mode === option.id ? "selected" : ""}`} aria-pressed={mode === option.id} onClick={() => setMode(option.id)}><span className="mode-icon"><ModeIcon aria-hidden="true" /></span><span className="mode-card-copy"><strong>{option.label}</strong><small>{option.description}</small></span>{mode === option.id && <span className="check"><Check aria-hidden="true" /></span>}</button>; })}
              </div>

              {isCustomMode(mode) && <div className="custom-box"><p className="eyebrow">Vuestra escala</p><div className="custom-fields"><label>Extremo izquierdo<input value={customLeft} onChange={(event) => setCustomLeft(event.target.value)} placeholder="Mal plan" /></label><span className="custom-arrow">→</span><label>Extremo derecho<input value={customRight} onChange={(event) => setCustomRight(event.target.value)} placeholder="Planazo" /></label></div><label className="wide-label">Tema opcional<input value={customTag} onChange={(event) => setCustomTag(event.target.value)} placeholder="Ej. planes del finde" /></label></div>}

              <div className="tone-block"><div className="inline-heading"><div><p className="eyebrow">02 · Elegid el tono</p><h2>¿Qué ambiente queréis?</h2></div><span className="selection-note">{tones.length} {tones.length === 1 ? "tono" : "tonos"} · {filteredCount} escalas</span></div><div className="tone-grid">{toneOptions.map((option) => { const ToneIcon = option.icon; const isSelected = tones.includes(option.id); return <button key={option.id} className={`tone-card tone-${option.id} ${isSelected ? "selected" : ""}`} aria-pressed={isSelected} onClick={() => toggleTone(option.id)}><ToneIcon aria-hidden="true" /><strong>{option.label}</strong>{isSelected && <i><Check aria-hidden="true" /></i>}</button>; })}</div><p className="section-hint tone-hint">Podéis mezclar tonos. Se usará cualquier escala que encaje con los seleccionados.</p></div>

              <div className="category-block"><div className="inline-heading"><div><p className="eyebrow">03 · Elegid las categorías</p><h2>Categorías <span className="count-pill">{selectedCategories.length}/12</span></h2></div><div className="category-actions"><button onClick={() => { setSelectedQuickPack(null); setSelectedCategories(categories.map((category) => category.categoryId)); }}>Todas</button><button onClick={() => { setSelectedQuickPack(null); setSelectedCategories([]); }}>Limpiar</button></div></div><p className="section-hint">Elegid temas para que las pistas tengan dónde agarrarse.</p><div className="quick-packs" aria-label="Packs rápidos">{quickPacks.map((pack) => <button key={pack.id} className={`quick-pack ${selectedQuickPack === pack.id ? "selected" : ""}`} aria-pressed={selectedQuickPack === pack.id} onClick={() => applyQuickPack(pack)}><span>{pack.label}</span><small>{pack.description}</small></button>)}</div><button className="category-toggle" aria-expanded={categoriesExpanded} onClick={() => setCategoriesExpanded((expanded) => !expanded)}><span>{categoriesExpanded ? "Ocultar categorías" : "Elegir categorías"}</span><small>{selectedCategories.length === categories.length ? "Las 12 están activas" : `${selectedCategories.length} activas`}</small><ArrowDown aria-hidden="true" /></button>{categoriesExpanded && <div className="category-grid">{categories.map((category, index) => { const isSelected = selectedCategories.includes(category.categoryId); const availableCount = categoryToneCounts.get(category.categoryId) ?? 0; return <button key={category.categoryId} className={`category-card category-palette-${index % 6} ${isSelected ? "selected" : ""}`} aria-pressed={isSelected} onClick={() => toggleCategory(category.categoryId)}><span className="category-card-head"><span className="category-code">{String(index + 1).padStart(2, "0")}</span><span className="category-swatch" aria-hidden="true" /></span><strong className="category-card-name">{category.categoryName}</strong><span className="category-card-meta"><small>{availableCount} · escalas</small><span className="category-card-check" aria-hidden="true">{isSelected ? "✓" : "+"}</span></span></button>; })}</div>}</div>

              <div className="teams-block"><div className="inline-heading"><div><p className="eyebrow">04 · Montad los equipos</p><h2>¿Quién juega?</h2></div><span className="selection-note">2–6 equipos</span></div><div className="team-inputs">{teamNames.map((name, index) => <label key={index} className="team-input"><span className={`team-dot team-dot-${index % 4}`} />Equipo {index + 1}<input value={name} onChange={(event) => setTeamNames((current) => current.map((item, i) => i === index ? event.target.value : item))} /></label>)}</div><div className="team-actions">{teamNames.length < 6 && <button className="add-team" onClick={() => setTeamNames((current) => [...current, `Equipo ${current.length + 1}`])}><Plus aria-hidden="true" /> Añadir equipo</button>}{teamNames.length > 2 && <button className="remove-team" onClick={() => setTeamNames((current) => current.slice(0, -1))}><Minus aria-hidden="true" /> Quitar</button>}</div><div className="rounds-row"><span>Vueltas por equipo</span><div className="stepper"><button aria-label="Menos vueltas" onClick={() => setRoundsPerTeam((value) => Math.max(1, value - 1))}><Minus aria-hidden="true" /></button><strong>{roundsPerTeam}</strong><button aria-label="Más vueltas" onClick={() => setRoundsPerTeam((value) => Math.min(2, value + 1))}><Plus aria-hidden="true" /></button></div><span className="total-rounds">{teamNames.length * roundsPerTeam} rondas en total</span></div></div>
            </div>
            <aside className="start-card" aria-label="Resumen de la partida"><div className="start-card-top"><span className="sparkle"><Sparkles aria-hidden="true" /></span><span>VUESTRA PARTIDA</span></div><h3>Lista para<br /><em>empezar.</em></h3><div className="setup-summary"><div><strong>{filteredCount || 0}</strong><small>escalas</small></div><div><strong>{selectedCategories.length}</strong><small>categorías</small></div><div><strong>{teamNames.length}</strong><small>equipos</small></div><div><strong>{teamNames.length * roundsPerTeam}</strong><small>rondas</small></div></div><p>Una pista concreta. Una discusión inevitable.</p><button className="primary-button" onClick={startGame} disabled={filteredCount === 0 || (isCustomMode(mode) && (!customLeft.trim() || !customRight.trim()))}>Empezar partida <ArrowRight aria-hidden="true" /></button></aside>
          </div>
        </section>
      )}

      {screen !== "setup" && screen !== "finished" && session && currentScale && (
        <section className="page game-page">
          <div className="game-meta"><span className="round-label">RONDA {session.currentRound} / {session.totalRounds}</span><span className="playing-team"><span className={`team-dot team-dot-${currentTeam ? Number(currentTeam.id.split("-")[1]) % 4 : 0}`} /> Turno de <strong>{currentTeam?.name}</strong></span><span className="mode-label">{modeOptions.find((item) => item.id === session.mode)?.label}</span></div>
          <div className="scoreboard" role="status" aria-live="polite" aria-label="Marcador en directo"><span className="scoreboard-title">Marcador</span>{session.teams.map((team) => <span key={team.id} className={`score-pill ${team.id === currentTeam?.id ? "active" : ""}`}><i className={`team-dot team-dot-${Number(team.id.split("-")[1]) % 4}`} />{team.name}<strong>{team.score}</strong></span>)}</div>
          <div className="game-card">
            {screen === "secret" && <div className="secret-screen"><div className="secret-badge"><LockKeyhole aria-hidden="true" /> SOLO QUIEN DA LA PISTA</div><h1>Piensa en algo entre…</h1><ScaleBar scale={currentScale} target={session.targetPosition ?? 50} needle={targetIsShown ? 50 : null} gearRotation={gearRotation} reveal showTarget={targetIsShown} isOpening={targetOpening} isClosing={targetClosing} shuffleInteractive={!hasSeenTarget} showOpener calibration={wheelCalibration} animationCalibration={wheelAnimationCalibration} onTargetRotate={rotateHiddenTarget} /><div className="target-controls">{targetIsShown ? <button className="close-target-button" onClick={() => closeTarget(true)}>Cerrar la zona <X aria-hidden="true" /></button> : <button className="reveal-button" onClick={openTarget} disabled={targetOpening}>{hasSeenTarget ? "Volver a mirar" : "Destapar la ruleta"} <ArrowRight aria-hidden="true" /></button>}{!hasSeenTarget && !targetIsShown && <p>Desliza la rueda dentada hacia un lado u otro para colocar la puntuación.</p>}{targetVisible && <p>Se ocultará automáticamente en unos segundos.</p>}{!targetIsShown && hasSeenTarget && <p>La zona está oculta. Ya no puede moverse.</p>}</div>{targetVisible && !targetOpening && !targetClosing && <div className="target-callout"><span>La zona está aquí</span><strong>{Math.round(session.targetPosition ?? 50)}%</strong></div>}{currentModifier && <div className="modifier-callout"><span className="modifier-icon"><Sparkles aria-hidden="true" /></span><div><small>MODIFICADOR DE ESTA RONDA</small><strong>{currentModifier.title}</strong><p>{currentModifier.instruction}</p></div></div>}<label className={`clue-label ${!hasSeenTarget ? "is-disabled" : ""}`}>Tu pista<input disabled={!hasSeenTarget} value={clue} onChange={(event) => setClue(event.target.value)} placeholder={hasSeenTarget ? "Ej. piloto de avión" : "Destapa la ruleta primero"} onKeyDown={(event) => event.key === "Enter" && submitClue()} /></label><button className="primary-button wide-button" onClick={submitClue} disabled={!hasSeenTarget}>Tengo la pista <ArrowRight aria-hidden="true" /></button></div>}
            {screen === "handoff" && <div className="handoff-screen"><div className="handoff-icon">↗</div><p className="eyebrow">MOMENTO DE CONFIAR</p><h1>Pasa el móvil<br /><em>al equipo {currentTeam?.name}</em></h1><p className="handoff-copy">Quien da la pista ya ha elegido: <strong>“{session.clue}”</strong></p><div className="privacy-note">No miréis atrás. La zona secreta ya no está aquí.</div><button className="primary-button wide-button" onClick={() => setScreen("guess")}>Ya lo tenemos <span>→</span></button></div>}
            {screen === "guess" && <div className="guess-screen"><div className="guess-badge">💬 DEBATIDLO</div><h1>¿Dónde colocaríais<br />la aguja?</h1><div className="clue-quote">“{session.clue}”</div><ScaleBar scale={currentScale} target={session.targetPosition ?? 50} needle={needle} interactiveWheel calibration={wheelCalibrations.closed} onNeedleChange={setNeedle} /><div className="needle-control"><label htmlFor="needle-range">Ajuste fino</label><input id="needle-range" aria-label="Posición de la aguja" type="range" min="0" max="100" value={needle} onChange={(event) => setNeedle(Number(event.target.value))} /><div className="range-labels"><span>{currentScale.leftLabel}</span><span>{Math.round(needle)}%</span><span>{currentScale.rightLabel}</span></div></div><button className="primary-button wide-button" onClick={reveal}>Bloquear aguja <span>→</span></button></div>}
            {screen === "result" && <div className="result-screen"><div className="result-badge">✦ REVELACIÓN</div><h1>{currentScore === 4 ? "¡En el centro!" : currentScore >= 2 ? "Bastante cerca…" : "Esto se va a discutir."}</h1><p className="result-copy">La pista era <strong>“{session.clue}”</strong></p><ScaleBar scale={currentScale} target={session.targetPosition ?? 50} needle={session.needlePosition} reveal showOpener calibration={wheelCalibrations.open} /><div className="score-result"><strong>{currentScore}</strong><span>puntos para {currentTeam?.name}</span></div><div className="result-actions"><button className="secondary-button" onClick={finishGame}>Terminar partida</button><button className="primary-button" onClick={nextRound}>{session.currentRound >= session.totalRounds ? "Ver marcador" : "Siguiente ronda"} <span>→</span></button></div></div>}
          </div>
        </section>
      )}

      {screen === "finished" && session && <section className="page finished-page"><div className="finished-confetti">✦ ✧ ✦</div><p className="eyebrow">PARTIDA TERMINADA</p><h1>Así ha quedado<br /><em>la partida.</em></h1><div className="final-score-card">{[...session.teams].sort((a, b) => b.score - a.score).map((team, index) => <div key={team.id} className={`final-team ${index === 0 ? "winner" : ""}`}><span className="rank">{index === 0 ? "🏆" : `0${index + 1}`}</span><span className={`team-dot team-dot-${index % 4}`} /><strong>{team.name}</strong><b>{team.score}<small> pts</small></b></div>)}</div><p className="finished-copy">La próxima discusión puede ser todavía más absurda.</p><div className="finished-actions"><button className="secondary-button" onClick={() => void shareGame()}>↗ Compartir Punto Medio</button><button className="primary-button" onClick={restart}>Jugar otra partida <span>→</span></button></div></section>}

      {calibrationEnabled && <button className="wheel-calibration-launcher" onClick={() => setCalibrationOpen(true)}><span>⚙</span> Ajustar capas</button>}
      {calibrationEnabled && calibrationOpen && <WheelCalibrationStudio calibrations={wheelCalibrations} onChange={setWheelCalibrations} onClose={() => setCalibrationOpen(false)} />}
    </main>
  );
}
