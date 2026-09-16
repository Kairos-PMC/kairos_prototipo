# Asset Descriptions

⚠️  No vision credentials — descriptions below are catalog-derived (alt text, headings, section context, filename) instead of Vision-generated. To get richer Vision descriptions on the next capture, set GEMINI_API_KEY (or GOOGLE_API_KEY), or HYPERFRAMES_VERTEX_PROJECT_ID plus HYPERFRAMES_VERTEX_SERVICE_ACCOUNT for Vertex service-account auth, and re-run.

The `logo-<hash>.svg` filename prefix is a structural hint (DOM said this SVG was inside a `<header>`, home-link `<a>`, or had an aria-label matching the page brand). To pick the actual brand logo without Vision, open the `logo-*` candidates in a previewer or rasterize them with `sharp` before referencing — composing a fake logo ships off-brand in the final video.

- svgs/svg-bf8e339a.svg — svg bf8e339a

## Plates 2x de la pantalla (generados para este video)

El CLI captura a 1x y el plano es el protagonista, así que se generaron plates a
`deviceScaleFactor: 2` de los dos estados de la simulación. Son píxeles reales de
la app corriendo, no una reconstrucción. Estados alineados pixel a pixel entre sí:
el mismo encuadre, lo único que cambia es el daño.

- assets/plates/plano-antes@2x.png — 1772×1514. Solo el plano de Finca La Esperanza,
  estado intacto: todo en azul/tinta, sin rojo ni ocre. Incluye cajetín de lámina
  (PROYECTO Kairos · LÁMINA 03-A · REV. B), escala gráfica y flecha de norte.
- assets/plates/plano-caido@2x.png — 1772×1514. Mismo encuadre, subestación caída:
  SUBESTACIÓN en rojo con X, líneas rojas de dependencia hacia Casa de bombas,
  Bloque A y Bloque B, los tres en ocre rayado. Reservorio, Bodega y Portería
  siguen en azul (no afectados).
- assets/plates/viewport-antes@2x.png — 3840×2160. Viewport completo, estado intacto:
  nav, título "Simulación sobre planta", fila de KPIs en ceros, plano.
- assets/plates/viewport-caido@2x.png — 3840×2160. Viewport completo, estado caído:
  KPIs en 4 / 37 % / $240 M / $440 M, panel "EFECTO EN CADENA" a la derecha.
- assets/plates/full-antes@2x.png — 3840×4806. Página entera, estado intacto.
- assets/plates/full-caido@2x.png — 3840×4806. Página entera, estado caído.
