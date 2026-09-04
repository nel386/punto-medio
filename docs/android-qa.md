# Android-first QA — Punto Medio

Fecha de comprobación: 2026-09-04

## Estado

| Área | Estado | Evidencia / límite |
| --- | --- | --- |
| Dependencias Capacitor | PASS | `@capacitor/core`, `@capacitor/android` y CLI `^7.4.0` están declarados; instalación comprobada en 7.6.8. |
| Configuración | PASS | `appId`/`applicationId` `com.puntomedio.game`, nombre `Punto Medio`, `webDir: dist`, `compileSdk 36`, `targetSdk 36`, `versionCode 1` y `versionName 0.1.0`. |
| Build web | PASS | `npm run build` termina correctamente y genera `dist/` (Vite 6.4.3). |
| Sincronización Android | PASS | `npx cap sync android` ejecutado; copia `dist` y actualiza plugins. |
| Tests unitarios | PASS | 16/16 tests en 3 archivos. |
| APK debug / AAB release | BLOCKED | Se encontró el JDK embebido de Android Studio 25.0.2, pero AGP/Gradle falla con `Unsupported class file major version 69`; falta configurar un JDK compatible, preferiblemente 17. |
| SDK/dispositivo | PARTIAL | SDK platform `android-36`, build-tools `36.0.0` y `adb 37.0.1` están disponibles; `sdkmanager` no está en PATH/no hay cmdline-tools detectado y no se verificó dispositivo o emulador. |
| Firma release | READY / NOT CONFIGURED | `android/app/build.gradle` acepta las cuatro entradas de firma por propiedades Gradle o variables de entorno. No hay keystore ni claves privadas en el repositorio. |
| Icono/splash Android | PASS | Hay iconos adaptativos por densidad y splash portrait/landscape en `android/app/src/main/res`. |
| Iconos PWA | FAIL | `public/manifest.webmanifest` tiene `icons: []`; no bloquea el APK, pero debe completarse para instalación PWA. |
| Anuncios offline | PASS (estático) | El proveedor por defecto es `NoopAds`; el límite de proveedor exige red y consentimiento explícito. |
| Service worker | PASS (estático) | Precachea shell/PNG, descubre JS/CSS hashados del `index.html`, cachea GET same-origin y aplica fallback a `index.html`. |
| Categorías offline | PASS (estático) | Las 12 categorías/120 escalas se importan en `src/content/catalog.ts` y quedan dentro del bundle JS. |
| Smoke offline real | NOT RUN | No se pudo aislar una sesión de navegador con red desactivada; no se presenta como prueba real. |
| Responsive 320/390/escritorio | PASS (estático) / NOT RUN (viewport real) | Existen breakpoints para 560/850 px, `min-width: 320px`, tarjeta inferior fija en setup móvil y reglas de rueda/marcador. Falta captura real a 320 y 390 px. |
| Rotación/suspensión | PASS (estático) / NOT RUN (dispositivo) | Android declara `configChanges` para orientación y la sesión se persiste en `localStorage`; falta prueba en móvil/emulador. |

## Reproducción local

### Validación web

```bash
npm install
npm test
npm run build
```

Resultado observado: 16 tests pasan y el build de Vite termina sin errores.

### Sincronización Capacitor

```bash
npm run android:sync
```

Esto ejecuta el build web y copia el resultado a `android/app/src/main/assets/public`.

### Generar e instalar APK debug

Requiere Android Studio, un JDK compatible con AGP/Gradle (JDK 17 recomendado), SDK Android y `JAVA_HOME` configurado:

```bash
cd android
gradlew.bat assembleDebug       # Windows
./gradlew assembleDebug         # macOS/Linux
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Para un AAB de publicación firmado, sigue la sección de firma de [docs/release-checklist.md](release-checklist.md). La build sin firma solo sirve para comprobar compilación y no se puede subir a Google Play.

En el teléfono: abrir la app, iniciar una partida, bloquear/desbloquear la pantalla, girar el dispositivo y volver a la app. Confirmar que la pantalla y el turno se conservan. Repetir con modo avión después de la primera carga completa.

## Smoke test reproducible

1. Abrir la build web en navegador.
2. Seleccionar modo, tono, al menos una categoría y dos equipos.
3. Iniciar partida y comprobar que aparece la pantalla de pista.
4. Destapar la ruleta, introducir una pista, bloquear la aguja y comprobar resultado/marcador.
5. Recargar con red disponible para que el service worker termine de instalarse.
6. Activar modo avión o bloquear las peticiones de red del navegador.
7. Recargar y repetir una ronda. Deben seguir disponibles el shell, el bundle, la ruleta, los PNG y el catálogo.

El paso 7 solo cuenta como PASS después de ejecutarlo realmente en navegador o Android. La comprobación realizada aquí fue estática más un smoke visual local; por tanto queda `NOT RUN`.

## Checklist por viewport

Repetir setup, inicio de partida, resumen fijo, tarjetas de categoría, marcador y rueda en:

- 320 × 800: comprobar que no hay scroll horizontal, que el CTA inferior no tapa el contenido y que las tarjetas siguen siendo accionables.
- 390 × 844: comprobar lectura de etiquetas, controles de pista y marcador.
- 1280 × 800 o similar: comprobar dos columnas en setup, tarjeta de inicio visible y rueda centrada.

El CSS declara `body { min-width: 320px }`, breakpoints a 560/850 px, `overflow-x: hidden`, `touch-action: none` para la rueda interactiva y `position: fixed` para el resumen de setup móvil. Esto es evidencia estática, no sustituye las tres capturas de viewport.

## Decisiones y limitaciones

- No se modificaron `src/App.tsx`, `src/styles.css`, `content/categories/*.json`, `public/assets/wheel/**`, anuncios ni el checklist de monetización.
- El catálogo no requiere peticiones JSON en runtime: Vite lo embebe en el bundle.
- Android lleva los assets web empaquetados; el service worker protege principalmente la build navegador/PWA.
- Los iconos Android existen, pero faltan iconos declarados en el manifest web.
- No se debe afirmar que existe un APK/AAB hasta configurar el JDK compatible y completar la tarea correspondiente; en esta comprobación no se generó ningún artefacto Android.
