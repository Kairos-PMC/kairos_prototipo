#!/usr/bin/env bash
# artefactos-revision.sh — reserva un directorio de artefactos PROPIO de esta
# revision, y verifica que el reporte que se va a leer es el de ESTA revision.
# Falla RUIDOSAMENTE en vez de entregar el reporte de otro agente.
#
# ── Por que existe ───────────────────────────────────────────────────────────
# Todos los comandos de revision mandaban la salida de los CLIs externos a
# rutas FIJAS de /tmp:
#
#     codex exec ... -o /tmp/resultado-codex-revision-impl.md      (Paso 4, escribe)
#     Leer resultado de Codex (/tmp/resultado-codex-revision-impl.md)  (Paso 5, lee)
#
# Con un solo agente revisando en la maquina eso funciona. Con N agentes
# revisando a la vez — el modo normal de trabajo de este equipo — los N
# escriben y leen EL MISMO archivo, y el ultimo en escribir gana. El que lee
# despues se lleva el reporte de otro.
#
# La falla es SILENCIOSA, que es lo que la hace grave: nadie recibe un error.
# El archivo existe, es markdown valido, y habla de otro cambio. La unica
# defensa era que un humano notara que el contenido no correspondia al diff.
#
# Caso medido (TSK-20260825T212834-5v5s): el 2026-08-25, con 7 subagentes
# revisando en el mismo host, TRES agentes distintos leyeron reportes ajenos
# creyendolos propios. Uno vio un veredicto "APROBADO" de un PR que no era el
# suyo. Ninguno recibio error.
#
# ── Las dos mitades del arreglo ──────────────────────────────────────────────
# 1. RUTA UNICA — el directorio se deriva de (sesion de Claude Code + identidad
#    de la revision). Dos agentes distintos, o la misma sesion revisando dos
#    cosas distintas, nunca comparten archivo.
# 2. VERIFICACION DE PERTENENCIA — antes de leer, `verificar` comprueba que el
#    reporte existe, no esta vacio, es POSTERIOR al sello de esta ronda (no un
#    sobrante de la anterior), y menciona la identidad de lo que se esta
#    revisando. Si algo no cuadra, sale != 0 diciendo exactamente que fallo.
#
#    La mitad 1 sola no alcanza: una ruta unica sigue siendo fragil ante
#    cualquier reutilizacion futura (el mismo dir en la ronda 2, un `--sesion`
#    copiado a mano, un revisor que muere sin escribir). La mitad 2 es la que
#    convierte "un humano nota la incongruencia" en "el comando se detiene".
#
# ── Contrato ─────────────────────────────────────────────────────────────────
#   artefactos-revision.sh sellar    --id "<identidad>" [--ronda N] [--sesion S]
#   artefactos-revision.sh dir       --id "<identidad>" [--sesion S]
#   artefactos-revision.sh ruta      --id "<identidad>" [--sesion S] <nombre>
#   artefactos-revision.sh verificar --id "<identidad>" [--sesion S] \
#                                    [--esperado TOKEN]... [--sin-revision-id] <nombre>
#   artefactos-revision.sh limpiar   --id "<identidad>" [--sesion S]
#
# `<identidad>` es lo que identifica de forma UNICA lo que se esta revisando.
# Los comandos la construyen asi:
#
#   /revisar-pr             pr-<N>@<owner>/<repo>@<sha-head>
#   /revisar-plan           plan:<ruta-del-plan>@<repo>
#   /revisar-implementacion impl:<ruta-del-plan>@<repo>@<sha-head>
#   /revisar-codigo         codigo:<repo>@<rango-de-commits>
#   /revisar-cambio         cambio:<repo>@<branch>@<sha-head>
#   /equipo-headless        <proposito>@<repo>@<sha-head>
#
# Codigos de salida — cada uno dice una cosa distinta, no los colapses:
#   0  todo bien
#   2  error de uso (falta --id, falta el nombre del artefacto, flag desconocida)
#   3  no hay sesion identificable y no se paso --sesion
#   4  no hay revision sellada para esta identidad (se lanzo el revisor sin `sellar`)
#   5  el artefacto no existe o esta vacio (el revisor no produjo su reporte)
#   6  el artefacto es ANTERIOR al sello de esta ronda (sobrante de otra corrida)
#   7  el artefacto NO corresponde a esta revision (falta la identidad o un token esperado)
#
# GARANTIA: `verificar` nunca sale 0 sobre un archivo que no pueda demostrar que
# pertenece a esta revision. Los llamadores deben propagar ese exit code y NO
# consumir el reporte.
#
# Compatible con bash 3.2 (macOS de fabrica): la suite bats corre en
# ubuntu-latest Y macos-latest. Nada de arrays asociativos ni ${var,,}.
#
# Portado desde el ecosistema FaroNova (recursos-compartidos), sin cambios funcionales.
# Propagado a cada repo consumidor via: scripts/propagar.sh

set -uo pipefail

PROG=$(basename "$0")

usage() {
  cat >&2 <<'EOF'
Uso:
  artefactos-revision.sh sellar    --id "<identidad>" [--ronda N] [--sesion S]
  artefactos-revision.sh dir       --id "<identidad>" [--sesion S]
  artefactos-revision.sh ruta      --id "<identidad>" [--sesion S] <nombre>
  artefactos-revision.sh verificar --id "<identidad>" [--sesion S] [--esperado TOKEN]... [--sin-revision-id] <nombre>
  artefactos-revision.sh limpiar   --id "<identidad>" [--sesion S]
EOF
  exit 2
}

err() {
  echo "ERROR [$PROG]: $*" >&2
}

# ── Parseo de argumentos ─────────────────────────────────────────────────────
SUBCMD="${1:-}"
[ -n "$SUBCMD" ] || usage
shift || true

IDENTIDAD=""
SESION_ARG=""
RONDA="1"
NOMBRE=""
EXIGIR_REVISION_ID="si"
# `--esperado` es repetible. Se acumulan separados por salto de linea: en bash
# 3.2 eso es mas simple y portable que un array, y ningun token esperado
# (numero de PR, rama, ruta de plan) contiene saltos de linea.
ESPERADOS=""

while [ $# -gt 0 ]; do
  case "$1" in
    --id)
      [ $# -ge 2 ] || usage
      IDENTIDAD="$2"; shift 2 ;;
    --id=*)
      IDENTIDAD="${1#--id=}"; shift ;;
    --sesion)
      [ $# -ge 2 ] || usage
      SESION_ARG="$2"; shift 2 ;;
    --sesion=*)
      SESION_ARG="${1#--sesion=}"; shift ;;
    --ronda)
      [ $# -ge 2 ] || usage
      RONDA="$2"; shift 2 ;;
    --ronda=*)
      RONDA="${1#--ronda=}"; shift ;;
    --esperado)
      [ $# -ge 2 ] || usage
      ESPERADOS="$ESPERADOS
$2"
      shift 2 ;;
    --esperado=*)
      ESPERADOS="$ESPERADOS
${1#--esperado=}"
      shift ;;
    --sin-revision-id)
      # Escotilla explicita: el revisor no puede emitir la linea REVISION-ID
      # (p.ej. un CLI que solo devuelve JSON crudo). Sigue exigiendo existencia,
      # no-vacio, frescura y los --esperado que se le pasen. Usala a conciencia:
      # sin la linea de identidad, la pertenencia se apoya solo en la ruta.
      EXIGIR_REVISION_ID="no"; shift ;;
    -h|--help)
      usage ;;
    -*)
      err "flag desconocida: $1"; usage ;;
    *)
      if [ -n "$NOMBRE" ]; then
        err "sobra el argumento posicional: $1"
        usage
      fi
      NOMBRE="$1"; shift ;;
  esac
done

if [ -z "$IDENTIDAD" ]; then
  err "falta --id \"<identidad>\" — sin identidad no hay pertenencia que verificar."
  usage
fi

# ── Sesion ───────────────────────────────────────────────────────────────────
# CLAUDE_CODE_SESSION_ID es la env var que Claude Code expone a todo subproceso
# de Bash, leida en el momento de EJECUTAR (no al cargar la plantilla del
# comando). Es la misma que ven los hooks. Un valor interpolado al cargar la
# plantilla queda RANCIO en sesiones background (--bg, /loop, cron, sesiones
# lanzadas por una maestra headless) — precedente TSK-20260709T170652-zzvp.
# Mismo orden de resolucion que usa `/registrar-trabajo`.
SESION=""
if [ -n "$SESION_ARG" ]; then
  SESION="$SESION_ARG"
elif [ -n "${CLAUDE_CODE_SESSION_ID:-}" ]; then
  SESION="$CLAUDE_CODE_SESSION_ID"
elif [ -n "${CLAUDE_SESSION_ID:-}" ]; then
  SESION="$CLAUDE_SESSION_ID"
fi

if [ -z "$SESION" ]; then
  err "no hay sesion identificable (ni CLAUDE_CODE_SESSION_ID ni CLAUDE_SESSION_ID)."
  err "Pasa --sesion \"<valor-unico>\" explicitamente."
  err "NO se cae a una ruta compartida de /tmp a proposito: esa es exactamente la"
  err "falla silenciosa que este script existe para cerrar."
  exit 3
fi

# ── Rutas ────────────────────────────────────────────────────────────────────
hash12() {
  # sha256 de stdin, primeros 12 hex. Misma familia que `_worktree_marker_slug`
  # de registrar-trabajo.py. `shasum` esta en macOS y en ubuntu-latest.
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 | cut -c1-12
  else
    sha256sum | cut -c1-12
  fi
}

mtime_de() {
  # `stat` difiere entre GNU (linux) y BSD (macOS), y NO fallan de forma limpia:
  # en GNU coreutils `stat -f` EXISTE y significa "estado del SISTEMA DE ARCHIVOS",
  # asi que sale 0 imprimiendo un bloque de texto que no es un mtime. Encadenar
  # `stat -f %m ... || stat -c %Y ...` por lo tanto NUNCA llega al segundo brazo en
  # linux, y el chequeo de frescura queda muerto sin que nada lo avise. Lo detecto
  # la suite bats en ubuntu-latest (los tests 81 y 88) — en macOS pasaba.
  # Por eso: GNU primero, BSD de respaldo, y se VALIDA que la salida sea un entero.
  _m="$(stat -c %Y "$1" 2>/dev/null)"
  case "$_m" in ''|*[!0-9]*) _m="" ;; esac
  if [ -z "$_m" ]; then
    _m="$(stat -f %m "$1" 2>/dev/null)"
    case "$_m" in ''|*[!0-9]*) _m="" ;; esac
  fi
  printf '%s' "$_m"
}

SESION_HASH="$(printf '%s' "$SESION" | hash12)"
ID_HASH="$(printf '%s' "$IDENTIDAD" | hash12)"

BASE="${TMPDIR:-/tmp}"
BASE="${BASE%/}"
DIR="$BASE/kairos-revision/$SESION_HASH-$ID_HASH"
MANIFIESTO="$DIR/MANIFIESTO.json"

leer_campo_manifiesto() {
  # Lector minimo sin depender de jq: el manifiesto lo escribe este mismo
  # script, una clave por linea.
  sed -n "s/^[[:space:]]*\"$1\"[[:space:]]*:[[:space:]]*\"\{0,1\}\([^\",]*\)\"\{0,1\},\{0,1\}\$/\1/p" "$MANIFIESTO" | head -1
}

exigir_sellado() {
  if [ ! -f "$MANIFIESTO" ]; then
    err "no hay revision sellada para esta identidad:"
    err "  identidad: $IDENTIDAD"
    err "  esperaba:  $MANIFIESTO"
    err "Corre primero:  $PROG sellar --id \"$IDENTIDAD\""
    err "Si ya lanzaste los revisores sin sellar, sus reportes fueron a otra parte"
    err "(o a la ruta compartida vieja): relanzalos, no consumas lo que encuentres."
    exit 4
  fi
  mani_id="$(leer_campo_manifiesto identidad)"
  if [ "$mani_id" != "$IDENTIDAD" ]; then
    err "el manifiesto de $DIR pertenece a OTRA revision."
    err "  esperada:   $IDENTIDAD"
    err "  encontrada: $mani_id"
    exit 4
  fi
}

# ── Subcomandos ──────────────────────────────────────────────────────────────
cmd_sellar() {
  mkdir -p "$DIR" || { err "no pude crear $DIR"; exit 5; }
  ahora="$(date -u +%s)"
  ahora_iso="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  # `sellar` reescribe el manifiesto en CADA ronda a proposito: `sellado_en` es
  # la marca contra la que `verificar` mide frescura. Sin re-sellar, la ronda 2
  # aceptaria felizmente el reporte de la ronda 1.
  cat > "$MANIFIESTO" <<EOF
{
  "sesion": "$SESION",
  "identidad": "$IDENTIDAD",
  "identidad_hash": "$ID_HASH",
  "ronda": "$RONDA",
  "sellado_en": $ahora,
  "sellado_iso": "$ahora_iso",
  "host": "$(hostname 2>/dev/null || echo desconocido)",
  "pid": $$
}
EOF
  # `sellado_en` tiene resolucion de 1 segundo. Si el revisor escribe su reporte
  # dentro del mismo segundo del sello, `mtime == sellado_en` y la comparacion
  # `mtime < sellado_en` no lo rechaza — es `<`, no `<=`, justo por eso.
  printf '%s\n' "$DIR"
}

cmd_dir() {
  exigir_sellado
  printf '%s\n' "$DIR"
}

cmd_ruta() {
  [ -n "$NOMBRE" ] || { err "falta el nombre del artefacto."; usage; }
  exigir_sellado
  printf '%s\n' "$DIR/$NOMBRE"
}

cmd_verificar() {
  [ -n "$NOMBRE" ] || { err "falta el nombre del artefacto a verificar."; usage; }
  exigir_sellado

  artefacto="$DIR/$NOMBRE"

  if [ ! -f "$artefacto" ]; then
    err "el reporte no existe: $artefacto"
    err "El revisor no produjo salida (murio, se colgo leyendo stdin por falta de"
    err "</dev/null, o nunca se lanzo). NO busques un reporte parecido en /tmp:"
    err "el que encuentres ahi es de otro agente."
    exit 5
  fi
  if [ ! -s "$artefacto" ]; then
    err "el reporte esta VACIO: $artefacto"
    err "Tratalo como 'el revisor no respondio', no como 'no encontro nada'."
    exit 5
  fi

  sellado_en="$(leer_campo_manifiesto sellado_en)"
  mtime="$(mtime_de "$artefacto")"
  if [ -n "$sellado_en" ] && [ -n "$mtime" ] && [ "$mtime" -lt "$sellado_en" ]; then
    err "el reporte es ANTERIOR al sello de esta ronda: $artefacto"
    err "  sellado_en: $sellado_en"
    err "  mtime:      $mtime"
    err "Es un sobrante de una corrida anterior, no el resultado de esta. Relanza"
    err "el revisor; si es la ronda 2, re-sella con 'sellar --ronda 2' antes de lanzarla."
    exit 6
  fi

  if [ "$EXIGIR_REVISION_ID" = "si" ]; then
    if ! grep -qF -- "$IDENTIDAD" "$artefacto"; then
      err "el reporte NO menciona la identidad de esta revision: $artefacto"
      err "  identidad esperada: $IDENTIDAD"
      err "Dos causas posibles, y ninguna permite consumirlo:"
      err "  (a) es el reporte de OTRO cambio — el fallo que este chequeo existe para atrapar;"
      err "  (b) el revisor omitio la linea 'REVISION-ID: <identidad>' que el brief le exige."
      err "En ambos casos: revisa el contenido a mano y relanza. No lo des por propio."
      exit 7
    fi
  fi

  # --esperado: tokens que el reporte DEBE mencionar (numero de PR, rama, ruta
  # del plan). Defensa en profundidad sobre la linea REVISION-ID. El bucle NO va
  # detras de un pipe: en bash el cuerpo correria en subshell y su `exit` no
  # cortaria el script.
  faltantes=""
  IFS='
'
  for token in $ESPERADOS; do
    [ -n "$token" ] || continue
    if ! grep -qF -- "$token" "$artefacto"; then
      faltantes="$faltantes $token"
    fi
  done
  unset IFS
  if [ -n "$faltantes" ]; then
    err "el reporte no menciona el/los token(s) esperado(s):$faltantes"
    err "  archivo: $artefacto"
    err "No corresponde al cambio que estas revisando."
    exit 7
  fi

  printf '%s\n' "$artefacto"
}

cmd_limpiar() {
  # Borra SOLO el directorio de esta identidad en esta sesion. Nunca un glob
  # sobre kairos-revision/: ese fue el error del runbook de markers de
  # worktree el 2026-08-11 (un `rm` con comodin barrio los de toda la maquina).
  if [ -d "$DIR" ]; then
    rm -rf "$DIR"
    printf 'borrado %s\n' "$DIR"
  else
    printf 'nada que borrar en %s\n' "$DIR"
  fi
}

case "$SUBCMD" in
  sellar)    cmd_sellar ;;
  dir)       cmd_dir ;;
  ruta)      cmd_ruta ;;
  verificar) cmd_verificar ;;
  limpiar)   cmd_limpiar ;;
  *)
    err "subcomando desconocido: $SUBCMD"
    usage ;;
esac
