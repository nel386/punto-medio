# QA E2E de Punto Medio

La suite de Playwright cubre el flujo de una partida local sin registro:

- selección de modo, tono y pack de categorías;
- creación y nombrado de un tercer equipo;
- inicio de partida con modificador;
- movimiento de la zona secreta y revelación;
- introducción de pista y entrega del móvil;
- movimiento de la aguja, puntuación determinista de 4 puntos y final de partida.

Se ejecuta en dos viewports: Chrome de escritorio (1280×900) y móvil (390×844). También comprueba que la pantalla inicial no desborda horizontalmente y conserva disponible el botón de inicio.

Comandos:

```text
npm run build
npx playwright test
```

Las capturas de diagnóstico y el informe HTML se generan en `test-results/` y `playwright-report/` cuando se ejecuta la suite. La prueba no verifica la calidad estética de los PNG de la ruleta ni el comportamiento nativo de Android; esos puntos requieren una revisión visual/nativa separada.
