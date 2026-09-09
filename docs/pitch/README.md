# Pitch No. 2 — Presentación de la Solución

`Kairos-Pitch-2.pptx` — 9 láminas, 13,33 × 7,5 pulgadas (16:9).

## Cómo se regenera

```bash
cd docs/pitch
npm install pptxgenjs      # solo la primera vez
node generar-deck.js
```

El deck se genera por código y no se edita a mano: así las cifras salen siempre
de la misma fuente y una corrección no hay que repetirla en cinco cajas de texto.
Si se edita el `.pptx` directamente, el siguiente `node generar-deck.js` pisa
esos cambios.

Las dos imágenes son capturas reales de la aplicación desplegada, no mockups:

| Archivo | De dónde salió |
|---|---|
| `cascada-crop.png` | `/simulacion?caidos=subest-f` — la subestación caída y su efecto en cadena |
| `datos-crop.png` | `/datos` — sismos del USGS y clima de Open-Meteo, en vivo |

Para recapturarlas con datos frescos:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --window-size=1440,1080 --virtual-time-budget=9000 \
  --screenshot=cascada.png \
  "https://kairos-prototipo.vercel.app/simulacion?caidos=subest-f"
```

## Qué criterio cubre cada lámina

La rúbrica («Ficha Evaluación Pitch Solución») tiene 11 criterios de 1 a 10.
Siete se ganan en la lámina y cuatro en la exposición.

| Lámina | Criterio |
|---|---|
| 1 · Portada | — |
| 2 · El dato existe. La decisión, no | **a** · El problema está bien definido |
| 3 · No es un riesgo teórico | **b** · El problema es importante |
| 4 · Quien sufre no es quien firma | **c** · Se identificó al cliente afectado |
| 5 · Mapear, cuantificar, priorizar | **g** · La solución propuesta es clara |
| 6 · Caiga la subestación | **h** · La solución resolvería el problema |
| 7 · Una entrevista cambió el producto | **i** · La solución fue validada con clientes |
| 8 · Cada cifra dice de dónde salió | **f** · Los datos de soporte son coherentes |
| 9 · Factor WOW! | **j** · La solución es innovadora |

Quedan fuera del alcance del archivo, porque dependen de quien presenta:
**d** (la presentación fue clara), **e** (el presentador expuso bien sus ideas)
y **k** (¿el pitch fue convincente?). Cada lámina lleva notas del orador con el
argumento que sostiene esos tres.

## Una advertencia sobre el criterio (i)

La lámina 7 dice de frente que una sola entrevista no alcanza, y enumera lo que
falta. Es deliberado: el Ejercicio 3 concluyó exactamente eso, y un evaluador que
pregunte por la disposición a pagar va a encontrar la respuesta ya escrita en vez
de un silencio.
