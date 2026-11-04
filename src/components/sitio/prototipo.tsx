/**
 * Sección 04. El prototipo.
 *
 * Es la sección que vende, así que está ordenada como una demostración y no
 * como un folleto: primero el producto encendido en video, después los tres
 * números que ese video produce, después la entrada, y al final las cinco
 * capacidades. El orden importa porque nadie entra a un prototipo que todavía
 * no entiende.
 *
 * El marco de ventana y el halo cálido no son adorno. Antes el video iba
 * suelto dentro de un borde de un píxel, y a tres metros de distancia eso no
 * se lee como software funcionando sino como una lámina de anteproyecto.
 */

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Boton, Nota, RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/**
 * El halo cálido detrás de una pantalla, recortado para que no ensanche la
 * página.
 *
 * `.aurora` dibuja su resplandor un 8 % por fuera del contenedor a cada lado, y
 * a 375 px de ancho eso son dos píxeles de desbordamiento horizontal en toda la
 * página. El hero resuelve lo mismo recortando en su `<section>`, y acá el
 * recorte llega hasta el borde de la sección con los márgenes negativos: el
 * halo sigue entrando en el margen lateral y solo se corta donde se cortaría la
 * ventana. El relleno vertical generoso deja pasar el derrame de arriba y de
 * abajo, que es el que hace que la pantalla parezca encendida, y el margen
 * negativo que lo acompaña lo deja neutro en el flujo.
 */
function Halo({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-6 -my-24 overflow-hidden px-6 py-24 sm:-mx-8 sm:px-8">
      <div className="aurora relative">{children}</div>
    </div>
  );
}

/** Las cinco pantallas, en el orden en que se recorren. */
const modulos = [
  {
    n: "01",
    ruta: "/datos",
    nombre: "Centro de datos",
    que: "Sismos del USGS y clima de Open-Meteo consultados en vivo al abrir la pantalla, más las fuentes institucionales citadas.",
    vivo: true,
    /* Es la pantalla de entrada y la única con datos en vivo, así que ocupa el
       doble de ancho donde la fila lo permite. */
    ancha: true,
  },
  {
    n: "02",
    ruta: "/sedes",
    nombre: "Sedes y amenazas",
    que: "Las sedes de la empresa demo en el mapa, con el catálogo de amenazas configurado por sede.",
    vivo: false,
    ancha: false,
  },
  {
    n: "03",
    ruta: "/simulacion",
    nombre: "Simulación",
    que: "El plano de planta interactivo. Se marca una instalación como caída y la pérdida se recalcula con el efecto en cadena.",
    vivo: false,
    ancha: false,
  },
  {
    n: "04",
    ruta: "/priorizador",
    nombre: "Priorizador",
    que: "Con un presupuesto dado, ordena en qué invertir primero según cuánta pérdida evita cada peso.",
    vivo: false,
    ancha: false,
  },
  {
    n: "05",
    ruta: "/reporte",
    nombre: "Reporte",
    que: "El informe de priorización, listo para imprimir.",
    vivo: false,
    ancha: false,
  },
];

export function Prototipo() {
  return (
    <Seccion id="prototipo" tono="alto">
      <Revelar>
        <RotuloSeccion n="04">El prototipo</RotuloSeccion>
        <TituloSeccion
          bajada={
            <>
              Esto no es un mockup. Los cinco módulos funcionan, las cifras se recalculan
              al marcar la instalación, y el centro de datos consulta las APIs públicas en
              el momento en que se abre la pantalla.
            </>
          }
        >
          Caiga la subestación y mire qué arrastra.
        </TituloSeccion>
      </Revelar>

      {/* `preload="none"` no es un detalle de rendimiento cualquiera. El archivo
          pesa 11 MB y en el wifi de una feria nadie que solo pasa leyendo la
          página tiene por qué pagarlo sin haberlo pedido. El póster carga la
          primera imagen y el video solo baja si alguien le da play. */}
      <Revelar retraso={80} className="mt-14">
        <figure>
          {/* El halo envuelve solo la pantalla. Si envolviera también el pie, el
              resplandor cálido pasaría por detrás del texto y lo deslavaría. */}
          <Halo>
            <div className="pantalla relative z-10">
              <div className="pantalla-barra">
                <span className="pantalla-punto" />
                <span className="pantalla-punto" />
                <span className="pantalla-punto" />
                <span className="mono ml-3 truncate text-[10.5px] tracking-[0.07em] text-[color-mix(in_srgb,var(--papel)_42%,transparent)]">
                  kairos · simulación · 30 segundos
                </span>
              </div>

              <video
                controls
                preload="none"
                poster="/simulacion-poster.png"
                playsInline
                muted
                loop
                width={1280}
                height={760}
                aria-label="La simulación de Kairos recorriendo la caída de la subestación eléctrica"
                className="block h-auto w-full bg-noche"
              >
                <source src="/simulacion.mp4" type="video/mp4" />
                Este navegador no reproduce el video. La imagen de portada es una captura
                de la misma pantalla.
              </video>
            </div>
          </Halo>

          <figcaption className="mt-8 max-w-2xl">
            <p className="text-[16px] leading-relaxed text-tinta-media sm:text-[17px]">
              La finca en calma, el clic sobre la subestación, la cascada encendiéndose y
              los dos contadores subiendo. Es la pantalla corriendo de verdad, y la imagen
              de portada es una captura de la aplicación desplegada.
            </p>
            <p className="procedencia mt-5 border-t border-linea-fina pt-4">
              Flores del Oriente S.A.S. · floricultura de exportación · sede Facatativá,
              Cundinamarca · cifras ilustrativas
            </p>
          </figcaption>
        </figure>
      </Revelar>

      {/* Los tres números del caso. Se leen de izquierda a derecha porque son
          una resta, y la resta es el argumento entero del producto. */}
      <Revelar retraso={140} className="mt-20">
        <p className="rotulo">
          <span className="text-bermellon">Lo que la simulación cuenta</span>
        </p>

        <div className="mt-7 grid gap-6 lg:grid-cols-3">
          <Paso
            paso="Primero"
            valor="$240 M"
            tono="bermellon"
            titulo="Reponer la subestación"
            que="Es el activo que cayó, y el 3,5 % del valor asegurable de la sede. Es también la única cifra que una póliza sobre el activo mira."
          />
          <Paso
            paso="Después"
            valor="$440 M"
            tono="ocre"
            titulo="El evento completo"
            que="Sin corriente se detienen invernaderos y riego que no recibieron ningún golpe. La simulación los suma sola, siguiendo el encadenamiento del plano."
          />
          <Paso
            paso="La diferencia"
            valor="$200 M"
            tono="bermellon"
            titulo="Lo que arrastra"
            que="Ninguna póliza sobre el activo caído cubre esta parte. Aparece solo cuando se mira la instalación dentro de la cadena que alimenta."
          />
        </div>
      </Revelar>

      {/* El resultado del priorizador va aparte y en verde, porque es dinero
          salvado y no dinero en riesgo. Mezclarlo con la resta de arriba
          confundiría los dos roles del color. El filete va en verde por lo
          mismo, así que acá no sirve `.filete`, que nace bermellón.
          El borde y la sombra van en `style` y no en utilidades de Tailwind por
          una razón de cascada: `.lamina` se declara en globals.css fuera de las
          capas, así que su `border` y su `box-shadow` le ganan a cualquier
          `border-l-*` o `shadow-*`, que viven en `@layer utilities`. Antes esto
          era `border-l-2 border-l-verde` y el verde nunca se vio. */}
      <Revelar retraso={180} className="mt-6">
        <div
          className="lamina rounded-lg p-8 sm:p-10"
          style={{ borderLeft: "3px solid var(--verde)", boxShadow: "var(--sombra-alta)" }}
        >
          <p className="rotulo">
            <span className="text-verde">Y el priorizador responde</span>
          </p>
          <div className="mt-7 grid gap-8 sm:grid-cols-3">
            <Resultado valor="$800 M" que="de presupuesto asignado a los refuerzos que más pérdida evitan" />
            <Resultado valor="$583 M" que="de pérdida esperada evitada al año, con ese orden de inversión" />
            <Resultado valor="1,3 años" que="para recuperar la inversión completa" />
          </div>
        </div>
      </Revelar>

      {/* Entrada al prototipo. Es la acción principal de la página entera, así
          que es el único botón de este tamaño en todo el sitio y va sobre una
          lámina elevada en vez de entre dos líneas finas. */}
      <Revelar retraso={120} className="mt-20">
        <div
          className="lamina flex flex-col gap-7 rounded-lg p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10"
          style={{ boxShadow: "var(--sombra-alta)" }}
        >
          <div className="max-w-md">
            <p className="display text-[1.6rem] leading-snug sm:text-[1.8rem]">
              Las cinco pantallas están desplegadas y abiertas.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-tinta-media">
              El acceso es decorativo. No valida nada y cualquiera con el enlace recorre el
              prototipo completo.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <Boton href="/datos" variante="principal" className="px-8 py-5 text-[15px]">
              Entrar al prototipo
            </Boton>
            <Boton href="/acceso" variante="secundario">
              Ver la pantalla de acceso
            </Boton>
          </div>
        </div>
      </Revelar>

      {/* El recorrido. La captura va primero y con el mismo marco de ventana
          que el video, porque es la prueba de que los datos en vivo existen:
          es la pantalla real y no un render. */}
      <Revelar retraso={120} className="mt-20">
        <p className="rotulo">
          <span className="text-bermellon">El recorrido</span>
        </p>

        <figure className="mt-7">
          <Halo>
            <div className="pantalla relative z-10 mx-auto max-w-4xl">
              <div className="pantalla-barra">
                <span className="pantalla-punto" />
                <span className="pantalla-punto" />
                <span className="pantalla-punto" />
                <span className="mono ml-3 truncate text-[10.5px] tracking-[0.07em] text-[color-mix(in_srgb,var(--papel)_42%,transparent)]">
                  kairos · centro de datos
                </span>
              </div>
              <Image
                src="/centro-de-datos.png"
                alt="El centro de datos de Kairos con los sismos del USGS y el clima de Open-Meteo"
                width={1280}
                height={880}
                sizes="(max-width: 1024px) 100vw, 896px"
                className="block h-auto w-full"
              />
            </div>
          </Halo>

          <figcaption className="mx-auto mt-8 max-w-4xl">
            {/* El punto que late va acá porque estos datos sí se consultan en
                vivo al abrir la pantalla. Sobre un dato quieto mentiría. */}
            <span className="pildora pildora-papel">
              <span className="latido" aria-hidden />
              Datos en vivo
            </span>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-tinta-media">
              Tomada de la aplicación desplegada, con los sismos del USGS y el clima de
              Open-Meteo cargados en vivo. Lo que se abre al entrar es esta pantalla.
            </p>
          </figcaption>
        </figure>
      </Revelar>

      {/* Las cinco capacidades. Antes eran filas separadas por líneas finas, que
          es la forma de una tabla de contenidos. Ahora cada una es una tarjeta
          con peso propio, que es la forma de una lista de capacidades. */}
      <Revelar retraso={160} className="mt-12">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map((m) => (
            <li key={m.n} className={m.ancha ? "lg:col-span-2" : ""}>
              <Link
                href={m.ruta}
                className="lamina lamina-viva group flex h-full flex-col rounded-lg p-6 sm:p-7"
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="mono text-[11px] tracking-[0.16em] text-tinta-tenue">
                    {m.n}
                  </span>
                  {m.vivo && (
                    <span className="pildora pildora-papel">
                      <span className="latido" aria-hidden />
                      Datos en vivo
                    </span>
                  )}
                </span>

                <span className="display mt-6 block text-[1.45rem] leading-tight">
                  {m.nombre}
                </span>
                <span className="mt-3 block max-w-xl text-[14.5px] leading-relaxed text-tinta-media">
                  {m.que}
                </span>

                <svg
                  viewBox="0 0 16 16"
                  className="mt-7 h-4 w-4 text-tinta-tenue transition group-hover:translate-x-1 group-hover:text-bermellon"
                  aria-hidden
                >
                  <path
                    d="M2 8h11M9 4l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </Revelar>

      <Nota>
        Las cifras de Flores del Oriente S.A.S. son ilustrativas y la plataforma lo rotula
        así en la misma pantalla donde las muestra. No vienen de estados financieros
        reales. Para un uso real habría que calibrarlas contra los registros de la UNGRD,
        la base de DesInventar y las estaciones del IDEAM más cercanas a cada sede.
      </Nota>
    </Seccion>
  );
}

/**
 * Un paso de la secuencia del caso.
 *
 * Comparte escala tipográfica con `Cifra` para que no se lea como otro sistema,
 * pero lleva píldora de orden en vez de fuente al pie: la procedencia de los
 * tres números es la misma y está declarada una vez bajo el video.
 */
function Paso({
  paso,
  valor,
  titulo,
  que,
  tono,
}: {
  paso: string;
  valor: string;
  titulo: string;
  que: string;
  tono: "bermellon" | "ocre";
}) {
  const color = { bermellon: "text-bermellon", ocre: "text-ocre" }[tono];

  return (
    <div className="lamina lamina-viva rounded-lg p-7 sm:p-8">
      <span className="pildora pildora-papel">{paso}</span>
      <p className={`display mt-6 text-[3.1rem] leading-none ${color}`}>{valor}</p>
      <p className="mt-5 text-[17px] font-medium leading-snug">{titulo}</p>
      <p className="mt-3 text-[14.5px] leading-relaxed text-tinta-media">{que}</p>
    </div>
  );
}

/** Una de las tres cifras del resultado del priorizador. */
function Resultado({ valor, que }: { valor: string; que: string }) {
  return (
    <div>
      <p className="display text-[2.5rem] leading-none text-verde">{valor}</p>
      <p className="mt-4 text-[14.5px] leading-relaxed text-tinta-media">{que}</p>
    </div>
  );
}
