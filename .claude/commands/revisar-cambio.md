---
description: Meta-comando que analiza la profundidad de revisión necesaria y recomienda el comando especializado correcto. Puerta de entrada para toda revisión de código, PR, plan o implementación — invocar este antes que /revisar-pr, /revisar-plan o /revisar-implementacion salvo que ya sepas exactamente cuál corresponde.
argument-hint: "[PR | ruta-a-archivo | ruta-a-plan.md | vacío para diff local]"
allowed-tools: Bash(codex:*), Bash(git:*), Bash(gh:*), Bash(grep:*), Bash(find:*), Bash(cat:*), Bash(which:*), Bash(sleep:*), Bash(awk:*), Bash(wc:*), Bash(jq:*), Read, Write, Edit, Glob, Grep, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, SendMessage, Skill
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
- `/revisar-pr` es el ejecutor especializado (4 Codex + guía de code review).
- Solo niveles 1-2 (chico, contexto puntual) se ejecutan inline aquí.

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

# Separar staged / unstaged / untracked (excluyendo cache)
STAGED=$(git diff --cached --name-only 2>/dev/null)
UNSTAGED=$(git diff --name-only 2>/dev/null)
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null \
  | grep -vE '^(\.claude/|_remote_cache/|node_modules/|\.next/|dist/|build/)')
```

### 1c. CASO DEGENERADO — diff vacío

Si `$STAGED` + `$UNSTAGED` + `$UNTRACKED` están vacíos:

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

```bash
find "$(git rev-parse --show-toplevel)" -path "*/planes-de-trabajo/pendientes/*/plan.md" -type f 2>/dev/null
```

| Resultado | Comportamiento |
|---|---|
| **0 resultados** | No hay plan activo. Continuar. |
| **1+ resultados** | Comparar archivos del checklist del/los plan(es) con archivos cambiados. Si match alto (≥50% de los archivos cambiados están en el checklist) → recomendar `/revisar-implementacion <plan>`. Si no hay match alto pero hay plan.md → recomendar `/revisar-plan <plan>`. |
| **Repo sin carpeta `planes-de-trabajo/`** | Salto silencioso, sin error. |

Cuando se delega, terminar con:
```
Plan activo detectado: [ruta]
Archivos cambiados coinciden con el checklist del plan ([X/Y archivos]).

Siguiente paso: ejecuta /revisar-implementacion [ruta]
```

### 2c. Diff local puntual → continuar inline

Si nada de lo anterior aplica, seguir al Paso 3.

---

## Paso 3: Calcular score de profundidad

### 3a. Score por tamaño

```bash
LOC=$(git diff HEAD --shortstat 2>/dev/null | awk '{print $4+$6}')
LOC=${LOC:-0}
```

| LOC | score_tamaño |
|---|---|
| < 50 | 1 |
| 50–300 | 2 |
| 300–800 | 3 |
| > 800 | 4 |

### 3b. Score por dominio (tabla de globs)

Inspeccionar paths de archivos cambiados y matchear contra esta tabla. El score es el **máximo** de todos los matches.

| Dominio | Score | Globs (cualquier match) |
|---|---|---|
| Sin contenido relevante | — (caso degenerado, ver 1d) | merge commit, rename puro, file-mode change |
| Solo tests/docs | 0 | `**/tests/**`, `**/test_*.py`, `**/*.test.{js,ts,tsx}`, `**/docs/**`, `**/*.md`, `**/CHANGELOG*`, `**/README*` |
| Frontend cosmético | 1 | `**/styles/**`, `**/*.css`, `**/*.scss`, `**/components/icons/**`, `**/static/**` |
| Backend / scrapers / lógica | 2 | `**/src/**`, `**/lambdas/**` (excepto `migrations/`), `**/handlers/**`, `**/utils/**` |
| Auth | 3 | `**/auth/**`, `**/middleware/auth*`, `**/jwt*`, `**/oauth*`, `**/session*`, `**/cors*` |
| IAM (cloud) | 3 | `infra/**/iam_*.tf`, `**/iam_*.tf`, `**/policies/*.json`, `**/aws_iam_*.tf` |
| Migraciones | 3 | `**/migrations/m*.py`, `**/migrations/*.sql`, `**/lambdas/coordination/migrations.py`, `**/alembic/**` |
| Secrets (por path) | 3 | `**/.env*`, `**/*.pem`, `**/*.key`, `**/secrets/**`, `**/credentials.json`, `**/secret_*.tf`, `**/aws_secretsmanager_*.tf` |
| Infra crítica | 4 | `infra/account/**`, `**/aws_kms_*.tf`, `**/aws_route53_*.tf`, `**/aws_organizations_*.tf`, hooks DB (`**/triggers/*.sql`, `**/fn_block_*.sql`) |

Si **todos** los paths matchean "Solo tests/docs", score_dominio = 0. Si **alguno** matchea un dominio mayor, score_dominio = ese.

### 3c. Score por scope (cantidad de archivos)

| Archivos cambiados | score_scope |
|---|---|
| 1 | 0 |
| 2–5 | 1 |
| 6–15 | 2 |
| > 15 | 3 |

### 3d. Regex de contenido — detección de secrets

```bash
git diff HEAD --no-color 2>/dev/null | head -200 | grep -iE \
  "(password|secret|token|api_key|bearer|aws_access_key|private_key|client_secret)\s*[:=]\s*['\"][^'\"\$\{]{8,}['\"]" \
  | grep -v "example\|placeholder\|REPLACE_ME\|<.*>"
```

Si hay matches:
- Mostrar al usuario los strings detectados con masking: solo primeros y últimos 4 chars + `***` en el medio (ej: `sk-1***cdef`).
- **NUNCA imprimir el valor completo** del posible secret.
- Forzar `nivel ≥ 3`.

**Entropy check opcional** (solo si no hubo match por keyword): contar caracteres únicos en strings añadidos de 20+ chars. Si > 14 caracteres únicos en un string de 20+ → marcar como alta entropy y mostrarlo al usuario para confirmar.

### 3e. Composición del nivel

```
nivel_base = max(score_tamaño, score_dominio) + (1 si score_scope >= 3)
nivel_base = clamp(nivel_base, 0, 4)

# Forzar escalado si match de contenido o dominio crítico:
si (regex_secrets_match OR score_dominio >= 3):
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
| 0. Trivial | typo, comentario, doc, rename puro | Claude principal lee el diff + reporte breve | — | Inline, sin Codex |
| 1. Ligero | <50 LOC, tests/docs/frontend cosmético | 1 Codex generalista | Ninguno | Inline (con `</dev/null`) |
| 2. Medio | 50-300 LOC, 1-2 dominios reales | 2 Codex paralelos | Aplicables (1-2 de los 4) | Inline (con `</dev/null`) |
| 3. Estándar | 300-800 LOC, multi-dominio o crítico | 4 Codex | Guía de code review | **Recomendar** `/revisar-pr` |
| 4. Profundo | >800 LOC, infra crítica, pre-release | 8 agentes (Intermedio) | Guía de code review | **Recomendar** `/revisar-pr` con equipo Estándar (12 agentes) |

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

### Nivel 0 (trivial) — revisión inline sin Codex

Lectura directa del diff por parte de Claude principal + reporte breve. Sin lanzar Codex.

### Nivel 1 (ligero) — 1 Codex generalista inline

```bash
cd $(git rev-parse --show-toplevel) && codex exec --full-auto \
  -o /tmp/resultado-revisar-cambio-N1.md \
  "Revisa el siguiente diff. Reporta bugs, problemas de seguridad obvios y violaciones de YAGNI. Sé conciso.

$(git diff HEAD)" </dev/null
```

### Nivel 2 (medio) — 2 Codex paralelos inline

Lanzar 2 Codex en paralelo (un solo mensaje con 2 tool calls). Dominios sugeridos: el que detectó score_dominio + Calidad.

```bash
# Codex 1 — dominio detectado (ej: Performance)
cd $(git rev-parse --show-toplevel) && codex exec --full-auto \
  -o /tmp/resultado-revisar-cambio-N2-dom.md \
  "cat docs/estandares/guia-code-review.md && echo '---' && [prompt con diff]" </dev/null

# Codex 2 — Calidad
cd $(git rev-parse --show-toplevel) && codex exec --full-auto \
  -o /tmp/resultado-revisar-cambio-N2-cal.md \
  "cat docs/estandares/guia-code-review.md && echo '---' && [prompt con diff]" </dev/null
```

### Nivel 3 (estándar) — RECOMENDAR, no ejecutar

```
Este cambio justifica una revisión estándar (4 Codex + 4 skills).

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

1. Leer los archivos `/tmp/resultado-revisar-cambio-N*.md`.
2. Presentar tabla consolidada:

```
## Resultados — /revisar-cambio nivel <N>

| Agente | Dominio | Veredicto | Críticos | Altos | Medios |
|---|---|---|---|---|---|
| Codex-1 | <dominio> | <APROBADO/CAMBIOS> | <N> | <N> | <N> |
| Codex-2 | Calidad | <APROBADO/CAMBIOS> | <N> | <N> | <N> |

Veredicto consolidado: <APROBADO / CAMBIOS NECESARIOS>
```

3. Hallazgos deduplicados priorizados (críticos → altos → medios).

4. Preguntar siguiente acción:
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
  REPORT_DIR="/tmp/revisiones"
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
- Regex de contenido: <sin match / forzado a nivel ≥3 por: ...>

## Hallazgos (si se ejecutó inline)
[tabla + hallazgos priorizados]

## Siguiente paso
<comando recomendado o "ninguno — revisión cerrada inline">
```

Si el reporte queda en `/tmp/revisiones/` (no era repo git), avisar al usuario que es temporal.

---

## Reglas hardcodeadas

1. **Heurísticas duras + regex de contenido — sin LLM clasificador.** El scoring es determinista y verificable; no se delega a un modelo la decisión de profundidad.

2. **`</dev/null` obligatorio en TODA invocación de `codex exec*` en background.** Sin él, Codex se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308). Aplica a `codex exec`, `codex exec resume`, `codex exec resume --last`, `codex exec resume <session_id>`. Regla canónica de `/equipo-headless`.

3. **`cd $(git rev-parse --show-toplevel)` obligatorio antes de Codex.** Codex ignora paths del prompt y usa heurísticas propias de descubrimiento. Sin el `cd`, puede analizar el repo equivocado.

4. **Recomendador puro: NO invocar otros slash commands programáticamente.** Terminar con `Siguiente paso: ejecuta /<comando>` y dejar que Claude (la sesión que lee el output) lo tome en su turno siguiente. No existe primitiva para que un slash command invoque a otro.

5. **Forzar nivel ≥ 3 si regex de contenido matchea secrets o dominio crítico** (auth, IAM, migraciones, secrets, infra crítica). Esta regla **no es overridable** por Enter — requiere confirmación explícita.

6. **Path absoluto para reportes:** `$(git rev-parse --show-toplevel)/docs/revisiones/...` (o `/tmp/revisiones/` si no es repo git). No usar paths relativos al cwd.

7. **Caso degenerado** (diff vacío, merge commit, rename puro, file-mode change): nivel 0 con razón explícita, **no** calcular score. Saltar Paso 3.

8. **Lambda coordination con manejo de error** (warning visible, no bloquear). La revisión es la prioridad; el tracking es nice-to-have.

9. **Anti-sycophancy en todos los Codex inline.** Replicar del bloque "Defensas anti-sycophancy" de `/revisar-pr` / `/equipo-headless`: prohibido "You're absolutely right!", "Great point!", etc. La acción habla — describir el fix, no agradecer.

10. **Confirmación explícita para delegación a nivel ≥ 3.** Enter NO basta — requiere `s` o `si`. Esto previene que el usuario apruebe accidentalmente delegar a un comando pesado.

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
| Diff local chico (<50 LOC, solo tests/docs) | Sí — nivel 1 inline, sin overhead |
| PR específico que ya sabes que es grande | No — `/revisar-pr` directo |
| Plan de trabajo que vas a implementar | No — `/revisar-plan` directo |

> **Default**: si no estás seguro, invoca `/revisar-cambio`. Es el punto de entrada barato que evita ejecutar 4 Codex sobre 5 LOC.
