---
description: Meta-comando que analiza la profundidad de revisión necesaria y recomienda el comando especializado correcto. Puerta de entrada para toda revisión de código, PR, plan o implementación — invocar este antes que /revisar-pr, /revisar-plan o /revisar-implementacion salvo que ya sepas exactamente cuál corresponde.
argument-hint: "[PR | ruta-a-archivo | ruta-a-plan.md | vacío para diff local]"
allowed-tools: Bash(codex:*), Bash(git:*), Bash(gh:*), Bash(grep:*), Bash(find:*), Bash(cat:*), Bash(which:*), Bash(sleep:*), Bash(awk:*), Bash(wc:*), Bash(jq:*), Bash(sort:*), Bash(tr:*), Bash(mktemp:*), Bash(rm:*), Read, Write, Edit, Glob, Grep, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, SendMessage, Skill
---

# Revisar Cambio (meta-comando router)

Analiza el cambio actual (diff local, PR, plan, archivo) y **recomienda** el comando especializado correcto. Para casos triviales o ligeros ejecuta la revisión inline con 1-2 Codex. Para casos medianos a profundos termina con `Siguiente paso: ejecuta /comando` y deja que Claude (la sesión que está leyendo este comando) invoque el slash command apropiado en su turno siguiente.

> **Cuándo usar este comando (no los hijos directos):** este es el punto de entrada barato. Si no estás 100% seguro de que el cambio es un PR específico (`/revisar-pr`), un plan recién escrito (`/revisar-plan`) o una implementación terminada (`/revisar-implementacion`), entra por aquí. El meta-comando detecta el contexto y delega. Solo invoca los hijos directos cuando el caso es obvio y conocido.

**Input (cualquiera):**
- Vacío → analiza diff local (`git status` + `git diff HEAD`)
- Número de PR / URL / `owner/repo#N` → recomienda `/revisar-pr`
- Ruta a `plan.md` → recomienda `/revisar-plan` o `/revisar-implementacion`
- Ruta a archivo específico → revisa solo ese archivo

**Diferencia clave con `/revisar-pr`:**
- Este comando **decide profundidad** y **delega**. No ejecuta revisiones complejas por sí mismo.
- `/revisar-pr` es el ejecutor especializado (4 Codex + las 4 secciones de la guía).
- Solo niveles 1-2 (chico, contexto puntual) se ejecutan inline aquí.


> 🔴 **SI SOS UN ORQUESTADOR REPARTIENDO ESTA REVISIÓN ENTRE VARIOS AGENTES: NO LES DICTES LA RUTA DE SALIDA.**
>
> El defecto de los artefactos de revisión pisados **ya está arreglado dentro de los comandos** desde el 2026-08-26 (`artefactos-revision.sh`): la ruta se deriva de *(sesión de Claude Code + identidad de la revisión)* y `verificar` exige que el reporte sea posterior al sello de la ronda y mencione el `REVISION-ID`.
>
> **Y aun así el defecto volvió a morder el 2026-08-27, con el fix vivo y propagado en los cinco worktrees.** La causa no fue el comando: fue **una instrucción del orquestador** que le dictó a cada agente su `-o /tmp/resultado-…-<sufijo>.md`. Los cinco obedecieron, y al obedecer se saltaron el helper.
>
> **Qué NO poner en el brief que le pasás a otro agente** — ninguna de estas tres:
> - una ruta de salida (`-o /tmp/...`, «dejá el reporte en …», «escribí a …»),
> - un sufijo «para que no choquen» (`-btok`, `-r2`, el nombre de la tarea),
> - el nombre del archivo que vas a leer después.
>
> **Qué SÍ poner:** *«corré `/revisar-cambio` (o el comando que corresponda) sobre X y contame el veredicto»*. El comando llama al helper, el helper decide la ruta y `verificar` acredita la pertenencia. Vos leés lo que el agente te reporta, no un archivo que elegiste vos.
>
> 🚩 **Sufijar a mano no es una mitigación equivalente.** Tapa el **modo 1** (dos corridas simultáneas chocando) y deja vivo el **modo 2** — leer un resto de tu **propia** corrida anterior —, que es justo el que `verificar` existe para atrapar y el que no produce ningún error visible. Además no es confiable ni como mitigación: en la misma ola del 27-ago quedó un `/tmp/resultado-codex-revision-plan.md` **sin sufijar**.
>
> ⚠️ **Un checkout rancio rompe esto aunque hagas todo bien, y es un vector aparte.** Si el worktree desde el que corre el agente trae el comando PRE-fix (sin `.claude/scripts/artefactos-revision.sh`), va a usar la ruta fija sin que ninguna instrucción lo evite — el archivo que Claude Code lee es el del checkout. Medido el 2026-08-27: ~45 worktrees viejos y 7 checkouts de `main` en ese estado. Antes de repartir, verificá en cada worktree: `test -x .claude/scripts/artefactos-revision.sh || echo "RANCIO: $PWD"`.

---

## Paso 0: Verificar herramientas

```bash
which codex && which gh && which git && which jq
```

Si alguna falta, mostrar:
```
ERROR: [herramienta] no disponible.

Para codex: npm install -g @openai/codex && codex auth login
Para gh:    brew install gh && gh auth login
Para jq:    brew install jq
```

**STOP** — no continuar sin las 4 herramientas básicas.

---

## Paso 1: Detectar contexto

### 1a. Si hay argumento

Parsear el argumento:

| Patrón | Interpretación |
|---|---|
| `^[0-9]+$` (solo dígitos) | Número de PR del repo actual |
| `^[^/]+/[^#]+#[0-9]+$` | `owner/repo#N` (PR específico) |
| `^https://github\.com/.*/pull/[0-9]+$` | URL completa de PR |
| Ruta termina en `plan.md` | Plan de trabajo |
| Ruta a archivo existente que NO es plan.md | Archivo individual |
| Cualquier otro | Mostrar error y opciones |

### 1b. Si no hay argumento (modo diff local)

```bash
cd $(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "ERROR: no estás en un repo git. Si quieres revisar archivos sueltos, pásamelos como argumento."
  exit 1
}

# Temporales canónicos. mktemp, no rutas fijas: varias sesiones del equipo
# corren en paralelo sobre el mismo host.
CHANGED=$(mktemp); UNTRACKED_LIST=$(mktemp)
PLANES=$(mktemp); NO_PLAN=$(mktemp); CHECK=$(mktemp)
trap 'rm -f "$CHANGED" "$UNTRACKED_LIST" "$PLANES" "$NO_PLAN" "$CHECK"' EXIT

# Filtro de cache/build. NO incluye `.claude/` a propósito: el router debe ver
# los comandos, hooks y settings sin trackear — de eso dependen el dominio
# "Configuración ejecutable de Claude" y su cap (Paso 3b).
FILTRO='^(_remote_cache/|node_modules/|\.next/|dist/|build/)'

git ls-files --others --exclude-standard 2>/dev/null \
  | grep -vE "$FILTRO" | grep -v '^$' | sort -u > "$UNTRACKED_LIST"

# CHANGED es la ÚNICA fuente de paths para los Pasos 2b, 3a, 3b, 3c y 3d.
# Ningún consumidor vuelve a llamar a git ls-files por su cuenta: hacerlo se
# salta el filtro de arriba.
{ git diff HEAD --name-only 2>/dev/null | grep -vE "$FILTRO"
  cat "$UNTRACKED_LIST"
} | grep -v '^$' | sort -u > "$CHANGED"

# Desglose para el reporte del Paso 4. Solo presentación — el scoring usa CHANGED.
STAGED=$(git diff --cached --name-only 2>/dev/null)
UNSTAGED=$(git diff --name-only 2>/dev/null)
UNTRACKED=$(cat "$UNTRACKED_LIST")
```

### 1c. CASO DEGENERADO — diff vacío

Si `CHANGED` está vacío (`[ ! -s "$CHANGED" ]`):

```
No detecto cambios para revisar.

¿Quieres revisar algo específico?
- Pasa un número de PR: /revisar-cambio 123
- Pasa una ruta a plan.md: /revisar-cambio docs/.../plan.md
- Pasa un archivo: /revisar-cambio src/foo.py
- Pasa un commit-range: /revisar-cambio HEAD~5..HEAD

```

**STOP** — no calcular score sin cambios.

### 1d. CASO DEGENERADO — merge/rename/file-mode

Inspeccionar el diff con `git diff HEAD --raw`:

```bash
git diff HEAD --raw 2>/dev/null
```

Detectar:
- **Merge commit**: si `git rev-parse HEAD^2 2>/dev/null` devuelve un hash (commit tiene 2+ padres) y el diff vs `HEAD~1` está vacío.
- **Rename puro**: todas las líneas del diff son `R100` (rename con 100% similarity, sin cambios de contenido).
- **File-mode change**: todas las líneas son `:100644 100755` (cambio de permisos) sin contenido modificado.

Si match → **nivel 0** con razón explícita, saltar Paso 3:

```
Cambio detectado: [merge commit / rename puro / file-mode change]
Nivel: 0 (trivial — no requiere revisión de contenido)
Razón: no hay cambios de código sustantivos, solo metadata de git.

¿Procedo a generar un reporte breve confirmando esto? [Enter=sí | n=no]
```

---

## Paso 2: Clasificar el caso

### 2a. PR abierto en branch actual → `/revisar-pr`

```bash
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
[ -n "$CURRENT_BRANCH" ] && gh pr list \
  --head "$CURRENT_BRANCH" \
  --state open \
  --json number,url,headRepositoryOwner,baseRefName \
  -q '.[]' 2>/dev/null
```

| Resultado | Comportamiento |
|---|---|
| **0 PRs** | No hay PR. Continuar con análisis local. |
| **1 PR** | Candidato fuerte a delegar a `/revisar-pr <N>`. Mostrar al usuario el PR detectado y preguntar si quiere usar `/revisar-pr` directamente. |
| **>1 PR** (stacked) | Mostrar la lista numerada y preguntar cuál revisar. |
| **Error de gh** (no auth, network, repo privado sin permiso) | Warning visible: `⚠ gh pr list falló (¿sin auth? ¿sin permiso?). Continuando con diff local.` Fallback a análisis local. |
| **Sin upstream** | No hay PR posible. Fallback a análisis local. |
| **Branch de fork** | `gh pr list --head` puede devolver vacío incluso con PR del fork. Si el usuario menciona PR pero no aparece, preguntar el número explícito. |

Si hay 1 PR claro, terminar con:
```
PR detectado: #N — [título]
Esta sesión está en la branch del PR. La forma correcta de revisar es:

Siguiente paso: ejecuta /revisar-pr <N>

Si prefieres analizar solo el diff local sin abrir el flujo de PR, responde `local`.
```

### 2b. plan.md activo en el repo → `/revisar-plan` o `/revisar-implementacion`

**Si el usuario pasó una ruta a un `plan.md` como argumento (Paso 1a), esa ruta es autoritativa**:
enrutar directo, sin mirar el diff. Con un worktree limpio el plan no aparece en `CHANGED`, y el
caso se perdería.

```bash
ROOT=$(git rev-parse --show-toplevel)

# Los paths del find son ABSOLUTOS y los de git son RELATIVOS al root. Sin
# relativizar, el grep -Fx de abajo no excluye ningún plan: TOTAL nunca llega
# a 0 y la guarda queda muerta.
# Las comillas de "$ROOT" tampoco son opcionales: el operando derecho de #
# es un patrón glob, y un root con `[`, `]`, `*` o `?` no matchearía.
# `find -printf '%P\n'` sería más corto pero es GNU-only, y el equipo tiene macOS.
while IFS= read -r p; do printf '%s\n' "${p#"$ROOT"/}"; done \
  < <(find "$ROOT" -path "*/planes-de-trabajo/pendientes/*/plan.md" -type f 2>/dev/null) \
  | sort -u > "$PLANES"

[ -s "$PLANES" ] || : # sin planes: saltar al Paso 3 (no pasar listas vacías a grep -f)

# NO_PLAN = lo cambiado que no es un plan pendiente. Un único conjunto.
grep -vFxf "$PLANES" "$CHANGED" > "$NO_PLAN"
TOTAL=$(grep -c . "$NO_PLAN")
```

Con `PLANES` y `TOTAL` listos, decidir en **dos tiempos — (b) antes que (a)**:

**(b) ¿El cambio IMPLEMENTA un plan?** Solo si `TOTAL > 0`. Para cada plan candidato:

```bash
# El checklist se reconoce en sus DOS convenciones: encabezado (`## Checklist …`) y
# línea en negrita (`**Checklist de archivos**:`). Cierra en el próximo encabezado o
# en un `---`.
awk '
  /^#{2,4} .*[Cc]hecklist/ || /^\*\*[^*]*[Cc]hecklist/ { f=1; next }
  /^#{2,4} / || /^---[[:space:]]*$/ { f=0 }
  f
' "$plan" | grep -oE '`[^`]+`' | tr -d '`' | sort -u > "$CHECK"
[ -s "$CHECK" ] || continue            # plan sin checklist: no matchea nada
MATCHED=$(grep -Fxf "$CHECK" "$NO_PLAN" | grep -c .)
```

> 🔴 **La negrita NO es un caso de borde: es la convención dominante.** La versión anterior
> del `awk` solo matcheaba `^#{2,4} .*[Cc]hecklist`, o sea **encabezados**, y los planes de
> `agente-de-monitoreo` escriben `**Checklist de archivos**` en negrita. Efecto: `CHECK`
> quedaba vacío, el `[ -s "$CHECK" ] || continue` descartaba el plan, `MATCHED=0`, y la
> rama (b) no producía candidato **nunca**. El cambio caía en la rama (a) —"el cambio ES un
> plan"— y el router mandaba a `/revisar-plan`.
>
> Eso es exactamente el comando equivocado, y contra el diseño que la nota de abajo explica:
> el caso dominante es el `plan.md` viajando en el mismo PR que su implementación, y por eso
> (b) va antes que (a). El bug volvía inalcanzable la rama que el diseño prioriza.
>
> **Medido el 2026-08-28** sobre `novedades-truncacion-enumeracion-observable`: el `awk`
> viejo daba `MATCHED=0/6`; el nuevo da `6/8` ⇒ `MATCHED*2 >= TOTAL` ⇒ enruta a
> `/revisar-implementacion`, que es lo correcto.
>
> **Síntoma para detectarlo a mano** si vuelve a pasar con otra convención: el scoring
> imprime `MATCHED=0` con `TOTAL > 0` y aun así hay un `plan.md` en el diff cuyos archivos
> son obviamente los del checklist. Ahí no hay que creerle al router.
>
> Sobre el ruido: la extracción captura además tokens que no son paths (`_MAX_NOVEDADES_PAGE`,
> `/novedades`, nombres de clase). Es inofensivo **a propósito** — se comparan por igualdad
> exacta contra los paths cambiados, así que un token que no es path no matchea nada. Vale la
> misma razón que ya justifica no filtrar por "esto parece un path" en la nota de abajo.

Si `MATCHED*2 >= TOTAL` → candidato. Si varios califican, gana el de mayor `MATCHED`; si empatan,
listar y preguntar. → `/revisar-implementacion <plan>`.

**(a) ¿El cambio ES un plan?** Si (b) no dio candidato y algún path de `CHANGED` está en `PLANES`
→ `/revisar-plan <ese plan>`.

**(c)** Si ninguno aplica → seguir al Paso 3, **sin recomendar plan alguno**.

| Resultado | Comportamiento |
|---|---|
| **Sin planes pendientes** | Continuar al Paso 3. |
| **(b) con match ≥50%** | `/revisar-implementacion <plan>` |
| **(a) el cambio es un plan** | `/revisar-plan <ese plan>` |
| **Ninguno** | Continuar al Paso 3, sin recomendación |
| **Repo sin carpeta `planes-de-trabajo/`** | Salto silencioso, sin error. |

> **Por qué (b) va antes que (a), y por qué no hay fallback.** La regla anterior decía: *"si no hay
> match alto pero hay plan.md → recomendar `/revisar-plan`"*. Como el `find` barre todo el repo, en
> un repo con 115 planes pendientes devolvía 115 resultados en **toda** invocación: cambiabas un
> scraper y el router te mandaba a revisar un plan sin relación. Ese fallback no se reescribió, se
> eliminó.
> Y el orden importa porque acá el `plan.md` viaja en el mismo PR que su implementación: el PR
> típico cambia el plan **y** los archivos de su checklist. Con (a) primero, ese caso —el dominante—
> se iría a `/revisar-plan`, que es el comando equivocado.

> **Detalles que parecen menores y no lo son.** El `[ -s "$CHECK" ]` hace que un plan sin bloque de
> checklist no matchee **nada**, en vez de matchear todo. `grep -Fxf` compara líneas completas: no
> depende del orden (a diferencia de `comm`, que con entrada desordenada devuelve un resultado
> incorrecto en silencio), no cuenta `src/a.py` dentro de `src/a.py.bak`, y con una lista vacía o una
> línea en blanco devuelve 0 matches en vez de matchear todo. La extracción **no** filtra por "esto
> parece un path": `Dockerfile`, `Makefile` y `LICENSE` son paths válidos sin barra ni extensión, y
> el ruido que entraría es inofensivo contra una comparación por igualdad exacta.

Cuando se delega, terminar con el mensaje correspondiente a la rama:

```
Plan activo detectado: [ruta]
Archivos cambiados coinciden con el checklist del plan ([MATCHED/TOTAL archivos]).

Siguiente paso: ejecuta /revisar-implementacion [ruta]
```

```
El cambio es un plan de trabajo: [ruta]

Siguiente paso: ejecuta /revisar-plan [ruta]
```

### 2c. Diff local puntual → continuar inline

Si nada de lo anterior aplica, seguir al Paso 3.

---

## Paso 3: Calcular score de profundidad

### 3a. Score por tamaño

```bash
# `--numstat` es la fuente autoritativa de líneas cambiadas. No se filtra el
# diff con un regex para separar contenido de encabezados: ese enfoque falla
# sobre bullets de Markdown (`+- item`), sobre contenido que empieza con `++`
# y sobre comentarios `-- foo` borrados.
# Tampoco se usa `awk` sumando campos posicionales del --shortstat: Claude Code
# sustituye los campos de awk (signo-dólar + dígito) como argumentos posicionales
# del slash command ANTES de que bash vea la línea, y el programa awk queda
# inservible — LOC salía 0 y el router subestimaba todo cambio.
# Por eso este archivo no contiene ningún signo-dólar seguido de dígito, ni
# siquiera dentro de un comentario: se interpolan igual.
LOC=0
while IFS=$'\t' read -r add del _; do
  [ "$add" = "-" ] && continue          # binario: numstat emite "-"
  LOC=$(( LOC + add + del ))
done < <(git diff HEAD --numstat 2>/dev/null)

# Los untracked no aparecen en `git diff`. Se cuentan por archivo (no con `cat`
# de todos juntos, que funde el último renglón sin newline con el siguiente) y
# `grep -I` salta los binarios.
while IFS= read -r f; do
  n=$(grep -Ic '' -- "$f" 2>/dev/null) || n=0
  LOC=$(( LOC + n ))
done < "$UNTRACKED_LIST"
```

| LOC | score_tamaño |
|---|---|
| < 50 | 1 |
| 50–299 | 2 |
| 300–800 | 3 |
| > 800 | 4 |

> El umbral de 300 es load-bearing: es donde el score llega a 3, que recomienda 4 Codex + las 4 secciones de la guía y
> cae bajo la Regla 10. Las bandas no se solapan — 300 pertenece a la tercera.

### 3b. Score por dominio (tabla de globs)

Inspeccionar los paths de `CHANGED` y matchearlos contra esta tabla. El `score_dominio` es el **máximo** de todos los matches.

| Dominio | Score | Cap | Globs (cualquier match) |
|---|---|---|---|
| Sin contenido relevante | — (caso degenerado, ver 1d) | — | merge commit, rename puro, file-mode change |
| Solo docs | 0 | **1** | `**/docs/**`, `**/*.md`, `**/CHANGELOG*`, `**/README*` — **excepto** `.claude/**` y `hooks/**` |
| Solo tests | 0 | **2** | `**/tests/**`, `**/test_*.py`, `**/*.test.{js,ts,tsx}` |
| Configuración ejecutable de Claude | 2 | **2** | `.claude/commands/**`, `.claude/skills/**`, `.claude/agents/**`, `.claude/scripts/**`, `.claude/hooks/**`, `hooks/**`, `.claude/settings*.json` |
| Frontend cosmético | 1 | — | `**/styles/**`, `**/*.css`, `**/*.scss`, `**/components/icons/**`, `**/static/**` — **excepto** lo que matchee docs o tests |
| Backend / scrapers / lógica | 2 | — | `**/src/**`, `**/lambdas/**` (excepto `migrations/`), `**/handlers/**`, `**/utils/**` — **excepto** lo que matchee docs o tests |
| Auth | 3 | — | `**/auth/**`, `**/middleware/auth*`, `**/jwt*`, `**/oauth*`, `**/session*`, `**/cors*` |
| IAM (cloud) | 3 | — | `infra/**/iam_*.tf`, `**/iam_*.tf`, `**/policies/*.json`, `**/aws_iam_*.tf` |
| Migraciones | 3 | — | `**/migrations/m*.py`, `**/migrations/*.sql`, `**/lambdas/coordination/migrations.py`, `**/alembic/**` |
| Secrets (por path) | 3 | — | `**/.env*`, `**/*.pem`, `**/*.key`, `**/secrets/**`, `**/credentials.json`, `**/secret_*.tf`, `**/aws_secretsmanager_*.tf` |
| Infra crítica | 4 | — | `infra/account/**`, `**/aws_kms_*.tf`, `**/aws_route53_*.tf`, `**/aws_organizations_*.tf`, hooks DB (`**/triggers/*.sql`, `**/fn_block_*.sql`) |

**Por qué las exclusiones.** Los dominios se solapan y el score es el máximo, así que sin ellas
`src/tests/test_big.py` puntúa 2 por `**/src/**` y pierde el cap de tests, y `.claude/commands/x.md`
cae en docs por su extensión. La fila de backend ya usaba este idioma (`**/lambdas/**` excepto
`migrations/`). Las filas de score ≥ 3 **no** llevan exclusión, a propósito: un path que sea docs
**e** IAM debe conservar el score 3 y perder el cap.

**Configuración ejecutable de Claude** son comandos, skills, agentes, hooks y settings: lógica
operativa, no documentación pasiva. `hooks/` contiene `.sh` y `settings*.json` es JSON, así que el
dominio no es "Markdown". Se cubren `hooks/**` **y** `.claude/hooks/**` porque `propagar.sh` deja
los hooks en `.claude/hooks/` en los repos consumidores, y `.claude/settings*.json` porque el mismo
script lo crea o modifica en cada destino — sin ese glob, un solo `settings.json` sin cap desactiva
el cap global de toda la propagación.

### Cap por dominio

- El **cap de un path** es el **máximo** de los caps de las filas **con cap** que matchea.
- Si el path matchea alguna fila **sin** cap, ese path **no tiene cap**.
- Hay **cap global** solo si **ningún** path carece de cap. Su valor es el **máximo** de los caps de
  los paths.

Ejemplos: `tests/README.md` matchea docs (1) y tests (2) → cap 2. `src/utils/README.md` matchea solo
docs (backend lo excluye) → cap 1. `infra/account/README.md` matchea docs **e** infra crítica (sin
cap) → sin cap global, nivel 4.

### 3c. Score por scope (cantidad de archivos)

| Archivos cambiados | score_scope |
|---|---|
| 1 | 0 |
| 2–5 | 1 |
| 6–15 | 2 |
| > 15 | 3 |

### 3d. Regex de contenido — detección de secrets

El escaneo es **booleano**: detecta, no vuelca. Estos pipelines no imprimen ni una línea de
contenido — solo fijan un flag y, en el caso de untracked, emiten el path.

```bash
RE_SECRET="(password|secret|token|api_key|bearer|aws_access_key|private_key|client_secret)\s*[:=]\s*['\"][^'\"\$\{]{8,}['\"]"
EXCLUIR="example\|placeholder\|REPLACE_ME\|<.*>"

# --- tracked: el diff completo, sin cota de líneas ---
SECRET_MATCH=0
HITS=$(git diff HEAD --no-color 2>/dev/null \
  | command grep -IE "$RE_SECRET" \
  | command grep -v "$EXCLUIR" \
  | command grep -c .)
[ "${HITS:-0}" -gt 0 ] && SECRET_MATCH=1

# --- untracked: no aparecen en `git diff` ---
SECRET_FILES=$(while IFS= read -r f; do
  n=$(command grep -IE "$RE_SECRET" -- "$f" 2>/dev/null \
        | command grep -v "$EXCLUIR" \
        | command grep -c .)
  [ "${n:-0}" -gt 0 ] && printf '%s\n' "$f"
done < "$UNTRACKED_LIST")
[ -n "$SECRET_FILES" ] && SECRET_MATCH=1
```

> 🚨 **`command grep`, no `grep` a secas — y se CUENTA, no se encadena por exit code.**
> Las dos cosas arreglan el mismo incidente (2026-08-18) y hacen falta las dos.
>
> **1. `grep` no es el binario, y su `-qv` tiene otra semántica.** En las shells del
> equipo `grep` está definido como **función de shell** (la instala el wrapper de rtk
> vía el shell snapshot que Claude Code carga en cada Bash). Medido el 2026-08-18,
> el wrapper implementa `grep -qv P` como **"NINGUNA línea coincide con P"** —o sea
> `! grep -q P`— cuando la semántica real es **"al menos una línea NO coincide con P"**.
> Las dos coinciden solo si la entrada es homogénea, y divergen justo en los dos casos
> que importan:
>
> | entrada | `grep -qv 'a'` | wrapper | binario | |
> |---|---|---|---|---|
> | *(vacía)* | ¿hay línea que no sea `a`? → no | **0** | 1 | falso positivo |
> | `a` | no | 1 | 1 | ok |
> | `b` | sí | 0 | 0 | ok |
> | `a` + `b` | sí (`b`) | **1** | 0 | **falso negativo** |
>
> **2. Las dos divergencias rompen el detector, en direcciones opuestas.**
>
> - **Entrada vacía** es el caso normal (casi ningún diff tiene secrets), así que
>   `SECRET_MATCH=1` salía en **toda** invocación del comando, con cualquier contenido.
> - **Entrada mixta** —un secret real junto a un placeholder, que es exactamente cómo
>   se ve un `.env` de verdad— devolvía `SECRET_MATCH=0`: **el secret real pasaba sin
>   detectar.** Verificado con `token = "example-x"` + `client_secret = "…"`: el
>   binario da 0 (detecta), el wrapper da 1 (no detecta).
>
> **Por qué importa más de lo que parece.** Por la Regla 5 el flag fuerza `nivel ≥ 3`,
> así que **el cap por dominio no aplicaba nunca** (un cambio doc-only de 3 líneas
> salía en nivel 3 pidiendo `/revisar-pr`) y la Regla 10 exigía confirmación explícita
> en cada corrida. Pero lo grave es lo otro: un detector que grita siempre y calla
> justo cuando hay algo **no es un detector ruidoso, es uno invertido**.
>
> `command grep` salta funciones y alias y va al binario del PATH, sin hardcodear
> `/usr/bin/grep` (que no existe en todos los macOS del equipo). Y contar con
> `grep -c .` en vez de encadenar dos `-q` hace la pregunta que de verdad importa
> —"¿queda al menos UNA línea tras descartar placeholders?"— sin depender de cómo se
> comporten dos exit codes en un pipe.
>
> **Corolario para el resto de este archivo y para comandos nuevos:** cualquier
> `grep -q` cuyo valor de retorno decida algo debe ir con `command grep`. Los `grep`
> que solo filtran texto (los de los Pasos 1b y 2b) no están afectados: ahí lo que se
> consume es la salida, no el exit code.

**Por qué `-q` y por qué al final del pipeline.** El enmascarado de más abajo es una instrucción de
reporte: no puede enmascarar retroactivamente lo que el comando ya escribió en stdout. Y ese stdout
entra al transcript de la sesión. El
`head -200` que antes acotaba el escaneo estaba conteniendo esa exposición sin que se hubiera
advertido; al quitarlo — necesario, porque con el cap activo un secret tardío quedaba en nivel 1 con
el detector ciego — hay que cerrar la fuga en el mismo movimiento. Las dos etapas (regex y luego
descarte de placeholders) van completas en ambas ramas: solo la primera sobre-escala, y un
`.env.example` sin trackear forzaría nivel ≥ 3 y con él la confirmación de la Regla 10.

Si `SECRET_MATCH = 1`:
- Forzar `nivel ≥ 3`.
- Para el reporte, obtener `archivo:línea` en una segunda pasada y **enmascarar antes de imprimir**:
  solo primeros y últimos 4 chars + `***` en el medio (ej: `sk-1***cdef`).
- **NUNCA imprimir el valor completo** del posible secret.

**Entropy check opcional** (solo si no hubo match por keyword): contar caracteres únicos en strings añadidos de 20+ chars. Si > 14 caracteres únicos en un string de 20+ → marcar como alta entropy y mostrarlo al usuario para confirmar.

### 3e. Composición del nivel

```
nivel_base = max(score_tamaño, score_dominio) + (1 si score_scope >= 3)
nivel_base = clamp(nivel_base, 0, 4)

# CAP por dominio — sobre el nivel YA compuesto (incluye el +1 de scope), y
# SIEMPRE antes del forzado de escalado. Ver "Cap por dominio" en el Paso 3b.
#
# Dos propiedades que este orden garantiza, y que no son negociables:
#  - El cap no puede tapar un secret: el forzado va después y usa max().
#    Importa porque los globs de secrets por path casi no matchean `.md` —
#    salvo `**/secrets/**` y `**/.env*` — así que en un `.md` el regex de
#    contenido del Paso 3d es la única defensa viva.
#  - El cap aplica al nivel final: capar solo el max(...) dejaría una
#    propagación de >15 archivos en 3, por el +1 de scope.
#
# Un diff MIXTO (docs + código) NO recibe cap: cualquier path sin cap lo
# desactiva, así que puntúa por LOC total. Es deliberado, no un olvido.
si todos_los_paths_de_CHANGED_tienen_cap:
    cap = max(cap_de_cada_path)
    nivel_base = min(nivel_base, cap)

# Forzar escalado si match de contenido o dominio crítico:
si (SECRET_MATCH OR score_dominio >= 3):
    nivel = max(nivel_base, 3)
sino:
    nivel = nivel_base

# Guard para diff degenerado (ya manejado en Paso 1d):
si (diff_vacío OR solo_metadata):
    nivel = 0 con razón explícita
```

---

## Paso 4: Mostrar propuesta + razonamiento

### Tabla de niveles

| Nivel | Caso típico | Equipo | Skills | Acción |
|---|---|---|---|---|
| 0. Trivial | merge commit, rename puro, file-mode (Paso 1d) | Claude principal lee el diff + reporte breve | — | Inline, sin Codex |
| 1. Ligero | <50 LOC, o **documentación pasiva de cualquier tamaño** (cap 1) | 1 Codex generalista | Ninguno | Inline (con `</dev/null`) |
| 2. Medio | 50-300 LOC; **tests** y **configuración ejecutable de Claude** de cualquier tamaño (cap 2) | 2 Codex paralelos | Aplicables (1-2 de los 4) | Inline (con `</dev/null`) |
| 3. Estándar | 300-800 LOC, multi-dominio o crítico | 4 Codex | 4 secciones de la guía | **Recomendar** `/revisar-pr` |
| 4. Profundo | >800 LOC, infra crítica, pre-release | 8 agentes (Intermedio) | 4 secciones de la guía | **Recomendar** `/revisar-pr` con equipo Estándar (12 agentes) |

### Mockup de salida UX

```
Contexto detectado:
  • Repo: <nombre del repo>
  • <N> archivos modificados (Staged: <staged> / Unstaged: <unstaged> / Untracked: <untracked-no-cache> excluidos cache)
  • +<add>/-<del> LOC (<total> total)
  • Paths principales: <muestra de 3-5 paths>
  • Branch: <branch> (<N commits>, <upstream/no upstream>, <PR detectado/sin PR>)

Análisis:
  • score_tamaño = <X> (<LOC> LOC)
  • score_dominio = <X> (<dominio detectado>)
  • score_scope = <X> (<N> archivos)
  • cap por dominio = <1 | 2 | — sin cap> (<motivo: "todo docs" / "docs+tests" / "config ejecutable" / "hay paths sin cap">)
  • Regex de contenido: <sin match / FORZADO POR SECRET DETECTADO: ej sk-1***cdef en src/config.py:42>
  → nivel propuesto: <0-4> (<Trivial/Ligero/Medio/Estándar/Profundo>)

Plan de revisión:
  • <descripción del equipo>
  • <skills cargados>
  • <Seguridad: explícito por dominio crítico / no necesario / forzar con [s]>
  • Estimado: ~<X> min

¿Procedo? [Enter=sí | n=no | 1-4=cambiar nivel | s=forzar seguridad | p=mejor abrimos PR]
```

---

## Paso 5: Confirmación del usuario

| Input | Acción |
|---|---|
| `Enter` (vacío) | Continuar al Paso 6 con el nivel propuesto. **EXCEPTO** si nivel ≥ 3 con delegación: requiere `s` o `si` explícitos. |
| `1`, `2`, `3`, `4` | Cambiar el nivel manualmente y continuar. |
| `s` | Forzar Seguridad activo (relevante en niveles 1-2 que no la tenían). |
| `p` | Preferir flujo de PR: recomendar abrir PR primero y luego usar `/revisar-pr`. Mostrar el comando exacto de `gh pr create`. |
| `n` | Cancelar. |

**Regla 10**: nivel ≥ 3 con delegación NO se confirma con Enter — debe ser `s` o `si`. Esto previene que el usuario apruebe accidentalmente delegar a un comando pesado.

---

## Paso 6: Ejecución (RECOMENDADOR PURO)

> **Recomendador puro**: este comando NO invoca otros slash commands programáticamente — no existe esa primitiva. Para niveles ≥ 3 imprime `Siguiente paso: ejecuta /comando` y termina. Claude (la sesión que está leyendo el output) tomará el "Siguiente paso" e invocará el slash command apropiado en su turno siguiente, igual que cuando el usuario lo tipea.

### Antes de lanzar cualquier Codex (niveles 1-2) — reservar los artefactos

> **Por qué.** Estas salidas iban a rutas FIJAS de `/tmp`
> (`/tmp/resultado-revisar-cambio-N1.md`) y se leían de esas mismas rutas fijas en
> el Paso 7. Con varios agentes revisando en el mismo host, los N escriben y leen
> el MISMO archivo: el último en escribir gana y el resto lee el reporte ajeno
> **sin ningún error** — el archivo existe, es markdown válido, y habla de otro
> diff. El 2026-08-25 eso ocurrió tres veces en un día; un agente vio un veredicto
> «APROBADO» que no era el suyo (`TSK-20260825T212834-5v5s`).

```bash
ART="$(git rev-parse --show-toplevel)/.claude/scripts/artefactos-revision.sh"
REVISION_ID="cambio:$(basename "$(git rev-parse --show-toplevel)")@$(git branch --show-current)@$(git rev-parse --short HEAD)"
ART_DIR="$("$ART" sellar --id "$REVISION_ID")" || exit 1
echo "Artefactos de esta revisión: $ART_DIR"
```

`sellar` deriva `ART_DIR` de la sesión de Claude Code **más** `REVISION_ID`, y
**falla** si no puede identificar la sesión — nunca cae a una ruta compartida.
`artefactos-revision.sh` vive en `.claude/scripts/` de este repo.

> 🔴 **`REVISION_ID` y `ART_DIR` NO sobreviven entre llamadas del tool `Bash`** —
> cada snippet corre en un shell nuevo. Anota los dos valores al reservarlos y
> sustituyelos literalmente en los pasos siguientes, o recalcula el directorio
> (que es determinista) con:
>
> ```bash
> ART_DIR="$("$ART" dir --id "<REVISION_ID literal>")" || exit 1
> ```
>
> `dir` falla si esa identidad no fue sellada, asi que nunca te devuelve una ruta
> inventada.

### Nivel 0 (trivial) — revisión inline sin Codex

Lectura directa del diff por parte de Claude principal + reporte breve. Sin lanzar
Codex — y por lo tanto sin artefactos que reservar ni verificar.

### Nivel 1 (ligero) — 1 Codex generalista inline

```bash
cd $(git rev-parse --show-toplevel) && codex exec --sandbox read-only \
  -o "$ART_DIR/resultado-N1.md" \
  "Revisa el siguiente diff. Reporta bugs, problemas de seguridad obvios y violaciones de YAGNI. Sé conciso.

Tu reporte DEBE empezar con esta línea EXACTA, sola en el primer renglón:
REVISION-ID: $REVISION_ID

$(git diff HEAD)" </dev/null
```

### Nivel 2 (medio) — 2 Codex paralelos inline

Lanzar 2 Codex en paralelo (un solo mensaje con 2 tool calls). Dominios sugeridos: el que detectó score_dominio + Calidad.

Antes de lanzarlos, resolver las reglas de los 2 dominios. **Si esto falla, no
lances los Codex** — informa al usuario y detente (ver el gate abajo):

```bash
for DOM in "<dominio detectado>" Calidad; do
  "$(git rev-parse --show-toplevel)"/.claude/scripts/resolver-doc.sh \
    docs/estandares/guia-code-review.md --seccion "$DOM" \
    > "$ART_DIR/reglas-${DOM}.md" || exit 1
done
```

```bash
# Codex 1 — dominio detectado (ej: Performance)
cd $(git rev-parse --show-toplevel) && codex exec --sandbox read-only \
  -o "$ART_DIR/resultado-N2-dom.md" \
  "[reglas de $ART_DIR/reglas-<dominio>.md, pegadas verbatim] --- [prompt con diff] --- Tu reporte DEBE empezar con la línea EXACTA 'REVISION-ID: $REVISION_ID'" </dev/null

# Codex 2 — Calidad
cd $(git rev-parse --show-toplevel) && codex exec --sandbox read-only \
  -o "$ART_DIR/resultado-N2-cal.md" \
  "[reglas de $ART_DIR/reglas-Calidad.md, pegadas verbatim] --- [prompt con diff] --- Tu reporte DEBE empezar con la línea EXACTA 'REVISION-ID: $REVISION_ID'" </dev/null
```

> **🔴 GATE — nunca revisar sin reglas.** Las reglas van **embebidas** en el prompt,
> no como una ruta que Codex deba abrir. Hasta el 2026-08-20 estas dos líneas
> mandaban `cat ~/.claude/skills/code-review-<dominio>/SKILL.md`; esos skills
> **nunca existieron** en ningún repo del ecosistema, el `cat` fallaba sin abortar
> y los revisores corrían sin reglas de dominio sin que nadie se enterara
> (detectado el 2026-08-18 en el PR #2417 de `agente-de-monitoreo`).

### Nivel 3 (estándar) — RECOMENDAR, no ejecutar

```
Este cambio justifica una revisión estándar (4 Codex + las 4 secciones de la guía).

Siguiente paso: ejecuta /revisar-pr <N>          (si hay PR abierto)
                  o abre el PR (gh pr create) y luego /revisar-pr <N>

No lanzo nada inline en este nivel — el comando especializado tiene el setup correcto
(worktree, skills, equipos, anti-sycophancy).
```

### Nivel 4 (profundo) — RECOMENDAR con flag

```
Cambio profundo / infra crítica. Justifica 8-12 agentes.

Siguiente paso: ejecuta /revisar-pr <N>
  → elige "1. Estándar (12 agentes)" cuando pregunte el equipo
```

---

## Paso 7: Consolidar resultados (solo niveles 1-2)

Si el Paso 6 ejecutó inline (niveles 0-2):

1. **Verificar la pertenencia de cada reporte ANTES de leerlo** — nunca por glob
   sobre `/tmp`, que es justo como se colaba el reporte ajeno:

   ```bash
   # nivel 1
   "$ART" verificar --id "$REVISION_ID" resultado-N1.md || exit 1
   # nivel 2
   "$ART" verificar --id "$REVISION_ID" resultado-N2-dom.md || exit 1
   "$ART" verificar --id "$REVISION_ID" resultado-N2-cal.md || exit 1
   ```

   `verificar` imprime la ruta si el reporte es de esta revisión; si no, sale != 0
   diciendo qué falló (no existe / vacío / sobrante / habla de otro cambio). **Un
   reporte que no pasa no se lee ni se consolida, y no se sustituye por uno
   parecido de `/tmp`** — el que haya ahí es de otro agente.

2. Leer los archivos que `verificar` imprimió.
3. Presentar tabla consolidada:

```
## Resultados — /revisar-cambio nivel <N>

| Agente | Dominio | Veredicto | Críticos | Altos | Medios |
|---|---|---|---|---|---|
| Codex-1 | <dominio> | <APROBADO/CAMBIOS> | <N> | <N> | <N> |
| Codex-2 | Calidad | <APROBADO/CAMBIOS> | <N> | <N> | <N> |

Veredicto consolidado: <APROBADO / CAMBIOS NECESARIOS>
```

4. Hallazgos deduplicados priorizados (críticos → altos → medios).

5. Preguntar siguiente acción:
```
Opciones:
1. Aplicar fixes (yo corrijo en el repo)
2. Ver detalle de un hallazgo
3. Exportar reporte
4. Pasar a /revisar-pr si necesitas más profundidad
```

Si nivel = 0: la "revisión" es directamente la lectura del diff por Claude; no hay archivos que consolidar.

---

## Paso 8: Generar reporte

```bash
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -n "$REPO_ROOT" ]; then
  REPORT_DIR="$REPO_ROOT/docs/revisiones"
else
  # Sin repo git no hay dónde versionar el reporte. Va al directorio de artefactos
  # de ESTA revisión, no a un `/tmp/revisiones` compartido con los demás agentes.
  REPORT_DIR="${ART_DIR:-${TMPDIR:-/tmp}}/revisiones"
fi
mkdir -p "$REPORT_DIR"
DESCRIPCION="<slug-corto-del-cambio>"
REPORT_PATH="$REPORT_DIR/$(date +%Y-%m-%d)-cambio-${DESCRIPCION}.md"
```

Contenido mínimo del reporte:

```markdown
# Revisión /revisar-cambio — YYYY-MM-DD

**Repo:** <nombre>
**Branch:** <branch>
**Nivel propuesto:** <0-4>
**Acción tomada:** <inline N1 / inline N2 / delegado a /revisar-pr <N>>

## Contexto detectado
- Archivos: <N>
- LOC: +<add>/-<del>
- Paths principales: ...

## Scoring
- score_tamaño = <X>
- score_dominio = <X> (<dominio>)
- score_scope = <X>
- cap por dominio = <1 | 2 | — sin cap> (<motivo>)
- Regex de contenido: <sin match / forzado a nivel ≥3 por: ...>

## Hallazgos (si se ejecutó inline)
[tabla + hallazgos priorizados]

## Siguiente paso
<comando recomendado o "ninguno — revisión cerrada inline">
```

Si el reporte queda bajo `$ART_DIR/revisiones/` (no era repo git), avisar al
usuario que es temporal y darle la ruta completa — ese directorio es propio de esta
sesión, así que no lo va a encontrar adivinando.

---

## Reglas hardcodeadas

1. **Heurísticas duras + regex de contenido — sin LLM clasificador.** El scoring es determinista y verificable; no se delega a un modelo la decisión de profundidad.

2. **`</dev/null` obligatorio en TODA invocación de `codex exec*` en background.** Sin él, Codex se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308). Aplica a `codex exec`, `codex exec resume`, `codex exec resume --last`, `codex exec resume <session_id>`. Regla canónica de `/equipo-headless`.

3. **`cd $(git rev-parse --show-toplevel)` obligatorio antes de Codex.** Codex ignora paths del prompt y usa heurísticas propias de descubrimiento. Sin el `cd`, puede analizar el repo equivocado.

4. **Recomendador puro: NO invocar otros slash commands programáticamente.** Terminar con `Siguiente paso: ejecuta /<comando>` y dejar que Claude (la sesión que lee el output) lo tome en su turno siguiente. No existe primitiva para que un slash command invoque a otro.

5. **Forzar nivel ≥ 3 si regex de contenido matchea secrets o dominio crítico** (auth, IAM, migraciones, secrets, infra crítica). Esta regla **no es overridable** por Enter — requiere confirmación explícita. **Se evalúa DESPUÉS del cap por dominio del Paso 3e y lo pisa**: un secret en un `.md` capado a nivel 1 vuelve a ≥ 3. El orden no es negociable — los globs de secrets por path casi no matchean `.md` (salvo `**/secrets/**` y `**/.env*`), así que ahí el regex de contenido es la única defensa viva. Y la detección es **booleana**: ningún pipeline vuelca contenido a stdout, porque el enmascarado es una instrucción de reporte y no puede borrar lo ya impreso.

6. **Path absoluto para reportes:** `$(git rev-parse --show-toplevel)/docs/revisiones/...` (o `$ART_DIR/revisiones/` si no es repo git). No usar paths relativos al cwd.

7. **Caso degenerado** (diff vacío, merge commit, rename puro, file-mode change): nivel 0 con razón explícita, **no** calcular score. Saltar Paso 3.

8. **Lambda coordination con manejo de error** (warning visible, no bloquear). La revisión es la prioridad; el tracking es nice-to-have.

9. **Anti-sycophancy en todos los Codex inline.** Replicar del bloque "Defensas anti-sycophancy" de `/revisar-pr` / `/equipo-headless`: prohibido "You're absolutely right!", "Great point!", etc. La acción habla — describir el fix, no agradecer.

10. **Confirmación explícita para delegación a nivel ≥ 3.** Enter NO basta — requiere `s` o `si`. Esto previene que el usuario apruebe accidentalmente delegar a un comando pesado.

11. **Ningún artefacto de agente a una ruta fija de `/tmp`.** Todo `-o` y toda redirección van a `$ART_DIR` (reservado al inicio del Paso 6), y toda lectura pasa antes por `artefactos-revision.sh verificar`. Con N agentes revisando en el mismo host, una ruta fija se lee cruzada **sin ningún error**: el archivo existe, es markdown válido, y habla de otro cambio. Ocurrió tres veces el 2026-08-25 (`TSK-20260825T212834-5v5s`).

---

## Anti-sycophancy (para Codex inline en niveles 1-2)

Los Codex lanzados por este comando reciben el siguiente bloque en su prompt:

```
Respuestas PROHIBIDAS:
- "You're absolutely right!" / "Great point!" / "Excellent observation!"
- Cualquier expresión de gratitud antes de verificar técnicamente

Proceso obligatorio al revisar:
1. LEER el diff completo sin reaccionar
2. ENTENDER qué cambió y por qué
3. VERIFICAR contra el codebase y CLAUDE.md del repo
4. EVALUAR técnicamente — ¿correcto para ESTE stack/versión? ¿YAGNI? ¿rompe algo?
5. RESPONDER con evaluación técnica, no con gratitud
6. Si está bien, di APROBADO. NO inventes problemas.

Reporta cada hallazgo con archivo:línea + fix sugerido. Fundamenta con evidencia.
```

---

## Cuándo usar este comando

| Situación | Usar |
|---|---|
| No sé si vale `/revisar-pr` o nada | Sí — este comando decide por ti |
| PR abierto en branch actual, quiero saber si vale la pena el flujo de `/revisar-pr` | Sí — detecta el PR y recomienda |
| Diff local chico (<50 LOC), o documentación pasiva de cualquier tamaño | Sí — nivel 1 inline, sin overhead |
| Cambios en `.claude/**` de este repo | Sí — el cap los deja en nivel 2, no en 4 |
| PR específico que ya sabes que es grande | No — `/revisar-pr` directo |
| Plan de trabajo que vas a implementar | No — `/revisar-plan` directo |

> **Default**: si no estás seguro, invoca `/revisar-cambio`. Es el punto de entrada barato que evita ejecutar 4 Codex sobre 5 LOC.
