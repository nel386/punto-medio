import type { GameMode, Modifier, Scale, ScoreBand } from "./types";

export const ZONE_WIDTH = 16;

export const modifiers: Modifier[] = [
  { id: "one-word", title: "Una palabra", instruction: "La pista solo puede tener una palabra.", compatibleModes: ["modifiers"] },
  { id: "advert", title: "Como un anuncio", instruction: "Da la pista como si vendieras algo irresistible.", compatibleModes: ["modifiers"] },
  { id: "literal-first", title: "Empieza literal", instruction: "Las primeras palabras deben describir literalmente tu ejemplo.", compatibleModes: ["modifiers"] },
  { id: "no-clarify", title: "Sin aclaraciones", instruction: "Después de la pista, no puedes responder preguntas.", compatibleModes: ["modifiers"] },
  { id: "opposite", title: "Pista inversa", instruction: "Piensa en el extremo contrario y dale la vuelta a tu ejemplo.", compatibleModes: ["modifiers"] },
  { id: "sound-effect", title: "Con efectos", instruction: "Incluye un sonido o gesto que ayude a imaginar la pista.", compatibleModes: ["modifiers"] },
  { id: "personal-story", title: "Anécdota personal", instruction: "La pista tiene que salir de una historia que hayas vivido.", compatibleModes: ["modifiers"] },
  { id: "movie-trailer", title: "Tráiler", instruction: "Presenta la pista con dramatismo de tráiler de cine.", compatibleModes: ["modifiers"] },
  { id: "two-examples", title: "Dos ejemplos", instruction: "Da dos ejemplos que apunten a la misma zona.", compatibleModes: ["modifiers"] },
  { id: "forbidden-word", title: "Palabra prohibida", instruction: "No puedes usar la palabra más obvia del tema.", compatibleModes: ["modifiers"] },
  { id: "speed-round", title: "Ronda relámpago", instruction: "El equipo tiene solo diez segundos para decidir.", compatibleModes: ["modifiers"] },
  { id: "double-or-nothing", title: "Todo o nada", instruction: "El equipo decide antes de colocar si arriesga los puntos.", compatibleModes: ["modifiers"] },
  { id: "soundtrack", title: "Banda sonora", instruction: "Elige una canción que represente la pista y di por qué.", compatibleModes: ["modifiers"] },
  { id: "roleplay", title: "En personaje", instruction: "Da la pista interpretando a otra persona o profesión.", compatibleModes: ["modifiers"] },
  { id: "silent-pause", title: "Pausa dramática", instruction: "Haz una pausa teatral antes de decir la pista.", compatibleModes: ["modifiers"] },
  { id: "team-captain", title: "Capitán", instruction: "Solo una persona del equipo puede mover la aguja.", compatibleModes: ["modifiers"] },
];

export function zoneBounds(position: number, width = ZONE_WIDTH) {
  const half = width / 2;
  return { start: Math.max(0, position - half), end: Math.min(100, position + half) };
}

export function scoreNeedle(target: number, needle: number): ScoreBand {
  const distance = Math.abs(target - needle);
  if (distance <= 5) return 4;
  if (distance <= 12) return 3;
  if (distance <= 20) return 2;
  if (distance <= 32) return 1;
  return 0;
}

export function randomPosition(random = Math.random) {
  return Math.round(10 + random() * 80);
}

export function chooseScale(scales: Scale[], usedIds: string[], random = Math.random) {
  const unused = scales.filter((scale) => !usedIds.includes(scale.id));
  const pool = unused.length > 0 ? unused : scales;
  return pool[Math.floor(random() * pool.length)] ?? null;
}

export function chooseModifier(usedIds: string[], random = Math.random) {
  const unused = modifiers.filter((modifier) => !usedIds.includes(modifier.id));
  const pool = unused.length > 0 ? unused : modifiers;
  return pool[Math.floor(random() * pool.length)] ?? null;
}

export function isCustomMode(mode: GameMode) {
  return mode === "custom-scale";
}
