import type { ReactNode } from "react";
import { RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/**
 * Validación con clientes.
 *
 * La sección está construida alrededor de una decisión: decir de frente lo que
 * todavía no sabemos. Una entrevista no es una muestra, y un evaluador que
 * pregunte por la disposición a pagar tiene que encontrar la respuesta escrita
 * en vez de un silencio. De ahí la estructura en dos columnas enfrentadas: lo
 * confirmado y lo pendiente ocupan el mismo ancho y el mismo peso visual,
 * porque pesan lo mismo.
 */

/** Lo que la entrevista dejó firme. */
const confirmado = [
  "La hipótesis central se sostuvo. La empresa ya tiene análisis de fenómenos naturales, pero son generales y no aplican a sus regiones de operación.",
  "Cambió el diseño del producto. Apareció la tormenta eléctrica, una amenaza que no teníamos mapeada. Definir el catálogo desde afuera era un error de método.",
  "Por eso el catálogo de fenómenos hoy se configura por sede, y no viene fijo de fábrica.",
];

/** Lo que falta, con el siguiente paso al final para que no quede en queja. */
const pendiente = [
  "Una entrevista no basta. No obtuvimos cifra concreta de pérdida, ni rango de lo que pagarían, ni el nombre de quien aprueba la compra.",
  "Falta cubrir los otros cuatro sectores, que se comportan distinto entre sí.",
  "Siguiente paso, entre 8 y 10 entrevistas, con el foco puesto en obtener esas tres cosas.",
];

/** A quién hay que convencer. Quien sufre el problema no es quien firma. */
const interlocutores = [
  {
    rotulo: "Quien sufre el problema",
    quien: "Responsable de gestión de riesgos, continuidad, operaciones o HSEQ",
    detalle: "Es quien pierde el turno de producción y responde por el activo caído.",
    tono: "bermellon" as const,
  },
  {
    rotulo: "Quien firma la compra",
    quien: "Gerente general o gerente financiero",
    detalle:
      "En empresas grandes pasa además por comité, según el monto de la suscripción.",
    tono: "ocre" as const,
  },
];

export function Validacion() {
  return (
    <Seccion id="validacion" tono="papel">
      <Revelar>
        <RotuloSeccion n="05">Validación con clientes</RotuloSeccion>
        <TituloSeccion
          bajada={
            <>
              Cliente del sector floricultor, agosto de 2026. Lo que confirmó, y lo que
              todavía falta.
            </>
          }
        >
          Una entrevista cambió el producto. Y una no alcanza.
        </TituloSeccion>
      </Revelar>

      {/* La cita va antes de las columnas porque es la causa de todo lo que
          viene después: sin ella, el catálogo de fenómenos seguiría fijo. */}
      <Revelar retraso={120}>
        <figure className="mt-14 max-w-3xl border-l-2 border-bermellon pl-6 sm:pl-8">
          <blockquote className="display text-[1.4rem] leading-[1.45] sm:text-[1.6rem]">
            La empresa ya maneja análisis detallados de fenómenos naturales. El problema
            es que son generales y no aplican a las regiones donde opera.
          </blockquote>
          <figcaption className="rotulo mt-5">
            Entrevista de validación · sector floricultor · ago 2026
          </figcaption>
        </figure>
      </Revelar>

      {/* Dos columnas enfrentadas dentro de una sola lámina: la línea del medio
          es lo que hace legible que se trata de un balance y no de dos listas
          sueltas. En móvil la línea pasa a ser horizontal. */}
      <Revelar retraso={200}>
        <div className="lamina mt-14 grid rounded md:grid-cols-2">
          <Columna
            sello="Confirmado"
            tono="verde"
            titulo="Lo que la validación confirmó"
            items={confirmado}
          />
          <Columna
            sello="Pendiente"
            tono="ocre"
            titulo="Lo que todavía no alcanza"
            items={pendiente}
            className="border-t border-linea md:border-l md:border-t-0"
          />
        </div>
      </Revelar>

      {/* Hallazgo fino de la investigación, y la razón de que el producto tenga
          que hablarle a dos personas distintas con argumentos distintos. */}
      <Revelar retraso={280}>
        <div className="mt-14 max-w-3xl">
          <p className="rotulo">A quién hay que convencer</p>
          <h3 className="display mt-3 text-[1.35rem] leading-snug">
            Quien sufre el problema no es quien firma.
          </h3>

          <dl className="lamina mt-6 rounded">
            {interlocutores.map((fila, i) => (
              <div
                key={fila.rotulo}
                className={`grid gap-1 p-5 sm:grid-cols-[13rem_1fr] sm:gap-6 sm:p-6 ${
                  i > 0 ? "border-t border-linea-fina" : ""
                }`}
              >
                <dt className="rotulo flex items-center gap-2.5 pt-0.5">
                  <span
                    aria-hidden
                    className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                      fila.tono === "bermellon" ? "bg-bermellon" : "bg-ocre"
                    }`}
                  />
                  {fila.rotulo}
                </dt>
                <dd>
                  <p className="text-[15px] leading-snug">{fila.quien}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-tinta-media">
                    {fila.detalle}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Revelar>
    </Seccion>
  );
}

/** Una de las dos columnas del balance, con su sello en la esquina. */
function Columna({
  sello,
  tono,
  titulo,
  items,
  className = "",
}: {
  sello: string;
  tono: "verde" | "ocre";
  titulo: string;
  items: string[];
  className?: string;
}) {
  const color = tono === "verde" ? "text-verde" : "text-ocre";
  const borde = tono === "verde" ? "border-verde" : "border-ocre";

  return (
    <div className={`p-7 sm:p-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="display max-w-[14rem] text-[1.15rem] leading-snug">{titulo}</h3>
        {/* Sello de tinta, ligeramente torcido como uno puesto a mano. */}
        <span
          className={`mono shrink-0 -rotate-3 border-2 px-2.5 py-1 text-[10px] uppercase leading-none tracking-[0.14em] opacity-85 ${color} ${borde}`}
        >
          {sello}
        </span>
      </div>

      <ul className="mt-7 space-y-5">
        {items.map((texto) => (
          <li key={texto} className="flex gap-3.5">
            <Marca tono={tono} />
            <p className="text-[14.5px] leading-relaxed text-tinta-media">{texto}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Viñeta con forma, no con punto: el visto cerrado marca lo resuelto y el
 * cuadro abierto marca lo que falta por llenar.
 */
function Marca({ tono }: { tono: "verde" | "ocre" }): ReactNode {
  if (tono === "verde") {
    return (
      <svg viewBox="0 0 14 14" className="mt-[5px] h-3.5 w-3.5 shrink-0 text-verde" aria-hidden>
        <path
          d="M2 7.5l3.2 3.2L12 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 14 14" className="mt-[5px] h-3.5 w-3.5 shrink-0 text-ocre" aria-hidden>
      <rect
        x="2.2"
        y="2.2"
        width="9.6"
        height="9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
