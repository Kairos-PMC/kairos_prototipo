/**
 * Sección 01: el problema.
 *
 * El argumento no es que falten datos. Es que los datos existen y nadie los
 * baja a una sede concreta con un precio al lado. La sección está construida
 * para que esa distinción se vea antes de leerla: primero la cadena de tres
 * eslabones, después los sellos de las fuentes que ya publican todo eso.
 */

import { Fragment, type ReactNode } from "react";

import { RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/** El árbol de problemas del proyecto, en sus tres eslabones. */
const CADENA = [
  {
    rotulo: "Causa raíz",
    n: "a",
    texto:
      "Fuentes fragmentadas, sistemas sin integrar, bajo acceso a herramientas",
  },
  {
    rotulo: "Brecha",
    n: "b",
    texto:
      "Los datos se producen, pero no llegan como decisión a una sede concreta",
  },
  {
    rotulo: "Consecuencia",
    n: "c",
    texto:
      "Decisiones tardías, daño evitable a infraestructura, menor capacidad de respuesta",
  },
] as const;

/**
 * Fuentes públicas. `vivo` marca las dos que el prototipo consulta de verdad
 * contra su API. Las otras cuatro están citadas y no conectadas, y la
 * diferencia se muestra porque decir lo contrario sería falso.
 */
const FUENTES: {
  sigla: string;
  nombre?: string;
  publica: string;
  vivo: boolean;
}[] = [
  {
    sigla: "IDEAM",
    nombre: "Instituto de Hidrología, Meteorología y Estudios Ambientales",
    publica:
      "Boletín diario de alertas por deslizamiento y avisos hidrológicos por municipio.",
    vivo: false,
  },
  {
    sigla: "SGC",
    nombre: "Servicio Geológico Colombiano",
    publica: "Red Sismológica Nacional y mapas de amenaza sísmica.",
    vivo: false,
  },
  {
    sigla: "UNGRD",
    nombre: "Unidad Nacional para la Gestión del Riesgo de Desastres",
    publica:
      "Inventario de alertas tempranas y registro histórico de emergencias.",
    vivo: false,
  },
  {
    sigla: "DesInventar",
    publica:
      "Registro de eventos por municipio desde 1970, con pérdidas y afectados.",
    vivo: false,
  },
  {
    sigla: "USGS",
    publica:
      "Catálogo de sismos en GeoJSON abierto. La plataforma lo consulta en vivo.",
    vivo: true,
  },
  {
    sigla: "Open-Meteo",
    publica:
      "Pronóstico por coordenada exacta. La plataforma lo consulta en vivo.",
    vivo: true,
  },
];

export function Problema() {
  return (
    <Seccion id="problema" tono="alto">
      <RotuloSeccion n="01">El problema</RotuloSeccion>
      <TituloSeccion
        bajada={
          <>
            En Colombia el dato sobra. El IDEAM y el Servicio Geológico
            Colombiano lo publican gratis todos los días. Lo que no existe es
            quien lo traduzca a una decisión sobre una bodega concreta, con
            precio.
          </>
        }
      >
        El dato existe. La decisión, no.
      </TituloSeccion>

      {/* La cadena. En escritorio corre de izquierda a derecha con flechas
          entre eslabones, en móvil se apila y la flecha apunta hacia abajo. */}
      <Revelar>
        <ol className="mt-14 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-4">
          {CADENA.map((eslabon, i) => (
            <Fragment key={eslabon.n}>
              <Eslabon
                rotulo={eslabon.rotulo}
                consecuencia={i === CADENA.length - 1}
              >
                {eslabon.texto}
              </Eslabon>
              {i < CADENA.length - 1 && <Flecha />}
            </Fragment>
          ))}
        </ol>
      </Revelar>

      {/* Sellos de procedencia. Van en mono y en cajas chicas porque son
          referencias, no argumentos. */}
      <Revelar retraso={120}>
        <div className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="rotulo">Quién publica el dato</p>
            <p className="rotulo normal-case tracking-[0.04em]">
              Dos de las seis están conectadas al prototipo
            </p>
          </div>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FUENTES.map((fuente) => (
              <li
                key={fuente.sigla}
                className="flex h-full flex-col rounded border border-linea bg-papel p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="mono text-[13px] font-medium tracking-[0.02em]">
                    {fuente.sigla}
                  </p>
                  <span
                    className={`rotulo flex items-center gap-1.5 whitespace-nowrap ${
                      fuente.vivo ? "text-verde" : ""
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`inline-block h-[7px] w-[7px] rounded-full ${
                        fuente.vivo
                          ? "bg-verde"
                          : "border border-tinta-tenue bg-transparent"
                      }`}
                    />
                    {fuente.vivo ? "En vivo" : "Citada"}
                  </span>
                </div>

                {fuente.nombre && (
                  <p className="mt-2 text-[12px] leading-snug text-tinta-tenue">
                    {fuente.nombre}
                  </p>
                )}
                <p className="mt-3 border-t border-linea-fina pt-3 text-[13px] leading-relaxed text-tinta-media">
                  {fuente.publica}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Revelar>

      {/* Cierre con la frase que cambió el planteamiento del proyecto. No es
          un testimonio de venta, es el hallazgo que obligó a bajar el análisis
          regional al nivel de una sede. */}
      <Revelar retraso={200}>
        <figure className="mt-16 max-w-2xl border-l-2 border-bermellon pl-5">
          <blockquote className="display text-[17px] leading-relaxed sm:text-[19px]">
            La empresa ya maneja análisis detallados de fenómenos naturales. El
            problema es que son generales y no aplican a las regiones donde
            opera.
          </blockquote>
          <figcaption className="rotulo mt-4">
            Hallazgo de la entrevista de validación · sector floricultor · ago
            2026
          </figcaption>
        </figure>
      </Revelar>
    </Seccion>
  );
}

/** Un eslabón de la cadena. El último es la consecuencia y va en bermellón. */
function Eslabon({
  rotulo,
  children,
  consecuencia = false,
}: {
  rotulo: string;
  children: ReactNode;
  consecuencia?: boolean;
}) {
  return (
    <li
      className={`flex h-full flex-col rounded border bg-papel p-5 ${
        consecuencia ? "border-bermellon" : "border-linea"
      }`}
    >
      <p className={`rotulo ${consecuencia ? "text-bermellon" : ""}`}>
        {rotulo}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed">{children}</p>
    </li>
  );
}

/** Flecha entre eslabones. Gira a vertical cuando la cadena se apila. */
function Flecha() {
  return (
    <li className="flex items-center justify-center py-1 lg:py-0" aria-hidden>
      <svg
        viewBox="0 0 36 14"
        className="h-3.5 w-9 rotate-90 text-tinta-tenue lg:rotate-0"
      >
        <path
          d="M1 7h30M25.5 2 31 7l-5.5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </li>
  );
}
