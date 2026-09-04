# Registro de decisiones

## 2026-08-31 — Alcance inicial

- Android primero con núcleo web reutilizable.
- Pass-and-play en un solo móvil.
- Offline-first; la partida no se bloquea si no hay red.
- 120 escalas, 12 categorías premium y tres tonos elegibles.
- Modos clásico, modificadores y escalas personalizadas.
- Sin cuentas, backend ni panel de administración.
- Anuncios solo en pausas naturales y mediante un adaptador sustituible.

## 2026-08-31 — Coordinación

- El entorno no permitió lanzar la tanda de subagentes por límite de concurrencia.
- Se conserva el mismo DAG de agentes y se ejecutan localmente sus entregables, sin solapar ámbitos de escritura.

## 2026-08-31 — Referencia física de Wavelength

- La referencia oficial confirma que la zona se sortea con la pantalla cerrada, se mira abriendo la pantalla completamente y se vuelve a cerrar antes de entregar el móvil.
- La ruleta física concentra la zona en cinco sectores: 2–3–4–3–2 puntos. La implementación adopta esa lectura visual y mantiene 1/0 como resultado fuera de la zona en esta variante local.
- La pantalla privada pasa a empezar cerrada: el usuario toca `Destapar la ruleta`, escucha un breve sonido de giro, ve la zona durante unos segundos y puede cerrarla antes de dar la pista.
- La fuente consultada fue el rulebook de Wavelength y la ficha oficial de CMYK; la experiencia digital se inspira en el ritmo de ocultar–dar pista–debatir–revelar, sin copiar arte ni textos propietarios.

## 2026-09-02 — PM-WHEEL-REVIEW-01 / composición por capas

- Se recuperó la conversación `Crear SVG ruleta cerrada` (`6a9702b6-7bf0-83eb-af56-0aa0139b8a80`). Las piezas adjuntas también están disponibles en `public/assets/wheel/layers/`; se usa esa copia local porque el chat expone los adjuntos como previsualizaciones temporales, no como imports estables del proyecto.
- La carcasa/rail azul queda fija y delante; el panel celeste/blanco es una capa propia debajo; la fan representa la rueda interna y comparte el eje del target; la aguja rota exclusivamente alrededor del pivote inferior.
- La apertura y el cierre conservan las mismas capas montadas durante toda la transición. El panel entra/sale por traslación, la fan usa una máscara de entrada/salida y el abridor recorre el rail con una órbita reversible. Esto evita el flash de estado intermedio que tenía la composición anterior.
- Se compacta la ruleta a `448px` como máximo (`292px` en móvil estrecho) para conservar el carácter de abertura física sin dominar la pantalla. La fan pasa a `92%` del lienzo y mantiene la relación 2–3–4–3–2 del asset maestro.
- La interacción sigue siendo local y no bloqueante. El sonido corto existente acompaña el destape, pero no controla ninguna transición.

## 2026-09-02 — PM-WHEEL-REVIEW-01 / iteración física final

- La composición activa usa `open-interior.png` como interior/base, un rotor dentado recortado y la fan dentro de una ventana circular; la pantalla celeste (`closed-interior.png`) es una capa propia que gira `0deg → 180deg` al abrir y vuelve al cerrar.
- El rail/carcasa frontal permanece fijo por ser el marco de la abertura. El rotor dentado y la fan sí comparten el eje del target y tienen un pequeño asentamiento sincronizado; no se rota únicamente una imagen aislada sobre un fondo genérico.
- La ruleta queda limitada a `416px` (`292px` en móvil estrecho). La fan se reduce y se recorta a la abertura, conservando los cinco sectores 2–3–4–3–2 y su relación matemática con `targetPosition`.
- El abridor usa una capa orbital independiente y recorre `-180deg → 0deg`, manteniendo el apoyo fijo y llevando el gancho de la mueca izquierda a la derecha. La aguja usa otro pivote y solo transforma su brazo según `needlePosition`.
- La transición dura aproximadamente `1.08s`; los temporizadores de React dejan las capas montadas durante el cierre y desmontan el target después. `prefers-reduced-motion` conserva los estados finales sin forzar la animación.

## 2026-09-01 — Tarjetas y movimiento

- El selector de categorías adopta una galería de tarjetas tipo baraja: cada carta muestra número, color, nombre, escalas disponibles y estado seleccionado.
- La galería mantiene `Todas`, `Limpiar` y selección individual de las 12 categorías, con tarjetas compactas y scroll interno solo cuando sea necesario en móvil.
- La ruleta añade microanimaciones de apertura, cierre seguro y asentamiento del puntero, respetando `prefers-reduced-motion` y sin modificar la puntuación.
- Los PNG de abridor y aguja se conservaron como referencias separadas; no se integran directamente porque sus fondos negros no encajan con el layout responsive sin edición adicional.

## 2026-09-02 — Revisión geométrica de la ruleta

- Se cerraron los agentes sin entregable; el inspector delegado que quedó bloqueado también se cerró.
- Se descartó cualquier ajuste visual basado únicamente en colocar una imagen encima: la aguja y el abridor deben tener pivotes explícitos.
- El eje común se fija en `50% 48%` del lienzo de la ruleta, alineado con el nacimiento de la fan y el rail de las muescas.
- La aguja rota sobre ese eje fijo; el abridor recorre una órbita de `-180deg` a `0deg` y conserva la orientación de su gancho hacia la mueca.
- La fan se amplía al `112%` y se ancla por su punto inferior central al eje común; la carcasa frontal oculta la parte que debe quedar debajo del rail.
- Se mantiene el principio de no revelar la zona en la pantalla cerrada de pista ni durante el debate.

## 2026-09-02 — Fluidez y proporciones

- Se sustituye la trayectoria angular fragmentada del abridor por una órbita continua con tres puntos de interpolación.
- El cierre mantiene el cuerpo abierto durante el retorno y aplica el cuerpo cerrado únicamente después de completar la animación.
- La fan queda en `112%`, centrada alrededor del eje y compensada verticalmente para conservar la lectura de los números al girar.
- La aguja se reduce al `68%`, con el centro del hub en el mismo eje físico y sin overflow horizontal.

## 2026-09-02 — Capas activas desde la referencia

- Se recuperaron y conservaron las ocho imágenes de la conversación `Crear SVG ruleta cerrada` dentro de `public/assets/wheel/reference-chatgpt/`.
- Las piezas utilizadas por la app se copiaron a `public/assets/wheel/layers/` con nombres semánticos: base cerrada, panel abierto, fan, aguja recortada y abridor. La aguja se usa desde `needle-reference-cutout.png`, derivada de la referencia original conservando el PNG fuente intacto.
- Se eliminó el crossfade del cuerpo completo: la base cerrada queda estable y el panel abierto se descubre mediante una máscara suave. Así la animación pertenece a los elementos que realmente se mueven.
- La carcasa, el logotipo y el rail permanecen en su sitio; solo orbitan el abridor y giran la fan/aguja alrededor del pivote `50% 48%`.
- Orden de capas fijado tras inspección de las composiciones completas: base cerrada, panel abierto, fan, carcasa frontal, aguja y abridor. La carcasa frontal tapa la base de la fan para reproducir el encaje de la referencia.
- El abridor se alinea por el centro de su gancho con cada muesca lateral; el lienzo transparente del PNG deja de ser la referencia de posicionamiento.

## 2026-09-02 — Auditoría PM-WHEEL-REVIEW-01

- Se invalidó el ajuste anterior de la fan porque una regla heredada (`inset: 0`) seguía fijando simultáneamente `top` y `bottom`; el PNG 2172×724 se renderizaba casi cuadrado. Se eliminaron las reglas de la ruleta CSS antigua para que las capas activas tengan una sola fuente geométrica.
- El eje común se recalibró de `50% 48%` a `50% 50.5%` después de medir la curva del rail en los PNG maestros y la fila central del hub de la aguja.
- La fan conserva su relación de aspecto nativa y se dimensiona por su contenido opaco: `122%` de ancho de lienzo, con vértice inferior sobre el eje. La caja transparente puede salir del círculo; la pieza visible permanece dentro y la tarjeta contiene cualquier excedente.
- La carcasa frontal se mantiene como duplicado explícito de la base y se recorta con un polígono que sigue la curva medida: hombros `46.1%`, centro `49.7%` y muescas alrededor de `51%`. Esta capa impide que la fan pinte sobre azul oscuro.
- El hub de la aguja se ancla usando la fila `y≈784/1024` de la pieza recortada. La aguja se reduce a `54%` del lienzo y rota únicamente mediante su contenedor.
- El abridor se coloca usando el gancho opaco: `left 80.1%`, `top 42.15%`, `width 25%`; su órbita comparte el eje y une las muescas con `-180° → 0°`.
- Las animaciones visuales terminan antes de los temporizadores de estado: abridor `1.08 s`, fan hasta `1.05 s` y panel hasta `1.02 s`. La fan permanece montada durante el cierre y se oculta por máscara, evitando el salto anterior.
- Se aceptó la composición tras comprobar visualmente cerrada, apertura intermedia, abierta, cierre intermedio, adivinanza y revelación, además de 390 px sin overflow horizontal.

## 2026-09-02 — PM-WHEEL-REVIEW-01 / rectificación con referencia final

- Se invalida expresamente la aprobación anterior: la traslación del panel y la máscara de la fan no reproducían el mecanismo de la referencia.
- La tapa menta pasa a ser una pieza independiente que gira 180 grados sobre `50% 50.5%`; el rail y la carcasa inferior permanecen fijos y la aguja queda siempre en la capa superior.
- Los dientes y la fan forman un mismo rotor de target. Comparten contenedor, eje, ángulo y asentamiento; los dientes dejan de ser una corona inmóvil decorativa.
- La nueva foto aportada por el propietario sustituye la proporción previa de la fan como referencia directa. Se conserva el orden 2–3–4–3–2 y se adopta una geometría estrecha y compacta, con punta inferior común y números contenidos cerca del arco superior.
- El recorrido del target y la aguja se comprime coherentemente a `±67.5°` para mantener los cinco sectores legibles dentro del hueco incluso cerca de los extremos; la conversión del puntero usa la misma escala.
- La validación final exige nueve capturas de evidencia, carga limpia sin errores/avisos, build, 8 tests y comprobación real a 390 px sin overflow horizontal. Esos controles quedan registrados en `design-qa.md`.
- La referencia definitiva de la fan recibida en `d4a7282f-4097-4309-a513-ba9286bcec2d/1-Photo-1.jpg` tiene el mismo SHA-256 que la imagen usada para calibrar la primera revisión.

## 2026-09-02 — Corrección de deformación y giro dentado

- Se detecta que `score-fan.png` no reproducía la geometría alta de la referencia y que forzar simultáneamente `width` y `height` con `object-fit: fill` deformaba la imagen. Esa decisión queda revocada.
- Se crea `score-fan-compact.png` como sprite independiente con alpha real y proporción fiel a la referencia. La aplicación lo consume con ancho porcentual y `height: auto`; la relación natural y la renderizada coinciden.
- La corona dentada y la fan pasan a depender de una sola transformación en `wheel-target-pivot`. La apertura indexa el rotor con 24 grados de recorrido y 3 grados de asentamiento; el cierre revierte el movimiento bajo la tapa.
- La revisión del navegador confirma proporción `1.333` tanto en escritorio como a 390 px, movimiento angular efectivo, cero overflow horizontal y carga limpia sin errores ni avisos.

## 2026-09-02 — Encaje final, sello y recorte del engranaje

- Se amplía la fan del `59%` al `64%` y se recoloca a `left: 18%`, `top: 8.5%`, manteniendo `height: auto`. Así los números alcanzan el arco crema sin deformar el sprite y la punta continúa sobre el eje.
- La carcasa frontal pasa a usar `closed-interior.png` dentro de un contenedor recortado: recupera el sello `Punto Medio` sin reintroducir la tapa menta.
- Se separan los recortes de carcasa, tapa y corona. La corona móvil solo puede verse en la mitad superior; la base y el cuerpo inferior terminan en el círculo azul y dejan de mostrar dientes blancos por debajo.
- La prueba a 390 px confirma ancho exacto de 390 px sin desbordamiento. La prueba de animación registra matrices distintas durante el recorrido y el asentamiento del pivot común de dientes y fan.

## 2026-09-02 — Mecánica física correcta: rueda y pantalla independientes

- La regla oficial distingue dos acciones: con la pantalla cerrada se gira la rueda para aleatorizar el objetivo; después se abre la pantalla para ver la posición ya fijada. La implementación anterior mezclaba ambos movimientos y queda revocada.
- Se añade el paso explícito `Girar la puntuación`. La corona dentada completa y la fan giran juntas más de dos vueltas y se asientan; la pantalla celeste permanece inmóvil y el objetivo de color no puede filtrarse durante el giro.
- Solo después del asentamiento se habilita `Destapar la ruleta`. Esta acción gira exclusivamente la pantalla y el abridor; la matriz del objetivo permanece constante durante toda la apertura y también en `Volver a mirar`.
- La corona deja de estar recortada a la mitad superior y vuelve a rodear toda la ruleta. El panel celeste se extiende hasta las dos muescas y la ventana del objetivo se reduce al radio interior real para impedir fugas por el arco superior.
- La validación incluye estados cerrado, giro, apertura, abierto, cierre y reapertura; versión móvil a 390 px sin overflow; carga limpia sin errores; build y 8 tests correctos.

## 2026-09-02 — Control directo, máscara fija y abridor anclado

- Se elimina el botón `Girar la puntuación` y se revoca por completo la animación automática del objetivo. No quedan keyframes, transiciones ni inercia aplicados a la fan o a `wheel-target-pivot`.
- Antes del primer vistazo, el borde dentado funciona como control angular: admite arrastre en ambos sentidos, sigue el gesto de forma inmediata y emite clics sintéticos breves por cada grupo de dientes recorrido. El teclado ofrece el mismo cambio directo con las flechas.
- En el instante del primer destape se elimina la capacidad de arrastre. Cerrar la tapa o usar `Volver a mirar` no la recupera.
- El panel celeste se escala al `103.5%` y queda por debajo de un nuevo `wheel-frame` fijo, que reproduce el aro azul y oculta cualquier exceso. Esto elimina holguras sin depender de que el recorte del panel coincida al píxel con el borde exterior.
- El abridor se reduce al `17%` y se ancla usando el centro real del gancho dentro del lienzo transparente (`left: 78.9%`, `top: 45.2%`), alineándolo simétricamente con las muescas.
- Verificación: estilos de fan y pivot sin animación ni transición, control retirado tras revelar, 390 px sin overflow, consola limpia, build correcto y 8 tests pasados.
