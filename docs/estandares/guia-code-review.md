---
title: Guía de Code Review
repo: kairos_prototipo
seccion: estandares
estado: semilla — heredada, pendiente de podar
actualizado: 2026-09-08
---

# Guía de Code Review — Kairos

Estándares y reglas para las revisiones multi-agente de este repo. Es la fuente
de verdad que leen `/revisar-cambio` y `/revisar-pr` antes de revisar código.

> **Procedencia — léelo antes de aplicar una regla al pie de la letra.**
>
> Esta guía se heredó del ecosistema donde nació el flujo (stack Python/Lambda +
> Terraform + Next.js/Cognito). Las reglas de abajo salieron de incidentes reales
> **de ese otro código**, no de Kairos. Sirven como catálogo de *clases de falla*
> — IDOR, PII en responses, permisos wildcard, migraciones que se pisan — no como
> checklist literal de un repo que todavía no tiene ni stack definido.
>
> **Cómo usarla mientras el prototipo toma forma:**
> - Una regla cuyo contexto no existe aquí (no hay Terraform, no hay Cognito) se
>   ignora sin culpa; no la fuerces sobre el código.
> - Una regla cuya *clase de falla* sí aplica se reescribe en términos de Kairos.
> - Cada revisión que encuentre un hallazgo nuevo agrega su fila con fecha y origen.
> - Cuando el stack esté definido, podá lo que sobre. Una guía con reglas muertas
>   entrena a los revisores a ignorarla entera.
>
> **Las secciones de "Dominios de revisión" SON las reglas por dominio.** Cada
> revisor recibe la suya en su brief. No renombres los cuatro encabezados
> (`Seguridad`, `Performance`, `Arquitectura`, `Calidad`) sin actualizar los
> comandos que los referencian.

---

## Dominios de revisión

### Seguridad

| Regla | Descripción | Origen |
|-------|-------------|--------|
| AdminUser en endpoints destructivos | PUT, DELETE y listados de datos sensibles deben usar `AdminUser`, no `CurrentUser` | Revisión 2026-03-07: IDOR en empresas.py |
| Ownership checks en lectura | GET de recursos propios debe verificar que `cognito_sub` coincida con el usuario autenticado | Revisión 2026-03-07: IDOR en perfiles |
| No exponer PII en responses | Emails, cognito_sub y datos personales no deben aparecer en response keys ni logs | Revisión 2026-03-07: email leak en backfill-all |
| Email allowlist simétrica | Si un Lambda admin tiene allowlist, TODOS los Lambdas admin deben tenerla | Revisión 2026-03-07: proxy.ts sin allowlist |
| Env vars wired en Terraform | Si el código lee una env var, verificar que `lambdas.tf` la inyecte al Lambda | Revisión 2026-03-07: ADMIN_ALLOWED_EMAILS no wired |
| No wildcards en IAM | Policies IAM deben usar ARNs explícitos, nunca fallbacks a `*` | Revisión 2026-03-07: wildcard en iam.tf |
| Variables Terraform obligatorias | Variables de seguridad (ARNs, secrets) no deben tener `default = ""` | Revisión 2026-03-07: legal_monitor_api_execution_arn |


#### Reglas con cicatriz — Seguridad

Cada una salió de algo que pasó en estos repos. Una regla sin su cicatriz se ignora.

**`prompt_scope` obligatorio en todo call LLM que vea datos del cliente.**
Si el prompt ve perfil de empresa, preocupaciones declaradas, conversaciones del agente,
descripción interna, contexto regulatorio sugerido, `rule_matches` derivados o input de
onboarding, hay que pasar `prompt_scope="customer_context"` a `ai_service.invoke_model()` /
`invoke()` / `analyze_document()` / `analyze_document_from_s3()`. Fuerza Bedrock-only sin
importar `AI_PRIMARY`.
*Cicatriz:* firmado por el CTO 2026-05-07; el mecanismo se hizo obligatorio en PR #556
(TSK-rxuf) justamente porque **no se puede confiar en heredar `AI_PRIMARY=bedrock` del
Lambda** — la mayoría usa `gemini` para abaratar enrichment público. El enforcement tiene
que ser por función, no por entorno.
*Cómo verificar:* el kwarg es keyword-only y sin default, así que omitirlo es `TypeError` en
runtime y error de pyright. El linter `scripts/lint_prompt_scope.py` (CI job `prompt-scope`)
bloquea regresiones. Si un PR agrega un caller nuevo, confirmá que el linter lo ve.

**`BedrockDisabledError` es un bug de routing, no una falla transitoria.**
Los runtimes que solo procesan documentos públicos (scrapers Lambda, backfills, ECS Fargate)
tienen `Deny bedrock:*` en IAM y `BEDROCK_DISABLED=true`. Si una llamada con
`prompt_scope="customer_context"` cae ahí, revienta a propósito.
*Cicatriz:* defense-in-depth agregado el 2026-05-16 (`docs/security/bedrock-zdr.md`).
*Qué NO hacer en review:* aceptar un retry, un `except` que lo trague, o un fallback a otro
proveedor. El arreglo correcto es mover la llamada al runtime que corresponde.

**Un fail-closed de seguridad apaga funcionalidad — revisá qué lo re-arma.**
El brazo ZDR del juez solo acepta transportes en `APPROVED_ZDR_TRANSPORTS`. Hoy es solo
`bedrock`; `vertex_zdr` **no** está aprobado, así que `_judge_invoke_zdr` fail-closea en vez
de caer a Vertex estándar.
*Cicatriz:* entre el 2026-08-03 y el 2026-08-12 se emitieron **868 eventos**
`judge_backend_misconfig` y la DLQ pasó de 0 a 90 mensajes. Poner `empresas.convenio_zdr` o
`perfiles_usuario.convenio_zdr` en `TRUE`, o una empresa en `usar_catalogo_v2 = FALSE`, apaga
hoy el veredicto LLM de quien lo reciba.
*En review:* si un PR toca esas banderas o agrega un transporte, preguntá explícitamente a
quién deja sin veredicto.

**Una query vacía no prueba que no hay datos — puede ser que no tengas permiso de verlos.**
La Lambda `legal-monitor-sql-query` no tiene grants sobre las tablas con PII
(`empresas`, `perfiles_usuario`, tablas de auditoría).
*Cicatriz:* se sacaron conclusiones de "no hay filas" que en realidad eran "no hay grants".
*Cómo verificar:* para esas tablas, SSM relay con MFA admin. Y en general: antes de afirmar
"cero", confirmá que el camino de lectura podía ver un valor distinto de cero.

**Dos listas de dominios, no una.** El onboarding valida contra la allowlist de Cognito
**y** contra `dominios_email`. Agregar solo una da 403 en el login.
*Cicatriz:* onboarding de Sura/Protección.

**Dependabot mira `uv.lock`; producción corre `layer-constraints.txt`.**
Un PR verde de Dependabot no dice nada sobre lo que está desplegado.
*Cicatriz:* drift medido de 44 de 79 paquetes entre el lock y el layer real.
*En review:* si el PR es de dependencias y toca seguridad, pedí la evidencia del constraint
que de verdad viaja al Lambda.

**Desactivar una cuenta de Google dispara la purga.** Los datos se borran a los 30-60 días.
Suspender ≠ archivar.

### Performance

| Regla | Descripción | Origen |
|-------|-------------|--------|
| No N+1 queries | Si hay un loop que hace queries, prefetch con batch antes del loop | Revisión 2026-03-07: doc_to_document_data N+1 |
| Índices para queries reales | Verificar que existan índices compuestos para los WHERE + ORDER BY del código | Revisión 2026-03-07: faltaban índices en sync_logs y alertas_usuario |
| CREATE INDEX CONCURRENTLY | Migraciones con índices en tablas calientes deben usar CONCURRENTLY (sin IF NOT EXISTS) | Revisión 2026-03-07: m079 bloqueaba writes |
| No full table scans | Buscar `db.query(Model).all()` seguido de filtro en Python — reemplazar por query SQL | Revisión 2026-03-07: detectar_empresa full scan |
| Singleton para clientes externos | boto3, Anthropic y otros clientes deben reutilizarse (singleton), no crearse por request | Revisión 2026-03-07: sugerir_empresa creaba cliente por request |
| logger.warning en except | Errores capturados deben loguearse con `warning` o `error`, nunca `debug` | Revisión 2026-03-07: pipeline_status silenciaba errores |


#### Reglas con cicatriz — Performance

**Un índice cubridor se rompe "optimizando".** No le agregues un filtro por empresa a
`useEntityRamaMap`: el `GROUP BY` se resuelve hoy con un índice cubridor, y scopearlo lo
convierte en un scan.
*Regla general:* antes de "optimizar" una query, mirá el plan. Una condición extra puede
sacar al planner del índice.

**Una matview sin `ANALYZE` miente.** `novedades_mv` sin estadísticas hace que el planner
sobreestime ~1500×, y elige el plan equivocado.
*En review:* toda migración que crea o refresca una matview grande debe correr `ANALYZE`.

**Los límites de transporte acotan el tamaño del lote, no solo el tiempo.**
`batch_enrich` arma su lote con `sql-query`, que tiene un tope de respuesta de 6 MB: con más
de ~1.000 documentos el submit revienta. Hay que trocear por `--ids`; `--chunk-size` no sirve
para esto porque no cambia el tamaño de la respuesta que ya volvió.

**El costo de CI se optimiza al revés que la velocidad.** GitHub factura **cada job
redondeado hacia arriba al minuto entero** y cada job corre en su propia VM. Consolidar
checks afines en un job con steps nombrados es más barato que paralelizar jobs cortos.
*Cicatriz:* el consumo de Actions de la organización bajó **-61 %** atacando esto.
*Corolario para PRs:* el costo es por PR, no por tamaño del cambio — agrupar cambios que no
urgen es la palanca que más ahorra.

**`timeout-minutes` en todo job; nunca el default de 6 h.** Un step de red colgado factura
hasta 360 minutos.
*Excepción que importa:* **no** le pongas timeout a `terraform apply` — cancelarlo a mitad
corrompe el state.

**El cuello de botella no siempre es el que parece.** En el RDS `t3.medium`, el límite real
para ~18 usuarios resultó ser el cold start, no las conexiones. En la flota de scrapers, el
costo es por request/corrida, no por frecuencia.
*En review:* si un PR justifica un cambio de capacidad, pedí la medición del recurso que
dice estar saturando.

### Arquitectura

| Regla | Descripción | Origen |
|-------|-------------|--------|
| Lógica de negocio en core/ | Routers son thin controllers — la lógica va en `src/core/` | Revisión 2026-03-07: backfill y sugerir_empresa en routers |
| Regla de 300 líneas | Archivos > 300 líneas deben dividirse | Estándar del proyecto |
| Migraciones via Lambda custom | NUNCA Alembic. Sistema custom en `src/lambdas/migrations/` | Estándar del proyecto |
| Migraciones idempotentes | Usar `index_exists()`, `column_exists()`, `table_exists()` antes de DDL | Estándar del proyecto |
| Coherencia entre migraciones | Verificar que migraciones nuevas no reviertan, contradigan o sobrescriban cambios de migraciones anteriores (ej: no dropear columna recién creada, no cambiar defaults/tipos/constraints que otra migración estableció). Revisar orden de ejecución cuando hay trabajo paralelo de múltiples desarrolladores | Estándar del proyecto |
| Version string < 128 chars | `alembic_version.version_num` es VARCHAR(128). Nombres de migración deben caber | Revisión 2026-03-07: m078 excedía VARCHAR(32) |
| Normalizar datos en escritura | Si una query depende de formato (lowercase, trim), normalizar en todos los write paths | Revisión 2026-03-07: dominios_email case-sensitive |
| API pública para servicios | Consumidores externos deben usar métodos públicos, no `_privados` | Revisión 2026-03-07: _invoke_model en empresa_service |
| DRY en Lambdas BFF | Lógica compartida (auth, allowlist) va en `utils/`, no duplicada por Lambda | Revisión 2026-03-07: allowlist duplicada en proxy y list-users |


#### Reglas con cicatriz — Arquitectura

**Las migraciones corren DESPUÉS de `terraform apply`.** El pipeline despliega el código
nuevo y recién después migra la base. Por eso toda migración debe ser backward-compatible con
el código que **ya está corriendo** (columnas nullable o con default).

**Una columna nueva del ORM se lee en un deploy posterior, no en el mismo.**
El ORM proyecta *todas* las columnas del modelo, así que agregar la columna al modelo y leerla
en el mismo deploy rompe durante la ventana entre `apply` y `migrate`.
*Regla:* modelo + migración en un PR; la lectura, en el siguiente.

**`inserted_via` no se hereda solo.** El event listener de `src/db/models.py` cubre
`session.add`/`session.merge`. Los patrones que bypassan `before_insert` —
`pg_insert(...).values(...)`, `bulk_save_objects`, `bulk_insert_mappings`, raw SQL
`INSERT INTO` — requieren `inserted_via=current_inserted_via()` explícito.
*Cómo verificar:* `scripts/lint_scraper_inserted_via.py` lo enforce en CI. Si el PR agrega
uno de esos patrones, el linter tiene que verlo.

**`Entidad` ≠ `EntidadReguladora`.** `Entidad` (tabla `entidades`) es la **fuente de
scrapeo**; `EntidadReguladora` es el **emisor real**. No son sinónimos y no se renombran.

**Solo taxonomía v2.** `rama` + `sub_clasificacion` + `nivel_territorial`. El campo
`clasificacion` legacy fue eliminado en la migración `m209` (2026-05-10): no existe en la BD
ni en los schemas, no se lee ni se escribe.
*Trampa de la v1.1:* concejos municipales y asambleas departamentales van con
`sub_clasificacion = "corporaciones_administrativas_territoriales"`, **no** con
`rama_ejecutiva + null + municipal` (eso es para alcaldías y gobernaciones).

**Metadata solo desde APIs estructuradas o IA — nunca parseando HTML** (ADR-020).

**El orden de `--platform` elige la rueda que baja.** Invertirlo produjo 143 Lambdas con
diff cero: se rearmó el layer con ruedas distintas sin que cambiara nada observable.
*En review:* un cambio en el build del layer necesita evidencia de qué ruedas quedaron, no
solo "el build pasó".

**Prefijo `legal-monitor-` obligatorio.** La cuenta AWS es compartida con
`planeacion_por_escenarios`. Y ningún cambio a AWS va por CLI o consola: todo por Terraform.

### Calidad

| Regla | Descripción | Origen |
|-------|-------------|--------|
| ruff check + format | Todo código Python debe pasar `ruff check` y `ruff format` | Estándar del proyecto |
| npm run lint + typecheck | Todo código TypeScript debe pasar lint y typecheck | Estándar del proyecto |
| Tests deben pasar | 0 fallos en `pytest` y test suites de frontend | Estándar del proyecto |
| Imports limpios | No imports no usados, orden correcto (ruff I001) | Estándar del proyecto |
| No regressions | Verificar que los fixes no rompan imports, funciones existentes | Revisión 2026-03-07: verificación post-fix |


#### Reglas con cicatriz — Calidad

Casi todas son la misma familia: **algo se vio verde porque nadie miró si podía ponerse rojo.**

**Ante un gate en verde, preguntá qué observación lo haría fallar.** Si no hay respuesta
concreta, el verde no vale. El 18 de agosto de 2026 se encontraron **tres** gates que pasaban
por ausencia de evidencia, no por evidencia de ausencia.

**Un check que corre en 2 segundos no corrió.** Los workflows docs-only emiten los required
checks como *stubs* del gemelo passthrough. `test / test` en verde a los 2 s es el stub, no la
suite.
*Cómo verificar:* mirá la duración y el run del que salió, no solo el color.

**Anclá los `grep`.** `grep "< 500"` matchea `< 5000`.
*Cicatriz:* así pasó un revert sin que el gate lo viera. Usá `\b`, `^`/`$`, o `-x`.

**El exit code de un pipeline es el del ÚLTIMO comando.**
`cat X 2>/dev/null | head -200 || echo AVISO` **nunca** dispara el `echo`: `head` sale 0
aunque `cat` falle. Para detectar el fallo hay que probar la condición aparte (`[ -f X ]`) o
usar `set -o pipefail`.
*Cicatriz:* apareció escribiendo el propio fix de TSK-20260818T222004-ekwa.

**Verificá contra `origin/main`, no contra tu árbol local — y hacé `fetch` antes.**
Un lockstep verificado local da falso verde si el remoto está stale. Con una rama atrasada,
`git diff origin/main` miente: usá `merge-base`.

**Las unidades se asumen mal y nadie lo nota.** Tres casos reales:
`@memorySize` de CloudWatch Insights viene en **bytes** (tratarlo como MB infla el cómputo
10⁶×); `byte_start` es un offset en **bytes** (rebanar el `str` por caracteres invierte la
lectura); los timestamps de CloudWatch metrics vienen en **hora local** (corren el día).
*En review:* si un número viaja entre sistemas, pedí la unidad explícita.

**`NULL` ≠ `0` ≠ "no medido".** `audit_deletions.rows_deleted` en `NULL` significa *no
medido* y en `0` significa *cero real* — contar NULLs como ceros cambia la conclusión.
`ai_error IS NULL` no significa "sin rutear": el desenlace vive en `system_errors`.

**Predicados NULL-safe.** Usá `IS DISTINCT FROM`. Un `NOT (columna = valor)` sobre `NULL` da
cero filas y parece un resultado legítimo.
*Cicatriz:* el sello `suppress_alerts`.

**Antes de un backfill, verificá que exista un consumidor.** Varios campos son write-only:
nadie los lee. `subtipo_ia` costó ~US$280 en enriquecer un campo que no se consumía;
`es_duplicado_de` y `area_derecho` tampoco tienen lector (`area_derecho` ni siquiera está en
`novedades_mv`).
*La pregunta de review:* ¿qué query, endpoint o pantalla lee esto?

**Una ruta local que puede no existir tiene que fallar ruidosamente.**
Cargar reglas, rúbricas o plantillas desde `~/...` o desde una ruta relativa al repo, sin
verificar, degrada el comportamiento en silencio.
*Cicatriz:* TSK-20260818T222004-ekwa — cuatro revisores corrieron sin reglas de dominio
porque `cat ~/.claude/skills/code-review-*/SKILL.md` fallaba sin abortar, y los skills nunca
habían existido. Resolvé por `gh api` con respaldo local y abortá si ninguno resuelve.

---

## Checklist post-revisión

Después de que los agentes aprueban, verificar manualmente. Esta lista se define
cuando el stack de Kairos esté elegido — hoy es el mínimo agnóstico:

- [ ] El linter del proyecto pasa
- [ ] El formateador no reporta diferencias
- [ ] La suite de tests pasa
- [ ] El CI del PR está verde
- [ ] Los cambios corren en limpio desde un clone nuevo

> Al definir stack, reemplazá esta lista por los comandos reales (`ruff`, `pytest`,
> `npm run lint`, `npm run typecheck`, migraciones, health check post-deploy…).

---

## Cómo se actualiza esta guía

Cada revisión que encuentre un hallazgo nuevo agrega una fila a la tabla del dominio correspondiente, con la fecha y el origen. Así la guía crece con la experiencia real del equipo.

---

*Heredada el 2026-09-08. Última actualización: 2026-09-08*
