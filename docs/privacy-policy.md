# Política de privacidad — Punto Medio

**Borrador editable para revisión del propietario. No publicar sin completar los campos entre corchetes.**

- Aplicación: **Punto Medio**
- Identificador Android actual: `com.puntomedio.game`
- Versión de referencia: `0.1.0`
- Fecha prevista de entrada en vigor: `[DD/MM/AAAA]`
- Responsable: `[nombre legal o persona responsable]`
- Contacto de privacidad: `[correo electrónico]`
- URL pública de esta política: `[URL HTTPS estable]`

Esta política describe el comportamiento comprobado del build actual. Si se activa publicidad, analítica, una cuenta, sincronización o cualquier otro servicio externo, esta versión deberá actualizarse antes de distribuir ese build.

## 1. Qué hace la aplicación

Punto Medio es un juego local para grupos. Permite configurar equipos, elegir categorías y tono, crear escalas personalizadas, introducir pistas y colocar una aguja para calcular una puntuación.

La aplicación actual no ofrece registro, inicio de sesión, perfil, servidor propio ni sincronización entre dispositivos. El contenido del catálogo está incluido en el paquete de la aplicación.

## 2. Datos que introduce el grupo

Durante una partida se pueden introducir:

- nombres de equipos;
- pistas escritas por los jugadores;
- extremos y tema de una escala personalizada;
- estado de la partida, ronda, puntuaciones y posiciones de la ruleta.

El build actual conserva estos datos únicamente en el almacenamiento local del dispositivo o del WebView. Se usan para continuar la partida después de una recarga o suspensión y para ejecutar el juego. No hay una función del producto que envíe esos textos a un servidor ni al sistema de anuncios actual.

El botón de compartir utiliza las funciones del sistema para compartir un texto genérico y la URL actual. No construye un enlace con los nombres de equipos, las pistas, las puntuaciones ni las escalas personalizadas. El tratamiento posterior de la URL depende de la persona que decida compartirla y de la aplicación del sistema que elija.

## 3. Almacenamiento local y borrado

La aplicación usa almacenamiento local para:

- guardar una instantánea de la partida en curso (`punto-medio-snapshot`);
- guardar la calibración visual local de la ruleta (`punto-medio-wheel-calibration-v7`).

En el flujo normal, «Jugar otra partida» elimina la instantánea de la partida, pero no necesariamente todas las preferencias de calibración. Para borrar todo el almacenamiento de la aplicación, la persona usuaria puede borrar los datos de la aplicación desde los ajustes de Android o borrar los datos del sitio/WebView desde el navegador correspondiente. La política final debe conservar esta instrucción o añadir un control visible de «Borrar todos los datos».

El manifiesto Android permite la copia de seguridad de datos de la aplicación (`android:allowBackup="true"`). El alcance real de una copia depende de la versión de Android y del dispositivo; el propietario debe decidir antes de publicar si mantiene ese comportamiento para una aplicación que puede contener nombres y pistas locales.

## 4. Red, caché y permisos

El núcleo del juego funciona sin conexión. En Android solo se declara actualmente el permiso `INTERNET`. No se solicitan ubicación, contactos, cámara, micrófono, SMS, llamadas, archivos, notificaciones ni sensores para jugar.

En la versión web/PWA, el service worker registra y almacena en caché recursos del mismo origen y permite recuperar la interfaz cuando no hay red. Esto no constituye por sí mismo una cuenta ni una base de datos remota.

La hoja de estilos actual contiene una referencia a Google Fonts (`fonts.googleapis.com` y `fonts.gstatic.com`). Mientras esa referencia exista, el navegador o WebView puede realizar solicitudes técnicas a esos dominios para cargar fuentes cuando haya conexión. Antes de publicar una política definitiva, el propietario debe elegir entre autoalojar las fuentes o documentar y evaluar expresamente esa conexión.

## 5. Publicidad y consentimiento — estado actual

El build actual usa un adaptador `NoopAds`. No incorpora un SDK de anuncios, no contiene IDs de publicidad y no solicita ni muestra anuncios. Tampoco incorpora una CMP ni un flujo de consentimiento de producción.

Por tanto, la información de esta sección es válida solo para el build que mantenga ese comportamiento.

## 6. Cambio previsto si se conecta AdMob/CMP

Si el propietario activa AdMob u otro servicio de publicidad, la aplicación podrá necesitar enviar al proveedor datos técnicos y de publicidad, que podrían incluir identificadores del dispositivo o de publicidad, dirección IP, ubicación aproximada, información de diagnóstico, impresiones, interacción con anuncios y señales necesarias para fraude o medición. La lista exacta dependerá del SDK, sus versiones, la configuración, la región y el modo de anuncios; no debe copiarse a esta política sin verificar la documentación del SDK integrado.

La integración prevista en el código solo debe inicializar un proveedor con conexión disponible y consentimiento explícito `granted`. Los estados `unknown` y `denied` deben mantener el comportamiento sin anuncios. El consentimiento debe recogerse antes de inicializar el SDK, poder retirarse o actualizarse y no debe convertirse en requisito para jugar. La aplicación no debe enviar al proveedor nombres de equipos, pistas, escalas personalizadas ni puntuaciones.

Antes de activar esa integración habrá que:

1. identificar el proveedor y las versiones exactas del SDK;
2. documentar sus categorías de datos, finalidades, conservación y destinatarios;
3. configurar la CMP para los países de distribución y probar rechazo, retirada y ausencia de red;
4. actualizar esta política, la ficha de seguridad de datos y las declaraciones de Play Console;
5. publicar la URL de esta política dentro de la aplicación y en la ficha de la tienda.

## 7. Conservación y seguridad

En el estado actual, los datos de la partida se conservan localmente hasta que se sobrescriben, se borran desde la aplicación mediante las acciones disponibles o se eliminan los datos de la aplicación/navegador. No se afirma aquí que el almacenamiento local esté cifrado.

Si se añade un backend, cuentas, analítica o publicidad, esta sección deberá indicar por separado los plazos y medidas aplicables a cada tratamiento. No se debe presentar esta política como una garantía legal de cumplimiento; el propietario debe validarla para los países donde distribuya la aplicación.

## 8. Menores y clasificación

La aplicación tiene tres tonos (`familiar`, `amigos` y `adulto`). El tono adulto y determinadas escalas pueden tratar temas de relaciones, dinero, fiesta, vino, resaca o riesgo. La audiencia y la clasificación definitivas deben basarse en una revisión humana completa del catálogo y en las respuestas presentadas a Google Play, no solo en el nombre de un selector.

La propuesta operativa para el build actual es no dirigir la aplicación a menores y usar una audiencia adulta mientras exista el tono adulto sin una separación o control de edad independiente. Esta es una decisión del propietario pendiente de confirmar.

## 9. Contacto y solicitudes

Para preguntas sobre privacidad, escribe a `[correo electrónico]`. El propietario debe completar este dato, revisar las solicitudes recibidas y aplicar el procedimiento que corresponda a los países de distribución.

## 10. Cambios de esta política

Se indicará aquí la fecha y una descripción breve de cualquier cambio relevante. Si se incorpora publicidad, CMP, cuentas, analítica, sincronización o cualquier tratamiento que cambie esta descripción, la revisión deberá hacerse antes de publicar la actualización.

## Referencias de publicación

- [User Data — Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Prepare your app for review — Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/9859455)

