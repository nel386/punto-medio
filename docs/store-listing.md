# Ficha de Google Play — Punto Medio

Estado: borrador de ficha y auditoría de materiales. La implementación actual es la fuente de verdad para el copy.

## Copy listo para la ficha

### Nombre de la aplicación

**Punto Medio**

### Descripción breve

> Pistas, debate y una aguja: acercaos al punto medio en un solo móvil.

69 caracteres. No usa promesas de posición, premios, popularidad ni funciones online.

### Descripción completa

> ¿Dónde está tu punto medio?
>
> En Punto Medio, una persona ve una zona secreta en una escala y da una pista. El resto del grupo debate qué significa y coloca la aguja donde cree que encaja. Al revelar la zona, descubrís qué tan cerca habéis estado.
>
> Jugad juntos en un solo móvil:
>
> - Juego local pass-and-play, sin cuentas ni registro.
> - Funciona sin conexión una vez instalada la aplicación.
> - Tres modos: Clásico, Modificadores y A vuestra medida.
> - 20 categorías y 300 escalas editoriales para elegir.
> - Tres tonos para adaptar la partida: Familiar, Amigos y Adulto.
> - Entre 2 y 6 equipos, con rondas configurables.
> - Escalas personalizadas: inventad los dos extremos y añadid un tema opcional.
> - Marcador de la partida y puntuación al descubrir el resultado.
>
> En Clásico, todo gira alrededor de una buena pista y de cómo la interpreta el grupo. En Modificadores, cada ronda añade una regla breve para dar la pista. En A vuestra medida, el grupo crea su propia escala para convertir una broma interna, un plan o una discusión en una ronda.
>
> Elegid categorías, preparad los equipos, pasad el móvil y defended vuestro punto. La partida se guarda localmente para poder retomarla en el mismo dispositivo.

### Categoría recomendada

**Juegos → Juegos de mesa**

Es la categoría que mejor describe un juego social de escalas, pistas y debate que se juega en grupo alrededor de un dispositivo.

### Etiquetas y términos de descubrimiento propuestos

Usar solo las etiquetas que estén disponibles con ese significado en Google Play Console; no introducirlas como promesas adicionales en el texto si la consola no las ofrece.

- Juego de fiesta
- Multijugador local
- Juego social
- Juegos de mesa
- Casual
- Sin conexión / offline

## Propuesta de valor

**Punto Medio convierte una opinión difícil de colocar en una conversación rápida, visual y compartida.** Una sola pantalla organiza el turno, protege la zona secreta, da espacio al debate y revela el resultado en el momento justo. No requiere cuentas, servidores, sincronización entre dispositivos ni preparación previa.

## Texto sugerido para las capturas

Las líneas son overlays de tienda; la interfaz debe seguir mostrando el producto real y no una recreación promocional.

| Nº | Estado que debe mostrarse | Titular de la captura | Línea de apoyo |
|---:|---|---|---|
| 1 | Configuración inicial | **Tres formas de jugar** | Clásico, Modificadores y A vuestra medida en un solo móvil. |
| 2 | Selección de categorías | **Elegid el menú del debate** | 20 categorías y 300 escalas para preparar la partida. |
| 3 | Zona secreta abierta | **Solo quien da la pista puede mirar** | Descubre la zona, piensa una pista y tapa la ruleta. |
| 4 | Pantalla de entrega | **Pasa el móvil** | La zona ya está oculta. Ahora empieza el debate. |
| 5 | Colocación de la aguja | **¿Dónde colocaríais la aguja?** | Una pista. Muchas interpretaciones. |
| 6 | Modificadores o escala personalizada | **Cambiad la regla o inventad los extremos** | Más variedad para cada grupo y cada ronda. |
| 7 | Revelación y marcador | **Descubrid el resultado** | La zona y la puntuación aparecen al final. |

No usar titulares como «número 1», «el mejor», «imprescindible», «viral», «sin límites», «gana premios» o equivalentes. Tampoco mostrar clasificaciones globales, funciones online, cuentas, premios, anuncios o compras que no formen parte del producto actual.

## Notas para el vídeo de la ficha

Vídeo breve, en español, centrado en el flujo real de una partida local. Duración orientativa: 20–30 segundos.

1. Abrir en la configuración y mostrar los tres modos.
2. Elegir una categoría y un tono; mostrar que hay varias categorías disponibles.
3. Mostrar a la persona que da la pista descubriendo la zona secreta.
4. Ocultar la zona y pasar físicamente el móvil a las demás personas.
5. Mostrar el debate y el ajuste de la aguja.
6. Revelar la zona y el resultado; cerrar con el nombre **Punto Medio**.

Mantener visible que se juega en un único dispositivo. Usar texto de apoyo neutro: «Elegid una escala», «Dad una pista», «Debatid», «Colocad la aguja», «Revelad el resultado». No enseñar la posición secreta antes de la entrega ni sugerir que la aplicación valida una respuesta objetiva. No afirmar que existe multijugador online, ranking, cuenta, contenido descargable, IA, premios o conexión permanente. El audio y cualquier texto superpuesto deben tener una versión legible sin sonido.

## Auditoría de assets existentes

### Materiales requeridos

| Material | Estado | Evidencia / decisión |
|---|---|---|
| Icono de aplicación PNG 512×512 | **Falta** | `public/icon.svg` tiene un `viewBox` de 512×512 y sirve como fuente de exportación, pero no hay un PNG de 512×512 listo para subir. Los `ic_launcher*.png` de Android son recursos rasterizados de 48–192 px, no el entregable de tienda. |
| Feature graphic 1024×500 | **Falta** | No hay ningún archivo con esa composición o dimensiones. Debe crearse con la marca y la ruleta, sin texto que dependa de una función inexistente. |
| Capturas de la ficha | **Parcial; falta el set final** | Hay evidencias visuales en `design-audit/`, pero no una exportación aprobada y ordenada para Google Play. |
| Vídeo de ficha | **Falta** | No hay un vídeo final en el repositorio; grabar el flujo descrito arriba cuando la build candidata esté cerrada. |

### Capturas que sí existen como referencia

- `design-audit/final-03-open.png`: ruleta abierta y zona secreta.
- `design-audit/final-05-guess.png`: debate y colocación de la aguja.
- `design-audit/final-06-revelation.png`: revelación.
- `design-audit/final-06-mobile-guess-390.png` y `design-audit/final-07-mobile-result-390.png`: referencias móviles muy verticales; normalizar o volver a capturar antes de subir.
- El resto de `design-audit/final-*.png` y `design-audit/review6-*.png` son material de revisión, no un set de tienda aprobado.

### Capturas que faltan o deben volver a capturarse

- Configuración con los tres modos visibles.
- Selección de categorías y tonos.
- Estado de Modificadores con un modificador real.
- Estado de A vuestra medida con los dos extremos introducidos.
- Entrega del móvil con la zona ya oculta.
- Revelación y marcador final con copy legible.
- Una captura que evidencie el uso sin conexión, solo si la pantalla mantiene un estado claro y no se convierte en una promesa visual confusa.
- Set final con el mismo dispositivo, escala visual consistente, sin overlays de QA y con textos revisados.

## Checklist de materiales y datos de publicación

- [ ] Confirmar nombre, descripción breve y descripción completa de esta versión.
- [ ] Exportar `public/icon.svg` como PNG 512×512 y revisar el recorte seguro del símbolo.
- [ ] Crear el feature graphic 1024×500.
- [ ] Capturar y seleccionar el set final de pantallas; cubrir configuración, categorías, modos, pass-and-play, colocación y revelación.
- [ ] Grabar el vídeo opcional de ficha siguiendo el flujo indicado.
- [ ] Confirmar categoría y disponibilidad real de las etiquetas en Play Console.
- [ ] Publicar la política de privacidad y completar el formulario de seguridad de datos con el comportamiento de la build candidata.
- [ ] Completar clasificación de contenido, público objetivo y adecuación de los tonos `Familiar`, `Amigos` y `Adulto`.
- [ ] Añadir correo de contacto y datos de asistencia de la ficha.
- [ ] Ejecutar la lista técnica de `docs/release-checklist.md`, especialmente la prueba en modo avión, la revisión humana de las 20 categorías y la verificación de permisos.

## Decisiones de copy pendientes

1. Confirmar si el nombre visible seguirá siendo **Punto Medio** o si se añadirá un descriptor local; la recomendación es conservar el nombre corto actual.
2. Elegir la exportación definitiva del icono: usar el símbolo del SVG actual o preparar una variante específica para el recorte adaptativo de Android.
3. Confirmar si el tono **Adulto** se presenta como filtro editorial de conversación o si requiere una clasificación de edad distinta; el copy no debe insinuar contenido explícito hasta cerrar esa revisión.
4. Validar en Play Console la categoría y las etiquetas disponibles en el país de distribución.
5. Decidir si se publica vídeo en la primera versión. Si se publica, debe grabarse con la build candidata y mostrar únicamente funciones presentes.

## Guardrails de publicación

La ficha no debe prometer cuentas, juego online, sincronización entre dispositivos, rankings globales, recompensas, premios, contenido generado por IA, contenido descargable durante la partida ni conexión permanente. El término «marcador» se refiere únicamente al marcador local de la partida actual. La mención «sin conexión» describe el juego y el catálogo incluidos en la instalación; no implica que una futura integración de anuncios o servicios externos sea necesaria para jugar.
