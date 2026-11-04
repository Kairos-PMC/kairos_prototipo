import { Cifra, Nota, RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/**
 * Sección 06. Modelo de negocio.
 *
 * El precio no es plano porque el costo no es plano: modelar un punto es una
 * coordenada, modelar un complejo es un grafo de dependencias y modelar un
 * campo es un polígono con series climáticas encima.
 *
 * Antes esto era una `<table>` de nueve celdas con cabecera S, M, L. Era
 * correcta y se copiaba bien, pero se leía como la hoja de cálculo de donde
 * salió, no como el precio de un producto que alguien puede comprar. Ahora cada
 * tipo de sede es una tarjeta con sus tres tramos, que es la forma en que se
 * mira un precio. La información es exactamente la misma y cada tramo sigue
 * rotulado con su talla, así que nada se perdió por el camino.
 *
 * Qué tarjeta va destacada no es una decisión de diseño: el hallazgo que cierra
 * la sección dice que el 30 % de utilidad sale de complejos y campos grandes, y
 * que con sedes tipo punto no se alcanza. Las tarjetas llevan ese mismo reparto
 * y con las mismas palabras.
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
  /** Símbolo del tipo de sede. Es forma y no color, porque en este sistema
   *  cada color ya tiene un rol y ninguno significa "tipo de sede". */
  forma: "punto" | "complejo" | "campo";
  /** La cartera a la que el hallazgo del cierre asigna este tipo de sede. */
  cartera: string;
  /** Si la cartera es la que alcanza el 30 % de utilidad. */
  destacado: boolean;
  tramos: [Tramo, Tramo, Tramo];
};

/** Las tallas de los tres tramos, en el mismo orden que `tramos`. */
const tallas = ["S", "M", "L"] as const;

const tipos: TipoDeSede[] = [
  {
    nombre: "Punto",
    ejemplos: "bodega, oficina, planta pequeña",
    modelado: "una coordenada",
    forma: "punto",
    cartera: "Cartera PyME",
    destacado: false,
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
    cartera: "Mezcla enterprise",
    destacado: true,
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
    // El hallazgo del cierre habla de complejos y de campos GRANDES, así que
    // rotular todo el tipo como enterprise diría de más. Un campo de 50
    // hectáreas no lo es. La etiqueta apunta al tramo donde sí aplica.
    cartera: "Enterprise en tramo L",
    destacado: true,
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

/** Las condiciones de la tarifa, que valen para los tres tipos de sede. */
const condiciones = [
  "USD por año",
  "Sin IVA",
  "Pago anual anticipado",
  "TRM COP $3.160 por USD",
];

/** Lo que mueve el precio por fuera de la tabla de tramos. */
const ajustes = [
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

      {/* Las condiciones van arriba y en insignias. Antes eran el `<caption>` de
          la tabla, en gris y a 13 píxeles, donde nadie las leía. */}
      <Revelar retraso={80} className="mt-14">
        <p className="rotulo">
          <span className="text-bermellon">Tarifa por sede</span>
        </p>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {condiciones.map((dato) => (
            <li key={dato} className="pildora pildora-papel">
              {dato}
            </li>
          ))}
        </ul>
      </Revelar>

      <Revelar retraso={140} className="mt-8">
        <ul className="grid gap-6 lg:grid-cols-3">
          {tipos.map((tipo) => (
            <li key={tipo.nombre}>
              <TarjetaDePrecio tipo={tipo} />
            </li>
          ))}
        </ul>
      </Revelar>

      <Revelar retraso={200} className="mt-6">
        <div className="lamina rounded-lg p-7 sm:p-8">
          <p className="rotulo">Lo que ajusta la tarifa</p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {ajustes.map((ajuste) => (
              <li key={ajuste} className="text-[14px] leading-relaxed text-tinta-media">
                {ajuste}
              </li>
            ))}
          </ul>
        </div>
      </Revelar>

      <Revelar retraso={240} className="mt-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* El hallazgo cierra la sección y va en noche, el mismo ambiente del
          hero, porque es la conclusión del ejercicio financiero y no un dato
          más de la tabla. Antes era tinta plana con una retícula encima. */}
      <Revelar retraso={300} className="mt-16">
        <div className="noche-viva rounded-lg p-8 text-papel shadow-[var(--sombra-alta)] sm:p-12">
          <RotuloSeccion n="06.1" oscuro>
            Hallazgo del modelo
          </RotuloSeccion>

          <h3 className="display mt-6 max-w-2xl text-[1.9rem] leading-[1.15] sm:text-[2.5rem]">
            El 30 % de utilidad no sale del precio. Sale de la mezcla.
          </h3>

          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[color-mix(in_srgb,var(--papel)_72%,transparent)] sm:text-[17px]">
            Subir la tarifa mueve el resultado mucho menos que cambiar a quién se le
            vende. Lo que decide la utilidad es qué tipos de sede entran en la cartera.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
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

/**
 * La tarifa de un tipo de sede.
 *
 * La franja de arriba existe en las tres tarjetas, aunque solo las destacadas la
 * lleven en tinta: es lo que mantiene los tres nombres a la misma altura. Los
 * tres tramos van pegados al pie con `mt-auto` para que las tres columnas de
 * precios se puedan comparar de un barrido horizontal.
 */
function TarjetaDePrecio({ tipo }: { tipo: TipoDeSede }) {
  return (
    <div
      className="lamina lamina-viva flex h-full flex-col overflow-hidden rounded-lg"
      /* La elevación de la destacada va en `style` y no en `shadow-*`: `.lamina`
         declara su `box-shadow` en globals.css fuera de las capas, así que le
         gana a cualquier utilidad, que vive en `@layer utilities`. */
      style={tipo.destacado ? { boxShadow: "var(--sombra-alta)" } : undefined}
    >
      <div className={`px-7 py-3.5 ${tipo.destacado ? "bg-tinta" : "bg-papel-hundido"}`}>
        <span className={`pildora ${tipo.destacado ? "pildora-clara" : "pildora-papel"}`}>
          {tipo.cartera}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7 sm:p-8">
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className={`inline-block h-3 w-3 shrink-0 ${simbolos[tipo.forma]}`}
          />
          <span className="display text-[1.7rem] leading-none">{tipo.nombre}</span>
        </span>

        <p className="mt-3.5 text-[13.5px] leading-snug text-tinta-tenue">{tipo.ejemplos}</p>

        <p className="mt-5 text-[14.5px] leading-relaxed text-tinta-media">
          Se modela como {tipo.modelado}.
        </p>

        <ul className="mt-auto space-y-2.5 pt-8">
          {tipo.tramos.map((tramo, i) => (
            <li
              key={tramo.precio}
              className="flex items-baseline justify-between gap-4 rounded bg-papel px-4 py-3.5"
            >
              <span>
                <span className="display block text-[1.6rem] leading-none">
                  {tramo.precio}
                </span>
                <span className="mt-2 block text-[12.5px] leading-snug text-tinta-tenue">
                  {tramo.alcance}
                </span>
              </span>
              <span className="mono shrink-0 text-[11px] tracking-[0.16em] text-tinta-tenue">
                {tallas[i]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
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
  // Sobre noche los colores de documento se apagan: el verde tiene su variante
  // clara y el bermellón se aclara aquí mismo para no perder contraste. El rol
  // del color no cambia, solo su densidad sobre fondo oscuro.
  const color =
    tono === "bermellon"
      ? "text-[color-mix(in_srgb,var(--bermellon)_80%,var(--papel))]"
      : "text-verde-claro";

  return (
    <div className="rounded-lg border border-[color-mix(in_srgb,var(--papel)_14%,transparent)] bg-[color-mix(in_srgb,var(--papel)_7%,transparent)] p-7 sm:p-8">
      <span className="pildora pildora-clara">{rotulo}</span>
      <p className={`display mt-6 text-[1.8rem] leading-none ${color}`}>{cifra}</p>
      <p className="mt-4 text-[14.5px] leading-relaxed text-[color-mix(in_srgb,var(--papel)_66%,transparent)]">
        {detalle}
      </p>
    </div>
  );
}
