# Orquestador multiagente

Este directorio contiene el contrato de trabajo del proyecto. El agente principal coordina tareas especializadas, evita que dos agentes escriban los mismos archivos y consolida cada hito antes de continuar.

## Contrato de tarea

Cada tarea debe indicar:

- `id`
- `objetivo`
- `contexto`
- `archivosPermitidos`
- `archivosProhibidos`
- `dependencias`
- `criteriosDeAceptacion`
- `formatoDeEntrega`

## Contrato de entrega

Cada agente debe responder con:

- `estado`: `completed`, `blocked` o `needs-review`
- resumen del trabajo
- archivos modificados
- pruebas realizadas
- decisiones tomadas
- riesgos o bloqueos
- siguiente tarea recomendada

## Regla visual para futuras tareas

La conversación de referencia `Crear SVG ruleta cerrada` (`6a9702b6-7bf0-83eb-af56-0aa0139b8a80`) contiene piezas sueltas especialmente válidas para la ruleta. Debe consultarse antes de reutilizar assets existentes. Las composiciones completas del proyecto son la prueba de encaje; las piezas desgranadas son la fuente para capas, pivotes y animaciones.

## Flujo

1. Producto y diseño de juego.
2. UX y contenido en paralelo.
3. Revisión de contenido.
4. Implementación del núcleo web y Android.
5. QA funcional y visual.
6. Monetización y release.

Las decisiones de producto y los cambios grandes requieren revisión humana en el hilo principal.
