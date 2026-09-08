---
description: Revisar plan de trabajo con equipo headless (Claude + Codex) hasta consenso. Llamado por /revisar-cambio cuando detecta un plan.md activo sin implementación previa. No invocar directo salvo que ya sepas que es ese caso.
allowed-tools: Bash(codex:*), Bash(which:*), Bash(cat:*), Bash(sleep:*), Read, Write, Edit, Glob, Grep, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, SendMessage
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
| 2 | api-publica/plan.md | Endpoints publicos v1 |

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
  run_in_background: true
  name: "claude-revisor"
  prompt: "[contenido del brief + contenido completo del plan]

  Lee el plan y dame tu revision critica siguiendo el formato del brief.
  NO escribas archivos. Devuelve tu resultado como texto."
```

### Codex (Bash background)

```bash
cd [ruta absoluta al repo] && codex exec --full-auto -o /tmp/resultado-codex-revision-plan.md "Lee el archivo [ruta absoluta al plan] y revisa el plan de trabajo criticamente. [contenido del brief sin el plan — Codex lee el archivo directamente]" </dev/null
```

**IMPORTANTE:**
- `cd` obligatorio antes de `codex exec` (Codex ignora rutas del prompt)
- `run_in_background: true` en ambos
- Timeout: 300000 (5 min)
- **`</dev/null` al final es OBLIGATORIO en background.** Sin este redirect, `codex exec` detecta el stdin no-TTY del shell background y entra en modo "leer prompt adicional desde stdin hasta EOF", quedando bloqueado en `Reading additional input from stdin...` sin analizar nada. Síntoma: proceso vivo, 0% CPU, output nunca creado. Incidente 2026-04-23 (PR #308): 4 Codex colgados 13 min. En TTY interactivo funciona sin el redirect; el bug solo aparece en background.

---

## Paso 5: Recolectar resultados

Cuando ambos agentes terminen (notificaciones automaticas):

1. Leer resultado de Claude (retorno directo del Agent tool)
2. Leer resultado de Codex (`/tmp/resultado-codex-revision-plan.md`)

Consolidar en una tabla:

```
## Resultados de Revision — Ronda 1

| Agente | Veredicto | Criticos | Altos | Medios | Bajos |
|--------|-----------|----------|-------|--------|-------|
| Claude | CAMBIOS REQUERIDOS | 1 | 2 | 1 | 0 |
| Codex | CAMBIOS REQUERIDOS | 0 | 3 | 2 | 1 |

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
```bash
cd [repo] && codex exec resume --last --full-auto -o /tmp/resultado-codex-revision-plan-r2.md "[nuevo brief con cambios aplicados]" </dev/null
```

El `</dev/null` aplica también al `codex exec resume` — la regla es idéntica para cualquier invocación de `codex exec` en background.

Si resume falla, relanzar como sesion nueva.

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
4. **Codex exec, no codex directo** — SIEMPRE `codex exec --full-auto`
4b. **`</dev/null` obligatorio al final de todo `codex exec` en background** — sin él, Codex se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308)
5. **Politica de cierre: consenso** — iterar hasta que ambos aprueben
6. **Maximo 5 rondas** — despues, escalar al CTO
7. **NO inventar problemas** — si el plan esta bien, aprobar
8. **Rutas absolutas** en todos los prompts
9. **Guardar evaluacion** siempre, incluso si se aprueba en ronda 1
10. **NO buscar API keys** — Codex ya esta autenticado. Si falla auth, avisar al usuario
