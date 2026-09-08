import Link from "next/link";
import { Nav } from "@/components/nav";
import { Logotipo } from "@/components/iconos";
import { empresaDemo } from "@/data/empresa-demo";

const fuentes = [
  { nombre: "IDEAM", url: "http://www.ideam.gov.co/web/pronosticos-y-alertas" },
  { nombre: "Servicio Geológico Colombiano", url: "https://www.sgc.gov.co/" },
  { nombre: "UNGRD", url: "https://portal.gestiondelriesgo.gov.co/" },
  { nombre: "DesInventar", url: "https://www.desinventar.net/" },
  { nombre: "USGS Earthquake Catalog", url: "https://earthquake.usgs.gov/" },
  { nombre: "Open-Meteo", url: "https://open-meteo.com/" },
];

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Cintillo de estado */}
      <div className="border-b border-linea bg-tinta">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-6 py-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--papel)_55%,transparent)]">
            Prototipo académico
          </span>
          <span className="text-[11px] text-[color-mix(in_srgb,var(--papel)_70%,transparent)]">
            Cifras de la empresa ilustrativas · acceso decorativo · los datos marcados{" "}
            <em className="not-italic text-[color-mix(in_srgb,var(--papel)_95%,transparent)]">
              en vivo
            </em>{" "}
            sí vienen de APIs públicas reales
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-linea bg-[color-mix(in_srgb,var(--papel)_92%,transparent)] backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-6 py-3">
            <Link href="/datos" className="flex shrink-0 items-center gap-3">
              <Logotipo className="h-9 w-9" />
              <span>
                <span className="display block text-lg leading-none">Kairos</span>
                <span className="rotulo mt-1 block">Simulador de riesgos</span>
              </span>
            </Link>

            <div className="ml-auto flex shrink-0 items-center gap-3 border-l border-linea pl-5">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{empresaDemo.usuarioDemo.nombre}</p>
                <p className="mono text-[11px] text-tinta-tenue">
                  {empresaDemo.usuarioDemo.cargo}
                </p>
              </div>
              <span className="mono grid h-9 w-9 shrink-0 place-items-center rounded-full border border-linea bg-papel-alto text-xs text-tinta-media">
                SA
              </span>
            </div>
          </div>

          <Nav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-9">{children}</main>

      <footer className="mt-8 border-t border-linea bg-papel-alto">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <Logotipo className="h-7 w-7" />
                <span className="display text-base">Kairos</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-tinta-media">
                El dato público existe. Lo que falta es traducirlo a una decisión sobre
                un activo concreto, con una cifra en pesos.
              </p>
            </div>

            <div>
              <p className="rotulo">Fuentes de datos</p>
              <ul className="mt-3 space-y-1.5">
                {fuentes.map((f) => (
                  <li key={f.nombre}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-tinta-media transition hover:text-azul hover:underline"
                    >
                      {f.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="rotulo">El proyecto</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-tinta-tenue">Curso</dt>
                  <dd>ISIS 2007 — Diseño de Productos e Innovación con TI</dd>
                </div>
                <div>
                  <dt className="text-tinta-tenue">Grupo 1</dt>
                  <dd className="leading-relaxed">
                    María Alejandra Rodríguez · Samuel Montoya · Antonio Muñoz · Juan
                    Camilo Solano · Raúl Ruiz
                  </dd>
                </div>
                <div>
                  <dt className="text-tinta-tenue">Institución</dt>
                  <dd>Universidad de los Andes</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="rotulo">Alcance</p>
              <p className="mt-3 text-sm leading-relaxed text-tinta-media">
                Kairos informa decisiones; no las garantiza. No pronostica si un evento
                va a ocurrir ni cuándo — estima el costo de no estar preparado, bajo
                supuestos que quedan a la vista y se pueden cambiar.
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-linea pt-5">
            <p className="mono text-[11px] uppercase tracking-[0.12em] text-tinta-tenue">
              Kairos · Prototipo · {new Date().getFullYear()}
            </p>
            <p className="mono text-[11px] text-tinta-tenue">
              Sin cuentas · sin cookies · sin datos de quien lo visita
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
