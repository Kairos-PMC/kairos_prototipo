# Pase de pulido — lo que se encontró y se arregló

> **Criterio del proyecto: que se vea lindo.** Prototipo de clase para un pitch;
> el producto fuerte no está desarrollado. La exactitud de los datos no fue
> criterio de aceptación. Las cifras del video son las que calcula la app, pero
> están ahí porque funcionan visualmente, no porque haya que defenderlas.

Todo lo de abajo salió de mirar los frames ya armados, no de leer el código.
Los cuatro workers trabajaron en paralelo, cada uno viendo solo su propio
paquete, y ahí es donde aparecieron las costuras.

## Resuelto

| # | Hallazgo | Arreglo |
|---|---|---|
| 1 | El plano saltaba de 1048×896 a 872×748 en el corte 1→2, y otra vez en el 2→3. Cada frame necesita su propia caja porque su moblaje es distinto (KPIs arriba en el 02, panel derecho en el 03). | Los tres pases pasaron de corte seco a **crossfade de 0.5s**. Es la respuesta de montaje a encuadres que no coinciden, no un parche. |
| 2 | Cuatro tipografías distintas: F01 genéricas, F02 `local()` que fallaba (IBM Plex no está instalada), F03 un bloque, F04 nombraba sin archivo. | 9 `.woff2` de IBM Plex (subconjunto latin) extraídos del propio build de la app en `.next/static/media/`, montados en `assets/fonts/` y declarados idénticos en los cuatro frames. |
| 3 | En el plano, `FINCA LA ESPERANZA · ESCALA APROXIMADA · NORTE ARRIBA` se solapaba con `Flores del Oriente S.A.S.` — un borrón ilegible. Bug real de la app, visible a 1x y 2x. | Banda `y=1395..1514` repintada en los dos plates. El cajetín quedó de una fila: `PROYECTO Kairos \| LÁMINA 03-A \| REV. B`, cerrado por el divisor. Dimensiones intactas, así que ninguna registración se rompió. |
| 4 | Bajadas de KPI del frame 02 a 15px y contraste 2.57:1 — invisibles en proyector. | A `--tinta-media` (#55606D) y 17px. |
| 5 | El zoom del frame 03 (1.38×) cortaba `BLOQUE A` dejando `E A`. | Cámara bajada a 1.09 / 1.11 / 1.03. Los rótulos entran completos y el viaje de cámara sigue existiendo. |
| 6 | Dos `fromTo` sobre el cursor sin línea base: un `seek` previo heredaba los valores del último autorado. | `tl.set` explícito en t=0 + `immediateRender: false` en ambos. |
| 7 | Pistas 4 y 5 del frame 02 con clips superpuestos; el ensamblador abortaba. | Reasignadas a las calles 7 y 8. |
| 8 | 6 errores de `content_overlap` sobre pares rótulo/cifra. | Verificados a ojo en el contact sheet: **falsos positivos** (cajas de línea de cifras serif grandes invadiendo el rótulo). Marcados con `data-layout-allow-overlap`. |

## Se decidió no tocar

- **Ocre #A8710C a 3.54:1** en el frame 03. Es un color **semántico** — significa
  "arrastrado" y tiene que coincidir con el del plano. Oscurecerlo rompería el
  código de lectura. A 26px cumple AA-large.
- **El bug del plano en la app** (`src/components/plano-planta.tsx`). Se arregló
  para el video repintando los plates; la app sigue igual. Es otro trabajo.
- **Efectos** (grano, glitch, transiciones de shader). El sistema es papel y
  tinta con filetes de 1px y cero sombra; recargarlo lo abarata.

## Trazas

- Respaldo de los frames antes de la cirugía: `.hyperframes/respaldo-frames/`
- Respaldo de los plates antes de repintar: `.hyperframes/respaldo-plates/`
- `hyperframes check`: **0 errores**. Avisos restantes: tamaño de archivo,
  ids de Studio, y el ocre de arriba.
