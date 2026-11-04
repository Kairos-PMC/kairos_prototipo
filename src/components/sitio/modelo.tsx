import { Cifra, Nota, RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/**
 * Modelo de negocio.
 *
 * El precio no es plano porque el costo no es plano: modelar un punto es una
 * coordenada, modelar un complejo es un grafo de dependencias y modelar un
 * campo es un polígono con series climáticas encima. La tabla es el centro de
 * la sección y está hecha con <table> de verdad, porque es una tabla de
 * tarifas y así se lee, se copia y se navega con lector de pantalla.
 */

type Tramo = {
  /** Precio anual en USD, ya formateado para mostrarse tal cual. */
  precio: string;
  /** El límite que define el tramo: activos o hectáreas. */
  alcance: string;
};

type TipoDeSede = {
  nombre: string;
  ejemplos: string;
  modelado: string;
  /** Color del rol: cada tipo de sede se dibuja distinto en el plano. */
  /** Símbolo del tipo de sede. Es forma y no color, porque en este sistema
   *  cada color ya tiene un rol y ninguno significa "tipo de sede". */
  forma: "punto" | "complejo" | "campo";
  tramos: [Tramo, Tramo, Tramo];
};

const tipos: TipoDeSede[] = [
  {
    nombre: "Punto",
    ejemplos: "bodega, oficina, planta pequeña",
    modelado: "una coordenada",
    forma: "punto",
    tramos: [
      { precio: "$2.400", alcance: "hasta 10 activos" },
      { precio: "$3.600", alcance: "de 11 a 25" },
      { precio: "$5.400", alcance: "de 26 a 50" },
    ],
  },
  {
    nombre: "Complejo",
    ejemplos: "planta, poscosecha, puerto, mina",
    modelado: "un grafo de dependencias",
    forma: "complejo",
    tramos: [
      { precio: "$6.000", alcance: "hasta 25 activos" },
      { precio: "$9.600", alcance: "de 26 a 60" },
      { precio: "$15.600", alcance: "de 61 a 120" },
    ],
  },
  {
    nombre: "Campo",
    ejemplos: "cultivo, potrero, invernadero, corredor",
    modelado: "un polígono con series climáticas",
    forma: "campo",
    tramos: [
      { precio: "$3.600", alcance: "hasta 50 ha" },
      { precio: "$7.200", alcance: "de 51 a 300" },
      { precio: "$13.200", alcance: "de 301 a 1.500" },
    ],
  },
];

/**
 * Un símbolo por tipo de sede, en el gris de la tinta. Punto es un punto,
 * complejo es un rombo (un nodo de grafo girado) y campo es un polígono
 * abierto. Se distinguen sin recurrir al color, que acá está reservado.
 */
const simbolos = {
  punto: "rounded-full bg-tinta-media",
  complejo: "rotate-45 bg-tinta-media",
  campo: "border border-tinta-media",
} as const;

/** Las notas van al pie de la tabla, dentro de ella, porque la califican. */
const notasDeTabla = [
  "Campo XL por encima de 1.500 ha son $13.200 más $4 por hectárea adicional.",
  "Plataforma base por cuenta $2.400 al año, obligatoria, no varía con el número de sedes.",
  "Decremento por volumen, sedes 1 a 3 al 100 %, 4 a 10 al 75 %, 11 a 25 al 55 %, 26 y más al 40 %.",
];

export function Modelo() {
  return (
    <Seccion id="modelo" tono="alto">
      <Revelar>
        <RotuloSeccion n="06">Modelo de negocio</RotuloSeccion>
        <TituloSeccion
          bajada={
            <>
              El precio no es plano. Cambia según cómo se modela la sede, porque ahí es
              donde cambia el costo de servirla.
            </>
          }
        >
          Suscripción anual por sede, y el precio sigue al costo.
        </TituloSeccion>
      </Revelar>

      <Revelar retraso={120}>
        <div className="lamina mt-14 rounded">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <caption className="caption-top border-b border-linea px-6 py-5 text-left sm:px-7">
                <span className="rotulo block">Tarifa por sede</span>
                <span className="mt-2 block text-[13px] leading-relaxed text-tinta-media">
                  Precios en USD por año, sin IVA, pago anual anticipado. TRM de
                  referencia COP $3.160 por USD.
                </span>
              </caption>

              <thead>
                <tr className="border-b border-linea">
                  <th scope="col" className="rotulo px-6 py-3.5 font-normal sm:px-7">
                    Tipo de sede
                  </th>
                  <th scope="col" className="rotulo px-4 py-3.5 font-normal">
                    Cómo se modela
                  </th>
                  {["S", "M", "L"].map((talla) => (
                    <th
                      key={talla}
                      scope="col"
                      className="rotulo px-4 py-3.5 text-right font-normal last:pr-6 sm:last:pr-7"
                    >
                      {talla}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {tipos.map((tipo) => (
                  <tr key={tipo.nombre} className="border-b border-linea-fina align-top">
                    <th scope="row" className="px-6 py-5 font-normal sm:px-7">
                      <span className="flex items-center gap-2.5">
                        <span
                          aria-hidden
                          className={`inline-block h-2.5 w-2.5 shrink-0 ${simbolos[tipo.forma]}`}
                        />
                        <span className="text-[15px] leading-none">{tipo.nombre}</span>
                      </span>
                      <span className="mt-2 block text-[12.5px] leading-snug text-tinta-tenue">
                        {tipo.ejemplos}
                      </span>
                    </th>

                    <td className="px-4 py-5 text-[13.5px] leading-snug text-tinta-media">
                      {tipo.modelado}
                    </td>

                    {tipo.tramos.map((tramo, i) => (
                      <td
                        key={i}
                        className="px-4 py-5 text-right last:pr-6 sm:last:pr-7"
                      >
                        <span className="mono block text-[15px] leading-none">
                          {tramo.precio}
                        </span>
                        <span className="mono mt-2 block text-[11px] leading-snug text-tinta-tenue">
                          {tramo.alcance}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={5} className="px-6 py-5 sm:px-7">
                    <ul className="space-y-2">
                      {notasDeTabla.map((nota) => (
                        <li
                          key={nota}
                          className="flex gap-2.5 text-[12.5px] leading-relaxed text-tinta-media"
                        >
                          <span aria-hidden className="mono text-tinta-tenue">
                            ·
                          </span>
                          {nota}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Revelar>

      <Revelar retraso={200}>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Cifra
            valor="$25.635"
            que={<>Ingreso anual promedio por cuenta con mezcla enterprise.</>}
            fuente="Modelo financiero del Ejercicio 6, mezcla B"
          />
          <Cifra
            valor="94,7"
            unidad="%"
            que={
              <>
                Contribución bruta. El costo variable por cliente es de $1.347 al año.
              </>
            }
            fuente="Modelo financiero del Ejercicio 6, mezcla B"
            tono="verde"
          />
          <Cifra
            valor="28"
            unidad="clientes"
            que={
              <>
                Para 30 % de utilidad con un equipo de 9 personas. El equilibrio está en
                19.
              </>
            }
            fuente="Modelo financiero del Ejercicio 6, mezcla B, tramo 2"
          />
        </div>
      </Revelar>

      {/* El hallazgo cierra la sección y va en tinta sólida porque es la
          conclusión del ejercicio financiero, no un dato más de la tabla. */}
      <Revelar retraso={280}>
        <div className="reticula-oscura mt-12 rounded bg-tinta p-8 text-papel sm:p-10">
          <RotuloSeccion n="06.1" oscuro>
            Hallazgo del modelo
          </RotuloSeccion>

          <h3 className="display mt-5 max-w-2xl text-[1.6rem] leading-snug sm:text-[1.9rem]">
            El 30 % de utilidad no sale del precio. Sale de la mezcla.
          </h3>

          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[color-mix(in_srgb,var(--papel)_72%,transparent)]">
            Subir la tarifa mueve el resultado mucho menos que cambiar a quién se le
            vende. Lo que decide la utilidad es qué tipos de sede entran en la cartera.
          </p>

          <div className="mt-9 grid gap-px overflow-hidden rounded border border-[color-mix(in_srgb,var(--papel)_18%,transparent)] bg-[color-mix(in_srgb,var(--papel)_18%,transparent)] sm:grid-cols-2">
            <Escenario
              rotulo="Cartera PyME"
              cifra="Inalcanzable"
              detalle="Con sedes tipo punto y cuentas pequeñas, el 30 % no se alcanza en tres años. No es un problema de volumen."
              tono="bermellon"
            />
            <Escenario
              rotulo="Cuentas enterprise"
              cifra="28 clientes"
              detalle="Con complejos y campos grandes, el mismo 30 % se alcanza con un equipo de 9 personas."
              tono="verde"
            />
          </div>
        </div>
      </Revelar>

      <Nota>
        Todas las cifras de esta sección salen del modelo financiero del Ejercicio 6. La
        TRM de referencia es COP $3.160 por USD, con banda de $3.156 a $3.175, tercera
        semana de octubre de 2026.
      </Nota>
    </Seccion>
  );
}

/** Una de las dos mezclas comparadas, dentro del bloque de cierre. */
function Escenario({
  rotulo,
  cifra,
  detalle,
  tono,
}: {
  rotulo: string;
  cifra: string;
  detalle: string;
  tono: "bermellon" | "verde";
}) {
  // Sobre tinta los colores de documento se apagan: el verde tiene su variante
  // clara y el bermellón se aclara aquí mismo para no perder contraste. El rol
  // del color no cambia, solo su densidad sobre fondo oscuro.
  const color =
    tono === "bermellon"
      ? "text-[color-mix(in_srgb,var(--bermellon)_80%,var(--papel))]"
      : "text-verde-claro";

  return (
    <div className="bg-tinta p-6 sm:p-7">
      <p className="rotulo text-[color-mix(in_srgb,var(--papel)_55%,transparent)]">
        {rotulo}
      </p>
      <p className={`display mt-3 text-[1.5rem] leading-none ${color}`}>{cifra}</p>
      <p className="mt-4 text-[13.5px] leading-relaxed text-[color-mix(in_srgb,var(--papel)_62%,transparent)]">
        {detalle}
      </p>
    </div>
  );
}
