"use client";

import { useMemo, useState } from "react";
import { PRESUPUESTO_INICIAL, amenazaPorId, escenarioDemo } from "@/data/empresa-demo";
import { priorizar } from "@/domain/calculo";
import { formatearPesos, numero, pesosCompactos, porcentaje } from "@/lib/formato";
import { IconoAmenaza } from "@/components/iconos";
import { LeyendaProcedencia, Procedencia } from "@/components/procedencia";
import { CabeceraLamina, Metrica, Lamina, TituloPagina } from "@/components/ui";

const TOPE = escenarioDemo.medidas.reduce((s, m) => s + m.costo, 0);

export default function Priorizador() {
  const [presupuesto, setPresupuesto] = useState(PRESUPUESTO_INICIAL);

  const resultado = useMemo(
    () => priorizar(escenarioDemo, presupuesto),
    [presupuesto],
  );

  const seleccionadas = resultado.medidas.filter((m) => m.seleccionada);
  const descartadas = resultado.medidas.filter((m) => !m.seleccionada);

  return (
    <>
      <TituloPagina
        rotulo="Lámina 04"
        titulo="Priorizador de inversiones"
        bajada="Aquí está la pregunta que el cliente hace de verdad: con la plata que tengo, ¿qué hago primero? La plataforma ordena las medidas por cuánta pérdida evita cada peso invertido."
      />

      {/* Control de presupuesto */}
      <Lamina>
        <div className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <label
                htmlFor="presupuesto"
                className="text-xs font-medium uppercase tracking-wide text-tinta-media"
              >
                Presupuesto disponible
              </label>
              <p className="mt-1 text-3xl font-semibold mono text-ocre">
                {formatearPesos(presupuesto)}
              </p>
            </div>
            <div className="flex gap-2">
              {[300, 800, 1400, 2100].map((m) => (
                <button
                  key={m}
                  onClick={() => setPresupuesto(m * 1_000_000)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    presupuesto === m * 1_000_000
                      ? "border-ocre bg-[color-mix(in_srgb,var(--ocre)_12%,transparent)] text-ocre"
                      : "border-linea text-tinta-media hover:border-tinta-media"
                  }`}
                >
                  ${m} M
                </button>
              ))}
            </div>
          </div>

          <input
            id="presupuesto"
            type="range"
            min={0}
            max={TOPE}
            step={10_000_000}
            value={presupuesto}
            onChange={(e) => setPresupuesto(Number(e.target.value))}
            className="mt-5 w-full accent-ocre"
          />
          <div className="mt-1 flex justify-between text-xs text-tinta-media">
            <span>$ 0</span>
            <span>{pesosCompactos(TOPE)} — todas las medidas</span>
          </div>
        </div>
      </Lamina>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          rotulo="Pérdida esperada hoy"
          valor={pesosCompactos(resultado.perdidaBase)}
          detalle="Sin ninguna medida"
          extra={<Procedencia tipo="ilustrativo" />}
        />
        <Metrica
          rotulo="Pérdida evitada al año"
          valor={pesosCompactos(resultado.perdidaEvitadaTotal)}
          detalle={`${porcentaje(
            resultado.perdidaBase > 0
              ? resultado.perdidaEvitadaTotal / resultado.perdidaBase
              : 0,
          )} de la exposición actual`}
          tono="ocre"
        />
        <Metrica
          rotulo="Inversión requerida"
          valor={pesosCompactos(resultado.inversionTotal)}
          detalle={`${seleccionadas.length} de ${escenarioDemo.medidas.length} medidas · sobran ${pesosCompactos(
            resultado.presupuesto - resultado.inversionTotal,
          )}`}
        />
        <Metrica
          rotulo="Recuperación"
          valor={
            resultado.perdidaEvitadaTotal > 0
              ? `${numero(
                  resultado.inversionTotal / resultado.perdidaEvitadaTotal,
                  1,
                )} años`
              : "—"
          }
          detalle="Tiempo en que el ahorro anual paga la inversión"
        />
      </div>

      {/* Plan de inversión */}
      <Lamina className="mt-4">
        <CabeceraLamina
          titulo="Orden de ejecución recomendado"
          descripcion="Cada medida se evalúa por lo que evita ADEMÁS de las anteriores. Dos medidas que protegen el mismo activo no suman dos veces el mismo ahorro."
        />

        {seleccionadas.length === 0 ? (
          <p className="p-5 text-sm text-tinta-media">
            Con este presupuesto no alcanza ninguna medida. La más barata cuesta{" "}
            {pesosCompactos(Math.min(...escenarioDemo.medidas.map((m) => m.costo)))}.
          </p>
        ) : (
          <ol className="divide-y divide-linea">
            {seleccionadas.map((m) => (
              <li key={m.medida.id} className="flex gap-4 p-5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tinta text-sm font-semibold text-papel">
                  {m.orden}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-medium">{m.medida.nombre}</h3>
                    <p className="text-sm mono text-tinta-media">
                      cuesta{" "}
                      <span className="font-medium text-tinta">
                        {pesosCompactos(m.costo)}
                      </span>
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-tinta-media">
                    {m.medida.descripcion}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <span>
                      <span className="text-tinta-media">Evita al año </span>
                      <span className="font-semibold mono text-verde">
                        {pesosCompactos(m.perdidaEvitada)}
                      </span>
                    </span>
                    <span>
                      <span className="text-tinta-media">Por cada peso </span>
                      <span className="font-semibold mono">
                        ${numero(m.retorno, 2)}
                      </span>
                      <span className="text-tinta-media"> al año</span>
                    </span>
                    <span>
                      <span className="text-tinta-media">Se paga en </span>
                      <span className="font-semibold mono">
                        {numero(m.aniosRetorno, 1)} años
                      </span>
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.medida.amenazas.map((a) => (
                      <span
                        key={a}
                        className="rounded border border-linea bg-papel px-2 py-0.5 text-[11px] text-tinta-media"
                      >
                        <IconoAmenaza id={a} className="h-3.5 w-3.5" /> {amenazaPorId.get(a)?.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Lamina>

      {/* Fuera del presupuesto */}
      {descartadas.length > 0 && (
        <Lamina className="mt-4">
          <CabeceraLamina
            titulo="Fuera del presupuesto"
            descripcion="Evaluadas contra el escenario actual, sin las medidas seleccionadas. Entran si subes el presupuesto."
          />
          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-linea text-left text-xs uppercase tracking-wide text-tinta-media">
                  <th className="pb-2 font-medium">Medida</th>
                  <th className="pb-2 text-right font-medium">Costo</th>
                  <th className="pb-2 text-right font-medium">Evitaría al año</th>
                  <th className="pb-2 text-right font-medium">Por peso</th>
                </tr>
              </thead>
              <tbody>
                {descartadas.map((m) => (
                  <tr
                    key={m.medida.id}
                    className="border-b border-linea last:border-0"
                  >
                    <td className="py-2.5 pr-4">{m.medida.nombre}</td>
                    <td className="py-2.5 text-right mono text-tinta-media">
                      {pesosCompactos(m.costo)}
                    </td>
                    <td className="py-2.5 text-right mono text-tinta-media">
                      {pesosCompactos(m.perdidaEvitada)}
                    </td>
                    <td className="py-2.5 text-right mono">
                      ${numero(m.retorno, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Lamina>
      )}

      <div className="mt-6">
        <LeyendaProcedencia />
      </div>
    </>
  );
}
