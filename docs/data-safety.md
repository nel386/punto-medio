# Google Play — Data Safety de Punto Medio

**Borrador editable para el formulario de Play Console.** Las respuestas finales deben coincidir con el AAB concreto, sus dependencias, la política de privacidad publicada y la configuración por región.

## Estado comprobado del build actual

| Área | Estado actual | Propuesta para este build |
| --- | --- | --- |
| Cuenta o inicio de sesión | No existe | No declarar datos de cuenta |
| Datos introducidos por jugadores | Nombres, pistas, escalas personalizadas y partida | No recopilados si permanecen solo en el dispositivo |
| Red propia / backend | No existe | No declarar servidor propio |
| SDK de anuncios | No instalado; se usa `NoopAds` | Anuncios: **No** |
| CMP | No instalada | No declarar consentimiento de publicidad todavía |
| Analítica, crash reporting o tracking | No hay dependencia ni llamada identificada | No declarar |
| Permisos Android | `INTERNET` | No hay permiso sensible o de alto riesgo identificado |
| Caché offline | Service worker y almacenamiento local | No confundir caché local con recopilación remota |

### Respuesta propuesta ahora

> **¿La aplicación recopila o comparte datos de usuario?** No, para el AAB que mantenga el comportamiento local actual y no transmita datos fuera del dispositivo como parte de una función o SDK integrado.

> **¿La aplicación contiene anuncios?** No.

> **¿Hay datos que se puedan borrar?** No hay datos de usuario almacenados en un servidor ni una cuenta que borrar. La partida local puede reiniciarse y los datos de la aplicación/navegador pueden eliminarse desde los ajustes del sistema. No afirmar que existe un borrado completo dentro de la interfaz hasta añadirlo, porque la calibración local puede permanecer.

> **¿Los datos están cifrados en tránsito?** No responder por la mera presencia de `INTERNET`. En el flujo actual no se envían los textos de la partida a un backend; la respuesta final del formulario debe seguir exactamente las opciones que muestre Play Console para los datos declarados y la auditoría del AAB.

## Matriz de datos del juego

| Datos | Ejemplos reales | Finalidad | Obligatorio | Estado Play propuesto |
| --- | --- | --- | --- | --- |
| Contenido generado por el usuario / texto | Nombre de equipo, pista, extremos y tema personalizado | Funcionalidad del juego | Parte del flujo, con campos opcionales | No recopilado: solo almacenamiento local |
| Actividad de la aplicación | Ronda, puntuación, posición de aguja y estado | Funcionalidad del juego y recuperación tras recarga | Sí para continuar la partida | No recopilado: solo almacenamiento local |
| Identificadores de dispositivo o publicidad | Ninguno en el código/SDK actual | — | — | No |
| Ubicación | Ninguna | — | — | No |
| Contactos, cámara, micrófono, SMS o llamadas | Ninguno | — | — | No |
| Diagnósticos, analítica o crash reports | Ninguno identificado | — | — | No |

Esta matriz no convierte automáticamente el resultado en una declaración aprobada. Antes de enviarla, revisar el AAB final, el árbol de dependencias, el tráfico de red y cualquier configuración de release.

## Punto de atención: Google Fonts

La hoja de estilos referencia actualmente `fonts.googleapis.com` y `fonts.gstatic.com`. Es una conexión técnica de recursos que no pertenece al juego ni a `NoopAds`, pero puede implicar tratamiento técnico por el servicio remoto en la versión web o en el WebView con red.

Decisión necesaria antes de cerrar Data Safety:

- [ ] autoalojar las fuentes y verificar que el AAB no hace esa conexión;
- [ ] mantenerlas y documentar/evaluar la conexión con la versión publicada y la política aplicable.

La propuesta «no recopilado/no compartido» de este documento está condicionada a resolver este punto y a confirmar que no existe otra transmisión en el build de producción.

## Declaraciones propuestas cuando se active AdMob/CMP

No rellenar estas filas en Play Console antes de integrar y auditar el SDK exacto. Son un mapa de trabajo, no una afirmación sobre una integración que todavía no existe.

| Posible categoría futura | Posible finalidad | Compartida con | Estado |
| --- | --- | --- | --- |
| Identificadores de dispositivo o publicidad | Publicidad, medición o prevención de fraude | Proveedor de anuncios | Verificar SDK, versión, configuración y región |
| Información de diagnóstico | Funcionamiento, rendimiento o prevención de fraude | Proveedor de anuncios, si aplica | Verificar documentación y configuración |
| Actividad/interacción con anuncios | Publicidad y medición | Proveedor de anuncios | Verificar qué eventos registra el SDK |
| Dirección IP / ubicación aproximada | Entrega contextual, seguridad o medición, si aplica | Proveedor de anuncios | Verificar finalidad y declaración exacta |

Para el futuro build, la respuesta de «anuncios» pasaría a **Sí** si se muestran anuncios. La política y Data Safety tendrían que cubrir también la CMP y los datos de terceros. No asumir que el consentimiento elimina toda obligación de declarar el tratamiento: depende de la forma en que el SDK procese y transmita los datos.

## Control de cambios obligatorio

Antes de cada release con publicidad o cualquier servicio nuevo:

- registrar dependencias y versiones del AAB;
- revisar el Play SDK Index y la documentación del SDK;
- capturar el tráfico con consentimiento desconocido, denegado y concedido;
- confirmar que `unknown`/`denied` no inicializan el proveedor;
- confirmar que la partida sigue funcionando offline y sin consentimiento;
- actualizar la política de privacidad, esta matriz y el formulario de Play Console en conjunto.

Google Play exige que la sección Data Safety sea exacta y coherente con la política de privacidad, también respecto de SDKs de terceros. [Fuente oficial: User Data — Play Console Help](https://support.google.com/googleplay/android-developer/answer/10144311).

