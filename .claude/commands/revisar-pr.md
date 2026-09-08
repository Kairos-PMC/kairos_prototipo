---
description: Revisar un PR específico de GitHub con equipo multi-agente headless. Llamado por /revisar-cambio cuando detecta un PR abierto. No invocar directo salvo que ya sepas que es ese caso.
allowed-tools: Bash(codex:*), Bash(auggie:*), Bash(git:*), Bash(gh:*), Bash(which:*), Bash(sleep:*), Bash(cat:*), Bash(rm:*), Read, Write, Edit, Glob, Grep, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, SendMessage
---

> **Default**: si no estás seguro de cuál comando usar, invoca `/revisar-cambio` — meta-comando que analiza el contexto y delega al hijo correcto (incluyendo este). Este comando lo usas directo solo si ya sabes que vas a revisar un PR específico.

# Revisar PR

Ejecuta una revisión de código de un PR específico de GitHub con equipo multi-agente headless. El comando resuelve el problema crítico de branch context: los revisores leen SIEMPRE desde un worktree de la branch del PR, nunca desde el working directory principal (que puede estar en `main`).

**Input:** URL o referencia del PR (ej: `owner/repo#123` o `https://github.com/owner/repo/pull/123`)
**Equipo:** Básico Codex por defecto (1 Codex por dominio activo)
**Política de cierre:** Consenso — todos los revisores deben decir APROBADO para terminar

**Diferencia con `/revisar-cambio`:**
- `/revisar-cambio` es el router barato: clasifica profundidad y revisa inline los cambios chicos (niveles 0-2)
- `/revisar-pr` es el ejecutor pesado: worktree de la branch del PR, equipo por dominios, verificación de documentación

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

Incidente que motivó este comando (2026-04-14): En una revisión headless, los revisores (Auggie) recibieron rutas del working directory principal en `main`, pero los cambios estaban en la branch del PR (`fix/bug-dapre-pdfs`) dentro de worktrees en /tmp/. Resultado: Auggie reportó que "los cambios no existen". Codex no tuvo el problema porque en `--full-auto` hace checkout propio.

### 3a. Localizar el repo local

Mapear `OWNER/REPO` al path local. Repos conocidos:

| GitHub repo | Path local |
|-------------|-----------|
| `Kairos-PMC/kairos_prototipo` | `~/Documents/PMC/kairos_prototipo` |

Si el repo no está en la tabla, clonar en /tmp:
```bash
git clone https://github.com/OWNER/REPO.git /tmp/repo-pr-PR_NUMBER
REPO_LOCAL_PATH=/tmp/repo-pr-PR_NUMBER
```

### 3b. Fetch y crear worktree

```bash
# Fetch de la branch del PR
git -C REPO_LOCAL_PATH fetch origin HEAD_REF_NAME

# Crear worktree temporal
git -C REPO_LOCAL_PATH worktree add /tmp/review-pr-PR_NUMBER HEAD_REF_NAME
```

`WORKTREE_PATH = /tmp/review-pr-PR_NUMBER`

Verificar que el worktree existe antes de continuar:
```bash
ls /tmp/review-pr-PR_NUMBER
```

Si falla la creación del worktree, STOP e informar al usuario. No continuar con rutas incorrectas.

---

## Paso 4: Leer contexto del repo

Desde el worktree, recopilar:

### 4a. Reglas del proyecto

```bash
# CLAUDE.md del repo
cat WORKTREE_PATH/CLAUDE.md 2>/dev/null | head -200

# Guía de code review — vive en el repo, en docs/estandares/
cat docs/estandares/guia-code-review.md 2>/dev/null

# ADRs (si existen en el repo)
ls WORKTREE_PATH/docs/adr/ 2>/dev/null | head -20
```

### 4b. Diff del PR

```bash
gh pr diff PR_NUMBER --repo OWNER/REPO
```

---

## Paso 5: Seleccionar equipo

```
Equipo de revisión:

1. Estándar (12 agentes: 4 Claude + 4 Codex + 4 Auggie)
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
1. **6 principios base**: errores internos, secrets, auth via token, validación de input, menor privilegio, rate limiting
2. **Reglas de `docs/estandares/guia-code-review.md`** (sección Seguridad): IDOR, ownership, PII en responses, validación de entrada, env vars wired, no permisos wildcard
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

Las reglas de tu dominio están en: docs/estandares/guia-code-review.md
ANTES de revisar cualquier código, ejecuta:
  cat docs/estandares/guia-code-review.md
Lee la sección de tu dominio (Seguridad / Arquitectura / Calidad / Performance)
y aplica esas reglas al código del worktree.

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
  run_in_background: true
  name: "claude-{dominio}-pr-PR_NUMBER"
  prompt: "[contenido completo del brief, incluyendo worktree path y rutas absolutas]"
```

### Codex → cd WORKTREE_PATH + codex exec

```bash
cd WORKTREE_PATH && codex exec --full-auto -o /tmp/resultado-{dominio}-codex-pr-PR_NUMBER.md \
  "cat docs/estandares/guia-code-review.md && echo '---' && [instrucciones del brief]" </dev/null
```

El `cd WORKTREE_PATH` es OBLIGATORIO. Sin él, Codex usa su propia heurística de descubrimiento y puede leer el repo equivocado o la branch equivocada.

**`</dev/null` al final es OBLIGATORIO en background.** Cuando `codex exec` corre dentro de `run_in_background: true` (o cualquier contexto donde stdin no es un TTY pero sigue abierto), Codex detecta el stdin no-TTY y activa su modo "leer prompt adicional desde stdin hasta EOF". Como el background shell de Claude Code mantiene stdin abierto, Codex se queda bloqueado en `Reading additional input from stdin...` sin analizar nada. Síntoma: proceso vivo (`ps` lo muestra), 0% CPU, archivo de output nunca se crea. Incidente: 2026-04-23 revisión PR #308 — 4 Codex colgados 13 min sin producir resultado. Fix: agregar `</dev/null` al final del comando para cerrar stdin explícitamente. En uso interactivo (TTY) funciona sin el redirect; el bug solo se manifiesta en background.

### Auggie → cd WORKTREE_PATH + auggie

```bash
cd WORKTREE_PATH && auggie -p -i "[contenido del brief]" \
  > /tmp/resultado-{dominio}-auggie-pr-PR_NUMBER.md 2>&1
```

### Timeouts

- Default: 300000ms (5 min)
- PRs con muchos archivos o migraciones: 600000ms (10 min)

---

## Paso 8: Recolectar y consolidar resultados

Cuando todos los agentes terminen:

1. Leer resultados (Read tool para archivos /tmp, texto directo para Claude agents)
2. Presentar tabla consolidada:

```
## Resultados Ronda 1 — PR #PR_NUMBER

| Agente | Dominio | Veredicto | Críticos | Altos | Medios | Doc gaps |
|--------|---------|-----------|----------|-------|--------|----------|
| Codex Seguridad | Seguridad | CAMBIOS NECESARIOS | 1 | 1 | 0 | 0 |
| Codex Calidad | Calidad | APROBADO | 0 | 0 | 2 | 1 |

Veredicto consolidado: CAMBIOS NECESARIOS (1 crítico, 1 alto)
```

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

**Codex (resume):**
```bash
cd WORKTREE_PATH && codex exec resume --last --full-auto \
  -o /tmp/resultado-{dominio}-codex-pr-PR_NUMBER-r2.md "[brief con fixes]" </dev/null
```

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
git -C REPO_LOCAL_PATH worktree remove /tmp/review-pr-PR_NUMBER --force

# Si se clonó temporalmente en /tmp
rm -rf /tmp/repo-pr-PR_NUMBER
```

Confirmar:
```bash
ls /tmp/review-pr-PR_NUMBER 2>/dev/null \
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

1. **Worktree SIEMPRE** — los agentes leen desde `/tmp/review-pr-PR_NUMBER`, nunca desde el working directory principal
2. **Fetch antes de worktree** — garantiza que la branch está al día con origin
3. **Verificar que el worktree existe** antes de construir cualquier brief
4. **Limpiar worktree al terminar** — siempre, aunque la revisión falle o el usuario cancele
5. **cd WORKTREE_PATH obligatorio** para Codex y Auggie — los CLIs externos ignoran rutas del prompt
6. **Seguridad SIEMPRE activa** — no se puede desactivar
7. **Rutas absolutas al worktree** en todos los prompts de agentes externos
8. **Lanzar todos los agentes en paralelo** — un solo mensaje con múltiples tool calls
9. **Codex exec, no codex directo** — SIEMPRE `codex exec --full-auto`
9b. **`</dev/null` obligatorio al final de todo `codex exec` en background** — sin él, Codex se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308)
10. **Verificar mergeable_state** antes de pushear fixes o aprobar el PR
11. **NO buscar API keys** — codex, auggie ya están autenticados; si fallan, avisar al usuario
12. **Consenso para APROBADO** — todos deben decir APROBADO; si uno dice CAMBIOS NECESARIOS, iterar
13. **NO aplicar fixes sin confirmación** del usuario
14. **Guardar reporte siempre** — incluso si el PR está limpio
15. **Inconsistencias de documentación** — incluirlas en el reporte y en el comentario al autor del PR

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
