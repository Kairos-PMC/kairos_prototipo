/**
 * Pie del sitio público.
 *
 * Son dos piezas y cumplen dos funciones distintas.
 *
 * Primero una banda de cierre en `noche`, el mismo ambiente del hero. En una
 * feria mucha gente llega al final de la página mientras habla con alguien del
 * equipo, así que la última pantalla tiene que ofrecer la misma puerta de
 * entrada que la primera y tiene que pegar igual de fuerte. Por eso repite la
 * frase del pitch en grande y el botón claro, centrados y con aire.
 *
 * Debajo, la letra chica: alcance, fuentes, ficha del proyecto y cajetín. Es la
 * contratapa del plano y se comporta como tal, más apagada que la banda de
 * arriba y separada por un filo de luz, para que se lea como otra plancha y no
 * como una continuación del cierre.
 *
 * Repite el contenido del pie de la aplicación (`src/app/(app)/layout.tsx`) a
 * propósito, porque quien llega por el landing y quien entra al prototipo
 * tienen que leer la misma letra chica. El `footer` envuelve las dos piezas
 * para que todo el bloque siga siendo un solo landmark.
 */

import { Boton, Seccion } from "@/components/sitio/base";
import { Logotipo } from "@/components/iconos";
import { DOCUMENTO } from "@/lib/documento";

/*
 * Sobre oscuro el papel puro quema, así que el texto secundario y los bordes se
 * mezclan con el fondo en vez de usar un gris fijo. Se definen aquí una vez
 * para que toda la contratapa use los mismos valores.
 */
const TEXTO_SUAVE = "text-[color-mix(in_srgb,var(--papel)_65%,transparent)]";
const BORDE = "border-[color-mix(in_srgb,var(--papel)_18%,transparent)]";
const ENCABEZADO_COLUMNA =
  "mono text-[11px] uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--papel)_72%,transparent)]";

const fuentes = [
  { nombre: "IDEAM", url: "https://www.ideam.gov.co/" },
  { nombre: "Servicio Geológico Colombiano", url: "https://www.sgc.gov.co/" },
  { nombre: "UNGRD", url: "https://portal.gestiondelriesgo.gov.co/" },
  { nombre: "DesInventar", url: "https://www.desinventar.net/" },
  { nombre: "USGS Earthquake Catalog", url: "https://earthquake.usgs.gov/" },
  { nombre: "Open-Meteo", url: "https://open-meteo.com/" },
];

const navegacion = [
  { nombre: "El problema", ancla: "#problema" },
  { nombre: "Por qué ahora", ancla: "#por-que-ahora" },
  { nombre: "Cómo funciona", ancla: "#como-funciona" },
  { nombre: "El prototipo", ancla: "#prototipo" },
  { nombre: "Validación", ancla: "#validacion" },
  { nombre: "Modelo de negocio", ancla: "#modelo" },
  { nombre: "El equipo", ancla: "#equipo" },
];

export function Pie() {
  return (
    <footer className="bg-noche text-papel">
      <Seccion tono="noche">
        {/*
          Filo de luz en el paso del papel a la noche. Es el gesto inverso al
          del hero, que remata su bloque oscuro de la misma forma: así el cambio
          de fondo es un pliegue y no un escalón.
        */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-t from-transparent to-[color-mix(in_srgb,var(--papel)_14%,transparent)]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <Logotipo className="h-11 w-11" />
            <span className="display text-[1.6rem] leading-none">Kairos</span>
          </div>

          <p className="display mt-9 text-[2.3rem] leading-[1.06] sm:text-[3rem] lg:text-[3.3rem]">
            Antes de que el desastre decida por ti.
          </p>

          <div className="mt-10 flex justify-center">
            <Boton href="/datos" variante="claro">
              Entrar al prototipo
            </Boton>
          </div>
        </div>
      </Seccion>

      {/* La contratapa. Fondo plano y sin halos: la luz es de la banda de
          arriba, y aquí abajo competiría con ella. */}
      <div className={`border-t ${BORDE}`}>
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid gap-12 py-14 lg:grid-cols-[1.5fr_1fr_1.2fr] lg:py-16">
            <div>
              <p className={ENCABEZADO_COLUMNA}>El alcance</p>
              <p
                className={`mt-5 max-w-md text-[14.5px] leading-relaxed ${TEXTO_SUAVE}`}
              >
                Kairos informa decisiones, no las garantiza. No pronostica si un
                evento va a ocurrir ni cuándo. Estima el costo de no estar
                preparado, bajo supuestos que quedan a la vista y se pueden
                cambiar.
              </p>
              <p
                className={`mt-5 max-w-md border-l-2 ${BORDE} pl-4 text-[13px] leading-relaxed ${TEXTO_SUAVE}`}
              >
                Las cifras de la empresa demo son ilustrativas. Para un uso real
                habría que calibrarlas contra los registros de la UNGRD,
                DesInventar y las estaciones del IDEAM más cercanas a cada sede.
              </p>
            </div>

            <div>
              <p className={ENCABEZADO_COLUMNA}>Fuentes</p>
              <ul className="mt-5 space-y-3">
                {fuentes.map((f) => (
                  <li key={f.nombre}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-[14.5px] underline decoration-[color-mix(in_srgb,var(--papel)_25%,transparent)] underline-offset-4 transition hover:text-papel hover:decoration-[color-mix(in_srgb,var(--papel)_60%,transparent)] ${TEXTO_SUAVE}`}
                    >
                      {f.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className={ENCABEZADO_COLUMNA}>Ficha del proyecto</p>
              <dl className="mono mt-5 space-y-3.5 text-[13px]">
                <Ficha
                  termino="Curso"
                  valor="ISIS 2007 · Diseño de Productos e Innovación con TI"
                />
                <Ficha termino="Institución" valor="Universidad de los Andes" />
                <Ficha
                  termino="Grupo 1"
                  valor="M. A. Rodríguez · J. C. Solano · S. Montoya · A. Muñoz · R. Ruiz"
                />
                <Ficha
                  termino="Revisión"
                  valor={`${DOCUMENTO.revision} · ${DOCUMENTO.fechaEmision}`}
                />
              </dl>
            </div>
          </div>

          <nav
            aria-label="Secciones del sitio"
            className={`border-t ${BORDE} py-8`}
          >
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {navegacion.map((item) => (
                <li key={item.ancla}>
                  <a
                    href={item.ancla}
                    className={`mono text-[12px] uppercase tracking-[0.1em] transition hover:text-papel ${TEXTO_SUAVE}`}
                  >
                    {item.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cajetín: las tres líneas de identificación del documento. */}
          <div
            className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t ${BORDE} py-6`}
          >
            <p className="mono text-[11px] uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--papel)_50%,transparent)]">
              Kairos · Prototipo académico · Rev. {DOCUMENTO.revision}
            </p>
            <p className="mono text-[11px] text-[color-mix(in_srgb,var(--papel)_50%,transparent)]">
              {DOCUMENTO.notaRevision}
            </p>
            <p className="mono text-[11px] text-[color-mix(in_srgb,var(--papel)_50%,transparent)]">
              Sin cuentas · sin cookies · sin datos de quien lo visita
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Ficha({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div>
      <dt className="text-[color-mix(in_srgb,var(--papel)_45%,transparent)]">
        {termino}
      </dt>
      <dd className={`mt-1 leading-relaxed ${TEXTO_SUAVE}`}>{valor}</dd>
    </div>
  );
}
