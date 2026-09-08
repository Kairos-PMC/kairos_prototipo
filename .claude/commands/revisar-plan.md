---
description: Revisar plan de trabajo con equipo headless (Claude + Codex) hasta consenso. Llamado por /revisar-cambio cuando detecta un plan.md activo sin implementación previa. No invocar directo salvo que ya sepas que es ese caso.
allowed-tools: Bash(codex:*), Bash(which:*), Bash(cat:*), Bash(sleep:*), Read, Write, Edit, Glob, Grep, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, TaskStop, SendMessage
---

> **Default**: si no estás seguro de cuál comando usar, invoca `/revisar-cambio` — meta-comando que analiza el contexto y delega al hijo correcto (incluyendo este). Este comando lo usas directo solo si ya sabes que vas a revisar un plan de trabajo antes de implementarlo.

# Revisar Plan de Trabajo

Lanza un equipo headless de 2 agentes (Claude Code background + Codex) para revisar un plan de trabajo. El equipo itera hasta que ambos agentes aprueban el plan.

**Equipo fijo:**
- 1 Claude Code (Agent tool, background) — vision holistica, contexto de negocio
- 1 Codex (`codex exec`, background) — revision linea por linea, edge cases, minuciosidad

**Politica de cierre:** Consenso — iterar hasta que ambos aprueben.

---

## Paso 0: Verificar Codex

```bash
which codex
```

Si Codex no esta instalado o no responde:

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
> (`/tmp/resultado-codex-revision-plan.md`) y se leia de esa misma ruta fija. Con
> varios agentes revisando en el mismo host, los N escriben y leen el MISMO
> archivo: el ultimo en escribir gana y el resto lee el reporte ajeno **sin
> ningun error** — el archivo existe, es markdown valido, y habla de otro plan.
> El 2026-08-25 eso ocurrio tres veces en un dia; un agente vio un veredicto
> «APROBADO» que no era el suyo (`TSK-20260825T212834-5v5s`).

Reservar el directorio propio de esta revision **antes** de lanzar ningun agente:

```bash
ART="$(git rev-parse --show-toplevel)/.claude/scripts/artefactos-revision.sh"
REVISION_ID="plan:[ruta-relativa-del-plan]@[repo]"
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

## Paso 1: Detectar el plan a revisar

### Si el usuario paso una ruta como argumento:

Validar que el archivo existe y es un `.md`. Leerlo.

### Si no paso argumento:

Buscar planes pendientes en el repo actual:

```bash
find docs/planes-de-trabajo/pendientes/ -name "plan.md" -type f 2>/dev/null
```

Mostrar los planes encontrados:

```
Planes pendientes en este repo:

| # | Plan | Objetivo |
|---|------|----------|
| 1 | ingesta-datos/plan.md | Pipeline de ingesta inicial |
| 2 | scraper-mintrabajo/plan.md | Scraper para MinTrabajo |

Cual quieres revisar? (numero o ruta)
```

**Esperar respuesta** del usuario.

Si no hay planes pendientes:

```
No hay planes pendientes en docs/planes-de-trabajo/pendientes/.
Proporciona la ruta al plan que quieres revisar.
```

---

## Paso 2: Leer y analizar el plan

Leer el plan completo con Read tool. Extraer:

- **Nombre del plan**
- **Objetivo**
- **Numero de fases**
- **Estimacion total**
- **Archivos involucrados** (del checklist)

Verificar que el plan tiene la estructura minima:
- Header con metadata
- Al menos una fase de implementacion
- Criterios de exito

Si falta alguna seccion critica, avisar al usuario antes de lanzar la revision.

---

## Paso 3: Generar el brief de revision

Crear `scratch/equipo/brief-revision-plan.md` con:

```markdown
# Brief de Revision de Plan

## Plan a revisar
- **Archivo:** [ruta absoluta al plan]
- **Nombre:** [nombre del plan]
- **Objetivo:** [objetivo]
- **Fases:** [N fases]
- **Estimacion:** [X-Y horas]

## Contexto del proyecto
[Leer CLAUDE.md del repo para contexto. Incluir las partes relevantes.]

## Tu tarea
Eres un revisor critico de planes de trabajo. Tu objetivo es encontrar problemas,
gaps, riesgos y mejoras en el plan.

Revisa el plan evaluando:

### 1. Completitud
- Todas las fases necesarias estan definidas?
- Faltan pasos criticos? (migraciones, tests, deploy, rollback)
- Los criterios de exito cubren todos los objetivos?

### 2. Viabilidad tecnica
- La arquitectura propuesta es correcta para el stack del proyecto?
- Hay dependencias no mencionadas?
- Las estimaciones son realistas?

### 3. Riesgos
- Que puede salir mal?
- Hay un plan de rollback si algo falla?
- Hay dependencias externas no controladas?

### 4. Calidad del plan
- Las fases estan bien ordenadas (dependencias correctas)?
- Cada fase tiene validacion/verificacion?
- El plan es ejecutable por un desarrollador sin contexto adicional?

### 5. Seguridad
- El plan introduce nuevas superficies de ataque?
- Se manejan secrets correctamente?
- Hay consideraciones de permisos/IAM?

## Formato de respuesta

Responde con esta estructura EXACTA:

### Veredicto: [APROBADO | CAMBIOS REQUERIDOS | RECHAZADO]

### Hallazgos

#### CRITICOS (bloquean aprobacion)
1. [Titulo] — [Descripcion del problema] — [Sugerencia de fix]

#### ALTOS (deben resolverse antes de implementar)
1. [Titulo] — [Descripcion] — [Sugerencia]

#### MEDIOS (mejoras recomendadas)
1. [Titulo] — [Descripcion] — [Sugerencia]

#### BAJOS (nice to have)
1. [Titulo] — [Descripcion]

### Resumen
[2-3 oraciones sobre el estado general del plan]

IMPORTANTE:
- Se especifico. No digas "mejorar la seccion X" sin decir COMO.
- Si el plan esta bien, di APROBADO. No inventes problemas para justificar tu revision.
- Fundamenta cada hallazgo con evidencia del plan o del codebase.
- NO seas complaciente. Si hay un problema real, reportalo aunque sea incomodo.
```

---

## Paso 4: Lanzar agentes en paralelo

**REGLA**: Ambos agentes se lanzan en un solo mensaje con 2 tool calls paralelos.

### Claude Code (Agent tool)

**`subagent_type: "general-purpose"` es OBLIGATORIO — agente fresco con contexto limpio.** NUNCA omitir el `subagent_type` (eso lanzaría un fork que hereda el contexto y prompt cache del padre, contaminando la revisión adversarial). El revisor debe llegar al plan sin los sesgos de la sesión coordinadora.

```
Agent tool:
  subagent_type: "general-purpose"
  isolation: "worktree"
  name: "claude-revisor"
  prompt: "[contenido del brief + contenido completo del plan]

  Lee el plan y dame tu revision critica siguiendo el formato del brief.
  NO escribas archivos. Devuelve tu resultado como texto."
```

> **⚠️ `isolation: "worktree"` es OBLIGATORIO, no `run_in_background: true`** (ese parametro no existe en el tool `Agent` — los `Agent` corren async por defecto). El plan `canal-retorno-subagentes-deadline` (estándar en `docs/estandares/subagentes-con-deadline.md`) encontró que un `Agent` con `name` y SIN `isolation` aterriza en `in_process_teammate`, inconsultable vía `TaskOutput` ("No task found with ID") — necesario aquí porque el Paso 7 (rondas adicionales) reanuda esta MISMA conversación vía `SendMessage`.

### Codex (Bash background)

```bash
cd [ruta absoluta al repo] && codex exec --sandbox read-only -o "$ART_DIR/resultado-codex.md" "Lee el archivo [ruta absoluta al plan] y revisa el plan de trabajo criticamente. [contenido del brief sin el plan — Codex lee el archivo directamente].

Tu reporte DEBE empezar con esta linea EXACTA, sola en el primer renglon:
REVISION-ID: $REVISION_ID" </dev/null
```

**IMPORTANTE:**
- **`-o "$ART_DIR/..."`, nunca una ruta fija de `/tmp`** (Paso 0-bis). Y la linea
  `REVISION-ID:` en el brief no es decorativa: es lo que el Paso 5 verifica para
  saber que el reporte es de este plan y no de otro
- `cd` obligatorio antes de `codex exec` (Codex ignora rutas del prompt)
- `run_in_background: true` en la llamada Bash de Codex (Codex SÍ usa este parámetro — es del tool `Bash`, no del `Agent`). Codex ya tiene timeout real de proceso vía `Bash timeout` — no necesita el mecanismo de `TaskOutput`/deadline de esta sección, que aplica solo al agente Claude
- Timeout: 300000 (5 min)
- **`</dev/null` al final es OBLIGATORIO en background.** Sin este redirect, `codex exec` detecta el stdin no-TTY del shell background y entra en modo "leer prompt adicional desde stdin hasta EOF", quedando bloqueado en `Reading additional input from stdin...` sin analizar nada. Síntoma: proceso vivo, 0% CPU, output nunca creado. Incidente 2026-04-23 (PR #308): 4 Codex colgados 13 min. En TTY interactivo funciona sin el redirect; el bug solo aparece en background.

---

## Paso 5: Recolectar resultados

Cuando ambos agentes terminen (notificaciones automaticas):

1. Leer resultado de Claude (retorno directo del Agent tool)
2. **Verificar la pertenencia del reporte de Codex ANTES de leerlo:**

   ```bash
   "$ART" verificar --id "$REVISION_ID" resultado-codex.md || exit 1
   ```

   Imprime la ruta si el reporte es de esta revision; si no, sale != 0 diciendo
   que fallo (no existe / vacio / sobrante de la ronda anterior / habla de otro
   plan). **Si falla, NO leas el archivo ni busques uno parecido en `/tmp`** — el
   que encuentres ahi es de otro agente. Relanza el revisor y reporta que la
   ronda quedo sin veredicto de Codex.

3. Leer el archivo que `verificar` imprimio (`$ART_DIR/resultado-codex.md`).

**Deadline para el agente Claude (Fase 6 del plan de deadline, perfil "revisor simple").** Si no llega
notificacion del agente Claude dentro de `DEADLINE_POR_INTENTO_MS = 480000-600000` (8-10 min) desde
que se lanzo: **un** sondeo acotado — `TaskOutput(agent_id, block: true, timeout: <tiempo restante>)`
— NO un loop. Si tampoco responde ahi (error o timeout): `TaskStop(agent_id)` best-effort, marcar el
agente Claude como `timed_out`, y continuar SOLO con el veredicto de Codex (que ya tiene su propio
timeout real de `Bash`, independiente de este mecanismo). **Default de quorum:** con 2 revisores fijos
y 1 `timed_out`, el consenso queda en manos del que respondio — no se bloquea esperando al que no
respondio. Reportarlo explicitamente en la tabla del Paso 5 y en la evaluacion guardada (Paso 8).

Consolidar en una tabla:

```
## Resultados de Revision — Ronda 1

| Agente | Veredicto | Criticos | Altos | Medios | Bajos |
|--------|-----------|----------|-------|--------|-------|
| Claude | CAMBIOS REQUERIDOS (o `timed_out` si no respondio dentro del deadline) | 1 | 2 | 1 | 0 |
| Codex | CAMBIOS REQUERIDOS | 0 | 3 | 2 | 1 |

Si Claude quedo `timed_out`: agregar una nota explicita "Consenso basado solo en Codex — el agente
Claude no respondio dentro del presupuesto de 8-10 min" antes de la tabla de hallazgos.

### Hallazgos consolidados (deduplicados)

#### CRITICOS
1. [Titulo] — reportado por: Claude. [Descripcion + sugerencia]

#### ALTOS
1. [Titulo] — reportado por: ambos. [Descripcion + sugerencia]
2. [Titulo] — reportado por: Codex. [Descripcion + sugerencia]

...
```

---

## Paso 6: Decidir siguiente paso

### Si ambos dicen APROBADO:

```
El plan fue aprobado por ambos revisores.

Guardando evaluacion en: [ruta]/evaluaciones/plan/YYYY-MM-DD-revision-headless.md

Siguiente paso: implementar con confianza.
```

Guardar el reporte consolidado en `evaluaciones/plan/YYYY-MM-DD-revision-headless.md`.

### Si hay CAMBIOS REQUERIDOS:

```
El plan necesita cambios. Opciones:

1. Aplicar los cambios al plan (yo los hago)
2. Ver detalle de un hallazgo especifico
3. Descartar y dejar el plan como esta
```

**Esperar respuesta** del usuario.

**Si elige 1 (aplicar cambios):**

1. Aplicar los cambios al plan.md en orden de prioridad (criticos primero)
2. Despues de cada cambio, mostrar el diff
3. Preguntar si quiere relanzar la revision (Ronda 2)

---

## Paso 7: Rondas adicionales (si aplica)

Si el usuario pidio re-revision despues de aplicar cambios:

1. Incrementar numero de ronda
2. Crear nuevo brief con los cambios aplicados
3. Relanzar ambos agentes:

**Claude:** Usar SendMessage al agent existente (si esta idle) o nuevo Agent tool

**Codex:**
**Re-sellar ANTES de relanzar** — `sellado_en` es la marca contra la que se mide
la frescura del reporte. Sin re-sellar, la ronda 2 aceptaria el reporte de la
ronda 1 como si fuera nuevo:

```bash
ART_DIR="$("$ART" sellar --id "$REVISION_ID" --ronda 2)" || exit 1
cd [repo] && codex exec --sandbox read-only -o "$ART_DIR/resultado-codex-r2.md" "[brief de ronda 1 + nuevo brief con los cambios aplicados, concatenados, con la misma linea REVISION-ID: $REVISION_ID]" </dev/null
```

> 🔴 **Sesion FRESCA, no `resume --last`, y `verificar` no puede suplirlo.**
> `--last` resuelve a la ultima sesion de Codex de **ese directorio**, no a la de
> este comando: dos agentes revisando planes distintos desde el mismo checkout se
> roban la sesion entre si sin ningun error visible. La sesion equivocada escribe
> en *tu* `$ART_DIR`, con *tu* `REVISION-ID` (se lo pide tu prompt) y despues de
> *tu* sello, asi que los cuatro chequeos de `verificar` pasan y el reporte entra
> como propio. La verificacion de pertenencia demuestra que el archivo es de esta
> revision, no que el revisor haya leido el plan de esta revision — esa mitad se
> cierra aca, en la escritura. Si necesitas continuidad real, pasa el
> `<session_id>` explicito de la ronda 1; `--last` nunca.

Y al recolectar, verificar el artefacto de la ronda nueva:

```bash
"$ART" verificar --id "$REVISION_ID" resultado-codex-r2.md || exit 1
```

El `</dev/null` aplica también al `codex exec resume` — la regla es idéntica para cualquier invocación de `codex exec` en background.

4. Repetir Pasos 5-6

**Maximo 5 rondas.** Si despues de 5 rondas no hay consenso, informar al usuario y sugerir revision manual con el CTO.

---

## Paso 8: Guardar evaluacion

Al finalizar (aprobado o cerrado por el usuario), guardar en:

```
[ruta-del-plan]/evaluaciones/plan/YYYY-MM-DD-revision-headless.md
```

Contenido:

```markdown
# Evaluacion de Plan — [Nombre del Plan]

**Fecha:** YYYY-MM-DD
**Metodo:** Equipo headless (Claude Code + Codex)
**Rondas:** N
**Veredicto final:** [APROBADO | CAMBIOS REQUERIDOS | RECHAZADO]

## Ronda 1
[Resultados consolidados]

## Ronda 2 (si aplica)
[Resultados consolidados]

## Cambios aplicados
- [Lista de cambios hechos al plan]
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
7. **NO inventar problemas** — si el plan esta bien, aprobar
8. **Rutas absolutas** en todos los prompts
9. **Guardar evaluacion** siempre, incluso si se aprueba en ronda 1
10. **NO buscar API keys** — Codex ya esta autenticado. Si falla auth, avisar al usuario
11. **El agente Claude SIEMPRE con `isolation: "worktree"`, NUNCA `run_in_background: true`** (no existe en el tool `Agent`) — necesario para que `TaskOutput`/`TaskStop` puedan alcanzarlo pese a llevar `name` (plan `canal-retorno-subagentes-deadline`)
12. **Deadline de 8-10 min para el agente Claude** — un sondeo acotado via `TaskOutput` al borde del deadline, no un loop; si no responde, se marca `timed_out` y el consenso sigue solo con Codex (que ya tiene timeout real de proceso)
