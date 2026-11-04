import type { ReactNode } from "react";
import { RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/**
 * Sección 05. Validación con clientes.
 *
 * La sección está construida alrededor de una decisión: decir de frente lo que
 * todavía no sabemos. Una entrevista no es una muestra, y un evaluador que
 * pregunte por la disposición a pagar tiene que encontrar la respuesta escrita
 * en vez de un silencio. De ahí las dos tarjetas enfrentadas: lo confirmado y
 * lo pendiente ocupan el mismo ancho y el mismo peso visual, porque pesan lo
 * mismo.
 *
 * Antes el balance vivía dentro de una sola lámina partida por una línea fina,
 * y la procedencia de la cita era un pie en minúscula. Las dos cosas hacían que
 * la evidencia de campo se leyera como un anexo. Ahora cada mitad es una pieza
 * con elevación propia y la procedencia es una insignia, que es como se ve algo
 * verificado.
 *
 * Sobre el color: acá verde marca lo que ya quedó firme y ocre lo que sigue
 * abierto. Es la misma pendiente de riesgo que los dos colores llevan en el
 * resto del sitio, y en ningún caso están puestos para adornar.
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

/** La procedencia de la cita, partida en insignias para que se lea de un golpe. */
const procedencia = ["Entrevista de validación", "Sector floricultor", "Ago 2026"];

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

      {/* La cita va antes del balance porque es la causa de todo lo que viene
          después: sin ella, el catálogo de fenómenos seguiría fijo. El filete
          bermellón es correcto acá, porque lo que la cita describe es la falla
          que el producto va a atacar. */}
      <Revelar retraso={120}>
        {/* La sombra va en `style` porque `.lamina` declara su `box-shadow` en
            globals.css fuera de las capas y le gana a `shadow-*`, que vive en
            `@layer utilities`. El filete sí funciona como clase, porque nace en
            la misma capa que `.lamina` y se declara después. */}
        <figure
          className="lamina filete mt-14 max-w-4xl rounded-lg p-8 sm:p-11"
          style={{ boxShadow: "var(--sombra-alta)" }}
        >
          <blockquote className="display text-[1.55rem] leading-[1.32] sm:text-[2rem] sm:leading-[1.3]">
            La empresa ya maneja análisis detallados de fenómenos naturales. El problema
            es que son generales y no aplican a las regiones donde opera.
          </blockquote>
          <figcaption className="mt-8 flex flex-wrap gap-2.5 border-t border-linea-fina pt-7">
            {procedencia.map((dato) => (
              <span key={dato} className="pildora pildora-papel">
                {dato}
              </span>
            ))}
          </figcaption>
        </figure>
      </Revelar>

      {/* El balance. Dos tarjetas del mismo tamaño y con la misma elevación:
          es lo que hace legible que se trata de un balance y no de una lista
          buena con una advertencia al final. */}
      <Revelar retraso={200}>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
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
          />
        </div>
      </Revelar>

      {/* Hallazgo fino de la investigación, y la razón de que el producto tenga
          que hablarle a dos personas distintas con argumentos distintos. */}
      <Revelar retraso={280}>
        <div className="mt-20">
          <p className="rotulo">A quién hay que convencer</p>
          <h3 className="display mt-4 max-w-2xl text-[1.7rem] leading-snug sm:text-[2.1rem]">
            Quien sufre el problema no es quien firma.
          </h3>

          <dl className="mt-8 grid gap-6 md:grid-cols-2">
            {interlocutores.map((fila) => (
              <div
                key={fila.rotulo}
                className="lamina lamina-viva rounded-lg p-7 sm:p-8"
              >
                <dt>
                  <span className="pildora pildora-papel">
                    <span
                      aria-hidden
                      className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                        fila.tono === "bermellon" ? "bg-bermellon" : "bg-ocre"
                      }`}
                    />
                    {fila.rotulo}
                  </span>
                </dt>
                <dd>
                  <p className="display mt-6 text-[1.25rem] leading-snug sm:text-[1.35rem]">
                    {fila.quien}
                  </p>
                  <p className="mt-3.5 text-[14.5px] leading-relaxed text-tinta-media">
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

/** Una de las dos mitades del balance. */
function Columna({
  sello,
  tono,
  titulo,
  items,
}: {
  sello: string;
  tono: "verde" | "ocre";
  titulo: string;
  items: string[];
}) {
  const punto = tono === "verde" ? "bg-verde" : "bg-ocre";

  return (
    <div className="lamina lamina-viva flex flex-col rounded-lg p-8 sm:p-9">
      {/* El sello era un cuño torcido con borde de 2px. Leía como el visto
          bueno de un borrador, justo lo contrario de lo que la sección quiere
          decir. La píldora dice lo mismo sin disfrazarse de sello de caucho. */}
      <span className="pildora pildora-papel self-start">
        <span aria-hidden className={`inline-block h-2 w-2 shrink-0 rounded-full ${punto}`} />
        {sello}
      </span>

      <h3 className="display mt-6 text-[1.5rem] leading-snug sm:text-[1.7rem]">{titulo}</h3>

      <ul className="mt-8 space-y-6">
        {items.map((texto) => (
          <li key={texto} className="flex gap-4">
            <Marca tono={tono} />
            <p className="text-[15px] leading-relaxed text-tinta-media">{texto}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Viñeta con forma, no con punto: el visto cerrado marca lo resuelto y el
 * cuadro abierto marca lo que falta por llenar. La forma hace el trabajo sola,
 * así que la lista sigue siendo legible sin distinguir los dos colores.
 */
function Marca({ tono }: { tono: "verde" | "ocre" }): ReactNode {
  if (tono === "verde") {
    return (
      <svg viewBox="0 0 14 14" className="mt-[5px] h-4 w-4 shrink-0 text-verde" aria-hidden>
        <path
          d="M2 7.5l3.2 3.2L12 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 14 14" className="mt-[5px] h-4 w-4 shrink-0 text-ocre" aria-hidden>
      <rect
        x="2.2"
        y="2.2"
        width="9.6"
        height="9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
