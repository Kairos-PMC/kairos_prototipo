import type { ReactNode } from "react";

import { Nota, RotuloSeccion, Seccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";

/**
 * Lámina 03: los tres pasos.
 *
 * Cada paso trae un esquema dibujado a mano en SVG. No es adorno: es lo que
 * deja ver que los tres pasos son el mismo grafo mirado tres veces (se arma,
 * se golpea, se ordena). Los dibujos van en `aria-hidden` porque el texto de
 * al lado dice exactamente lo mismo.
 *
 * Ninguno lleva dígitos inventados. Donde el producto mostraría una cifra, el
 * esquema deja la ranura marcada con una barra, porque en este repo una cifra
 * sin procedencia no se dibuja.
 */

const CAJA = "0 0 240 140";

export function ComoFunciona() {
  return (
    <Seccion id="como-funciona" tono="papel">
      <Revelar>
        <RotuloSeccion n="03">Cómo funciona</RotuloSeccion>
        <TituloSeccion bajada={<>Sin jerga y sin pedirle al cliente que aprenda a leer un dato meteorológico.</>}>
          Mapear, cuantificar, priorizar.
        </TituloSeccion>
      </Revelar>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        <Revelar retraso={0}>
          <Paso
            n="01"
            titulo="Mapear"
            texto="La empresa arma la réplica de sus sedes. Edificios, cultivos, subestaciones, y qué depende de qué."
            dibujo={<EsquemaMapear />}
          />
        </Revelar>
        <Revelar retraso={120}>
          <Paso
            n="02"
            titulo="Cuantificar"
            texto="Cada fenómeno se cruza con cada activo. La salida son dos cifras, activos comprometidos y pesos que se perderían."
            dibujo={<EsquemaCuantificar />}
          />
        </Revelar>
        <Revelar retraso={240}>
          <Paso
            n="03"
            titulo="Priorizar"
            texto="Con un presupuesto dado, la plataforma ordena en qué invertir primero según cuánta pérdida evita cada peso."
            dibujo={<EsquemaPriorizar />}
          />
        </Revelar>
      </div>

      <Nota>
        Kairos informa decisiones y no las garantiza. No pronostica si un evento va a
        ocurrir ni cuándo. Estima el costo de no estar preparado, bajo supuestos que
        quedan a la vista y se pueden cambiar.
      </Nota>
    </Seccion>
  );
}

function Paso({
  n,
  titulo,
  texto,
  dibujo,
}: {
  n: string;
  titulo: string;
  texto: string;
  dibujo: ReactNode;
}) {
  return (
    <article className="lamina lamina-esquina flex h-full flex-col rounded p-6">
      <p className="rotulo flex items-center gap-3">
        <span className="text-bermellon">{n}</span>
        <span className="inline-block h-px w-7 bg-linea" />
      </p>
      <h3 className="display mt-4 text-[1.5rem] leading-none">{titulo}</h3>

      {/* El esquema va hundido sobre papel, como un recorte pegado en la lámina. */}
      <div className="mt-6 rounded border border-linea-fina bg-papel p-3">{dibujo}</div>

      <p className="mt-5 flex-1 text-[14px] leading-relaxed text-tinta-media">{texto}</p>
    </article>
  );
}

/** El perímetro de la sede con sus activos y las dependencias entre ellos. */
function EsquemaMapear() {
  return (
    <svg viewBox={CAJA} className="h-auto w-full" aria-hidden>
      <polygon
        points="20,32 142,20 204,52 196,108 48,116"
        fill="color-mix(in srgb, var(--azul) 7%, transparent)"
        stroke="var(--azul)"
        strokeWidth="1"
      />

      {/* Qué depende de qué. Son las líneas que después transmiten la falla. */}
      <g stroke="var(--azul)" strokeWidth="0.75">
        <line x1="66" y1="58" x2="124" y2="44" />
        <line x1="124" y1="44" x2="110" y2="90" />
        <line x1="110" y1="90" x2="170" y2="76" />
        <line x1="124" y1="44" x2="170" y2="76" />
      </g>

      <g fill="var(--papel-alto)" stroke="var(--azul)" strokeWidth="1.25">
        <rect x="61" y="53" width="10" height="10" />
        <rect x="119" y="39" width="10" height="10" />
        <circle cx="110" cy="90" r="5" />
        <circle cx="170" cy="76" r="5" />
      </g>

      {/* Cotas sin número: marcan que esto es un levantamiento, no un gráfico. */}
      <g stroke="var(--azul)" strokeWidth="0.75" opacity="0.5">
        <line x1="20" y1="130" x2="204" y2="130" />
        <line x1="20" y1="126" x2="20" y2="134" />
        <line x1="204" y1="126" x2="204" y2="134" />
        <line x1="222" y1="20" x2="222" y2="108" />
        <line x1="218" y1="20" x2="226" y2="20" />
        <line x1="218" y1="108" x2="226" y2="108" />
      </g>
    </svg>
  );
}

/** El mismo grafo con un activo caído y lo que arrastra aguas abajo. */
function EsquemaCuantificar() {
  return (
    <svg viewBox={CAJA} className="h-auto w-full" aria-hidden>
      <polygon
        points="16,32 112,22 156,50 148,106 40,114"
        fill="color-mix(in srgb, var(--azul) 7%, transparent)"
        stroke="var(--azul)"
        strokeWidth="1"
      />

      {/* El tramo que no se vio afectado sigue en azul: es estructura, no falla. */}
      <line x1="112" y1="44" x2="128" y2="34" stroke="var(--azul)" strokeWidth="0.75" />
      <circle
        cx="130"
        cy="32"
        r="4"
        fill="var(--papel-alto)"
        stroke="var(--azul)"
        strokeWidth="1.25"
      />

      {/* La cascada: del activo que cae hacia los que dependen de él. */}
      <g stroke="var(--bermellon)" strokeWidth="1.1">
        <line x1="74" y1="48" x2="112" y2="78" />
        <line x1="74" y1="48" x2="56" y2="94" />
      </g>

      <rect
        x="68"
        y="42"
        width="12"
        height="12"
        fill="color-mix(in srgb, var(--bermellon) 18%, transparent)"
        stroke="var(--bermellon)"
        strokeWidth="1.5"
      />
      <g fill="var(--papel-alto)" stroke="var(--ocre)" strokeWidth="1.5">
        <circle cx="112" cy="78" r="5" />
        <circle cx="56" cy="94" r="5" />
      </g>

      {/* Las dos cifras de salida. Las ranuras van marcadas con barra y no con
          dígitos: aquí no hay fuente que las sostenga. */}
      <line x1="176" y1="24" x2="176" y2="118" stroke="var(--linea)" strokeWidth="1" />
      <g className="mono" fill="var(--tinta-tenue)" fontSize="7" letterSpacing="0.8">
        <text x="186" y="52">ACTIVOS</text>
        <text x="186" y="92">PESOS</text>
      </g>
      <rect x="186" y="58" width="30" height="5" fill="var(--bermellon)" />
      <rect x="186" y="98" width="44" height="5" fill="var(--ocre)" />
    </svg>
  );
}

/** Pérdida evitada por peso invertido, de mayor a menor, contra el presupuesto. */
function EsquemaPriorizar() {
  return (
    <svg viewBox={CAJA} className="h-auto w-full" aria-hidden>
      <line x1="28" y1="26" x2="28" y2="120" stroke="var(--linea)" strokeWidth="1" />

      <rect
        x="28"
        y="42"
        width="168"
        height="14"
        fill="color-mix(in srgb, var(--verde) 90%, transparent)"
      />
      <rect
        x="28"
        y="70"
        width="118"
        height="14"
        fill="color-mix(in srgb, var(--verde) 60%, transparent)"
      />
      {/* La tercera no alcanza el corte: queda dibujada y sin financiar. */}
      <rect
        x="28"
        y="98"
        width="74"
        height="14"
        fill="none"
        stroke="var(--verde)"
        strokeWidth="1"
        strokeDasharray="3 2"
      />

      {/* El corte va en tinta tenue y no en ocre: no es dinero en riesgo, es
          el límite de lo que hay para invertir. */}
      <line
        x1="112"
        y1="24"
        x2="112"
        y2="122"
        stroke="var(--tinta-tenue)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text
        x="117"
        y="20"
        className="mono"
        fill="var(--tinta-tenue)"
        fontSize="7"
        letterSpacing="0.8"
      >
        PRESUPUESTO
      </text>
    </svg>
  );
}
