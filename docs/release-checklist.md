# Checklist de publicación — Punto Medio

## Obligatorio para cualquier build

- [ ] Ejecutar `npm test -- --run` y `npm run build` en limpio.
- [ ] Confirmar que el catálogo offline carga sin red y que se puede iniciar, completar y reiniciar una partida.
- [ ] Probar Android en un dispositivo pequeño y uno grande: pista, debate, colocación, revelado, siguiente ronda, terminar y nueva partida.
- [ ] Confirmar que no hay publicidad durante pista, debate, colocación, revelado o resultado inmediato.
- [ ] Confirmar que una red ausente, un proveedor lento, un error del SDK o cero inventario no impiden avanzar.
- [ ] Revisar manualmente las 12 categorías y los tonos `familiar`, `amigos` y `adulto`.
- [ ] Completar revisión humana del contenido generado o revisado con IA: datos personales, discriminación, sexualización, violencia, instrucciones peligrosas, sesgos y adecuación a la edad.
- [ ] Verificar que no se han añadido permisos Android distintos de los estrictamente necesarios.
- [ ] Revisar la política de privacidad, la clasificación de edad y el texto de divulgación de datos de la tienda.

## Monetización — estado actual seguro

- [ ] Mantener `NoopAds` para builds sin proveedor, sin IDs o sin CMP aprobada.
- [ ] No insertar un SDK de anuncios ni IDs reales solo para probar la interfaz.
- [ ] No depender de `showInterstitial` o `showRewarded` para cambiar de pantalla, puntuar o desbloquear contenido.
- [ ] Si no hay consentimiento explícito, verificar que no se inicializa el proveedor ni se hace una llamada de anuncio.

## Android / AdMob — configuración externa pendiente

Estas tareas necesitan cuentas y configuración fuera del repositorio:

- [ ] Crear la app Android en AdMob y registrar el package name final.
- [ ] Crear IDs de prueba por formato y, tras aprobación, IDs de producción separados.
- [ ] Añadir el SDK oficial de Google Mobile Ads y su App ID en el proyecto Android aprobado.
- [ ] Seleccionar y configurar una CMP compatible con las regiones de distribución (por ejemplo, requisitos europeos de consentimiento), con retirada y actualización del consentimiento.
- [ ] Declarar correctamente en Google Play Console los datos recopilados/compartidos por el SDK y la política de privacidad.
- [ ] Probar anuncios de prueba en un dispositivo físico, incluyendo reinicio, rotación/configuración equivalente y ausencia de red.
- [ ] Sustituir `NoopAds` solo después de pasar la revisión de privacidad y de tener los IDs correctos en secretos/configuración de release.

## Android / firma y publicación

La app está preparada para generar un AAB firmado sin guardar credenciales en el repositorio. El `applicationId` estable es `com.puntomedio.game`; para la primera publicación se usa `versionCode 1` y `versionName 0.1.0`. Incrementa `versionCode` en cada subida posterior.

### 1. Preparar el entorno

- [ ] Instalar/configurar un JDK compatible con Android Gradle Plugin 8.7.2; JDK 17 es la opción recomendada para este proyecto. Android Studio incluye actualmente un JDK 25 en este equipo, pero no es compatible con la combinación Gradle/Groovy comprobada.
- [ ] Configurar `JAVA_HOME` al JDK 17 y verificar `java -version`.
- [ ] Tener instalado Android SDK Platform 36 y Build-Tools 36.0.0.
- [ ] Tener `adb` y, para mantenimiento del SDK, `sdkmanager` disponibles en `PATH`.
- [ ] Ejecutar `npm run android:sync`.

### 2. Crear o localizar el keystore fuera del repositorio

El propietario de la aplicación debe custodiar el keystore y su copia de seguridad. No lo guardes en `android/`, no lo subas al control de versiones y no pegues contraseñas en archivos compartidos. Si todavía no existe, créalo de forma deliberada en una ubicación segura con `keytool` (este proyecto no lo genera automáticamente):

```powershell
keytool -genkeypair -v -keystore "$env:USERPROFILE\secure\punto-medio-upload.jks" -alias punto-medio-upload -keyalg RSA -keysize 2048 -validity 10000
```

Conserva el keystore, el alias y ambas contraseñas; serán necesarios para futuras actualizaciones. Comprueba el archivo antes de configurar Gradle:

```powershell
keytool -list -v -keystore "$env:USERPROFILE\secure\punto-medio-upload.jks"
```

### 3. Configurar la firma sin escribir secretos en el repositorio

`android/app/build.gradle` lee estas variables de entorno (también acepta las propiedades Gradle equivalentes `puntoMedioReleaseStoreFile`, `puntoMedioReleaseStorePassword`, `puntoMedioReleaseKeyAlias` y `puntoMedioReleaseKeyPassword`):

```powershell
$env:PUNTO_MEDIO_RELEASE_STORE_FILE = (Resolve-Path "$env:USERPROFILE\secure\punto-medio-upload.jks").Path
$env:PUNTO_MEDIO_RELEASE_STORE_PASSWORD = "<contraseña-del-keystore>"
$env:PUNTO_MEDIO_RELEASE_KEY_ALIAS = "punto-medio-upload"
$env:PUNTO_MEDIO_RELEASE_KEY_PASSWORD = "<contraseña-de-la-clave>"
```

En macOS/Linux, usa los mismos cuatro nombres con `export`. Configúralos solo en la sesión o en el gestor de secretos de CI; no los añadas a `.env`, `gradle.properties` versionado ni a logs.

### 4. Generar y verificar el AAB

```powershell
cd android
gradlew.bat bundleRelease
```

Salida esperada: `android/app/build/outputs/bundle/release/app-release.aab`.

```powershell
bundletool validate --bundle app\build\outputs\bundle\release\app-release.aab
```

Si no están completas las cuatro entradas, Gradle deja el release sin firmar y lo indica explícitamente; ese AAB no es publicable. Antes de subirlo:

- [ ] Verificar el AAB con bundletool o Google Play Console.
- [ ] Confirmar el package name `com.puntomedio.game` y el version code esperado.
- [ ] Probar el release en un dispositivo físico antes de producción.
- [ ] Guardar checksum y metadatos del artefacto junto con la evidencia de release, sin publicar secretos.

## Web — configuración externa pendiente

- [ ] Elegir una solución web compatible con el producto offline y su política de consentimiento; no asumir que AdSense H5 es intercambiable con AdMob.
- [ ] Publicar la política de privacidad y el mecanismo para retirar consentimiento.
- [ ] Verificar que el proveedor web no se carga antes de consentimiento.
- [ ] Verificar que la app sigue siendo jugable sin red y sin cookies/almacenamiento de terceros.
- [ ] Resolver la importación actual de Google Fonts: autoalojar las fuentes o documentar y evaluar esa conexión no esencial antes de la publicación.
- [ ] Probar navegadores móviles, escritorio, navegación privada y bloqueo de terceros.

## Evidencia de release

- [ ] Guardar resultado de tests y build.
- [ ] Guardar capturas o vídeo de los estados de juego y del caso offline.
- [ ] Guardar versión de los textos de consentimiento, privacidad y clasificación de edad.
- [ ] Registrar IDs, entornos (test/producción), versión del SDK y fecha de la revisión humana.
