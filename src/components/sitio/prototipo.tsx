/**
 * Sección 04 — El prototipo.
 *
 * Es la puerta de entrada a la aplicación, así que está ordenada como una
 * demostración y no como un folleto: primero el caso corriendo en video,
 * después los tres números que ese video produce, después el botón, y al final
 * el índice de las cinco pantallas. El orden importa porque nadie entra a un
 * prototipo que todavía no entiende.
 */

import Image from "next/image";
import Link from "next/link";
import { Boton, Nota, RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/** Las cinco pantallas, en el orden en que se recorren. */
const modulos = [
  {
    n: "01",
    ruta: "/datos",
    nombre: "Centro de datos",
    que: "Sismos del USGS y clima de Open-Meteo consultados en vivo al abrir la pantalla, más las fuentes institucionales citadas.",
    vivo: true,
  },
  {
    n: "02",
    ruta: "/sedes",
    nombre: "Sedes y amenazas",
    que: "Las sedes de la empresa demo en el mapa, con el catálogo de amenazas configurado por sede.",
    vivo: false,
  },
  {
    n: "03",
    ruta: "/simulacion",
    nombre: "Simulación",
    que: "El plano de planta interactivo. Se marca una instalación como caída y la pérdida se recalcula con el efecto en cadena.",
    vivo: false,
  },
  {
    n: "04",
    ruta: "/priorizador",
    nombre: "Priorizador",
    que: "Con un presupuesto dado, ordena en qué invertir primero según cuánta pérdida evita cada peso.",
    vivo: false,
  },
  {
    n: "05",
    ruta: "/reporte",
    nombre: "Reporte",
    que: "El informe de priorización, listo para imprimir.",
    vivo: false,
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

      {/* El video es la pieza central. `preload="none"` no es un detalle de
          rendimiento cualquiera: el archivo pesa 11 MB y nadie que solo pasa
          leyendo la página tiene por qué descargarlo. */}
      <Revelar retraso={80} className="mt-12">
        <figure className="lamina rounded p-2 sm:p-2.5">
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
            className="h-auto w-full rounded-sm bg-tinta"
          >
            <source src="/simulacion.mp4" type="video/mp4" />
            Este navegador no reproduce el video. La imagen de portada es una captura de
            la misma pantalla.
          </video>

          <figcaption className="px-3 pb-2 pt-4 sm:px-4">
            <p className="rotulo flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-bermellon">Módulo 03</span>
              <span className="inline-block h-px w-8 bg-linea" />
              Simulación · 30 segundos
            </p>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-tinta-media">
              La finca en calma, el clic sobre la subestación, la cascada encendiéndose y
              los dos contadores subiendo. Es la pantalla corriendo de verdad, y la imagen
              de portada es una captura de la aplicación desplegada.
            </p>
            <p className="procedencia mt-4 border-t border-linea-fina pt-3">
              Flores del Oriente S.A.S. · floricultura de exportación · sede Facatativá,
              Cundinamarca · cifras ilustrativas
            </p>
          </figcaption>
        </figure>
      </Revelar>

      {/* Los tres números del caso. Se leen de izquierda a derecha porque son
          una resta, y la resta es el argumento entero del producto. */}
      <Revelar retraso={140} className="mt-14">
        <p className="rotulo flex items-center gap-3">
          <span className="text-bermellon">Lo que la simulación cuenta</span>
          <span className="inline-block h-px flex-1 bg-linea" />
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
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
          confundiría los dos roles del color. */}
      <Revelar retraso={180} className="mt-6">
        <div className="lamina rounded border-l-2 border-l-verde p-6 sm:p-7">
          <p className="rotulo">
            <span className="text-verde">Y el priorizador responde</span>
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            <Resultado valor="$800 M" que="de presupuesto asignado a los refuerzos que más pérdida evitan" />
            <Resultado valor="$583 M" que="de pérdida esperada evitada al año, con ese orden de inversión" />
            <Resultado valor="1,3 años" que="para recuperar la inversión completa" />
          </div>
        </div>
      </Revelar>

      {/* Entrada al prototipo. Es la acción principal de la página entera, así
          que es el único botón de este tamaño en todo el sitio. */}
      <Revelar retraso={120} className="mt-14">
        <div className="flex flex-col gap-5 border-y border-linea py-9 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <p className="display text-[1.4rem] leading-snug">
              Las cinco pantallas están desplegadas y abiertas.
            </p>
            <p className="mt-2.5 text-[14px] leading-relaxed text-tinta-media">
              El acceso es decorativo. No valida nada y cualquiera con el enlace recorre el
              prototipo completo.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Boton href="/datos" variante="principal" className="px-8 py-5 text-[15px]">
              Entrar al prototipo
            </Boton>
            <Boton href="/acceso" variante="secundario">
              Ver la pantalla de acceso
            </Boton>
          </div>
        </div>
      </Revelar>

      {/* Índice de láminas. La captura del centro de datos va al lado porque es
          la prueba de que los datos en vivo existen: es la pantalla real, no un
          render. */}
      <Revelar retraso={120} className="mt-14">
        <p className="rotulo flex items-center gap-3">
          <span className="text-bermellon">El recorrido</span>
          <span className="inline-block h-px flex-1 bg-linea" />
        </p>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
          <figure className="lamina lamina-esquina rounded p-2 sm:p-2.5">
            <Image
              src="/centro-de-datos.png"
              alt="El centro de datos de Kairos con los sismos del USGS y el clima de Open-Meteo"
              width={1280}
              height={880}
              className="h-auto w-full rounded-sm"
            />
            <figcaption className="px-3 pb-2 pt-4 sm:px-4">
              <p className="rotulo">
                <span className="text-verde">Captura real</span> · módulo 01
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-tinta-media">
                Tomada de la aplicación desplegada, con los sismos del USGS y el clima de
                Open-Meteo cargados en vivo. Lo que se abre al entrar es esta pantalla.
              </p>
            </figcaption>
          </figure>

          <ol className="border-t border-linea">
            {modulos.map((m) => (
              <li key={m.n}>
                <Link
                  href={m.ruta}
                  className="group flex gap-5 border-b border-linea px-1 py-5 transition hover:bg-papel"
                >
                  <span className="mono mt-0.5 text-[13px] text-tinta-tenue transition group-hover:text-bermellon">
                    {m.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="display text-[1.1rem] leading-none">{m.nombre}</span>
                      {m.vivo && (
                        <span className="mono rounded-sm border border-verde/40 bg-verde/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.11em] text-verde">
                          datos en vivo
                        </span>
                      )}
                    </span>
                    <span className="mt-2 block text-[14px] leading-relaxed text-tinta-media">
                      {m.que}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    className="mt-1.5 h-3.5 w-3.5 shrink-0 text-tinta-tenue transition group-hover:translate-x-0.5 group-hover:text-tinta"
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
          </ol>
        </div>
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
 * pero lleva rótulo de orden en vez de fuente al pie: la procedencia de los tres
 * números es la misma y está declarada una vez bajo el video.
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
    <div className="lamina lamina-esquina rounded p-6">
      <p className="rotulo">{paso}</p>
      <p className={`display mt-4 text-[2.75rem] leading-none ${color}`}>{valor}</p>
      <p className="mt-4 text-[15px] font-medium leading-snug">{titulo}</p>
      <p className="mt-2.5 text-[14px] leading-relaxed text-tinta-media">{que}</p>
    </div>
  );
}

/** Una de las tres cifras del resultado del priorizador. */
function Resultado({ valor, que }: { valor: string; que: string }) {
  return (
    <div>
      <p className="display text-[2rem] leading-none text-verde">{valor}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-tinta-media">{que}</p>
    </div>
  );
}
