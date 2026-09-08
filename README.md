# kairos_prototipo

Prototipo del proyecto **Kairos**. Repo privado, proyecto personal.

## Estado

Andamiaje. La especificación del producto está pendiente; todavía no hay stack
elegido ni código de aplicación. Lo que ya funciona es el flujo de desarrollo
con revisión multi-agente, disponible desde el primer commit real.

## Qué hay aquí

| Ruta | Contenido |
|---|---|
| `.claude/commands/` | Los 5 comandos del flujo de revisión con subagentes |
| `docs/estandares/guia-code-review.md` | Reglas de revisión por dominio (heredadas, pendientes de podar) |
| `docs/revisiones/`, `docs/revisiones-pr/` | Reportes que generan los comandos |
| `evaluaciones/` | Evaluaciones de planes y de implementaciones |

## Cómo se trabaja

```bash
git checkout -b feature/lo-que-sea
# ... cambios ...
/revisar-cambio          # revisión antes del PR
gh pr create --base main
/revisar-pr <N>          # si el cambio lo amerita
```

El contrato completo — niveles de profundidad, política de consenso, requisitos y
qué NO aplica en este repo — está en [CLAUDE.md](CLAUDE.md).

## Requisitos

- [`codex`](https://github.com/openai/codex) ≥ 0.146 — los revisores adversariales
- [`gh`](https://cli.github.com/) ≥ 2.86 — PRs y worktrees
