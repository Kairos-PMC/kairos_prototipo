# Kairos — prototipo

Proyecto personal de Raúl Ruiz. Repo privado en `Kairos-PMC/kairos_prototipo`.

**Estado: andamiaje.** La especificación del producto todavía no está escrita, así
que aquí no hay stack elegido ni código de aplicación. Lo que sí está montado es el
flujo de desarrollo con subagentes, listo para usarse desde el primer commit real.

---

## Flujo de desarrollo — etapa rápida (vigente)

> 🚧 **Todo va directo a `main`. Sin ramas, sin PRs, sin revisión obligatoria.**
>
> Decisión consciente de esta primera etapa: el costo de coordinación no se paga
> cuando trabaja una sola persona sobre un prototipo desechable, y lo que se
> necesita ahora es velocidad hasta tener algo que se pueda mirar.

```bash
# ... cambios ...
git add -A && git commit -m "..."
git push origin main
```

`/revisar-cambio` sigue disponible y funciona sin PR para cambios chicos
(niveles 0-2 corren inline), pero es **opcional**. Los niveles 3-4 delegan a
`/revisar-pr`, que sí necesita un PR — en esta etapa, o se revisa inline o se
salta.

### Cuando entre el equipo (en varias semanas)

Se retoma el flujo completo, que ya está montado y no hay que reconstruir:

```
crear branch → cambios/commits → /revisar-cambio → PR → CI → merge
```

Prefijos de branch: `feature/`, `fix/`, `docs/`, `refactor/`.
Ante la duda, `/revisar-cambio` decide la profundidad y delega al comando correcto.

---

## Comandos disponibles

| Comando | Para qué | Equipo |
|---|---|---|
| `/revisar-cambio` | Router de entrada. Clasifica profundidad (niveles 0-4) y revisa inline los niveles 0-2 | 0-2 Codex |
| `/revisar-pr <N>` | Un PR antes de mergear. Crea worktree de la branch del PR | 1 Codex por dominio (hasta 8) |
| `/revisar-plan <ruta>` | Un plan de trabajo antes de implementarlo | Claude + Codex, hasta consenso |
| `/revisar-implementacion <ruta>` | Código terminado contra el plan que lo originó | Claude + Codex, hasta consenso |
| `/equipo-headless` | Coordinar un equipo multi-agente arbitrario en background | configurable |

Reglas de revisión por dominio: [`docs/estandares/guia-code-review.md`](docs/estandares/guia-code-review.md).
Es una guía **heredada** — leé su nota de procedencia antes de aplicar una regla al pie de la letra.

### Cómo decide `/revisar-cambio` la profundidad

Scoring determinista (tamaño + dominio + scope, más un regex de secrets). No hay
un LLM decidiendo:

| Nivel | Caso | Acción |
|---|---|---|
| 0 · Trivial | typo, comentario, rename puro | Claude lee el diff, reporte breve |
| 1 · Ligero | <50 LOC, tests/docs/cosmético | 1 Codex, inline |
| 2 · Medio | 50-300 LOC, 1-2 dominios | 2 Codex en paralelo, inline |
| 3 · Estándar | 300-800 LOC, multi-dominio o crítico | delega a `/revisar-pr` |
| 4 · Profundo | >800 LOC, infra crítica | delega a `/revisar-pr` con equipo grande |

**Escalado forzado a nivel ≥ 3**, aunque el cambio sea chico, si toca auth,
secrets, permisos o migraciones, o si el regex detecta un posible secret. En esos
casos aprobar con Enter no basta: pide confirmación explícita.

### Cómo aprueban los revisores

- **Consenso**: se aprueba solo si *todos* los revisores dicen APROBADO. Si uno
  pide cambios, se itera (máximo 5 rondas).
- **Revisores frescos**: los revisores Claude se lanzan con contexto limpio
  (`subagent_type: "general-purpose"`), no como forks de la sesión, para que
  lleguen sin los sesgos de quien escribió el código.
- **Anti-complacencia**: los briefs prohíben "¡Tienes toda la razón!" y la
  gratitud antes de verificar. Si el cambio está bien, se dice APROBADO; no se
  inventan hallazgos para justificar la revisión.
- **Siempre hay reporte**, aunque el cambio esté limpio.

Dónde quedan los reportes: `docs/revisiones/`, `docs/revisiones-pr/`,
`evaluaciones/plan/`, `evaluaciones/ejecucion/`.

### Los dos gates que no se saltan

Ambos existen porque su modo de falla es **silencioso**: una revisión rota se ve
igual que una buena. Los dos vienen del flujo original, con sus cicatrices.

**1. Nunca revisar sin reglas** — `.claude/scripts/resolver-doc.sh`

Las reglas de dominio se resuelven ANTES de lanzar revisores y van **embebidas
verbatim** en el prompt, nunca como una ruta que el revisor deba abrir. Si el
script sale con código ≠ 0, el comando **aborta** en vez de revisar sin reglas.

```bash
./.claude/scripts/resolver-doc.sh docs/estandares/guia-code-review.md --seccion Seguridad
# exit 1 = documento ausente · exit 3 = sección ausente (lista las disponibles)
```

> La cicatriz: en el ecosistema original, hasta el 2026-08-20 los briefs hacían
> `cat ~/.claude/skills/code-review-*/SKILL.md` de unos skills que nunca
> existieron. El `cat` fallaba sin abortar y los revisores corrían sin reglas —
> nadie se enteró hasta que alguien lo revisó a mano.

**2. Cada revisión escribe en su propio directorio** — `.claude/scripts/artefactos-revision.sh`

`sellar` deriva el directorio de artefactos de *(sesión + identidad de la
revisión)*, y `verificar` exige que el reporte sea posterior al sello de la ronda
y mencione su `REVISION-ID`. Si algo no cuadra, falla en vez de entregar el
reporte de otro agente.

> La cicatriz: con rutas fijas en `/tmp`, N agentes revisando a la vez escribían
> y leían el mismo archivo. El 2026-08-25, tres agentes leyeron reportes ajenos
> creyéndolos propios; uno vio un "APROBADO" de un PR que no era el suyo.

> ⚠️ Si orquestas varios agentes, **no les dictes la ruta de salida** (`-o /tmp/...`).
> Un agente que obedece una ruta dictada se salta el helper y el gate completo.

---

## Requisitos

| Herramienta | Verificado | Para qué |
|---|---|---|
| `codex` | 0.146.0 | revisores adversariales |
| `gh` | 2.86.0 | PRs y worktrees |
| `git` | — | todo |

**Gotcha crítico — `codex` en background:** toda invocación `codex exec*` lanzada
con `run_in_background: true` lleva `</dev/null` al final. Sin eso Codex detecta
stdin no-TTY pero abierto, entra en modo "leer prompt desde stdin hasta EOF" y se
cuelga indefinidamente: proceso vivo, 0% CPU, archivo de output que nunca aparece.

```bash
# MAL — se cuelga
codex exec --full-auto -o /tmp/out.md "prompt"
# BIEN
codex exec --full-auto -o /tmp/out.md "prompt" </dev/null
```

---

## Qué NO aplica en este repo

Este flujo se portó desde el ecosistema FaroNova quitándole toda la capa de
coordinación de equipo. **No corras aquí** — y no hacen falta:

- `/registrar-trabajo` y su guard
- `/guardar-historial-equipo`, `/re-exportar-historial` (S3 + PostgreSQL)
- `/crear-tarea`, `/mis-tareas`, `/ver-equipo` y demás comandos del tablero
- Snapshots periódicos de sesión y enforcement de worktrees

Los hooks de FaroNova instalados en `~/.claude/settings.json` se auto-desactivan
aquí: identifican el repo por `git config remote.origin.url` y solo actúan sobre
un roster fijo de repos `FaroNovaDevs/*` y `FaroNovaCorp/*`. Como el remote de
este repo es `Kairos-PMC/kairos_prototipo`, el team guard hace `exit 0` y no
interviene. No hay nada que desactivar a mano.

> Cuidado con una trampa práctica: si en una sesión haces `cd` a un repo FaroNova,
> el directorio de trabajo persiste entre comandos y el guard **sí** se activa
> desde ese momento, bloqueando todo lo que no sea lectura hasta que vuelvas.

---

## Estructura

```
.claude/commands/          los 5 comandos del flujo
.claude/scripts/           resolver-doc.sh y artefactos-revision.sh (los dos gates)
docs/estandares/           guía de code review (heredada, a podar)
docs/revisiones/           reportes de /revisar-cambio
docs/revisiones-pr/        reportes de /revisar-pr
evaluaciones/plan/         reportes de /revisar-plan
evaluaciones/ejecucion/    reportes de /revisar-implementacion
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
