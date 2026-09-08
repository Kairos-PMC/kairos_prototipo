import type { Sede } from "@/domain/tipos";
import { distanciaKm } from "@/lib/fuentes";

export interface PuntoSede {
  sede: Sede;
  detalle: string;
  /** 0..1 — exposición relativa; controla el tamaño de la marca. */
  peso: number;
}

/**
 * Croquis de localización.
 *
 * ── Por qué no hay un mapa deslizable ────────────────────────────────────────
 * Lo hubo, con MapLibre. Nunca funcionó: el worker de la librería no se resuelve
 * bajo Turbopack —devuelve HTML en vez de JavaScript— así que el estilo jamás
 * terminaba de cargar. El canvas y la cámara sí respondían, por eso el síntoma
 * era un rectángulo liso con los marcadores flotando encima y ningún error en
 * consola. Se probó con MapLibre 5 y 6, y con teselas vectoriales y raster.
 *
 * La salida no fue insistir. Un juego de planos siempre incluye un plano de
 * localización, y es esquemático a propósito: ubica la obra respecto a
 * referencias conocidas, no reemplaza a la cartografía. Eso es exactamente lo
 * que hace falta aquí, se dibuja en el mismo lenguaje que el resto, y no depende
 * de ningún proveedor externo.
 *
 * ── Qué tan cierto es ────────────────────────────────────────────────────────
 * Las posiciones salen de las coordenadas reales por proyección equirectangular.
 * A esta latitud (~4,7° N) un grado de longitud mide 110,9 km y uno de latitud
 * 110,6 km, así que la distorsión frente a una proyección conforme es del orden
 * del 0,3 %: invisible en un croquis. La distancia rotulada entre sedes se
 * calcula con haversine sobre las coordenadas, no se mide sobre el dibujo.
 */

/** Referencias de la Sabana de Bogotá, con sus coordenadas reales. */
const referencias = [
  { nombre: "Bogotá D.C.", lat: 4.711, lon: -74.0721, mayor: true },
  { nombre: "El Dorado", lat: 4.7016, lon: -74.1469, aeropuerto: true },
  { nombre: "Facatativá", lat: 4.8145, lon: -74.3547 },
  { nombre: "Madrid", lat: 4.7325, lon: -74.2647 },
  { nombre: "Mosquera", lat: 4.7059, lon: -74.23 },
  { nombre: "Funza", lat: 4.7167, lon: -74.2117 },
  { nombre: "El Rosal", lat: 4.8536, lon: -74.262 },
  { nombre: "Bojacá", lat: 4.7378, lon: -74.3414 },
];

const LIMITES = { lonMin: -74.42, lonMax: -74.02, latMin: 4.65, latMax: 4.9 };
const ANCHO = 100;
const ALTO = 62;

function proyectar(lat: number, lon: number) {
  const x =
    ((lon - LIMITES.lonMin) / (LIMITES.lonMax - LIMITES.lonMin)) * ANCHO;
  // La latitud crece hacia el norte y la Y del SVG hacia el sur.
  const y =
    ALTO - ((lat - LIMITES.latMin) / (LIMITES.latMax - LIMITES.latMin)) * ALTO;
  return { x, y };
}

export function CroquisSedes({ puntos }: { puntos: PuntoSede[] }) {
  const marcas = puntos.map((p) => ({
    ...p,
    ...proyectar(p.sede.lat, p.sede.lon),
  }));

  const km =
    puntos.length === 2
      ? distanciaKm(
          puntos[0].sede.lat,
          puntos[0].sede.lon,
          puntos[1].sede.lat,
          puntos[1].sede.lon,
        )
      : null;

  // Un grado de longitud a esta latitud, llevado a unidades del dibujo.
  const unidadesPorKm =
    ANCHO / ((LIMITES.lonMax - LIMITES.lonMin) * 110.9);

  return (
    <svg
      viewBox={`-6 -6 ${ANCHO + 12} ${ALTO + 20}`}
      className="w-full select-none"
      role="img"
      aria-label="Croquis de localización de las sedes en la Sabana de Bogotá"
    >
      <defs>
        <pattern id="mm-croquis" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0H0v5" fill="none" stroke="var(--linea-fina)" strokeWidth="0.15" />
        </pattern>
      </defs>

      <rect x="-6" y="-6" width={ANCHO + 12} height={ALTO + 20} fill="url(#mm-croquis)" />

      {/* Retícula de coordenadas */}
      {[-74.4, -74.3, -74.2, -74.1].map((lon) => {
        const { x } = proyectar(0, lon);
        return (
          <g key={lon}>
            <line
              x1={x}
              y1="0"
              x2={x}
              y2={ALTO}
              stroke="var(--linea)"
              strokeWidth="0.2"
              strokeDasharray="1 1.6"
            />
            <text
              x={x}
              y={ALTO + 3.6}
              textAnchor="middle"
              fontSize="1.9"
              className="mono"
              fill="var(--tinta-tenue)"
            >
              {lon.toFixed(1)}°
            </text>
          </g>
        );
      })}
      {[4.7, 4.8].map((lat) => {
        const { y } = proyectar(lat, 0);
        return (
          <g key={lat}>
            <line
              x1="0"
              y1={y}
              x2={ANCHO}
              y2={y}
              stroke="var(--linea)"
              strokeWidth="0.2"
              strokeDasharray="1 1.6"
            />
            <text
              x="-1"
              y={y + 0.7}
              textAnchor="end"
              fontSize="1.9"
              className="mono"
              fill="var(--tinta-tenue)"
            >
              {lat.toFixed(1)}°
            </text>
          </g>
        );
      })}

      <rect
        x="0"
        y="0"
        width={ANCHO}
        height={ALTO}
        fill="none"
        stroke="var(--tinta-tenue)"
        strokeWidth="0.35"
      />

      {/* Referencias.
          Se omiten las que caen encima de una sede: el municipio donde está la
          sede ya lo dice la propia marca, y superpuestos los dos rótulos no se
          leen ninguno. */}
      {referencias.map((r) => {
        const { x, y } = proyectar(r.lat, r.lon);
        const tapadaPorSede = marcas.some(
          (m) => Math.hypot(m.x - x, m.y - y) < 5,
        );
        if (tapadaPorSede) return null;
        return (
          <g key={r.nombre}>
            {r.mayor ? (
              <circle
                cx={x}
                cy={y}
                r="2.2"
                fill="var(--papel-hundido)"
                stroke="var(--tinta-media)"
                strokeWidth="0.3"
              />
            ) : r.aeropuerto ? (
              <g stroke="var(--tinta-tenue)" strokeWidth="0.3" fill="none">
                <path d={`M${x - 1.8} ${y} h3.6 M${x} ${y - 1.8} v3.6`} />
                <circle cx={x} cy={y} r="1.2" />
              </g>
            ) : (
              <path
                d={`M${x - 1.2} ${y} h2.4 M${x} ${y - 1.2} v2.4`}
                stroke="var(--tinta-tenue)"
                strokeWidth="0.3"
              />
            )}
            <text
              x={x + 2.8}
              y={y + 0.8}
              fontSize="2"
              className="mono"
              fill={r.mayor ? "var(--tinta-media)" : "var(--tinta-tenue)"}
            >
              {r.nombre}
            </text>
          </g>
        );
      })}

      {/* Distancia entre sedes */}
      {marcas.length === 2 && km !== null && (
        <g>
          <line
            x1={marcas[0].x}
            y1={marcas[0].y}
            x2={marcas[1].x}
            y2={marcas[1].y}
            stroke="var(--ocre)"
            strokeWidth="0.3"
            strokeDasharray="1.6 1.2"
          />
          <rect
            x={(marcas[0].x + marcas[1].x) / 2 - 7}
            y={(marcas[0].y + marcas[1].y) / 2 - 2}
            width="14"
            height="4"
            rx="0.4"
            fill="var(--papel-alto)"
            stroke="var(--ocre)"
            strokeWidth="0.25"
          />
          <text
            x={(marcas[0].x + marcas[1].x) / 2}
            y={(marcas[0].y + marcas[1].y) / 2 + 0.8}
            textAnchor="middle"
            fontSize="2.2"
            className="mono"
            fill="var(--ocre)"
          >
            {km.toFixed(1)} km
          </text>
        </g>
      )}

      {/* Sedes */}
      {marcas.map((m) => (
        <g key={m.sede.id}>
          <circle
            cx={m.x}
            cy={m.y}
            r={2.6 + m.peso * 2.4}
            fill="color-mix(in srgb, var(--ocre) 30%, transparent)"
            stroke="var(--ocre)"
            strokeWidth="0.55"
          />
          <circle cx={m.x} cy={m.y} r="0.8" fill="var(--ocre)" />
          <rect
            x={m.x - m.sede.nombre.length * 0.62 - 1}
            y={m.y + 4.4}
            width={m.sede.nombre.length * 1.24 + 2}
            height="3.4"
            rx="0.4"
            fill="var(--papel-alto)"
            stroke="var(--ocre)"
            strokeWidth="0.25"
          />
          <text
            x={m.x}
            y={m.y + 6.7}
            textAnchor="middle"
            fontSize="2.1"
            className="mono"
            fill="var(--tinta)"
          >
            {m.sede.nombre}
          </text>
          <text
            x={m.x}
            y={m.y + 10.4}
            textAnchor="middle"
            fontSize="1.9"
            className="mono"
            fill="var(--tinta-tenue)"
          >
            {m.detalle}
          </text>
        </g>
      ))}

      {/* Norte */}
      <g transform={`translate(${ANCHO - 5} 5)`}>
        <path
          d="M0 -3.2 L1.9 2.8 L0 1.4 L-1.9 2.8 Z"
          fill="var(--tinta-media)"
        />
        <text
          y="6.2"
          textAnchor="middle"
          fontSize="2.2"
          className="mono"
          fill="var(--tinta-media)"
        >
          N
        </text>
      </g>

      {/* Escala gráfica: 10 km medidos sobre la proyección */}
      <g stroke="var(--tinta-media)" strokeWidth="0.25">
        <line x1="0" y1={ALTO + 8} x2={unidadesPorKm * 10} y2={ALTO + 8} />
        <line x1="0" y1={ALTO + 6.8} x2="0" y2={ALTO + 9.2} />
        <line
          x1={unidadesPorKm * 10}
          y1={ALTO + 6.8}
          x2={unidadesPorKm * 10}
          y2={ALTO + 9.2}
        />
        <rect
          x="0"
          y={ALTO + 7.4}
          width={unidadesPorKm * 5}
          height="1.2"
          fill="var(--tinta-media)"
          stroke="none"
        />
      </g>
      <text
        x={unidadesPorKm * 10 + 2}
        y={ALTO + 9}
        fontSize="2"
        className="mono"
        fill="var(--tinta-tenue)"
      >
        10 km
      </text>

      <text
        x={ANCHO}
        y={ALTO + 9}
        textAnchor="end"
        fontSize="1.9"
        className="mono"
        fill="var(--tinta-tenue)"
        style={{ letterSpacing: "0.06em" }}
      >
        CROQUIS DE LOCALIZACIÓN · SABANA DE BOGOTÁ · PROYECCIÓN EQUIRECTANGULAR
      </text>
    </svg>
  );
}
