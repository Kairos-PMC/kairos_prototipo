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
  CabeceraLamina,
  Lamina,
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
        rotulo="Lámina 01"
        titulo="Centro de datos"
        bajada="La información sobre amenazas naturales en Colombia existe y es pública, pero vive dispersa entre entidades y en formatos que nadie consulta a diario. Esta pantalla la reúne en un solo lugar y, sobre todo, la pone al lado de tus sedes."
      />

      {/* Clima por sede */}
      <div className="grid gap-4 lg:grid-cols-2">
        {escenarioDemo.sedes.map((sede, i) => {
          const clima = climas[i];
          return (
            <Lamina key={sede.id}>
              <CabeceraLamina
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
                          className="rounded-lg border border-linea bg-papel p-3"
                        >
                          <p className="text-[11px] font-medium text-tinta-media">
                            {idx === 0
                              ? "Hoy"
                              : new Date(`${d.fecha}T12:00:00`).toLocaleDateString(
                                  "es-CO",
                                  { weekday: "short" },
                                )}
                          </p>
                          <p className="mt-1 text-sm font-semibold mono">
                            {numero(d.lluviaMm, 1)} mm
                          </p>
                          <p className="text-[11px] text-tinta-media">
                            {numero(d.probabilidadLluvia, 0)} % lluvia
                          </p>
                          <p className="mt-1 text-[11px] text-tinta-media">
                            ráfaga {numero(d.rafagaMax, 0)} km/h
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-tinta-media">
                      Pronóstico de Open-Meteo para las coordenadas exactas de la sede.
                      Esto es lo que un boletín regional no puede darte: no dice
                      &ldquo;lluvias en la Sabana&rdquo;, dice cuántos milímetros caen
                      sobre <em>esta</em> finca.
                    </p>
                  </>
                )}
              </div>
            </Lamina>
          );
        })}
      </div>

      {/* Sismos */}
      <Lamina className="mt-4">
        <CabeceraLamina
          titulo="Sismos recientes en Colombia"
          descripcion="Últimos 30 días, magnitud 3.0 o mayor. La columna de la derecha es la que importa: a qué distancia quedó de cada sede."
          extra={<Procedencia tipo={sismos.ok ? "vivo" : "ilustrativo"} />}
        />
        <div className="p-5">
          {!sismos.ok ? (
            <AvisoFalla motivo={sismos.motivo} />
          ) : sismos.datos.length === 0 ? (
            <p className="text-sm text-tinta-media">
              Sin sismos de magnitud 3.0 o mayor en los últimos 30 días.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-linea text-left text-xs uppercase tracking-wide text-tinta-media">
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
                        className="border-b border-linea last:border-0"
                      >
                        <td className="py-2.5">
                          <span
                            className={`inline-flex h-7 min-w-9 items-center justify-center rounded px-1.5 text-sm font-semibold mono ${
                              s.magnitud >= 5
                                ? "bg-[color-mix(in_srgb,var(--bermellon)_12%,transparent)] text-bermellon"
                                : s.magnitud >= 4
                                  ? "bg-[color-mix(in_srgb,var(--ocre)_15%,transparent)] text-ocre"
                                  : "bg-papel text-tinta-media"
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
                            className="hover:text-ocre"
                          >
                            {s.lugar}
                          </a>
                        </td>
                        <td className="py-2.5 pr-4 text-tinta-media">
                          {hace(s.fecha)}
                        </td>
                        <td className="py-2.5 pr-4 mono text-tinta-media">
                          {numero(s.profundidadKm, 0)} km
                        </td>
                        <td className="py-2.5 text-right mono">
                          <span className="text-tinta-media">
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
              <p className="mt-4 text-xs text-tinta-media">
                Fuente: USGS Earthquake Catalog. Se usa en vez del Servicio Geológico
                Colombiano porque el SGC no expone un API pública documentada; la red
                global de USGS cubre el mismo territorio.
              </p>
            </div>
          )}
        </div>
      </Lamina>

      {/* Fuentes institucionales */}
      <Lamina className="mt-4">
        <CabeceraLamina
          titulo="Fuentes institucionales"
          descripcion="Las entidades que producen la información de amenazas en Colombia. Ninguna expone un API consultable, y esa es exactamente la brecha que el producto ataca."
          extra={<Procedencia tipo="referencia" />}
        />
        <div className="grid gap-px bg-linea sm:grid-cols-2">
          {fuentesInstitucionales.map((f) => (
            <article key={f.sigla} className="bg-papel-alto p-5">
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold">{f.sigla}</h3>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-azul hover:underline"
                >
                  sitio oficial ↗
                </a>
              </div>
              <p className="mt-0.5 text-xs text-tinta-media">{f.nombre}</p>
              <p className="mt-3 text-sm leading-relaxed">{f.que}</p>
              <p className="mt-3 border-l-2 border-linea pl-3 text-xs leading-relaxed text-tinta-media">
                <span className="font-medium text-tinta">
                  Por qué no está en vivo:
                </span>{" "}
                {f.porQueNoEstaEnVivo}
              </p>
            </article>
          ))}
        </div>
      </Lamina>

      <div className="mt-6">
        <LeyendaProcedencia />
      </div>
    </>
  );
}

function DatoClima({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-tinta-media">{etiqueta}</p>
      <p className="mt-0.5 text-xl font-semibold mono">{valor}</p>
    </div>
  );
}
