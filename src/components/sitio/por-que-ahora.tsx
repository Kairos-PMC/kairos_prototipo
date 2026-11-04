import type { ReactNode } from "react";

import { RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/**
 * Lámina 02: la urgencia.
 *
 * Va sobre noche, el mismo ambiente del hero, porque es el otro momento de la
 * página que tiene que pegar fuerte. Por eso no puede usar <Cifra>: esa
 * primitiva está construida sobre `.lamina`, que es papel claro. Las cifras de
 * aquí se arman a mano pero conservan la misma estructura de información
 * (cifra, qué es, fuente al pie tras una línea fina), porque la fuente es lo
 * único de esa estructura que no se puede perder.
 *
 * El 7,4 va enorme y sin caja. Es el gancho emocional de toda la página y una
 * caja alrededor solo lo volvería una cifra más del tablero.
 */

/* Tokens del fondo oscuro, en un solo lugar: si el contraste hay que
   recalibrarlo, se recalibra una vez y no tarjeta por tarjeta. */
const BORDE = "border-[color-mix(in_srgb,var(--papel)_18%,transparent)]";
const RELLENO = "bg-[color-mix(in_srgb,var(--papel)_5%,transparent)]";
const SECUNDARIO = "text-[color-mix(in_srgb,var(--papel)_70%,transparent)]";
const PROCEDENCIA = "text-[color-mix(in_srgb,var(--papel)_48%,transparent)]";
const HILO = "border-[color-mix(in_srgb,var(--papel)_14%,transparent)]";

export function PorQueAhora() {
  return (
    <Seccion id="por-que-ahora" tono="noche">
      <Revelar>
        <RotuloSeccion n="02" oscuro>
          Por qué ahora
        </RotuloSeccion>
        <TituloSeccion
          bajada={
            <span className={SECUNDARIO}>
              Agosto de 2026 dejó el sismo más fuerte en más de un siglo. Después de un
              evento así el presupuesto de prevención se aprueba. Unos meses más tarde,
              no.
            </span>
          }
        >
          La ventana está abierta y no dura.
        </TituloSeccion>
      </Revelar>

      <div className="mt-16 space-y-12 lg:mt-20">
        <Revelar>
          <CifraOscura
            destacada
            tono="bermellon"
            valor="7,4"
            que={
              <>
                Magnitud del sismo más fuerte registrado en Colombia en más de un siglo.
                Dejó cientos de víctimas y daños graves en infraestructura y
                comunicaciones.
              </>
            }
            fuente="Agosto de 2026"
          />
        </Revelar>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Revelar retraso={80}>
            <CifraOscura
              valor={
                <>
                  83
                  <span className="text-[1.15rem]">de cada 100</span>
                </>
              }
              que={<>Colombianos que viven en zona de riesgo sísmico alto o medio.</>}
              fuente="Propuesta legislativa presentada en el Senado tras el sismo, agosto de 2026"
            />
          </Revelar>

          <Revelar retraso={160}>
            <CifraOscura
              tono="verde"
              valor={
                <>
                  15 %<span className="text-[1.15rem]">y 78 días</span>
                </>
              }
              que={
                <>
                  Menos costo por incidente en organizaciones con programa de
                  continuidad, y 78 días menos para identificarlo y contenerlo.
                </>
              }
              fuente="IBM / Ponemon"
            />
          </Revelar>

          <Revelar retraso={240}>
            <CifraOscura
              valor="3.251"
              que={
                <>
                  Empresas grandes en los cuatro sectores del segmento inicial.
                  Manufactura 1.920, construcción 756, agropecuario 393, minero 182.
                </>
              }
              fuente="Las 10.000 empresas más grandes de Colombia 2024, Colfirma. Es el techo del segmento inicial, no el mercado total."
            />
          </Revelar>
        </div>
      </div>

      {/* El remate va sin tarjeta a propósito: no es una cifra más del tablero,
          es la frase con la que se sale de la sección. El filete le da el peso
          que antes le daba una línea de 1px cruzando la página. */}
      <Revelar retraso={120}>
        <div className="filete mt-14 flex flex-col gap-4 pl-6 sm:flex-row sm:items-baseline sm:gap-10">
          <p className="text-[16px] leading-relaxed text-papel sm:flex-1 sm:text-[17px]">
            El Servicio Geológico Colombiano tiene más de 200 estaciones sísmicas
            activas. El país no cuenta con una red pública de alerta temprana.
          </p>
          <p
            className={`mono text-[10px] leading-relaxed tracking-[0.06em] ${PROCEDENCIA} sm:max-w-[16rem] sm:text-right`}
          >
            Servicio Geológico Colombiano, red de vigilancia sismológica
          </p>
        </div>
      </Revelar>
    </Seccion>
  );
}

function CifraOscura({
  valor,
  que,
  fuente,
  tono = "papel",
  destacada = false,
}: {
  valor: ReactNode;
  que: ReactNode;
  fuente: string;
  tono?: "papel" | "bermellon" | "verde";
  /** La cifra que abre la sección: misma información, otra escala. */
  destacada?: boolean;
}) {
  const color = {
    papel: "text-papel",
    /* Sobre noche el bermellón de tinta se apaga. Se levanta con papel, igual
       que el sistema ya hace con --verde-claro para este mismo caso. */
    bermellon: "text-[color-mix(in_srgb,var(--bermellon)_78%,var(--papel))]",
    verde: "text-verde-claro",
  }[tono];

  /* La procedencia no usa `.rotulo` aunque sea su mismo aspecto: esa clase
     trae color tinta-tenue sin pasar por las utilidades de Tailwind, y aquí
     el color lo tiene que decidir el fondo oscuro. */
  const procedencia = `mono border-t ${HILO} pt-3 text-[10px] leading-relaxed tracking-[0.05em] ${PROCEDENCIA}`;

  if (destacada) {
    return (
      <div className="lg:flex lg:items-center lg:gap-16">
        <p
          className={`display text-[8rem] leading-[0.78] sm:text-[11.5rem] lg:shrink-0 lg:text-[13.5rem] ${color}`}
        >
          {valor}
        </p>
        <div className="mt-7 lg:mt-0 lg:max-w-md">
          <p className={`text-[16px] leading-relaxed sm:text-[17px] ${SECUNDARIO}`}>{que}</p>
          <p className={`${procedencia} mt-6`}>{fuente}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`lamina-viva flex h-full flex-col rounded-xl border ${BORDE} ${RELLENO} p-7`}
    >
      <p
        className={`display flex flex-wrap items-baseline gap-x-2 text-[3rem] leading-none ${color}`}
      >
        {valor}
      </p>
      <p className={`mt-5 flex-1 text-[14.5px] leading-relaxed ${SECUNDARIO}`}>{que}</p>
      <p className={`${procedencia} mt-6`}>{fuente}</p>
    </div>
  );
}
