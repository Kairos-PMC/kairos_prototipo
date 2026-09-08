"use client";

import { TrazoActivo } from "@/components/iconos";
import type { Activo, Dependencia, Sede } from "@/domain/tipos";

interface Props {
  sede: Sede;
  activos: Activo[];
  dependencias: Dependencia[];
  caidos: Set<string>;
  arrastrados: Set<string>;
  seleccionado: string | null;
  onAlternar: (id: string) => void;
  onSeleccionar: (id: string | null) => void;
}

const rellenoZona: Record<string, string> = {
  edificacion: "var(--papel-alto)",
  cultivo: "color-mix(in srgb, var(--verde) 7%, var(--papel-alto))",
  patio: "color-mix(in srgb, var(--tinta) 3%, var(--papel-alto))",
  agua: "color-mix(in srgb, var(--azul) 11%, var(--papel-alto))",
};

/**
 * Plano de planta interactivo.
 *
 * Dibuja la sede como una lámina técnica: huellas de edificación, cultivo, vía
 * interna y cotas. Cada activo se marca sobre la zona donde vive; al hacer clic
 * se da por caído y el dibujo muestra la cascada —lo que deja de operar sin
 * haber recibido daño— con trama diagonal.
 *
 * Todo el dibujo vive en las unidades del plano (`sede.plano.ancho/alto`), no en
 * píxeles, para que escale con el contenedor sin recalcular nada.
 */
export function PlanoPlanta({
  sede,
  activos,
  dependencias,
  caidos,
  arrastrados,
  seleccionado,
  onAlternar,
  onSeleccionar,
}: Props) {
  const { ancho, alto, zonas, via, cota } = sede.plano;
  const porId = new Map(activos.map((a) => [a.id, a]));

  const estado = (id: string) =>
    caidos.has(id) ? "caido" : arrastrados.has(id) ? "arrastrado" : "activo";

  const colorEstado = {
    caido: "var(--bermellon)",
    arrastrado: "var(--ocre)",
    activo: "var(--azul)",
  } as const;

  return (
    <svg
      viewBox={`-5 -5 ${ancho + 10} ${alto + 16}`}
      className="w-full select-none"
      role="img"
      aria-label={`Plano de ${sede.nombre}`}
    >
      <defs>
        <pattern id="mm" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0H0v5" fill="none" stroke="var(--linea-fina)" strokeWidth="0.15" />
        </pattern>
        <pattern
          id="trama-caida"
          width="2.2"
          height="2.2"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="2.2"
            stroke="var(--bermellon)"
            strokeWidth="0.7"
            opacity="0.5"
          />
        </pattern>
        <pattern
          id="trama-arrastre"
          width="2.6"
          height="2.6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="2.6"
            stroke="var(--ocre)"
            strokeWidth="0.55"
            opacity="0.5"
          />
        </pattern>
        <marker
          id="punta"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="3.2"
          markerHeight="3.2"
          orient="auto-start-reverse"
        >
          <path d="M0 1L9 5L0 9z" fill="currentColor" />
        </marker>
      </defs>

      {/* Papel milimetrado y marco del lote */}
      <rect x="-5" y="-5" width={ancho + 10} height={alto + 16} fill="url(#mm)" />
      <rect
        x="0"
        y="0"
        width={ancho}
        height={alto}
        fill="none"
        stroke="var(--tinta-tenue)"
        strokeWidth="0.35"
        strokeDasharray="3 1.6 0.6 1.6"
      />

      {/* Vía interna */}
      <path d={via} fill="none" stroke="var(--linea)" strokeWidth="3.4" strokeLinecap="square" />
      <path
        d={via}
        fill="none"
        stroke="var(--papel)"
        strokeWidth="2.6"
        strokeLinecap="square"
      />
      <path
        d={via}
        fill="none"
        stroke="var(--tinta-tenue)"
        strokeWidth="0.25"
        strokeDasharray="1.4 1.4"
      />

      {/* Zonas */}
      {zonas.map((z) => {
        const dentro = activos.filter((a) => a.zonaId === z.id);
        const zonaCaida = dentro.some((a) => caidos.has(a.id));
        const zonaArrastrada =
          !zonaCaida && dentro.some((a) => arrastrados.has(a.id));

        return (
          <g key={z.id}>
            <rect
              x={z.x}
              y={z.y}
              width={z.ancho}
              height={z.alto}
              fill={rellenoZona[z.tipo]}
              stroke={
                zonaCaida
                  ? "var(--bermellon)"
                  : zonaArrastrada
                    ? "var(--ocre)"
                    : "var(--azul)"
              }
              strokeWidth={zonaCaida || zonaArrastrada ? 0.7 : 0.4}
              strokeDasharray={z.tipo === "patio" ? "2 1.4" : undefined}
              className="transition-all duration-300"
            />

            {/* Hileras de cultivo */}
            {z.tipo === "cultivo" &&
              Array.from({ length: Math.floor(z.alto / 4) }, (_, i) => (
                <line
                  key={i}
                  x1={z.x + 1.5}
                  y1={z.y + 3 + i * 4}
                  x2={z.x + z.ancho - 1.5}
                  y2={z.y + 3 + i * 4}
                  stroke="var(--verde)"
                  strokeWidth="0.22"
                  opacity="0.45"
                />
              ))}

            {/* Superficie de agua */}
            {z.tipo === "agua" &&
              Array.from({ length: 3 }, (_, i) => (
                <path
                  key={i}
                  d={`M${z.x + 3} ${z.y + 5 + i * 4} q 3 -1.4 6 0 t 6 0 t 6 0`}
                  fill="none"
                  stroke="var(--azul)"
                  strokeWidth="0.25"
                  opacity="0.5"
                />
              ))}

            {(zonaCaida || zonaArrastrada) && (
              <rect
                x={z.x}
                y={z.y}
                width={z.ancho}
                height={z.alto}
                fill={zonaCaida ? "url(#trama-caida)" : "url(#trama-arrastre)"}
                className="pointer-events-none"
              />
            )}

            {/* Rótulo POR FUERA de la huella. Dentro, en las zonas pequeñas
                queda debajo de la marca del activo y se pierde. */}
            <text
              x={z.x + 0.4}
              y={z.y - 1.2}
              fontSize="2.1"
              className="mono pointer-events-none"
              fill={
                zonaCaida
                  ? "var(--bermellon)"
                  : zonaArrastrada
                    ? "var(--ocre)"
                    : "var(--tinta-tenue)"
              }
              style={{ letterSpacing: "0.06em" }}
            >
              {z.nombre.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Dependencias */}
      {dependencias.map((d) => {
        const o = porId.get(d.origen);
        const t = porId.get(d.objetivo);
        if (!o || !t) return null;

        const viva =
          (caidos.has(d.origen) || arrastrados.has(d.origen)) &&
          arrastrados.has(d.objetivo);

        // Curva suave: una recta entre edificaciones se confunde con los muros.
        const mx = (o.plano.x + t.plano.x) / 2;
        const my = (o.plano.y + t.plano.y) / 2 - 3;

        return (
          <path
            key={`${d.origen}-${d.objetivo}`}
            d={`M${o.plano.x} ${o.plano.y} Q${mx} ${my} ${t.plano.x} ${t.plano.y}`}
            fill="none"
            stroke={viva ? "var(--bermellon)" : "var(--tinta-tenue)"}
            strokeWidth={viva ? 0.55 : 0.3}
            strokeDasharray={viva ? undefined : "1.2 1.2"}
            opacity={viva ? 1 : 0.55}
            markerEnd="url(#punta)"
            color={viva ? "var(--bermellon)" : "var(--tinta-tenue)"}
            className="pointer-events-none transition-all duration-300"
          >
            <title>{d.nota}</title>
          </path>
        );
      })}

      {/* Activos */}
      {activos.map((a) => {
        const e = estado(a.id);
        const color = colorEstado[e];
        const activoSeleccionado = seleccionado === a.id;

        return (
          <g
            key={a.id}
            onClick={() => onAlternar(a.id)}
            onMouseEnter={() => onSeleccionar(a.id)}
            onMouseLeave={() => onSeleccionar(null)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                onAlternar(a.id);
              }
            }}
          >
            {activoSeleccionado && (
              <rect
                x={a.plano.x - 5}
                y={a.plano.y - 5}
                width="10"
                height="10"
                fill="none"
                stroke={color}
                strokeWidth="0.3"
                strokeDasharray="1 1"
              />
            )}
            <rect
              x={a.plano.x - 3.6}
              y={a.plano.y - 3.6}
              width="7.2"
              height="7.2"
              rx="0.6"
              fill="var(--papel-alto)"
              stroke={color}
              strokeWidth={e === "activo" ? 0.45 : 0.75}
              className="transition-all duration-300"
            />
            <g
              transform={`translate(${a.plano.x - 2.6} ${a.plano.y - 2.6}) scale(0.216)`}
              style={{ color }}
              className="pointer-events-none transition-colors duration-300"
            >
              <TrazoActivo tipo={a.tipo} grosor={1.9} />
            </g>

            {e === "caido" && (
              <g className="pointer-events-none" stroke="var(--bermellon)" strokeWidth="0.6">
                <line x1={a.plano.x - 2.4} y1={a.plano.y - 2.4} x2={a.plano.x + 2.4} y2={a.plano.y + 2.4} />
                <line x1={a.plano.x + 2.4} y1={a.plano.y - 2.4} x2={a.plano.x - 2.4} y2={a.plano.y + 2.4} />
              </g>
            )}

            {/* El nombre aparece solo al señalar. Fijo —o incluso solo para los
                activos afectados— las etiquetas se pisan entre sí y con los
                rótulos de zona, y el plano deja de leerse. Qué hay en cada lugar
                ya lo dice la zona; el detalle lo da el panel lateral. */}
            {activoSeleccionado && (
              <g className="pointer-events-none">
                <rect
                  x={a.plano.x - (a.nombre.length * 1.28 + 2) / 2}
                  y={a.plano.y + 4.6}
                  width={a.nombre.length * 1.28 + 2}
                  height="3.6"
                  rx="0.4"
                  fill="var(--papel-alto)"
                  stroke={color}
                  strokeWidth="0.25"
                />
                <text
                  x={a.plano.x}
                  y={a.plano.y + 7}
                  textAnchor="middle"
                  fontSize="2.1"
                  className="mono"
                  fill={color}
                >
                  {a.nombre}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Cota inferior */}
      <g stroke="var(--tinta-tenue)" strokeWidth="0.25">
        <line x1="0" y1={alto + 6} x2={ancho} y2={alto + 6} />
        <line x1="0" y1={alto + 4.6} x2="0" y2={alto + 7.4} />
        <line x1={ancho} y1={alto + 4.6} x2={ancho} y2={alto + 7.4} />
      </g>
      <text
        x={ancho / 2}
        y={alto + 10.5}
        textAnchor="middle"
        fontSize="2.1"
        className="mono"
        fill="var(--tinta-tenue)"
        style={{ letterSpacing: "0.08em" }}
      >
        {cota.toUpperCase()}
      </text>
    </svg>
  );
}
