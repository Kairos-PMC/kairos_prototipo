import type { ReactNode } from "react";

import { RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/**
 * Lámina 02: la urgencia.
 *
 * Es la única sección sobre fondo tinta, así que no puede usar <Cifra>: esa
 * primitiva está construida sobre `.lamina`, que es papel claro. Las tarjetas
 * de aquí se arman a mano pero conservan la misma estructura de información
 * (cifra, qué es, fuente al pie tras una línea fina), porque la fuente es lo
 * único de esa estructura que no se puede perder.
 */

/* Tokens del fondo oscuro, en un solo lugar: si el contraste hay que
   recalibrarlo, se recalibra una vez y no tarjeta por tarjeta. */
const BORDE = "border-[color-mix(in_srgb,var(--papel)_18%,transparent)]";
const RELLENO = "bg-[color-mix(in_srgb,var(--papel)_5%,transparent)]";
const SECUNDARIO = "text-[color-mix(in_srgb,var(--papel)_70%,transparent)]";
const PROCEDENCIA = "text-[color-mix(in_srgb,var(--papel)_48%,transparent)]";
const FILETE = "border-[color-mix(in_srgb,var(--papel)_14%,transparent)]";

export function PorQueAhora() {
  return (
    <Seccion id="por-que-ahora" tono="tinta">
      {/* La trama de plano va de fondo a sangre, no dentro del ancho de
          lectura, por eso se posiciona contra la sección entera. */}
      <div aria-hidden className="reticula-oscura pointer-events-none absolute inset-0" />

      <div className="relative">
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

        <div className="mt-14 space-y-4">
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            es la frase con la que se sale de la sección. */}
        <Revelar retraso={120}>
          <div className={`mt-10 flex flex-col gap-3 border-t ${FILETE} pt-6 sm:flex-row sm:items-baseline sm:gap-8`}>
            <p className="text-[15px] leading-relaxed text-papel sm:flex-1">
              El Servicio Geológico Colombiano tiene más de 200 estaciones sísmicas
              activas. El país no cuenta con una red pública de alerta temprana.
            </p>
            <p className={`mono text-[10px] leading-relaxed tracking-[0.06em] ${PROCEDENCIA} sm:max-w-[16rem] sm:text-right`}>
              Servicio Geológico Colombiano, red de vigilancia sismológica
            </p>
          </div>
        </Revelar>
      </div>
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
  /** La cifra que abre la sección: misma información, otro tamaño. */
  destacada?: boolean;
}) {
  const color = {
    papel: "text-papel",
    /* Sobre tinta el bermellón de tinta se apaga. Se levanta con papel, igual
       que el sistema ya hace con --verde-claro para este mismo caso. */
    bermellon: "text-[color-mix(in_srgb,var(--bermellon)_78%,var(--papel))]",
    verde: "text-verde-claro",
  }[tono];

  /* La procedencia no usa `.rotulo` aunque sea su mismo aspecto: esa clase
     trae color tinta-tenue sin pasar por las utilidades de Tailwind, y aquí
     el color lo tiene que decidir el fondo oscuro. */
  const procedencia = `mono border-t ${FILETE} pt-3 text-[10px] leading-relaxed tracking-[0.05em] ${PROCEDENCIA}`;

  if (destacada) {
    return (
      <div
        className={`rounded border ${BORDE} ${RELLENO} p-7 sm:p-9 lg:flex lg:items-start lg:gap-12`}
      >
        <p className={`display text-[4.5rem] leading-[0.85] sm:text-[6.5rem] ${color}`}>
          {valor}
        </p>
        <div className="mt-6 lg:mt-2 lg:max-w-lg">
          <p className={`text-[15px] leading-relaxed ${SECUNDARIO}`}>{que}</p>
          <p className={`${procedencia} mt-5`}>{fuente}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col rounded border ${BORDE} ${RELLENO} p-6`}>
      <p
        className={`display flex flex-wrap items-baseline gap-x-2 text-[2.4rem] leading-none ${color}`}
      >
        {valor}
      </p>
      <p className={`mt-4 flex-1 text-[14px] leading-relaxed ${SECUNDARIO}`}>{que}</p>
      <p className={`${procedencia} mt-5`}>{fuente}</p>
    </div>
  );
}
