# UX/UI móvil — Party game de escalas

## Objetivo de experiencia

Diseñar un juego social español, inmediato y fácil de entender en un solo móvil. La interfaz debe favorecer la conversación entre personas presentes: el teléfono organiza el turno, protege la zona secreta y revela el resultado con suficiente dramatismo, pero nunca sustituye el debate.

Principios:

- **Primero la mesa:** controles grandes, poco texto y pausas claras para hablar.
- **Privacidad comprensible:** debe quedar claro quién puede mirar la pantalla.
- **Una decisión por pantalla:** cada estado tiene una acción principal visible.
- **Humor sin juicio:** el resultado celebra la diferencia de opiniones; no corrige a quien da la pista.
- **Offline de verdad:** jugar, reanudar y consultar categorías no depende de conexión.

## Flujo de pantallas

### 1. Inicio

Mostrar nombre del juego y la frase “Adivina dónde está la aguja”. La acción primaria es **Jugar**; las secundarias son **Cómo se juega**, **Categorías y tono** y **Ajustes**. No mostrar anuncios en el inicio.

Si existe una partida local guardada, ofrecer **Continuar partida** con modo, ronda y equipos, pero sin revelar escala, pista ni zona. La falta de conexión nunca bloquea el inicio.

### 2. Configuración de partida

Orden de configuración:

1. Elegir **Clásico**, **Modificadores** o **Escala personalizada**.
2. Elegir uno o varios tonos: **Familiar**, **Amigos** y/o **Adulto**; debe quedar siempre al menos uno activo.
3. Elegir una o varias categorías, con opción **Todas** y contador visible.
4. Crear entre 2 y 6 equipos; nombres editables.
5. Elegir 5, 10 o 15 rondas; preseleccionar 10.
6. Confirmar con **Empezar partida**.

El selector de tono debe estar siempre visible en esta pantalla y al editar una partida. Explicaciones breves:

- **Familiar:** apto para niños y familia.
- **Amigos:** más personal, absurdo o competitivo.
- **Adulto:** temas y humor para mayores de edad.

Los tonos filtran las escalas y los modificadores antes de empezar. Si se combinan, se usa la unión exacta de los tonos seleccionados. Si una combinación no tiene contenido, explicar el motivo y sugerir **Todas las categorías**, sin cambiar la selección en silencio.

En **Escala personalizada**, sustituir categorías por dos campos: extremo izquierdo y extremo derecho. Validar que ambos estén completos y sean distintos.

### 3. Presentación del turno

Mostrar solo el equipo activo y el progreso: “Turno de Los Improvisados · Ronda 3 de 10”. La acción primaria es **Pasar el móvil**. Antes de mostrar la zona, pedir al resto que aparte la mirada.

### 4. Zona secreta — quien da la pista

Mostrar la etiqueta **SOLO PARA QUIEN DA LA PISTA**, la escala horizontal, la zona correcta resaltada sin posición numérica y, si corresponde, el modificador. La acción primaria es **Ya tengo la pista**.

La pista se da en voz alta; no se pide escribirla, para evitar que aparezca en pantalla y mantener el ritmo. `targetPosition` se usa internamente, pero la vista secreta solo muestra la zona.

### 5. Handoff del móvil

Después de **Ya tengo la pista**, mostrar una pantalla opaca de transición:

- “Pasa el móvil al resto del equipo”.
- “La persona que dio la pista ya no debe mirar”.
- Botón **Listos, colocar aguja**.

El handoff debe ser una pantalla completa, no un modal pequeño. Si la app se suspende, se reanuda en esta pantalla sin mostrar la zona.

### 6. Debate y colocación

Mostrar los extremos, el equipo que decide y una aguja grande que pueda colocarse pulsando en cualquier punto o arrastrándola. Mostrar **Bloquear aguja** y un control secundario **Volver a debatir** que no cambia la posición.

No mostrar el valor numérico ni la zona mientras se debate. Al bloquear, confirmar “¿Esta es vuestra apuesta?” con **Cambiar** y **Revelar resultado**.

### 7. Revelación y puntuación

Mostrar primero la aguja del equipo y después la zona real con una animación breve. Presentar la puntuación de 0 a 4 según `ScoreBand`, un comentario lúdico y **Siguiente ronda**. `revealed` pasa a `true` solo en esta pantalla.

Reservar la pausa posterior a la puntuación para publicidad. Nunca insertar publicidad durante la pista, el handoff, el debate o la colocación.

### 8. Marcador y final

El marcador persistente muestra equipos, puntos, ronda y turno sin saturar la pantalla. Al terminar, celebrar al ganador sin ridiculizar al último y ofrecer **Jugar otra vez**, **Cambiar configuración** y **Volver al inicio**.

La pantalla final o la transición entre rondas son los únicos puntos válidos para interstitial, siempre que haya conexión, consentimiento válido y frecuencia limitada. Continuar jugando nunca depende de ver un anuncio.

## Estados de privacidad de la zona secreta

La UI debe modelar explícitamente estos estados:

| Estado | Quién mira | Qué se muestra | Acción principal |
|---|---|---|---|
| `secret-ready` | Solo quien da la pista | Escala, zona y modificador | Ya tengo la pista |
| `handoff` | Nadie debe mirar | Pantalla opaca e instrucciones | Listos, colocar aguja |
| `guessing` | Resto del equipo | Escala y aguja, sin zona | Bloquear aguja |
| `locked` | Resto del equipo | Apuesta congelada, sin zona | Revelar resultado |
| `revealed` | Todo el grupo | Zona y aguja superpuestas | Siguiente ronda |

El paso de `secret-ready` a `handoff` es irreversible desde la UI de esa ronda. El botón atrás no debe devolver a la zona secreta; debe pedir confirmación para abandonar o conservar la pantalla segura de handoff.

Al suspender y reanudar:

- `secret-ready`: pedir confirmar “Soy quien da la pista” antes de volver a mostrar la zona.
- `handoff`: reanudar la pantalla opaca.
- `guessing` o `locked`: conservar la apuesta sin revelar.
- `revealed`: conservar el resultado.

No mostrar el nombre de la escala en notificaciones, historial, miniaturas ni pantalla de reanudación. La vista de colocación no debe tener acceso visual a `targetPosition` antes de `revealed`.

## Modos y variedad

### Clásico

Escala, zona, pista libre, debate, aguja y revelación.

### Modificadores

Mostrar un modificador por ronda en la pantalla secreta y repetirlo en pequeño durante el debate, sin revelar la zona. Debe cambiar la forma de dar la pista, no añadir pasos técnicos. Ejemplos: “Descríbelo como un anuncio de televisión”, “Solo puedes usar una comparación”, “No uses nombres propios” o “Da una pista con dos interpretaciones razonables”. Solo seleccionar modificadores cuyo `compatibleModes` incluya el modo activo.

### Escala personalizada

Permitir extremos escritos por el grupo antes de la ronda. La zona se genera internamente y sigue oculta para quien coloca la aguja. El tono permanece visible para filtrar modificadores, pero nunca reescribe los extremos introducidos por el grupo.

## Accesibilidad

- Contraste mínimo WCAG AA; no depender solo del color para distinguir zona, aguja o puntuación.
- Usar patrones, etiquetas y leyendas: zona con trama, aguja con forma y texto “zona correcta”.
- Áreas táctiles de al menos 44 × 44 dp y separación suficiente.
- Nombres accesibles en español y orden lógico de foco para todos los controles.
- La pantalla secreta debe anunciar “contenido privado” antes de la escala.
- Soportar tamaño de texto hasta 200 % sin ocultar la acción primaria ni cortar extremos.
- Respetar `prefers-reduced-motion` y el ajuste de movimiento reducido de Android.
- Ofrecer alternativa estática a la animación de revelación.
- Sonido y vibración, si existen, deben ser opcionales y nunca la única señal de estado.
- Copy directo: “Pasar el móvil”, “Bloquear aguja” y “Revelar resultado”.

## Responsive web y Android

Diseñar primero para 320–430 px de ancho y 568–932 px de alto. En web, limitar el contenido a una columna de 520 px y centrarla en pantallas grandes. Mantener escala y acción primaria en la zona cómoda del pulgar, usar `min-height: 100dvh`, respetar safe areas y no colocar controles esenciales bajo la barra del navegador.

La orientación vertical es la principal. Si una vista necesita horizontal, mostrar una indicación breve y reversible. En Android, tratar barras de estado y navegación como espacio protegido.

En ambos canales, `GameSession` debe sobrevivir a recarga, suspensión y rotación conservando ronda, equipo, escala, pista, apuesta y revelación. Web y app comparten jerarquía, textos, reglas visuales y JSON; solo difieren las integraciones de plataforma y anuncios.

## Dirección visual

Personalidad: **bar de amigos + concurso televisivo + humor absurdo español**. Debe ser expresiva y memorable, pero legible mientras varias personas miran el mismo móvil.

- Fondo oscuro cálido: azul tinta o berenjena profunda.
- Tarjetas crema o marfil para mejorar lectura.
- Coral, mostaza y turquesa para acciones, equipos y celebración.
- Sans redondeada para titulares y tipografía muy legible para instrucciones.
- Bordes suaves y detalles de pegatina; evitar una estética infantil excesiva.
- La escala es el objeto protagonista: extremos grandes, eje despejado y aguja gruesa.
- La zona secreta debe parecer un secreto, no una barra de progreso.
- Revelación con expansión o destello corto; no usar confeti que tape el resultado.
- Iconos simples, rellenos y con etiqueta en acciones críticas.
- Copy en español natural, con “vosotros” y frases breves.

El significado debe mantenerse aunque se eliminen animación, color o sonido. El humor vive en las escalas, modificadores y comentarios, no en dificultar la lectura.

## Decisiones y riesgos UX

**Decisiones:** pass-and-play en un dispositivo; quien da la pista no escribe; la aguja se coloca con toque o arrastre; la zona usa estados explícitos; los tonos se eligen antes de jugar; publicidad solo entre rondas o al final; sin red, la partida sigue funcionando.

**Riesgos y mitigaciones:** el handoff puede fallar si alguien mira pronto; usar pantalla opaca y copy explícito. El tono adulto puede generar dudas; mantener etiquetas persistentes y confirmación visible. Muchas categorías pueden fatigar la elección; ofrecer **Todas** y un contador claro. La escala puede quedar pequeña; usar columna adaptable, extremos que se ajustan y texto ampliable.

## Criterios de validación

- Una persona nueva inicia una ronda tras leer **Cómo se juega**, sin explicación adicional.
- En pruebas de pase, ningún participante ve la zona desde la colocación.
- Se completa una partida con una mano en un móvil pequeño y con texto ampliado.
- El grupo identifica quién da la pista, quién coloca la aguja y cuándo se revela.
- Cada tono se entiende antes de seleccionarlo y no se filtra contenido de otro tono.
- Al desconectar la red, la partida sigue siendo jugable y la ausencia de anuncios no altera el flujo.
- El resultado invita a debatir, sin presentar una respuesta objetivamente correcta.
