import Link from "next/link";
import { Nav } from "@/components/nav";
import { Logotipo } from "@/components/iconos";
import { empresaDemo } from "@/data/empresa-demo";
import { DOCUMENTO } from "@/lib/documento";

const fuentes = [
  { nombre: "IDEAM", url: "https://www.ideam.gov.co/" },
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
                CR
              </span>
            </div>
          </div>

          <Nav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-9">{children}</main>

      <footer className="mt-8 border-t border-linea bg-papel-alto">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-10 lg:grid-cols-[1.7fr_0.9fr_1.2fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <Logotipo className="h-7 w-7" />
                <span className="display text-base">Kairos</span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-tinta-media">
                Kairos informa decisiones; no las garantiza. No pronostica si un evento
                va a ocurrir ni cuándo — estima el costo de no estar preparado, bajo
                supuestos que quedan a la vista y se pueden cambiar.
              </p>
              <p className="mt-4 border-l-2 border-linea pl-4 text-sm leading-relaxed text-tinta-media">
                Las cifras de la empresa demo son ilustrativas. Para un uso real habría
                que calibrarlas contra los registros de la UNGRD, DesInventar y las
                estaciones del IDEAM más cercanas a cada sede.
              </p>
            </div>

            <div>
              <p className="rotulo">Fuentes</p>
              <ul className="mt-4 space-y-2">
                {fuentes.map((f) => (
                  <li key={f.nombre}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-tinta-media underline decoration-linea underline-offset-4 transition hover:text-azul hover:decoration-azul"
                    >
                      {f.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="rotulo">Ficha del proyecto</p>
              <dl className="mono mt-4 space-y-2.5 text-[13px]">
                <Ficha termino="Curso" valor="ISIS 2007 · Diseño de Productos e Innovación con TI" />
                <Ficha termino="Institución" valor="Universidad de los Andes" />
                <Ficha
                  termino="Grupo 1"
                  valor="M. A. Rodríguez · S. Montoya · A. Muñoz · J. C. Solano · R. Ruiz"
                />
                <Ficha termino="Revisión" valor={`${DOCUMENTO.revision} · ${DOCUMENTO.fechaEmision}`} />
              </dl>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-linea pt-5">
            <p className="mono text-[11px] uppercase tracking-[0.12em] text-tinta-tenue">
              Kairos · Prototipo académico · Rev. {DOCUMENTO.revision}
            </p>
            <p className="mono text-[11px] text-tinta-tenue">
              {DOCUMENTO.notaRevision}
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

function Ficha({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div>
      <dt className="text-tinta-tenue">{termino}</dt>
      <dd className="mt-0.5 leading-relaxed">{valor}</dd>
    </div>
  );
}
