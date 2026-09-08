import Link from "next/link";
import { Nav } from "@/components/nav";
import { empresaDemo } from "@/data/empresa-demo";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-[var(--borde)] bg-[color-mix(in_srgb,var(--fondo)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
          <Link href="/datos" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--acento)] text-[#1a1200]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path
                  d="M12 3v18M4 14l4-5 3 4 3-6 6 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-base font-semibold tracking-tight">Kairos</span>
          </Link>

          <div className="order-3 w-full lg:order-2 lg:w-auto lg:flex-1">
            <Nav />
          </div>

          <div className="order-2 ml-auto flex shrink-0 items-center gap-3 lg:order-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium">{empresaDemo.usuarioDemo.nombre}</p>
              <p className="text-[11px] text-[var(--texto-tenue)]">
                {empresaDemo.nombre}
              </p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--fondo-panel-alto)] text-sm font-medium text-[var(--texto-tenue)]">
              SA
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-[var(--borde)] bg-[color-mix(in_srgb,var(--acento)_9%,var(--fondo))]">
        <p className="mx-auto max-w-7xl px-6 py-2 text-xs text-[var(--texto-tenue)]">
          <span className="font-medium text-[var(--acento)]">Prototipo académico.</span>{" "}
          Las cifras de la empresa son ilustrativas y el acceso es decorativo. Los datos
          marcados <span className="font-medium text-[var(--exito)]">En vivo</span> sí
          provienen de APIs públicas reales.
        </p>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

      <footer className="mx-auto max-w-7xl px-6 pb-10 pt-4 text-xs text-[var(--texto-tenue)]">
        Kairos · Prototipo · ISIS 2007 — Diseño de Productos e Innovación con TI ·
        Universidad de los Andes
      </footer>
    </div>
  );
}
