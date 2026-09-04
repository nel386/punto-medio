# Auditoría final de release — Punto Medio

Fecha de ejecución: 2026-09-04  
Alcance: build web, tests unitarios, E2E desktop/mobile, sincronización Capacitor, permisos/manifest, offline, versión y coherencia documental.

## Estado ejecutivo

**NO GO para cerrar release móvil/web todavía.** La funcionalidad principal y el bundle pasan, pero hay un fallo reproducible de responsive en 320×800 y 390×844, y no se pudo generar/verificar el APK porque el entorno no tiene JDK ni un dispositivo/emulador conectado. El smoke offline real de navegador sí pasa después de la precarga inicial.

## Resultados ejecutados

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| `npm test` | PASS | 3 archivos, 16/16 tests; Vitest no recoge `tests/e2e/**` por `vitest.config.ts`. |
| `npm run test:e2e` | PASS | 4/4: 2 en proyecto `desktop` y 2 en proyecto `mobile`. |
| `npm run build` | PASS | TypeScript y Vite completan; 1.601 módulos transformados; JS 223.46 kB y CSS 37.76 kB antes de gzip. |
| `npm run android:sync` | PASS | Build web y copia a `android/app/src/main/assets/public` completadas. |
| Reproducibilidad | PASS | Dos builds consecutivos producen los mismos 20 archivos, tamaños y hashes SHA-256. |
| Paridad web/Android | PASS | Los hashes de `dist/` y de los assets sincronizados coinciden; 0 discrepancias. |
| Smoke navegador offline | PASS con condición | El script `scripts/android-qa-browser.mjs` pasa reload offline, service worker, persistencia tras reload y flujo completo. La primera precarga se hizo online. |

## Hallazgos

### P0 — Overflow horizontal real en viewport móvil

El smoke real detecta:

- 320×800: `scrollWidth=462` (`innerWidth=320`).
- 390×844: `scrollWidth=462` (`innerWidth=390`).
- El desbordamiento está en `.settings-main`, `.section-heading`, `.mode-grid` y las tarjetas de modo.
- La tarjeta fija de inicio sí llega al borde inferior en ambos viewports.
- 800×390 pasa sin overflow.

Esto contradice la afirmación de “sin scroll horizontal” del QA responsive y debe corregirse antes de dar por cerrado el release móvil. La suite E2E actual no cubre este caso de geometría en 320/390; conviene añadir una regresión cuando se habilite el alcance de cambios.

### P0 — APK Android no verificable en este entorno

- `JAVA_HOME` no está definido.
- `java` no existe en `PATH`.
- `android/local.properties` no existe.
- `adb` está instalado, pero `adb devices` no muestra ningún dispositivo.
- Por tanto no se ejecutó `assembleDebug`, ni instalación, ni QA nativo de rotación/suspensión.

`npm run android:sync` sí pasa, pero no equivale a generar ni validar un APK.

### P1 — Fuente externa incompatible con una lectura estricta de offline/local-only

`src/styles.css` importa Google Fonts desde `https://fonts.googleapis.com`. La app y el catálogo funcionan offline tras la precarga y el service worker cachea shell, bundle, CSS y PNG, pero la tipografía remota no está garantizada en una primera carga sin red. Además, la conexión debe quedar cubierta por la política de privacidad si se mantiene.

### P1 — Manifest PWA incompleto para instalación amplia

El manifest web tiene un icono SVG (`icons=1`, `sizes: any`, `purpose: any maskable`), y el icono se copia correctamente a Android. No está vacío, pero no declara los tamaños raster habituales de instalación PWA (192×192 y 512×512). Esto no bloquea el APK, pero sí deja incompleta la experiencia PWA en algunos instaladores.

### P1 — Versiones de release no alineadas

- `package.json` y `package-lock.json`: `0.1.0`.
- Android: `versionCode 1`, `versionName "1.0"`.
- Capacitor: `appId com.puntomedio.game`; dependencias instaladas en 7.6.8 dentro del rango declarado `^7.4.0`.

La versión JavaScript y la versión Android no representan el mismo identificador de release. Hay que elegir y registrar una versión única antes de publicar.

### P2 — Permiso Android a justificar

El único permiso declarado es `android.permission.INTERNET`. No aparecen cámara, ubicación, almacenamiento, notificaciones, publicidad personalizada (`AD_ID`) ni otros permisos sensibles; el launcher está exportado y el `FileProvider` está marcado como no exportado.

El permiso no bloquea técnicamente, pero para un build local/offline sin proveedor de anuncios debe justificarse por la importación de Google Fonts o eliminarse junto con esa dependencia externa. Si se conserva, debe reflejarse en la revisión de privacidad.

### P2 — Documentación existente desactualizada

`docs/android-qa.md` todavía registra 13/13 tests unitarios y `icons: []`, mientras que la ejecución actual demuestra 16/16 e `icons=1`. El checklist de release también mantiene tareas externas abiertas (privacidad, consentimiento, QA físico y decisión sobre fuentes). Este informe usa los resultados actuales; la documentación previa debe sincronizarse antes de la entrega final.

## Verificación de offline y permisos

- Las 12 categorías y 120 escalas están presentes en el bundle local y los tests comprueban IDs, tonos y sincronización del catálogo agregado.
- El service worker registra, toma control después de recarga y precachea `index.html`, manifest, JS/CSS hashados y assets de la ruleta.
- El estado de partida y la pista sobreviven a una recarga mediante `localStorage`.
- Con la red desactivada después de esa precarga, la pantalla de resultado vuelve a renderizarse correctamente.
- No hay SDK ni proveedor de anuncios incluido: el valor exportado es `NoopAds`; el adaptador con consentimiento es fail-closed y no bloquea la partida.

## Pendientes priorizados

1. **P0:** corregir y cubrir con regresión el overflow horizontal en 320×800 y 390×844.
2. **P0:** preparar entorno Android con JDK, SDK/local.properties y dispositivo o emulador; ejecutar `assembleDebug`, instalar y completar smoke nativo, rotación y suspensión.
3. **P1:** decidir si la fuente de Google Fonts se autoalojará; si no, documentar la conexión y su impacto de privacidad/offline.
4. **P1:** añadir iconos PWA raster 192×192 y 512×512, manteniendo el icono Android existente.
5. **P1:** alinear `version` web y `versionName` Android, e incrementar `versionCode` según la política de release.
6. **P2:** justificar o retirar `INTERNET` en función de la decisión sobre fuentes y futuros proveedores.
7. **P2:** actualizar `docs/android-qa.md` y conservar como evidencia los logs/capturas de esta ejecución.

No se hicieron cambios manuales en App, estilos, contenido, assets de la ruleta, anuncios ni Gradle. `npm run android:sync` sí refrescó los assets web generados dentro de Android como parte normal del comando; el único archivo de auditoría añadido es este informe.
