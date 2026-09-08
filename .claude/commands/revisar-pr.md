---
description: Revisar un PR específico de GitHub con equipo multi-agente headless. Llamado por /revisar-cambio cuando detecta un PR abierto. No invocar directo salvo que ya sepas que es ese caso.
allowed-tools: Bash(codex:*), Bash(git:*), Bash(gh:*), Bash(which:*), Bash(sleep:*), Bash(cat:*), Bash(rm:*), Read, Write, Edit, Glob, Grep, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, TaskStop, SendMessage
---

> **Default**: si no estás seguro de cuál comando usar, invoca `/revisar-cambio` — meta-comando que analiza el contexto y delega al hijo correcto (incluyendo este). Este comando lo usas directo solo si ya sabes que vas a revisar un PR específico.

# Revisar PR

Ejecuta una revisión de código de un PR específico de GitHub con equipo multi-agente headless. El comando resuelve el problema crítico de branch context: los revisores leen SIEMPRE desde un worktree de la branch del PR, nunca desde el working directory principal (que puede estar en `main`).

**Input:** URL o referencia del PR (ej: `owner/repo#123` o `https://github.com/owner/repo/pull/123`)
**Equipo:** Básico Codex por defecto (1 Codex por dominio activo)
**Política de cierre:** Consenso — todos los revisores que respondieron dentro de su deadline deben decir APROBADO para terminar (un agente `timed_out` no cuenta ni a favor ni en contra — plan `canal-retorno-subagentes-deadline`, ver Paso 8)

**Diferencia con `/revisar-cambio`:**
- `/revisar-cambio` es el router barato: clasifica profundidad y revisa inline los cambios chicos (niveles 0-2)
- `/revisar-pr` es el ejecutor pesado: worktree de la branch del PR, un revisor por dominio, verificación de documentación

---

## Paso 0: Verificar herramientas

```bash
which gh && which codex
```

Si alguno falta:
```
ERROR: [herramienta] no disponible.

Para gh: brew install gh && gh auth login
Para codex: npm install -g @openai/codex && codex auth login
```

**STOP** — no continuar sin ambas herramientas.

---

## Paso 1: Parsear input

### Si el usuario pasó argumento:

Parsear para extraer `OWNER`, `REPO`, `PR_NUMBER`. Formatos soportados:

| Formato | Ejemplo |
|---------|---------|
| `owner/repo#number` | `Kairos-PMC/kairos_prototipo#12` |
| `https://github.com/owner/repo/pull/number` | `https://github.com/Kairos-PMC/kairos_prototipo/pull/12` |
| Solo número | `285` (asume el repo del working directory actual) |

### Si no pasó argumento:

Preguntar:
```
¿Qué PR quieres revisar? (ej: Kairos-PMC/kairos_prototipo#12)
```

---

## Paso 2: Obtener información del PR

```bash
gh pr view PR_NUMBER --repo OWNER/REPO \
  --json number,title,body,headRefName,baseRefName,files,author,state,mergeable,mergeStateStatus
```

Mostrar resumen al usuario:

```
PR #285 — "Fix extracción PDFs DAPRE con páginas dinámicas"
Repo:    Kairos-PMC/kairos_prototipo
Branch:  fix/bug-dapre-pdfs → main
Autor:   @sebastian-bitar
Estado:  open
CI:      ✓ clean (o ✗ dirty / ⚠ unstable)
Archivos modificados (N):
  - src/lambdas/scrapers/dapre/scraper.py
  - src/lambdas/scrapers/dapre/utils.py
  - tests/test_dapre.py

¿Revisar este PR? (si/no)
```

**Esperar confirmación** antes de crear el worktree.

---

## Paso 3: Crear worktree de la branch del PR

**CRÍTICO** — Este paso es la razón de existir de este comando. Sin él, los revisores leen el código en la branch activa del repo (generalmente `main`), no el código del PR.

Incidente que motivó este comando (2026-04-14): En una revisión headless, los revisores (Auggie) recibieron rutas del working directory principal en `main`, pero los cambios estaban en la branch del PR (`fix/bug-dapre-pdfs`) dentro de worktrees en /tmp/. Resultado: Auggie reportó que "los cambios no existen". Codex no tuvo el problema porque su modo headless hacía descubrimiento/checkout propio en ese momento.

### 3-cero. Reservar los artefactos de ESTA revisión (OBLIGATORIO)

> **Por qué existe este paso.** El clon, el worktree, las reglas de dominio y los
> reportes de los revisores iban todos a rutas FIJAS de `/tmp`
> (`/tmp/repo-pr-N`, `/tmp/review-pr-N`, `/tmp/reglas-{DOM}-pr-N.md`,
> `/tmp/resultado-{dominio}-codex-pr-N.md`) y se leían de esas mismas rutas fijas.
> El número de PR separa revisiones de PRs distintos, pero **no** separa a dos
> agentes revisando el MISMO PR — y ahí la colisión tiene una vuelta peor que
> leerse el reporte cruzado: el Paso 11 de un agente hace
> `rm -rf /tmp/repo-pr-N` y le borra el clon al otro **a mitad de revisión**.
> El 2026-08-25, con 7 subagentes revisando en el mismo host, tres agentes
> leyeron reportes ajenos creyéndolos propios; uno vio un veredicto «APROBADO» de
> un PR que no era el suyo (`TSK-20260825T212834-5v5s`).

```bash
ART="$(git rev-parse --show-toplevel)/.claude/scripts/artefactos-revision.sh"
REVISION_ID="pr-PR_NUMBER@OWNER/REPO@$(gh pr view PR_NUMBER --repo OWNER/REPO --json headRefOid --jq '.headRefOid[0:7]')"
ART_DIR="$("$ART" sellar --id "$REVISION_ID")" || exit 1
echo "Artefactos de esta revisión: $ART_DIR"
```

- `sellar` deriva `ART_DIR` de la sesión de Claude Code **más** `REVISION_ID`, y
  **falla** si no puede identificar la sesión — nunca cae a una ruta compartida.
- El SHA del head entra en `REVISION_ID`: si el autor empuja commits nuevos a
  mitad de revisión, la identidad cambia y los reportes de la revisión anterior
  dejan de validar. Eso es lo correcto — hablaban de otro código.
- `artefactos-revision.sh` vive en `.claude/scripts/` de este repo.

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

### 3a. Localizar el repo local

Resolver `REPO_LOCAL_PATH` sin rutas hardcodeadas:

1. Si el working directory actual ES el repo objetivo (su remote apunta a `OWNER/REPO`), reusar ese checkout:
```bash
# El slug se extrae del remote, sin hardcodear la org: si el repo se mueve de
# cuenta u organizacion, esto lo sigue resolviendo. Un slug vacio hace caer al
# clon del punto 2 — que funciona igual, solo mas lento.
CWD_SLUG=$(git remote get-url origin 2>/dev/null \
  | sed -nE 's#.*[:/]([^/]+/[^/.]+)(\.git)?/?$#\1#p')
if [ "$CWD_SLUG" = "OWNER/REPO" ]; then
  REPO_LOCAL_PATH=$(git rev-parse --show-toplevel)
fi
```

2. Si no, clonar dentro del directorio de artefactos de esta revisión (fallback
   universal, funciona para cualquier dev):
```bash
git clone https://github.com/OWNER/REPO.git "$ART_DIR/repo"
REPO_LOCAL_PATH="$ART_DIR/repo"
```

### 3b. Fetch y crear worktree

```bash
# Fetch de la branch del PR
git -C REPO_LOCAL_PATH fetch origin HEAD_REF_NAME

# Crear worktree temporal
# ESTE worktree se queda bajo un directorio temporal A PROPOSITO, a diferencia de
# un worktree de trabajo de larga vida. Este es efimero por diseno: se borra al cerrar la
# revision, asi que su volatilidad es la propiedad correcta y no un bug. No lo
# "unifiques" con la base persistente por consistencia.
#
# Lo que SI cambio (2026-08-25): cuelga de $ART_DIR, propio de esta sesion, en vez
# de /tmp/review-pr-N compartido. Con dos agentes revisando el MISMO PR, la ruta
# fija hacia que el `worktree remove` del Paso 11 de uno le borrara el checkout al
# otro a mitad de revision.
git -C "$REPO_LOCAL_PATH" worktree add "$ART_DIR/review" HEAD_REF_NAME
```

`WORKTREE_PATH = $ART_DIR/review`

Verificar que el worktree existe antes de continuar:
```bash
ls "$ART_DIR/review"
```

Si falla la creación del worktree, STOP e informar al usuario. No continuar con rutas incorrectas.

---

## Paso 4: Leer contexto del repo

Desde el worktree, recopilar:

### 4a. Reglas del proyecto

```bash
# CLAUDE.md del repo. El aviso explícito evita el otro sabor del mismo fallo: con
# solo `2>/dev/null`, un repo sin CLAUDE.md dejaba la sección "Reglas del proyecto" del
# brief vacía y la verificación de alineación (más abajo) sin nada contra qué
# comparar, sin que se notara. Aquí no abortamos —hay repos legítimamente sin
# CLAUDE.md— pero el hueco queda VISIBLE en el brief.
# (Ojo: `cat X 2>/dev/null | head -200 || echo AVISO` NO sirve — el exit code de
# un pipeline es el del ÚLTIMO comando, y `head` sale 0 aunque `cat` falle.
# Hay que probar el archivo explícitamente.)
if [ -f WORKTREE_PATH/CLAUDE.md ]; then
  head -200 WORKTREE_PATH/CLAUDE.md
else
  echo "[AVISO] WORKTREE_PATH/CLAUDE.md no existe — el brief va SIN reglas del proyecto"
fi

# Reglas de revisión — fuente de verdad en docs/estandares/guia-code-review.md.
# El script las lee del repo y FALLA RUIDOSAMENTE si no consigue el documento
# o la sección pedida.
#
# Una sección por dominio: Seguridad, Performance, Arquitectura, Calidad.
for DOM in Seguridad Performance Arquitectura Calidad; do
  "$(git rev-parse --show-toplevel)"/.claude/scripts/resolver-doc.sh \
    docs/estandares/guia-code-review.md --seccion "$DOM" \
    > "$ART_DIR/reglas-${DOM}.md" || exit 1
done

# ADRs (si existen dentro del subrepo)
ls WORKTREE_PATH/docs/adr/ 2>/dev/null | head -20
```

> **🔴 GATE — si la resolución de las reglas falla, ABORTA la revisión.**
> Si `resolver-doc.sh` sale con código != 0 (o los `$ART_DIR/reglas-*.md`
> quedan vacíos), **no lances ningún revisor**: informa al usuario que no pudiste
> cargar la guía de code review y detén el comando. Este gate existe porque el
> modo de falla anterior era silencioso: hasta el 2026-08-20 el brief mandaba
> `cat ~/.claude/skills/code-review-{dominio}/SKILL.md`, esos skills **nunca
> existieron** en ningún repo del ecosistema, el `cat` fallaba sin abortar, y los
> 4 revisores corrían sin reglas de dominio sin que nadie se enterara (detectado
> el 2026-08-18 revisando el PR #2417 de `agente-de-monitoreo`).
> Una revisión sin reglas se ve exactamente igual que una revisión buena.

### 4b. Diff del PR

```bash
gh pr diff PR_NUMBER --repo OWNER/REPO
```

---

## Paso 5: Seleccionar equipo

```
Equipo de revisión:

1. Estándar (8 agentes: 4 Claude + 4 Codex)
2. Intermedio (8 agentes: 4 Claude + 4 Codex)
3. Básico Codex (4 agentes: 1 Codex por dominio) — DEFAULT
4. Básico Claude (4 agentes: 1 Claude por dominio)
5. Ligero (2 agentes: seguridad + calidad)
6. Custom

DEFAULT: Básico Codex. Codex es el agente más minucioso para encontrar problemas.
¿Cuál prefieres? (Enter = Default)
```

### Asignación de dominios

**Seguridad SIEMPRE activo.** Los demás dominios se activan según los archivos modificados:

| Archivos cambiados | Dominios adicionales |
|---|---|
| `src/api/`, `src/core/`, `src/db/` | Arquitectura, Calidad |
| `src/lambdas/migrations/` | Performance (CONCURRENTLY, N+1, índices) |
| `infra/*.tf` | Arquitectura |
| `frontend/src/` | Calidad, Performance |
| `lambdas/src/` | Calidad |
| Solo tests o docs | Calidad |

Informar al usuario si algún dominio se desactiva:
```
Solo hay cambios en tests/ — desactivando Arquitectura y Performance.
Dominios activos: Seguridad (siempre), Calidad
```

### Scope del agente de seguridad

En revisiones de PR, el agente de seguridad revisa un subconjunto enfocado:
1. **6 principios ADR-003**: errores internos, secrets, auth via token, validación de input, menor privilegio, rate limiting
2. **Reglas de la guía de code review** (`docs/estandares/guia-code-review.md`, sección Seguridad): IDOR, ownership, PII en responses, email allowlist, env vars wired, no wildcards IAM
3. **Items de código**: CORS, XSS, SQL injection, `str(e)` en responses, `html.escape()` en templates

**NO revisa**: controles de infraestructura cloud, networking, política de datos, rotación de credenciales.

---

## Paso 6: Generar brief

Crear `scratch/equipo/brief-pr-PR_NUMBER.md` con:

```markdown
# Brief de Revisión — PR #PR_NUMBER

## Contexto del PR
- **Título:** [título]
- **Autor:** [autor]
- **Branch:** HEAD_REF → BASE_REF
- **Repo:** OWNER/REPO

## Descripción del PR
[body del PR]

## WORKTREE — Leer código DESDE AQUÍ
**IMPORTANTE:** El código de este PR está en WORKTREE_PATH.
Lee archivos EXCLUSIVAMENTE desde esa ruta. NO leas desde el working directory
principal del repo (que puede estar en main u otra branch).

Los archivos modificados en este PR son:
- WORKTREE_PATH/path/to/file1.py
- WORKTREE_PATH/path/to/file2.ts
[lista completa con rutas absolutas al worktree]

## Tu dominio: [DOMINIO]

## Reglas de tu dominio (verbatim)

[Pegar aquí el contenido de $ART_DIR/reglas-{DOMINIO}.md, el que resolvió
el Paso 4a. Va EMBEBIDO en el brief, no como una ruta que el revisor deba abrir:
el revisor no tiene que resolver nada, y si el contenido faltara el comando ya
habría abortado en el gate del Paso 4a.]

Esas son las reglas de tu dominio y son la fuente de verdad de este repo
(`docs/estandares/guia-code-review.md`).
Si esta sección llegara vacía, responde `BLOQUEADO: brief sin reglas de dominio`
y no revises.

## Reglas del proyecto (CLAUDE.md)
[contenido relevante del CLAUDE.md del repo — máx. 200 líneas]

## Verificación de alineación con documentación

Además de la revisión de código estándar, verificar:

1. **CLAUDE.md del repo** — ¿Los cambios respetan las reglas del proyecto?
   (ej: sistema de migraciones correcto, naming, estructura de archivos)
2. **ADRs vigentes** — ¿El código respeta las decisiones de arquitectura documentadas?
   Revisar WORKTREE_PATH/docs/adr/ si existe.
3. **Docstrings y comentarios** — ¿Se modificó comportamiento documentado sin
   actualizar la documentación inline?
4. **README o docs de módulo** — ¿Hay funcionalidad nueva que debería estar
   documentada y no lo está?
5. **guia-code-review.md** — ¿Las reglas del equipo están siendo respetadas?

Reportar inconsistencias con documentación como hallazgos MEDIOS (a menos que
sea violación directa de una regla del proyecto, que es ALTO).

## Formato de respuesta

### Veredicto: [APROBADO | CAMBIOS NECESARIOS | BLOQUEADO]

- **APROBADO** — ningún hallazgo crítico ni alto; el PR puede mergearse
- **CAMBIOS NECESARIOS** — hay altos o críticos; requiere fixes antes del merge
- **BLOQUEADO** — problema grave de seguridad o arquitectura que invalida el enfoque

### Hallazgos

#### CRÍTICOS (bloquean merge)
1. [Título] — [Descripción] — [Archivo:línea] — [Fix sugerido]

#### ALTOS
1. [Título] — [Descripción] — [Archivo:línea] — [Fix sugerido]

#### MEDIOS (incluyendo inconsistencias con documentación)
1. [Título] — [Descripción] — [Fix sugerido]

#### BAJOS
1. [Título] — [Descripción]

### Resumen
[2-3 oraciones sobre el estado del PR]

IMPORTANTE:
- Cita archivos y líneas específicas. No hagas observaciones genéricas.
- Si el PR está bien, di APROBADO. No inventes problemas.
- Fundamenta cada hallazgo con evidencia del código.
- NO seas complaciente. Si hay un bug o riesgo real, repórtalo.
```

---

## Paso 7: Lanzar agentes en paralelo

**REGLA**: Lanzar TODOS en un solo mensaje con múltiples tool calls.

### Claude agents → Agent tool

**`subagent_type: "general-purpose"` es OBLIGATORIO — agente fresco con contexto limpio.** NUNCA omitir el `subagent_type` (eso lanzaría un fork que hereda el contexto y prompt cache del padre, contaminando la revisión adversarial). Cada revisor de dominio debe llegar al PR sin los sesgos de la sesión coordinadora.

```
Agent tool:
  subagent_type: "general-purpose"
  isolation: "worktree"
  name: "claude-{dominio}-pr-PR_NUMBER"
  prompt: "[contenido completo del brief, incluyendo worktree path y rutas absolutas]"
```

> **⚠️ `isolation: "worktree"` es OBLIGATORIO, no `run_in_background: true`** (no existe en el tool `Agent` — los `Agent` corren async por defecto). Plan `canal-retorno-subagentes-deadline`: un `Agent` con `name` sin `isolation` aterriza en `in_process_teammate`, inconsultable vía `TaskOutput`.

### Codex → cd WORKTREE_PATH + codex exec

```bash
cd WORKTREE_PATH && codex exec --sandbox read-only -o "$ART_DIR/resultado-{dominio}-codex.md" \
  "[instrucciones del brief — CON las reglas del dominio ya embebidas verbatim, ver Paso 6]

Tu reporte DEBE empezar con esta línea EXACTA, sola en el primer renglón:
REVISION-ID: $REVISION_ID" </dev/null
```

El `cd WORKTREE_PATH` es OBLIGATORIO. Sin él, Codex usa su propia heurística de descubrimiento y puede leer el repo equivocado o la branch equivocada.

**`-o "$ART_DIR/..."` es igual de obligatorio**, y la línea `REVISION-ID:` del brief no es decorativa: es lo que el Paso 8 verifica para saber que el reporte es de este PR y no del que está revisando otro agente.

**`</dev/null` al final es OBLIGATORIO en background.** Cuando `codex exec` corre dentro de `run_in_background: true` (o cualquier contexto donde stdin no es un TTY pero sigue abierto), Codex detecta el stdin no-TTY y activa su modo "leer prompt adicional desde stdin hasta EOF". Como el background shell de Claude Code mantiene stdin abierto, Codex se queda bloqueado en `Reading additional input from stdin...` sin analizar nada. Síntoma: proceso vivo (`ps` lo muestra), 0% CPU, archivo de output nunca se crea. Incidente: 2026-04-23 revisión PR #308 — 4 Codex colgados 13 min sin producir resultado. Fix: agregar `</dev/null` al final del comando para cerrar stdin explícitamente. En uso interactivo (TTY) funciona sin el redirect; el bug solo se manifiesta en background.

### Timeouts

- **CLIs externos (Codex/Auggie, via `Bash`):** timeout real de proceso. Default: 300000ms (5 min).
  PRs con muchos archivos o migraciones: 600000ms (10 min).
- **Agentes Claude (via `Agent` tool):** sin timeout real de proceso — usan el mecanismo de deadline
  del Paso 8 (`TaskOutput` acotado, perfil "revision amplia": hasta 600000ms/10min por sondeo,
  encadenable si el trabajo real necesita más dentro del presupuesto total). Ver
  `docs/estandares/subagentes-con-deadline.md`.

---

## Paso 8: Recolectar y consolidar resultados

Cuando todos los agentes terminen — o entren en estado terminal (`idle` con resultado, `timed_out`,
`failed`; ver "Deadline y quorum" abajo):

1. Leer resultados (Read tool para archivos /tmp, texto directo para Claude agents)
2. Presentar tabla consolidada:

```
## Resultados Ronda 1 — PR #PR_NUMBER

| Agente | Dominio | Veredicto | Críticos | Altos | Medios | Doc gaps |
|--------|---------|-----------|----------|-------|--------|----------|
| Codex Seguridad | Seguridad | CAMBIOS NECESARIOS | 1 | 1 | 0 | 0 |
| Codex Calidad | Calidad | APROBADO | 0 | 0 | 2 | 1 |
| Claude Arquitectura | Arquitectura | `timed_out` (no respondio dentro del deadline) | — | — | — | — |

Veredicto consolidado: CAMBIOS NECESARIOS (1 crítico, 1 alto) — sobre 2 de 3 agentes;
Claude Arquitectura quedo timed_out y no cuenta ni a favor ni en contra
```

### Deadline y quorum (Fase 6 del plan `canal-retorno-subagentes-deadline`)

Los agentes **Codex/Auggie** (CLIs externos) ya tienen timeout real de proceso vía `Bash` — si no
responden dentro de su timeout, el propio `Bash` los corta y eso ya se maneja como "Si un agente
falla" (fuera de esta sección). Este mecanismo aplica **solo a agentes Claude** (`Agent` tool):

Si un agente Claude no noticio dentro de su deadline (perfil "revision amplia", hasta 600000ms/10min
por sondeo — ver "Timeouts" arriba): **un** sondeo acotado —
`TaskOutput(agent_id, block: true, timeout: <tiempo restante>)` — NO un loop. Si tampoco responde:
`TaskStop(agent_id)` best-effort, marcar `timed_out`, y continuar sin ese agente.

**Default de quorum:** "todos deben decir APROBADO" (regla 12 de "Reglas hardcodeadas") se calcula
**sobre los agentes que respondieron dentro de su deadline** — un `timed_out` no cuenta ni a favor ni
en contra, y NO bloquea indefinidamente el cierre de la revisión (antes de esta corrección, un solo
agente colgado impedía cerrar el PR para siempre). Reportar cada `timed_out` explícitamente en la
tabla y en el veredicto consolidado — nunca ocultarlo ni contarlo como aprobación silenciosa.

**Verificar la pertenencia de cada reporte externo ANTES de leerlo:**

```bash
for DOM in seguridad performance arquitectura calidad; do
  "$ART" verificar --id "$REVISION_ID" --esperado "PR_NUMBER" \
    "resultado-${DOM}-codex.md" || echo "⚠ $DOM sin veredicto utilizable"
done
```

`verificar` imprime la ruta si el reporte es de esta revisión; si no, sale != 0
diciendo qué falló (no existe / vacío / sobrante de la ronda anterior / habla de
otro PR). **Un reporte que no pasa no se lee ni se consolida, y no se sustituye
por uno parecido de `/tmp`** — el que haya ahí es de otro agente. Ese dominio
entra a la tabla como `sin veredicto`, igual que un `timed_out`, y **nunca** como
aprobación silenciosa.

3. Presentar hallazgos priorizados (deduplicados):

```
## Hallazgos

### CRÍTICOS (bloquean merge)
1. [Título] — reportado por N agentes. Archivo: X:L. Fix: Y.

### ALTOS
...

### Inconsistencias con documentación
...
```

---

## Paso 9: Decidir siguiente paso

```
Opciones:
1. Aplicar fixes (yo corrijo en el worktree y pusheo)
2. Ver detalle de un hallazgo específico
3. Exportar reporte para enviarlo al autor del PR
4. Dejar comentario de revisión en GitHub (sin aprobar ni rechazar)
5. Aprobar el PR en GitHub  [solo si veredicto = APROBADO]
6. Solicitar cambios formalmente en GitHub
7. Pasar a ronda 2 sin cambios
```

### Si elige aplicar fixes (opción 1):

1. Aplicar en orden de prioridad (críticos → altos → medios)
2. Correr lint + tests después de cada bloque:
   ```bash
   cd WORKTREE_PATH && ruff check . && pytest   # backend
   cd WORKTREE_PATH && npm run lint && npm run typecheck  # frontend
   ```
3. Pushear fixes a la branch del PR:
   ```bash
   cd WORKTREE_PATH && git add [archivos] && git commit -m "fix: [descripción]" \
     && git push origin HEAD_REF_NAME
   ```
4. Verificar mergeable_state post-push:
   ```bash
   gh pr view PR_NUMBER --repo OWNER/REPO --json mergeable,mergeStateStatus
   ```
5. Preguntar si lanzar ronda 2

### Si elige aprobar en GitHub (opción 5, solo si APROBADO):

```bash
gh pr review PR_NUMBER --repo OWNER/REPO --approve \
  --body "Revisado por equipo multi-agente (Básico Codex). N medios, N bajos — ninguno bloquea el merge."
```

### Si elige solicitar cambios (opción 6):

```bash
gh pr review PR_NUMBER --repo OWNER/REPO --request-changes \
  --body "[resumen de hallazgos críticos y altos con archivo:línea y fix sugerido]"
```

---

## Paso 10: Ronda 2+ (si aplica)

Si el usuario pidió re-revisión después de fixes:

1. Crear `scratch/equipo/brief-pr-PR_NUMBER-r2.md` con lista de fixes aplicados
2. Relanzar SOLO los agentes que reportaron hallazgos (APROBADO en ronda 1 = no re-evaluar)

**Re-sellar ANTES de relanzar** — `sellado_en` es la marca contra la que se mide la
frescura del reporte. Sin re-sellar, la ronda 2 aceptaría los reportes de la ronda 1
como si fueran nuevos:

```bash
ART_DIR="$("$ART" sellar --id "$REVISION_ID" --ronda 2)" || exit 1
```

**Codex — sesión FRESCA por dominio, nunca `resume --last`:**
```bash
cd WORKTREE_PATH && codex exec --sandbox read-only \
  -o "$ART_DIR/resultado-{dominio}-codex-r2.md" \
  "[brief de ronda 1 del dominio + reglas del dominio + brief con fixes, concatenados, con la misma línea REVISION-ID: $REVISION_ID]" </dev/null
```

> 🔴 **`resume --last` está PROHIBIDO aquí, y el motivo es el mismo bug que este
> comando ya arregló en las rutas de artefacto.** Este paso lanza los 4 Codex de
> dominio **en paralelo desde el mismo `cd WORKTREE_PATH`**. `--last` resuelve a
> «la última sesión de Codex de ese directorio», no a «la tuya»: con 4 sesiones
> hermanas, los 4 `resume --last` apuntan al mismo sitio y el revisor de Seguridad
> recibe el contexto del de Performance (o del que haya terminado último), sin
> ningún error visible.
>
> **`verificar` NO lo atrapa, y por eso hay que cerrarlo en la escritura.** La
> sesión equivocada escribe en *tu* `$ART_DIR`, con *tu* `REVISION-ID` (se lo pide
> tu prompt), dentro de la ventana de frescura de *tu* sello: los cuatro chequeos
> pasan y el reporte entra al consolidado como propio. La verificación de
> pertenencia demuestra que el archivo es de esta revisión, no que el revisor haya
> leído el cambio de esta revisión.
>
> La sesión fresca cuesta más tokens que un resume y es **determinista**, que es lo
> que se está comprando. Si necesitás continuidad real, pasá el `<session_id>`
> explícito del Codex de *ese* dominio (guardado en `scratch/equipo/state.json` en
> la ronda 1) — nunca `--last`.

Y al recolectar, verificar los artefactos de la ronda nueva
(`"$ART" verificar --id "$REVISION_ID" "resultado-{dominio}-codex-r2.md"`).

El `</dev/null` también aplica al `codex exec resume` — la regla es idéntica para cualquier invocación de `codex exec` en background.

**Claude (resume):**
```
Agent tool con resume: "[agent_id guardado en state.json]"
```

Repetir Pasos 8-9. **Máximo 5 rondas.**

---

## Paso 11: Limpiar worktree

**SIEMPRE al terminar**, sin importar si la revisión aprobó o no:

```bash
# Si el repo es local (está en Workspace)
git -C "$REPO_LOCAL_PATH" worktree remove "$ART_DIR/review" --force

# Un solo comando barre el clon temporal, las reglas y los reportes de ESTA
# revisión — y nada de lo de los demás agentes. Nunca uses un glob sobre el
# directorio base: barrería los artefactos de todas las revisiones de la máquina.
"$ART" limpiar --id "$REVISION_ID"
```

Confirmar:
```bash
ls "$ART_DIR/review" 2>/dev/null \
  && echo "ADVERTENCIA: worktree aun existe" \
  || echo "OK: worktree eliminado"
```

---

## Paso 12: Guardar reporte

```
docs/revisiones-pr/YYYY-MM-DD-pr-PR_NUMBER.md
```

Contenido:
```markdown
# Revisión PR #PR_NUMBER — [título]

**Fecha:** YYYY-MM-DD
**Autor del PR:** [autor]
**Branch:** HEAD_REF → BASE_REF
**Equipo:** [equipo seleccionado]
**Rondas:** N
**Veredicto final:** [APROBADO | CAMBIOS NECESARIOS | BLOQUEADO]

## Hallazgos
[tabla consolidada final]

## Inconsistencias con documentación
[gaps encontrados]

## Acción tomada
[aprobado en GitHub / solicitud de cambios / reporte al autor]
```

---

## Reglas hardcodeadas

1. **Worktree SIEMPRE** — los agentes leen desde `$ART_DIR/review`, nunca desde el working directory principal
2. **Fetch antes de worktree** — garantiza que la branch está al día con origin
3. **Verificar que el worktree existe** antes de construir cualquier brief
4. **Limpiar worktree al terminar** — siempre, aunque la revisión falle o el usuario cancele
5. **cd WORKTREE_PATH obligatorio** para Codex — los CLIs externos ignoran rutas del prompt
6. **Seguridad SIEMPRE activa** — no se puede desactivar
7. **Rutas absolutas al worktree** en todos los prompts de agentes externos
8. **Lanzar todos los agentes en paralelo** — un solo mensaje con múltiples tool calls
9. **Codex exec, no codex directo** — SIEMPRE `codex exec --sandbox read-only`
9b. **`</dev/null` obligatorio al final de todo `codex exec` en background** — sin él, Codex se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308)
10. **Verificar mergeable_state** antes de pushear fixes o aprobar el PR
11. **NO buscar API keys** — codex ya está autenticado; si falla, avisar al usuario
12. **Consenso para APROBADO** — todos los agentes que respondieron dentro de su deadline deben decir APROBADO; si uno dice CAMBIOS NECESARIOS, iterar. Un `timed_out` no cuenta ni a favor ni en contra, y NO bloquea el cierre indefinidamente (ver "Deadline y quorum", Paso 8)
13. **NO aplicar fixes sin confirmación** del usuario
14. **Guardar reporte siempre** — incluso si el PR está limpio
15. **Inconsistencias de documentación** — incluirlas en el reporte y en el comentario al autor del PR
16. **Agentes Claude SIEMPRE con `isolation: "worktree"`, NUNCA `run_in_background: true`** (no existe en el tool `Agent`) — plan `canal-retorno-subagentes-deadline`

---

## Anti-sycophancy (para agentes revisores)

Los agentes de IA tienden a ser complacientes. Aplica a todos los agentes del equipo:

**Respuestas PROHIBIDAS:**
- "You're absolutely right!" / "Great point!" / "Excellent observation!"
- Cualquier expresión de gratitud antes de verificar técnicamente

**Proceso obligatorio al recibir feedback:**
1. LEER — todo el feedback sin reaccionar
2. ENTENDER — reafirmar en palabras propias
3. VERIFICAR — contra el codebase en WORKTREE_PATH
4. EVALUAR — ¿técnicamente correcto para ESTE proyecto?
5. RESPONDER — con evaluación técnica, no con gratitud
6. IMPLEMENTAR — uno a la vez, verificando después de cada cambio

Los revisores DEBEN hacer pushback cuando el feedback rompe funcionalidad, viola YAGNI, o es incorrecto para este stack.

---

## Cuándo usar este comando

| Situación | Usar |
|-----------|------|
| Revisar PR de Sebastián o Raúl antes de mergear | Sí |
| Revisar PR propio (David + Claude) antes de auto-merge | Sí — el pair programming AI comete errores sutiles |
| PR con cambios de infra crítica (IAM, migraciones, secrets) | Sí, obligatorio antes de avisar al CTO |
| PR de repo no clonado localmente | Sí — el comando lo clona en /tmp |
| Self-merge de hotfix urgente | No — revisar manualmente |
| PR de 1-2 archivos triviales (typo fix, doc update) | Probablemente no |
