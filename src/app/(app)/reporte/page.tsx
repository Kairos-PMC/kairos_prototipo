import { PRESUPUESTO_INICIAL, amenazaPorId, escenarioDemo } from "@/data/empresa-demo";
import { calcular, priorizar } from "@/domain/calculo";
import { formatearPesos, numero, pesosCompactos, porcentaje } from "@/lib/formato";
import { IconoAmenaza } from "@/components/iconos";
import { Procedencia } from "@/components/procedencia";
import { CabeceraLamina, Lamina, TituloPagina } from "@/components/ui";

export default function Reporte() {
  const r = calcular(escenarioDemo);
  const plan = priorizar(escenarioDemo, PRESUPUESTO_INICIAL);
  const seleccionadas = plan.medidas.filter((m) => m.seleccionada);
  const hoy = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <TituloPagina
        rotulo="Lámina 05"
        titulo="Reporte"
        bajada="El documento que se lleva al comité. Todo lo que sustenta cada cifra está aquí — porque la pregunta que decide la inversión no es cuánto perdería, sino de dónde salió ese número."
        extra={
          <p className="text-sm text-tinta-media">
            Generado el {hoy}
          </p>
        }
      />

      {/* Resumen ejecutivo */}
      <Lamina>
        <CabeceraLamina
          titulo="Resumen ejecutivo"
          descripcion={`${escenarioDemo.empresa.nombre} · ${escenarioDemo.empresa.sector}`}
          extra={<Procedencia tipo="ilustrativo" />}
        />
        <div className="space-y-4 p-5 text-sm leading-relaxed">
          <p>
            La operación está expuesta a{" "}
            <strong>{new Set(escenarioDemo.sedes.flatMap((s) => s.amenazas.map((a) => a.amenaza))).size} fenómenos naturales</strong>{" "}
            distribuidos en {escenarioDemo.sedes.length} sedes, sobre{" "}
            {escenarioDemo.activos.length} activos con un valor de reposición conjunto de{" "}
            <strong>
              {pesosCompactos(
                escenarioDemo.activos.reduce((s, a) => s + a.valorReposicion, 0),
              )}
            </strong>
            .
          </p>
          <p>
            La pérdida esperada es de{" "}
            <strong className="text-ocre">
              {formatearPesos(r.perdidaEsperadaAnual)} al año
            </strong>
            . De esa cifra, {porcentaje(r.danioFisicoTotal / r.perdidaEsperadaAnual)}{" "}
            corresponde a reponer lo dañado y{" "}
            {porcentaje(r.lucroCesanteTotal / r.perdidaEsperadaAnual)} a lo que se deja
            de producir mientras se repara —{" "}
            <strong>incluyendo activos que no sufren daño alguno</strong> pero dejan de
            operar porque dependen de otro que sí cayó.
          </p>
          <p>
            {r.activosComprometidos} de los {escenarioDemo.activos.length} activos
            concentran el 80 % de esa pérdida. Con un presupuesto de{" "}
            {formatearPesos(plan.presupuesto)} se pueden ejecutar{" "}
            {seleccionadas.length} medidas que evitan{" "}
            <strong className="text-verde">
              {formatearPesos(plan.perdidaEvitadaTotal)} al año
            </strong>
            , recuperando la inversión en{" "}
            {numero(plan.inversionTotal / plan.perdidaEvitadaTotal, 1)} años.
          </p>
        </div>
      </Lamina>

      {/* Plan recomendado */}
      <Lamina className="mt-4">
        <CabeceraLamina titulo="Plan de inversión recomendado" />
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-linea text-left text-xs uppercase tracking-wide text-tinta-media">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Medida</th>
                <th className="pb-2 text-right font-medium">Inversión</th>
                <th className="pb-2 text-right font-medium">Evita al año</th>
                <th className="pb-2 text-right font-medium">Se paga en</th>
              </tr>
            </thead>
            <tbody>
              {seleccionadas.map((m) => (
                <tr
                  key={m.medida.id}
                  className="border-b border-linea last:border-0"
                >
                  <td className="py-2.5 pr-3 mono text-tinta-media">
                    {m.orden}
                  </td>
                  <td className="py-2.5 pr-4">{m.medida.nombre}</td>
                  <td className="py-2.5 text-right mono">
                    {pesosCompactos(m.costo)}
                  </td>
                  <td className="py-2.5 text-right mono text-verde">
                    {pesosCompactos(m.perdidaEvitada)}
                  </td>
                  <td className="py-2.5 text-right mono">
                    {numero(m.aniosRetorno, 1)} años
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td />
                <td className="py-2.5">Total</td>
                <td className="py-2.5 text-right mono">
                  {pesosCompactos(plan.inversionTotal)}
                </td>
                <td className="py-2.5 text-right mono text-verde">
                  {pesosCompactos(plan.perdidaEvitadaTotal)}
                </td>
                <td className="py-2.5 text-right mono">
                  {numero(plan.inversionTotal / plan.perdidaEvitadaTotal, 1)} años
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Lamina>

      {/* Supuestos */}
      <Lamina className="mt-4">
        <CabeceraLamina
          titulo="Supuestos y fuentes"
          descripcion="Cada probabilidad y severidad usada en el cálculo, con su procedencia. Si un supuesto no te convence, cámbialo: la cifra se mueve con él."
        />
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-linea text-left text-xs uppercase tracking-wide text-tinta-media">
                <th className="pb-2 font-medium">Sede</th>
                <th className="pb-2 font-medium">Fenómeno</th>
                <th className="pb-2 text-right font-medium">Prob. anual</th>
                <th className="pb-2 text-right font-medium">Severidad</th>
                <th className="pb-2 pl-4 font-medium">Procedencia</th>
              </tr>
            </thead>
            <tbody>
              {escenarioDemo.sedes.flatMap((sede) =>
                sede.amenazas.map((p) => (
                  <tr
                    key={`${sede.id}-${p.amenaza}`}
                    className="border-b border-linea align-top last:border-0"
                  >
                    <td className="py-2.5 pr-4 text-tinta-media">
                      {sede.municipio}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-1.5"><IconoAmenaza id={p.amenaza} className="h-3.5 w-3.5 text-azul" />{amenazaPorId.get(p.amenaza)?.nombre}</span>
                    </td>
                    <td className="py-2.5 text-right mono">
                      {porcentaje(p.probabilidadAnual)}
                    </td>
                    <td className="py-2.5 text-right mono">
                      {porcentaje(p.severidad)}
                    </td>
                    <td className="max-w-md py-2.5 pl-4">
                      <Procedencia tipo={p.procedencia} />
                      <p className="mt-1 text-xs leading-relaxed text-tinta-media">
                        {p.fuente}
                      </p>
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </Lamina>

      {/* Metodología */}
      <Lamina className="mt-4">
        <CabeceraLamina titulo="Cómo se calculó" />
        <div className="space-y-4 p-5 text-sm leading-relaxed">
          <pre className="overflow-x-auto rounded-lg border border-linea bg-papel-hundido p-4 font-mono text-xs text-tinta-media">
{`daño físico       = valor de reposición × severidad × vulnerabilidad
días fuera        = días de reparación × severidad × vulnerabilidad
lucro cesante     = (margen propio + margen de lo que depende) × días fuera
pérdida esperada  = probabilidad anual × (daño físico + lucro cesante)`}
          </pre>
          <p>
            El priorizador recorre las medidas eligiendo, en cada ronda, la de mayor
            pérdida evitada por peso invertido —{" "}
            <strong>recalculando después de cada elección</strong>. Sin ese recálculo,
            dos medidas que protegen el mismo activo sumarían dos veces el mismo ahorro
            y el plan quedaría sobreestimado.
          </p>
        </div>
      </Lamina>

      {/* Límites */}
      <Lamina className="mt-4 border-[color-mix(in_srgb,var(--ocre)_45%,transparent)]">
        <CabeceraLamina titulo="Límites de este análisis" />
        <ul className="space-y-3 p-5 text-sm leading-relaxed text-tinta-media">
          <li>
            <strong className="text-tinta">
              Kairos informa decisiones, no las garantiza.
            </strong>{" "}
            El análisis estima pérdidas esperadas bajo supuestos declarados. No predice
            si un evento va a ocurrir, ni cuándo. Ningún fenómeno natural es predecible
            con la precisión que eso exigiría.
          </li>
          <li>
            <strong className="text-tinta">
              El resultado es un promedio, no un escenario.
            </strong>{" "}
            La pérdida esperada anual no dice cuánto se pierde en el peor año. Un
            análisis para decisiones reales necesita también la distribución de la
            pérdida, no solo su valor central.
          </li>
          <li>
            <strong className="text-tinta">
              Las cifras de esta demostración son ilustrativas.
            </strong>{" "}
            Las probabilidades y severidades no provienen de series históricas. Para un
            uso real habría que calibrarlas contra los registros de la UNGRD, DesInventar
            y las estaciones del IDEAM cercanas a cada sede.
          </li>
        </ul>
      </Lamina>
    </>
  );
}
