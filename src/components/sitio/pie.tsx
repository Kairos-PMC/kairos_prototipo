/**
 * Pie del sitio público.
 *
 * Es la versión oscura del pie de la aplicación (`src/app/(app)/layout.tsx`):
 * mismo alcance, mismas fuentes, misma ficha de proyecto y el mismo cajetín de
 * revisión al cierre. Se repite a propósito, porque quien llega por el landing
 * y quien entra al prototipo tienen que leer la misma letra chica.
 *
 * Va sobre tinta y no sobre papel porque cierra el documento, igual que la
 * contratapa de un plano. No usa `<Seccion>` para poder sangrar el fondo a todo
 * el ancho, pero por dentro repite su contenedor (`max-w-6xl`) para que las
 * columnas queden alineadas con las secciones de arriba.
 */

import { Boton } from "@/components/sitio/base";
import { Logotipo } from "@/components/iconos";
import { DOCUMENTO } from "@/lib/documento";

/*
 * Sobre tinta el papel puro quema, así que el texto secundario y los bordes se
 * mezclan con el fondo en vez de usar un gris fijo. Se definen aquí una vez
 * para que todo el pie use el mismo par de valores.
 */
const TEXTO_SUAVE = "text-[color-mix(in_srgb,var(--papel)_65%,transparent)]";
const BORDE = "border-[color-mix(in_srgb,var(--papel)_18%,transparent)]";

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
    <footer className="reticula-oscura bg-tinta text-papel">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        {/* Franja de cierre: el logotipo, el nombre y la frase del pitch. */}
        <div
          className={`flex flex-col gap-8 border-b ${BORDE} py-14 lg:flex-row lg:items-end lg:justify-between lg:py-16`}
        >
          <div>
            <div className="flex items-center gap-3">
              <Logotipo className="h-10 w-10" />
              <span className="display text-2xl leading-none">Kairos</span>
            </div>
            <p className="display mt-6 max-w-xl text-[1.6rem] leading-[1.2] sm:text-[2rem]">
              Antes de que el desastre decida por ti.
            </p>
          </div>

          {/* Quien llegó hasta abajo todavía tiene que poder entrar. */}
          <div className="shrink-0">
            <Boton href="/datos" variante="claro">
              Entrar al prototipo
            </Boton>
          </div>
        </div>

        <div className="grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr_1.2fr] lg:gap-12">
          <div>
            <p className="rotulo text-[color-mix(in_srgb,var(--papel)_55%,transparent)]">
              El alcance
            </p>
            <p className={`mt-4 max-w-md text-[14px] leading-relaxed ${TEXTO_SUAVE}`}>
              Kairos informa decisiones, no las garantiza. No pronostica si un
              evento va a ocurrir ni cuándo. Estima el costo de no estar
              preparado, bajo supuestos que quedan a la vista y se pueden
              cambiar.
            </p>
            <p
              className={`mt-4 max-w-md border-l-2 ${BORDE} pl-4 text-[13px] leading-relaxed ${TEXTO_SUAVE}`}
            >
              Las cifras de la empresa demo son ilustrativas. Para un uso real
              habría que calibrarlas contra los registros de la UNGRD,
              DesInventar y las estaciones del IDEAM más cercanas a cada sede.
            </p>
          </div>

          <div>
            <p className="rotulo text-[color-mix(in_srgb,var(--papel)_55%,transparent)]">
              Fuentes
            </p>
            <ul className="mt-4 space-y-2.5">
              {fuentes.map((f) => (
                <li key={f.nombre}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-[14px] underline decoration-[color-mix(in_srgb,var(--papel)_25%,transparent)] underline-offset-4 transition hover:text-papel hover:decoration-[color-mix(in_srgb,var(--papel)_60%,transparent)] ${TEXTO_SUAVE}`}
                  >
                    {f.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="rotulo text-[color-mix(in_srgb,var(--papel)_55%,transparent)]">
              Ficha del proyecto
            </p>
            <dl className="mono mt-4 space-y-3 text-[13px]">
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
    </footer>
  );
}

function Ficha({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div>
      <dt className="text-[color-mix(in_srgb,var(--papel)_45%,transparent)]">
        {termino}
      </dt>
      <dd className={`mt-0.5 leading-relaxed ${TEXTO_SUAVE}`}>{valor}</dd>
    </div>
  );
}
