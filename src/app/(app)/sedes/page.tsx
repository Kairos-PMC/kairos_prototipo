import { amenazaPorId, escenarioDemo } from "@/data/empresa-demo";
import { calcular } from "@/domain/calculo";
import { pesosCompactos, porcentaje } from "@/lib/formato";
import { IconoAmenaza } from "@/components/iconos";
import { LeyendaProcedencia, Procedencia } from "@/components/procedencia";
import { CabeceraLamina, Lamina, TituloPagina } from "@/components/ui";
import { CroquisSedes } from "@/components/croquis-sedes";

export default function Sedes() {
  const resultado = calcular(escenarioDemo);
  const maxExposicion = Math.max(...resultado.porSede.map((s) => s.perdidaEsperada));

  return (
    <>
      <TituloPagina
        rotulo="Lámina 02"
        titulo="Sedes y amenazas"
        bajada="El catálogo de fenómenos no es una lista fija que traemos de fábrica: se configura por sede. Esto salió de la validación en campo — un floricultor nos señaló la tormenta eléctrica, que no estaba en nuestro planteamiento original."
      />

      <Lamina className="mb-4">
        <CabeceraLamina
          titulo="Dónde está tu exposición"
          descripcion="El tamaño de la marca es la pérdida esperada de cada sede. Dos sedes a menos de 20 km, con exposiciones que no se parecen."
        />
        <div className="p-4">
          <CroquisSedes
            puntos={escenarioDemo.sedes.map((s) => {
              const exp =
                resultado.porSede.find((x) => x.sedeId === s.id)?.perdidaEsperada ?? 0;
              return {
                sede: s,
                detalle: `${pesosCompactos(exp)} al año`,
                peso: maxExposicion > 0 ? exp / maxExposicion : 0,
              };
            })}
          />
        </div>
      </Lamina>

      <div className="space-y-4">
        {escenarioDemo.sedes.map((sede) => {
          const activos = escenarioDemo.activos.filter((a) => a.sedeId === sede.id);
          const exposicion =
            resultado.porSede.find((s) => s.sedeId === sede.id)?.perdidaEsperada ?? 0;
          const valorTotal = activos.reduce((s, a) => s + a.valorReposicion, 0);

          return (
            <Lamina key={sede.id}>
              <CabeceraLamina
                titulo={sede.nombre}
                descripcion={`${sede.municipio}, ${sede.departamento} · ${sede.lat.toFixed(4)}, ${sede.lon.toFixed(4)}`}
                extra={
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-tinta-media">
                      Pérdida esperada
                    </p>
                    <p className="text-xl font-semibold mono text-ocre">
                      {pesosCompactos(exposicion)}
                    </p>
                  </div>
                }
              />

              <div className="grid gap-px bg-linea sm:grid-cols-3">
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
                        className="rounded-lg border border-linea bg-papel p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 shrink-0 text-azul">
                              <IconoAmenaza id={perfil.amenaza} className="h-6 w-6" />
                            </span>
                            <div>
                              <p className="font-medium">{info?.nombre}</p>
                              <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-tinta-media">
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

                        <p className="mt-3 border-l-2 border-linea pl-3 text-xs leading-relaxed text-tinta-media">
                          {perfil.fuente}
                          {perfil.fuenteUrl && (
                            <>
                              {" "}
                              <a
                                href={perfil.fuenteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-azul hover:underline"
                              >
                                ver fuente ↗
                              </a>
                            </>
                          )}
                          {perfil.nota && (
                            <>
                              <br />
                              <span className="text-ocre">{perfil.nota}</span>
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Lamina>
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
    <div className="bg-papel-alto px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-tinta-media">
        {etiqueta}
      </p>
      <p className="mt-1 text-lg font-semibold mono">{valor}</p>
      {detalle && (
        <p className="mt-0.5 text-[11px] leading-snug text-tinta-media">
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
        <span className="text-tinta-media">{etiqueta}</span>
        <span className="font-medium mono">{porcentaje(fraccion)}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-papel-hundido">
        <div
          className="h-full rounded-full bg-ocre"
          style={{ width: `${fraccion * 100}%` }}
        />
      </div>
    </div>
  );
}
