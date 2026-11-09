# Música del video

Tres opciones del catálogo de HeyGen, buscadas con el CLI. Están en mp3 para
escucharlas rápido. Los originales en wav quedan en
`videos/trailer-espinal/.media/audio/bgm/` y no se suben al repo porque pesan
32 MB.

| Archivo | Dura | Cómo la describe el catálogo | Volumen medido |
|---|---|---|---|
| `bgm-opcion-1.mp3` | 30s | Documental serio, algo ominoso, diseño sonoro escaso | Plano, -14,8 dB de punta a punta |
| `bgm-opcion-2.mp3` | 74s | Documental de investigación, tenso y contenido, sin golpes de trailer de acción | Entra desde -26,9 dB y a los 12s ya está en -14,5. Después plano |
| `bgm-opcion-3.mp3` | 79s | Drone grave y oscuro, un latido que se acelera, crujidos metálicos, stingers secos | Plano, -14 dB |

## Las versiones de un minuto

El trailer dura un minuto exacto, así que de las dos piezas largas hay un corte
de 60,000 segundos clavados.

| Archivo | Sale de | Desde |
|---|---|---|
| `bgm-opcion-2-60s.mp3` | la de 74s | segundo 14 |
| `bgm-opcion-3-60s.mp3` | la de 79s | segundo 19 |

Se conserva el **final** de cada pieza y no el principio, para que el remate
caiga en el segundo 60 del trailer, justo donde entra el logotipo. Entra con un
fundido de 1,6 segundos que tapa el corte de arranque y sale con uno de 1,4.

La opción 1 no tiene versión de un minuto porque dura 30 segundos y habría que
repetirla, que se nota.

**Esto hay que escucharlo, no leerlo.** Yo no puedo oírlas. Lo único que medí
es el volumen, y el volumen no dice si una pieza crece. Una pieza puede ir
sumando capas y subiendo de intensidad con el volumen clavado, que es
justamente lo que hace una masterización de librería. Por la descripción, la 3
es la que más suena a lo que pide la escaleta, un latido que se acelera. Pero
eso lo confirma el oído.

La 2 tiene algo que las otras no, doce segundos de entrada desde muy abajo.
Eso sirve para el arranque del trailer, donde la escaleta pide ambiente sin
música y que la música entre recién con el televisor.

Duran 74 y 79 segundos, así que cubren el minuto del trailer. Para los dos
minutos del pitch hay que repetirla bajada a cama o buscar una segunda.

Para buscar otras, con el CLI ya instalado:

```bash
cd videos/trailer-espinal
npx hyperframes media-use resolve --type bgm --intent "lo que quieras" --project .
```
