# Parámetros del modelo de negocio

Las cifras que fijó el Ejercicio 6. Están aquí en texto porque los incisos d a l
las necesitan; la versión que se entrega es el Word del directorio, que las
muestra en su contexto.

## Parámetros consolidados

TRM de referencia **COP $3.160 / USD** (banda $3.156–$3.175, tercera semana de
octubre de 2026). Precios sin IVA, pago anual anticipado.

### Suscripción anual por sede

| Tipo | Cómo se modela | S | M | L |
|---|---|---|---|---|
| **Punto** — bodega, oficina, planta pequeña | una coordenada | $2.400 (≤10 activos) | $3.600 (11–25) | $5.400 (26–50) |
| **Complejo** — planta, poscosecha, puerto, mina | un grafo de dependencias | $6.000 (≤25 activos) | $9.600 (26–60) | $15.600 (61–120) |
| **Campo** — cultivo, potrero, invernadero, corredor | un polígono con series climáticas | $3.600 (≤50 ha) | $7.200 (51–300) | $13.200 (301–1.500) |

Campo XL (>1.500 ha): $13.200 + $4/ha adicional.
**Plataforma base (cuenta): $2.400/año**, obligatoria, no varía con el número de sedes.

**Decremento por volumen:** sedes 1–3 al 100% · 4–10 al 75% · 11–25 al 55% · 26+ al 40%.

### Pagos únicos y costo de servir

| Concepto | Punto | Complejo | Campo |
|---|---|---|---|
| Implementación (precio) | $1.800 | $4.800 | $3.600 |
| Implementación (costo) | $780 | $2.100 | $1.560 |
| Reporte de Priorización (precio) | $1.200 | $3.000 | $2.400 |
| **Costo variable recurrente / año** | **$120** | **$312** | **$276** |

Comisión de ventas 8% del ACV del año 1 · recaudo 0,8% del ingreso.

### Costos fijos por tramo

| Tramo | Clientes | Equipo | USD/año | COP/año |
|---|---|---|---|---|
| 1 | 0–15 | 6 | $299.439 | $946.227.240 |
| 2 | 16–35 | 9 | ~$452.000 | ~$1.428.320.000 |
| 3 | 36–60 | 12 | ~$617.000 | ~$1.949.720.000 |

### Perfiles de cliente y mezclas

| Perfil | Cartera | USD/año |
|---|---|---|
| A · Operador puntual | base + 2 Punto S | $7.200 |
| B · Agroindustrial (caso demo) | base + 1 Campo S + 1 Complejo S | $12.000 |
| C · Multisitio industrial | base + 1 Complejo M + 4 Punto M | $24.600 |
| D · Agroindustrial extenso | base + 3 Campo L + 2 Complejo S | $51.000 |
| E · Minero-energético | base + 8 Complejo M + 12 Punto M + 20 Campo S | $123.900 |

| | Mezcla A | Mezcla B |
|---|---|---|
| Composición | 30% A · 45% B · 25% C | 20% A · 35% B · 25% C · 15% D · 5% E |
| **ARPA** | **$13.710** | **$25.635** |
| Costo variable / cliente | $645 | $1.347 |
| **Contribución bruta** | **$13.065** (95,3%) | **$24.288** (94,7%) |

### El resultado

| | Equilibrio | Utilidad 30% |
|---|---|---|
| Mezcla A, tramo 2 | 35 ✔ | 51 ✘ |
| Mezcla A, tramo 3 | 48 ✔ | 69 ✘ |
| Mezcla B, tramo 2 | 19 ✔ | **28 ✔ → 31,8%** |

**Con mezcla PyME el 30% es inalcanzable en tres años; con cuentas enterprise se
alcanza con 28 clientes y un equipo de 9.** El 30% no sale del precio: sale de
la mezcla de tipos de sede.
