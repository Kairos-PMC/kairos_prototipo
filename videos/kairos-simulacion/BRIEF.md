---
workflow: product-launch-video
flow: automation
storyboard: no
message: "Lo que se rompe cuesta $240 M; lo que se detiene cuesta $440 M"
destination: deck
aspect: 1920x1080
language: es
length: 30s
angle: cascada-de-dependencias
audience: "Jurado del pitch y evaluadores del curso ISIS 2007 — Uniandes"
narration: no
---

## Intent

Mostrar la pantalla de Simulación de Kairos tal como es, sin promo ni voz en off:
un clic sobre la Subestación eléctrica del plano de la finca y la cascada que se
desata.

El argumento sale de las cifras que la propia pantalla calcula. Reponer la
subestación cuesta **$240 M** — eso es todo el daño físico. Pero el evento
completo cuesta **$440 M**, porque al caer deja fuera de operación a 4 de 13
activos, **3 de ellos sin recibir un rasguño**, y detiene el 37 % del margen
diario ($17 M por día durante 12 días de reparación). La parte cara no es lo que
se rompe: es lo que se detiene. Y como remata el panel de efecto en cadena,
ninguna póliza sobre el activo caído cubre a los arrastrados.

El video va dentro del deck del pitch y se proyecta con alguien hablando encima,
así que el peso lo llevan la pantalla y las cifras, no una narración.

## Assets

- Captura de http://localhost:3000/simulacion — la pantalla es la fuente visual
  de verdad; se usa el screenshot real, no una reconstrucción en HTML.
- Escenario por deep-link: `/simulacion?caidos=subest-f` abre la pantalla con la
  subestación ya marcada como caída. Sirve para capturar el estado "después" sin
  simular el clic.

## Customizations

- Show-it-as-is: las pantallas capturadas son los assets protagonistas del video.
- Las cifras ($240 M vs $440 M) necesitan tiempo de lectura en pantalla: sin voz
  en off, el texto carga todo el peso narrativo.
- Rojo = recibió el golpe. Ocre = dejó de operar sin recibirlo. Es el código de
  color propio de la pantalla y el video no debe inventar otro.
- Ninguna cifra en pantalla puede salir de otro lado que no sea lo que la app
  calcula. Nada de números redondeados "para que suene mejor".

## Notes

- Sin música ni narración: proyecto marcado como silencioso (`music: none`, sin
  `SCRIPT.md`).
- Idioma español en todo el texto en pantalla.
- Los datos son de la empresa demo "Flores del Oriente S.A.S." (sector
  floricultor, Facatativá / Funza). Es un prototipo académico, no un producto en
  producción — no presentarlo como cliente real.
- Duración: 30s. El brief original pedía ~25s; se extendió porque sin narración
  el texto en pantalla necesita tiempo de lectura.
