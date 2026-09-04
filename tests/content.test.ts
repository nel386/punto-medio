import { describe, expect, it } from "vitest";
import aggregatedCatalog from "../content/catalog.json";
import { allScales, categories, getFilteredScales } from "../src/content/catalog";

const endpointLabels = allScales.flatMap((scale) => [scale.leftLabel, scale.rightLabel]);

describe("catálogo offline", () => {
  it("contiene 12 categorías y 120 escalas", () => {
    expect(categories).toHaveLength(12);
    expect(allScales).toHaveLength(120);
    expect(categories.every((category) => category.scales.length > 0)).toBe(true);
  });

  it("mantiene 10 escalas por categoría y IDs únicos", () => {
    expect(categories.every((category) => category.scales.length === 10)).toBe(true);
    expect(new Set(allScales.map((scale) => scale.id)).size).toBe(120);
  });

  it("solo usa tonos válidos y extremos no vacíos", () => {
    const tones = new Set(["familiar", "amigos", "adulto"]);
    expect(allScales.every((scale) => tones.has(scale.tone) && scale.leftLabel && scale.rightLabel)).toBe(true);
  });

  it("mantiene una mezcla editorial por categoría y en el total", () => {
    expect(allScales.filter((scale) => scale.tone === "familiar")).toHaveLength(36);
    expect(allScales.filter((scale) => scale.tone === "amigos")).toHaveLength(48);
    expect(allScales.filter((scale) => scale.tone === "adulto")).toHaveLength(36);
    expect(categories.every((category) =>
      category.scales.filter((scale) => scale.tone === "familiar").length === 3
      && category.scales.filter((scale) => scale.tone === "amigos").length === 4
      && category.scales.filter((scale) => scale.tone === "adulto").length === 3,
    )).toBe(true);
  });

  it("evita endpoints repetidos y conserva pistas concretas", () => {
    expect(new Set(endpointLabels).size).toBe(endpointLabels.length);

    const knownVaguePlaceholders = new Set([
      "Decisión con menos consecuencias",
      "Decisión con más consecuencias",
      "Invento práctico",
      "Invento que cambia cómo vivimos",
      "Viajar solo para desaparecer",
      "Fecha cultural cualquiera",
      "Fecha cultural que merece viajar",
    ]);
    expect(endpointLabels.some((label) => knownVaguePlaceholders.has(label))).toBe(false);

    const contextualCue = /\b(que|con|para|de|en|a|al|del|sin|hasta|por|entre|una|un|como|también|el|la|los|las)\b/i;
    const genericTemplate = /\b(proyecto que|referencia|pequeño|grande|fecha cultural cualquiera)\b/i;
    expect(allScales.every((scale) => contextualCue.test(`${scale.leftLabel} ${scale.rightLabel}`))).toBe(true);
    expect(allScales.every((scale) => !genericTemplate.test(`${scale.leftLabel} ${scale.rightLabel}`))).toBe(true);
  });

  it("conserva la categoría al aplanar los JSON y permite filtrar", () => {
    expect(allScales.every((scale) => categories.some((category) => category.categoryId === scale.categoryId))).toBe(true);
    expect(getFilteredScales(["familiar"], categories.map((category) => category.categoryId))).toHaveLength(36);
    expect(getFilteredScales(["amigos"], categories.map((category) => category.categoryId))).toHaveLength(48);
    expect(getFilteredScales(["adulto"], categories.map((category) => category.categoryId))).toHaveLength(36);
    expect(getFilteredScales(["familiar", "amigos"], categories.map((category) => category.categoryId))).toHaveLength(84);
    expect(getFilteredScales(["amigos", "adulto"], categories.map((category) => category.categoryId))).toHaveLength(84);
    expect(getFilteredScales(["familiar", "adulto"], categories.map((category) => category.categoryId))).toHaveLength(72);
    expect(getFilteredScales(["familiar", "amigos", "adulto"], categories.map((category) => category.categoryId))).toHaveLength(120);
  });

  it("mantiene sincronizado el catálogo agregado con las fuentes de categorías", () => {
    const aggregatedScales = aggregatedCatalog.categories.flatMap((category) => category.scales);
    expect(aggregatedCatalog.categories).toHaveLength(12);
    expect(aggregatedScales).toHaveLength(120);
    expect(aggregatedScales.map((scale) => scale.id)).toEqual(allScales.map((scale) => scale.id));
    expect(aggregatedScales.map((scale) => `${scale.leftLabel}|${scale.rightLabel}|${scale.tone}`))
      .toEqual(allScales.map((scale) => `${scale.leftLabel}|${scale.rightLabel}|${scale.tone}`));
  });
});
