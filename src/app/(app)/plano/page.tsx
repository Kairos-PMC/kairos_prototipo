"use client";

import { useMemo, useState } from "react";
import { escenarioDemo } from "@/data/empresa-demo";
import { calcular, descendientes } from "@/domain/calculo";
import { pesosCompactos } from "@/lib/formato";
import { Procedencia } from "@/components/procedencia";
import { EncabezadoPanel, Panel, TituloPagina } from "@/components/ui";
import type { Activo } from "@/domain/tipos";

const iconos: Record<string, string> = {
  invernadero: "🌱",
  "cuarto-frio": "❄️",
  subestacion: "⚡",
  bodega: "📦",
  riego: "💧",
  reservorio: "🛢️",
  via: "🛣️",
  "planta-poscosecha": "🏭",
  flota: "🚚",
  oficina: "🏢",
};

export default function PlanoDeSitio() {
  const [sedeId, setSedeId] = useState(escenarioDemo.sedes[0].id);
  const [caido, setCaido] = useState<string | null>(null);

  const sede = escenarioDemo.sedes.find((s) => s.id === sedeId)!;
  const activos = escenarioDemo.activos.filter((a) => a.sedeId === sedeId);
  const dependencias = escenarioDemo.dependencias.filter((d) => {
    const origen = escenarioDemo.activos.find((a) => a.id === d.origen);
    return origen?.sedeId === sedeId;
  });

  const resultado = useMemo(() => calcular(escenarioDemo), []);

  const arrastrados = useMemo(
    () => (caido ? new Set(descendientes(caido, escenarioDemo.dependencias)) : new Set<string>()),
    [caido],
  );

  const activoCaido = activos.find((a) => a.id === caido);
  const margenPerdido = caido
    ? [...arrastrados, caido].reduce(
        (s, id) =>
          s + (escenarioDemo.activos.find((a) => a.id === id)?.margenDiario ?? 0),
        0,
      )
    : 0;

  const posicion = (a: Activo) => ({ cx: a.plano.x, cy: a.plano.y });

  return (
    <>
      <TituloPagina
        titulo="Plano de sitio"
        bajada="La réplica de tu infraestructura física. Haz clic en cualquier activo para ver qué se cae con él: la mitad del daño de un desastre no lo sufre quien recibe el golpe, sino quien dependía de él."
        extra={
          <div className="flex gap-2">
            {escenarioDemo.sedes.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSedeId(s.id);
                  setCaido(null);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  s.id === sedeId
                    ? "border-[var(--acento)] bg-[color-mix(in_srgb,var(--acento)_15%,transparent)] text-[var(--acento)]"
                    : "border-[var(--borde)] text-[var(--texto-tenue)] hover:border-[var(--texto-tenue)]"
                }`}
              >
                {s.municipio}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Panel>
          <EncabezadoPanel
            titulo={sede.nombre}
            descripcion={sede.descripcion}
            extra={<Procedencia tipo="ilustrativo" />}
          />
          <div className="p-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full touch-none select-none"
              style={{ aspectRatio: "1.35 / 1" }}
              role="img"
              aria-label={`Plano esquemático de ${sede.nombre}`}
            >
              <defs>
                <marker
                  id="flecha"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0L10 5L0 10z" fill="currentColor" />
                </marker>
                <pattern
                  id="rejilla"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M10 0H0v10"
                    fill="none"
                    stroke="var(--borde)"
                    strokeWidth="0.2"
                  />
                </pattern>
              </defs>

              <rect width="100" height="100" fill="url(#rejilla)" />

              {/* Dependencias */}
              {dependencias.map((d) => {
                const origen = activos.find((a) => a.id === d.origen);
                const objetivo = activos.find((a) => a.id === d.objetivo);
                if (!origen || !objetivo) return null;

                const activa =
                  caido !== null &&
                  (d.origen === caido || arrastrados.has(d.origen)) &&
                  arrastrados.has(d.objetivo);

                return (
                  <line
                    key={`${d.origen}-${d.objetivo}`}
                    x1={posicion(origen).cx}
                    y1={posicion(origen).cy}
                    x2={posicion(objetivo).cx}
                    y2={posicion(objetivo).cy}
                    stroke={activa ? "var(--peligro)" : "var(--borde)"}
                    strokeWidth={activa ? 0.7 : 0.4}
                    strokeDasharray={activa ? undefined : "1.5 1.5"}
                    markerEnd="url(#flecha)"
                    color={activa ? "var(--peligro)" : "var(--borde)"}
                    className="transition-all"
                  >
                    <title>{d.nota}</title>
                  </line>
                );
              })}

              {/* Activos */}
              {activos.map((a) => {
                const esCaido = a.id === caido;
                const esArrastrado = arrastrados.has(a.id);
                const p = posicion(a);

                return (
                  <g
                    key={a.id}
                    onClick={() => setCaido(caido === a.id ? null : a.id)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r={6}
                      fill={
                        esCaido
                          ? "var(--peligro)"
                          : esArrastrado
                            ? "color-mix(in srgb, var(--peligro) 30%, var(--fondo-panel-alto))"
                            : "var(--fondo-panel-alto)"
                      }
                      stroke={
                        esCaido || esArrastrado ? "var(--peligro)" : "var(--borde)"
                      }
                      strokeWidth={0.5}
                      className="transition-all"
                    />
                    <text
                      x={p.cx}
                      y={p.cy + 1.6}
                      textAnchor="middle"
                      fontSize="4.5"
                      className="pointer-events-none"
                    >
                      {iconos[a.tipo] ?? "▪"}
                    </text>
                    <text
                      x={p.cx}
                      y={p.cy + 9.5}
                      textAnchor="middle"
                      fontSize="2.6"
                      fill={
                        esCaido || esArrastrado
                          ? "var(--peligro)"
                          : "var(--texto-tenue)"
                      }
                      className="pointer-events-none"
                    >
                      {a.nombre.length > 22 ? `${a.nombre.slice(0, 21)}…` : a.nombre}
                    </text>
                    <title>{a.nombre}</title>
                  </g>
                );
              })}
            </svg>

            <p className="mt-2 text-center text-xs text-[var(--texto-tenue)]">
              {caido
                ? "Clic de nuevo para restablecer."
                : "Clic en un activo para simular su caída."}
            </p>
          </div>
        </Panel>

        {/* Panel lateral */}
        <div className="space-y-4">
          {!activoCaido ? (
            <Panel>
              <EncabezadoPanel titulo="Cadena de dependencias" />
              <ul className="divide-y divide-[var(--borde)] text-sm">
                {dependencias.map((d) => {
                  const o = activos.find((a) => a.id === d.origen);
                  const t = activos.find((a) => a.id === d.objetivo);
                  return (
                    <li key={`${d.origen}-${d.objetivo}`} className="px-5 py-3">
                      <p className="font-medium">
                        {o?.nombre} <span className="text-[var(--texto-tenue)]">→</span>{" "}
                        {t?.nombre}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--texto-tenue)]">
                        {d.nota}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ) : (
            <Panel className="border-[color-mix(in_srgb,var(--peligro)_40%,transparent)]">
              <EncabezadoPanel titulo={`Si cae: ${activoCaido.nombre}`} />
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--texto-tenue)]">
                    Valor del activo
                  </p>
                  <p className="text-xl font-semibold tabular-nums">
                    {pesosCompactos(activoCaido.valorReposicion)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--texto-tenue)]">
                    Deja de operar
                  </p>
                  {arrastrados.size === 0 ? (
                    <p className="mt-1 text-sm text-[var(--texto-tenue)]">
                      Ningún otro activo depende de este.
                    </p>
                  ) : (
                    <ul className="mt-1.5 space-y-1.5">
                      {[...arrastrados].map((id) => {
                        const a = escenarioDemo.activos.find((x) => x.id === id)!;
                        return (
                          <li
                            key={id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="flex items-center gap-2">
                              <span aria-hidden>{iconos[a.tipo]}</span>
                              {a.nombre}
                            </span>
                            <span className="tabular-nums text-[var(--texto-tenue)]">
                              {pesosCompactos(a.valorReposicion)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg bg-[color-mix(in_srgb,var(--peligro)_12%,transparent)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--texto-tenue)]">
                    Margen que se detiene
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--peligro)]">
                    {pesosCompactos(margenPerdido)}
                    <span className="text-sm font-normal text-[var(--texto-tenue)]">
                      {" "}
                      por día
                    </span>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--texto-tenue)]">
                    Repararlo toma unos {activoCaido.diasReparacion} días. Ese es el
                    costo de no tener redundancia.
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--texto-tenue)]">
                    Pérdida esperada al año
                  </p>
                  <p className="text-xl font-semibold tabular-nums text-[var(--acento)]">
                    {pesosCompactos(
                      resultado.porActivo.find((r) => r.activo.id === activoCaido.id)
                        ?.perdidaEsperada ?? 0,
                    )}
                  </p>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
