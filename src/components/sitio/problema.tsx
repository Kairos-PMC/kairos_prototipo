/**
 * Sección 01: el problema.
 *
 * El argumento no es que falten datos. Es que los datos existen y nadie los
 * baja a una sede concreta con un precio al lado. La sección está construida
 * para que esa distinción se vea antes de leerla: la cadena de tres eslabones
 * junto al dibujo que la resume, y después, en voz baja, las fuentes que ya
 * publican todo eso.
 *
 * El fondo es papel y no papel alto para que las láminas tengan de dónde
 * despegarse. Con los dos tonos iguales la elevación no se ve.
 */

import type { ReactNode } from "react";

import { RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Fichas } from "@/components/sitio/hero";
import { Revelar } from "@/components/sitio/revelar";

/* El rótulo con color propio no puede construirse sobre `.rotulo`: esa clase
   declara su color fuera de las capas de Tailwind, así que le gana a cualquier
   utilidad que se le ponga al lado. Se replica su aspecto con utilidades. */
const ROTULO = "mono text-[10px] uppercase tracking-[0.11em]";

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
    <Seccion id="problema" tono="papel">
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

      {/* La cadena y el dibujo van lado a lado porque dicen lo mismo en dos
          idiomas. Las fichas se entienden de un vistazo y preparan la lectura
          del tercer eslabón, que es donde el argumento cobra el precio. */}
      <div className="mt-14 grid items-start gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14">
        <Revelar>
          <ol className="space-y-4">
            {CADENA.map((eslabon, i) => (
              <Eslabon key={eslabon.n} rotulo={eslabon.rotulo} peso={i}>
                {eslabon.texto}
              </Eslabon>
            ))}
          </ol>
        </Revelar>

        <Revelar retraso={120}>
          <Fichas />
        </Revelar>
      </div>

      {/* Procedencia de los datos. Es una tabla de referencia y no un
          argumento, así que va densa, sin cajas y en voz baja. */}
      <Revelar retraso={120}>
        <div className="mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="rotulo">Quién publica el dato</p>
            <p className="procedencia">
              Dos de las seis están conectadas al prototipo
            </p>
          </div>

          <ul className="mt-2 grid gap-x-12 sm:grid-cols-2">
            {FUENTES.map((fuente) => (
              <li
                key={fuente.sigla}
                className="border-t border-linea-fina py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  {/* La sigla conserva su caja original. Mayúsculas forzadas
                      le cambiarían el nombre a DesInventar y a Open-Meteo. */}
                  <p className="mono text-[12px] font-medium tracking-[0.03em] text-tinta">
                    {fuente.sigla}
                  </p>
                  {/* El punto late solo donde el dato llega de un API en
                      vivo. Sobre las otras cuatro sería mentira. */}
                  {fuente.vivo && (
                    <span className="pildora pildora-papel">
                      <span className="latido" aria-hidden />
                      En vivo
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-tinta-tenue">
                  {fuente.nombre ? `${fuente.nombre}. ` : ""}
                  {fuente.publica}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Revelar>

      {/* Cierre con la frase que cambió el planteamiento del proyecto. No es
          un testimonio de venta, es el hallazgo que obligó a bajar el análisis
          regional al nivel de una sede. Va en lámina grande porque es lo
          último que queda en la cabeza al salir de la sección. */}
      <Revelar retraso={200}>
        <figure className="lamina mt-20 max-w-3xl rounded-lg p-7 sm:p-9">
          <blockquote className="display text-[19px] leading-[1.5] sm:text-[23px]">
            La empresa ya maneja análisis detallados de fenómenos naturales. El
            problema es que son generales y no aplican a las regiones donde
            opera.
          </blockquote>
          <figcaption className="procedencia mt-6 border-t border-linea-fina pt-4">
            Hallazgo de la entrevista de validación · sector floricultor · ago
            2026
          </figcaption>
        </figure>
      </Revelar>
    </Seccion>
  );
}

/**
 * Un eslabón de la cadena.
 *
 * El peso crece con la posición porque esto es una progresión y no tres cajas
 * iguales: la causa raíz se enuncia, la brecha se afirma y la consecuencia se
 * dice en serif, con filete bermellón, porque es la falla que paga la empresa.
 */
function Eslabon({
  rotulo,
  children,
  peso,
}: {
  rotulo: string;
  children: ReactNode;
  /** 0, 1 o 2 según la posición en la cadena. */
  peso: number;
}) {
  const caja = ["p-5", "p-6", "filete p-6 sm:p-7"][peso];
  const color = ["text-tinta-tenue", "text-tinta-media", "text-bermellon"][peso];
  const cuerpo = [
    "mt-2.5 text-[15px] leading-relaxed text-tinta-media",
    "mt-3 text-[15.5px] leading-relaxed",
    "display mt-3.5 text-[17px] leading-snug sm:text-[19px]",
  ][peso];

  return (
    <li className={`lamina rounded-lg ${caja}`}>
      <p className={`${ROTULO} ${color}`}>{rotulo}</p>
      <p className={cuerpo}>{children}</p>
    </li>
  );
}
