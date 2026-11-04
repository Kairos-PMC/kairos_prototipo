/**
 * Hero del sitio público.
 *
 * Va en oscuro y con el producto encendido encima. La versión anterior era
 * papel sobre papel con un dibujo de contorno al lado, y a tres metros de
 * distancia eso no se lee como un producto sino como un documento a medio
 * hacer. Aquí la primera pantalla hace una sola cosa: mostrar el software
 * funcionando, grande, con luz propia.
 *
 * No usa `<Seccion>` porque necesita alto y fondo propios.
 */

import Image from "next/image";

import { Boton } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";
import { Logotipo } from "@/components/iconos";

/** Hechos verificables del prototipo. Ninguno es una promesa. */
const SELLOS = [
  { texto: "5 módulos funcionando", vivo: false },
  { texto: "Datos en vivo de USGS y Open-Meteo", vivo: true },
  { texto: "Sin cuentas y sin cookies", vivo: false },
  { texto: "Universidad de los Andes", vivo: false },
];

export function Hero() {
  return (
    <section className="noche-viva relative overflow-hidden text-papel">
      {/* Filo inferior: corta el bloque oscuro con una línea de luz en vez de
          un borde duro, para que el paso al papel no sea un escalón. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[color-mix(in_srgb,var(--papel)_18%,transparent)]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-0 pt-28 sm:px-8 sm:pt-32 lg:pt-36">
        {/* Identidad. En el hero sí se muestra, porque el encabezado la oculta
            hasta que el usuario baja. */}
        <Revelar>
          <div className="flex items-center gap-3">
            <Logotipo className="h-10 w-10" />
            <div>
              <p className="display text-lg leading-none">Kairos</p>
              <p className="mono mt-1.5 text-[10px] uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--papel)_55%,transparent)]">
                Simulador digital de riesgos
              </p>
            </div>
          </div>
        </Revelar>

        <Revelar retraso={80}>
          <div className="mt-10 flex flex-wrap gap-2.5">
            <span className="pildora pildora-clara">
              <span className="latido" aria-hidden />
              Prototipo funcionando
            </span>
            <span className="pildora pildora-clara">Colombia · 2026</span>
          </div>
        </Revelar>

        <Revelar retraso={140}>
          {/* El corte entre las dos frases es el chiste del titular, así que
              existe en todos los anchos y no solo en escritorio. */}
          <h1 className="display mt-7 max-w-4xl text-[2.15rem] leading-[1.07] sm:text-[3.4rem] lg:text-[4.1rem]">
            Lo que golpea el fenómeno rara vez es lo caro.
            <br />
            <span className="text-[color-mix(in_srgb,var(--bermellon)_45%,#ff9b86)]">
              Lo caro es lo que ese golpe arrastra.
            </span>
          </h1>
        </Revelar>

        <Revelar retraso={220}>
          <p className="mt-7 max-w-2xl text-[16.5px] leading-relaxed text-[color-mix(in_srgb,var(--papel)_72%,transparent)] sm:text-[18px]">
            Kairos simula fenómenos naturales sobre las sedes de una empresa
            colombiana y le pone precio al efecto en cadena. Cae una subestación
            y la plataforma muestra qué activos se detienen sin haber recibido
            ningún golpe, cuánto cuesta eso, y en qué conviene invertir primero.
          </p>
        </Revelar>

        <Revelar retraso={300}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Boton href="/datos" variante="claro">
              Entrar al prototipo
            </Boton>
            <Boton href="#prototipo" variante="contorno-claro">
              Ver la simulación
            </Boton>
          </div>
        </Revelar>

        {/* La pantalla. Está pegada al borde inferior a propósito: se corta con
            el pliegue y eso es lo que invita a bajar. */}
        <Revelar retraso={360}>
          <div className="aurora relative mt-16 sm:mt-20">
            <figure className="pantalla relative z-10 mx-auto max-w-5xl">
              <div className="pantalla-barra">
                <span className="pantalla-punto" />
                <span className="pantalla-punto" />
                <span className="pantalla-punto" />
                <span className="mono ml-3 truncate text-[10.5px] tracking-[0.07em] text-[color-mix(in_srgb,var(--papel)_42%,transparent)]">
                  kairos · simulación · finca la esperanza
                </span>
              </div>
              <Image
                src="/simulacion-poster.png"
                alt="La plataforma Kairos mostrando una finca en Facatativá con la subestación eléctrica caída, las instalaciones que quedaron fuera de operación en cadena y el costo del evento en 440 millones de pesos."
                width={1280}
                height={760}
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="block h-auto w-full"
              />
            </figure>
          </div>
        </Revelar>

        <Revelar retraso={420}>
          <ul className="relative z-10 mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-2.5 pb-16 sm:pb-20">
            {SELLOS.map((s) => (
              <li key={s.texto} className="pildora pildora-clara">
                {s.vivo && <span className="latido" aria-hidden />}
                {s.texto}
              </li>
            ))}
          </ul>
        </Revelar>
      </div>
    </section>
  );
}

/* ── El dibujo de las fichas ─────────────────────────────────────────────────
 *
 * Tres fichas de dominó sobre una línea de suelo: la primera ya cayó, la
 * segunda va a medio caer, la tercera sigue en pie. Es la tesis del producto en
 * una imagen. Salió del hero porque ahí competía con el producto de verdad, y
 * ahora acompaña a la sección que explica el problema, que es donde una
 * metáfora sí hace falta.
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

export function Fichas() {
  return (
    <figure className="lamina rounded-lg p-5 sm:p-6">
      <figcaption className="rotulo flex items-center justify-between gap-4">
        <span>Efecto en cadena</span>
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

        {/* Los rótulos van bajo el suelo y repiten la tesis en tres tiempos. */}
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
