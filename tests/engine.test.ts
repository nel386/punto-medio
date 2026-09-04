import { describe, expect, it } from "vitest";
import { chooseScale, randomPosition, scoreNeedle, zoneBounds } from "../src/domain/engine";

describe("puntuación de Punto Medio", () => {
  it("aplica las cinco bandas de puntuación de forma simétrica", () => {
    expect(scoreNeedle(50, 50)).toBe(4);
    expect(scoreNeedle(50, 55)).toBe(4);
    expect(scoreNeedle(50, 62)).toBe(3);
    expect(scoreNeedle(50, 70)).toBe(2);
    expect(scoreNeedle(50, 82)).toBe(1);
    expect(scoreNeedle(50, 84)).toBe(0);
    expect(scoreNeedle(50, 38)).toBe(3);
  });

  it("mantiene la zona dentro de la escala", () => {
    expect(zoneBounds(10)).toEqual({ start: 2, end: 18 });
    expect(zoneBounds(95)).toEqual({ start: 87, end: 100 });
  });

  it("genera posiciones jugables entre 10 y 90", () => {
    expect(randomPosition(() => 0)).toBe(10);
    expect(randomPosition(() => 1)).toBe(90);
  });

  it("evita escalas usadas mientras queden alternativas", () => {
    const scales = [
      { id: "a", categoryId: "x", leftLabel: "A", rightLabel: "B", tone: "amigos" as const, enabled: true },
      { id: "b", categoryId: "x", leftLabel: "C", rightLabel: "D", tone: "amigos" as const, enabled: true },
    ];
    expect(chooseScale(scales, ["a"], () => 0)?.id).toBe("b");
  });
});
