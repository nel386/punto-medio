// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import { loadSnapshot } from "../src/platform/storage";

const values = new Map<string, string>();
const browserStorage = {
  clear: () => values.clear(),
  getItem: (key: string) => values.get(key) ?? null,
  removeItem: (key: string) => values.delete(key),
  setItem: (key: string, value: string) => values.set(key, value),
};
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: browserStorage,
});

describe("migración de partidas guardadas", () => {
  beforeEach(() => browserStorage.clear());

  it("convierte el tono antiguo en una selección de tonos", () => {
    browserStorage.setItem("punto-medio-snapshot", JSON.stringify({
      screen: "secret",
      session: { id: "legacy", tone: "adulto", teams: [] },
    }));

    expect(loadSnapshot()?.session.tones).toEqual(["adulto"]);
  });

  it("conserva una selección múltiple ya guardada", () => {
    browserStorage.setItem("punto-medio-snapshot", JSON.stringify({
      screen: "secret",
      session: { id: "current", tones: ["familiar", "amigos"], teams: [] },
    }));

    expect(loadSnapshot()?.session.tones).toEqual(["familiar", "amigos"]);
  });
});
