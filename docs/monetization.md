# Monetización y consentimiento

La integración está aislada detrás de `AdsPort`. La lógica de la partida no conoce AdMob, AdSense, identificadores de dispositivo ni estados de consentimiento.

## Estado actual

- El build distribuido usa `NoopAds`: no carga SDK, no solicita anuncios y no transmite datos a un proveedor.
- `ConsentAwareAds` define el contrato seguro para una futura implementación de `AdsProvider`, pero no activa ningún proveedor por sí solo.
- No hay IDs de AdMob, configuración de Google Mobile Ads ni flujo de consentimiento de producción en este repositorio.

## Política de inserción

Los únicos slots válidos son `between-rounds` y `end-game`.

- `between-rounds`: se solicita al pulsar «Siguiente ronda», después del resultado y antes de preparar la siguiente ronda.
- `end-game`: se solicita al terminar la partida, ya en la salida al marcador final.
- No se solicita publicidad durante la pista, el debate, la colocación de la aguja, la animación de apertura/cierre, el revelado ni el resultado inmediato.
- La progresión no espera a que se muestre o cierre un anuncio. Un proveedor sin inventario, lento o fallido equivale a no mostrar nada.

La política conservadora actual limita los interstitials a uno por sesión y aplica un enfriamiento de dos minutos si el límite de sesión se amplía en una futura configuración. No se utiliza rewarded actualmente; si se incorpora, debe ser siempre opcional y no puede ser requisito para continuar.

## Consentimiento y privacidad

El adaptador solo puede llamar al proveedor cuando se cumplen simultáneamente estas condiciones:

1. consentimiento explícito `granted`;
2. conexión disponible;
3. inicialización del proveedor completada;
4. slot permitido por el producto y por la frecuencia configurada.

`unknown` y `denied` son estados sin anuncios. El consentimiento debe recogerse antes de inicializar el SDK y debe poder retirarse. No se deben enviar nombres de equipos, pistas, escalas, puntuaciones ni contenido personalizado al proveedor. La app no necesita permisos de ubicación, contactos, micrófono, cámara, almacenamiento o notificaciones para jugar.

El manifiesto Android actual declara únicamente `INTERNET`, necesario solo para recursos y un proveedor futuro. En web no se piden permisos del navegador. La hoja de estilos todavía importa fuentes desde Google Fonts; antes de una publicación con requisitos estrictos de privacidad hay que autoalojarlas o documentar esa conexión como recurso no esencial y bloquearla hasta resolver la política aplicable.

## Paso de proveedor real

Antes de sustituir `NoopAds`:

- elegir AdMob para Android y una solución web compatible, con sus SDKs oficiales y revisión de sus términos;
- crear IDs separados de prueba y producción por plataforma y formato;
- añadir el SDK y su configuración nativa solo en el proyecto de release aprobado;
- integrar una CMP/consent manager compatible con la región de distribución y el estado `AdsConsent`;
- usar anuncios de prueba en desarrollo, nunca IDs de producción;
- probar ausencia de red, consentimiento denegado, retirada de consentimiento, falta de inventario y fallo del SDK;
- revisar la ficha de privacidad y las declaraciones de datos de Google Play/App Store antes de publicar.

Hasta completar esos pasos, el comportamiento correcto es local y sin anuncios.

## Edad, tono y contenido

El selector distingue tono `familiar`, `amigos` y `adulto`, pero el contenido debe pasar revisión humana antes de publicar. La monetización no debe perfilar por edad ni inferirla a partir del tono elegido. Si se usan herramientas de IA para generar o revisar escalas, cada lote debe tener revisión humana de seguridad, sesgos, sexualización, violencia, datos personales y adecuación a la clasificación de edad; la IA no es una aprobación editorial ni legal.
