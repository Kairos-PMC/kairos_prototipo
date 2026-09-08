#!/usr/bin/env bash
# resolver-doc.sh — entrega un documento del repo (o una seccion suya) a stdout,
# o falla RUIDOSAMENTE. Nunca imprime vacio con exit 0.
#
# ── Por que existe ───────────────────────────────────────────────────────────
# Los comandos de revision embeben las reglas de dominio en el prompt de cada
# revisor. Si esa lectura falla en silencio, los revisores corren SIN REGLAS y
# el resultado se ve exactamente igual que una revision buena — nadie se entera.
#
# Ese modo de falla ya ocurrio en el ecosistema del que viene este flujo: hasta
# el 2026-08-20 los briefs mandaban `cat ~/.claude/skills/code-review-*/SKILL.md`,
# unos skills que nunca existieron en ninguna maquina. El `cat` fallaba sin
# abortar y las revisiones salian sin reglas de dominio (detectado el 2026-08-18).
#
# Por eso este script sale != 0 en vez de devolver algo vacio, y por eso los
# comandos lo tratan como un gate: si falla, no se lanza ningun revisor.
#
# ── Diferencia con el original ───────────────────────────────────────────────
# El original (`resolver-doc-compartido.sh`) resolvia el documento contra el repo
# compartido del equipo via `gh api`, con un checkout local como respaldo. Aqui
# el documento vive en este mismo repo, asi que se lee del working tree — sin
# red, sin `gh`, sin repo externo. El contrato de CLI y los codigos de salida se
# conservan para que los comandos portados no necesiten otros cambios.
#
# ── Uso ──────────────────────────────────────────────────────────────────────
#   resolver-doc.sh <ruta-relativa-a-la-raiz-del-repo> [--seccion "<titulo>"]
#
# Ejemplos:
#   resolver-doc.sh docs/estandares/guia-code-review.md
#   resolver-doc.sh docs/estandares/guia-code-review.md --seccion Seguridad
#
# `--seccion` extrae el bloque de un encabezado markdown (cualquier nivel) hasta
# el siguiente encabezado de nivel igual o superior. Si la seccion no existe,
# falla con exit 3 y lista los encabezados disponibles — un dominio mal escrito
# no puede degradar en silencio a "revisar sin reglas".
#
# ── Codigos de salida ────────────────────────────────────────────────────────
#   0  contenido entregado por stdout (garantizado no vacio)
#   1  el documento no existe o esta vacio
#   2  uso incorrecto
#   3  el documento existe pero no tiene la seccion pedida

set -uo pipefail

PROG=$(basename "$0")

usage() {
  echo "Uso: $PROG <ruta-en-el-repo> [--seccion \"<titulo>\"]" >&2
  exit 2
}

DOC_PATH=""
SECCION=""

while [ $# -gt 0 ]; do
  case "$1" in
    --seccion)
      [ $# -ge 2 ] || usage
      SECCION="$2"
      shift 2
      ;;
    --seccion=*)
      SECCION="${1#--seccion=}"
      shift
      ;;
    -h|--help)
      usage
      ;;
    -*)
      echo "ERROR [$PROG]: opcion desconocida '$1'" >&2
      usage
      ;;
    *)
      [ -z "$DOC_PATH" ] || usage
      DOC_PATH="$1"
      shift
      ;;
  esac
done

[ -n "$DOC_PATH" ] || usage

# ── Resolucion del documento ─────────────────────────────────────────────────
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$REPO_ROOT" ]; then
  echo "ERROR [$PROG]: no estoy dentro de un repo git; no puedo resolver '$DOC_PATH'." >&2
  exit 1
fi

FULL="$REPO_ROOT/$DOC_PATH"

if [ ! -f "$FULL" ]; then
  {
    echo "ERROR [$PROG]: '$DOC_PATH' no existe en este repo."
    echo "  Buscado en: $FULL"
    echo
    echo "ABORTA en vez de continuar sin ese documento."
  } >&2
  exit 1
fi

CONTENIDO=$(cat "$FULL")

if [ -z "${CONTENIDO//[[:space:]]/}" ]; then
  echo "ERROR [$PROG]: '$DOC_PATH' existe pero esta vacio." >&2
  exit 1
fi

# ── Extraccion de seccion (opcional) ─────────────────────────────────────────
# Misma logica que el original: encabezado exacto, hasta el siguiente encabezado
# de nivel igual o superior.
if [ -n "$SECCION" ]; then
  EXTRAIDO=$(printf '%s\n' "$CONTENIDO" | awk -v titulo="$SECCION" '
    function nivel(linea,   n) {
      n = 0
      while (substr(linea, n + 1, 1) == "#") n++
      return n
    }
    /^#+[[:blank:]]/ {
      h = nivel($0)
      texto = $0
      sub(/^#+[[:blank:]]+/, "", texto)
      gsub(/[[:blank:]]+$/, "", texto)

      if (dentro && h <= nivel_objetivo) { dentro = 0 }
      if (!dentro && texto == titulo) { dentro = 1; nivel_objetivo = h }
    }
    dentro { print }
  ')

  if [ -z "$EXTRAIDO" ]; then
    {
      echo "ERROR [$PROG]: '$DOC_PATH' existe pero NO contiene la seccion '$SECCION'."
      echo
      echo "Encabezados disponibles:"
      printf '%s\n' "$CONTENIDO" | grep -E '^#+[[:blank:]]' | sed 's/^/  /'
      echo
      echo "ABORTA en vez de continuar sin las reglas de esa seccion."
    } >&2
    exit 3
  fi
  CONTENIDO="$EXTRAIDO"
fi

# Procedencia a stderr (no contamina stdout, que es el contenido).
echo "[$PROG] resuelto desde: $FULL" >&2
printf '%s\n' "$CONTENIDO"
