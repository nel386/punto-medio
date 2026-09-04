import type { GameSession, Tone } from "../domain/types";

const KEY = "punto-medio-snapshot";

export type Snapshot = { screen: string; session: GameSession };

export function saveSnapshot(snapshot: Snapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // Private browsing or storage limits must never stop a local game.
  }
}

export function loadSnapshot(): Snapshot | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as Snapshot & { session?: GameSession & { tone?: Tone; tones?: Tone[] } };
    if (!snapshot.session) return null;
    const legacyTone = snapshot.session.tone;
    const tones = Array.isArray(snapshot.session.tones) && snapshot.session.tones.length > 0
      ? snapshot.session.tones
      : legacyTone ? [legacyTone] : ["amigos"];
    return { ...snapshot, session: { ...snapshot.session, tones } } as Snapshot;
  } catch {
    return null;
  }
}

export function clearSnapshot() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore unavailable storage.
  }
}
