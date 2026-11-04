"""Recorte de los retratos del equipo.

No es un paso de build. Es el registro de como salieron los cinco archivos de
`public/equipo/` a partir de las fotos originales, para que el dia que alguien
cambie una foto no tenga que adivinar el criterio ni volver a medir a ojo.

Las originales son fotos de celular, no retratos de estudio: una de cuerpo
entero contra un atardecer, otra en un puerto, una de camara web. Pegadas tal
cual, cada cara salia de un tamano distinto y la fila se leia como cinco fotos
sueltas. El criterio que las empareja es que la cabeza ocupe cerca de la mitad
del alto y que la linea de ojos caiga a un 38% desde arriba.

Las coordenadas son medidas a ojo sobre cada original y solo valen para esos
archivos. Si cambias una foto, hay que volver a medir esa fila.

Requiere Pillow y las originales en ORIGEN:

    python3 scripts/recortar-retratos.py
"""

from PIL import Image, ImageOps
import os

ORIGEN = "/Users/raul/Downloads"
DESTINO = "/Users/raul/Documents/PMC/kairos_prototipo/public/equipo"

# (archivo de origen, nombre final, centro horizontal de la cara,
#  borde superior del recorte, alto del recorte)  en pixeles del original
RECORTES = [
    # Escala pareja en las cinco: la cabeza ocupa cerca de la mitad del alto y
    # la linea de ojos cae a un 38% desde arriba. Sin esto las caras salian de
    # tamanos distintos en la fila y la rejilla se veia desordenada.
    ("Juan Camilo.png",      "juan-camilo-solano.jpg",        532,   0, 885),
    ("Antonio.jpeg",         "antonio-munoz.jpg",             375, 248, 479),
    ("Samuel.jpeg",          "samuel-montoya.jpg",            810, 107, 875),
    # Maria Alejandra va un poco mas abierta a proposito: su cara es la mas
    # pequena del original y cerrar mas obligaba a ampliar demasiado.
    ("Maria Alejandra.jpeg", "maria-alejandra-rodriguez.jpg", 610, 737, 330),
    ("Raul.jpeg",            "raul-ruiz.jpg",                 650,  98, 583),
]

SALIDA = (800, 1000)  # 4 a 5, el mismo recorte de la tarjeta

os.makedirs(DESTINO, exist_ok=True)
for origen, destino, cx, top, alto in RECORTES:
    im = Image.open(os.path.join(ORIGEN, origen))
    crudo = im.size
    im = ImageOps.exif_transpose(im)
    if im.size != crudo:
        raise SystemExit(f"{origen}: EXIF rota la imagen, las coordenadas no sirven")
    ancho = alto * 4 / 5
    izq = cx - ancho / 2
    caja = (round(izq), top, round(izq + ancho), top + alto)
    if caja[0] < 0 or caja[1] < 0 or caja[2] > im.width or caja[3] > im.height:
        raise SystemExit(f"{origen}: el recorte {caja} se sale de {im.size}")
    im = im.convert("RGB").crop(caja).resize(SALIDA, Image.LANCZOS)
    if destino == "samuel-montoya.jpg":
        # La unica de camara web: sale lavada al lado de las otras cuatro y en
        # la fila se nota. Se estira el rango tonal en el archivo y no con un
        # filtro CSS, que tendria que ser una excepcion por persona en la
        # tarjeta. preserve_tone evita que el estiron le cambie el color.
        im = ImageOps.autocontrast(im, cutoff=0.6, preserve_tone=True)
    ruta = os.path.join(DESTINO, destino)
    im.save(ruta, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"{destino:34} {crudo[0]}x{crudo[1]} -> {caja} -> {SALIDA}  {os.path.getsize(ruta)//1024} KB")
