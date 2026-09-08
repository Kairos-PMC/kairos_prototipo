import type { AmenazaId, TipoActivo } from "@/domain/tipos";

/**
 * Iconografía de línea, dibujada a mano.
 *
 * Los emoji se quitaron a propósito: dependen de la fuente del sistema, cambian
 * de estilo entre plataformas y traen color propio que pelea con la paleta. Un
 * trazo de 1.5 px hereda `currentColor` y se comporta como el resto del dibujo.
 */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const amenazas: Record<AmenazaId, React.ReactNode> = {
  inundacion: (
    <>
      <path d="M2 16c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 4-1.6" />
      <path d="M2 20c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 4-1.6" />
      <path d="M6 12V6l6-3 6 3v6" />
      <path d="M10 12V9h4v3" />
    </>
  ),
  granizada: (
    <>
      <path d="M6 11a4 4 0 0 1 .9-7.9A5 5 0 0 1 17 4a3.5 3.5 0 0 1 .5 7H6z" />
      <circle cx="8" cy="16" r="1.2" />
      <circle cx="12.5" cy="19" r="1.2" />
      <circle cx="16.5" cy="15.5" r="1.2" />
      <circle cx="11" cy="14.5" r="1.2" />
    </>
  ),
  "tormenta-electrica": (
    <>
      <path d="M6 11a4 4 0 0 1 .9-7.9A5 5 0 0 1 17 4a3.5 3.5 0 0 1 .5 7H6z" />
      <path d="M13 13l-3 4.5h3L11.5 22" />
    </>
  ),
  sismo: (
    <>
      <path d="M2 12h3l2.5-6 3 12 3-9 2 3h6.5" />
      <path d="M4 18.5h16" strokeDasharray="2 2.5" />
    </>
  ),
  sequia: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M12 1.5v1.5M12 13v1.5M5.5 8H4M20 8h-1.5M7.4 3.4 6.4 2.4M17.6 3.4l1-1M7.4 12.6l-1 1M17.6 12.6l1 1" />
      <path d="M4 19h16M6 22h12" strokeDasharray="3 2" />
    </>
  ),
  deslizamiento: (
    <>
      <path d="M2 20h20" />
      <path d="M3 20 10 7l4.5 7" />
      <path d="M12 20l5-8 5 8" />
      <path d="M9.5 11.5c1.5 1 2 3 1.5 4.5" strokeDasharray="2 2" />
    </>
  ),
  "incendio-forestal": (
    <>
      <path d="M12 22c3.9 0 6-2.4 6-5.4 0-3.9-3.4-5-4.6-8.6-1 1.4-1.4 2.6-1.4 4-1.2-.7-1.6-1.8-1.6-3.2C8.4 10.6 6 12.7 6 16.6 6 19.6 8.1 22 12 22z" />
      <path d="M12 22c-1.5 0-2.4-1-2.4-2.3 0-1.6 1.5-2.3 2.4-4 .9 1.7 2.4 2.4 2.4 4 0 1.3-.9 2.3-2.4 2.3z" />
    </>
  ),
};

export function IconoAmenaza({
  id,
  className = "h-5 w-5",
}: {
  id: AmenazaId;
  className?: string;
}) {
  return (
    <svg {...base} className={className} aria-hidden>
      {amenazas[id]}
    </svg>
  );
}

const activos: Record<TipoActivo, React.ReactNode> = {
  invernadero: (
    <>
      <path d="M3 20V10l9-5 9 5v10" />
      <path d="M3 20h18" />
      <path d="M12 5v15M7.5 7.5V20M16.5 7.5V20" />
    </>
  ),
  "cuarto-frio": (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M12 7.5v9M8.5 9.2l7 5.6M15.5 9.2l-7 5.6" />
    </>
  ),
  subestacion: (
    <>
      <path d="M6 21V7l6-4 6 4v14" />
      <path d="M4 21h16" />
      <path d="M12.8 9.5 10 14h3l-.8 4" />
    </>
  ),
  bodega: (
    <>
      <path d="M3 21V9l9-5 9 5v12" />
      <path d="M2 21h20" />
      <rect x="8" y="13" width="8" height="8" />
      <path d="M12 13v8" />
    </>
  ),
  riego: (
    <>
      <path d="M12 21a5 5 0 0 0 5-5c0-3.2-5-10-5-10S7 12.8 7 16a5 5 0 0 0 5 5z" />
      <path d="M12 17.5a1.5 1.5 0 0 1-1.5-1.5" />
    </>
  ),
  reservorio: (
    <>
      <ellipse cx="12" cy="7" rx="8" ry="3" />
      <path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" strokeDasharray="2 2" />
    </>
  ),
  via: (
    <>
      <path d="M7 3 4 21M17 3l3 18" />
      <path d="M12 4v3M12 10.5v3M12 17v3" />
    </>
  ),
  "planta-poscosecha": (
    <>
      <path d="M3 21V11l5 3V11l5 3V8l6-4v17" />
      <path d="M2 21h20" />
      <path d="M17 9h2M17 13h2" />
    </>
  ),
  flota: (
    <>
      <path d="M2 17V7h11v10" />
      <path d="M13 10h4l4 4v3h-8" />
      <circle cx="7" cy="17.5" r="2" />
      <circle cx="17.5" cy="17.5" r="2" />
    </>
  ),
  oficina: (
    <>
      <path d="M4 21V4h12v17" />
      <path d="M16 10h4v11" />
      <path d="M2 21h20" />
      <path d="M7.5 8h1.5M11.5 8H13M7.5 12h1.5M11.5 12H13M7.5 16h1.5M11.5 16H13" />
    </>
  ),
};

export function IconoActivo({
  tipo,
  className = "h-5 w-5",
}: {
  tipo: TipoActivo;
  className?: string;
}) {
  return (
    <svg {...base} className={className} aria-hidden>
      {activos[tipo]}
    </svg>
  );
}

/**
 * El mismo icono, pero sin su propio `<svg>`: para incrustarlo dentro de otro
 * dibujo (el plano de planta) escalándolo con un `transform`.
 */
export function TrazoActivo({
  tipo,
  grosor = 1.5,
}: {
  tipo: TipoActivo;
  grosor?: number;
}) {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {activos[tipo]}
    </g>
  );
}

/**
 * Logotipo.
 *
 * Tres fichas de dominó: la primera ya cayó, la segunda va cayendo arrastrada, y
 * la tercera queda en pie.
 *
 * El color no decora — son los mismos tres roles que usa la simulación, así que
 * la marca funciona como leyenda de la plataforma:
 *   bermellón → recibió el golpe
 *   ocre      → se detiene sin haber recibido daño
 *   verde     → sigue operando porque se invirtió en protegerla
 *
 * Es también el único argumento del producto que ningún competidor está
 * contando: lo que golpea el fenómeno rara vez es lo caro. En la sede de
 * Facatativá, una subestación de $240 M arrastra $5.600 M en invernaderos.
 *
 * ── Dos versiones, no dos opciones ───────────────────────────────────────────
 * `papel` es la de uso normal: dentro de la aplicación todas las superficies son
 * claras y la caja oscura pesa de más. `tinta` existe para donde hace falta un
 * ícono sólido —favicon, ícono de aplicación, un fondo que no controlamos—,
 * porque ahí una marca sin caja se pierde.
 *
 * El verde cambia entre las dos a propósito: el de tinta (#2c6446) se apaga
 * sobre el tile oscuro y deja de leerse como "en pie".
 */
export function Logotipo({
  className = "h-9 w-9",
  variante = "papel",
}: {
  className?: string;
  variante?: "papel" | "tinta";
}) {
  const sobreTinta = variante === "tinta";

  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      {sobreTinta ? (
        <rect width="40" height="40" rx="3" fill="var(--tinta)" />
      ) : (
        <rect
          width="40"
          height="40"
          rx="3"
          fill="var(--papel-alto)"
          stroke="var(--linea)"
          strokeWidth="0.9"
        />
      )}

      {/* Suelo */}
      <path
        d="M4 32.4h32"
        stroke={sobreTinta ? "var(--papel)" : "var(--tinta)"}
        strokeWidth="0.9"
        opacity={sobreTinta ? 0.32 : 0.25}
      />

      {/* Rayas de impulso: dan el movimiento y desaparecen limpio al reducir. */}
      <g
        stroke={sobreTinta ? "var(--papel)" : "var(--tinta)"}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity={sobreTinta ? 0.4 : 0.3}
      >
        <path d="M4.5 9.5h3M3 13.5h2.4" />
      </g>

      {/* Fichas: estrechas y juntas para que se lean como dominó y no como
          barras de un gráfico. La primera alcanza a la segunda, que es lo que
          hace visible la causalidad. */}
      <rect
        x="6.6"
        y="10"
        width="4.6"
        height="21"
        rx="0.9"
        fill="var(--bermellon)"
        transform="rotate(34 8.9 31)"
      />
      <rect
        x="16.4"
        y="10"
        width="4.6"
        height="21"
        rx="0.9"
        fill="var(--ocre)"
        transform="rotate(16 18.7 31)"
      />
      <rect
        x="26.2"
        y="10"
        width="4.6"
        height="21"
        rx="0.9"
        fill={sobreTinta ? "var(--verde-claro)" : "var(--verde)"}
      />
    </svg>
  );
}
