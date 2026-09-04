# Google Play — App content de Punto Medio

**Borrador de respuestas y notas para el propietario.** No sustituye el cuestionario real de Play Console ni la revisión editorial del catálogo.

## Datos básicos para la revisión

| Campo | Propuesta |
| --- | --- |
| Nombre | Punto Medio |
| Paquete Android | `com.puntomedio.game` |
| Tipo | Juego social local / pasatiempo para grupos |
| Inicio de sesión | No existe |
| Contenido restringido | No existe; el juego principal está accesible sin cuenta |
| Conexión necesaria | No para jugar; la versión actual puede cargar recursos externos cuando hay red |
| Permisos relevantes | Solo `INTERNET` en el manifiesto actual |
| Anuncios en la versión actual | No |
| Anuncios si se activa AdMob | Sí, y actualizar esta declaración antes de publicar |

## 1. Acceso para el revisor

Texto propuesto para el campo de instrucciones:

> No se necesita cuenta, registro, contraseña ni código de acceso. Instale y abra Punto Medio. En la pantalla inicial pulse «Preparar partida», mantenga el modo «Clásico», deje las categorías seleccionadas, confirme dos equipos y pulse «Empezar partida». Pulse «Destapar la ruleta», introduzca una pista y pulse «Tengo la pista». Pulse «Ya lo tenemos», coloque la aguja y pulse «Bloquear aguja» para ver el resultado. Desde ahí puede elegir «Siguiente ronda» o «Terminar partida».
>
> El juego principal no necesita red y puede probarse con el dispositivo sin conexión. No hay áreas reservadas para usuarios autenticados ni contenido que requiera credenciales del propietario.

Si se publica un build con CMP o anuncios, añadir instrucciones reproducibles para el revisor: comportamiento esperado con consentimiento rechazado, cómo volver a abrir las preferencias de consentimiento y cómo identificar anuncios de prueba. No entregar credenciales personales ni usar IDs de producción en pruebas.

## 2. Declaración de anuncios

### Build actual

**Respuesta propuesta: No contiene anuncios.**

Motivo verificable: `src/platform/ads.ts` exporta `ads` como `new NoopAds()`, no hay SDK de anuncios ni IDs en las dependencias o en el manifiesto, y las llamadas de interstitial no producen una pantalla publicitaria en este build.

### Futuro build con AdMob

**Respuesta propuesta: Sí contiene anuncios**, únicamente cuando el SDK y los IDs aprobados estén integrados y realmente se muestren anuncios.

Condiciones de release:

- CMP y consentimiento antes de inicializar el SDK cuando sea necesario;
- rechazo o retirada de consentimiento sin bloquear la partida;
- anuncios de prueba durante desarrollo;
- filtros de contenido publicitario coherentes con la clasificación de la aplicación;
- declaración de los datos del SDK en Data Safety y en la política de privacidad;
- prueba de ausencia de red, falta de inventario, fallo del SDK y regreso desde el anuncio.

## 3. Audiencia objetivo

### Propuesta conservadora para el estado actual

- **No diseñada para niños.**
- Seleccionar únicamente la franja adulta disponible en el formulario si el propietario mantiene el tono `adulto` y el catálogo actual.
- No marcar grupos de edad infantil solo porque exista un tono llamado «familiar».
- No afirmar «apta para todas las edades» sin completar la revisión humana de las 300 escalas.

Razón editorial: el producto permite elegir un tono adulto y el catálogo incluye, entre otros, temas de relaciones, dinero y estatus, fiesta, vino, resaca, rupturas y riesgo. La selección final de audiencia es una decisión del propietario; si se desea incluir menores, habrá que separar o retirar el contenido maduro, revisar los anuncios y volver a contestar los formularios.

## 4. Clasificación de contenido — respuestas de trabajo

Play Console/IARC asigna las clasificaciones a partir del cuestionario. Estas respuestas son una prelectura del repositorio y no una clasificación final.

| Pregunta o dimensión | Propuesta provisional | Condición |
| --- | --- | --- |
| ¿Es un juego? | Sí | El flujo principal es una partida con rondas y puntuación |
| Violencia | No identificada en la revisión estática | Confirmar escala por escala |
| Sexualidad o desnudez | No identificada en la revisión estática | Confirmar escala por escala |
| Lenguaje malsonante | No identificado en la revisión estática | Confirmar escala por escala |
| Alcohol | Puede haber referencias leves en contenido adulto, como vino, fiesta o resaca | Marcar según el texto exacto del cuestionario y el catálogo publicado |
| Drogas | No identificadas en la revisión estática | Confirmar escala por escala |
| Apuestas con dinero real | No | La puntuación es parte del juego y no hay dinero, premios ni compras en el flujo actual |
| Compras dentro de la aplicación | No identificadas | Confirmar configuración de Play antes de enviar |
| Interacción entre usuarios | Juego presencial local; no hay chat, perfil ni publicación online | Describir como interacción local, no como comunidad pública |
| Contenido generado por usuarios | El grupo puede escribir nombres, pistas y escalas, pero no se publican ni se comparten desde el servicio | Responder según la definición exacta que muestre IARC; no ocultar los campos de texto |
| Anuncios | No en el build actual; sí si se activa AdMob | Debe coincidir con la declaración de anuncios |

No usar estas filas para justificar una edad numérica sin ejecutar el cuestionario oficial tras la revisión humana. Cualquier cambio del catálogo, del tono adulto o de los anuncios puede cambiar las respuestas.

## 5. Privacidad y seguridad en la ficha

- Enlazar una URL HTTPS pública a `docs/privacy-policy.md` una vez publicada y completada.
- Hacer que la política sea accesible también desde la aplicación o una pantalla enlazada en la ficha.
- Mantener Data Safety y esta política sincronizados.
- No declarar cifrado de datos locales: el código usa `localStorage` y no demuestra cifrado.
- No declarar una cuenta ni un mecanismo de borrado de cuenta: no existe cuenta. Documentar el borrado local y decidir si se añade un control de borrado total.
- Revisar `android:allowBackup="true"` antes de decidir qué se comunica sobre datos locales.

## 6. Pendientes del propietario antes de enviar

- [ ] Completar responsable, correo, fecha y URL pública de la política.
- [ ] Decidir si la audiencia adulta es la intención oficial o si se revisará el catálogo para una audiencia más amplia.
- [ ] Hacer revisión humana completa de todas las escalas y registrar la versión revisada.
- [ ] Resolver la referencia a Google Fonts: autoalojar o documentar/evaluar la conexión.
- [ ] Decidir si se desactiva la copia de seguridad Android o se conserva con una explicación adecuada.
- [ ] Confirmar el contenido final del AAB y las declaraciones de permisos.
- [ ] Si se añade AdMob/CMP: completar integración, consentimiento, IDs de prueba/producción, Data Safety, política y declaración de anuncios antes de publicar.

## Referencias oficiales

- [Prepare your app for review — Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/9859455)
- [Content rating requirements — Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/9859655)
- [Google Play Families Policies](https://support.google.com/googleplay/android-developer/answer/9893335)
- [User Data / Data Safety — Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/10144311)

