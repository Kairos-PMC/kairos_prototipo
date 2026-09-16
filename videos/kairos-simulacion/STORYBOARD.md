---
format: 1920x1080
duration: 30s
message: "Lo que se rompe cuesta $240 M; lo que se detiene cuesta $440 M"
arc: Demo Loop — detalle → clic → cascada → cifra
audience: Jurado del pitch y evaluadores del curso ISIS 2007 — Uniandes
mode: autonomous
music: none
---

> **Proyecto silencioso.** `music: none` y sin `SCRIPT.md`: no hay narración, ni
> música, ni SFX. Todo el peso narrativo lo lleva el texto en pantalla, y por eso
> cada cifra necesita tiempo de lectura — ese es el motivo de que el video dure
> 30s y no 25s.
>
> **Criterio de aceptación: cómo se ve.** Esto es un prototipo de clase para un
> pitch; el producto no está desarrollado. La exactitud de los datos **no** es un
> criterio de aceptación — si una decisión mejora cómo se ve en proyector, gana.
>
> Las cifras que están en los frames resultan ser las que calcula la app, y se
> quedan porque ya están puestas y funcionan visualmente. No hay que verificar
> nada contra la app ni defender ningún número.

## Video direction

**Paleta.** De `frame.md`, sin inventar nada. Fondo `paper` #F0ECE1 con la
retícula `grid` a 55%; el plano va sobre `paper-2` #FAF8F3. Texto en `ink`,
rótulos mono en `ink-soft`. Los tres colores de estado **no son decoración, son
el código de lectura del plano** y tienen un significado fijo en todo el video:
`opera` azul #1B4A7A · `golpe` bermellón #C4372A · `arrastrado` ocre #A8710C.
Ningún elemento que no sea una instalación puede usar bermellón ni ocre.

**Tipografía.** IBM Plex Serif 400 para display y cifras (la jerarquía la hace
el tamaño, nunca el peso). IBM Plex Sans para bajadas. IBM Plex Mono en
mayúsculas con tracking 0.16em para todo rótulo — es la voz de plano técnico que
ya tiene la app.

**Gramática de movimiento.** Eases de cola larga, `power3` por defecto: suave
antes que rebotado. Una sola cámara para todo el video, siempre sobre la misma
superficie.

Los tres pases entre frames son **crossfades cortos, no cortes en seco**. Cada
frame necesita su propia caja para el plano porque su moblaje es distinto —el 02
lleva la franja de KPIs arriba, el 03 un panel a la derecha— y esas geometrías no
coinciden. Cortar en seco sobre encuadres que no coinciden hace saltar el dibujo;
el fundido lo lee como un asentamiento suave. Es la respuesta de montaje, no un
parche.

**Modelo de revelado — sin voz en off.** No hay narración, así que el pulso no
lo marca una línea hablada sino **el tiempo de lectura**. La regla que reemplaza
al VO-paced reveal: ninguna cifra o frase aparece antes de que el espectador
haya tenido tiempo de leer la anterior, y **ningún texto se va antes de 1,8s en
pantalla**. Cada Scene revela una cosa y le da su tiempo. Prohibido el volcado
inicial: en t=0 solo está lo que el frame necesita para arrancar.

**Ritmo y frames sostenidos.** Frame 1 abre lento y sostiene. Frame 2 concentra
la energía en un solo golpe (el clic) y después se queda quieto para que los
KPIs se lean. **Frame 3 es el más denso** — es el único que encadena tres
revelados. **Frame 4 es un frame sostenido**: las dos cifras aterrizan y el
cuadro se queda inmóvil; el desfase entre los dos contadores es todo el
movimiento que necesita. Prefiero quietud a movimiento de relleno.

**Lista negativa.** Nada de: nav ni chrome de navegador fuera de los plates
reales; barras de scroll; cursores reales del sistema (el único cursor es el
`oversized-cursor` del frame 2); gradientes azul-violeta de "IA"; bokeh; sombras
blandas (el sistema es de filetes de 1px y cero sombra); rebotes elásticos;
cifras redondeadas "para que suenen mejor". Y los dos modos de falla de
movimiento: **slideshow** (volcar todo y congelar) y **salvapantallas** (todo
flotando por su cuenta sin jerarquía).

**Primitivas del registro.** Instalar antes de construir, no rehacer a mano:
`pull-back-reveal` (F1) · `oversized-cursor` (F2) · `svg-stroke-trace` (F3) ·
`count-up` (F2, F3, F4).

## Frame 1 — La finca en calma

- scene: Arranca cerrado sobre la subestación y un solo zoom-out desacelerando revela la finca entera
- duration: 7s
- transition_in: cut
- status: animated
- blueprint: zoom-out-workspace-reveal
- src: compositions/frames/01-finca-en-calma.html
- asset_candidates: assets/plates/plano-antes@2x.png
- handoff_out: plano-antes — encuadre completo del plano, escala 1.0, opacidad 1, centrado en el canvas, quieto al corte
- focal: assets/plates/plano-antes@2x.png
- roles: plano-antes@2x = cutout (el plano ES el cuadro, no hay fondo separado)
- registry: pull-back-reveal

**Reproduce.** El blueprint pide exactamente esto: un detalle cerrado que
sostiene y un solo retroceso de cámara desacelerando que lo recontextualiza. Su
movimiento firma —el pull-back único, sin ningún zoom-in en ninguna parte— es la
espina del plano y se conserva entero.

Scene 1 (0.0–2.2s): solo el recuadro de la SUBESTACIÓN, encuadre cerrado a ~2.0x
sobre el plate 2x (queda por debajo de 1:1 del plate, sin upscaling). Azul
`opera` sobre `paper-2`, la retícula corriendo detrás. Entra el rótulo mono
`SUBESTACIÓN ELÉCTRICA` pegado al recuadro por la izquierda — per-word staggered
reveal → `dynamic-content-sequencing`. Centrado, el recuadro ocupa ~45% del
cuadro. Nada más en pantalla.

Scene 2 (2.2–3.6s): el rótulo se completa con la cifra `$ 240 M` en serif, que
aterriza a la derecha del nombre sobre su propio tiempo — no estaba antes. La
cámara ya arrancó su retroceso, imperceptible todavía. El texto tiene 1,4s
limpios de lectura antes de que la escala cambie de verdad.

Scene 3 (3.6–6.2s): **el movimiento firma** — un único pull-back desacelerando
de ~2.0x a 1.0x que abre el plano entero de Finca La Esperanza → `multi-phase-camera`.
Van entrando en cuadro los dos bloques de invernadero, el reservorio, la casa de
bombas, la bodega, el cajetín de lámina. El rótulo de la subestación viaja
anclado a su recuadro y se encoge con él, hasta quedar en letra chica. Layered-depth:
retícula al fondo, plano en el medio, rótulo adelante.

Scene 4 (6.2–7.0s): quieto. El plano completo sostiene, la subestación ahora es
la cosa más chica del dibujo rodeada de cosas enormes. Solo jitter de baja
amplitud → `sine-wave-loop`. Ese contraste de escala es el que hace la pregunta
que el frame 2 responde.

Abre sobre el detalle que va a importar: el recuadro de la **SUBESTACIÓN**, en
azul, intacto, el más chico del dibujo. Un rótulo mono lo nombra y le pone
precio — `SUBESTACIÓN ELÉCTRICA · $240 M` — sin explicar todavía por qué
miramos esto.

Después, un único zoom-out que desacelera hasta revelar el plano completo de
Finca La Esperanza: los dos bloques de invernadero ocupando media lámina, el
reservorio, la casa de bombas, la bodega. La subestación queda ahí, diminuta
arriba al centro, rodeada de cosas mucho más grandes que ella.

El plate tiene 2x de resolución, así que el encuadre cerrado del arranque está
por debajo de 1:1 y no hay upscaling en ningún momento del movimiento.

## Frame 2 — El clic

- scene: El cursor llega a la subestación, hace clic, el recuadro se pinta de rojo y los KPIs arrancan
- duration: 7s
- transition_in: crossfade
- status: animated
- blueprint: cursor-ui-demo
- src: compositions/frames/02-el-clic.html
- asset_candidates: assets/plates/plano-antes@2x.png, assets/plates/plano-caido@2x.png
- handoff_in: plano-antes — encuadre completo del plano, escala 1.0, opacidad 1, centrado, quieto
- handoff_out: plano — encuadre completo, escala 1.0, opacidad 1, centrado; subestación ya en rojo con la X, sin líneas de dependencia todavía
- focal: assets/plates/plano-caido@2x.png
- roles: plano-antes@2x = background (el estado base del cuadro) · plano-caido@2x = cutout (solo se revela la región de la subestación, recortada)
- registry: oversized-cursor, count-up

**Adapt.** Del blueprint `cursor-ui-demo` conservo el movimiento firma —el
cursor viaja a un objetivo, lo presiona y el clic enciende una respuesta
visible— pero la respuesta no es una pantalla nueva: es un cambio de estado
**dentro del mismo plano**, resuelto revelando la región de `plano-caido` sobre
`plano-antes`, que están alineados pixel a pixel. Un solo objetivo, no un
recorrido de varios.

Scene 1 (0.0–1.6s): el plano completo sigue donde lo dejó el frame 1, quieto.
Por arriba baja la fila de cuatro KPIs, en ceros: `FUERA DE SERVICIO 0` ·
`OPERACIÓN DETENIDA 0 %` · `REPOSICIÓN $ 0` · `COSTO DEL EVENTO $ 0`, el último
en tarjeta `ink` invertida. Full-width strip arriba, el plano ocupa los dos
tercios de abajo. Los ceros se leen antes de que pase nada.

Scene 2 (1.6–3.0s): el cursor entra desde fuera de cuadro por la derecha y viaja
hasta la subestación en una curva larga → `oversized-cursor`. Nada más se mueve;
el ojo lo sigue solo.

Scene 3 (3.0–4.0s): **el movimiento firma** — clic. El cursor se comprime contra
el recuadro y sale una onda expansiva → `cursor-click-ripple` + `physics-press-reaction`.
En el mismo fotograma la región de la subestación se revela desde `plano-caido`:
azul → bermellón `golpe`, con su rayado y la X. El cursor se retira del cuadro
enseguida; no se queda estorbando.

Scene 4 (4.0–5.2s): dos KPIs reaccionan y los otros dos no — eso es parte del
argumento. `FUERA DE SERVICIO` 0 → **1** y `REPOSICIÓN` $ 0 → **$ 240 M** con su
bajada `daño físico`, los dos con contador → `count-up`. `OPERACIÓN DETENIDA` y
`COSTO DEL EVENTO` siguen en cero, quietos y visibles. Todavía no hay cascada.

Scene 5 (5.2–7.0s): entra la tesis, sola, en `display-quote` serif sobre la
banda inferior: **«El daño físico es la parte barata.»** — per-word staggered
reveal → `dynamic-content-sequencing`, y después quieto. 1,8s de lectura limpia.
Es una afirmación sin probar; los frames 3 y 4 son la prueba.

La fila de KPIs entra por arriba, toda en ceros: `FUERA DE SERVICIO 0`,
`OPERACIÓN DETENIDA 0 %`, `REPOSICIÓN $ 0`, `COSTO DEL EVENTO $ 0`. Es el estado
de reposo de la pantalla y dura lo justo para leerse.

El cursor entra en cuadro y viaja hasta la subestación. Clic. El recuadro pasa
de azul a **rojo**, con el rayado y la X encima — revelando esa sola región del
plate `plano-caido` sobre el plate `plano-antes`, que están alineados pixel a
pixel. Nada más cambia todavía.

Dos KPIs se mueven: `FUERA DE SERVICIO` 0 → **1**, y `REPOSICIÓN` $0 → **$240 M**
con la línea `daño físico` debajo. Los otros dos siguen quietos.

Cuando el rojo asienta, entra la tesis del video como una línea sola, en serif,
sin adorno: **«El daño físico es la parte barata.»** Es una afirmación que
todavía no está probada — los dos frames que siguen son la prueba.

## Frame 3 — Lo que cae sin que lo toquen

- scene: Las líneas rojas de dependencia se dibujan y tres instalaciones intactas se apagan en ocre
- duration: 9s
- transition_in: crossfade
- status: animated
- blueprint: camera-journey
- src: compositions/frames/03-la-cascada.html
- asset_candidates: assets/plates/plano-caido@2x.png, assets/plates/plano-antes@2x.png
- handoff_in: plano — encuadre completo, escala 1.0, opacidad 1, centrado; subestación en rojo con X, sin líneas de dependencia
- handoff_out: plano — encuadre completo, escala 1.0, opacidad 1, centrado; cascada completa (4 instalaciones marcadas), quieto al corte
- focal: assets/plates/plano-caido@2x.png
- roles: plano-caido@2x = cutout (se revela por regiones, en orden de cascada) · plano-antes@2x = background (lo que todavía no cayó)
- registry: svg-stroke-trace, count-up

**Adapt.** De `camera-journey` tomo la sub-forma A (roundtrip de acción): el
movimiento firma es que **el viaje de la cámara es el que cuenta la relación
causa-efecto**, y eso se conserva. Lo que cambio: no hay varias superficies ni
un mundo continuo que recorrer — el viaje ocurre dentro de un solo plano, y las
piernas del recorrido las marcan las líneas de dependencia al dibujarse.

Scene 1 (0.0–2.4s): desde la subestación bermellón baja la primera línea roja
hasta la CASA DE BOMBAS, dibujándose según su longitud medida →
`svg-stroke-trace` / `svg-path-draw`. La cámara acompaña el trazo hacia abajo,
sin cambiar de escala → `viewport-change`. Al llegar, la casa de bombas se llena
de ocre `arrastrado`. Rótulo mono al costado: `FERTIRRIEGO · sin energía no opera`.

Scene 2 (2.4–3.4s): la primera vez que aparece el ocre, el código se hace
explícito. Entran dos fichas mono chicas, apiladas, abajo a la izquierda:
`■ RECIBIÓ EL GOLPE` en bermellón y `■ DEJÓ DE OPERAR SIN RECIBIRLO` en ocre.
Se quedan el resto del frame. Sin esto el ocre es solo un color bonito.

Scene 3 (3.4–5.8s): de la casa de bombas salen las **dos** líneas restantes, a
BLOQUE A y BLOQUE B, dibujándose casi a la par con un leve desfase →
`svg-stroke-trace`. La cámara retrocede lo justo para que los dos invernaderos
entren completos → `multi-phase-camera`, y se pintan de ocre al llegarles el
trazo. Son la mitad del dibujo. Asymmetric 60/40: plano a la izquierda, aire y
fichas a la derecha.

Scene 4 (5.8–7.4s): los KPIs de arriba terminan de moverse, ahora sí los cuatro
→ `count-up`. `FUERA DE SERVICIO` 1 → **4** con la bajada `de 13 activos` y,
debajo, **`3 sin recibir daño`** entrando aparte y en ocre — es la línea que
importa. `OPERACIÓN DETENIDA` 0 → **37 %**, bajada `$ 17 M por día`.

Scene 5 (7.4–9.0s): quieto, y entra la frase del panel de efecto en cadena, en
serif, literal de la pantalla *(verbatim)*: **«3 instalaciones sin un rasguño
quedaron fuera de operación.»** La palabra `sin un rasguño` se marca con un
subrayado dibujado a mano → `css-marker-patterns`, en ocre. 1,6s de lectura y
corte.

El viaje de la cámara **es** la relación causa-efecto. Desde la subestación roja
baja la primera línea roja hasta la **CASA DE BOMBAS**, que se llena de ocre
rayado: el fertirriego no opera sin energía. La cámara acompaña el trazo.

De ahí salen dos líneas más, hacia **BLOQUE A** y **BLOQUE B**, y la cámara
retrocede lo justo para que los dos invernaderos entren completos en cuadro
mientras se pintan de ocre. Son la mitad del dibujo y ninguno recibió el golpe.

El código de color es el de la app y no se inventa otro: **rojo = recibió el
golpe · ocre = dejó de operar sin recibirlo**. Un rótulo mono lo deja explícito
la primera vez que aparece el ocre.

Sobre el final del frame, la frase del panel de efecto en cadena, literal de la
pantalla *(verbatim)*: **«3 instalaciones sin un rasguño quedaron fuera de
operación.»** Y los KPIs terminan de moverse: `FUERA DE SERVICIO` **4** de 13,
con `3 sin recibir daño` debajo; `OPERACIÓN DETENIDA` **37 %** del margen
diario, `$ 17 M por día`.

## Frame 4 — Las dos cifras

- scene: Las dos cifras cuentan hacia arriba lado a lado y la distancia entre ellas es el argumento
- duration: 7s
- transition_in: crossfade
- status: animated
- blueprint: dataviz-countup
- src: compositions/frames/04-las-dos-cifras.html
- asset_candidates: assets/plates/plano-caido@2x.png
- handoff_in: plano — entra por crossfade desde el plano completo con la cascada; el plano se va a fondo (baja a ~12% de opacidad) y deja el cuadro a las cifras
- focal: assets/plates/plano-caido@2x.png
- roles: plano-caido@2x = background (marca de agua a ~12%, la cascada todavía legible)
- registry: count-up

**Reproduce.** `dataviz-countup` en su forma directa: el movimiento firma es el
contador que aterriza con un pulso contenido, y acá el pulso llega **dos veces,
desfasado**. Ese desfase es todo el shot.

Scene 1 (0.0–1.2s): el plano se hunde a ~12% de opacidad detrás de la retícula y
quedan dos columnas vacías, split-screen simétrico, cada una con su rótulo mono
ya puesto: a la izquierda `REPOSICIÓN`, a la derecha `COSTO DEL EVENTO`. Las
cifras todavía no están. Layered-depth: plano al fondo, retícula, cifras
adelante.

Scene 2 (1.2–3.2s): **el movimiento firma** — las dos cifras arrancan a contar
desde cero **al mismo tiempo pero a distinta velocidad** → `count-up` /
`counting-dynamic-scale`. La izquierda se detiene en **$ 240 M** a los ~2.6s y
suelta su pulso de escala. Bajada `daño físico` debajo.

Scene 3 (3.2–4.6s): la derecha **sigue subiendo** casi un segundo y medio
después de que la izquierda ya paró — el cuadro se queda con un número quieto y
otro todavía trepando, y ahí está el argumento entero sin decir una palabra.
Aterriza en **$ 440 M**, pulso, bajada `reposición + lucro cesante`. Un filete
de 1px en ocre conecta las dos columnas por debajo con la etiqueta mono
`12 DÍAS DE REPARACIÓN · $ 17 M POR DÍA`.

Scene 4 (4.6–6.2s): **frame sostenido.** Nada se mueve salvo la entrada de la
línea de cierre, en serif, literal de la pantalla *(verbatim)*: **«Ninguna
póliza sobre el activo caído las cubre.»** Las dos cifras se quedan quietas
arriba. Solo jitter de baja amplitud → `sine-wave-loop`.

Scene 5 (6.2–7.0s): el logotipo de Kairos entra abajo al centro con su bajada
mono `SIMULADOR DE RIESGOS`, en `ink` — scale-swap suave contra la línea de
cierre que se retira → `scale-swap-transition`. Cierre limpio, sin CTA.

El plano retrocede hasta ser una marca de agua tenue y quedan las dos cifras,
lado a lado, contando hacia arriba desde cero a distinta velocidad:

- a la izquierda, **$ 240 M** — rótulo `REPOSICIÓN`, bajada `daño físico`
- a la derecha, **$ 440 M** — rótulo `COSTO DEL EVENTO`, bajada `reposición + lucro cesante`

La de la derecha sigue subiendo después de que la izquierda ya se detuvo. Ese
desfase es el shot: la diferencia entre las dos no es daño, es operación
detenida — 12 días de reparación a $17 M por día.

Cierra con la línea del panel de efecto en cadena, literal *(verbatim)*:
**«Ninguna póliza sobre el activo caído las cubre.»** y, debajo, el logotipo de
Kairos con su bajada `SIMULADOR DE RIESGOS`.

Sin CTA: el video se proyecta dentro del deck con alguien hablando encima, y la
llamada a la acción la hace esa persona, no la pantalla.
