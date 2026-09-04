# Revisión de diseño móvil — Punto Medio

Fecha: 2026-09-04  
Superficie: setup de partida local y transición a una ronda  
Viewport revisado: escritorio y mobile 390 × 844; comprobación automatizada adicional a 320 × 740.

## Veredicto

La experiencia queda preparada para un uso pass-and-play en un solo móvil. La entrada comunica «LOCAL · SIN CUENTAS», la ruta principal es «Nueva partida» → configuración → «Empezar partida» y las 20 categorías siguen accesibles sin convertir el primer arranque en un formulario interminable.

## Evidencia capturada

Estas capturas proceden de la ejecución E2E final del 2026-09-04 y se inspeccionaron antes de aceptar los hallazgos.

### Paso 1 — Setup configurado en desktop

![Setup configurado en desktop](../test-results/game-flow-Punto-Medio-·-pa-534a3-una-ronda-hasta-el-marcador-desktop/setup.png)

Salud: buena. La columna de configuración mantiene una jerarquía clara y la ficha lateral resume escalas, categorías, equipos y rondas. No aparece lenguaje de conexión online ni una invitación inexistente.

### Paso 2 — Setup configurado en mobile

![Setup configurado en mobile](../test-results/game-flow-Punto-Medio-·-pa-534a3-una-ronda-hasta-el-marcador-mobile/setup.png)

Salud: buena. La ficha fija deja visible la acción primaria, los equipos se ordenan en dos columnas y el último control queda por encima de la ficha al hacer scroll. Los packs se desplazan horizontalmente dentro de su propio carril, sin ampliar el documento.

### Paso 3 — Ronda y ajuste de aguja en mobile

![Ajuste de aguja en mobile](../test-results/game-flow-Punto-Medio-·-pa-534a3-una-ronda-hasta-el-marcador-mobile/guess.png)

Salud: buena. La pista, la ruleta, el ajuste fino y «Bloquear aguja» siguen en una columna táctil; la composición de la ruleta se conserva sin cambios.

## Hallazgos y decisiones aplicadas

1. **Entrada de app.** Se conserva el encabezado «Nueva partida» y la señal persistente «LOCAL · SIN CUENTAS». No se reintroducen cuentas, conexión, invitaciones ni multijugador entre dispositivos.
2. **Ruta principal.** La ficha de inicio es fija solo en viewport estrecho y mantiene «Empezar partida» como única acción dominante. En desktop permanece como resumen lateral.
3. **Safe areas.** Barra superior, ficha inferior y reserva de scroll usan `env(safe-area-inset-*)`; el contenido deja espacio extra para que el CTA fijo no tape el último control.
4. **Ancho estrecho.** Se eliminaron los mínimos de contenido que forzaban una columna de 444 px dentro de un viewport de 320 px. Los packs tienen un carril horizontal interno y los equipos pasan a una cuadrícula de dos columnas.
5. **Teclado virtual.** Se observa `visualViewport`; cuando el WebView se reduce, la ficha conserva únicamente la acción «Empezar partida». Así el teclado no debería ocultar simultáneamente el campo enfocado y el CTA.
6. **Transiciones.** Al cambiar de pantalla se vuelve al inicio del scroll. Una ronda nueva ya no hereda la posición del setup y el título no queda cortado bajo la barra superior.
7. **Targets y estados.** CTA y controles principales tienen al menos 48 px; sumar/quitar equipo y el stepper tienen 44 px. Se conservan `aria-pressed`, labels de inputs, slider accesible y estados `:focus-visible`/`:active`.
8. **Estilo.** No se añadieron dashboards, blobs, glassmorphism ni gradientes decorativos. La selección de categorías sigue siendo mediante tarjetas y las 20 categorías siguen presentes.

## Comprobaciones reales

- `npm test` — PASS, 3 archivos / 16 tests.
- `npm run test:e2e` — PASS, 6 tests: 3 desktop y 3 mobile; incluye 320 px, ausencia de overflow horizontal, equipos alcanzables y arranque de ronda desde scroll.
- `npm run build` — PASS, TypeScript + Vite.

## Límites y riesgos pendientes

- La revisión visual usa un navegador de escritorio con viewport mobile. No sustituye una comprobación en WebView Android/iOS real con notch, gesto de navegación y valores no nulos de safe area.
- El entorno no expone un teclado virtual físico para validar el comportamiento exacto de resize/pan de cada plataforma; se cubre la ruta con `visualViewport`, foco y CTA visible en E2E.
- No se ejecutó Gradle, emulador, rotación nativa ni suspensión del proceso porque el alcance pedido excluye Gradle/Capacitor y la validación nativa requiere un dispositivo o emulador configurado.
- Los cambios de esta revisión no modifican el motor de puntuación, el contenido, los anuncios ni los assets/capas de la ruleta.
