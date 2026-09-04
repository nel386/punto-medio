# Punto Medio

Juego social de escalas y debates para Android y navegador.

## Desarrollo

```bash
npm install
npm run dev
```

## Verificación

```bash
npm test
npm run build
```

## Demo web

La app puede publicarse como sitio estático en GitHub Pages desde `main`. El flujo de despliegue está definido en `.github/workflows/deploy-pages.yml` y conserva el mismo núcleo que después se empaqueta con Capacitor para Android.

La verificación de monetización está incluida en `tests/ads.test.ts`. Comprueba el fallback local, consentimiento, modo offline, frecuencia y fallos del proveedor sin bloquear la partida.

## Android

El núcleo web se empaqueta con Capacitor:

```bash
npm run android:add
npm run android:sync
npm run android:open
```

La carpeta `android/` necesita Android Studio y un SDK Android para generar el APK. La partida funciona offline; el adaptador de anuncios actual es un `NoopAds` intencionadamente no bloqueante. La integración real requiere IDs, SDK aprobado y consentimiento de producción; está documentada en `docs/monetization.md` y `docs/release-checklist.md`.

Consulta [docs/android-qa.md](docs/android-qa.md) para el estado comprobado y la lista reproducible de QA.

### APK debug

Con Android Studio, un JDK compatible con Gradle y el SDK Android instalados:

```bash
npm run android:sync
cd android
./gradlew assembleDebug       # macOS/Linux
gradlew.bat assembleDebug     # Windows
```

El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`. Para instalarlo en un dispositivo con depuración USB autorizada:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### AAB release firmado

La configuración de release queda preparada para firmar de forma opt-in cuando exista un keystore. No se incluye ningún keystore ni secreto en el repositorio. Consulta [docs/release-checklist.md](docs/release-checklist.md) para crear o custodiar el keystore, configurar las variables y ejecutar:

```bash
cd android
./gradlew bundleRelease       # macOS/Linux
gradlew.bat bundleRelease     # Windows
```

El AAB firmado queda en `android/app/build/outputs/bundle/release/app-release.aab`. Sin las cuatro entradas de firma, Gradle deja el release sin firmar y muestra qué falta; ese artefacto no es publicable en Google Play.

## Orquestación

El flujo de agentes, ámbitos de escritura, dependencias y formato de entregas está definido en `orchestration/`. La app carga los 12 lotes editoriales versionados desde `content/categories/`; `content/catalog.json` conserva el catálogo agregado.
