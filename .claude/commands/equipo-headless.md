---
description: Coordinar equipo multi-agente headless (background, sin tmux)
allowed-tools: Bash(codex:*), Bash(gemini:*), Bash(auggie:*), Bash(cursor-agent:*), Bash(opencode:*), Bash(volt:*), Bash(claude:*), Bash(sleep:*), Bash(cat:*), Read, Write, Edit, Glob, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, SendMessage, TeamCreate
---

# Equipo Multi-Agente Headless

Coordina un equipo de agentes IA corriendo en background dentro de la sesion actual de Claude Code. Sin tmux, sin ventanas externas.

**Diferencia con `/equipo-visual`**: Aqui todo corre como procesos background o subagentes. El usuario ve el progreso directamente en su sesion de Claude Code. Ideal para tareas que no requieren interaccion visual con los agentes.

---

## Compatibilidad headless por CLI

| # | CLI | Comando headless | Output | Resume | Notas |
|---|-----|-----------------|--------|--------|-------|
| 1 | **Claude Code** | Agent tool con `run_in_background: true` | Retorna resultado directo | `Agent tool` con `resume: agent_id` | Subagente nativo, la opcion mas integrada |
| 2 | **Codex** | `codex exec --full-auto -o /tmp/output.md "prompt" </dev/null` | Archivo via `-o` flag | `codex exec resume --last "prompt" </dev/null` o `codex exec resume <session_id> "prompt" </dev/null` | `exec` es el subcomando no-interactivo. NO usar `-q` (deprecado). `--full-auto` habilita ejecucion sin aprobaciones. **`</dev/null` OBLIGATORIO en background** — ver seccion "Gotcha critico: Codex y stdin" mas abajo |
| 3 | **Gemini** | `gemini -p "prompt"` | stdout (redirigir a archivo con `> /tmp/output.md`) | `gemini -p "prompt" --resume latest` (verificar compatibilidad) | Output incluye JSON con stats al final. Extraer campo `response` para el contenido limpio |
| 4 | **Auggie** | `auggie -p "prompt"` o `auggie -i "prompt" -p` | stdout | `auggie -p -c -i "prompt"` o `auggie -p -r <sessionId> -i "prompt"` | `-p` = print mode (one-shot). `-q` = solo mensaje final |
| 5 | **Cursor Agent** | `cursor-agent -p "prompt"` | stdout | Sin resume conocido | `-p` = print mode. `--output-format json` para JSON estructurado |
| 6 | **OpenCode** | `opencode run "prompt"` | stdout | `opencode run -c "prompt"` o `opencode run -s <sessionId> "prompt"` | Subcomando `run` para ejecucion no-interactiva |
| 7 | **Volt** | `volt run "prompt"` | stdout | Sin resume conocido | Subcomando `run` para ejecucion no-interactiva |
| 8 | **OpenClaw** | `openclaw agent --agent main --local -m "prompt" --json` | stdout (JSON con campo `payloads[0].text`) | Sin resume conocido | `--local` corre agente embebido sin gateway. `--json` para output estructurado. Requiere `--agent <id>` (usar `openclaw agents list` para ver disponibles) |

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
cd /tmp/worktree && codex exec --full-auto -o /tmp/out.md "mi prompt"

# BIEN — stdin cerrado explicitamente
cd /tmp/worktree && codex exec --full-auto -o /tmp/out.md "mi prompt" </dev/null
```

Aplica a TODAS las invocaciones: `codex exec`, `codex exec resume`, `codex exec resume --last`, `codex exec resume <session_id>`. La regla es "todo `codex exec*` en background lleva `</dev/null` al final".

**Incidente de referencia:** 2026-04-23, revision post-merge del PR #308 en agente-de-monitoreo via `/revisar-pr`. 4 Codex lanzados en paralelo (Seguridad/Arquitectura/Calidad/Performance) se quedaron 13 min en `Reading additional input from stdin...` sin producir resultados. Fueron reemplazados por Auggie como fallback.

**Como detectar el problema en vivo:**
```bash
# ps muestra el proceso vivo
ps aux | grep -E "codex exec" | grep -v grep

# pero el output file no existe
ls /tmp/resultado-*-codex.md

# y el task output muestra el sintoma
tail -3 /private/tmp/claude-501/.../tasks/<task_id>.output
# → "Reading additional input from stdin..."
```

**Plan de recuperacion:** `pkill -9 -f "codex exec"` y relanzar con el fix, o sustituir por Auggie (`cd <path> && auggie -p -i "prompt" > /tmp/out.md 2>&1` — Auggie no tiene este problema).

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

## Paso 6: Lanzar agentes

**REGLA**: Lanzar TODOS los agentes en paralelo (un solo mensaje con multiples tool calls).

### Agentes Claude -> Agent tool

```
Agent tool:
  subagent_type: "general-purpose"
  run_in_background: true
  name: "claude-1"
  prompt: "[contenido del brief + instrucciones especificas]"
```

Para implementacion colaborativa, considerar `isolation: "worktree"` para que cada agente tenga su propia copia del repo.

**IMPORTANTE**: Guardar el `agent_id` retornado para resume posterior.

### Agentes externos -> Bash con run_in_background

Construir el comando segun la CLI:

**Codex:**
```bash
codex exec --full-auto -o /tmp/resultado-codex-1.md "[prompt completo]" </dev/null
```

> **`</dev/null` OBLIGATORIO.** Sin este redirect, `codex exec` en background se cuelga en `Reading additional input from stdin...` sin analizar nada. Ver seccion "Gotcha critico: Codex y stdin en background" mas abajo.

**Gemini:**
```bash
gemini -p "[prompt completo]" > /tmp/resultado-gemini-1.md 2>&1
```

**Auggie:**
```bash
auggie -p -i "[prompt completo]" > /tmp/resultado-auggie-1.md 2>&1
```

**Cursor Agent:**
```bash
cursor-agent -p "[prompt completo]" > /tmp/resultado-cursor-1.md 2>&1
```

**OpenCode:**
```bash
opencode run "[prompt completo]" > /tmp/resultado-opencode-1.md 2>&1
```

**Volt:**
```bash
volt run "[prompt completo]" > /tmp/resultado-volt-1.md 2>&1
```

**OpenClaw:**
```bash
openclaw agent --agent main --local -m "[prompt completo]" --json > /tmp/resultado-openclaw-1.json 2>&1
```
Para extraer el texto: leer el JSON y acceder a `payloads[0].text`.

**IMPORTANTE**: Usar `run_in_background: true` en TODOS los Bash calls. Esto devuelve un task ID para monitorear.

### Donde dejar los resultados

| CLI | Mecanismo de output |
|-----|-------------------|
| Claude Code | Incluir en el prompt: "NO escribas archivos. Devuelve tu resultado como texto." El Agent tool retorna el texto directamente |
| Codex | Flag `-o /tmp/resultado-[nombre].md` escribe el ultimo mensaje al archivo |
| Todos los demas | Redirigir stdout: `> /tmp/resultado-[nombre].md 2>&1` |

Para rondas subsiguientes, agregar `-rN` al nombre: `/tmp/resultado-[nombre]-r2.md`

---

## Paso 7: Guardar estado

Escribir `scratch/equipo/state.json`:

```json
{
  "created_at": "[timestamp ISO]",
  "modo": "headless",
  "objetivo": "[objetivo]",
  "politica_cierre": "persistir",
  "ronda_actual": 1,
  "agentes": [
    {
      "nombre": "codex-1",
      "cli": "codex",
      "tipo": "bash_background",
      "rol": "Evaluador",
      "task_id": "brwf7xi58",
      "output_file": "/tmp/resultado-codex-1.md",
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
```

| Estado | Significado |
|--------|-------------|
| `corriendo` | Ejecutando una tarea (proceso activo) |
| `idle` | Completo tarea, esperando nueva instruccion (proceso terminado pero reanudable) |
| `shutdown` | Cerrado explicitamente por el lider |

---

## Paso 8: Monitoreo

A diferencia de tmux, aqui NO necesitas polling activo. El sistema te notifica automaticamente:

- **Agent tool**: Notificacion automatica cuando el subagente termina
- **Bash background**: Notificacion automatica cuando el proceso termina

### Cuando llega una notificacion

1. Leer el resultado (Read tool para archivos, TaskOutput para bash tasks)
2. Guardar `agent_id` (Claude) en state.json para resume posterior
3. Incrementar `tareas_completadas`
4. Evaluar segun politica de cierre:

**Si politica = "persistir" (default):**
- Marcar estado como `idle`
- Si todos estan `idle`: informar al usuario:
  ```
  Ronda [N] completada. Todos los agentes estan idle y listos para otra tarea.

  | Agente | Estado | Tareas completadas |
  |--------|--------|--------------------|
  | codex-1 | idle | 1 |
  | claude-1 | idle | 1 |

  Opciones:
  1. Enviar nueva tarea (ronda N+1)
  2. Consolidar resultados
  3. Shutdown de todos los agentes
  ```
- Esperar decision del usuario

**Si politica = "consenso":**
- Marcar estado como `idle`
- Si todos estan `idle`: consolidar resultados, enviar consolidado a todos via resume (Paso 8.5), pedir aprobacion

**Si politica = "one-shot":**
- Marcar estado como `shutdown`
- Si todos estan `shutdown`: consolidar y presentar (Paso 9)

### Si un agente falla

1. Leer el output para diagnosticar el error
2. Informar al usuario
3. Ofrecer relanzar con el comando corregido

### Errores comunes por CLI

| CLI | Error comun | Solucion |
|-----|-------------|----------|
| Codex | `unexpected argument '-q'` | Usar `codex exec --full-auto`, NO `codex -q` |
| Codex | `unexpected argument '--writable'` | No existe ese flag. Usar `--full-auto` o `-s workspace-write` |
| Codex | Proceso vivo, 0% CPU, `tail` del output muestra solo `Reading additional input from stdin...`, archivo `-o` nunca se crea | **`</dev/null` faltante al final del comando.** `codex exec` detecta el stdin no-TTY del shell background y entra en modo "leer prompt adicional hasta EOF", bloqueandose indefinidamente. Incidente: 2026-04-23 revision PR #308 — 4 Codex colgados 13 min. Fix: agregar `</dev/null` al final. En TTY interactivo funciona sin el redirect |
| Gemini | Output incluye JSON con stats | Redirigir a archivo, leer y extraer el campo `response` del JSON |
| Gemini | Output vacio | Verificar que `gemini` esta autenticado (`gemini auth`) |
| Auggie | `indexing confirmation prompt` | `-p` flag lo salta automaticamente. Agregar `-q` para output limpio (solo respuesta final) |
| OpenCode | Output incluye ANSI escape codes | Agregar `\| sed 's/\x1b\[[0-9;]*m//g'` al pipe, o ignorar los codes al leer |
| Todos | Timeout | Usar `timeout: 300000` (5 min) en Bash tool. Para tareas largas, 600000 (10 min) |
| Todos | API key / autenticacion | Los CLIs ya estan autenticados en la maquina. NUNCA buscar API keys. Ejecutar directamente |

---

## Paso 8.5: Enviar nueva tarea (resume)

Cuando el lider decide enviar otra ronda de trabajo a agentes en estado `idle`:

### Preparacion

1. Incrementar `ronda_actual` en state.json
2. Crear el nuevo prompt con contexto de la ronda anterior (resultados, feedback, instrucciones nuevas)
3. Actualizar output files para la nueva ronda: `/tmp/resultado-[nombre]-r[N].md`

### Resume por tipo de agente

> **CRITICO — Interactive vs Non-interactive**
>
> Los CLIs tienen DOS modos de resume: interactivo (requiere TTY/terminal) y no-interactivo (funciona desde Bash tool).
> Desde Claude Code **SIEMPRE** usar el modo no-interactivo:
>
> | CLI | CORRECTO (no-interactivo) | INCORRECTO (requiere TTY) |
> |-----|--------------------------|--------------------------|
> | Codex | `codex exec resume ...` | `codex resume ...` |
> | Auggie | `auggie --print --resume ...` | `auggie --resume ...` (sin --print) |
>
> Si usas el modo interactivo desde Bash tool, el comando falla con "stdin is not a terminal" o se ejecuta
> pero ignora el nuevo prompt y repite la sesion anterior.

**Claude agents:**
```
Agent tool:
  resume: "[agent_id del state.json]"
  run_in_background: true
  prompt: "[nueva instruccion con contexto de ronda anterior]"
```

**Codex (con session ID):**
```bash
codex exec resume <session_id> --full-auto -o /tmp/resultado-codex-1-r2.md "[nueva instruccion]" </dev/null
```

**Codex (sin session ID, usa ultimo):**
```bash
codex exec resume --last --full-auto -o /tmp/resultado-codex-1-r2.md "[nueva instruccion]" </dev/null
```

El `</dev/null` aplica igual a `codex exec resume` — la regla cubre cualquier invocacion de `codex exec*` en background.

**Auggie (con session ID):**
```bash
auggie --print --resume <session_id> "[nueva instruccion]" > /tmp/resultado-auggie-1-r2.md 2>&1
```

**Auggie (continue last):**
```bash
auggie --print --continue "[nueva instruccion]" > /tmp/resultado-auggie-1-r2.md 2>&1
```

**Gemini (resume latest):**
```bash
gemini -p "[nueva instruccion]" --resume latest > /tmp/resultado-gemini-1-r2.md 2>&1
```

**OpenCode (continue last):**
```bash
opencode run -c "[nueva instruccion]" > /tmp/resultado-opencode-1-r2.md 2>&1
```

**CLIs sin resume (Volt, Cursor Agent, OpenClaw):**
```bash
# Relanzar sin contexto de sesion — incluir contexto relevante en el prompt
volt run "[contexto de ronda anterior + nueva instruccion]" > /tmp/resultado-volt-1-r2.md 2>&1
```

### Despues de enviar

1. Marcar todos los agentes resumidos como `corriendo`
2. Usar `run_in_background: true` en todos los calls
3. Volver al Paso 8 (monitoreo) para esperar resultados

**REGLA**: Lanzar TODOS los resumes en paralelo (un solo mensaje con multiples tool calls).

**NOTA sobre multiples agentes de la misma CLI**: Si hay 2+ agentes del mismo tipo (ej: codex-1 y codex-2), `--last` resumiria el mas reciente, no ambos. En ese caso, usar session IDs explicitos o incluir el contexto completo en el prompt como fallback.

---

## Paso 9: Consolidar resultados

Cuando la politica de cierre se cumple (todos los agentes estan `shutdown` o el usuario decide cerrar):

1. Leer todos los resultados de la ronda actual (y anteriores si aplica)
2. Presentar un resumen consolidado:
   - Coincidencias unanimes
   - Diferencias interesantes entre agentes
   - Tabla comparativa si aplica
   - Numero de rondas ejecutadas
3. Marcar todos los agentes como `shutdown` en state.json

---

## Limitaciones del resume

| CLI | Limitacion | Workaround |
|-----|-----------|------------|
| Gemini | `-p` + `--resume` juntos no verificado | Si falla, relanzar sin resume (incluir contexto en prompt) |
| Volt | Sin resume | Relanzar con contexto completo en el prompt |
| Cursor Agent | Sin resume conocido | Relanzar con contexto completo en el prompt |
| OpenClaw | Sin resume conocido | Relanzar con contexto completo en el prompt |
| Multiples agentes misma CLI | `--last`/`-c` resume solo el ultimo, no uno especifico | Usar session IDs explicitos o incluir contexto en prompt |

---

## Reglas hardcodeadas

Estas reglas aplican SIEMPRE, sin excepcion:

1. **Lanzar TODOS los agentes en paralelo** — un solo mensaje con multiples tool calls
2. **NO hacer polling** — esperar notificaciones automaticas del sistema
3. **Rutas absolutas** en todos los prompts para agentes externos (no heredan working directory)
4. **Timeout de 5 minutos** por defecto. Tareas complejas: 10 minutos
5. **Codex**: SIEMPRE usar `codex exec --full-auto`. NUNCA `codex -q` (deprecado)
5b. **Codex en background**: SIEMPRE agregar `</dev/null` al final del comando — sin eso, se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308). Aplica a `codex exec` Y `codex exec resume`. Ver seccion "Gotcha critico: Codex y stdin en background"
6. **Gemini**: output es JSON con metadata. Redirigir a archivo y leer con Read tool
7. **Claude agents**: SIEMPRE via Agent tool con `run_in_background: true`
8. **Resultados**: Archivos en `/tmp/resultado-[nombre].md` para externos, texto directo para Claude
9. **Si un agente falla**: leer output, diagnosticar, ofrecer relanzar. NO reintentar automaticamente
10. **State file**: mantener actualizado `scratch/equipo/state.json`
11. **Politica de cierre default: "persistir"** — agentes van a `idle` despues de completar tarea, listos para resume
12. **NUNCA cerrar agentes** sin cumplir la politica de cierre elegida por el usuario
13. **Session resume**: usar `agent_id` para Claude, `--last`/`-c`/`--resume latest` para CLIs externas
14. **Output files multi-ronda**: `/tmp/resultado-[nombre]-r[N].md` (ej: `resultado-codex-1-r2.md`)
15. **Multiples agentes de la misma CLI**: necesitan session IDs explicitos (no `--last`) o contexto completo en prompt
16. **NUNCA buscar API keys para agentes externos** — los CLIs (codex, auggie, gemini, etc.) ya estan autenticados en la maquina. Ejecutarlos directamente. Si fallan por autenticacion, avisar al usuario para que lo resuelva manualmente. No buscar en Secrets Manager, env vars, ni ninguna otra fuente

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
