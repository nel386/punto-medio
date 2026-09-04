# Investigación y decisiones — ruleta física

## Fuentes revisadas

- Foto física entregada por el propietario: `C:\Users\neL\AppData\Local\Temp\codex-clipboard-34d63095-12d3-40e4-865d-db21380332f3.png`.
- Referencia visual de interfaz: `C:\Users\neL\AppData\Local\Temp\codex-clipboard-c10ebe26-90a0-4ca2-8ac1-30ba4ffc9a02.png`.
- Piezas de la conversación `Crear SVG ruleta cerrada`, ID `6a9702b6-7bf0-83eb-af56-0aa0139b8a80`.
- Copia local equivalente usada por el build: `public/assets/wheel/layers/closed-interior.png`, `open-interior.png`, `outer-shell-reference.png`, `score-fan.png`, `opener.png` y `needle-reference-cutout.png`.
- [Wavelength Rulebook](https://www.northstreetgames.com/images/Rulebooks/Wavelength-Rulebook.pdf).
- [Ficha oficial de Wavelength en CMYK](https://www.cmyk.games/products/wavelength).

La conversación sí pudo consultarse, pero sus adjuntos se exponen como previsualizaciones temporales. Por eso el código usa las copias locales ya presentes en el proyecto, que son la fuente estable y equivalente de esas piezas.

## Qué se verificó

El dispositivo físico tiene una abertura frontal semicircular y profunda solo hasta el pivote inferior. El rail azul y el cuerpo dentado enmarcan el interior; la zona ocupa un abanico estrecho de cinco cuñas, no una franja de ancho completo. El hub rojo de la aguja se mantiene en el centro inferior y el abridor mint engancha las muescas laterales del rail.

El reglamento confirma el ritmo de la experiencia: la pantalla se cierra antes de preparar la ronda, la persona que da la pista abre completamente para consultar la zona, vuelve a cerrar antes de pasar el dispositivo y el resto del equipo coloca el dial/aguja después. La revelación final vuelve a abrir la pantalla. También confirma que la puntuación depende de la cuña donde queda el dial y que la cuña central vale más.

## Modelo de capas

```text
z6  abridor: órbita propia alrededor del centro del rail; extremos izquierda/derecha
z5  aguja: brazo rotatorio con hub fijo
z4  carcasa/rail frontal: fija; tapa la parte inferior de la fan
z3  pantalla celeste cerrada: tapa mecánica con giro reversible
z2  rotor dentado + fan: conjunto interno con un mismo eje targetPosition
z1  interior abierto: base blanca bajo la abertura
```

El rail frontal permanece fijo porque define la abertura y las dos muecas. El rotor dentado y la fan se mueven juntos dentro de esa abertura, de modo que la parte mecánica no parece un fondo inmóvil mientras cambia el target. La pantalla celeste gira alrededor del mismo eje para descubrir el interior y vuelve por el recorrido inverso. La aguja no usa ese transform: solo se actualiza su brazo con el ángulo de la posición elegida.

## Decisiones de implementación

- `targetAngle = (targetPosition - 50) * 1.8` y `needleAngle = (needlePosition - 50) * 1.8`. Son únicamente transformaciones de representación; no cambian el motor ni la puntuación.
- El panel cerrado no aparece con `display:none` ni cambia el fondo: la imagen celeste está montada desde el inicio y gira en su propia capa, bajo el recorte de la abertura. El interior blanco permanece como base.
- El rotor y la fan permanecen montados durante apertura y cierre. Una máscara circular y un microasentamiento reversible evitan que los sectores aparezcan tarde o desaparezcan de golpe; su pivote es el mismo que el de la rueda objetivo, no el de la aguja ni el del abridor.
- El abridor conserva el gancho en el mismo punto local de su imagen y orbita alrededor del centro del rail, con una vuelta de `-180deg` a `0deg`. Se reduce su tamaño para que el soporte no parezca una segunda aguja.
- La ruleta usa `416px` como máximo y `292px` en pantallas estrechas. La fan se renderiza dentro de una ventana circular compacta; los números siguen perteneciendo al asset de puntuación y mantienen exactamente `2–3–4–3–2`.
- `prefers-reduced-motion` reduce animaciones y transiciones a una duración mínima, manteniendo los estados finales y la privacidad.

## Casos a revisar

1. Cerrada: no se ven fan, puntuaciones ni aguja.
2. Apertura a mitad: el panel blanco entra desde abajo, la fan se revela y el abridor está entre ambas muecas, sin saltos.
3. Abierta estable: fan compacta, números legibles, rail por delante, abridor en la mueca derecha y aguja solo cuando el flujo la muestra.
4. Cierre a mitad: el mismo recorrido vuelve hacia la izquierda; el panel y la fan se repliegan antes de desmontarse.
5. Debate: el hub queda fijo y la aguja se puede ajustar con el dedo o con el range input; no se revela target ni puntuación.

## Riesgos

La geometría exacta del mecanismo interno no puede medirse desde una foto frontal ni desde los PNG con transparencia. La decisión de mantener fijo el rail frontal y hacer que la fan comparta el eje de la rueda es una aproximación visual basada en la separación de piezas disponible; si se obtiene una foto lateral o un vídeo del dispositivo, convendría recalibrar el eje y la ruta del abridor.
