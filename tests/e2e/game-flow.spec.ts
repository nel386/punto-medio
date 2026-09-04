import { expect, test } from "@playwright/test";

test.describe("Punto Medio · partida sin registro", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/");
    await page.addStyleTag({
      content: `*, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }`,
    });
  });

  test("configura una partida y completa una ronda hasta el marcador", async ({ page }, testInfo) => {
    await expect(page.getByRole("heading", { name: /Nueva partida/i })).toBeVisible();

    await page.getByRole("button", { name: /Modificadores/i }).click({ force: true });
    const adultTone = page.getByRole("button", { name: "Adulto", exact: true });
    await adultTone.scrollIntoViewIfNeeded();
    await adultTone.click({ force: true });
    await expect(page.locator(".tone-block .selection-note")).toContainText("84 escalas");
    const debatePack = page.getByRole("button", { name: /Debate de bar/i });
    await debatePack.scrollIntoViewIfNeeded();
    await debatePack.click({ force: true });
    const addTeam = page.getByRole("button", { name: /Añadir equipo/i });
    await addTeam.scrollIntoViewIfNeeded();
    await addTeam.click({ force: true });

    const teamInputs = page.locator(".team-input input");
    await expect(teamInputs).toHaveCount(3);
    await teamInputs.nth(0).fill("Azul");
    await teamInputs.nth(1).fill("Rojo");
    await teamInputs.nth(2).fill("Verde");
    await expect(page.getByText("3 rondas en total", { exact: true })).toBeVisible();

    await page.screenshot({ path: testInfo.outputPath("setup.png") });
    await page.getByRole("button", { name: /Empezar partida/i }).click({ force: true });

    await expect(page.getByRole("heading", { name: /Piensa en algo entre/i })).toBeVisible();
    const roundHeading = await page.getByRole("heading", { name: /Piensa en algo entre/i }).boundingBox();
    const topbar = await page.locator(".topbar").boundingBox();
    expect(roundHeading).not.toBeNull();
    expect((roundHeading?.y ?? 0)).toBeGreaterThanOrEqual((topbar?.height ?? 0) - 1);
    await expect(page.getByText("MODIFICADOR DE ESTA RONDA")).toBeVisible();
    await expect(page.locator(".wheel-needle")).toBeVisible();
    const hiddenWheel = page.getByRole("slider", { name: /Rueda dentada/i });
    const beforeMove = Number(await hiddenWheel.getAttribute("aria-valuenow"));
    await hiddenWheel.press("ArrowLeft");
    const targetValue = Number(await hiddenWheel.getAttribute("aria-valuenow"));
    expect(targetValue).toBe(Math.max(6, beforeMove - 2));

    await page.getByRole("button", { name: /Destapar la ruleta/i }).click();
    await expect(page.getByText("La zona está aquí", { exact: true })).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText(`${targetValue}%`, { exact: true })).toBeVisible();
    await expect(page.locator(".wheel-needle")).toBeVisible();

    const clueInput = page.locator('input[placeholder="Ej. piloto de avión"]');
    await clueInput.fill("un plan improvisado");
    await page.getByRole("button", { name: /Tengo la pista/i }).click();
    await expect(page.getByRole("heading", { name: /Pasa el móvil/i })).toBeVisible();
    await expect(page.getByText(/un plan improvisado/i)).toBeVisible();

    await page.getByRole("button", { name: /Ya lo tenemos/i }).click();
    await expect(page.getByRole("heading", { name: /Dónde colocaríais/i })).toBeVisible();
    const needle = page.getByLabel("Posición de la aguja");
    await needle.fill(String(targetValue));
    await expect(needle).toHaveValue(String(targetValue));
    await page.screenshot({ path: testInfo.outputPath("guess.png") });

    await page.getByRole("button", { name: /Bloquear aguja/i }).click();
    await expect(page.getByRole("heading", { name: "¡En el centro!" })).toBeVisible();
    await expect(page.locator(".score-result strong")).toHaveText("4");
    await expect(page.getByText(/puntos para Azul/i)).toBeVisible();

    await page.getByRole("button", { name: /Terminar partida/i }).click();
    await expect(page.getByRole("heading", { name: /Así ha quedado/i })).toBeVisible();
    await expect(page.locator(".final-score-card")).toContainText("Azul");
    await expect(page.locator(".final-score-card")).toContainText("4 pts");
    await expect(page.locator(".final-score-card")).toContainText("Rojo");
    await expect(page.locator(".final-score-card")).toContainText("Verde");
  });

  test("mantiene los controles utilizables sin desbordamiento horizontal", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Empezar partida/i })).toBeVisible();
    const familiarTone = page.getByRole("button", { name: "Familiar", exact: true });
    await familiarTone.click();
    await expect(page.locator(".tone-block .selection-note")).toContainText("84 escalas");
    await page.getByRole("button", { name: "Amigos", exact: true }).click();
    await expect(page.locator(".tone-block .selection-note")).toContainText("36 escalas");
    await page.getByRole("button", { name: "Familiar", exact: true }).click();
    await expect(page.locator(".tone-block .selection-note")).toContainText("36 escalas");
    const layout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport + 1);
    await page.getByRole("button", { name: /Empezar partida/i }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: /Empezar partida/i })).toBeEnabled();
  });

  test("mantiene equipos y acción principal alcanzables a 320 px", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 740 });
    const layout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport + 1);

    await page.getByRole("button", { name: /Elegir categorías/i }).click();
    await expect(page.locator(".category-card")).toHaveCount(12);
    await page.screenshot({ path: testInfo.outputPath("categories-expanded.png") });
    await page.getByRole("button", { name: /Ocultar categorías/i }).click();

    const teamInputs = page.locator(".team-input input");
    await expect(teamInputs).toHaveCount(2);
    const secondTeam = await teamInputs.nth(1).boundingBox();
    expect(secondTeam).not.toBeNull();
    expect((secondTeam?.x ?? 0) + (secondTeam?.width ?? 0)).toBeLessThanOrEqual(320);

    await teamInputs.first().focus();
    await expect(teamInputs.first()).toBeFocused();
    const startButton = page.getByRole("button", { name: /Empezar partida/i });
    const startBox = await startButton.boundingBox();
    expect(startBox).not.toBeNull();
    expect((startBox?.x ?? 0) + (startBox?.width ?? 0)).toBeLessThanOrEqual(320);
    expect((startBox?.y ?? 0) + (startBox?.height ?? 0)).toBeLessThanOrEqual(740);
  });
});
