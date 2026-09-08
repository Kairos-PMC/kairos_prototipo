"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const secciones = [
  { href: "/datos", etiqueta: "Centro de datos", pista: "Fuentes públicas" },
  { href: "/sedes", etiqueta: "Sedes y amenazas", pista: "Dónde estoy expuesto" },
  { href: "/plano", etiqueta: "Plano de sitio", pista: "Qué depende de qué" },
  { href: "/simulacion", etiqueta: "Simulación", pista: "Cuánto perdería" },
  { href: "/priorizador", etiqueta: "Priorizador", pista: "En qué invertir" },
  { href: "/reporte", etiqueta: "Reporte", pista: "Para el comité" },
];

export function Nav() {
  const ruta = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {secciones.map((s, i) => {
        const activa = ruta === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={activa ? "page" : undefined}
            className={`group flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
              activa
                ? "bg-[var(--fondo-panel-alto)] text-[var(--texto)]"
                : "text-[var(--texto-tenue)] hover:bg-[var(--fondo-panel)] hover:text-[var(--texto)]"
            }`}
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-semibold ${
                activa
                  ? "bg-[var(--acento)] text-[#1a1200]"
                  : "bg-[var(--borde)] text-[var(--texto-tenue)]"
              }`}
            >
              {i + 1}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-medium">{s.etiqueta}</span>
              <span className="text-[11px] text-[var(--texto-tenue)]">{s.pista}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
