# Plan de trabajo — Prototipo inicial de Kairos

**Autor:** Raúl Ruiz · **Fecha:** 2026-09-08 · **Estado:** pendiente de revisión
**Curso:** ISIS 2007 — Diseño de Productos e Innovación con TI · Grupo 1
**Repo:** `Kairos-PMC/kairos_prototipo`

---

## 1. Qué estamos construyendo, y por qué así

### 1.1 El problema, según lo que ya validamos

El Taller 1 lo formuló como la ausencia de mecanismos integrados para reportar y alertar
sobre fenómenos naturales. El Ejercicio 3 lo corrigió con evidencia de campo: la
entrevista con Santiago Arboleda (floricultura) mostró que **el problema no es falta de
información sino falta de traducción**. Los análisis existen —IDEAM, SGC, UNGRD los
publican gratis— pero son regionales y no aplican a la sede concreta del cliente. El
momento 3 del journey map lo dice literal: *"boletines que no aplican a su sede"*.

De ahí sale la consecuencia estratégica que atraviesa todo este plan:

> **No competimos vendiendo datos.** El IDEAM ya los da gratis y esa objeción aparece en
> la primera reunión. Competimos traduciendo esos datos a una decisión sobre un activo
> específico, con una cifra en pesos.

La entrevista también reveló un fenómeno que no teníamos mapeado —tormentas eléctricas—,
lo que prueba que **el catálogo de amenazas no puede ser fijo**: cada sector tiene su
amenaza crítica propia.

### 1.2 La solución elegida

El Ejercicio 4 priorizó once alternativas y el **priorizador de inversiones preventivas**
encabezó con 13 puntos y la mejor calificación en vendibilidad. La sección 4.1 lo describe
fusionado con el simulador, y es esa fusión —no cada pieza por separado— la que llega al
Pitch No. 2:

> Mapear los edificios y activos críticos, identificar los más expuestos a cada fenómeno,
> **cuantificar cuánto dinero se perdería**, y priorizar en qué invertir primero:
> infraestructura, mover inventario, ampliar seguro.

Métricas del pitch: **número de activos comprometidos** y **valor estimado de pérdida en
pesos**. Esas dos cifras son la salida que el prototipo tiene que producir de forma
creíble. Todo lo demás es andamiaje alrededor de ellas.

### 1.3 El requisito que define la arquitectura

Del Ejercicio 3, sobre cómo decide el cliente:

> *"Un gerente financiero va a preguntar de dónde salió el número antes de aprobar la
> inversión."*

Esto no es un detalle de UX: es un **requisito funcional de primer orden**. Un número sin
su cadena de supuestos no sirve para nada en este producto. Por eso el prototipo:

- usa modelos estadísticos **explicables**, no una caja negra de ML;
- muestra, para cada cifra, de qué supuesto y de qué fuente salió;
- permite al usuario cambiar cualquier supuesto y ver la cifra moverse.

El Ejercicio 4 ya había llegado a la misma conclusión ("conviene empezar con modelos
estadísticos que se puedan explicar"). El plan la toma como restricción dura.

---

## 2. Alcance

### 2.1 Lo que SÍ hace el prototipo

| # | Capacidad | Por qué está adentro |
|---|---|---|
| 1 | Cargar la empresa: sedes georreferenciadas y activos con valor de reposición | Sin inventario no hay cifra en pesos |
| 2 | Configurar el catálogo de amenazas por sede | La entrevista probó que la lista fija es un error de método |
| 3 | Modelar dependencias entre activos (la subestación alimenta el cuarto frío) | Es lo que distingue pérdida física de pérdida operativa |
| 4 | Simular un año de operación por Monte Carlo y estimar la pérdida | Produce las dos métricas del pitch |
| 5 | Ranking de activos por contribución a la pérdida esperada | "Cuáles son los más expuestos" |
| 6 | Catálogo de medidas preventivas con costo y efecto | Insumo del priorizador |
| 7 | Priorizar medidas bajo un presupuesto dado | **Es el corazón del producto** |
| 8 | Comparar el escenario con y sin cada medida | "Cuánto me ahorra esto" |
| 9 | Reporte exportable con todos los supuestos y fuentes visibles | El requisito del gerente financiero |

### 2.2 Lo que NO hace — y por qué

Esta lista es un contrato. Si algo de aquí aparece implementado, es scope creep.

| Fuera de alcance | Razón |
|---|---|
| Sensores IoT propios | El SCAMPER ya decidió eliminarlos del MVP para reducir costo |
| Predicción de sismos | El SCAMPER lo descartó explícitamente: no es predecible |
| Ingesta en vivo de APIs (IDEAM, Copernicus, CHIRPS) | Fase posterior; el prototipo usa datos semilla versionados |
| Machine learning | Contradice el requisito de explicabilidad; los datos de entrenamiento (UNGRD, DesInventar) no están procesados |
| Gemelo digital 3D tipo Virtual Singapore | El propio Ejercicio 4 lo declaró inviable para nuestro tamaño |
| Integración con ERP del cliente | El Ejercicio 4 ya definió cargue por plantilla para el MVP |
| Seguros paramétricos reales, contratos inteligentes | Requiere aseguradora contraparte |
| Backend con base de datos, cuentas de usuario, multi-tenant | Ver §3.3 |
| Continuidad logística (rutas, proveedores alternos) | El Ejercicio 4 la dejó como posible fase 2 |

### 2.3 Higiene de separación — proyecto personal

Requisito explícito: nada que pueda verse raro desde FaroNova.

- **Cuenta de Vercel personal**, creada con la cuenta de GitHub `raul2610`. No SSO
  corporativo, no invitar cuentas de trabajo al proyecto de Vercel.
- **Sin AWS.** Cero credenciales, cero servicios, cero Terraform.
- **Identidad de git ya verificada:** los commits van con `rs.ruiza1@uniandes.edu.co`
  (correo universitario). No hay que cambiar nada.
- **Sin dependencias de FaroNova**: ni paquetes internos, ni dominios, ni assets, ni
  copiar código de sus repos. Lo único heredado es el flujo de revisión, ya portado y
  documentado en [CLAUDE.md](../../../../CLAUDE.md).
- **Sin secretos.** El prototipo no necesita ninguna variable de entorno secreta. Si en
  algún momento hiciera falta una, se detiene y se decide antes de crearla.
- El repo vive en la organización `Kairos-PMC`, separada de `FaroNovaDevs`/`FaroNovaCorp`.

---

## 3. Decisiones técnicas

### 3.1 Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Despliegue en Vercel sin configuración; el ecosistema React da los componentes de mapa y gráficas |
| Estilos | **Tailwind CSS** | Velocidad de prototipado, sin sistema de diseño que mantener |
| Mapa | **MapLibre GL JS** (vía `react-map-gl`) | BSD, sin API key ni cuenta. Tiles base de CARTO/OSM |
| Plano de sitio | **SVG + React**, sin librería | Un plano esquemático arrastrable no justifica una dependencia |
| Gráficas | **Recharts** | Curva de excedencia y waterfall de pérdida con poco código |
| Cálculo | **TypeScript puro en un Web Worker** | Mantiene la UI fluida; el motor queda testeable sin DOM |
| Estado | **Zustand** | Store simple, sin el ceremonial de Redux |
| Persistencia | **localStorage + import/export JSON** | Ver §3.3 |
| Tests | **Vitest** | El motor de cálculo se prueba sin navegador |
| CI | **GitHub Actions** (lint, typecheck, test) | Gratis; el repo privado consume del cupo de 2.000 min/mes, muy por encima de lo que gastaremos |
| Hosting | **Vercel Hobby** | Gratis, admite repos privados, deploy por push, previews por PR |

### 3.2 Por qué Vercel y no otro

Vercel Hobby es gratuito para uso no comercial —un proyecto de curso lo es—, despliega
desde un repo privado, y da un preview por cada PR, lo que encaja exactamente con el flujo
de revisión que ya montamos: se revisa el PR con el preview en vivo al lado.

Alternativas consideradas: **Cloudflare Pages** (equivalente, plan gratis más generoso en
builds, pero menos integrado con Next.js) y **GitHub Pages** (descartado: solo estático,
y aunque el prototipo puede ser 100% cliente, perderíamos los previews por PR).

### 3.3 Por qué no hay base de datos

Es la decisión con más consecuencias del plan, así que va argumentada.

Todo el cómputo ocurre en el navegador. Los datos que el prototipo maneja son: el
inventario de la empresa demo (versionado en el repo como JSON) y lo que el usuario edite
en la sesión (en `localStorage`, con botón de exportar/importar JSON).

A favor: cero cuentas adicionales, cero secretos, cero costo, cero superficie que asegurar,
y el demo funciona aunque falle internet. En contra: no hay colaboración entre usuarios ni
persistencia entre dispositivos.

Para un prototipo cuyo objetivo es **demostrar que la cifra en pesos es creíble**, la
colaboración no aporta nada al argumento y sí añade riesgo. Si más adelante hace falta,
Supabase o Neon tienen capa gratis y se agregan sin rehacer el motor —que no sabe nada de
dónde vienen los datos.

### 3.4 Los datos semilla — y qué prometemos sobre ellos

El prototipo necesita valores de amenaza (probabilidad e intensidad) por ubicación. Las
fuentes reales existen y están citadas en el Ejercicio 4 (SGC, IDEAM, UNGRD, DesInventar),
pero procesarlas es un proyecto en sí mismo.

**Decisión:** el prototipo usa un dataset semilla curado a mano para un puñado de
municipios, con cada valor acompañado de su fuente y su fecha, y **marcado visiblemente en
la UI como valor ilustrativo**.

No vamos a presentar cifras inventadas como si fueran oficiales. Un prototipo que exagera
la precisión de sus datos es exactamente lo que destruye la confianza del gerente
financiero que estamos tratando de convencer. La UI dirá, en el mismo lugar donde muestra
el número, de dónde salió y con qué grado de confianza.

---

## 4. El modelo de dominio

```
Empresa
 └── Sede (lat, lon, municipio, sector)
      ├── PerfilAmenaza[]   (amenaza, frecuencia anual λ, distribución de intensidad)
      ├── Activo[]          (tipo, valor de reposición, curva de vulnerabilidad,
      │                      aporte al margen diario)
      ├── Dependencia[]     (activo A → activo B: B no opera sin A)
      └── Medida[]          (costo, efecto sobre daño / downtime / transferencia)
```

**Amenazas del catálogo inicial:** inundación, deslizamiento, sismo, incendio forestal,
sequía, **tormenta eléctrica** (esta última entra porque la entrevista la reveló, y su
presencia es la evidencia de que el catálogo es configurable).

**Tipos de activo:** bodega, planta de producción, cultivo, subestación eléctrica, cuarto
frío, vía de acceso, maquinaria, inventario.

**Tipos de medida:** reforzar estructura, elevar/reubicar inventario, planta eléctrica de
respaldo, obra de drenaje, ampliar cobertura de seguro, redundancia de vía.

---

## 5. El motor de cálculo

Esta sección es el núcleo técnico. Se implementa y prueba **antes** de escribir una sola
pantalla.

### 5.1 Pérdida de un evento

Para una sede `s`, amenaza `h` e intensidad `I`:

1. **Daño físico.** Cada activo tiene una curva de vulnerabilidad `D(activo, h, I) ∈ [0,1]`
   —fracción del valor de reposición que se pierde. Daño = `valor × D`.
2. **Indisponibilidad.** El daño se traduce en días fuera de servicio del activo.
3. **Propagación por dependencias.** Si la subestación cae, el cuarto frío queda
   indisponible aunque no sufriera daño físico. Se propaga por el grafo de dependencias.
4. **Lucro cesante.** `margen diario del proceso × días de indisponibilidad`.
5. **Pérdida del evento** = daño físico total + lucro cesante.

El punto 3 es lo que separa este prototipo de un tablero de riesgos. One Concern —el
referente del Ejercicio 4— construyó su producto exactamente sobre esa idea: *el indicador
que le importa al cliente es el tiempo de inactividad, no solo el daño físico*.

### 5.2 Simulación anual (Monte Carlo)

`N = 10.000` iteraciones. En cada una, y para cada par (sede, amenaza), se sortea el número
de eventos del año con una Poisson(λ) y, por evento, una intensidad de su distribución.

Salidas:

| Métrica | Qué significa | Dónde aparece en el pitch |
|---|---|---|
| **AAL** (pérdida anual esperada) | Media de la pérdida anual | "valor estimado de pérdida en pesos" |
| **Curva de excedencia** | P(pérdida > x) | Da el rango, no solo el promedio |
| **PML 100 / 250 años** | Percentiles 99% y 99,6% | El escenario malo que justifica invertir |
| **Ranking de activos** | Contribución de cada activo al AAL | "número de activos comprometidos" |

### 5.3 El priorizador

Cada medida `m` tiene costo `C(m)`, y su beneficio es la pérdida evitada:
`B(m) = AAL_base − AAL_con_m`.

**El problema real: los beneficios no se suman.** Dos medidas sobre el mismo activo se
solapan —reforzar la bodega y además asegurarla no evita dos veces la misma pérdida—. Un
knapsack clásico sobre beneficios individuales sobreestima el portafolio, y lo hace en
silencio.

**Solución adoptada — greedy adaptativo con re-simulación:**

```
seleccionadas = {}
mientras quede presupuesto:
    para cada medida candidata m:
        simular(seleccionadas ∪ {m})           # N reducido durante la búsqueda
        ratio(m) = (AAL_actual − AAL_nuevo) / C(m)
    elegir la m de mayor ratio que quepa en el presupuesto restante
    añadirla a seleccionadas
re-simular el portafolio final con N completo
```

Esto captura el solapamiento porque cada ronda mide el beneficio **marginal** sobre lo ya
seleccionado. El knapsack por programación dinámica se implementa también, pero como
**comparación**: mostrar las dos respuestas y su diferencia es en sí mismo un argumento
sobre por qué el problema no es trivial.

**Números aleatorios comunes (CRN).** Comparar dos corridas Monte Carlo independientes
mide ruido, no efecto: con 10.000 iteraciones el error estándar puede ser del orden de la
diferencia que buscamos. Se usa una **semilla fija y el mismo flujo de sorteos** en todas
las corridas de una comparación, de modo que la única diferencia entre "con medida" y "sin
medida" sea la medida. Sin esto, el "cuánto ahorra" no es defendible — y es justo la cifra
que el cliente va a cuestionar.

**Costo computacional.** Búsqueda con `N = 2.000` y re-simulación final con `N = 10.000`.
Con ~15 medidas son ~120 corridas de búsqueda; en un Web Worker es cuestión de segundos.
Si se queda corto, se baja N de búsqueda antes que el N final.

---

## 6. Fases

Cada fase termina en un PR revisado con el flujo del repo. La regla del repo aplica sin
excepción: `/revisar-cambio` antes de abrir el PR.

### Fase 0 — Andamiaje y despliegue en vivo

**Objetivo:** que exista una URL pública funcionando antes de escribir lógica de negocio.

- [ ] `create-next-app` con TypeScript, Tailwind, ESLint
- [ ] Estructura: `src/domain/` (motor), `src/data/` (semillas), `src/app/` (UI), `src/components/`
- [ ] Vitest configurado y corriendo
- [ ] GitHub Actions: lint + typecheck + test en cada PR
- [ ] Cuenta personal de Vercel, proyecto conectado al repo, deploy de `main`
- [ ] Página de inicio con el planteamiento del problema y el estado del prototipo

**Éxito:** `kairos-prototipo.vercel.app` responde, y un PR de prueba genera su preview.

### Fase 1 — Motor de cálculo (sin UI)

**Objetivo:** el corazón del producto, probado, antes de cualquier pantalla.

- [ ] Tipos del dominio (§4)
- [ ] Curvas de vulnerabilidad por (tipo de activo × amenaza), con sus supuestos documentados
- [ ] Propagación de indisponibilidad por el grafo de dependencias (con detección de ciclos)
- [ ] Generador aleatorio **con semilla** (CRN) — no `Math.random()`
- [ ] Motor Monte Carlo: AAL, curva de excedencia, PML, contribución por activo
- [ ] Tests: casos degenerados (sin amenazas → pérdida 0), monotonía (más intensidad → más
      pérdida), reproducibilidad con la misma semilla, propagación en cadena de 3 niveles

**Éxito:** `npm test` verde y una corrida de referencia con resultado estable entre
ejecuciones.

### Fase 2 — Datos semilla y empresa demo

**Objetivo:** un caso concreto y creíble para el pitch.

- [ ] Perfiles de amenaza para 3–5 municipios, cada valor con fuente y fecha
- [ ] Empresa demo del sector floricultor (el validado con Santiago Arboleda): 2 sedes,
      ~12 activos, dependencias reales
- [ ] Catálogo de ~10 medidas con costo y efecto
- [ ] Esquema de validación de los JSON (Zod) para que un dato mal formado falle temprano
- [ ] `docs/datos-semilla.md`: procedencia de cada valor y qué habría que hacer para
      reemplazarlo por la fuente oficial

**Éxito:** el motor corre sobre la empresa demo y produce cifras que resisten una mirada
crítica.

### Fase 3 — Inventario y mapa territorial

- [ ] Mapa MapLibre con las sedes
- [ ] Panel de sede: amenazas configurables, con su λ e intensidad
- [ ] CRUD de activos (tabla editable) con valor de reposición y aporte al margen
- [ ] Importar/exportar el escenario completo como JSON
- [ ] Persistencia en `localStorage` y botón de "volver a la demo"

**Éxito:** se puede añadir una amenaza que no estaba —tormenta eléctrica— y ver el efecto.
Esa demostración *es* el argumento de que el catálogo no es fijo.

### Fase 4 — Plano de sitio y dependencias

- [ ] Editor SVG: arrastrar activos sobre el plano esquemático de la sede
- [ ] Dibujar dependencias como aristas entre activos
- [ ] Vista de "qué cae si cae esto": seleccionar un activo y ver la cascada resaltada

**Éxito:** el usuario ve, sin leer un número, que la subestación arrastra media planta.
Aquí está el "wow" de simular la infraestructura física.

### Fase 5 — Simulación y resultados

- [ ] Web Worker ejecutando el motor con barra de progreso
- [ ] Tarjetas: AAL, PML 100/250, número de activos comprometidos
- [ ] Curva de excedencia (Recharts)
- [ ] Ranking de activos por contribución, con desglose daño físico vs. lucro cesante
- [ ] Cada cifra con su "¿de dónde salió?" desplegable

**Éxito:** las dos métricas del pitch en pantalla, y cada una rastreable hasta su supuesto.

### Fase 6 — Priorizador de inversiones

- [ ] Catálogo de medidas con su efecto modelado
- [ ] Control de presupuesto
- [ ] Greedy adaptativo con re-simulación (§5.3)
- [ ] Knapsack DP como comparación, mostrando la diferencia entre ambos
- [ ] Vista con/sin medida: pérdida evitada, costo, y años para recuperar la inversión
- [ ] Orden de ejecución recomendado

**Éxito:** dado un presupuesto, la plataforma responde **en qué invertir primero y por
qué**. Esta es la fase que justifica el proyecto entero.

### Fase 7 — Reporte y trazabilidad

- [ ] Reporte imprimible: supuestos, fuentes, resultados, portafolio recomendado
- [ ] Panel de supuestos editable con recálculo en vivo
- [ ] Aviso explícito de que el producto informa decisiones pero no las garantiza
      (la objeción de responsabilidad anticipada en el Ejercicio 3, §2.3)

**Éxito:** el reporte se puede llevar a un comité sin que nadie tenga que explicarlo.

### Fase 8 — Pulido de demo

- [ ] Recorrido guiado de 3 minutos alineado con el guion del pitch
- [ ] Responsive y revisión de accesibilidad
- [ ] README con capturas
- [ ] Repaso final de que no quedó nada de FaroNova ni referencias corporativas

---

## 7. Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Las curvas de vulnerabilidad se ven arbitrarias y el pitch pierde credibilidad | **Alta** | Documentar el origen de cada curva y dejarlas editables en la UI; el argumento pasa de "confía en el número" a "cambia el supuesto y mira" |
| Confundir el ruido Monte Carlo con el efecto de una medida | **Alta** si no se implementan CRN | CRN desde la Fase 1, más un test que verifique reproducibilidad con semilla fija |
| Scope creep hacia ML, ingesta en vivo o gemelo 3D | Media | §2.2 es un contrato; `/revisar-implementacion` compara contra este checklist |
| Los tiles del mapa fallan o cambian de política | Media | El plano de sitio (Fase 4) no depende de tiles; el mapa degrada a fondo neutro con marcadores |
| Monte Carlo lento en el navegador | Baja | Web Worker + N reducido en la búsqueda; el perfil de cómputo es modesto |
| El grafo de dependencias tiene ciclos y la propagación no termina | Media | Detección de ciclos con error explícito en Fase 1, no en producción |

---

## 8. Decisiones que necesito confirmar contigo

Arranco con estos supuestos si no dices lo contrario:

1. **Sector del demo: floricultura.** Es el único con validación de campo real (Santiago
   Arboleda), y usar el sector que entrevistaron hace el pitch más sólido.
2. **Idioma: español** en toda la UI.
3. **Nombre del despliegue:** `kairos-prototipo.vercel.app`.
4. **Alcance de la demo:** una empresa con dos sedes. Multi-empresa no aporta al argumento.
5. **Orden de fases:** el priorizador (Fase 6) es lo último importante. Si el tiempo
   aprieta antes del pitch, la que se sacrifica es la **Fase 4 (plano de sitio)**, no la 6
   — el plano es el "wow" visual, pero el priorizador es la tesis del producto.

Si el pitch tiene fecha, dímela: cambia qué fases entran y cuáles quedan como "siguiente
iteración".

---

## 9. Criterio de éxito del prototipo

El prototipo funciona si permite hacer esta demostración de principio a fin:

1. Aquí está mi empresa: dos sedes, doce activos, con su valor.
2. Estas son las amenazas de **esta** sede —incluida una que ningún boletín me menciona.
3. Si cae la subestación, se cae esto, esto y esto.
4. Mi pérdida anual esperada es **X pesos**; en un mal año, **Y**.
5. Con un presupuesto de **Z**, invierto primero en esto, después en esto.
6. Esa decisión evita **W pesos al año**, y este es el supuesto exacto del que sale.

Si los seis pasos se sostienen frente a alguien que pregunta "¿de dónde salió ese número?",
el prototipo cumplió.
