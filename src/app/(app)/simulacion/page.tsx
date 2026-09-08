import { amenazaPorId, escenarioDemo } from "@/data/empresa-demo";
import { calcular } from "@/domain/calculo";
import { formatearPesos, numero, pesosCompactos, porcentaje } from "@/lib/formato";
import { LeyendaProcedencia, Procedencia } from "@/components/procedencia";
import {
  EncabezadoPanel,
  Metrica,
  Panel,
  TituloPagina,
} from "@/components/ui";

export default function Simulacion() {
  const r = calcular(escenarioDemo);
  const maxAmenaza = Math.max(...r.porAmenaza.map((a) => a.perdidaEsperada));

  // Para el destacado no interesa el activo con más pérdida, sino aquel cuya
  // pérdida la sufren OTROS: es lo que un inventario asegurado no ve.
  const eslabon = [...r.porActivo].sort(
    (a, b) => b.lucroCesantePropagado - a.lucroCesantePropagado,
  )[0];

  return (
    <>
      <TituloPagina
        titulo="Simulación"
        bajada="Qué pasa si los fenómenos de cada sede golpean tus activos. La cifra no es solo el daño físico: incluye lo que dejas de producir mientras reparas, y lo que dejan de producir los activos que dependen del que cayó."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica
          etiqueta="Pérdida esperada al año"
          valor={pesosCompactos(r.perdidaEsperadaAnual)}
          detalle={formatearPesos(r.perdidaEsperadaAnual)}
          acento
          extra={<Procedencia tipo="ilustrativo" />}
        />
        <Metrica
          etiqueta="Activos comprometidos"
          valor={`${r.activosComprometidos} de ${escenarioDemo.activos.length}`}
          detalle="Concentran el 80 % de la pérdida. Son los que hay que atender primero."
        />
        <Metrica
          etiqueta="Daño físico"
          valor={pesosCompactos(r.danioFisicoTotal)}
          detalle={`${porcentaje(
            r.danioFisicoTotal / r.perdidaEsperadaAnual,
          )} del total — reponer lo dañado`}
        />
        <Metrica
          etiqueta="Lucro cesante"
          valor={pesosCompactos(r.lucroCesanteTotal)}
          detalle={`${porcentaje(
            r.lucroCesanteTotal / r.perdidaEsperadaAnual,
          )} del total — lo que dejas de producir`}
        />
      </div>

      <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--acento)_30%,transparent)] bg-[color-mix(in_srgb,var(--acento)_7%,transparent)] p-5">
        <p className="text-sm leading-relaxed">
          <span className="font-medium text-[var(--acento)]">
            Lo que un inventario asegurado no te dice:
          </span>{" "}
          <span className="font-medium">{eslabon.activo.nombre}</span> vale apenas{" "}
          {pesosCompactos(eslabon.activo.valorReposicion)} — de los más baratos de la
          empresa. Pero al caer arrastra{" "}
          <span className="font-medium">
            {eslabon.arrastra.length}{" "}
            {eslabon.arrastra.length === 1 ? "activo" : "activos"}
          </span>{" "}
          que dejan de operar sin haber sufrido un solo golpe, y eso solo cuesta{" "}
          <span className="font-medium text-[var(--acento)]">
            {pesosCompactos(eslabon.lucroCesantePropagado)}
          </span>{" "}
          al año. Es{" "}
          {porcentaje(eslabon.lucroCesantePropagado / eslabon.perdidaEsperada)} de toda
          su pérdida esperada, y ninguna póliza sobre el activo la cubre.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Por amenaza */}
        <Panel className="lg:col-span-1">
          <EncabezadoPanel titulo="Por fenómeno" />
          <div className="space-y-3 p-5">
            {r.porAmenaza.map((a) => {
              const info = amenazaPorId.get(a.amenaza);
              return (
                <div key={a.amenaza}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{info?.simbolo}</span>
                      {info?.nombre}
                    </span>
                    <span className="tabular-nums text-[var(--texto-tenue)]">
                      {pesosCompactos(a.perdidaEsperada)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--fondo-panel-alto)]">
                    <div
                      className="h-full rounded-full bg-[var(--acento)]"
                      style={{
                        width: `${(a.perdidaEsperada / maxAmenaza) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Por sede */}
        <Panel className="lg:col-span-2">
          <EncabezadoPanel
            titulo="Por sede"
            descripcion="La misma empresa, dos exposiciones distintas. Un boletín regional las trataría igual."
          />
          <div className="grid gap-px bg-[var(--borde)] sm:grid-cols-2">
            {r.porSede.map((s) => {
              const sede = escenarioDemo.sedes.find((x) => x.id === s.sedeId)!;
              return (
                <div key={s.sedeId} className="bg-[var(--fondo-panel)] p-5">
                  <p className="font-medium">{sede.nombre}</p>
                  <p className="text-xs text-[var(--texto-tenue)]">
                    {sede.municipio}, {sede.departamento}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--acento)]">
                    {pesosCompactos(s.perdidaEsperada)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--texto-tenue)]">
                    {porcentaje(s.perdidaEsperada / r.perdidaEsperadaAnual)} de la
                    exposición total
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {sede.amenazas.map((p) => (
                      <span
                        key={p.amenaza}
                        title={`${porcentaje(p.probabilidadAnual)} de probabilidad anual`}
                        className="rounded border border-[var(--borde)] bg-[var(--fondo-panel-alto)] px-2 py-0.5 text-[11px] text-[var(--texto-tenue)]"
                      >
                        {amenazaPorId.get(p.amenaza)?.simbolo}{" "}
                        {amenazaPorId.get(p.amenaza)?.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Detalle por activo */}
      <Panel className="mt-4">
        <EncabezadoPanel
          titulo="Detalle por activo"
          descripcion="Cada fila abre su desglose: de qué fenómeno viene la pérdida y cuánto de ella es arrastre de otros activos."
          extra={<Procedencia tipo="ilustrativo" />}
        />
        <div className="divide-y divide-[var(--borde)]">
          {r.porActivo.map((fila) => (
            <details key={fila.activo.id} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-3 hover:bg-[var(--fondo-panel-alto)]">
                <svg
                  viewBox="0 0 12 12"
                  className="h-3 w-3 shrink-0 text-[var(--texto-tenue)] transition group-open:rotate-90"
                  aria-hidden
                >
                  <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{fila.activo.nombre}</p>
                  <p className="text-xs text-[var(--texto-tenue)]">
                    {fila.sede.municipio} · valor{" "}
                    {pesosCompactos(fila.activo.valorReposicion)}
                    {fila.arrastra.length > 0 && (
                      <>
                        {" "}
                        · <span className="text-[var(--acento)]">
                          arrastra {fila.arrastra.length}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="hidden w-40 shrink-0 sm:block">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--fondo-panel-alto)]">
                    <div
                      className="h-full rounded-full bg-[var(--acento)]"
                      style={{
                        width: `${
                          (fila.perdidaEsperada / r.porActivo[0].perdidaEsperada) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <p className="w-28 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {pesosCompactos(fila.perdidaEsperada)}
                </p>
              </summary>

              <div className="bg-[var(--fondo)] px-5 py-4 pl-12">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--texto-tenue)]">
                      <th className="pb-2 font-medium">Fenómeno</th>
                      <th className="pb-2 text-right font-medium">Daño físico</th>
                      <th className="pb-2 text-right font-medium">Lucro cesante</th>
                      <th className="pb-2 text-right font-medium">Arrastre</th>
                      <th className="pb-2 text-right font-medium">Días fuera</th>
                      <th className="pb-2 text-right font-medium">Pérdida esperada</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--texto-tenue)]">
                    {fila.porAmenaza.map((a) => (
                      <tr key={a.amenaza}>
                        <td className="py-1.5 text-[var(--texto)]">
                          {amenazaPorId.get(a.amenaza)?.simbolo}{" "}
                          {amenazaPorId.get(a.amenaza)?.nombre}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">
                          {pesosCompactos(a.danioFisico)}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">
                          {pesosCompactos(a.lucroCesantePropio)}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">
                          {a.lucroCesantePropagado > 0
                            ? pesosCompactos(a.lucroCesantePropagado)
                            : "—"}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">
                          {numero(a.diasFuera, 1)}
                        </td>
                        <td className="py-1.5 text-right font-medium tabular-nums text-[var(--texto)]">
                          {pesosCompactos(a.perdidaEsperada)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="mt-4 max-w-3xl text-xs leading-relaxed text-[var(--texto-tenue)]">
                  <span className="font-medium text-[var(--texto)]">De dónde sale:</span>{" "}
                  valor de reposición {formatearPesos(fila.activo.valorReposicion)} ×
                  severidad del fenómeno × vulnerabilidad del activo, más{" "}
                  {formatearPesos(fila.activo.margenDiario)} por día fuera de servicio
                  {fila.arrastra.length > 0 && (
                    <>
                      , más el margen de{" "}
                      {fila.arrastra
                        .map(
                          (id) =>
                            escenarioDemo.activos.find((a) => a.id === id)?.nombre,
                        )
                        .join(", ")}
                      , que no operan sin este activo
                    </>
                  )}
                  . Todo ponderado por la probabilidad anual del fenómeno en{" "}
                  {fila.sede.municipio}.
                </p>
              </div>
            </details>
          ))}
        </div>
      </Panel>

      <div className="mt-6">
        <LeyendaProcedencia />
      </div>
    </>
  );
}
