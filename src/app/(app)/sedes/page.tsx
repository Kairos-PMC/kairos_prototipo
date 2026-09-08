import { amenazaPorId, escenarioDemo } from "@/data/empresa-demo";
import { calcular } from "@/domain/calculo";
import { pesosCompactos, porcentaje } from "@/lib/formato";
import { LeyendaProcedencia, Procedencia } from "@/components/procedencia";
import { EncabezadoPanel, Panel, TituloPagina } from "@/components/ui";
import { MapaSedes } from "@/components/mapa-sedes";

export default function Sedes() {
  const resultado = calcular(escenarioDemo);
  const maxExposicion = Math.max(...resultado.porSede.map((s) => s.perdidaEsperada));

  return (
    <>
      <TituloPagina
        titulo="Sedes y amenazas"
        bajada="El catálogo de fenómenos no es una lista fija que traemos de fábrica: se configura por sede. Esto salió de la validación en campo — un floricultor nos señaló la tormenta eléctrica, que no estaba en nuestro planteamiento original."
      />

      <Panel className="mb-4">
        <EncabezadoPanel
          titulo="Dónde está tu exposición"
          descripcion="El tamaño del punto es la pérdida esperada de cada sede. Dos sedes a 20 km de distancia, con exposiciones que no se parecen."
        />
        <div className="p-4">
          <MapaSedes
            puntos={escenarioDemo.sedes.map((s) => {
              const exp =
                resultado.porSede.find((x) => x.sedeId === s.id)?.perdidaEsperada ?? 0;
              return {
                id: s.id,
                nombre: s.nombre,
                detalle: `${s.municipio} · ${pesosCompactos(exp)} al año`,
                lat: s.lat,
                lon: s.lon,
                peso: maxExposicion > 0 ? exp / maxExposicion : 0,
              };
            })}
          />
        </div>
      </Panel>

      <div className="space-y-4">
        {escenarioDemo.sedes.map((sede) => {
          const activos = escenarioDemo.activos.filter((a) => a.sedeId === sede.id);
          const exposicion =
            resultado.porSede.find((s) => s.sedeId === sede.id)?.perdidaEsperada ?? 0;
          const valorTotal = activos.reduce((s, a) => s + a.valorReposicion, 0);

          return (
            <Panel key={sede.id}>
              <EncabezadoPanel
                titulo={sede.nombre}
                descripcion={`${sede.municipio}, ${sede.departamento} · ${sede.lat.toFixed(4)}, ${sede.lon.toFixed(4)}`}
                extra={
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-[var(--texto-tenue)]">
                      Pérdida esperada
                    </p>
                    <p className="text-xl font-semibold tabular-nums text-[var(--acento)]">
                      {pesosCompactos(exposicion)}
                    </p>
                  </div>
                }
              />

              <div className="grid gap-px bg-[var(--borde)] sm:grid-cols-3">
                <Dato etiqueta="Activos" valor={`${activos.length}`} />
                <Dato
                  etiqueta="Valor asegurable"
                  valor={pesosCompactos(valorTotal)}
                />
                <Dato
                  etiqueta="Exposición sobre valor"
                  valor={porcentaje(exposicion / valorTotal, 1)}
                  detalle="Cuánto del valor total se pierde, en promedio, cada año"
                />
              </div>

              <div className="p-5">
                <h3 className="text-sm font-medium">Fenómenos configurados</h3>
                <div className="mt-3 space-y-3">
                  {sede.amenazas.map((perfil) => {
                    const info = amenazaPorId.get(perfil.amenaza);
                    return (
                      <div
                        key={perfil.amenaza}
                        className="rounded-lg border border-[var(--borde)] bg-[var(--fondo-panel-alto)] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="text-xl" aria-hidden>
                              {info?.simbolo}
                            </span>
                            <div>
                              <p className="font-medium">{info?.nombre}</p>
                              <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-[var(--texto-tenue)]">
                                {info?.descripcion}
                              </p>
                            </div>
                          </div>
                          <Procedencia tipo={perfil.procedencia} />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-6">
                          <Barra
                            etiqueta="Probabilidad anual"
                            fraccion={perfil.probabilidadAnual}
                          />
                          <Barra
                            etiqueta="Severidad típica"
                            fraccion={perfil.severidad}
                          />
                        </div>

                        <p className="mt-3 border-l-2 border-[var(--borde)] pl-3 text-xs leading-relaxed text-[var(--texto-tenue)]">
                          {perfil.fuente}
                          {perfil.fuenteUrl && (
                            <>
                              {" "}
                              <a
                                href={perfil.fuenteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[var(--info)] hover:underline"
                              >
                                ver fuente ↗
                              </a>
                            </>
                          )}
                          {perfil.nota && (
                            <>
                              <br />
                              <span className="text-[var(--acento)]">{perfil.nota}</span>
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="mt-6">
        <LeyendaProcedencia />
      </div>
    </>
  );
}

function Dato({
  etiqueta,
  valor,
  detalle,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
}) {
  return (
    <div className="bg-[var(--fondo-panel)] px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-[var(--texto-tenue)]">
        {etiqueta}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{valor}</p>
      {detalle && (
        <p className="mt-0.5 text-[11px] leading-snug text-[var(--texto-tenue)]">
          {detalle}
        </p>
      )}
    </div>
  );
}

function Barra({ etiqueta, fraccion }: { etiqueta: string; fraccion: number }) {
  return (
    <div className="min-w-40 flex-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-[var(--texto-tenue)]">{etiqueta}</span>
        <span className="font-medium tabular-nums">{porcentaje(fraccion)}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--fondo)]">
        <div
          className="h-full rounded-full bg-[var(--acento)]"
          style={{ width: `${fraccion * 100}%` }}
        />
      </div>
    </div>
  );
}
