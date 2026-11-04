/**
 * Primitivas del sitio público.
 *
 * El landing y la aplicación comparten el mismo sistema visual (papel cálido,
 * tinta oscura, líneas finas, color con rol), pero no comparten escala: la
 * aplicación es densa porque muestra datos, y el sitio respira porque tiene que
 * sostener una lectura de arriba a abajo. Estas primitivas fijan esa escala una
 * sola vez para que ninguna sección la invente por su cuenta.
 */

import type { ReactNode } from "react";

/** Una sección con ancla propia, su propio ritmo vertical y ancho de lectura. */
export function Seccion({
  id,
  children,
  className = "",
  tono = "papel",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /** `alto` para alternar el fondo y separar bloques sin dibujar una línea. */
  tono?: "papel" | "alto" | "tinta" | "noche";
}) {
  const fondo = {
    papel: "",
    alto: "bg-papel-alto border-y border-linea",
    tinta: "bg-tinta text-papel",
    // `noche` es el mismo ambiente del hero. Se reserva para los dos momentos
    // que tienen que pegar fuerte, no para alternar fondos.
    noche: "noche-viva text-papel",
  }[tono];

  return (
    <section id={id} className={`ancla relative ${fondo} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
        {children}
      </div>
    </section>
  );
}

/**
 * Rótulo de sección: número de lámina y nombre, como el cajetín de un plano.
 * Es lo que le da al sitio la sensación de documento y no de folleto.
 */
export function RotuloSeccion({
  n,
  children,
  oscuro = false,
}: {
  n: string;
  children: ReactNode;
  oscuro?: boolean;
}) {
  // Sobre fondo oscuro no se puede usar `.rotulo`: esa clase declara su propio
  // `color` en globals.css fuera de las capas de Tailwind, así que le gana a
  // cualquier utilidad de color que se le ponga al lado. Se replica su aspecto
  // con utilidades para que el color sí obedezca.
  const aspecto = oscuro
    ? "mono text-[10px] uppercase tracking-[0.11em] text-[color-mix(in_srgb,var(--papel)_62%,transparent)]"
    : "rotulo";

  return (
    <p className={`${aspecto} flex items-center gap-3`}>
      <span className={oscuro ? "text-papel" : "text-bermellon"}>{n}</span>
      <span
        className={`inline-block h-px w-8 ${
          oscuro ? "bg-[color-mix(in_srgb,var(--papel)_35%,transparent)]" : "bg-linea"
        }`}
      />
      {children}
    </p>
  );
}

/** Titular de sección con bajada opcional. */
export function TituloSeccion({
  children,
  bajada,
  className = "",
}: {
  children: ReactNode;
  bajada?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-5 max-w-3xl ${className}`}>
      <h2 className="display text-[2.15rem] leading-[1.08] sm:text-[3rem] lg:text-[3.3rem]">
        {children}
      </h2>
      {/* El color de la bajada va declarado y no heredado: las secciones
          oscuras envuelven su texto en un span propio, así que este
          `text-tinta-media` solo manda donde el fondo es papel. */}
      {bajada && (
        <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-tinta-media sm:text-[17.5px]">
          {bajada}
        </p>
      )}
    </div>
  );
}

/** Botón de acción. `principal` es tinta sólida; `secundario` es contorno. */
export function Boton({
  href,
  children,
  variante = "principal",
  externo = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variante?: "principal" | "secundario" | "claro" | "contorno-claro";
  externo?: boolean;
  className?: string;
}) {
  const estilo = {
    principal:
      "bg-tinta text-papel border border-transparent shadow-[var(--sombra-media)] hover:bg-azul hover:shadow-[var(--sombra-alta)]",
    secundario:
      "border border-linea bg-papel-alto text-tinta shadow-[var(--sombra-baja)] hover:border-tinta hover:bg-papel hover:shadow-[var(--sombra-media)]",
    claro:
      "bg-papel text-tinta border border-transparent shadow-[var(--sombra-alta)] hover:bg-papel-alto",
    // Para fondos oscuros: el contorno es la única forma de poner un botón
    // secundario sobre noche sin abrir un agujero de papel en el fondo.
    "contorno-claro":
      "border border-[color-mix(in_srgb,var(--papel)_28%,transparent)] bg-[color-mix(in_srgb,var(--papel)_7%,transparent)] text-papel hover:border-papel hover:bg-[color-mix(in_srgb,var(--papel)_14%,transparent)]",
  }[variante];

  const Etiqueta = externo ? "a" : "a";

  return (
    <Etiqueta
      href={href}
      {...(externo ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`mono group inline-flex items-center justify-center gap-2.5 rounded px-5 py-3.5 text-[13px] uppercase tracking-[0.12em] transition ${estilo} ${className}`}
    >
      {children}
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden>
        <path
          d="M2 8h11M9 4l4 4-4 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Etiqueta>
  );
}

/**
 * Una cifra con su procedencia pegada.
 *
 * La regla del proyecto es que ninguna cifra aparece sin decir de dónde salió,
 * así que la fuente no es opcional en el tipo: no se puede olvidar.
 */
export function Cifra({
  valor,
  unidad,
  que,
  fuente,
  tono = "tinta",
}: {
  valor: string;
  unidad?: string;
  que: ReactNode;
  fuente: string;
  tono?: "tinta" | "bermellon" | "ocre" | "verde" | "azul";
}) {
  const color = {
    tinta: "",
    bermellon: "text-bermellon",
    ocre: "text-ocre",
    verde: "text-verde",
    azul: "text-azul",
  }[tono];

  return (
    <div className="lamina lamina-viva rounded-lg p-6">
      <p className={`display flex items-baseline gap-1.5 text-[3.1rem] leading-none ${color}`}>
        {valor}
        {unidad && <span className="text-xl">{unidad}</span>}
      </p>
      <p className="mt-4 text-[14px] leading-relaxed text-tinta-media">{que}</p>
      <p className="procedencia mt-4 border-t border-linea-fina pt-3">
        {fuente}
      </p>
    </div>
  );
}

/** Nota al pie de una sección: procedencia, advertencia o alcance. */
export function Nota({ children }: { children: ReactNode }) {
  return (
    <p className="mt-10 max-w-3xl border-l-2 border-linea pl-4 text-[13px] leading-relaxed text-tinta-media">
      {children}
    </p>
  );
}
