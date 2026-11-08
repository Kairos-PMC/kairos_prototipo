#!/bin/bash
# Renderiza el zócalo a PNG, en versión con fondo y en versión transparente.
#
# Dos cosas que hay que saber. Chrome escribe el archivo y después a veces no
# sabe salir, así que el wrapper lo mata por tiempo. Y usa un perfil temporal
# propio, porque si toma el perfil normal choca con el Chrome que uno tenga
# abierto y no escribe nada.
cd "$(dirname "$0")" || exit 1
python3 - "$PWD" <<'PY'
import subprocess, sys, tempfile, pathlib

base = pathlib.Path(sys.argv[1])
src = base / "zocalo.html"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

salidas = [
    ("zocalo-con-fondo.png", "", []),
    ("zocalo-transparente.png", "?transparente", ["--default-background-color=00000000"]),
]

fallos = 0
for nombre, query, extra in salidas:
    destino = base / nombre
    if destino.exists():
        destino.unlink()
    with tempfile.TemporaryDirectory() as perfil:
        cmd = [CHROME, "--headless", "--disable-gpu", "--no-first-run",
               "--no-default-browser-check", f"--user-data-dir={perfil}",
               "--hide-scrollbars", "--window-size=1920,1080",
               "--force-device-scale-factor=1", "--virtual-time-budget=4000",
               f"--screenshot={destino}", *extra, f"file://{src}{query}"]
        try:
            r = subprocess.run(cmd, timeout=40, capture_output=True, text=True)
            err = r.stderr
        except subprocess.TimeoutExpired as e:
            err = (e.stderr or b"").decode(errors="replace") if isinstance(e.stderr, bytes) else (e.stderr or "")
    if destino.exists():
        print(f"{nombre}  {destino.stat().st_size} bytes")
    else:
        fallos += 1
        print(f"{nombre}  NO SE ESCRIBIÓ")
        for linea in (err or "sin mensaje de error").strip().splitlines()[-6:]:
            print("   ", linea)
sys.exit(1 if fallos else 0)
PY
