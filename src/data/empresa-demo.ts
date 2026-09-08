/**
 * Empresa de demostración.
 *
 * Sector floricultor: es el único donde el grupo hizo validación de campo real
 * (entrevista con Santiago Arboleda, Ejercicio 3 §3.7). De ahí salieron dos cosas
 * que quedaron en este escenario: que los boletines regionales no le sirven para
 * decidir sobre una sede concreta, y que la tormenta eléctrica —que no estaba en
 * nuestro catálogo original— es una de sus amenazas críticas.
 *
 * TODAS LAS CIFRAS SON ILUSTRATIVAS. Los órdenes de magnitud buscan ser
 * plausibles para una empresa floricultora exportadora mediana, pero ninguna
 * proviene de estados financieros reales. La interfaz las rotula como tales.
 */

import type { Amenaza, Escenario } from "@/domain/tipos";

export const amenazas: Amenaza[] = [
  {
    id: "inundacion",
    nombre: "Inundación",
    simbolo: "🌊",
    descripcion:
      "Desbordamiento de cauces y encharcamiento por lluvias intensas. En la Sabana de Bogotá el río Bogotá y sus afluentes son el detonante recurrente.",
  },
  {
    id: "granizada",
    nombre: "Granizada",
    simbolo: "🧊",
    descripcion:
      "Precipitación de hielo que perfora cubiertas plásticas de invernadero y destruye el producto en pie. Es la amenaza más costosa para cultivo bajo cubierta.",
  },
  {
    id: "tormenta-electrica",
    nombre: "Tormenta eléctrica",
    simbolo: "⚡",
    descripcion:
      "Descargas y sobretensiones que dañan subestaciones, compresores y equipos de control. Apareció en la entrevista de validación; no estaba en el catálogo inicial.",
  },
  {
    id: "sismo",
    nombre: "Sismo",
    simbolo: "🫨",
    descripcion:
      "Movimiento telúrico. No es predecible, así que la plataforma no lo pronostica: modela su efecto y el costo de no estar preparado.",
  },
  {
    id: "sequia",
    nombre: "Sequía",
    simbolo: "🌵",
    descripcion:
      "Déficit hídrico prolongado, típicamente asociado a El Niño. Afecta reservorios y la disponibilidad de riego.",
  },
  {
    id: "deslizamiento",
    nombre: "Deslizamiento",
    simbolo: "⛰️",
    descripcion:
      "Movimiento en masa que compromete vías de acceso y estructuras en ladera. El IDEAM publica alertas diarias por municipio.",
  },
  {
    id: "incendio-forestal",
    nombre: "Incendio forestal",
    simbolo: "🔥",
    descripcion:
      "Fuego en cobertura vegetal, agravado en temporada seca. Compromete cultivos, vías y bodegas de insumos inflamables.",
  },
];

export const amenazaPorId = new Map(amenazas.map((a) => [a.id, a]));

export const empresaDemo: Escenario["empresa"] = {
  nombre: "Flores del Oriente S.A.S.",
  sector: "Floricultura de exportación",
  usuarioDemo: {
    nombre: "Santiago Arboleda",
    cargo: "Jefe de Operaciones",
    correo: "operaciones@floresdeloriente.co",
  },
};

export const escenarioDemo: Escenario = {
  empresa: empresaDemo,

  sedes: [
    {
      id: "facatativa",
      nombre: "Finca La Esperanza",
      municipio: "Facatativá",
      departamento: "Cundinamarca",
      lat: 4.8136,
      lon: -74.3548,
      descripcion:
        "32 hectáreas de cultivo bajo invernadero, con riego por fertirriego y reservorio propio.",
      plano: {
        ancho: 100,
        alto: 66,
        cota: "Finca La Esperanza · escala aproximada · norte arriba",
        via: "M99 51.5 L74 51.5 L74 42 L42 42",
        zonas: [
          { id: "z-inv-a", nombre: "Bloque A", x: 5, y: 5, ancho: 34, alto: 22, tipo: "cultivo" },
          { id: "z-inv-b", nombre: "Bloque B", x: 5, y: 33, ancho: 34, alto: 22, tipo: "cultivo" },
          { id: "z-subest-f", nombre: "Subestación", x: 46, y: 6, ancho: 16, alto: 12, tipo: "edificacion" },
          { id: "z-reservorio", nombre: "Reservorio", x: 68, y: 5, ancho: 27, alto: 16, tipo: "agua" },
          { id: "z-bombas", nombre: "Casa de bombas", x: 46, y: 26, ancho: 16, alto: 12, tipo: "edificacion" },
          { id: "z-bodega-ins", nombre: "Bodega de insumos", x: 46, y: 46, ancho: 22, alto: 12, tipo: "edificacion" },
          { id: "z-acceso", nombre: "Portería", x: 80, y: 46, ancho: 15, alto: 11, tipo: "patio" },
        ],
      },
      amenazas: [
        {
          amenaza: "granizada",
          probabilidadAnual: 0.55,
          severidad: 0.2,
          procedencia: "ilustrativo",
          fuente: "Valor de demostración. La Sabana de Bogotá registra granizadas con alta frecuencia entre marzo y mayo.",
          nota: "Reemplazable por la serie histórica de estaciones del IDEAM en la zona.",
        },
        {
          amenaza: "tormenta-electrica",
          probabilidadAnual: 0.7,
          severidad: 0.12,
          procedencia: "ilustrativo",
          fuente: "Valor de demostración, calibrado sobre lo reportado en la entrevista de validación.",
          nota: "Amenaza descubierta en campo: no estaba en el catálogo inicial del proyecto.",
        },
        {
          amenaza: "inundacion",
          probabilidadAnual: 0.25,
          severidad: 0.25,
          procedencia: "ilustrativo",
          fuente: "Valor de demostración. El río Botello atraviesa el municipio y tiene historial de desbordamiento.",
          fuenteUrl: "http://www.ideam.gov.co/web/pronosticos-y-alertas",
        },
        {
          amenaza: "sequia",
          probabilidadAnual: 0.3,
          severidad: 0.2,
          procedencia: "ilustrativo",
          fuente: "Valor de demostración, asociado a la recurrencia de El Niño.",
        },
        {
          amenaza: "sismo",
          probabilidadAnual: 0.08,
          severidad: 0.4,
          procedencia: "referencia",
          fuente:
            "El Servicio Geológico Colombiano clasifica la Sabana de Bogotá en amenaza sísmica intermedia.",
          fuenteUrl: "https://www.sgc.gov.co/",
        },
      ],
    },
    {
      id: "funza",
      nombre: "Centro de poscosecha y frío",
      municipio: "Funza",
      departamento: "Cundinamarca",
      lat: 4.7167,
      lon: -74.2117,
      descripcion:
        "Planta de clasificación, empaque y cadena de frío. Despacha vía aérea desde El Dorado.",
      plano: {
        ancho: 100,
        alto: 66,
        cota: "Centro de poscosecha · escala aproximada · norte arriba",
        via: "M99 60 L34 60 L34 47",
        zonas: [
          { id: "z-poscosecha", nombre: "Nave de poscosecha", x: 5, y: 6, ancho: 38, alto: 26, tipo: "edificacion" },
          { id: "z-frio", nombre: "Cuarto frío", x: 48, y: 6, ancho: 21, alto: 17, tipo: "edificacion" },
          { id: "z-subest-p", nombre: "Subestación", x: 75, y: 6, ancho: 18, alto: 12, tipo: "edificacion" },
          { id: "z-bodega-emp", nombre: "Bodega de empaque", x: 5, y: 40, ancho: 25, alto: 15, tipo: "edificacion" },
          { id: "z-patio", nombre: "Patio de maniobras", x: 36, y: 38, ancho: 28, alto: 19, tipo: "patio" },
          { id: "z-oficina", nombre: "Administración", x: 70, y: 40, ancho: 22, alto: 14, tipo: "edificacion" },
        ],
      },
      amenazas: [
        {
          amenaza: "inundacion",
          probabilidadAnual: 0.35,
          severidad: 0.28,
          procedencia: "ilustrativo",
          fuente: "Valor de demostración. Funza está en la llanura de inundación del río Bogotá.",
          fuenteUrl: "http://www.ideam.gov.co/web/pronosticos-y-alertas",
        },
        {
          amenaza: "tormenta-electrica",
          probabilidadAnual: 0.65,
          severidad: 0.14,
          procedencia: "ilustrativo",
          fuente: "Valor de demostración.",
          nota: "El daño relevante aquí no es el rayo sino la sobretensión sobre los compresores del cuarto frío.",
        },
        {
          amenaza: "sismo",
          probabilidadAnual: 0.08,
          severidad: 0.4,
          procedencia: "referencia",
          fuente:
            "El Servicio Geológico Colombiano clasifica la Sabana de Bogotá en amenaza sísmica intermedia.",
          fuenteUrl: "https://www.sgc.gov.co/",
        },
        {
          amenaza: "granizada",
          probabilidadAnual: 0.4,
          severidad: 0.12,
          procedencia: "ilustrativo",
          fuente: "Valor de demostración.",
        },
      ],
    },
  ],

  activos: [
    // ── Facatativá ──────────────────────────────────────────────────────────
    {
      id: "inv-a",
      sedeId: "facatativa",
      nombre: "Invernaderos bloque A",
      tipo: "invernadero",
      valorReposicion: 2_800_000_000,
      margenDiario: 9_500_000,
      diasReparacion: 45,
      vulnerabilidad: {
        granizada: 0.3,
        inundacion: 0.3,
        sequia: 0.25,
        sismo: 0.1,
        "tormenta-electrica": 0.05,
      },
      zonaId: "z-inv-a",
      plano: { x: 22, y: 17 },
    },
    {
      id: "inv-b",
      sedeId: "facatativa",
      nombre: "Invernaderos bloque B",
      tipo: "invernadero",
      valorReposicion: 2_100_000_000,
      margenDiario: 7_200_000,
      diasReparacion: 45,
      vulnerabilidad: {
        granizada: 0.3,
        inundacion: 0.35,
        sequia: 0.25,
        sismo: 0.1,
        "tormenta-electrica": 0.05,
      },
      zonaId: "z-inv-b",
      plano: { x: 22, y: 45 },
    },
    {
      id: "riego",
      sedeId: "facatativa",
      nombre: "Sistema de fertirriego",
      tipo: "riego",
      valorReposicion: 680_000_000,
      margenDiario: 0,
      diasReparacion: 15,
      vulnerabilidad: {
        inundacion: 0.3,
        "tormenta-electrica": 0.2,
        sequia: 0.15,
        sismo: 0.1,
      },
      zonaId: "z-bombas",
      plano: { x: 54, y: 32.5 },
    },
    {
      id: "reservorio",
      sedeId: "facatativa",
      nombre: "Reservorio",
      tipo: "reservorio",
      valorReposicion: 320_000_000,
      margenDiario: 0,
      diasReparacion: 60,
      vulnerabilidad: { sequia: 0.6, inundacion: 0.15, sismo: 0.1 },
      zonaId: "z-reservorio",
      plano: { x: 81.5, y: 13.5 },
    },
    {
      id: "subest-f",
      sedeId: "facatativa",
      nombre: "Subestación eléctrica",
      tipo: "subestacion",
      valorReposicion: 240_000_000,
      margenDiario: 0,
      diasReparacion: 12,
      vulnerabilidad: {
        "tormenta-electrica": 0.55,
        inundacion: 0.4,
        sismo: 0.15,
      },
      zonaId: "z-subest-f",
      plano: { x: 54, y: 12.5 },
    },
    {
      id: "bodega-ins",
      sedeId: "facatativa",
      nombre: "Bodega de insumos",
      tipo: "bodega",
      valorReposicion: 450_000_000,
      margenDiario: 1_200_000,
      diasReparacion: 25,
      vulnerabilidad: {
        inundacion: 0.45,
        sismo: 0.15,
        granizada: 0.1,
        "incendio-forestal": 0.5,
      },
      zonaId: "z-bodega-ins",
      plano: { x: 57, y: 52.5 },
    },
    {
      id: "via-f",
      sedeId: "facatativa",
      nombre: "Vía interna de acceso",
      tipo: "via",
      valorReposicion: 180_000_000,
      margenDiario: 0,
      diasReparacion: 8,
      vulnerabilidad: { inundacion: 0.5, deslizamiento: 0.55, sismo: 0.2 },
      zonaId: "z-acceso",
      plano: { x: 87.5, y: 51.5 },
    },

    // ── Funza ───────────────────────────────────────────────────────────────
    {
      id: "poscosecha",
      sedeId: "funza",
      nombre: "Planta de poscosecha",
      tipo: "planta-poscosecha",
      valorReposicion: 3_200_000_000,
      margenDiario: 12_000_000,
      diasReparacion: 60,
      vulnerabilidad: {
        inundacion: 0.35,
        sismo: 0.25,
        granizada: 0.1,
        "tormenta-electrica": 0.1,
      },
      zonaId: "z-poscosecha",
      plano: { x: 24, y: 20 },
    },
    {
      id: "frio",
      sedeId: "funza",
      nombre: "Cuarto frío",
      tipo: "cuarto-frio",
      valorReposicion: 1_450_000_000,
      margenDiario: 8_000_000,
      diasReparacion: 30,
      vulnerabilidad: {
        "tormenta-electrica": 0.25,
        inundacion: 0.35,
        sismo: 0.2,
      },
      zonaId: "z-frio",
      plano: { x: 58.5, y: 15 },
    },
    {
      id: "subest-p",
      sedeId: "funza",
      nombre: "Subestación eléctrica",
      tipo: "subestacion",
      valorReposicion: 380_000_000,
      margenDiario: 0,
      diasReparacion: 12,
      vulnerabilidad: {
        "tormenta-electrica": 0.55,
        inundacion: 0.4,
        sismo: 0.15,
      },
      zonaId: "z-subest-p",
      plano: { x: 84, y: 12.5 },
    },
    {
      id: "bodega-emp",
      sedeId: "funza",
      nombre: "Bodega de empaque",
      tipo: "bodega",
      valorReposicion: 520_000_000,
      margenDiario: 2_100_000,
      diasReparacion: 25,
      vulnerabilidad: { inundacion: 0.45, sismo: 0.15 },
      zonaId: "z-bodega-emp",
      plano: { x: 17.5, y: 48 },
    },
    {
      id: "flota",
      sedeId: "funza",
      nombre: "Flota de transporte refrigerado",
      tipo: "flota",
      valorReposicion: 890_000_000,
      margenDiario: 4_500_000,
      diasReparacion: 10,
      vulnerabilidad: { inundacion: 0.2, sismo: 0.05, granizada: 0.15 },
      zonaId: "z-patio",
      plano: { x: 50, y: 48 },
    },
    {
      id: "oficina",
      sedeId: "funza",
      nombre: "Oficina administrativa",
      tipo: "oficina",
      valorReposicion: 260_000_000,
      margenDiario: 900_000,
      diasReparacion: 30,
      vulnerabilidad: { inundacion: 0.3, sismo: 0.2 },
      zonaId: "z-oficina",
      plano: { x: 81, y: 47.5 },
    },
  ],

  dependencias: [
    {
      origen: "subest-f",
      objetivo: "riego",
      nota: "El fertirriego no opera sin energía en la finca.",
    },
    {
      origen: "reservorio",
      objetivo: "riego",
      nota: "Sin agua almacenada no hay qué bombear.",
    },
    {
      origen: "riego",
      objetivo: "inv-a",
      nota: "El cultivo bajo cubierta depende por completo del riego.",
    },
    {
      origen: "riego",
      objetivo: "inv-b",
      nota: "El cultivo bajo cubierta depende por completo del riego.",
    },
    {
      origen: "via-f",
      objetivo: "bodega-ins",
      nota: "Sin vía no entran insumos ni salen despachos.",
    },
    {
      origen: "subest-p",
      objetivo: "frio",
      nota: "Los compresores del cuarto frío no operan sin energía.",
    },
    {
      origen: "frio",
      objetivo: "poscosecha",
      nota: "Sin cadena de frío la flor cortada no se puede procesar ni almacenar.",
    },
    {
      origen: "poscosecha",
      objetivo: "flota",
      nota: "Si no hay producto clasificado y empacado, no hay qué despachar.",
    },
  ],

  medidas: [
    {
      id: "m-cubierta",
      nombre: "Refuerzo antigranizo de cubiertas",
      descripcion:
        "Cambio de plástico y malla antigranizo en los dos bloques de invernadero.",
      costo: 420_000_000,
      aplicaA: ["inv-a", "inv-b"],
      amenazas: ["granizada"],
      reduccionDanio: 0.7,
      reduccionDias: 0.4,
    },
    {
      id: "m-pararrayos",
      nombre: "Pararrayos y protección contra sobretensión",
      descripcion:
        "Sistema de apantallamiento y supresores en subestaciones y sala de compresores.",
      costo: 95_000_000,
      aplicaA: ["subest-f", "subest-p", "frio"],
      amenazas: ["tormenta-electrica"],
      reduccionDanio: 0.65,
      reduccionDias: 0.5,
    },
    {
      id: "m-planta-electrica",
      nombre: "Planta eléctrica de respaldo en poscosecha",
      descripcion:
        "Generador con transferencia automática para sostener la cadena de frío ante corte de energía.",
      costo: 310_000_000,
      aplicaA: ["subest-p", "frio", "poscosecha"],
      amenazas: ["tormenta-electrica", "inundacion", "sismo"],
      reduccionDanio: 0.15,
      reduccionDias: 0.75,
    },
    {
      id: "m-drenaje",
      nombre: "Obra de drenaje perimetral en Facatativá",
      descripcion:
        "Canal perimetral y bombeo para evacuar escorrentía antes de que entre a los bloques.",
      costo: 260_000_000,
      aplicaA: ["inv-a", "inv-b", "bodega-ins", "riego"],
      amenazas: ["inundacion"],
      reduccionDanio: 0.55,
      reduccionDias: 0.4,
    },
    {
      id: "m-elevar-tablero",
      nombre: "Elevar tableros eléctricos sobre nivel de inundación",
      descripcion:
        "Reubicación de tableros y celdas a plataforma elevada en ambas subestaciones.",
      costo: 48_000_000,
      aplicaA: ["subest-f", "subest-p"],
      amenazas: ["inundacion"],
      reduccionDanio: 0.6,
      reduccionDias: 0.5,
    },
    {
      id: "m-reservorio",
      nombre: "Ampliación del reservorio",
      descripcion:
        "Aumento de capacidad de almacenamiento para sostener el riego en temporada seca.",
      costo: 380_000_000,
      aplicaA: ["reservorio", "riego"],
      amenazas: ["sequia"],
      reduccionDanio: 0.6,
      reduccionDias: 0.35,
    },
    {
      id: "m-anclaje",
      nombre: "Anclaje sísmico de equipos y racks",
      descripcion:
        "Anclaje estructural de estanterías, compresores y líneas de clasificación.",
      costo: 140_000_000,
      aplicaA: ["poscosecha", "frio", "bodega-emp"],
      amenazas: ["sismo"],
      reduccionDanio: 0.45,
      reduccionDias: 0.3,
    },
    {
      id: "m-via",
      nombre: "Afirmado y contención de la vía interna",
      descripcion:
        "Obras de estabilización y mejora de rasante en el acceso a la finca.",
      costo: 190_000_000,
      aplicaA: ["via-f"],
      amenazas: ["inundacion", "deslizamiento"],
      reduccionDanio: 0.5,
      reduccionDias: 0.6,
    },
    {
      id: "m-sensores",
      nombre: "Estación meteorológica y sensores de nivel",
      descripcion:
        "Medición propia en sitio para anticipar granizadas y crecientes con horas de ventaja.",
      costo: 75_000_000,
      aplicaA: ["inv-a", "inv-b", "poscosecha", "frio"],
      amenazas: ["inundacion", "granizada", "tormenta-electrica"],
      reduccionDanio: 0.2,
      reduccionDias: 0.25,
    },
    {
      id: "m-seguro",
      nombre: "Ampliación de cobertura de seguro",
      descripcion:
        "Póliza todo riesgo con menor deducible sobre activos de alto valor. No evita el daño: transfiere la pérdida.",
      costo: 165_000_000,
      aplicaA: [
        "inv-a",
        "inv-b",
        "poscosecha",
        "frio",
        "bodega-emp",
        "bodega-ins",
        "flota",
      ],
      amenazas: [
        "inundacion",
        "granizada",
        "sismo",
        "tormenta-electrica",
        "incendio-forestal",
      ],
      reduccionDanio: 0.4,
      reduccionDias: 0,
    },
  ],
};

export const PRESUPUESTO_INICIAL = 800_000_000;
