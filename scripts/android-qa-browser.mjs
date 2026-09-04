import { chromium } from "playwright";

const baseUrl = process.env.PUNTO_MEDIO_URL ?? "http://127.0.0.1:4174/";
const checks = [];

function record(name, pass, details) {
  checks.push({ name, pass, details });
}

const executablePath = process.env.PUNTO_MEDIO_CHROME ?? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: "networkidle" });

  const bootstrap = await page.evaluate(async () => {
    const manifest = await fetch("./manifest.webmanifest").then((response) => response.json());
    const registrations = await navigator.serviceWorker.getRegistrations();
    const cacheNames = await caches.keys();
    const cache = cacheNames.length ? await caches.open(cacheNames[0]) : null;
    const cachedIndex = cache ? await cache.match("./index.html") : null;
    return {
      title: document.title,
      controller: Boolean(navigator.serviceWorker.controller),
      registrations: registrations.length,
      manifestIcons: Array.isArray(manifest.icons) ? manifest.icons.length : 0,
      cachedIndex: Boolean(cachedIndex),
    };
  });
  record("PWA manifest", bootstrap.manifestIcons > 0, `icons=${bootstrap.manifestIcons}`);
  record("Service worker registration", bootstrap.registrations > 0, `registrations=${bootstrap.registrations}`);
  record("Service worker controls after reload", bootstrap.controller, `controller=${bootstrap.controller}`);
  record("Service worker precache", bootstrap.cachedIndex, `cachedIndex=${bootstrap.cachedIndex}`);
  record("Production title", bootstrap.title === "Punto Medio", `title=${bootstrap.title}`);

  for (const [width, height] of [[320, 800], [390, 844], [800, 390]]) {
    await page.setViewportSize({ width, height });
    await page.reload({ waitUntil: "networkidle" });
    const layout = await page.evaluate(() => {
      const startCard = document.querySelector(".start-card");
      const rect = startCard?.getBoundingClientRect();
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        startCardPosition: startCard ? getComputedStyle(startCard).position : null,
        startCardBottom: rect ? Math.round(window.innerHeight - rect.bottom) : null,
        overflowers: [...document.querySelectorAll("body *")]
          .map((element) => ({
            tag: element.tagName,
            className: typeof element.className === "string" ? element.className : "",
            right: Math.round(element.getBoundingClientRect().right),
            width: Math.round(element.getBoundingClientRect().width),
          }))
          .filter((item) => item.right > window.innerWidth + 1)
          .sort((a, b) => b.right - a.right)
          .slice(0, 5),
      };
    });
    record(`Viewport ${width}x${height} no horizontal overflow`, !layout.horizontalOverflow, JSON.stringify(layout));
    if (width < 850) {
      record(`Viewport ${width}x${height} fixed start card`, layout.startCardPosition === "fixed", JSON.stringify(layout));
      record(`Viewport ${width}x${height} start card reaches bottom`, layout.startCardBottom === 0, JSON.stringify(layout));
    }
  }

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: width === 320 ? 800 : 844 });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Empezar partida" }).click();
    await page.getByRole("button", { name: "Destapar la ruleta" }).click();
    await page.getByLabel("Tu pista").fill("atardecer");
    await page.getByRole("button", { name: "Tengo la pista" }).click();
    await page.getByRole("button", { name: /Ya lo tenemos/ }).click();
    await page.getByRole("button", { name: /Bloquear aguja/ }).click();
    record(`Browser smoke flow ${width}px`, await page.getByText(/La pista era/).isVisible(), "setup → secret → handoff → guess → result");
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Empezar partida" }).click();
  await page.getByRole("button", { name: "Destapar la ruleta" }).click();
  await page.getByLabel("Tu pista").fill("atardecer");
  await page.getByRole("button", { name: "Tengo la pista" }).click();
  await page.getByRole("button", { name: /Ya lo tenemos/ }).click();
  await page.getByRole("button", { name: /Bloquear aguja/ }).click();

  const beforeReload = await page.locator("body").innerText();
  await page.reload({ waitUntil: "networkidle" });
  const afterReload = await page.locator("body").innerText();
  record("Session resumes after reload", afterReload.includes("La pista era") && afterReload.includes("atardecer"), "result and clue restored from localStorage");

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  const offlineBody = await page.locator("body").innerText();
  record("Offline reload", offlineBody.includes("Punto Medio") && offlineBody.includes("La pista era"), "cached shell and game bundle rendered with network disabled");
  await context.setOffline(false);

  console.log(JSON.stringify({ ok: true, checks, beforeReloadLength: beforeReload.length }, null, 2));
} finally {
  await browser.close();
}

const failures = checks.filter((check) => !check.pass);
if (failures.length) {
  process.exitCode = 1;
}
