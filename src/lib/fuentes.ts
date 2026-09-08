/**
 * Consulta de fuentes públicas.
 *
 * Todo esto corre en el servidor (Server Components), así que CORS no aplica y
 * ninguna llave viaja al navegador — de hecho no hay llaves: las tres fuentes
 * son abiertas.
 *
 * Regla que se respeta en todo el archivo: **si una fuente falla, la pantalla no
 * se rompe.** Devuelve `{ ok: false }` con el motivo y la interfaz lo muestra
 * como lo que es, un dato que no se pudo traer. Una demo que se cae porque un
 * servicio externo tuvo un mal minuto no demuestra nada.
 */

export type Traida<T> =
  | { ok: true; datos: T; consultadoEn: string }
  | { ok: false; motivo: string };

/** Ventana de caché: 15 minutos. Suficiente para datos de amenaza. */
const REVALIDAR = 900;

async function traerJson<T>(url: string, etiqueta: string): Promise<Traida<T>> {
  try {
    const respuesta = await fetch(url, {
      next: { revalidate: REVALIDAR },
      headers: { Accept: "application/json" },
    });
    if (!respuesta.ok) {
      return { ok: false, motivo: `${etiqueta} respondió ${respuesta.status}` };
    }
    return {
      ok: true,
      datos: (await respuesta.json()) as T,
      consultadoEn: new Date().toISOString(),
    };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : "error desconocido";
    return { ok: false, motivo: `No se pudo consultar ${etiqueta}: ${detalle}` };
  }
}

// ── Sismos: USGS ────────────────────────────────────────────────────────────

export interface Sismo {
  id: string;
  magnitud: number;
  lugar: string;
  fecha: Date;
  profundidadKm: number;
  lat: number;
  lon: number;
  url: string;
}

interface RespuestaUsgs {
  features: {
    id: string;
    properties: { mag: number; place: string; time: number; url: string };
    geometry: { coordinates: [number, number, number] };
  }[];
}

/**
 * Sismos recientes dentro del recuadro que cubre Colombia continental.
 *
 * Se usa USGS y no el Servicio Geológico Colombiano porque el SGC no expone un
 * API pública documentada; su catálogo se consulta por su visor web. USGS cubre
 * el territorio con la misma red global y entrega GeoJSON estable.
 */
export async function sismosRecientes(dias = 30, magnitudMinima = 3.0) {
  const desde = new Date(Date.now() - dias * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const url =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
    `&starttime=${desde}&minmagnitude=${magnitudMinima}` +
    "&minlatitude=-4.3&maxlatitude=13.5&minlongitude=-79.1&maxlongitude=-66.8" +
    "&orderby=time&limit=40";

  const bruto = await traerJson<RespuestaUsgs>(url, "USGS");
  if (!bruto.ok) return bruto;

  const datos: Sismo[] = bruto.datos.features.map((f) => ({
    id: f.id,
    magnitud: f.properties.mag,
    lugar: f.properties.place,
    fecha: new Date(f.properties.time),
    profundidadKm: f.geometry.coordinates[2],
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    url: f.properties.url,
  }));

  return { ok: true as const, datos, consultadoEn: bruto.consultadoEn };
}

// ── Clima: Open-Meteo ───────────────────────────────────────────────────────

export interface ClimaSede {
  temperatura: number;
  precipitacionAhora: number;
  vientoAhora: number;
  dias: {
    fecha: string;
    lluviaMm: number;
    probabilidadLluvia: number;
    vientoMax: number;
    rafagaMax: number;
  }[];
}

interface RespuestaOpenMeteo {
  current: {
    temperature_2m: number;
    precipitation: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
  };
}

export async function climaEnSede(lat: number, lon: number) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,precipitation,wind_speed_10m" +
    "&daily=precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max" +
    "&timezone=America%2FBogota&forecast_days=4";

  const bruto = await traerJson<RespuestaOpenMeteo>(url, "Open-Meteo");
  if (!bruto.ok) return bruto;

  const d = bruto.datos.daily;
  const datos: ClimaSede = {
    temperatura: bruto.datos.current.temperature_2m,
    precipitacionAhora: bruto.datos.current.precipitation,
    vientoAhora: bruto.datos.current.wind_speed_10m,
    dias: d.time.map((fecha, i) => ({
      fecha,
      lluviaMm: d.precipitation_sum[i],
      probabilidadLluvia: d.precipitation_probability_max[i],
      vientoMax: d.wind_speed_10m_max[i],
      rafagaMax: d.wind_gusts_10m_max[i],
    })),
  };

  return { ok: true as const, datos, consultadoEn: bruto.consultadoEn };
}

// ── Distancia ───────────────────────────────────────────────────────────────

/** Distancia en kilómetros entre dos coordenadas (fórmula del haversine). */
export function distanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ── Fuentes institucionales que no exponen API ──────────────────────────────

export interface FuenteInstitucional {
  nombre: string;
  sigla: string;
  que: string;
  porQueNoEstaEnVivo: string;
  url: string;
}

export const fuentesInstitucionales: FuenteInstitucional[] = [
  {
    sigla: "IDEAM",
    nombre: "Instituto de Hidrología, Meteorología y Estudios Ambientales",
    que: "Boletín diario de alertas por amenaza de deslizamientos (BADT), pronósticos y avisos hidrológicos por municipio.",
    porQueNoEstaEnVivo:
      "Publica en PDF y HTML, sin API documentada. Traerlo exige raspar el boletín y normalizarlo.",
    url: "http://www.ideam.gov.co/web/pronosticos-y-alertas",
  },
  {
    sigla: "SGC",
    nombre: "Servicio Geológico Colombiano",
    que: "Red Sismológica Nacional, catálogo de sismos y mapas de amenaza sísmica.",
    porQueNoEstaEnVivo:
      "El catálogo se consulta por visor web. Aquí se usa USGS, que cubre el mismo territorio con GeoJSON abierto.",
    url: "https://www.sgc.gov.co/",
  },
  {
    sigla: "UNGRD",
    nombre: "Unidad Nacional para la Gestión del Riesgo de Desastres",
    que: "Inventario nacional de Sistemas de Alerta Temprana y registro histórico de emergencias por municipio.",
    porQueNoEstaEnVivo:
      "Publica informes y tableros, no un servicio consultable. Es la fuente natural para calibrar frecuencias.",
    url: "https://portal.gestiondelriesgo.gov.co/",
  },
  {
    sigla: "DesInventar",
    nombre: "Base histórica de desastres",
    que: "Registro de eventos por municipio desde 1970: pérdidas, afectados, infraestructura comprometida.",
    porQueNoEstaEnVivo:
      "Se descarga por consulta manual. Es el insumo para pasar de probabilidades ilustrativas a frecuencias observadas.",
    url: "https://www.desinventar.net/",
  },
];
