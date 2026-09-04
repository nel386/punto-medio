# Informe QA

## Resultado — 2026-08-31

- Tests automatizados: 7 pasados.
- Build de producción web: correcto.
- Servidor de desarrollo: responde HTTP 200 y sirve `Punto Medio`.
- Catálogo: 20 categorías, 300 escalas, sin duplicados ni errores de estructura.
- Sincronización Capacitor Android: correcta.
- APK debug: pendiente en este entorno porque no hay JDK/`JAVA_HOME` disponible.

## Cubierto por tests

- Puntuación simétrica y límites 0–4.
- Límites de la zona secreta.
- Generación de posiciones.
- No repetición de escalas.
- Conteo y estructura del catálogo.
- IDs y tonos válidos.

## Pendiente antes de producción

- Prueba manual en dispositivos Android reales.
- Revisión humana completa del contenido.
- Sustituir `NoopAds` por el proveedor aprobado y configurar consentimiento.
- Generar iconos y completar la ficha de Play Store.
