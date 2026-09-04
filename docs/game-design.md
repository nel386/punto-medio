# Diseño de juego

## Objetivo de la experiencia

El juego es un party game de debate: una persona conoce una posición secreta en una escala y da una pista; las demás intentan colocar una aguja en el punto que creen correcto. La posición no tiene una respuesta objetiva: se puntúa lo cerca que queda la aguja de la posición que eligió el juego.

La unidad de juego es una ronda local en un único móvil. No hay cuentas, conexión, servidor, sincronización entre dispositivos ni contenido descargado durante la partida.

## Conceptos y valores del dominio

- La escala se representa numéricamente de `0` a `100`.
- `leftLabel` identifica el extremo situado en `0`; `rightLabel`, el extremo situado en `100`.
- `targetPosition` es el centro entero de la zona secreta y permanece fijo durante la ronda.
- `needlePosition` es la posición entera elegida por el equipo y se limita al rango `0..100`.
- La referencia visual de la zona usa cinco sectores acotados, con lectura 2–3–4–3–2; el centro secreto sigue siendo `targetPosition`.
- El centro secreto se genera entre `10` y `90`, incluidos, para que la zona nunca quede cortada por los extremos.
- La puntuación de cada ronda pertenece al equipo activo y siempre es un `ScoreBand` de `0 | 1 | 2 | 3 | 4`.

La zona se revela solo después de confirmar la aguja. La aplicación conserva `targetPosition`, `needlePosition`, `clue` y `revealed` en la sesión local para que suspender o reabrir la app no cambie una ronda iniciada.

## Preparación de una partida

1. El grupo elige el tono máximo permitido: `familiar`, `amigos` o `adulto`.
2. El tono funciona como filtro acumulativo:
   - `familiar`: solo escalas familiares.
   - `amigos`: escalas familiares y de amigos.
   - `adulto`: los tres tonos.
3. El grupo elige una o varias categorías disponibles.
4. El grupo crea entre 2 y 4 equipos. En cada ronda, el equipo activo designa a una persona para dar la pista y el resto del grupo coloca la aguja; con una sola persona en un equipo, esa persona da la pista y las personas de los demás equipos actúan como grupo de debate y colocación.
5. Se elige el número de turnos por equipo: 3, 5 o 10. El valor inicial es 5.
6. El número total de rondas es `teams.length * turnsPerTeam`.
7. `currentTeamIndex` empieza en `0` y avanza circularmente. Así todos los equipos juegan exactamente el mismo número de rondas.

La primera selección de escala se hace al iniciar la ronda, entre las escalas habilitadas que cumplen tono y categoría. No se repite una escala mientras queden escalas no usadas que cumplan esos filtros. Si se agotan, se reinicia el mazo de escalas usadas. La escala elegida se guarda en `selectedScaleId`.

## Modo clásico

### Regla de la ronda

1. La aplicación muestra al equipo activo los dos extremos y la ruleta cerrada, sin revelar la zona.
2. Una persona del equipo activo asume el papel de quien da la pista. Pulsa `Destapar la ruleta`, ve la zona durante unos segundos y puede cerrarla manualmente; el resto del equipo no debe mirar.
3. Quien da la pista dice una única pista oral o la escribe como texto corto. La pista no puede revelar explícitamente la posición, el número ni la anchura de la zona.
4. La zona se oculta automáticamente tras unos segundos o al pulsar `Cerrar la zona`. Al entregar el móvil, la pantalla ya está cubierta y no muestra la zona.
5. El equipo debate qué significa la pista respecto de los dos extremos.
6. El equipo mueve la aguja horizontalmente. La aplicación muestra el porcentaje de la aguja, pero no muestra el centro objetivo ni la puntuación posible.
7. El equipo pulsa `Confirmar aguja`. Aparece una confirmación breve para evitar toques accidentales.
8. Tras confirmar, la aplicación revela la zona, muestra la distancia y calcula los puntos con la tabla determinista.
9. El equipo pulsa `Siguiente ronda`. Se actualizan los puntos del equipo activo y se pasa el móvil al siguiente equipo.

No hay límite de tiempo en la primera versión. El grupo puede debatir tanto como quiera. Tampoco se permite pedir al juego una pista adicional: la incertidumbre y la interpretación forman parte del juego.

### Puntuación determinista

Se calcula `distance = abs(needlePosition - targetPosition)`. La puntuación es:

| Distancia al centro | Resultado | Puntos |
|---:|---|---:|
| 0–8 | Aguja dentro de la zona | 4 |
| 9–16 | Muy cerca de la zona | 3 |
| 17–25 | Cerca | 2 |
| 26–35 | Aproximación razonable | 1 |
| 36–100 | Lejos | 0 |

Pseudocódigo normativo:

```ts
function scoreFor(needlePosition: number, targetPosition: number): ScoreBand {
  const distance = Math.abs(needlePosition - targetPosition);
  if (distance <= 8) return 4;
  if (distance <= 16) return 3;
  if (distance <= 25) return 2;
  if (distance <= 35) return 1;
  return 0;
}
```

La puntuación se calcula solo una vez al confirmar la ronda. Reabrir el resultado no vuelve a sortear la zona ni modifica puntos. Un resultado exacto en el borde de la zona (`distance === 8`) vale 4; el primer punto fuera (`distance === 9`) vale 3.

## Flujo pass-and-play y privacidad

La interfaz debe hacer evidente quién puede mirar en cada momento:

1. `Turno de pista`: pantalla con un aviso grande `Solo mira quien da la pista`, extremos y zona visual.
2. `Pista preparada`: campo opcional para escribir la pista, botón para ocultar la zona y texto `Pasa el móvil al equipo`.
3. `Debate`: extremos, pista y aguja; no hay ningún dato que permita reconstruir la zona.
4. `Confirmación`: resumen de la posición elegida sin target ni puntos.
5. `Resultado`: zona, centro, aguja, distancia y puntos.
6. `Fin de partida`: clasificación, ronda mejor puntuada y botones `Jugar otra vez` y `Cambiar configuración`.

Requisitos de privacidad local:

- La zona está oculta por defecto al entrar en una ronda.
- La pantalla de pista no se puede capturar accidentalmente desde la interfaz; no se requiere protección del sistema operativo en F0.
- Al abandonar la ronda antes de ocultar la zona, volver a la sesión abre de nuevo la pantalla de pista porque la ronda aún no ha sido entregada.
- Al pulsar `Ya he visto la zona`, `revealed` continúa en `false`, pero la zona deja de renderizarse en el flujo de debate.
- `revealed` pasa a `true` únicamente después de la confirmación de la aguja.
- El botón de atrás permite volver a configuración solo antes de generar una ronda; nunca permite regenerar una ronda ya iniciada.

## Modo Modificadores

Este modo conserva exactamente el flujo, la generación de zona y la tabla de puntuación del modo clásico. La diferencia es que cada ronda muestra un modificador antes de que se dé la pista.

Los modificadores no alteran la posición secreta, no dan puntos extra, no reducen el máximo de 4 y no pueden bloquear una ronda. Si el grupo no quiere cumplir uno, puede pulsar `Saltar modificador`; la ronda continúa como clásica y el modificador se marca como omitido.

Se prepara un mazo local con todos los modificadores compatibles, se baraja al comenzar la partida y se roba sin reemplazo. No se repite un modificador hasta agotar el mazo. La baraja y el modificador de la ronda se guardan localmente para que suspender la app no cambie la regla.

### Modificadores iniciales

Todos son deliberadamente cortos, autocontenidos y comprobables manualmente o mediante validaciones sencillas de texto:

| ID | Título | Instrucción | Comprobación |
|---|---|---|---|
| `one-word` | Una palabra | Da una pista de una sola palabra. | El campo cuenta un único bloque separado por espacios. |
| `three-words` | Tres palabras | Da exactamente tres palabras. | El campo cuenta tres bloques. |
| `question` | En forma de pregunta | La pista debe ser una pregunta. | El texto debe terminar en `?`; se permite omitir si se da oralmente. |
| `emoji-plus-word` | Emoji y palabra | Usa al menos un emoji y una palabra. | Aviso si falta emoji o texto al escribir. |
| `no-extremes` | Sin decir los extremos | No pronuncies ni escribas ninguna de las dos etiquetas de la escala. | Comparación normalizada contra las etiquetas. |
| `comparison` | Como si fuera… | Formula la pista como una comparación: `como`, `parecido a` o equivalente. | Recordatorio visual; no bloquea idiomas ni habla oral. |
| `headline` | Titular | Da la pista como un titular breve, de seis palabras o menos. | El campo avisa cuando supera seis palabras. |
| `first-person` | En primera persona | Habla como si tú fueras el ejemplo de la pista. | Regla social, sin validación obligatoria. |
| `advertisement` | Anuncio | Vende tu pista como si fuera un anuncio. | Regla social; se muestra una plantilla de ejemplo. |
| `literal-example` | Ejemplo concreto | Di una situación u objeto concreto, no una valoración abstracta. | Regla social; el grupo decide si se cumple. |
| `two-clues` | Dos mini-pistas | Da dos pistas cortas separadas por una pausa o una línea nueva. | El campo permite dos líneas y valida que ambas existan. |
| `yes-no-question` | Una pregunta sí/no | Antes de colocar, el equipo puede hacer una sola pregunta de sí/no a quien da la pista. | Un contador local permite exactamente una pregunta. |

Las comprobaciones son ayudas, no un juez automático de creatividad. El juego nunca penaliza ni impide continuar por un incumplimiento de formato. Las pistas orales siguen siendo válidas aunque el campo de texto esté vacío.

## Modo Escalas personalizadas

Permite inventar una escala en el momento y es especialmente útil para jugar con bromas internas.

### Crear la escala

1. El equipo activo pulsa `Crear escala`.
2. Escribe el extremo izquierdo y el extremo derecho, ambos obligatorios.
3. Cada etiqueta admite entre 1 y 40 caracteres después de recortar espacios.
4. No se aceptan etiquetas idénticas ignorando mayúsculas, espacios repetidos o signos básicos.
5. Se puede añadir un nombre opcional de escala de hasta 50 caracteres. Si se deja vacío, se muestra `Escala personalizada`.
6. La escala usa el tono elegido para la sesión y la categoría interna `custom`.
7. Al confirmar, se genera una zona con las mismas reglas del modo clásico y comienza la ronda.

Las escalas personalizadas no se envían a ningún servicio. Se guardan únicamente durante la sesión local y se eliminan al terminar o abandonar la partida. Para encajar con los tipos actuales, la escala temporal se materializa como un `Scale` con `categoryId: "custom"`; `selectedScaleId` apunta a su registro local mientras la ronda está activa.

El resto de la ronda es idéntico al clásico: una persona ve la zona, da una pista, el equipo debate, coloca la aguja y descubre el resultado. Las escalas personalizadas no entran en el mazo permanente ni cuentan dentro de las 120 escalas editoriales.

## Persistencia y compatibilidad con los tipos actuales

No se modifican los tipos públicos definidos en `src/domain/types.ts` en este documento. La implementación debe usar `GameSession` como estado principal y un almacén local asociado al `GameSession.id` para los datos de ronda que no tienen campo propio:

```ts
type LocalRoundMeta = {
  sessionId: string;
  round: number;
  activeModifierId: string | null;
  customScale: Scale | null;
  usedScaleIds: string[];
  modifierDeck: string[];
};
```

`LocalRoundMeta` es un contrato de persistencia interno, no una modificación de `src/domain/types.ts`. Al reanudar, la aplicación debe reconstruir el mismo modificador y la misma escala a partir de esta meta. Si no existe meta para una ronda, se crea antes de mostrar la zona y se persiste de inmediato.

La sesión completa se guarda tras cada transición importante: inicio de ronda, ocultación de la zona, colocación de aguja, revelación y actualización de puntuación. La ausencia de red no cambia ninguna regla. El adaptador de anuncios puede ignorar las solicitudes cuando no hay conexión, pero no puede impedir una transición de juego.

## Pruebas conceptuales de aceptación

### Puntuación

- `needlePosition = 50`, `targetPosition = 50` devuelve 4.
- `needlePosition = 42`, `targetPosition = 50` devuelve 4.
- `needlePosition = 41`, `targetPosition = 50` devuelve 3.
- `needlePosition = 34`, `targetPosition = 50` devuelve 3.
- `needlePosition = 33`, `targetPosition = 50` devuelve 2.
- `needlePosition = 25`, `targetPosition = 50` devuelve 1.
- `needlePosition = 14`, `targetPosition = 50` devuelve 0.
- La misma pareja de posiciones siempre devuelve el mismo resultado.
- Una aguja fuera de `0..100` se limita antes de puntuar.

### Flujo local

- Al comenzar una ronda, la persona que da la pista ve la zona y el equipo no la ve en la pantalla de debate.
- Al suspender y reabrir antes de confirmar, siguen intactos escala, target y pista.
- Confirmar dos veces no duplica la puntuación ni avanza dos rondas.
- Cada equipo recibe el mismo número de turnos y el índice vuelve al primer equipo tras el último.
- El juego completo puede avanzar con el dispositivo en modo avión.

### Modificadores

- El mazo no repite un ID hasta agotarse.
- Al reabrir la app, el modificador activo no cambia.
- Los 12 modificadores son compatibles solo con `modifiers`.
- Omitir un modificador deja la misma puntuación y permite terminar la ronda.
- Los validadores de una, tres y seis palabras respetan espacios repetidos y texto recortado.

### Escalas personalizadas

- No se puede iniciar la ronda con uno de los extremos vacío o con extremos equivalentes.
- Una escala personalizada usa el mismo rango, zona y puntuación que una escala editorial.
- El texto personalizado aparece en la ronda y no aparece después de borrar la sesión.
- Una escala personalizada no se mezcla con el mazo editorial ni altera el contador de categorías.

## Estado de entrega

- **Estado:** completado.
- **Resumen:** reglas completas para clásico, puntuación determinista de 0 a 4, flujo pass-and-play con protección de la zona, modificadores variados sin romper la puntuación y escalas personalizadas totalmente offline.
- **Archivo modificado:** `docs/game-design.md`.
- **Decisiones:** zona de 16 puntos centrada en un target de 10 a 90; puntuación por distancia al centro; 2–4 equipos y 3/5/10 turnos por equipo; mazo de modificadores sin repetición; validaciones no bloqueantes; escalas personalizadas temporales y locales.
- **Pruebas conceptuales:** se incluyen casos de frontera de puntuación, persistencia, privacidad, rotación de equipos, mazo de modificadores y validación de escalas personalizadas.
- **Riesgos:** las reglas de modificadores sociales no se pueden validar completamente para pistas orales; el almacenamiento sidecar deberá implementarse junto al repositorio local; la redacción de etiquetas adultas y la revisión de escalas personalizadas requieren moderación editorial o de grupo.

## Iteración visual de la ruleta — PM-WHEEL-REVIEW-01

La ruleta digital conserva la lectura frontal del dispositivo físico: una abertura semicircular compacta, cinco cuñas 2–3–4–3–2 y un hub inferior fijo. La pantalla privada empieza cerrada; quien da la pista pulsa `Destapar la ruleta`, mira la zona durante unos segundos y la cierra antes de entregar el móvil.

La composición está separada en capas con responsabilidades distintas:

- El interior blanco permanece como base y el panel celeste cerrado es una imagen local independiente que gira como pantalla mecánica en su propia capa; abre y cierra por el mismo eje y recorrido reversible.
- La fan de puntuación representa la rueda interna y gira alrededor del eje de `targetPosition`. La carcasa azul y el rail frontal permanecen delante y no se desplazan al ajustar la aguja.
- La aguja tiene un pivote propio en el centro del hub. Solo rota su brazo; su base no orbita ni se mezcla con el abridor.
- El abridor empieza con el gancho en la mueca izquierda, recorre el rail hasta la derecha al abrir y vuelve a la izquierda al cerrar.

La escala matemática no cambia: `targetPosition` y `needlePosition` siguen siendo enteros de `0..100`, y la puntuación continúa calculándose en `src/domain/engine.ts`. Las imágenes utilizadas proceden de las piezas locales recuperadas de la conversación `Crear SVG ruleta cerrada`; no se han añadido logotipos ni dependencias nuevas.
