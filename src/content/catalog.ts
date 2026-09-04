import type { Scale, Tone } from "../domain/types";
import amistad from "../../content/categories/amistad.json";
import comidaBebida from "../../content/categories/comida-bebida.json";
import cultura from "../../content/categories/cultura.json";
import deporte from "../../content/categories/deporte.json";
import fiesta from "../../content/categories/fiesta.json";
import ocio from "../../content/categories/ocio.json";
import personalidad from "../../content/categories/personalidad.json";
import relaciones from "../../content/categories/relaciones.json";
import tecnologia from "../../content/categories/tecnologia.json";
import televisionCine from "../../content/categories/television-cine.json";
import trabajoEstudios from "../../content/categories/trabajo-estudios.json";
import viajes from "../../content/categories/viajes.json";

export type Category = {
  categoryId: string;
  categoryName: string;
  scales: Scale[];
};

export const categories: Category[] = [
  deporte, ocio, fiesta, comidaBebida, viajes, televisionCine, cultura, amistad, relaciones,
  personalidad, tecnologia, trabajoEstudios,
] as unknown as Category[];
// Las escalas se mantienen compactas en cada JSON y heredan la categoría al cargar el catálogo.
// Sin este paso, `scale.categoryId` queda vacío y el filtro de categorías elimina todo.
export const allScales = categories.flatMap((category) =>
  category.scales.map((scale) => ({ ...scale, categoryId: category.categoryId })),
);

export function getCategoryName(categoryId: string) {
  return categories.find((category) => category.categoryId === categoryId)?.categoryName ?? "Categoría";
}

export function getFilteredScales(tones: Tone[], selectedCategoryIds: string[]) {
  const allowed = new Set(selectedCategoryIds);
  const selectedTones = new Set(tones);
  return allScales.filter((scale) => scale.enabled && selectedTones.has(scale.tone) && allowed.has(scale.categoryId));
}
