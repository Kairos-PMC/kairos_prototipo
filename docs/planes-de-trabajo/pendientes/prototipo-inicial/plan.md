# Plan — Prototipo demostrativo de Kairos

**Autor:** Raúl Ruiz · **Fecha:** 2026-09-08 · **Estado:** en ejecución
**Curso:** ISIS 2007 — Diseño de Productos e Innovación con TI · Grupo 1
**Repo:** `Kairos-PMC/kairos_prototipo`

---

## 0. Qué es esto y qué NO es

Es un **prototipo demostrativo**: sirve para mostrar *qué puede hacer la plataforma*.
No es un MVP, no es un producto, y no pretende que sus números sean correctos.

Consecuencias directas, que valen para cada decisión de este plan:

- **Los datos pueden ser inventados** — pero se rotulan como tales en la propia pantalla.
  Un dato inventado y marcado es honesto; uno inventado y presentado como oficial, no.
- **No hay autenticación real.** Pantalla de login decorativa, con las credenciales ya
  puestas: cualquiera entra con un clic.
- **La matemática es simple y explicable**, no rigurosa. Nada de calibrar curvas ni de
  reducir varianza. Eso es del proyecto grande.
- **Sin desarrollo duro.** Si algo empieza a costar horas de ingeniería, se simplifica o
  se falsea de forma visible. La meta es la demostración, no la corrección.

Lo que sí es innegociable: que se pueda **entrar por una URL pública** y recorrer el
producto de principio a fin.

---

## 1. El producto que se demuestra

Dos mitades que se alimentan:

**A. Centro de datos públicos.** Un solo lugar que reúne información dispersa sobre
amenazas naturales en Colombia. Es la respuesta al hallazgo del Ejercicio 3: la
información existe, está fragmentada y no habla de la sede del cliente.

**B. Simulador digital de riesgos.** La empresa arma una réplica de su infraestructura
—sedes, activos, dependencias—, la expone a fenómenos, y ve cuánto dinero perdería y en
qué le conviene invertir primero.

El puente entre las dos es lo que hace único al producto: **el mismo dato público que hoy
no le sirve a nadie, aterrizado sobre un activo concreto y convertido en pesos.**

---

## 2. Fuentes de datos

### 2.1 En vivo (funcionan desde el navegador, sin llave ni cuenta)

| Fuente | Qué trae | Nota |
|---|---|---|
| **USGS Earthquake API** | Sismos recientes, filtrables por región | Cubre Colombia; JSON con CORS abierto |
| **Open-Meteo** | Clima y pronóstico por coordenada, alertas de lluvia/viento | Gratis para uso no comercial, sin API key |
| **datos.gov.co** (API Socrata) | Datasets públicos del Estado colombiano | Sin llave para volúmenes bajos |

### 2.2 Referenciadas pero no consultadas en vivo

IDEAM (boletines, BADT de deslizamientos), SGC (Red Sismológica Nacional), UNGRD
(inventario de SAT), DesInventar. No exponen API con CORS, así que en el prototipo
aparecen como **fichas con datos representativos**, cada una con enlace a su fuente real y
rótulo visible de que el valor es ilustrativo.

Traerlas de verdad requiere capa de servidor o un cron que las descargue. Vercel da
funciones serverless, así que es posible más adelante — pero no hoy, y no hace falta para
demostrar el concepto.

### 2.3 La regla de honestidad

Cada cifra en pantalla lleva su procedencia visible con uno de tres rótulos:

- **En vivo** — viene de una API pública ahora mismo
- **Referencia** — valor real tomado de una fuente citada, no consultado en vivo
- **Ilustrativo** — inventado para la demostración

Sin excepciones. Es lo que separa una demo de un engaño, y además responde de antemano a
la pregunta del gerente financiero que documentamos en el Ejercicio 3.

---

## 3. Pantallas

| # | Pantalla | Qué demuestra |
|---|---|---|
| 1 | **Login** (decorativo, credenciales precargadas) | Que el producto tiene puerta de entrada |
| 2 | **Centro de datos** | Sismos en vivo, clima por sede, fichas de IDEAM/SGC/UNGRD |
| 3 | **Mis sedes** — mapa con las sedes y su exposición | Ubicación + amenazas configurables por sede |
| 4 | **Inventario de activos** | Bodegas, cultivos, subestaciones, con su valor |
| 5 | **Plano de sitio** — activos y dependencias | Que si cae la subestación se cae media planta |
| 6 | **Simulación** | Pérdida esperada en pesos y activos comprometidos |
| 7 | **Priorizador de inversiones** | En qué invertir primero dado un presupuesto |
| 8 | **Reporte** | Todo junto, con supuestos a la vista |

La pantalla 5 es el "wow" visual y la 7 es la tesis del producto. Si algo se recorta, se
recorta de las demás.

---

## 4. Cómo se calcula (versión prototipo)

Deliberadamente simple. Cada activo tiene un valor y una vulnerabilidad por amenaza; cada
sede tiene una probabilidad anual por amenaza.

```
pérdida esperada del activo = valor × vulnerabilidad(amenaza) × probabilidad anual
pérdida por caída en cadena = suma de los activos que dependen del que falló
pérdida total          = daño físico + lucro cesante por días fuera de servicio
```

El **priorizador** ordena las medidas por `pérdida evitada ÷ costo` y va llenando el
presupuesto de mayor a menor, recalculando después de cada elección para que dos medidas
sobre el mismo activo no cuenten dos veces el mismo ahorro.

> Nota técnica para el proyecto grande: esto ignora la incertidumbre (una distribución de
> pérdida en vez de un promedio) y la comparación entre escenarios se hace sobre valores
> esperados, no sobre simulaciones. Está bien para demostrar el concepto; no lo estaría
> para vender una decisión de inversión real. Queda anotado, no resuelto.

---

## 5. Stack y despliegue

| Capa | Elección |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Mapa | MapLibre GL JS (sin API key) |
| Gráficas | Recharts |
| Estado | React + localStorage |
| Hosting | **Vercel Hobby**, cuenta personal de Raúl |

**Sin base de datos, sin backend propio, sin secretos, sin AWS.** El escenario de la
empresa demo vive como JSON en el repo; lo que el usuario edite queda en `localStorage`.

### Higiene de separación

Cuenta de Vercel personal con la cuenta de GitHub `raul2610`, nunca SSO corporativo. Cero
AWS, cero dependencias o assets de FaroNova, cero secretos. Los commits ya salen con
`rs.ruiza1@uniandes.edu.co`. El repo vive en `Kairos-PMC`, aparte de las organizaciones de
trabajo.

---

## 6. Proceso de trabajo — etapa rápida

**Todo va directo a `main`. Sin PRs, sin ramas, sin revisión obligatoria.**

Es una decisión consciente para esta primera etapa: el costo de coordinación no se paga
cuando trabaja una sola persona sobre un prototipo desechable. Cuando entre el resto del
grupo y empiece el desarrollo serio —en varias semanas—, se retoma el flujo completo de
ramas, PRs y revisión, que ya está montado y documentado en
[CLAUDE.md](../../../../CLAUDE.md).

`/revisar-cambio` sigue disponible y funciona sin PR para cambios chicos, pero es
opcional en esta etapa.

---

## 7. Orden de trabajo

- [ ] **1. Andamiaje** — Next.js, Tailwind, estructura, primer commit a `main`
- [ ] **2. Despliegue** — Vercel conectado al repo, URL pública viva
- [ ] **3. Datos de la demo** — empresa floricultora: 2 sedes, ~12 activos, dependencias, medidas
- [ ] **4. Login decorativo + estructura de navegación**
- [ ] **5. Centro de datos** — sismos USGS y clima Open-Meteo en vivo; fichas IDEAM/SGC/UNGRD
- [ ] **6. Sedes y mapa** — MapLibre, amenazas por sede
- [ ] **7. Inventario de activos**
- [ ] **8. Plano de sitio** — SVG con activos y dependencias, cascada de caída
- [ ] **9. Simulación** — pérdida en pesos, activos comprometidos, gráficas
- [ ] **10. Priorizador** — presupuesto, ranking de medidas, con/sin
- [ ] **11. Reporte y pulido**

Sin fechas: los tiempos los maneja Raúl.

---

## 8. Criterio de éxito

Que se pueda mandar la URL a cualquiera y que esa persona, sola, recorra esto:

1. Entra con un clic.
2. Ve sismos reales de los últimos días y el clima de las sedes.
3. Ve las dos sedes de la empresa en el mapa, con sus amenazas.
4. Abre el plano de una planta y descubre que la subestación arrastra el cuarto frío.
5. Corre la simulación: **X pesos** de pérdida esperada, **N** activos comprometidos.
6. Pone un presupuesto y la plataforma le dice en qué invertir primero y cuánto ahorra.

Y que en todo el recorrido sepa siempre qué dato es real y cuál es ilustrativo.
