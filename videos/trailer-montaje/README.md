# El montaje del trailer

Sesenta segundos, 1920x1080. Es el trailer completo del video de 3 minutos.
No queda ningún hueco. Se regenera con `npm run check && npm run render`.

Los tiempos salen de `docs/video-pitch/escaleta-3min.md`. Si cambia uno, cambia
en los dos lados.

## La línea de tiempo

| Desde | Hasta | Qué se ve | De dónde sale |
|---|---|---|---|
| 0:00 | 0:08 | El saludo | `rodaje/plano-01.mp4`, de IMG_0522 |
| 0:08 | 0:11 | Los dos giran hacia el televisor | `rodaje/plano-02.mp4`, de IMG_0524 |
| 0:11 | 0:16 | El televisor con la noticia encima | `rodaje/plano-06.mp4` más `piezas/tv-noticia.mp4` |
| 0:16 | 0:20 | Ella mira el celular y lo baja | `rodaje/plano-04.mp4`, recortado de IMG_0526 |
| 0:20 | 0:24 | Él saca el suyo y lo abre | `rodaje/plano-05.mp4`, de IMG_0532 |
| 0:24 | 0:36 | La simulación de El Espinal | `piezas/0-24-espinal.mp4` |
| 0:36 | 0:46 | Las tres preguntas | `piezas/0-36-preguntas.mp4` |
| 0:46 | 0:52 | Pantalla partida, parada contra operando | `rodaje/plano-08-izq.mp4` y `-der.mp4` |
| 0:52 | 0:58 | El cierre de marca | `piezas/0-52-marca.mp4` |
| 0:58 | 1:00 | Negro antes del pitch | |

## El sonido

| Pista | Qué es |
|---|---|
| `bgm.mp3` | Música de trailer, ya con el ducking aplicado |
| `bgm-sin-duck.mp3` | La misma sin ducking, por si hay que rehacer la mezcla |
| `tv-noticia.mp3` | El audio del noticiero, que entra en 0:08, tres segundos antes que la imagen |
| `voz/voz-1` a `voz-6` | La voz de Raúl |
| `voz/preg-1` a `preg-3` | Las tres preguntas, partidas de una sola grabación |
| `impacto`, `impacto-corto`, `whoosh-corto` | Dos risers y tres golpes |

**La música baja sola cuando hay voz.** No lleva volúmenes a mano. Se armó un
bus con toda la voz y se usó como disparador de un compresor de cadena lateral,
así que `bgm.mp3` ya trae la bajada de entre 7 y 10 dB en los nueve momentos en
que él habla. Si cambia un audio de voz hay que rehacer el ducking desde
`bgm-sin-duck.mp3`, no basta con reemplazar el archivo.

## Lo que está grabado y lo que es de computador

Lo filmado son cinco clips 4K a 60 cuadros, reducidos a 1080p30. Varios planos
se sacaron recortando el 4K en vez de volver a grabar: el medio de ella del
0:16, el de él del 0:20 y las dos mitades del 0:46. Los originales están en
Descargas y no se deben borrar, porque todo recorte sale de ahí.

Las piezas de computador vienen de los otros proyectos del repo, en
`videos/trailer-espinal`, `trailer-preguntas` y `trailer-marca`.

## Decisiones que no se deducen del código

**El plano 8 no se filmó.** Pedía luz de día y el rodaje terminó de noche. Se
resolvió como pantalla partida, que es el mismo recurso que la escaleta pide en
el 0:00, con ella en grado bleach bypass y él en el grado cálido.

**La emisión de Caracol va con su propia marca.** No lleva el zócalo inventado
encima, porque eso fabricaría un noticiero de Caracol diciendo un titular que no
dijeron. El zócalo propio sigue en `docs/video-pitch/zocalo/` por si se decide
usar metraje libre detrás.

**Las frases en pantalla repiten lo que dice la voz.** Está así a propósito,
para que el trailer funcione sin sonido, que es como se ve en redes. Si se
quieren quitar, son los cinco elementos `.frase` y sus scrims.
