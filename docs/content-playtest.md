# Playtest editorial del contenido

Fecha: 2026-09-04  
Alcance: 20 categorías, 300 escalas, 600 extremos.

## Resultado

El catálogo queda apto para una ronda editorial y técnica: conserva 20 categorías y 15 escalas por categoría, con 100 escalas de cada tono (`familiar`, `amigos` y `adulto`). No hay pares duplicados ni extremos idénticos; los 600 textos son únicos. La app carga los JSON individuales de `content/categories/` y `content/catalog.json` queda sincronizado con esas fuentes.

La simulación fue editorial, no un estudio con personas reales. Se recorrieron las 300 escalas con cuatro lentes de juego y se aplicaron cuatro puertas: variedad de situaciones, concreción para formular una pista, potencial de conversación y seguridad tonal. El criterio de aceptación fue que una persona pudiera pensar en un ejemplo reconocible y colocarlo entre los extremos sin tener que inventar primero qué significa el extremo.

## Perfiles simulados

| Perfil | Lo que funciona | Fricción que queda por validar |
| --- | --- | --- |
| Grupo casual | Vida cotidiana, comida, ocio, fiesta y viajes ofrecen situaciones inmediatas: “plan con grupo y ubicación compartida”, “pizza que divide a la mesa” o “juego que termina en revancha”. | Algunas escalas de cultura, deporte y dinero dependen de que el grupo comparta referencias o tolera hablar de estatus. |
| Grupo competitivo | Las escalas de deporte, ética, trabajo y televisión/cine abren posiciones intermedias discutibles, no solo “bueno/malo”. Los cambios en `deporte-01..03` reducen la monotonía futbolística y hacen más visible el criterio que se está comparando. | Hay que observar si una pista demasiado estratégica (“jugador que compite con pizarra”) permite señalar un extremo sin regalar la respuesta. |
| Pareja | Relaciones, casa, comida, viajes y nostalgia tienen material autobiográfico y permiten pistas de planes, fechas, regalos y convivencia. | Rupturas, dinero, alquiler, privacidad y “desaparecer” pueden cambiar el ánimo. Se eliminó la formulación más ambigua de viajes, pero el grupo debe decidir sus límites de conversación. |
| Grupo adulto | Trabajo, dinero-status, ética, fiesta y futuro soportan humor de consecuencias, acuerdos, presupuesto y vida compartida. El tono adulto queda distribuido de forma uniforme. | “Resaca”, “sueldo”, “alquiler”, “hipoteca implícita” y conflictos de pareja pueden resultar demasiado personales para ciertos grupos. |

## Revisión por categoría

| Categoría | Veredicto | Observación de playtest |
| --- | --- | --- |
| Vida cotidiana | Verde | Muy fácil de activar; mezcla hábitos, compras, mensajes y planes. |
| Trabajo y estudios | Verde | Buen debate por reuniones, tareas, profesiones y carrera; ligero solapamiento natural con ética. |
| Relaciones | Verde con sensibilidad | Excelente para pareja; rupturas y convivencia requieren consentimiento del grupo. |
| Comida y bebida | Verde | Extremos visuales y experienciales; fácil de dar pistas sin conocimiento especializado. |
| Ocio | Verde | Variado entre pantalla, juegos, hobbies y planes; se eliminó un “Película de domingo” repetido. |
| Viajes | Verde con sensibilidad | Escala clara y evocadora; se evitó “viajar para desaparecer” por ambigüedad emocional. |
| Tecnología | Verde | Buen equilibrio entre apps, privacidad, dispositivos y hábitos; algunas referencias pueden envejecer. |
| Deporte | Verde con reserva | Mejor variedad de personas, partidos y deportes; sigue siendo una categoría que puede favorecer a aficionados. |
| Cultura | Verde | Buen material para personas, obras, museos y eventos; geografía y referencias culturales deben validarse por región. |
| Televisión y cine | Verde | Escalas muy pistas-able por personajes, finales, remakes y géneros; comprobar spoilers en partidas reales. |
| Personalidad | Verde | Se sustituyeron tres extremos centrados en “famosos” por conductas observables, más universales y menos repetitivas. |
| Amistad | Verde | Alta identificación personal; “meses sin hablar” puede ser sensible para algunas amistades. |
| Nostalgia | Verde con reserva | Evoca recuerdos y objetos concretos; depende de generaciones y países. |
| Dinero y estatus | Verde con sensibilidad | Material claro para debatir; propinas, sueldo, lujo y presupuesto pueden exponer diferencias económicas. |
| Casa y convivencia | Verde | Objetos y situaciones domésticas contextualizados; buena entrada para grupos mixtos. |
| Absurdo | Verde | Mantiene humor de personas, animales, ideas y situaciones imposibles sin depender solo de objetos aleatorios. |
| Riesgo y aventura | Verde con reserva | La mayoría de extremos se apoya en actividades, permisos, guías y planes; revisar que “reto delante de todo el bar” encaje con todos los grupos. |
| Ética | Verde con sensibilidad | Muy buen potencial de debate; colas, secretos, mentiras y conflictos pueden tocar experiencias reales. |
| Fiesta | Verde con sensibilidad | Situaciones concretas y progresivas; alcohol y resaca quedan principalmente en adulto. |
| Futuro | Verde con reserva | Robots, apps, ciudades y cambios permiten especular; algunas respuestas serán deliberadamente subjetivas. |

## Cambios aplicados

Se hicieron 19 ajustes editoriales en los JSON de categorías, manteniendo cada ID y su tono:

- `absurdo-11`, `cultura-15`, `dinero-status-02`, `dinero-status-04`, `dinero-status-06`, `riesgo-aventura-13`, `tecnologia-15` y `vida-cotidiana-04/14` ahora describen decisiones, eventos, compras, retos o usos concretos en vez de extremos abstractos.
- `deporte-01/02/03` amplían la variedad más allá de carrera/fichaje/partido de fútbol.
- `personalidad-02/07/12` cambian “famoso” genérico por conductas observables de una persona.
- `relaciones-15` deja de repetir literalmente “Fecha que se convierte en tradición”.
- `television-cine-05` deja de repetir literalmente “Película de domingo” con Ocio, y `television-cine-13` pasa de una metáfora poco graduable a un arco reconocible de romance.
- `viajes-15` elimina el extremo ambiguo “Viajar solo para desaparecer”.

También se regeneró `content/catalog.json` desde las 20 fuentes individuales para evitar que el agregado conserve una edición antigua.

## Preguntas que solo puede resolver un grupo humano

1. ¿La referencia “final de baloncesto” resulta suficientemente compartida en el público objetivo o conviene sustituirla por un evento deportivo más transversal?
2. ¿El tono adulto permite hablar de sueldo, alquiler, propinas, rupturas, privacidad y resaca sin añadir una opción de contenido sensible?
3. ¿“Persona que llega con fotógrafo” y otras escenas de personalidad producen debate o se sienten demasiado fáciles de colocar?
4. ¿Las categorías Cultura, Nostalgia y Televisión y cine tienen referencias suficientemente intergeneracionales para el público real?
5. ¿El grupo interpreta “actividad que da respeto”, “reto que aceptas delante de todo el bar” y “deporte extremo como nueva identidad” como una progresión segura y humorística?
6. Después de 3–5 partidas, ¿se percibe repetición por los marcos “plan”, “película”, “regalo” y “fecha” aunque los textos sean distintos?

## Verificación

- `npm test`: 3 archivos, 15 pruebas correctas.
- `npm run build`: correcto.
- Conteo estructural: 20 categorías × 15 escalas = 300.
- Tonos: 100 familiar, 100 amigos, 100 adulto; 5 de cada tono en cada categoría.
- Duplicados: 0 pares repetidos y 0 extremos repetidos.

## Riesgos abiertos y siguiente tarea

Riesgos principales: sensibilidad socioeconómica y relacional, sesgo regional/generacional, referencias deportivas y posible fatiga por marcos semánticos repetidos. No se tocó la ruleta, el layout ni los estilos.

Siguiente tarea recomendada: organizar un playtest humano breve con los cuatro perfiles, registrar tiempo hasta la primera pista, casos de “no sé qué poner”, discusiones que se bloquean y escalas descartadas por sensibilidad. Usar esas observaciones para una segunda pasada editorial, sin cambiar el contrato de 300/20 ni la distribución de tonos.
