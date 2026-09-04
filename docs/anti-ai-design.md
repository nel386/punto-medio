# Revisión anti-IA de Punto Medio

Fecha: 2026-09-04  
Ámbito: preparación de partida y pantallas auxiliares. La ruleta, sus assets y su composición quedan fuera de esta pasada.

## Evidencia revisada

- Setup en escritorio con la app local, incluyendo la selección de modo, ambiente, packs, las 12 categorías, equipos y rondas.
- Setup en viewport estrecho de 390 × 844 px.
- Flujo auxiliar existente: pantalla secreta y sus controles de revelar/cerrar, además del marcador compacto.

## Señales detectadas y correcciones

1. **Hero con demasiado peso.** El titular y el espacio vertical retrasaban la decisión principal. Se redujo la escala y el hueco inferior, manteniendo el gesto editorial.
2. **Demasiados contenedores con el mismo lenguaje.** Se quitaron radios grandes y se introdujeron esquinas y sombras distintas: ficha de partida, bandeja de cartas, campos de equipo y controles tienen funciones visuales diferentes.
3. **Resumen con apariencia de widget genérico.** El resumen ahora se presenta como una ficha de juego: “Vuestra partida”, una frase anfitriona y una única acción dominante.
4. **Iconos emoji sin sistema.** Los iconos de modo, ambiente, estados de ronda y acciones auxiliares pasan a una familia consistente de trazos. Se conservan los símbolos que tienen función textual o de juego.
5. **Packs rápidos con aire de tarjetas duplicadas.** Se convierten en accesos compactos con una marca lateral de color, más cercanos a separadores de una caja que a tres cards de dashboard.
6. **Categorías legibles, pero demasiado administrativas.** Se conserva la numeración y el color de familia, y se refuerza la sensación de carta: bandeja, borde inferior, sombra física, esquinas con pequeñas variaciones y selección inequívoca.
7. **Estados táctiles poco físicos.** Botones, cartas, stepper y campos ganan estados pressed/focus más claros y sombras que desaparecen al pulsar.
8. **CTA móvil y herramienta de calibración compitiendo.** La ficha fija móvil se mantiene como acción principal, mientras el control de calibración de desarrollo se aparta de esa zona para no taparla.
9. **Movimiento no totalmente consciente de accesibilidad.** El scroll del CTA del hero respeta `prefers-reduced-motion`; la regla CSS existente se mantiene para el resto de animaciones.

## Reglas aplicadas

- Marfil, tinta/navy, coral y acentos de categoría; sin gradientes, neón, glassmorphism ni blobs decorativos.
- Jerarquía explícita: cómo jugar → ambiente → categorías → equipos → empezar.
- Una sola acción primaria visible en la ficha de preparación.
- Las 12 categorías siguen presentes en tarjetas compactas y no se esconden detrás de un flujo interminable.
- Los iconos nuevos son semánticos y coherentes; no se añaden emojis para rellenar huecos.

## Decisiones humanas que siguen abiertas

- La selección inicial de 12 categorías prioriza variedad con curación editorial, no cantidad automática.
- Los nombres de packs y el tono anfitrión se mantienen en español coloquial; conviene validarlos con grupos reales antes de congelar copy.
- Las ligeras variaciones de esquina en las cartas son una señal material sutil. Si el equipo imprime una caja física, deberían alinearse con su troquel y acabados reales.
- La ficha móvil permanece fija para proteger el inicio de partida; debe validarse en sesiones con una mano y con teclado virtual abierto.

## Archivos de esta pasada

- `src/App.tsx`: iconografía semántica, copy de la ficha, CTA con scroll accesible y estados auxiliares.
- `src/styles.css`: jerarquía, materialidad, estados táctiles y responsive.
