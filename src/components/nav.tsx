"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const secciones = [
  { href: "/datos", n: "01", etiqueta: "Centro de datos" },
  { href: "/sedes", n: "02", etiqueta: "Sedes y amenazas" },
  { href: "/simulacion", n: "03", etiqueta: "Simulación" },
  { href: "/priorizador", n: "04", etiqueta: "Priorizador" },
  { href: "/reporte", n: "05", etiqueta: "Reporte" },
];

export function Nav() {
  const ruta = usePathname();

  return (
    <nav className="-mb-px flex overflow-x-auto">
      {secciones.map((s) => {
        const activa = ruta === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={activa ? "page" : undefined}
            className={`group flex shrink-0 items-baseline gap-2 border-b-2 px-4 py-3 text-sm transition ${
              activa
                ? "border-bermellon text-tinta"
                : "border-transparent text-tinta-media hover:border-linea hover:text-tinta"
            }`}
          >
            <span
              className={`mono text-[10px] tracking-widest ${
                activa ? "text-bermellon" : "text-tinta-tenue"
              }`}
            >
              {s.n}
            </span>
            <span className={activa ? "font-medium" : ""}>{s.etiqueta}</span>
          </Link>
        );
      })}
    </nav>
  );
}
