# Design QA — ruleta Punto Medio

**Source visual truth**

- `C:\Users\neL\AppData\Local\Temp\codex-clipboard-96e307dd-0621-49c5-8938-6683e785848c.png` (composición cerrada de referencia, 427 × 447 px).
- `C:\Users\neL\Documents\wavelenght\public\assets\wheel\parts\needle.png` y `opener.png` (piezas fuente exigidas por el usuario).
- Calibración fuente completa recibida el 2026-09-04 y aplicada literalmente en dos perfiles: ambos comparten rueda `(-0.4, -1, 0.96)`, fondo `(0, 6.85185185185185, 1)`, puntuación `(-0.7407407407407409, 39.8, 0.96)`, carcasa `(0, 0, 1)` y aguja `(0, 0, 1)`; `closed` usa pantalla `(-1.7, 4.7, 1.04)` y abridor `(-67.1, -0.4, 1, 180°)`; `open` usa pantalla `(-1.7, -4, 1.04)` y abridor `(-67.1, 0.8, 1, 180°)`.
- Requisito funcional posterior: el configurador debe mantener calibraciones independientes para los estados `closed` y `open`.
- Requisito funcional posterior: el eje Y y los campos numéricos deben admitir edición natural y arrastre continuo sin rechazar valores o perder deltas.

**Rendered implementation**

- `C:\Users\neL\Documents\wavelenght\qa-implementation-closed-latest.png` (1265 × 712 px).
- `C:\Users\neL\Documents\wavelenght\qa-implementation-open-latest.png` (1265 × 712 px).
- `C:\Users\neL\Documents\wavelenght\qa-implementation-game-closed-latest.png` y `qa-implementation-game-open-latest.png` (673 × 837 px; vista de juego).
- Comparaciones normalizadas: `qa-comparison-closed-latest.png` y `qa-comparison-open-latest.png` (1280 × 590 px; fuente e implementación reunidas en la misma imagen).
- URL: `http://127.0.0.1:5173/?calibrar=1`.
- Viewport: 1265 × 712 CSS px; captura a densidad 1:1.
- Estados: ruleta cerrada y ruleta abierta, con aguja visible.
- Estados de transición: apertura y cierre comprobados en la vista de juego; tapa y abridor interpolan su desplazamiento vertical junto con la rotación.
- El panel identifica explícitamente el perfil activo y ofrece restauración de capa, del estado actual o de ambos estados.

**Full-view comparison evidence**

- Cerrada: la tapa celeste cubre el hueco superior con `screen.y = 4.7`; carcasa, aro, dientes y sello quedan centrados; el abridor encaja en la ranura izquierda con `opener.y = -0.4` y no hay fondo negro.
- Abierta: la tapa celeste sale del hueco con `screen.y = -4`, se muestra el fondo marfil completo y el abanico 2·3·4·3·2 queda centrado bajo el aro; el abridor termina en la ranura derecha con `opener.y = 0.8`.
- La rueda dentada queda detrás de la carcasa, por lo que sólo sobresalen sus dientes.
- El cambio entre las pestañas `Cerrada` y `Abierta` actualiza los campos con el perfil correspondiente sin modificar el otro.

**Focused region comparison evidence**

- Se compararon de cerca las ranuras laterales, el borde curvo entre tapa y carcasa, el extremo del abridor, el aro exterior y la zona superior de puntuación. No se observaron halos negros, huecos transparentes entre capas ni deformación de los PNG.

**Required fidelity surfaces**

- Fonts/typography: sin cambios; la tipografía de la interfaz mantiene jerarquía, peso y legibilidad.
- Spacing/layout rhythm: la composición circular mantiene proporción 1:1; las capas comparten centro y las ranuras coinciden con el abridor.
- Colors/tokens: se conservan azul noche, celeste, marfil, coral y naranja; el negro opaco del PNG de carcasa fue eliminado mediante transparencia real.
- Image quality/assets: se usan únicamente los siete PNG fuente, sin recreaciones CSS/SVG; escala y `object-fit` conservan sus proporciones.
- Copy/content: textos y etiquetas de puntuación permanecen coherentes y legibles.

**Findings**

- No quedan hallazgos P0, P1 o P2 accionables.
- [P3] La referencia cerrada anterior no incluía aguja, pero el requisito posterior la exige expresamente; se considera una diferencia intencional y resuelta con la pieza fuente aportada.

**Comparison history**

1. Primer pase: [P1] el abridor tenía la posición interna correcta, pero el giro de su contenedor estaba aplicado al estado opuesto; cerrado aparecía a la derecha y abierto a la izquierda.
2. Corrección: se invirtieron el estado base y los fotogramas `opener-open` / `opener-close`, manteniendo intactos los valores exactos del abridor.
3. Segundo pase: cerrado encaja a la izquierda y abierto recorre el arco hasta la derecha; ambas comparaciones visuales muestran fondo transparente y capas alineadas.
4. Tercer pase: se sustituyó la calibración anterior por el bloque completo del usuario, se regeneraron las capturas cerrada/abierta y se verificó la nueva proporción de rueda, fondo, puntuación, tapa y abridor. Sin hallazgos P0/P1/P2.
5. Cuarto pase: se separó el modelo de datos en perfiles `closed` y `open`. Se cambió temporalmente `screen.x` del perfil abierto de `-1.7` a `8.3`; el perfil cerrado conservó `-1.7`, y al regresar a abierto se recuperó `8.3`. Después se restauraron ambos perfiles a la calibración fuente.
6. Quinto pase: [P1] el campo Y rechazaba una entrada entera como `10` porque el control la reformateaba inmediatamente como `10,0`; el arrastre también calculaba sobre un valor de render potencialmente atrasado. Se introdujo un borrador editable por campo y actualizaciones funcionales acumulativas. Tras la corrección, Y aceptó `10`, aceptó `-7.25`, normalizó a `-7.3` al perder el foco y un arrastre vertical de 50 px cambió Y de `-4` a `5.3` sin alterar X. La calibración se restauró después.
7. Sexto pase: [P1] la configuración única podía reaparecer al alternar estado y dejaba la pantalla/abridor cerrados con los valores abiertos. Se creó un valor por defecto versionado para `closed` y `open`, se aplicó el bloque exacto recibido (incluidos `screen.y = 4.7` y `opener.y = -0.4` en cerrado) y se restauraron ambos perfiles. Evidencia posterior: el editor muestra `Y = 4,7` para pantalla cerrada, `Y = -0,4` para abridor cerrado, `Y = -4,0` para pantalla abierta y `Y = 0,8` para abridor abierto; las capturas `qa-implementation-closed-latest.png` y `qa-implementation-open-latest.png` se tomaron después del cambio. Sin hallazgos P0/P1/P2.
8. Séptimo pase: [P1] durante el cierre la tapa conservaba la altura abierta y saltaba a la altura cerrada al terminar. La transición ahora mantiene el perfil de origen y anima el delta vertical hacia el perfil destino en tapa y abridor; al finalizar cambia de perfil sin salto. Se probó apertura y cierre en la vista de juego y se capturaron `qa-implementation-game-closed-latest.png` y `qa-implementation-game-open-latest.png`. Sin hallazgos P0/P1/P2.

**Interactions and technical checks**

- Apertura y cierre probados en el navegador integrado.
- Apertura y cierre revisados también durante la animación; no queda desplazamiento vertical residual al completar ninguno de los dos sentidos.
- Editor visual abierto, restauración global aplicada y valores de la nueva calibración verificados.
- Independencia de perfiles comprobada con edición, cambio de pestaña y retorno al perfil original.
- `Restaurar capa`, `Restaurar estado`, `Restaurar ambos` y copia conjunta de configuración comprobados.
- Escritura de enteros, negativos y decimales comprobada en Y; el valor se conserva durante la edición y se normaliza al perder el foco.
- Arrastre vertical comprobado; los deltas se acumulan desde el estado más reciente y el eje X permanece independiente.
- Consola revisada: sin errores ni avisos.
- `npm run build`: correcto.
- `npm test -- --run`: 8/8 pruebas correctas.

**Implementation checklist**

- [x] Abridor con configuración exacta.
- [x] Recorrido cerrado izquierda → abierto derecha.
- [x] Fondo negro eliminado.
- [x] Sólo siete piezas canónicas en `public/assets/wheel/parts`.
- [x] Estados abierto/cerrado verificados visualmente.
- [x] Valores abiertos y cerrados guardados por separado.
- [x] El juego usa el perfil cerrado mientras la zona está oculta y el abierto mientras está visible.
- [x] Perfiles abierto/cerrado separados y restaurables con los valores exactos recibidos.

final result: passed
