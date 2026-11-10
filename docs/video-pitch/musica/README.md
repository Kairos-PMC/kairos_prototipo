# Música del video

Opciones del catálogo de HeyGen, buscadas con el CLI. Están en mp3 para
escucharlas rápido. Los originales en wav quedan en
`videos/trailer-espinal/.media/audio/bgm/` y no se suben al repo porque pesan
72 MB.

**Esto hay que escucharlo, no leerlo.** Lo único medido es el volumen, y el
volumen no dice si una pieza crece. Una pieza puede ir sumando capas con el
volumen clavado, que es justamente lo que hace una masterización de librería.

## El trailer, un minuto

**Elegida, la opción 2.** El corte listo es `bgm-opcion-2-60s.mp3`.

| Archivo | Dura | Cómo la describe el catálogo | Qué hace el volumen |
|---|---|---|---|
| `bgm-opcion-1.mp3` | 30s | Documental serio, algo ominoso, diseño sonoro escaso | Sube en 0:06 y en 0:18, baja entremedio, se va en 0:28 |
| `bgm-opcion-2.mp3` | 74s | Documental de investigación, tenso y contenido, sin golpes de trailer de acción | Entra desde -26,9 dB, punta en el segundo 60, y se apaga sola hasta el silencio en el 66 |
| `bgm-opcion-3.mp3` | 79s | Drone grave y oscuro, un latido que se acelera, crujidos metálicos, stingers secos | Clavado en -14 dB hasta el segundo 77 y corta en seco |

### Las versiones de un minuto

De las dos piezas largas hay un corte de 60,000 segundos clavados, tomado del
final y no del principio. Entra con un fundido de 1,6 segundos que tapa el corte
de arranque.

| Archivo | Sale de | Desde |
|---|---|---|
| `bgm-opcion-2-60s.mp3` | la de 74s | segundo 14 |
| `bgm-opcion-3-60s.mp3` | la de 79s | segundo 19 |

La opción 1 no tiene versión de un minuto porque dura 30 segundos y habría que
repetirla, que se nota.

### Por qué la 2 calza con la escaleta

Montada desde 0:08, la 2 llega a su punto más alto en 0:46 y 0:47, que es el
plano TOLIMA, AGOSTO, y después se apaga sola. En 0:48 va en -18,2 dB, en 0:50
en -34,3 y en 0:53 ya es silencio. El dominó del 0:52 queda en silencio sin
tener que dibujar ningún fundido, que es lo que pide la escaleta.

La 3 corre fuerte hasta el final del minuto. Para dejar el dominó en silencio
hay que cortarla a 52 segundos o ponerle un fundido a mano.

## La cama del pitch, dos minutos

Son 120 segundos con 267 palabras de voz en off encima, así que la cama va plana
y no comenta. Es una segunda pieza y no la del trailer, que termina en silencio
en 0:53 y tendría que volver a correr su arco completo una vez y media con la
costura audible.

**Corte listo, `bgm-pitch-1-120s.mp3`.** 120,000 segundos clavados, sacados de la
pitch 1 desde el segundo 40. Entra con un fundido de 1,6 segundos y no lleva
fundido de salida porque la pieza se apaga sola. Montado desde 1:00, el cuerpo
se mantiene entre -15,4 y -21,7 dB, empieza a retirarse en 2:48 y llega a
silencio en 3:00, encima del logo y la URL.

| Archivo | Dura | Cómo la describe el catálogo | Qué hace el volumen |
|---|---|---|---|
| `bgm-pitch-1.mp3` | 165s | Ambiente calmo, pads cálidos, explicativo corporativo premium, bajo debajo de una voz | Entre -16,9 y -21,7 dB de punta a punta, y se apaga sola desde el segundo 148 |
| `bgm-pitch-2.mp3` | 51s | Electrónico mínimo y cálido, crecida lenta y suave, fintech contenido, pad sostenido con pulso liviano | Sube de -17,4 a -12,8 dB y vuelve a -15,5. Tiene crecida |
| `bgm-pitch-3.mp3` | 30s | Tech-ad mínimo y liviano, plucks suaves, beat limpio | Clavado en -14 dB. Tiene beat |

La 1 es la única que cubre los dos minutos en una pasada. La 2 necesita dos
pasadas y media y la 3 cuatro, y una costura de loop debajo de una voz se oye.

## Para buscar otras

```bash
cd videos/trailer-espinal
npx hyperframes media-use resolve --type bgm --intent "lo que quieras" --project .
```

Con `--candidates` en vez de fetch nuevo, lista lo que ya está en caché.
