import { escenarioDemo } from "@/data/empresa-demo";
import {
  climaEnSede,
  distanciaKm,
  fuentesInstitucionales,
  sismosRecientes,
} from "@/lib/fuentes";
import { hace, numero } from "@/lib/formato";
import { LeyendaProcedencia, Procedencia } from "@/components/procedencia";
import {
  AvisoFalla,
  EncabezadoPanel,
  Panel,
  TituloPagina,
} from "@/components/ui";

export const revalidate = 900;

export default async function CentroDeDatos() {
  const [sismos, ...climas] = await Promise.all([
    sismosRecientes(30, 3.0),
    ...escenarioDemo.sedes.map((s) => climaEnSede(s.lat, s.lon)),
  ]);

  return (
    <>
      <TituloPagina
        titulo="Centro de datos"
        bajada="La información sobre amenazas naturales en Colombia existe y es pública, pero vive dispersa entre entidades y en formatos que nadie consulta a diario. Esta pantalla la reúne en un solo lugar y, sobre todo, la pone al lado de tus sedes."
      />

      {/* Clima por sede */}
      <div className="grid gap-4 lg:grid-cols-2">
        {escenarioDemo.sedes.map((sede, i) => {
          const clima = climas[i];
          return (
            <Panel key={sede.id}>
              <EncabezadoPanel
                titulo={sede.nombre}
                descripcion={`${sede.municipio}, ${sede.departamento}`}
                extra={<Procedencia tipo={clima.ok ? "vivo" : "ilustrativo"} />}
              />
              <div className="p-5">
                {!clima.ok ? (
                  <AvisoFalla motivo={clima.motivo} />
                ) : (
                  <>
                    <div className="flex flex-wrap gap-6">
                      <DatoClima
                        etiqueta="Temperatura"
                        valor={`${numero(clima.datos.temperatura, 1)} °C`}
                      />
                      <DatoClima
                        etiqueta="Lluvia ahora"
                        valor={`${numero(clima.datos.precipitacionAhora, 1)} mm`}
                      />
                      <DatoClima
                        etiqueta="Viento"
                        valor={`${numero(clima.datos.vientoAhora, 0)} km/h`}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {clima.datos.dias.map((d, idx) => (
                        <div
                          key={d.fecha}
                          className="rounded-lg border border-[var(--borde)] bg-[var(--fondo-panel-alto)] p-3"
                        >
                          <p className="text-[11px] font-medium text-[var(--texto-tenue)]">
                            {idx === 0
                              ? "Hoy"
                              : new Date(`${d.fecha}T12:00:00`).toLocaleDateString(
                                  "es-CO",
                                  { weekday: "short" },
                                )}
                          </p>
                          <p className="mt-1 text-sm font-semibold tabular-nums">
                            {numero(d.lluviaMm, 1)} mm
                          </p>
                          <p className="text-[11px] text-[var(--texto-tenue)]">
                            {numero(d.probabilidadLluvia, 0)} % lluvia
                          </p>
                          <p className="mt-1 text-[11px] text-[var(--texto-tenue)]">
                            ráfaga {numero(d.rafagaMax, 0)} km/h
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-[var(--texto-tenue)]">
                      Pronóstico de Open-Meteo para las coordenadas exactas de la sede.
                      Esto es lo que un boletín regional no puede darte: no dice
                      &ldquo;lluvias en la Sabana&rdquo;, dice cuántos milímetros caen
                      sobre <em>esta</em> finca.
                    </p>
                  </>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Sismos */}
      <Panel className="mt-4">
        <EncabezadoPanel
          titulo="Sismos recientes en Colombia"
          descripcion="Últimos 30 días, magnitud 3.0 o mayor. La columna de la derecha es la que importa: a qué distancia quedó de cada sede."
          extra={<Procedencia tipo={sismos.ok ? "vivo" : "ilustrativo"} />}
        />
        <div className="p-5">
          {!sismos.ok ? (
            <AvisoFalla motivo={sismos.motivo} />
          ) : sismos.datos.length === 0 ? (
            <p className="text-sm text-[var(--texto-tenue)]">
              Sin sismos de magnitud 3.0 o mayor en los últimos 30 días.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--borde)] text-left text-xs uppercase tracking-wide text-[var(--texto-tenue)]">
                    <th className="pb-2 font-medium">Magnitud</th>
                    <th className="pb-2 font-medium">Lugar</th>
                    <th className="pb-2 font-medium">Cuándo</th>
                    <th className="pb-2 font-medium">Profundidad</th>
                    <th className="pb-2 text-right font-medium">Sede más cercana</th>
                  </tr>
                </thead>
                <tbody>
                  {sismos.datos.slice(0, 12).map((s) => {
                    const cercana = escenarioDemo.sedes
                      .map((sede) => ({
                        sede,
                        km: distanciaKm(s.lat, s.lon, sede.lat, sede.lon),
                      }))
                      .sort((a, b) => a.km - b.km)[0];

                    return (
                      <tr
                        key={s.id}
                        className="border-b border-[var(--borde)] last:border-0"
                      >
                        <td className="py-2.5">
                          <span
                            className={`inline-flex h-7 min-w-9 items-center justify-center rounded px-1.5 text-sm font-semibold tabular-nums ${
                              s.magnitud >= 5
                                ? "bg-[color-mix(in_srgb,var(--peligro)_22%,transparent)] text-[var(--peligro)]"
                                : s.magnitud >= 4
                                  ? "bg-[color-mix(in_srgb,var(--acento)_22%,transparent)] text-[var(--acento)]"
                                  : "bg-[var(--fondo-panel-alto)] text-[var(--texto-tenue)]"
                            }`}
                          >
                            {s.magnitud.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[var(--acento)]"
                          >
                            {s.lugar}
                          </a>
                        </td>
                        <td className="py-2.5 pr-4 text-[var(--texto-tenue)]">
                          {hace(s.fecha)}
                        </td>
                        <td className="py-2.5 pr-4 tabular-nums text-[var(--texto-tenue)]">
                          {numero(s.profundidadKm, 0)} km
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          <span className="text-[var(--texto-tenue)]">
                            {cercana.sede.municipio}
                          </span>{" "}
                          <span className="font-medium">
                            {numero(cercana.km, 0)} km
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-4 text-xs text-[var(--texto-tenue)]">
                Fuente: USGS Earthquake Catalog. Se usa en vez del Servicio Geológico
                Colombiano porque el SGC no expone un API pública documentada; la red
                global de USGS cubre el mismo territorio.
              </p>
            </div>
          )}
        </div>
      </Panel>

      {/* Fuentes institucionales */}
      <Panel className="mt-4">
        <EncabezadoPanel
          titulo="Fuentes institucionales"
          descripcion="Las entidades que producen la información de amenazas en Colombia. Ninguna expone un API consultable, y esa es exactamente la brecha que el producto ataca."
          extra={<Procedencia tipo="referencia" />}
        />
        <div className="grid gap-px bg-[var(--borde)] sm:grid-cols-2">
          {fuentesInstitucionales.map((f) => (
            <article key={f.sigla} className="bg-[var(--fondo-panel)] p-5">
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold">{f.sigla}</h3>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--info)] hover:underline"
                >
                  sitio oficial ↗
                </a>
              </div>
              <p className="mt-0.5 text-xs text-[var(--texto-tenue)]">{f.nombre}</p>
              <p className="mt-3 text-sm leading-relaxed">{f.que}</p>
              <p className="mt-3 border-l-2 border-[var(--borde)] pl-3 text-xs leading-relaxed text-[var(--texto-tenue)]">
                <span className="font-medium text-[var(--texto)]">
                  Por qué no está en vivo:
                </span>{" "}
                {f.porQueNoEstaEnVivo}
              </p>
            </article>
          ))}
        </div>
      </Panel>

      <div className="mt-6">
        <LeyendaProcedencia />
      </div>
    </>
  );
}

function DatoClima({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--texto-tenue)]">{etiqueta}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums">{valor}</p>
    </div>
  );
}
