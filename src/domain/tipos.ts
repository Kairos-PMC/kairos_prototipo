/**
 * Modelo de dominio del prototipo.
 *
 * Deliberadamente simple: valores esperados, sin distribuciones ni simulación
 * estocástica. Alcanza para demostrar el concepto; no alcanza para sustentar una
 * decisión de inversión real. Ver docs/planes-de-trabajo/pendientes/prototipo-inicial/plan.md §4.
 */

export type AmenazaId =
  | "inundacion"
  | "sismo"
  | "deslizamiento"
  | "tormenta-electrica"
  | "granizada"
  | "sequia"
  | "incendio-forestal";

/**
 * De dónde salió una cifra. Se muestra en pantalla junto al dato, siempre.
 * Un dato inventado y rotulado es honesto; uno inventado y presentado como
 * oficial, no.
 */
export type Procedencia = "vivo" | "referencia" | "ilustrativo";

export interface Amenaza {
  id: AmenazaId;
  nombre: string;
  descripcion: string;
  /** Emoji usado como marca visual en tarjetas y leyendas. */
  simbolo: string;
}

export interface PerfilAmenaza {
  amenaza: AmenazaId;
  /** Probabilidad de al menos un evento relevante en el año. 0..1 */
  probabilidadAnual: number;
  /** Intensidad típica del evento cuando ocurre. 0..1 */
  severidad: number;
  procedencia: Procedencia;
  fuente: string;
  fuenteUrl?: string;
  nota?: string;
}

export type TipoActivo =
  | "invernadero"
  | "cuarto-frio"
  | "subestacion"
  | "bodega"
  | "riego"
  | "reservorio"
  | "via"
  | "planta-poscosecha"
  | "flota"
  | "oficina";

export interface Activo {
  id: string;
  sedeId: string;
  nombre: string;
  tipo: TipoActivo;
  /** Costo de reponerlo, en pesos. */
  valorReposicion: number;
  /** Margen que aporta por día de operación, en pesos. */
  margenDiario: number;
  /** Fracción del valor que se pierde ante un evento de severidad plena. 0..1 */
  vulnerabilidad: Partial<Record<AmenazaId, number>>;
  /** Días fuera de servicio ante daño total. */
  diasReparacion: number;
  /** Posición en el plano esquemático de la sede, en porcentaje (0..100). */
  plano: { x: number; y: number };
}

/** `objetivo` no puede operar sin `origen`. */
export interface Dependencia {
  origen: string;
  objetivo: string;
  nota: string;
}

export interface Sede {
  id: string;
  nombre: string;
  municipio: string;
  departamento: string;
  lat: number;
  lon: number;
  descripcion: string;
  amenazas: PerfilAmenaza[];
}

export interface Medida {
  id: string;
  nombre: string;
  descripcion: string;
  /** Inversión única, en pesos. */
  costo: number;
  /** Activos sobre los que actúa. */
  aplicaA: string[];
  /** Amenazas frente a las que protege. */
  amenazas: AmenazaId[];
  /** Cuánto reduce el daño físico. 0..1 */
  reduccionDanio: number;
  /** Cuánto reduce los días fuera de servicio. 0..1 */
  reduccionDias: number;
}

export interface Escenario {
  empresa: {
    nombre: string;
    sector: string;
    usuarioDemo: { nombre: string; cargo: string; correo: string };
  };
  sedes: Sede[];
  activos: Activo[];
  dependencias: Dependencia[];
  medidas: Medida[];
}
