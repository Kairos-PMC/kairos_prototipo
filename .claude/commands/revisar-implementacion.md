---
description: Revisar implementacion completada contra su plan con equipo headless (Claude + Codex). Llamado por /revisar-cambio cuando detecta un plan.md activo y archivos cambiados que coinciden con su checklist. No invocar directo salvo que ya sepas que es ese caso.
allowed-tools: Bash(codex:*), Bash(which:*), Bash(git:*), Bash(cat:*), Bash(sleep:*), Read, Write, Edit, Glob, Grep, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, TaskStop, SendMessage
---

> **Default**: si no estás seguro de cuál comando usar, invoca `/revisar-cambio` — meta-comando que analiza el contexto y delega al hijo correcto (incluyendo este). Este comando lo usas directo solo si ya sabes que vas a revisar una implementación terminada contra su plan.

# Revisar Implementacion

Lanza un equipo headless de 2 agentes (Claude Code background + Codex) para revisar una implementacion completada contra su plan de trabajo. El equipo verifica que lo implementado cumple con lo planeado y que funciona correctamente.

**Equipo fijo:**
- 1 Claude Code (Agent tool, background) — vision holistica, verifica que la implementacion cumple los objetivos del plan
- 1 Codex (`codex exec`, background) — revision linea por linea del codigo, edge cases, tests, calidad

**Politica de cierre:** Consenso — iterar hasta que ambos aprueben.

**Diferencia con `/revisar-plan`:** Revisar-plan evalua el plan ANTES de implementar. Este comando evalua el CODIGO despues de implementar, comparandolo contra el plan.

**Diferencia con `/revisar-pr`:** Revisar-pr evalua el diff de un PR contra las reglas de code review. Este comando evalua el codigo contra el plan que lo origino — cumplimiento del checklist, criterios de exito y desviaciones de scope.

---

## Paso 0: Verificar Codex

```bash
which codex
```

Si Codex no esta disponible:

```
ERROR: Codex no esta disponible en esta maquina.

Para instalar y configurar Codex:
1. npm install -g @openai/codex
2. codex auth login
3. Verificar: codex --version

Si tienes dudas, comunicate con el CTO (David Gonzalez).
```

**STOP** — No continuar sin Codex.

---

## Paso 0-bis: Reservar los artefactos de ESTA revision (OBLIGATORIO)

> **Por que existe este paso.** La salida de Codex iba a una ruta FIJA de `/tmp`
> (`/tmp/resultado-codex-revision-impl.md`) y se leia de esa misma ruta fija. Con
> varios agentes revisando en el mismo host, los N escriben y leen el MISMO
> archivo: el ultimo en escribir gana y el resto lee el reporte ajeno **sin
> ningun error** — el archivo existe, es markdown valido, y habla de otro cambio.
> El 2026-08-25 eso ocurrio tres veces en un dia; un agente vio un veredicto
> «APROBADO» de un PR que no era el suyo (`TSK-20260825T212834-5v5s`).

Reservar el directorio propio de esta revision **antes** de lanzar ningun agente:

```bash
ART="$(git rev-parse --show-toplevel)/.claude/scripts/artefactos-revision.sh"
REVISION_ID="impl:[ruta-relativa-del-plan]@[repo]@$(git rev-parse --short HEAD)"
ART_DIR="$("$ART" sellar --id "$REVISION_ID")" || exit 1
echo "Artefactos de esta revision: $ART_DIR"
```

- `sellar` deriva `ART_DIR` de la sesion de Claude Code **mas** `REVISION_ID`, y
  **falla** si no puede identificar la sesion — nunca cae a una ruta compartida.
- `REVISION_ID` viaja al brief de cada revisor y se verifica en el Paso 5. No lo
  cambies a mitad de revision: invalida los reportes ya producidos.
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

---

## Paso 1: Detectar el plan implementado

### Si el usuario paso una ruta como argumento:

Validar que el archivo existe y es un `.md`. Leerlo.

### Si no paso argumento:

Buscar planes en progreso o completados recientemente:

```bash
# Planes en progreso
find docs/planes-de-trabajo/pendientes/ -name "plan.md" -type f 2>/dev/null
# Planes completados recientemente
find docs/planes-de-trabajo/completados/ -name "plan.md" -type f -mtime -30 2>/dev/null
```

Mostrar los planes encontrados:

```
Planes disponibles para revisar implementacion:

| # | Estado | Plan | Objetivo |
|---|--------|------|----------|
| 1 | En progreso | pendientes/ingesta-datos/plan.md | Pipeline de ingesta |
| 2 | Completado | completados/scraper-mintrabajo/plan.md | Scraper MinTrabajo |

Cual quieres revisar? (numero o ruta)
```

**Esperar respuesta** del usuario.

---

## Paso 2: Analizar plan vs implementacion

Leer el plan completo. Extraer:

- **Fases y subtareas** (especialmente las marcadas como completadas)
- **Archivos del checklist** (los `[x]` marcados como hechos)
- **Criterios de exito**

Para cada archivo del checklist, verificar que existe:

```bash
ls -la [archivo1] [archivo2] ...
```

Obtener los commits relacionados con la implementacion:

```bash
git log --oneline --since="[fecha de creacion del plan]" -- [archivos del checklist]
```

Obtener el diff total de la implementacion:

```bash
git diff [commit-antes-del-plan]..HEAD -- [archivos del checklist]
```

Si no hay commit de referencia claro, usar los archivos del checklist para acotar el diff.

---

## Paso 3: Generar el brief de revision

Crear `scratch/equipo/brief-revision-implementacion.md` con:

```markdown
# Brief de Revision de Implementacion

## Plan original
- **Archivo:** [ruta absoluta al plan]
- **Nombre:** [nombre del plan]
- **Objetivo:** [objetivo]
- **Fases completadas:** [N de M]

## Archivos implementados
[Lista de archivos del checklist con su estado (existe/no existe)]

## Commits relacionados
[Lista de commits extraidos en Paso 2]

## Tu tarea
Eres un revisor de implementacion. Tu objetivo es verificar que el codigo implementado
cumple con lo definido en el plan de trabajo.

Revisa evaluando:

### 1. Completitud vs Plan
- Todas las subtareas marcadas como completadas realmente estan hechas?
- Faltan archivos que el plan lista?
- Los criterios de exito se cumplen?

### 2. Calidad del codigo
- El codigo sigue las convenciones del proyecto?
- Hay errores evidentes, typos, codigo muerto?
- Los nombres de variables/funciones son claros?
- Hay codigo duplicado que deberia estar abstraido?

### 3. Tests
- Existen tests para la funcionalidad nueva?
- Los tests cubren los casos criticos mencionados en el plan?
- Los tests pasan?

### 4. Manejo de errores
- Las funciones manejan errores correctamente?
- Hay paths no cubiertos (what if X falla)?
- Los mensajes de error son utiles para debugging?

### 5. Seguridad basica
- Se manejan inputs del usuario de forma segura?
- No hay secrets hardcodeados?
- Los permisos son los minimos necesarios?

### 6. Gaps entre plan e implementacion
- Hay cosas implementadas que NO estan en el plan? (scope creep)
- Hay cosas del plan que se implementaron diferente? (son mejoras o desviaciones?)
- Se documentaron las decisiones de desviacion?

## Formato de respuesta

### Veredicto: [APROBADO | CAMBIOS REQUERIDOS | RECHAZADO]

### Cumplimiento del plan
- Subtareas completadas: N/M
- Archivos implementados: N/M
- Criterios de exito cumplidos: N/M

### Hallazgos

#### CRITICOS (bloquean aprobacion)
1. [Titulo] — [Descripcion] — [Archivo:linea] — [Sugerencia]

#### ALTOS
1. [Titulo] — [Descripcion] — [Archivo:linea] — [Sugerencia]

#### MEDIOS
1. [Titulo] — [Descripcion] — [Sugerencia]

#### BAJOS
1. [Titulo] — [Descripcion]

### Desviaciones del plan
[Lista de diferencias entre plan e implementacion, marcando si son mejoras o problemas]

### Resumen
[2-3 oraciones sobre el estado de la implementacion]

IMPORTANTE:
- Cita archivos y lineas especificas. No hagas observaciones genericas.
- Si la implementacion esta bien, di APROBADO. No inventes problemas.
- Fundamenta cada hallazgo con evidencia del codigo.
- NO seas complaciente. Si hay un bug, reportalo.
```

---

## Paso 4: Lanzar agentes en paralelo

**REGLA**: Ambos agentes se lanzan en un solo mensaje con 2 tool calls paralelos.

### Claude Code (Agent tool)

**`subagent_type: "general-purpose"` es OBLIGATORIO — agente fresco con contexto limpio.** NUNCA omitir el `subagent_type` (eso lanzaría un fork que hereda el contexto y prompt cache del padre, contaminando la revisión adversarial). El revisor debe llegar a la implementación sin los sesgos de la sesión coordinadora.

```
Agent tool:
  subagent_type: "general-purpose"
  isolation: "worktree"
  name: "claude-revisor-impl"
  prompt: "[brief completo + contenido del plan + lista de archivos a revisar con rutas absolutas]

  Lee el plan y los archivos implementados. Dame tu revision siguiendo el formato del brief.
  Para leer archivos usa el Read tool.
  NO escribas archivos. Devuelve tu resultado como texto."
```

> **⚠️ `isolation: "worktree"` es OBLIGATORIO, no `run_in_background: true`** (no existe en el tool `Agent`). Plan `canal-retorno-subagentes-deadline` — un `Agent` con `name` sin `isolation` queda inconsultable vía `TaskOutput`.

### Codex (Bash background)

```bash
cd [ruta absoluta al repo] && codex exec --sandbox read-only -o "$ART_DIR/resultado-codex.md" "Lee el plan en [ruta absoluta al plan] y revisa los archivos implementados. [brief sin el plan]. Archivos a revisar: [lista de rutas absolutas].

Tu reporte DEBE empezar con esta linea EXACTA, sola en el primer renglon:
REVISION-ID: $REVISION_ID" </dev/null
```

**IMPORTANTE:**
- **`-o "$ART_DIR/..."`, nunca una ruta fija de `/tmp`** (Paso 0-bis). Y la linea
  `REVISION-ID:` en el brief no es decorativa: es lo que el Paso 5 verifica para
  saber que el reporte es de este cambio y no de otro
- `cd` obligatorio antes de `codex exec`
- `run_in_background: true` en la llamada Bash de Codex (parámetro del tool `Bash`, no del `Agent`) — Codex ya tiene timeout real de proceso, no necesita el mecanismo de `TaskOutput`/deadline
- Timeout: 300000 (5 min). Si hay muchos archivos, 600000 (10 min)
- **`</dev/null` al final es OBLIGATORIO en background.** Sin este redirect, `codex exec` detecta el stdin no-TTY del shell background y entra en modo "leer prompt adicional desde stdin hasta EOF", quedando bloqueado en `Reading additional input from stdin...` sin analizar nada. Síntoma: proceso vivo, 0% CPU, output nunca creado. Incidente 2026-04-23 (PR #308): 4 Codex colgados 13 min. En TTY interactivo funciona sin el redirect; el bug solo aparece en background.

---

## Paso 5: Recolectar resultados

Cuando ambos agentes terminen:

1. Leer resultado de Claude (retorno directo)
2. **Verificar la pertenencia del reporte de Codex ANTES de leerlo:**

   ```bash
   "$ART" verificar --id "$REVISION_ID" resultado-codex.md || exit 1
   ```

   Imprime la ruta si el reporte es de esta revision; si no, sale != 0 diciendo
   que fallo (no existe / vacio / sobrante de la ronda anterior / habla de otro
   cambio). **Si falla, NO leas el archivo ni busques uno parecido en `/tmp`** —
   el que encuentres ahi es de otro agente. Relanza el revisor y reporta que la
   ronda quedo sin veredicto de Codex.

3. Leer el archivo que `verificar` imprimio (`$ART_DIR/resultado-codex.md`).

**Deadline para el agente Claude (Fase 6 del plan de deadline, perfil "revisor simple").** Si no llega
notificacion dentro de `DEADLINE_POR_INTENTO_MS = 480000-600000` (8-10 min, o 600000 si hay muchos
archivos): **un** sondeo acotado — `TaskOutput(agent_id, block: true, timeout: <tiempo restante>)` —
NO un loop. Si tampoco responde: `TaskStop(agent_id)` best-effort, marcar `timed_out`, y continuar
SOLO con el veredicto de Codex. **Default de quorum:** con 1 `timed_out`, el consenso queda en manos
del que respondio — reportarlo explicitamente.

Consolidar:

```
## Resultados de Revision de Implementacion — Ronda 1

| Agente | Veredicto | Cumplimiento | Criticos | Altos | Medios |
|--------|-----------|-------------|----------|-------|--------|
| Claude | APROBADO (o `timed_out`) | 8/8 subtareas | 0 | 0 | 2 |
| Codex | CAMBIOS REQUERIDOS | 7/8 subtareas | 1 | 1 | 3 |

### Hallazgos consolidados (deduplicados)
[Misma estructura que revisar-plan]

### Desviaciones del plan
[Consolidar desviaciones de ambos agentes]
```

---

## Paso 6: Decidir siguiente paso

### Si ambos dicen APROBADO:

```
La implementacion fue aprobada por ambos revisores.

Guardando evaluacion en: [ruta]/evaluaciones/ejecucion/YYYY-MM-DD-revision-headless.md

La implementacion cumple con el plan.
```

Guardar reporte en `evaluaciones/ejecucion/YYYY-MM-DD-revision-headless.md`.

### Si hay CAMBIOS REQUERIDOS:

```
La implementacion necesita cambios. Opciones:

1. Aplicar los fixes (yo los hago)
2. Ver detalle de un hallazgo especifico
3. Exportar reporte para revisarlo despues
4. Descartar la revision
```

**Esperar respuesta** del usuario.

**Si elige 1 (aplicar fixes):**

1. Aplicar fixes en orden de prioridad (criticos primero)
2. Despues de cada fix, correr tests si existen
3. Preguntar si quiere relanzar la revision (Ronda 2)

---

## Paso 7: Rondas adicionales (si aplica)

Si el usuario pidio re-revision:

1. Incrementar ronda
2. Relanzar ambos agentes con brief actualizado (incluir fixes aplicados)

**Re-sellar ANTES de relanzar** — `sellado_en` es la marca contra la que se mide
la frescura del reporte. Sin re-sellar, la ronda 2 aceptaria el reporte de la
ronda 1 como si fuera nuevo:

```bash
ART_DIR="$("$ART" sellar --id "$REVISION_ID" --ronda 2)" || exit 1
```

**Claude:** SendMessage al agent existente o nuevo Agent tool
**Codex — sesion FRESCA, nunca `resume --last`:** `cd [repo] && codex exec --sandbox read-only -o "$ART_DIR/resultado-codex-r2.md" "[brief de ronda 1 + brief actualizado con los fixes, concatenados, con la misma linea REVISION-ID: $REVISION_ID]" </dev/null` (el `</dev/null` aplica también a `codex exec resume`)

> 🔴 **`resume --last` NO reanuda «tu» sesion, y `verificar` no puede atraparlo.**
> `--last` resuelve a la ultima sesion de Codex de **ese directorio**, no a la de
> este comando. Dos agentes revisando implementaciones distintas desde el mismo
> checkout —o un `/revisar-pr` corriendo en paralelo desde ahi— se roban la sesion
> entre si sin ningun error visible. Y la sesion equivocada escribe en *tu*
> `$ART_DIR`, con *tu* `REVISION-ID` (se lo pide tu prompt) y despues de *tu*
> sello: los cuatro chequeos de `verificar` pasan. La verificacion de pertenencia
> demuestra que el archivo es de esta revision, no que el revisor haya leido el
> cambio de esta revision — esa mitad se cierra en la escritura, lanzando fresco.
> Si necesitas continuidad real, pasa el `<session_id>` explicito de la ronda 1.

Y al recolectar, verificar el artefacto de la ronda nueva:

```bash
"$ART" verificar --id "$REVISION_ID" resultado-codex-r2.md || exit 1
```

Repetir Pasos 5-6. **Maximo 5 rondas.**

---

## Paso 8: Guardar evaluacion

Al finalizar, guardar en:

```
[ruta-del-plan]/evaluaciones/ejecucion/YYYY-MM-DD-revision-headless.md
```

Contenido:

```markdown
# Evaluacion de Implementacion — [Nombre del Plan]

**Fecha:** YYYY-MM-DD
**Metodo:** Equipo headless (Claude Code + Codex)
**Rondas:** N
**Veredicto final:** [APROBADO | CAMBIOS REQUERIDOS]

## Cumplimiento del plan
- Subtareas completadas: N/M
- Archivos implementados: N/M
- Criterios de exito cumplidos: N/M

## Ronda 1
[Resultados consolidados]

## Ronda 2 (si aplica)
[Resultados]

## Fixes aplicados
- [Lista de fixes]

## Desviaciones del plan
- [Lista de desviaciones aceptadas]
```

---

## Reglas hardcodeadas

1. **Codex obligatorio** — Si no esta disponible, STOP con instrucciones claras
2. **Lanzar ambos agentes en paralelo** — un solo mensaje con 2 tool calls
3. **cd obligatorio para Codex** — `cd /ruta/absoluta/ &&` antes de `codex exec`
4. **Codex exec, no codex directo** — SIEMPRE `codex exec --sandbox read-only`
4b. **`</dev/null` obligatorio al final de todo `codex exec` en background** — sin él, Codex se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308)
5. **Politica de cierre: consenso** — iterar hasta que ambos aprueben
6. **Maximo 5 rondas** — despues, escalar al CTO
7. **NO inventar problemas** — si la implementacion esta bien, aprobar
8. **Rutas absolutas** en todos los prompts
9. **Guardar evaluacion** siempre en evaluaciones/ejecucion/
10. **NO buscar API keys** — Codex ya esta autenticado. Si falla, avisar al usuario
11. **Tests obligatorios** — si hay tests, correrlos despues de aplicar fixes
12. **El agente Claude SIEMPRE con `isolation: "worktree"`, NUNCA `run_in_background: true`** (plan `canal-retorno-subagentes-deadline`)
13. **Deadline de 8-10 min para el agente Claude** — sondeo acotado via `TaskOutput`, no un loop; si no responde, `timed_out` y el consenso sigue solo con Codex
