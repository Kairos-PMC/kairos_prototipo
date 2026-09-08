"use client";

import { useMemo, useState } from "react";
import { amenazaPorId, escenarioDemo } from "@/data/empresa-demo";
import { calcular, simularCaida } from "@/domain/calculo";
import { descendientes } from "@/domain/calculo";
import { formatearPesos, numero, pesosCompactos, porcentaje } from "@/lib/formato";
import { IconoActivo, IconoAmenaza } from "@/components/iconos";
import { PlanoPlanta } from "@/components/plano-planta";
import { Procedencia } from "@/components/procedencia";
import { Lamina, Rotulo, TituloPagina } from "@/components/ui";

export default function Simulacion() {
  const [sedeId, setSedeId] = useState(escenarioDemo.sedes[0].id);
  const [caidos, setCaidos] = useState<string[]>([]);
  const [sobre, setSobre] = useState<string | null>(null);

  const sede = escenarioDemo.sedes.find((s) => s.id === sedeId)!;
  const activosSede = escenarioDemo.activos.filter((a) => a.sedeId === sedeId);
  const dependenciasSede = escenarioDemo.dependencias.filter(
    (d) => escenarioDemo.activos.find((a) => a.id === d.origen)?.sedeId === sedeId,
  );

  const evento = useMemo(() => simularCaida(escenarioDemo, caidos), [caidos]);
  const anual = useMemo(() => calcular(escenarioDemo), []);

  const setCaidosSet = new Set(evento.caidos);
  const setArrastrados = new Set(evento.arrastrados);

  const alternar = (id: string) =>
    setCaidos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const activoSobre = escenarioDemo.activos.find((a) => a.id === sobre);
  const arrastreDeSobre = activoSobre
    ? descendientes(activoSobre.id, escenarioDemo.dependencias).filter(
        (id) =>
          escenarioDemo.activos.find((a) => a.id === id)?.sedeId ===
          activoSobre.sedeId,
      )
    : [];

  return (
    <>
      <TituloPagina
        rotulo="Lámina 03"
        titulo="Simulación sobre planta"
        bajada="Este es el plano de la sede. Haz clic sobre cualquier instalación para darla por caída: el dibujo marca en rojo lo que recibió el golpe y en ocre lo que deja de operar sin haberlo recibido. Las cifras de arriba se recalculan en el momento."
        extra={
          <div className="flex overflow-hidden rounded border border-linea">
            {escenarioDemo.sedes.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSedeId(s.id);
                  setCaidos([]);
                }}
                className={`mono px-3 py-2 text-xs tracking-wide transition ${
                  s.id === sedeId
                    ? "bg-tinta text-papel"
                    : "bg-papel-alto text-tinta-media hover:bg-papel"
                }`}
              >
                {s.municipio.toUpperCase()}
              </button>
            ))}
          </div>
        }
      />

      {/* Lectura en vivo del evento */}
      <div className="grid gap-px overflow-hidden rounded border border-linea bg-linea sm:grid-cols-2 lg:grid-cols-4">
        <Lectura
          rotulo="Fuera de servicio"
          valor={`${evento.fueraDeServicio.length}`}
          unidad={`de ${activosSede.length + (escenarioDemo.activos.length - activosSede.length)} activos`}
          detalle={
            evento.arrastrados.length > 0
              ? `${evento.arrastrados.length} sin recibir daño`
              : "Ninguno arrastrado"
          }
          alerta={evento.arrastrados.length > 0}
        />
        <Lectura
          rotulo="Operación detenida"
          valor={porcentaje(evento.fraccionOperacion)}
          unidad="del margen diario"
          detalle={`${pesosCompactos(evento.margenDiarioDetenido)} por día`}
          alerta={evento.fraccionOperacion > 0.4}
        />
        <Lectura
          rotulo="Reposición"
          valor={pesosCompactos(evento.danioFisico)}
          unidad="daño físico"
          detalle={
            evento.diasEstimados > 0
              ? `${evento.diasEstimados} días de reparación`
              : "Sin daño físico"
          }
        />
        <Lectura
          rotulo="Costo del evento"
          valor={pesosCompactos(evento.perdidaEvento)}
          unidad="reposición + lucro cesante"
          detalle={
            caidos.length === 0
              ? "Marca una instalación en el plano"
              : formatearPesos(evento.perdidaEvento)
          }
          destacada
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_19rem]">
        {/* El plano */}
        <Lamina className="lamina-esquina">
          <div className="flex items-baseline justify-between border-b border-linea px-5 py-3">
            <div>
              <h2 className="display text-lg">{sede.nombre}</h2>
              <p className="mono mt-0.5 text-xs text-tinta-tenue">
                {sede.municipio}, {sede.departamento}
              </p>
            </div>
            {caidos.length > 0 && (
              <button
                onClick={() => setCaidos([])}
                className="mono rounded border border-linea px-2.5 py-1 text-[11px] uppercase tracking-wide text-tinta-media transition hover:border-tinta-media hover:text-tinta"
              >
                Restablecer
              </button>
            )}
          </div>

          <div className="p-3">
            <PlanoPlanta
              sede={sede}
              activos={activosSede}
              dependencias={dependenciasSede}
              caidos={setCaidosSet}
              arrastrados={setArrastrados}
              seleccionado={sobre}
              onAlternar={alternar}
              onSeleccionar={setSobre}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-linea px-5 py-3">
            <Leyenda color="var(--azul)" texto="En operación" />
            <Leyenda color="var(--bermellon)" texto="Caído — recibió el golpe" />
            <Leyenda color="var(--ocre)" texto="Arrastrado — sin daño, sin operar" />
          </div>
        </Lamina>

        {/* Panel lateral */}
        <div className="space-y-4">
          <Lamina>
            <div className="border-b border-linea px-4 py-3">
              <Rotulo>{activoSobre ? "Instalación" : "Qué hay en la sede"}</Rotulo>
            </div>

            {activoSobre ? (
              <div className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-azul">
                    <IconoActivo tipo={activoSobre.tipo} className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-medium leading-tight">{activoSobre.nombre}</p>
                    <p className="mono mt-1 text-xs text-tinta-tenue">
                      {
                        sede.plano.zonas.find((z) => z.id === activoSobre.zonaId)
                          ?.nombre
                      }
                    </p>
                  </div>
                </div>

                <dl className="space-y-2 text-sm">
                  <Fila
                    termino="Reposición"
                    valor={pesosCompactos(activoSobre.valorReposicion)}
                  />
                  <Fila
                    termino="Aporta al día"
                    valor={
                      activoSobre.margenDiario > 0
                        ? pesosCompactos(activoSobre.margenDiario)
                        : "no produce directo"
                    }
                  />
                  <Fila
                    termino="Reparación"
                    valor={`${activoSobre.diasReparacion} días`}
                  />
                </dl>

                {arrastreDeSobre.length > 0 && (
                  <div className="border-t border-linea pt-3">
                    <Rotulo>Si cae, se detiene</Rotulo>
                    <ul className="mt-2 space-y-1.5">
                      {arrastreDeSobre.map((id) => {
                        const a = escenarioDemo.activos.find((x) => x.id === id)!;
                        return (
                          <li key={id} className="flex items-center gap-2 text-sm">
                            <span className="text-ocre">
                              <IconoActivo tipo={a.tipo} className="h-4 w-4" />
                            </span>
                            {a.nombre}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <p className="mono text-[11px] leading-relaxed text-tinta-tenue">
                  Clic para {caidos.includes(activoSobre.id) ? "restablecer" : "darlo por caído"}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-linea">
                {activosSede.map((a) => (
                  <li
                    key={a.id}
                    onMouseEnter={() => setSobre(a.id)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-papel"
                  >
                    <span
                      className={
                        setCaidosSet.has(a.id)
                          ? "text-bermellon"
                          : setArrastrados.has(a.id)
                            ? "text-ocre"
                            : "text-tinta-tenue"
                      }
                    >
                      <IconoActivo tipo={a.tipo} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{a.nombre}</span>
                    <span className="mono text-xs text-tinta-tenue">
                      {pesosCompactos(a.valorReposicion)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Lamina>

          {evento.arrastrados.length > 0 && (
            <Lamina className="border-bermellon/40 aparece">
              <div className="border-b border-linea px-4 py-3">
                <Rotulo>Efecto en cadena</Rotulo>
              </div>
              <div className="p-4">
                <p className="text-sm leading-relaxed">
                  {evento.arrastrados.length}{" "}
                  {evento.arrastrados.length === 1 ? "instalación" : "instalaciones"} sin
                  un rasguño{" "}
                  {evento.arrastrados.length === 1 ? "quedó" : "quedaron"} fuera de
                  operación. Ninguna póliza sobre el activo caído las cubre.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {evento.arrastrados.map((id) => {
                    const a = escenarioDemo.activos.find((x) => x.id === id)!;
                    return (
                      <li
                        key={id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-ocre">
                            <IconoActivo tipo={a.tipo} className="h-4 w-4" />
                          </span>
                          {a.nombre}
                        </span>
                        <span className="mono text-xs text-tinta-tenue">
                          {pesosCompactos(a.margenDiario)}/día
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Lamina>
          )}
        </div>
      </div>

      {/* Análisis anual */}
      <div className="mt-10">
        <TituloPagina
          rotulo="Lámina 03 · continuación"
          titulo="Exposición anual"
          bajada="El plano de arriba responde qué pasa si algo cae hoy. Esto responde cuánto cuesta, en promedio, un año de operación con estas amenazas."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <Lamina className="p-5">
            <Rotulo>Pérdida esperada al año</Rotulo>
            <p className="display mt-2 text-4xl text-ocre">
              {pesosCompactos(anual.perdidaEsperadaAnual)}
            </p>
            <p className="mono mt-1 text-xs text-tinta-tenue">
              {formatearPesos(anual.perdidaEsperadaAnual)}
            </p>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full border border-linea">
              <div
                className="bg-ocre"
                style={{
                  width: `${(anual.danioFisicoTotal / anual.perdidaEsperadaAnual) * 100}%`,
                }}
              />
              <div className="flex-1 bg-azul" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-tinta-media">
              <span>
                {porcentaje(anual.danioFisicoTotal / anual.perdidaEsperadaAnual)} daño
                físico
              </span>
              <span>
                {porcentaje(anual.lucroCesanteTotal / anual.perdidaEsperadaAnual)} lucro
                cesante
              </span>
            </div>
            <p className="mt-4 border-t border-linea pt-3 text-sm leading-relaxed text-tinta-media">
              {anual.activosComprometidos} de {escenarioDemo.activos.length} activos
              concentran el 80 % de esa pérdida.
            </p>
            <div className="mt-3">
              <Procedencia tipo="ilustrativo" />
            </div>
          </Lamina>

          <Lamina className="lg:col-span-2">
            <div className="border-b border-linea px-5 py-3">
              <Rotulo>Dónde se concentra</Rotulo>
            </div>
            <div className="grid gap-px bg-linea sm:grid-cols-2">
              <div className="bg-papel-alto p-5">
                <Rotulo>Por fenómeno</Rotulo>
                <ul className="mt-3 space-y-2.5">
                  {anual.porAmenaza.map((a) => {
                    const info = amenazaPorId.get(a.amenaza)!;
                    const max = anual.porAmenaza[0].perdidaEsperada;
                    return (
                      <li key={a.amenaza}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2">
                            <span className="text-azul">
                              <IconoAmenaza id={a.amenaza} className="h-4 w-4" />
                            </span>
                            {info.nombre}
                          </span>
                          <span className="mono text-xs text-tinta-media">
                            {pesosCompactos(a.perdidaEsperada)}
                          </span>
                        </div>
                        <div className="mt-1 h-[3px] bg-papel-hundido">
                          <div
                            className="h-full bg-ocre"
                            style={{ width: `${(a.perdidaEsperada / max) * 100}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-papel-alto p-5">
                <Rotulo>Por activo — los cinco primeros</Rotulo>
                <ul className="mt-3 space-y-2.5">
                  {anual.porActivo.slice(0, 5).map((r) => {
                    const max = anual.porActivo[0].perdidaEsperada;
                    return (
                      <li key={r.activo.id}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="text-azul">
                              <IconoActivo tipo={r.activo.tipo} className="h-4 w-4" />
                            </span>
                            <span className="truncate">{r.activo.nombre}</span>
                          </span>
                          <span className="mono shrink-0 text-xs text-tinta-media">
                            {pesosCompactos(r.perdidaEsperada)}
                          </span>
                        </div>
                        <div className="mt-1 h-[3px] bg-papel-hundido">
                          <div
                            className="h-full bg-azul"
                            style={{ width: `${(r.perdidaEsperada / max) * 100}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-tinta-media">
                  El detalle completo, con el desglose por fenómeno de cada activo, está
                  en el reporte.
                </p>
              </div>
            </div>
          </Lamina>
        </div>
      </div>
    </>
  );
}

function Lectura({
  rotulo,
  valor,
  unidad,
  detalle,
  alerta = false,
  destacada = false,
}: {
  rotulo: string;
  valor: string;
  unidad: string;
  detalle: string;
  alerta?: boolean;
  destacada?: boolean;
}) {
  return (
    <div className={`bg-papel-alto p-4 ${destacada ? "bg-tinta text-papel" : ""}`}>
      <p
        className="rotulo"
        style={destacada ? { color: "color-mix(in srgb, var(--papel) 65%, transparent)" } : undefined}
      >
        {rotulo}
      </p>
      <p
        className={`display mt-1.5 text-2xl transition-colors ${
          destacada ? "" : alerta ? "text-bermellon" : ""
        }`}
      >
        {valor}
      </p>
      <p
        className="mono mt-0.5 text-[11px]"
        style={{
          color: destacada
            ? "color-mix(in srgb, var(--papel) 60%, transparent)"
            : "var(--tinta-tenue)",
        }}
      >
        {unidad}
      </p>
      <p
        className="mt-2 text-xs"
        style={{
          color: destacada
            ? "color-mix(in srgb, var(--papel) 75%, transparent)"
            : "var(--tinta-media)",
        }}
      >
        {detalle}
      </p>
    </div>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-tinta-media">
      <span
        className="h-3 w-3 rounded-[2px] border"
        style={{ borderColor: color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
      />
      {texto}
    </span>
  );
}

function Fila({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-linea pb-2 last:border-0">
      <dt className="text-tinta-media">{termino}</dt>
      <dd className="mono text-right">{valor}</dd>
    </div>
  );
}
