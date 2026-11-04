/**
 * Hero del sitio público.
 *
 * No usa `<Seccion>` porque necesita alto propio: es lo único que se ve sin
 * hacer scroll y tiene que sostener el titular, la bajada, las acciones y el
 * dibujo sin apretarlos. Por dentro repite el ancho de lectura del resto del
 * sitio para que nada quede desalineado al bajar.
 */

import { Boton } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";
import { Logotipo } from "@/components/iconos";

/** Cajetín inferior. Son hechos verificables del prototipo, no promesas. */
const CAJETIN = [
  "5 módulos funcionando",
  "Datos en vivo de USGS y Open-Meteo",
  "Sin cuentas y sin cookies",
  "ISIS 2007 · Universidad de los Andes",
];

export function Hero() {
  return (
    <section className="relative flex flex-col justify-center overflow-hidden border-b border-linea sm:min-h-[88dvh]">
      <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-28 sm:px-8 sm:pt-24 lg:pb-20 lg:pt-24">
        {/* Identidad y marca de tiempo, como el encabezado de una lámina. */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logotipo className="h-11 w-11" />
            <div>
              <p className="display text-xl leading-none">Kairos</p>
              <p className="rotulo mt-1.5">Simulador digital de riesgos</p>
            </div>
          </div>
          <p className="rotulo mt-1 whitespace-nowrap">Colombia · 2026</p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <Revelar>
              <h1 className="display text-[2.1rem] leading-[1.1] sm:text-[2.8rem] sm:leading-[1.08] lg:text-6xl">
                Lo que golpea el fenómeno rara vez es lo caro.
                <br />
                <span className="text-bermellon">
                  Lo caro es lo que ese golpe arrastra.
                </span>
              </h1>
            </Revelar>

            <Revelar retraso={140}>
              <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-tinta-media sm:text-[17px]">
                Kairos simula fenómenos naturales sobre las sedes de una empresa
                colombiana y le pone precio al efecto en cadena. Cae una
                subestación y la plataforma muestra qué activos se detienen sin
                haber recibido ningún golpe, cuánto cuesta eso, y en qué conviene
                invertir primero.
              </p>
            </Revelar>

            <Revelar retraso={260}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Boton href="/datos" variante="principal">
                  Entrar al prototipo
                </Boton>
                <Boton href="#como-funciona" variante="secundario">
                  Cómo funciona
                </Boton>
              </div>
            </Revelar>
          </div>

          <Revelar retraso={200}>
            <Fichas />
          </Revelar>
        </div>

        <Revelar retraso={340}>
          <ul className="mono mt-14 flex flex-col gap-3 border-t border-linea pt-5 text-[11px] leading-relaxed text-tinta-media sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-0 sm:gap-y-2">
            {CAJETIN.map((dato, i) => (
              <li
                key={dato}
                className={
                  i === 0
                    ? "sm:pr-4"
                    : "sm:border-l sm:border-linea-fina sm:px-4"
                }
              >
                {dato}
              </li>
            ))}
          </ul>
        </Revelar>
      </div>
    </section>
  );
}

/* ── El dibujo ─────────────────────────────────────────────────────────────
 *
 * Tres fichas de dominó sobre una línea de suelo: la primera ya cayó, la
 * segunda va a medio caer, la tercera sigue en pie. Es el producto entero en
 * una imagen, así que está dibujado a mano y no es un icono genérico.
 *
 * Geometría: cada ficha mide 48 x 150 y gira alrededor de su esquina inferior
 * derecha, que es el borde sobre el que pivota una ficha que cae hacia la
 * derecha. A 90 grados la ficha queda acostada en el suelo.
 */

const SUELO = 250;
const ALTO = 150;
const ANCHO = 48;
const TOPE = SUELO - ALTO;

/** Posición de reposo (borde izquierdo) de cada ficha antes de girar. */
const X_PRIMERA = 20;
const X_SEGUNDA = 228;
const X_TERCERA = 384;

/** Inclinación de la ficha a medio caer. */
const GIRO_SEGUNDA = 26;

/* Punta de la ficha inclinada. Se calcula en vez de escribirse a mano para que
   el arco de caída siga cuadrando si alguien cambia la inclinación. */
const RAD_SEGUNDA = (GIRO_SEGUNDA * Math.PI) / 180;
const PUNTA_SEGUNDA_X = X_SEGUNDA + ANCHO + ALTO * Math.sin(RAD_SEGUNDA);
const PUNTA_SEGUNDA_Y = SUELO - ALTO * Math.cos(RAD_SEGUNDA);

function Fichas() {
  return (
    <figure className="lamina lamina-esquina rounded p-5 sm:p-6">
      <figcaption className="rotulo flex items-center justify-between gap-4">
        <span>Efecto en cadena</span>
        <span>Fig. 00</span>
      </figcaption>

      <svg
        viewBox="0 0 470 320"
        className="mt-4 w-full"
        role="img"
        aria-label="Tres fichas de dominó sobre una línea de suelo. La primera ya cayó, la segunda se inclina a medio caer y la tercera sigue en pie."
      >
        {/* Una sola pasada al cargar. Nada en bucle, y solo si hay permiso
            para mover cosas en pantalla. */}
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .kairos-ficha { transform-box: view-box; }
            .kairos-cae-1 {
              transform-origin: ${X_PRIMERA + ANCHO}px ${SUELO}px;
              animation: kairos-cae-1 760ms cubic-bezier(0.45, 0, 0.9, 0.5) 260ms backwards;
            }
            .kairos-cae-2 {
              transform-origin: ${X_SEGUNDA + ANCHO}px ${SUELO}px;
              animation: kairos-cae-2 620ms cubic-bezier(0.4, 0, 0.8, 0.6) 880ms backwards;
            }
            .kairos-aguanta {
              transform-origin: ${X_TERCERA + ANCHO}px ${SUELO}px;
              animation: kairos-aguanta 900ms ease-in-out 1320ms backwards;
            }
            @keyframes kairos-cae-1 { from { transform: rotate(-90deg); } }
            @keyframes kairos-cae-2 { from { transform: rotate(-${GIRO_SEGUNDA}deg); } }
            @keyframes kairos-aguanta {
              0%, 30% { transform: rotate(0deg); }
              52% { transform: rotate(2.4deg); }
              74% { transform: rotate(-1.1deg); }
              100% { transform: rotate(0deg); }
            }
          }
        `}</style>

        {/* Arcos de caída: la trayectoria dibujada, en azul porque es
            estructura y no un evento. */}
        <g fill="none" stroke="var(--azul)" strokeWidth="0.9" strokeDasharray="3 4" opacity="0.4">
          <path
            d={`M ${X_PRIMERA + ANCHO} ${TOPE} A ${ALTO} ${ALTO} 0 0 1 ${X_PRIMERA + ANCHO + ALTO} ${SUELO}`}
          />
          <path
            d={`M ${X_SEGUNDA + ANCHO} ${TOPE} A ${ALTO} ${ALTO} 0 0 1 ${PUNTA_SEGUNDA_X.toFixed(1)} ${PUNTA_SEGUNDA_Y.toFixed(1)}`}
          />
        </g>

        {/* Suelo con rayado de corte, el gesto de un plano de sección. */}
        <line x1="14" y1={SUELO} x2="456" y2={SUELO} stroke="var(--azul)" strokeWidth="1" opacity="0.45" />
        {Array.from({ length: 32 }, (_, i) => 16 + i * 14).map((x) => (
          <line
            key={x}
            x1={x}
            y1={SUELO}
            x2={x - 9}
            y2={SUELO + 10}
            stroke="var(--azul)"
            strokeWidth="0.9"
            opacity="0.2"
          />
        ))}

        <Ficha x={X_PRIMERA} giro={90} color="var(--bermellon)" clase="kairos-cae-1" />
        <Ficha x={X_SEGUNDA} giro={GIRO_SEGUNDA} color="var(--ocre)" clase="kairos-cae-2" />
        <Ficha x={X_TERCERA} giro={0} color="var(--verde)" clase="kairos-aguanta" />

        {/* Los rótulos van bajo el suelo y repiten el titular en tres tiempos. */}
        <Rotulo x={143} color="var(--bermellon)" lineas={["LO QUE", "CAE"]} />
        <Rotulo x={287} color="var(--ocre)" lineas={["LO QUE", "ARRASTRA"]} />
        <Rotulo x={408} color="var(--verde)" lineas={["LO QUE", "SE SALVA"]} />
      </svg>
    </figure>
  );
}

/**
 * Una ficha. El giro final va en el atributo `transform` para que la pose
 * correcta exista aunque la animación nunca corra, y el grupo de fuera es el
 * que anima desde la posición de pie.
 */
function Ficha({
  x,
  giro,
  color,
  clase,
}: {
  x: number;
  giro: number;
  color: string;
  clase: string;
}) {
  const centro = x + ANCHO / 2;
  const medio = TOPE + ALTO / 2;

  return (
    <g className={`kairos-ficha ${clase}`}>
      <g transform={`rotate(${giro} ${x + ANCHO} ${SUELO})`}>
        <rect x={x} y={TOPE} width={ANCHO} height={ALTO} rx="3" fill="var(--papel-alto)" />
        <rect
          x={x}
          y={TOPE}
          width={ANCHO}
          height={ALTO}
          rx="3"
          fill={color}
          fillOpacity="0.11"
          stroke={color}
          strokeWidth="1.6"
        />
        <line
          x1={x + 7}
          y1={medio}
          x2={x + ANCHO - 7}
          y2={medio}
          stroke={color}
          strokeWidth="1.2"
          opacity="0.5"
        />
        <circle cx={centro} cy={TOPE + 37} r="5" fill={color} />
        <circle cx={centro - 9} cy={medio + 28} r="4.5" fill={color} />
        <circle cx={centro + 9} cy={medio + 47} r="4.5" fill={color} />
      </g>
    </g>
  );
}

function Rotulo({
  x,
  color,
  lineas,
}: {
  x: number;
  color: string;
  lineas: [string, string];
}) {
  return (
    <g className="mono" fill={color} fontSize="9.5" letterSpacing="1" textAnchor="middle">
      <text x={x} y={SUELO + 30} opacity="0.55">
        {lineas[0]}
      </text>
      <text x={x} y={SUELO + 43}>
        {lineas[1]}
      </text>
    </g>
  );
}
