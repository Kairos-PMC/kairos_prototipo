---
description: Coordinar equipo multi-agente headless (background, sin tmux)
allowed-tools: Bash(codex:*), Bash(gemini:*), Bash(cursor-agent:*), Bash(opencode:*), Bash(volt:*), Bash(claude:*), Bash(sleep:*), Bash(cat:*), Read, Write, Edit, Glob, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, TaskStop, SendMessage, TeamCreate
---

# Equipo Multi-Agente Headless

Coordina un equipo de agentes IA corriendo en background dentro de la sesion actual de Claude Code. Sin tmux, sin ventanas externas.

**Diferencia con `/equipo-visual`**: Aqui todo corre como procesos background o subagentes. El usuario ve el progreso directamente en su sesion de Claude Code. Ideal para tareas que no requieren interaccion visual con los agentes.

---

## Compatibilidad headless por CLI

| # | CLI | Comando headless | Output | Resume | Notas |
|---|-----|-----------------|--------|--------|-------|
| 1 | **Claude Code** | Agent tool (async por defecto — **sin** parametro `run_in_background`, no existe) | Retorna resultado directo (notificacion automatica) | `Agent tool` con `resume: agent_id` | Subagente nativo. **`isolation: "worktree"` es obligatorio si el agente necesita `name` para resume** (ver "Deadline y `name`" mas abajo) |
| 2 | **Codex** | `codex exec --sandbox read-only -o "$ART_DIR/output.md" "prompt" </dev/null` | Archivo via `-o` flag | `codex exec --sandbox read-only resume <session_id> "prompt" </dev/null` — **`--last` NO**, resuelve por directorio y se roba la sesion de otro agente (Paso 8.5) | `exec` es el subcomando no-interactivo. NO usar `-q` (deprecado). Para revisiones/evaluaciones usar `--sandbox read-only`; para implementacion con escritura usar `--sandbox workspace-write`. **`</dev/null` OBLIGATORIO en background** — ver seccion "Gotcha critico: Codex y stdin" mas abajo |
| 3 | **Gemini** | `gemini -p "prompt"` | stdout (redirigir a archivo con `> "$ART_DIR/output.md"`) | Sin identificador de sesion explicito conocido → **relanzar fresco** con el contexto en el prompt. `--resume latest` es un «ultimo» sin medir (regla 13) | Output incluye JSON con stats al final. Extraer campo `response` para el contenido limpio |
| 4 | **Cursor Agent** | `cursor-agent -p "prompt"` | stdout | Sin resume conocido | `-p` = print mode. `--output-format json` para JSON estructurado |
| 5 | **OpenCode** | `opencode run "prompt"` | stdout | `opencode run -s <sessionId> "prompt"`. **`-c` no** — es un «ultimo» sin medir (regla 13) | Subcomando `run` para ejecucion no-interactiva |
| 6 | **Volt** | `volt run "prompt"` | stdout | Sin resume conocido | Subcomando `run` para ejecucion no-interactiva |
| 7 | **OpenClaw** | `openclaw agent --agent main --local -m "prompt" --json` | stdout (JSON con campo `payloads[0].text`) | Sin resume conocido | `--local` corre agente embebido sin gateway. `--json` para output estructurado. Requiere `--agent <id>` (usar `openclaw agents list` para ver disponibles) |

---

## Gotcha critico: Codex y stdin en background

**Sintoma:** `codex exec` lanzado con `run_in_background: true` queda en estado colgado — proceso vivo (`ps aux | grep codex` lo muestra), 0% de CPU, archivo de output (`-o /tmp/...`) nunca se crea. Al hacer `tail` del task output, se ve una sola linea: `Reading additional input from stdin...`.

**Causa:** `codex exec` tiene dos modos de ingesta del prompt:
1. Argumento posicional (ej: `codex exec "prompt"`)
2. Stdin adicional (lee stdin concatenado al argumento hasta EOF)

Cuando detecta un stdin que **no es un TTY pero sigue abierto** (exactamente el caso de `run_in_background: true` con zsh heredoc), Codex activa el modo 2 por defecto y se bloquea esperando EOF que nunca llega — el background shell de Claude Code mantiene stdin abierto. En TTY interactivo Codex detecta el TTY y no activa este modo, por eso el bug solo se manifiesta en headless.

**Fix:** agregar `</dev/null` al final del comando. Esto cierra stdin explicitamente y Codex procede a analizar el prompt del argumento.

```bash
# MAL — se cuelga en background
cd "$WORKTREE" && codex exec --sandbox read-only -o "$ART_DIR/out.md" "mi prompt"

# BIEN — stdin cerrado explicitamente
cd "$WORKTREE" && codex exec --sandbox read-only -o "$ART_DIR/out.md" "mi prompt" </dev/null
```

Aplica a TODAS las invocaciones: `codex exec`, `codex exec resume`, `codex exec resume --last`, `codex exec resume <session_id>`. La regla es "todo `codex exec*` en background lleva `</dev/null` al final".

**Incidente de referencia:** 2026-04-23, revision post-merge del PR #308 en agente-de-monitoreo via `/revisar-pr`. 4 Codex lanzados en paralelo (Seguridad/Arquitectura/Calidad/Performance) se quedaron 13 min en `Reading additional input from stdin...` sin producir resultados. Fueron reemplazados por Auggie como fallback.

**Como detectar el problema en vivo:**
```bash
# ps muestra el proceso vivo
ps aux | grep -E "codex exec" | grep -v grep

# pero el output file no existe
ls "$ART_DIR"/resultado-*-codex.md

# y el task output muestra el sintoma
tail -3 /private/tmp/claude-501/.../tasks/<task_id>.output
# → "Reading additional input from stdin..."
```

**Plan de recuperacion:** `pkill -9 -f "codex exec"` y relanzar con el fix, o sustituir ese dominio por un subagente Claude (Agent tool, `subagent_type: "general-purpose"`, `run_in_background: true`) — mismo protocolo de fallback aplicable a cualquier proveedor externo no disponible.

---

## Deadline duro para agentes Claude — gotcha de `name` sin `isolation`

**Plan `canal-retorno-subagentes-deadline`, estándar en `docs/estandares/subagentes-con-deadline.md`.**
Esta seccion aplica **UNICAMENTE a los agentes Claude** (tool `Agent`) — los CLIs externos
(Codex/Gemini/Auggie/etc.) ya tienen timeout real de proceso via el tool `Bash` (regla 4 de
"Errores comunes por CLI" mas abajo, hasta 600000ms/10min) y NO necesitan este mecanismo.

**Hallazgo critico verificado empiricamente (spike de Fase 2, 2026-08-02):** el tool `Agent` **no
tiene parametro `run_in_background`** — los `Agent` corren async por defecto. Y `TaskOutput` (la
unica primitiva real de espera acotada por wall-clock) **solo puede consultar un `Agent` lanzado SIN
`name`, o con `name` + `isolation: "worktree"`**. Lanzarlo con `name` y SIN `isolation` — que es
literalmente lo que este comando documentaba antes en Paso 6 — produce un `task_type:
in_process_teammate` que `TaskOutput` NUNCA encuentra ("No task found with ID"). Es la causa raiz
confirmada del bug que origino el plan.

Como este comando SI necesita `name` para poder hacer `resume: agent_id` en el Paso 8.5 (rondas
multiples), la correccion es: **todo agente Claude lanzado por este comando lleva SIEMPRE `isolation:
"worktree"`** — no solo "para implementacion colaborativa" como decia antes. Acepta el costo extra
(~200-500ms + disco por agente) a cambio de conservar resumibilidad Y `TaskOutput` en el mismo
lanzamiento.

**Deadline por intento (perfil "revisor simple" de Fase 2):** `DEADLINE_POR_INTENTO_MS = 480000-600000`
(8-10 min) por ronda de espera de un agente Claude — mas alto que el perfil "clasificador" (3-5 min)
de un clasificador de una linea, porque un auditor/meta-evaluador real tarda
mas que una clasificacion de una linea.

---

## Paso 1: Definir objetivo

Pregunta al usuario cual es el objetivo del equipo. Ofrece estas opciones:

| # | Objetivo | Descripcion |
|---|----------|-------------|
| 1 | **Evaluar plan** | Multiples agentes revisan y critican un plan de trabajo |
| 2 | **Evaluar implementacion** | Multiples agentes revisan codigo existente |
| 3 | **Implementacion colaborativa** | Agentes trabajan en paralelo en diferentes partes |
| 4 | **Otro** | Describir el objetivo |

---

## Paso 2: Seleccionar agentes

Muestra la tabla de compatibilidad headless (arriba). Preguntar:

"Que agentes quieres? (ej: '1 codex, 1 claude, 1 gemini')"

Parsear la seleccion (cantidad + tipo).

---

## Paso 3: Asignar roles

Igual que en `/equipo-visual`:

- **Evaluacion**: Todos evaluadores, opcionalmente un meta-evaluador Claude
- **Implementacion**: Preguntar tarea por agente
- **Otro**: Preguntar roles

---

## Paso 4: Confirmar configuracion

Mostrar resumen y pedir confirmacion:

```
## Configuracion del equipo headless

Objetivo: [objetivo]

| # | Agente | CLI | Rol | Modo |
|---|--------|-----|-----|------|
| 1 | claude-1 | Claude Code | Meta-evaluador | Agent (background) |
| 2 | codex-1 | Codex | Evaluador | Bash (background) |
| 3 | gemini-1 | Gemini | Evaluador | Bash (background) |

Los agentes corren en background. Te informo cuando terminen.

Confirmas? (si/no)
```

### Politica de cierre de agentes

Despues de confirmar la configuracion, preguntar al usuario:

"Cuando se termine el trabajo, como quieres manejar el cierre de los agentes?"

| # | Opcion | Descripcion |
|---|--------|-------------|
| 1 | **Persistir** (default) | Agentes van a `idle` despues de completar tarea. El lider decide cuando enviar otra tarea o cerrarlos |
| 2 | **Consenso** | No se cierra ningun agente hasta que todos los evaluadores aprueben el resultado |
| 3 | **One-shot** | Comportamiento clasico: agentes terminan despues de la primera tarea |
| 4 | **Otra condicion** | El usuario define una condicion especifica |

Guardar la politica elegida en `scratch/equipo/state.json` bajo la clave `"politica_cierre"`.

**Si el usuario elige "Consenso"**: Antes de cerrar cualquier agente, Claude debe:
1. Enviar el resultado consolidado a todos los agentes via resume
2. Obtener confirmacion explicita de cada uno (APROBADO o CAMBIOS NECESARIOS)
3. Iterar hasta que todos aprueben
4. Solo entonces proponer el cierre al usuario

---

## Paso 5: Crear brief

Crear `scratch/equipo/brief.md` (mismo formato que equipo-visual).

Si los agentes necesitan leer archivos del repo, incluir las rutas absolutas en el prompt porque los agentes headless no siempre heredan el working directory correctamente.

---

## Paso 5-bis: Reservar los artefactos de ESTA corrida (OBLIGATORIO)

> **Por que existe este paso.** Las salidas de los CLIs externos iban a rutas FIJAS
> de `/tmp` (`/tmp/resultado-codex-1.md`, `/tmp/resultado-gemini-1.md`, ...) y se
> leian de esas mismas rutas fijas en el Paso 9. Con varios equipos headless
> corriendo en el mismo host — lo normal cuando hay agentes en paralelo — los N
> escriben y leen el MISMO archivo: el ultimo en escribir gana y el resto lee la
> salida ajena **sin ningun error**. El archivo existe, es markdown valido, y habla
> de otra cosa. El 2026-08-25 eso ocurrio tres veces en un dia en los comandos de
> revision, que copian este mecanismo; un agente vio un veredicto «APROBADO» de un
> PR que no era el suyo (`TSK-20260825T212834-5v5s`).

Reservar el directorio propio de esta corrida **antes** de lanzar ningun agente:

```bash
ART="$(git rev-parse --show-toplevel)/.claude/scripts/artefactos-revision.sh"
REVISION_ID="[proposito-corto]@[repo]@$(git rev-parse --short HEAD)"
ART_DIR="$("$ART" sellar --id "$REVISION_ID")" || exit 1
echo "Artefactos de esta corrida: $ART_DIR"
```

- `sellar` deriva `ART_DIR` de la sesion de Claude Code **mas** `REVISION_ID`, y
  **falla** si no puede identificar la sesion — nunca cae a una ruta compartida.
- `REVISION_ID` va en el brief de cada agente externo con la instruccion de abrir
  su salida con la linea exacta `REVISION-ID: <id>`; eso es lo que el Paso 9
  verifica antes de consolidar.
- Guardar `ART_DIR` y `REVISION_ID` en `scratch/equipo/state.json` — el Paso 8.5
  (resume) y el Paso 9 los necesitan.

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

## Paso 6: Lanzar agentes

**REGLA**: Lanzar TODOS los agentes en paralelo (un solo mensaje con multiples tool calls).

**REGLA**: Ningun agente externo escribe a una ruta fija de `/tmp` — todos escriben
dentro de `$ART_DIR` (Paso 5-bis).

### Agentes Claude -> Agent tool

```
Agent tool:
  subagent_type: "general-purpose"
  isolation: "worktree"
  name: "claude-1"
  prompt: "[contenido del brief + instrucciones especificas]"
```

**`isolation: "worktree"` es SIEMPRE obligatorio aqui** (no solo para implementacion colaborativa) —
sin el `Agent` con `name` queda inconsultable via `TaskOutput` (ver "Deadline duro para agentes
Claude" mas arriba). Para implementacion colaborativa, esto ademas le da a cada agente su propia
copia del repo (el motivo original de la recomendacion).

**NO existe `run_in_background: true` como parametro del `Agent` tool** — los `Agent` corren async
por defecto, sin flag. Si ves esa linea en un bloque `Agent tool:` de este comando, es un bug
residual, no una opcion valida.

**IMPORTANTE**: Guardar el `agent_id` retornado para resume posterior.

### Agentes externos -> Bash con run_in_background

Construir el comando segun la CLI:

**Codex (revision/evaluacion read-only):**
```bash
codex exec --sandbox read-only -o "$ART_DIR/resultado-codex-1.md" "[prompt completo + 'Tu salida DEBE empezar con la linea exacta REVISION-ID: $REVISION_ID']" </dev/null
```

**Codex (implementacion con escritura):**
```bash
codex exec --sandbox workspace-write -o "$ART_DIR/resultado-codex-1.md" "[prompt completo + 'Tu salida DEBE empezar con la linea exacta REVISION-ID: $REVISION_ID']" </dev/null
```

> **`</dev/null` OBLIGATORIO.** Sin este redirect, `codex exec` en background se cuelga en `Reading additional input from stdin...` sin analizar nada. Ver seccion "Gotcha critico: Codex y stdin en background" mas abajo.

> 🔴 **La linea `REVISION-ID` va en el prompt de TODOS los CLIs, no solo el de Codex.**
> El Paso 9 verifica **cada** salida externa con `artefactos-revision.sh verificar`, que
> por defecto exige que el archivo mencione el `REVISION_ID`. Si el prompt no se lo pide
> al agente, la salida llega sin esa linea, `verificar` sale 7 y el agente entra al
> resumen como `sin resultado` — un rojo falso, en cada corrida, para todo CLI que no
> sea Codex. Es la mitad de escritura del mismo arreglo: cambiar solo la ruta y no el
> prompt deja el comando roto en vez de arreglado.
>
> La unica excepcion es un CLI que no puede emitir texto libre al principio de su salida
> (OpenClaw, que devuelve JSON crudo): ese se verifica con `--sin-revision-id`, y es una
> escotilla declarada, no un olvido.

**Gemini:**
```bash
gemini -p "[prompt completo + 'Tu salida DEBE empezar con la linea exacta REVISION-ID: $REVISION_ID']" > "$ART_DIR/resultado-gemini-1.md" 2>&1
```

**Cursor Agent:**
```bash
cursor-agent -p "[prompt completo + 'Tu salida DEBE empezar con la linea exacta REVISION-ID: $REVISION_ID']" > "$ART_DIR/resultado-cursor-1.md" 2>&1
```

**OpenCode:**
```bash
opencode run "[prompt completo + 'Tu salida DEBE empezar con la linea exacta REVISION-ID: $REVISION_ID']" > "$ART_DIR/resultado-opencode-1.md" 2>&1
```

**Volt:**
```bash
volt run "[prompt completo + 'Tu salida DEBE empezar con la linea exacta REVISION-ID: $REVISION_ID']" > "$ART_DIR/resultado-volt-1.md" 2>&1
```

**OpenClaw:**
```bash
openclaw agent --agent main --local -m "[prompt completo]" --json > "$ART_DIR/resultado-openclaw-1.json" 2>&1
```
Para extraer el texto: leer el JSON y acceder a `payloads[0].text`.

> **OpenClaw es el caso `--sin-revision-id`.** Su salida es JSON crudo, asi que no se le
> pide la linea `REVISION-ID` y el Paso 9 lo verifica con `--sin-revision-id` (sigue
> exigiendo existencia, contenido y frescura; la pertenencia se apoya solo en la ruta).

**IMPORTANTE**: Usar `run_in_background: true` en TODOS los Bash calls. Esto devuelve un task ID para monitorear.

### Donde dejar los resultados

| CLI | Mecanismo de output |
|-----|-------------------|
| Claude Code | Incluir en el prompt: "NO escribas archivos. Devuelve tu resultado como texto." El Agent tool retorna el texto directamente |
| Codex | Flag `-o "$ART_DIR/resultado-[nombre].md"` escribe el ultimo mensaje al archivo |
| Todos los demas | Redirigir stdout: `> "$ART_DIR/resultado-[nombre].md" 2>&1` |

Para rondas subsiguientes, agregar `-rN` al nombre: `$ART_DIR/resultado-[nombre]-r2.md`

**Nunca una ruta fija de `/tmp`.** `$ART_DIR` es propio de esta sesion y de este
`REVISION_ID`; una ruta fija la comparten todos los equipos headless de la maquina,
y el cruce se lee sin ningun error.

---

## Paso 7: Guardar estado

Escribir `scratch/equipo/state.json`:

```json
{
  "created_at": "[timestamp ISO]",
  "modo": "headless",
  "objetivo": "[objetivo]",
  "politica_cierre": "persistir",
  "revision_id": "[REVISION_ID del Paso 5-bis]",
  "art_dir": "[ART_DIR del Paso 5-bis]",
  "ronda_actual": 1,
  "agentes": [
    {
      "nombre": "codex-1",
      "cli": "codex",
      "tipo": "bash_background",
      "rol": "Evaluador",
      "task_id": "brwf7xi58",
      "output_file": "[ART_DIR]/resultado-codex-1.md",
      "estado": "corriendo",
      "agent_id": null,
      "session_id": null,
      "tareas_completadas": 0
    },
    {
      "nombre": "claude-1",
      "cli": "claude",
      "tipo": "agent_background",
      "rol": "Meta-evaluador",
      "agent_id": "a1516a6d9c54d52a7",
      "output_file": null,
      "estado": "corriendo",
      "session_id": null,
      "tareas_completadas": 0
    }
  ]
}
```

### Ciclo de vida de estados

```
lanzado → corriendo → idle ←→ corriendo → ... → shutdown
                    ↘ timed_out / failed (estados terminales, no bloquean al resto)
```

| Estado | Significado |
|--------|-------------|
| `corriendo` | Ejecutando una tarea (proceso activo) |
| `idle` | Completo tarea, esperando nueva instruccion (proceso terminado pero reanudable) |
| `timed_out` | **(nuevo, Fase 6 del plan de deadline)** Agente Claude que no noticio dentro de `DEADLINE_POR_INTENTO_MS` (8-10 min) y el sondeo `TaskOutput` del Paso 8 tampoco obtuvo resultado — estado **terminal**, no se reintenta solo automaticamente. Solo aplica a agentes Claude (los CLIs externos ya tienen timeout real de `Bash`, ver "Deadline duro para agentes Claude") |
| `failed` | El agente respondio pero con error explicito, o el proceso/Agent termino sin resultado utilizable — estado terminal |
| `shutdown` | Cerrado explicitamente por el lider |

**Una ronda se considera terminada cuando TODOS los agentes estan en un estado terminal** —
`idle` (con resultado), `timed_out`, o `failed` — no solo cuando todos estan `idle`. Esto es lo que
permite que un agente colgado no bloquee indefinidamente la consolidacion del resto.

---

## Paso 8: Monitoreo

A diferencia de tmux, aqui NO necesitas polling activo. El sistema te notifica automaticamente:

- **Agent tool**: Notificacion automatica cuando el subagente termina
- **Bash background**: Notificacion automatica cuando el proceso termina (y ya tiene timeout real de
  proceso via `Bash timeout` — no necesita el mecanismo de esta seccion)

### Deadline para agentes Claude sin notificacion (nuevo, Fase 6 del plan de deadline)

Si un agente Claude no noticio dentro de `DEADLINE_POR_INTENTO_MS` (8-10 min, perfil "revisor
simple") desde que se lanzo/resumio: **un** sondeo acotado —
`TaskOutput(agent_id, block: true, timeout: <tiempo restante hasta el deadline>)` — NO un loop.
- Si `TaskOutput` devuelve el resultado: procesarlo normal (llego, solo tarde para el sondeo pero a
  tiempo para el deadline).
- Si `TaskOutput` da error (`No task found`, etc.) o vuelve a agotar el timeout: `TaskStop(agent_id)`
  best-effort (ignorar si falla) y marcar el agente como `timed_out`. **NO esperar mas alla de este
  sondeo** — continuar con el resto del equipo.

### Cuando llega una notificacion (o se resuelve un sondeo del punto anterior)

1. Leer el resultado (Read tool para archivos, TaskOutput para bash tasks)
2. Guardar `agent_id` (Claude) en state.json para resume posterior
3. Incrementar `tareas_completadas`
4. Evaluar segun politica de cierre — el calculo de "todos terminaron" ahora es **"todos en estado
   terminal"** (`idle`/`timed_out`/`failed`), no solo `idle`:

**Si politica = "persistir" (default):**
- Marcar estado como `idle` (o `timed_out`/`failed` si aplica)
- Si todos estan en estado terminal: informar al usuario, incluyendo los que quedaron
  `timed_out`/`failed` explicitamente:
  ```
  Ronda [N] completada. [N-k] agentes idle, [k] no respondieron a tiempo (timed_out/failed).

  | Agente | Estado | Tareas completadas |
  |--------|--------|--------------------|
  | codex-1 | idle | 1 |
  | claude-1 | timed_out | 0 |

  Opciones:
  1. Enviar nueva tarea (ronda N+1) a los que siguen idle
  2. Consolidar resultados de los que respondieron (los timed_out/failed quedan marcados como ausentes)
  3. Shutdown de todos los agentes
  ```
- Esperar decision del usuario

**Si politica = "consenso":**
- Marcar estado como `idle`/`timed_out`/`failed`
- Si todos estan en estado terminal: consolidar resultados de los que respondieron, enviar
  consolidado a los que siguen `idle` via resume (Paso 8.5), pedir aprobacion. **Default de quorum
  (Fase 6 del plan):** el consenso se calcula sobre los agentes que respondieron dentro de su
  deadline; los `timed_out`/`failed` quedan marcados explicitamente como ausentes en el reporte
  final, no cuentan ni a favor ni en contra.

**Si politica = "one-shot":**
- Marcar estado como `shutdown` (o `timed_out`/`failed` si no respondio)
- Si todos estan en estado terminal: consolidar y presentar (Paso 9)

**Default de rol critico (panel-writer u otro rol sin el cual no se puede consolidar):** si el
agente con ese rol queda `timed_out`/`failed`, el primer agente disponible entre los que ya
respondieron asume el rol usando solo los resultados disponibles hasta ese momento — documentar en
el reporte final que el agente original de ese rol no respondio.

### Si un agente falla

1. Leer el output para diagnosticar el error
2. Informar al usuario
3. Ofrecer relanzar con el comando corregido (no reintento automatico — distinto del sondeo acotado
   de `timed_out`, que es automatico y una sola vez)

### Errores comunes por CLI

| CLI | Error comun | Solucion |
|-----|-------------|----------|
| Codex | `unexpected argument '-q'` | Usar `codex exec --sandbox read-only`, NO `codex -q` |
| Codex | `unexpected argument '--writable'` | No existe ese flag. Usar `--sandbox workspace-write` o `-s workspace-write` |
| Codex | Proceso vivo, 0% CPU, `tail` del output muestra solo `Reading additional input from stdin...`, archivo `-o` nunca se crea | **`</dev/null` faltante al final del comando.** `codex exec` detecta el stdin no-TTY del shell background y entra en modo "leer prompt adicional hasta EOF", bloqueandose indefinidamente. Incidente: 2026-04-23 revision PR #308 — 4 Codex colgados 13 min. Fix: agregar `</dev/null` al final. En TTY interactivo funciona sin el redirect |
| Gemini | Output incluye JSON con stats | Redirigir a archivo, leer y extraer el campo `response` del JSON |
| Gemini | Output vacio | Verificar que `gemini` esta autenticado (`gemini auth`) |
| OpenCode | Output incluye ANSI escape codes | Agregar `\| sed 's/\x1b\[[0-9;]*m//g'` al pipe, o ignorar los codes al leer |
| Todos | Timeout | Usar `timeout: 300000` (5 min) en Bash tool. Para tareas largas, 600000 (10 min) |
| Todos | API key / autenticacion | Los CLIs ya estan autenticados en la maquina. NUNCA buscar API keys. Ejecutar directamente |

---

## Paso 8.5: Enviar nueva tarea (resume)

Cuando el lider decide enviar otra ronda de trabajo a agentes en estado `idle`:

### Preparacion

1. Incrementar `ronda_actual` en state.json
2. Crear el nuevo prompt con contexto de la ronda anterior (resultados, feedback, instrucciones nuevas)
3. **Re-sellar** y actualizar los output files para la nueva ronda:

   ```bash
   ART_DIR="$("$ART" sellar --id "$REVISION_ID" --ronda N)" || exit 1
   ```

   `sellado_en` es la marca contra la que el Paso 9 mide frescura. Sin re-sellar,
   la ronda N aceptaria la salida de la ronda anterior como si fuera nueva. Los
   archivos de la ronda nueva van a `$ART_DIR/resultado-[nombre]-r[N].md`

### Resume por tipo de agente

> **CRITICO — Interactive vs Non-interactive**
>
> Los CLIs tienen DOS modos de resume: interactivo (requiere TTY/terminal) y no-interactivo (funciona desde Bash tool).
> Desde Claude Code **SIEMPRE** usar el modo no-interactivo:
>
> | CLI | CORRECTO (no-interactivo) | INCORRECTO (requiere TTY) |
> |-----|--------------------------|--------------------------|
> | Codex | `codex exec resume ...` | `codex resume ...` |
>
> Si usas el modo interactivo desde Bash tool, el comando falla con "stdin is not a terminal" o se ejecuta
> pero ignora el nuevo prompt y repite la sesion anterior.

**Claude agents:**
```
Agent tool:
  resume: "[agent_id del state.json]"
  prompt: "[nueva instruccion con contexto de ronda anterior]"
```

> 🔴 **El prompt de la ronda N vuelve a pedir la linea `REVISION-ID`, igual que el de la
> ronda 1.** El `REVISION_ID` NO cambia entre rondas (identifica *que* se esta revisando,
> no *cuantas veces*); lo que cambia es el sello de frescura y el nombre del archivo. Un
> prompt de resume que omite la linea produce una salida que `verificar` rechaza con 7,
> y la ronda entera queda `sin resultado`. La ronda 2 es justo donde el bug original
> mordia mas fuerte, asi que aqui no se afloja.

**Codex (con session ID):**
```bash
codex exec --sandbox read-only resume <session_id> -o "$ART_DIR/resultado-codex-1-r2.md" "[nueva instruccion, con la misma linea REVISION-ID: $REVISION_ID]" </dev/null
```

**Codex (sin session ID) — relanzar FRESCO, no `--last`:**
```bash
codex exec --sandbox read-only -o "$ART_DIR/resultado-codex-1-r2.md" "[contexto de la ronda anterior + nueva instruccion, concatenados, con la misma linea REVISION-ID: $REVISION_ID]" </dev/null
```

> 🔴 **`--last` es por DIRECTORIO, no por agente — y `verificar` no lo atrapa.**
> `resume --last` resuelve a la ultima sesion de Codex de ese `cwd`. Con dos o mas
> Codex lanzados desde ahi —los de esta misma corrida, o los de otro equipo
> headless / `/revisar-pr` que este corriendo en paralelo en la maquina— todos los
> `--last` apuntan al mismo sitio y cada agente recibe el contexto de otro.
>
> El Paso 9 **no puede** detectarlo: la sesion equivocada escribe en *tu*
> `$ART_DIR`, con *tu* `REVISION-ID` (se lo pide tu prompt) y despues de *tu*
> sello, asi que los cuatro chequeos pasan. La pertenencia demuestra que el archivo
> es de esta corrida, no que el agente haya leido lo de esta corrida.
>
> Orden de preferencia: `<session_id>` explicito (guardado en state.json) →
> sesion fresca con el contexto concatenado. `--last` solo si podes garantizar que
> hubo **una unica** sesion de Codex en ese directorio, cosa que en este equipo no
> se puede garantizar.

El `</dev/null` aplica igual a `codex exec resume` — la regla cubre cualquier invocacion de `codex exec*` en background.

**Gemini — relanzar FRESCO (`--resume latest` es un «ultimo» sin medir):**
```bash
gemini -p "[contexto de la ronda anterior + nueva instruccion, concatenados, con la misma linea REVISION-ID: $REVISION_ID]" > "$ART_DIR/resultado-gemini-1-r2.md" 2>&1
```

**OpenCode — session ID explicito; sin el, relanzar FRESCO (nunca `-c`):**
```bash
opencode run -s <sessionId> "[nueva instruccion, con la misma linea REVISION-ID: $REVISION_ID]" > "$ART_DIR/resultado-opencode-1-r2.md" 2>&1
```

> **Por que aca tampoco `--resume latest` ni `-c`.** Nadie midio a que resuelven esos
> «ultimo» —solo esta verificado el de Codex, que resuelve por directorio— y son de
> la misma forma: piden «el ultimo» sin decir de quien. Mientras no se mida, la
> opcion barata es la determinista. OpenCode si tiene identificador explicito
> (`-s <sessionId>`); Gemini no, asi que ahi solo queda relanzar fresco.
>
> Esto no esta guardado por un test a proposito (el guard 26 cubre solo el caso
> verificado, Codex): un guard sobre un supuesto no medido es un falso rojo, y un
> guard que grita cuando no debe se termina desactivando.

**CLIs sin resume (Volt, Cursor Agent, OpenClaw):**
```bash
# Relanzar sin contexto de sesion — incluir contexto relevante en el prompt
volt run "[contexto de ronda anterior + nueva instruccion, con la misma linea REVISION-ID: $REVISION_ID]" > "$ART_DIR/resultado-volt-1-r2.md" 2>&1
```

### Despues de enviar

1. Marcar todos los agentes resumidos como `corriendo`
2. Los agentes Claude (`Agent tool`) ya corren async por defecto, sin flag; los CLIs externos (Bash) SIEMPRE con `run_in_background: true`
3. Volver al Paso 8 (monitoreo) para esperar resultados

**REGLA**: Lanzar TODOS los resumes en paralelo (un solo mensaje con multiples tool calls).

**NOTA sobre multiples agentes de la misma CLI**: Si hay 2+ agentes del mismo tipo (ej: codex-1 y codex-2), `--last` resumiria el mas reciente, no ambos. En ese caso, usar session IDs explicitos o incluir el contexto completo en el prompt como fallback.

---

## Paso 9: Consolidar resultados

Cuando la politica de cierre se cumple (todos los agentes estan `shutdown` o el usuario decide cerrar):

1. **Verificar la pertenencia de cada salida externa ANTES de leerla:**

   **El nombre que se verifica es el de la ronda ACTUAL** — en la ronda 1 es
   `resultado-<nombre>.md`; desde la ronda 2 lleva el sufijo `-r<N>` (regla 14). Verificar
   el nombre de la ronda 1 estando en la ronda 2 es leer el archivo viejo: existe, no esta
   vacio y menciona el `REVISION_ID` (que no cambia entre rondas), asi que los tres primeros
   chequeos pasan — lo unico que lo atrapa es la frescura contra el sello de `--ronda N`, y
   solo si se re-sello. No dependas de eso: nombra la ronda.

   ```bash
   RONDA=1   # <- la ronda_actual del state.json
   SUF=""; [ "$RONDA" -gt 1 ] && SUF="-r${RONDA}"
   for A in codex-1 gemini-1 cursor-1; do
     "$ART" verificar --id "$REVISION_ID" "resultado-${A}${SUF}.md" || echo "⚠ $A sin salida utilizable"
   done
   # OpenClaw devuelve JSON crudo — sin linea REVISION-ID, escotilla declarada:
   "$ART" verificar --id "$REVISION_ID" --sin-revision-id "resultado-openclaw-1${SUF}.json" \
     || echo "⚠ openclaw-1 sin salida utilizable"
   ```

   `verificar` imprime la ruta si la salida es de esta corrida; si no, sale != 0
   diciendo que fallo (no existe / vacia / sobrante de la ronda anterior / habla de
   otra cosa). **Una salida que no pasa no se lee ni se consolida, y no se
   sustituye por una parecida de `/tmp`** — la que haya ahi es de otro equipo.
   Ese agente entra al resumen como `sin resultado`, nunca como coincidencia.

   `--sin-revision-id` es SOLO para el CLI que no puede emitir la linea (hoy: OpenClaw).
   No lo uses para silenciar un rojo de Gemini/Cursor/OpenCode/Volt: si esos fallan la
   verificacion de identidad, lo que falta es la instruccion en su prompt (Paso 6), y
   taparlo con la escotilla reintroduce exactamente el fallo silencioso del 2026-08-25.

2. Leer las salidas que pasaron la verificacion (de la ronda actual, y anteriores si aplica)
3. Presentar un resumen consolidado:
   - Coincidencias unanimes
   - Diferencias interesantes entre agentes
   - Tabla comparativa si aplica
   - Numero de rondas ejecutadas
4. Marcar todos los agentes como `shutdown` en state.json

---

## Limitaciones del resume

| CLI | Limitacion | Workaround |
|-----|-----------|------------|
| Gemini | `-p` + `--resume` juntos no verificado | Si falla, relanzar sin resume (incluir contexto en prompt) |
| Volt | Sin resume | Relanzar con contexto completo en el prompt |
| Cursor Agent | Sin resume conocido | Relanzar con contexto completo en el prompt |
| OpenClaw | Sin resume conocido | Relanzar con contexto completo en el prompt |
| Multiples agentes misma CLI, o varios equipos en la maquina | **Codex `resume --last` — VERIFICADO:** resuelve por DIRECTORIO, no por agente; devuelve la ultima sesion de ese `cwd`, que puede ser la de otro agente o la de otra corrida. El Paso 9 no lo detecta (la sesion ajena escribe en tu `$ART_DIR` con tu `REVISION-ID`). **Gemini `--resume latest` y OpenCode `-c` — NO verificados**, pero son de la misma forma («el ultimo», sin decir de quien): tratalos igual hasta que alguien mida lo contrario | Session ID explicito (`opencode run -s <sessionId>`), o relanzar fresco con el contexto en el prompt |

---

## Reglas hardcodeadas

Estas reglas aplican SIEMPRE, sin excepcion:

1. **Lanzar TODOS los agentes en paralelo** — un solo mensaje con multiples tool calls
2. **NO hacer polling activo mientras hay presupuesto** — esperar notificaciones automaticas del sistema. Al borde del `DEADLINE_POR_INTENTO_MS` de un agente Claude sin notificacion, UN sondeo acotado via `TaskOutput` (Paso 8) — no un loop de sondeos
3. **Rutas absolutas** en todos los prompts para agentes externos (no heredan working directory)
4. **Timeout de 5 minutos** por defecto. Tareas complejas: 10 minutos
5. **Codex**: SIEMPRE usar `codex exec --sandbox read-only` para revisiones/evaluaciones; usar `--sandbox workspace-write` solo para implementacion que deba editar archivos. NUNCA `codex -q` (deprecado)
5b. **Codex en background**: SIEMPRE agregar `</dev/null` al final del comando — sin eso, se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308). Aplica a `codex exec` Y `codex exec resume`. Ver seccion "Gotcha critico: Codex y stdin en background"
6. **Gemini**: output es JSON con metadata. Redirigir a archivo y leer con Read tool
7. **Claude agents**: SIEMPRE via `Agent` tool, SIEMPRE con `isolation: "worktree"` (necesario para que `name` no rompa `TaskOutput` — ver "Deadline duro para agentes Claude"). NUNCA `run_in_background: true` — ese parametro no existe en el tool `Agent`
8. **Resultados**: Archivos en `$ART_DIR/resultado-[nombre].md` para externos (nunca una ruta fija de `/tmp`), texto directo para Claude
9. **Si un agente falla**: leer output, diagnosticar, ofrecer relanzar. NO reintentar automaticamente
10. **State file**: mantener actualizado `scratch/equipo/state.json`
11. **Politica de cierre default: "persistir"** — agentes van a `idle` despues de completar tarea, listos para resume
12. **NUNCA cerrar agentes** sin cumplir la politica de cierre elegida por el usuario
13. **Session resume**: usar `agent_id` para Claude y `<session_id>` explicito para los CLIs externos. **Codex `resume --last` esta PROHIBIDO** — resuelve por directorio, no por agente (verificado), y el reporte que produce pasa la verificacion del Paso 9 aunque venga de la sesion de otro. Los «ultimo» de las demas CLIs (`-c`, `--resume latest`) no estan medidos: tratalos igual. Sin session ID: relanzar fresco con el contexto concatenado en el prompt
14. **Output files multi-ronda**: `$ART_DIR/resultado-[nombre]-r[N].md` (ej: `resultado-codex-1-r2.md`), con `sellar --ronda N` antes de cada ronda
15. **Multiples agentes de la misma CLI**: necesitan session IDs explicitos (no `--last`) o contexto completo en prompt
16. **Verificar antes de consolidar**: toda salida de un agente externo pasa por `artefactos-revision.sh verificar` antes de leerse (Paso 9), con el nombre de la **ronda actual** (`-r[N]` desde la ronda 2). Una salida que no acredita pertenencia entra al resumen como `sin resultado`, nunca como coincidencia
16b. **La linea `REVISION-ID` va en el prompt de TODO CLI externo, en TODA ronda** — Codex, Gemini, Cursor, OpenCode y Volt (Pasos 6 y 8.5). Es la mitad de ESCRITURA de la regla 16: `verificar` la exige al leer, asi que un prompt que no la pide produce un rojo garantizado. Unica excepcion: un CLI que no puede emitir texto libre al inicio (hoy OpenClaw, JSON crudo), que se verifica con `--sin-revision-id`. Esa escotilla es para ese caso, **no** para silenciar el rojo de un CLI al que simplemente se le olvido pedir la linea
17. **NUNCA buscar API keys para agentes externos** — los CLIs (codex, gemini, etc.) ya estan autenticados en la maquina. Ejecutarlos directamente. Si fallan por autenticacion, avisar al usuario para que lo resuelva manualmente. No buscar en Secrets Manager, env vars, ni ninguna otra fuente
18. **NUNCA le dictes a otro agente la ruta de salida de su artefacto** — ni un `-o /tmp/...`, ni un sufijo «para que no choquen», ni el nombre del archivo que vas a leer despues. Pedile que corra el comando (`/revisar-cambio` y sus hijos ya llaman a `artefactos-revision.sh`) y que te reporte el veredicto. **El fix del PR #557 estaba vivo y propagado el 2026-08-27 y el defecto volvio igual, porque la instruccion del orquestador se salteo el helper desde afuera.** Sufijar a mano NO es equivalente: tapa la colision entre corridas simultaneas y deja vivo el caso de leer un resto de tu PROPIA corrida anterior, que es el que `verificar` existe para atrapar. Las rutas `$ART_DIR/...` de este documento las deriva el helper en el Paso 5-bis; no son un path para copiar a un prompt ajeno

---

## Cuando usar headless vs visual

| Situacion | Usar |
|-----------|------|
| Evaluaciones rapidas, revisiones de codigo o planes | **Headless** |
| Trabajo que no requiere interaccion con los agentes | **Headless** |
| El usuario quiere ver el progreso en su sesion actual | **Headless** |
| Implementacion colaborativa con multiples ediciones de archivos | **Visual** (mejor visibilidad) |
| Agentes que necesitan interaccion humana durante el trabajo | **Visual** |
| Sesiones largas con monitoreo visual | **Visual** |
