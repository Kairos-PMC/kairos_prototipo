---
description: Revisar implementacion completada contra su plan con equipo headless (Claude + Codex). Llamado por /revisar-cambio cuando detecta un plan.md activo y archivos cambiados que coinciden con su checklist. No invocar directo salvo que ya sepas que es ese caso.
allowed-tools: Bash(codex:*), Bash(which:*), Bash(git:*), Bash(cat:*), Bash(sleep:*), Read, Write, Edit, Glob, Grep, Agent, TaskCreate, TaskUpdate, TaskList, TaskOutput, SendMessage
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
| 2 | Completado | completados/api-publica/plan.md | Endpoints publicos v1 |

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
  run_in_background: true
  name: "claude-revisor-impl"
  prompt: "[brief completo + contenido del plan + lista de archivos a revisar con rutas absolutas]

  Lee el plan y los archivos implementados. Dame tu revision siguiendo el formato del brief.
  Para leer archivos usa el Read tool.
  NO escribas archivos. Devuelve tu resultado como texto."
```

### Codex (Bash background)

```bash
cd [ruta absoluta al repo] && codex exec --full-auto -o /tmp/resultado-codex-revision-impl.md "Lee el plan en [ruta absoluta al plan] y revisa los archivos implementados. [brief sin el plan]. Archivos a revisar: [lista de rutas absolutas]" </dev/null
```

**IMPORTANTE:**
- `cd` obligatorio antes de `codex exec`
- `run_in_background: true` en ambos
- Timeout: 300000 (5 min). Si hay muchos archivos, 600000 (10 min)
- **`</dev/null` al final es OBLIGATORIO en background.** Sin este redirect, `codex exec` detecta el stdin no-TTY del shell background y entra en modo "leer prompt adicional desde stdin hasta EOF", quedando bloqueado en `Reading additional input from stdin...` sin analizar nada. Síntoma: proceso vivo, 0% CPU, output nunca creado. Incidente 2026-04-23 (PR #308): 4 Codex colgados 13 min. En TTY interactivo funciona sin el redirect; el bug solo aparece en background.

---

## Paso 5: Recolectar resultados

Cuando ambos agentes terminen:

1. Leer resultado de Claude (retorno directo)
2. Leer resultado de Codex (`/tmp/resultado-codex-revision-impl.md`)

Consolidar:

```
## Resultados de Revision de Implementacion — Ronda 1

| Agente | Veredicto | Cumplimiento | Criticos | Altos | Medios |
|--------|-----------|-------------|----------|-------|--------|
| Claude | APROBADO | 8/8 subtareas | 0 | 0 | 2 |
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

**Claude:** SendMessage al agent existente o nuevo Agent tool
**Codex:** `cd [repo] && codex exec resume --last --full-auto -o /tmp/resultado-codex-revision-impl-r2.md "[brief actualizado]" </dev/null` (el `</dev/null` aplica también a `codex exec resume`)

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
4. **Codex exec, no codex directo** — SIEMPRE `codex exec --full-auto`
4b. **`</dev/null` obligatorio al final de todo `codex exec` en background** — sin él, Codex se cuelga leyendo stdin indefinidamente (incidente 2026-04-23 PR #308)
5. **Politica de cierre: consenso** — iterar hasta que ambos aprueben
6. **Maximo 5 rondas** — despues, escalar al CTO
7. **NO inventar problemas** — si la implementacion esta bien, aprobar
8. **Rutas absolutas** en todos los prompts
9. **Guardar evaluacion** siempre en evaluaciones/ejecucion/
10. **NO buscar API keys** — Codex ya esta autenticado. Si falla, avisar al usuario
11. **Tests obligatorios** — si hay tests, correrlos despues de aplicar fixes
