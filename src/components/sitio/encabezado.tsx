"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logotipo } from "@/components/iconos";

/**
 * Las secciones del landing, en el orden en que se leen. El número es el de la
 * lámina y se muestra en el menú porque el sitio se comporta como un documento
 * con índice, no como una barra de navegación de producto.
 */
const secciones = [
  { id: "problema", n: "01", etiqueta: "El problema" },
  { id: "por-que-ahora", n: "02", etiqueta: "Por qué ahora" },
  { id: "como-funciona", n: "03", etiqueta: "Cómo funciona" },
  { id: "prototipo", n: "04", etiqueta: "El prototipo" },
  { id: "validacion", n: "05", etiqueta: "Validación" },
  { id: "modelo", n: "06", etiqueta: "Modelo" },
  { id: "equipo", n: "07", etiqueta: "Equipo" },
];

export function Encabezado() {
  // El encabezado nace invisible sobre el hero y aparece al bajar. Así el hero
  // se ve entero y la barra no compite con el titular.
  const [pegado, setPegado] = useState(false);
  const [activa, setActiva] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alScroll = () => setPegado(window.scrollY > 120);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  // Marca la sección en pantalla. El umbral está arriba del viewport para que
  // la marca cambie cuando la sección llega al encabezado, no cuando entra por
  // abajo.
  useEffect(() => {
    const nodos = secciones
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => n !== null);

    if (nodos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visibles = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibles[0]) setActiva(visibles[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );

    nodos.forEach((n) => observador.observe(n));
    return () => observador.disconnect();
  }, []);

  // Antes de bajar, el encabezado flota sobre el hero, que es oscuro. Si
  // mantuviera la tinta del resto del sitio sería ilegible, así que arriba va
  // en claro y cambia a papel en cuanto se pega.
  const sobreOscuro = !pegado;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        pegado
          ? "border-b border-linea bg-[color-mix(in_srgb,var(--papel)_88%,transparent)] backdrop-blur"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-6 py-3 sm:px-8">
        {/* El hero ya trae su propia identidad justo debajo. Mostrar acá el
            logotipo antes de bajar lo dibujaría dos veces en la misma columna,
            así que la marca del encabezado solo aparece cuando el hero se fue. */}
        <Link
          href="/"
          aria-hidden={!pegado}
          tabIndex={pegado ? undefined : -1}
          className={`flex shrink-0 items-center gap-2.5 transition-opacity duration-300 ${
            pegado ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Logotipo className="h-8 w-8" />
          <span className="display text-base leading-none">Kairos</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {secciones.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`mono rounded px-2.5 py-1.5 text-[11px] uppercase tracking-[0.1em] transition ${
                sobreOscuro
                  ? "text-[color-mix(in_srgb,var(--papel)_68%,transparent)] hover:bg-[color-mix(in_srgb,var(--papel)_10%,transparent)] hover:text-papel"
                  : activa === s.id
                    ? "text-tinta"
                    : "text-tinta-media hover:bg-papel-hundido hover:text-tinta"
              }`}
            >
              <span
                className={
                  sobreOscuro
                    ? "text-[color-mix(in_srgb,var(--papel)_45%,transparent)]"
                    : activa === s.id
                      ? "text-bermellon"
                      : "text-tinta-tenue"
                }
              >
                {s.n}
              </span>{" "}
              {s.etiqueta}
            </a>
          ))}
        </nav>

        <Link
          href="/datos"
          className={`mono ml-auto shrink-0 rounded px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] transition lg:ml-4 ${
            sobreOscuro
              ? "bg-papel text-tinta shadow-[var(--sombra-alta)] hover:bg-papel-alto"
              : "bg-tinta text-papel hover:bg-azul"
          }`}
        >
          {/* En pantallas angostas el rótulo largo empuja al botón de índice
              contra el borde, así que ahí se dice lo mismo en una palabra. */}
          <span className="sm:hidden">Entrar</span>
          <span className="hidden sm:inline">Entrar al prototipo</span>
        </Link>

        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-label="Índice de secciones"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded border transition lg:hidden ${
            sobreOscuro
              ? "border-[color-mix(in_srgb,var(--papel)_28%,transparent)] bg-[color-mix(in_srgb,var(--papel)_8%,transparent)] text-papel"
              : "border-linea bg-papel-alto text-tinta"
          }`}
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <path
              d={abierto ? "M4 4l8 8M12 4l-8 8" : "M2 4.5h12M2 8h12M2 11.5h12"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {abierto && (
        <nav className="border-t border-linea bg-papel-alto lg:hidden">
          <div className="mx-auto max-w-6xl px-6 py-2 sm:px-8">
            {secciones.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setAbierto(false)}
                className="mono flex items-baseline gap-3 border-b border-linea-fina py-3 text-sm last:border-0"
              >
                <span className="text-[10px] tracking-widest text-tinta-tenue">
                  {s.n}
                </span>
                {s.etiqueta}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
