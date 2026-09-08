import Link from "next/link";
import { Logotipo } from "@/components/iconos";
import { empresaDemo } from "@/data/empresa-demo";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      {/* Lámina de portada */}
      <section className="relative flex flex-col justify-between overflow-hidden border-linea px-8 py-10 lg:border-r lg:px-14 lg:py-14">
        <div className="flex items-center gap-3">
          <Logotipo className="h-10 w-10" />
          <div>
            <p className="display text-xl leading-none">Kairos</p>
            <p className="rotulo mt-1.5">Simulador digital de riesgos</p>
          </div>
        </div>

        <div className="max-w-xl py-12">
          <p className="rotulo mb-4 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-tinta-tenue" />
            El problema
          </p>
          <h1 className="display text-[2.6rem] leading-[1.1] sm:text-5xl">
            La información ya existe.
            <br />
            <span className="text-bermellon">Lo que falta es traducirla.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-tinta-media">
            El IDEAM, el Servicio Geológico y la UNGRD publican datos todos los días. Son
            regionales, y no dicen nada sobre <em>tu</em> bodega. Kairos los aterriza
            sobre cada activo de tu empresa y los convierte en una decisión: cuánto
            perderías, y en qué te conviene invertir primero.
          </p>

          {/* De la validación en campo, no de un argumento de venta. Es lo que
              hizo cambiar el planteamiento del proyecto. */}
          <figure className="mt-12 max-w-lg border-l-2 border-bermellon pl-5">
            <blockquote className="text-[15px] leading-relaxed">
              La empresa ya maneja análisis detallados de fenómenos naturales. El
              problema es que son generales y no aplican a las regiones donde opera.
            </blockquote>
            <figcaption className="rotulo mt-3">
              Hallazgo de la entrevista de validación · sector floricultor · ago 2026
            </figcaption>
          </figure>
        </div>

        <p className="mono text-[11px] leading-relaxed text-tinta-tenue">
          ISIS 2007 — Diseño de Productos e Innovación con TI · Grupo 1 · Universidad de
          los Andes
        </p>
      </section>

      {/* Acceso */}
      <section className="flex items-center justify-center bg-papel-alto px-8 py-14">
        <div className="w-full max-w-sm">
          <p className="rotulo">Acceso</p>
          <h2 className="display mt-2 text-2xl">Entrar a la plataforma</h2>
          <p className="mt-2 text-sm leading-relaxed text-tinta-media">
            Como {empresaDemo.usuarioDemo.cargo.toLowerCase()} de {empresaDemo.nombre}.
          </p>

          <div className="mt-8 space-y-4">
            <Campo etiqueta="Correo" valor={empresaDemo.usuarioDemo.correo} />
            <Campo etiqueta="Contraseña" valor="••••••••••••" />
          </div>

          <Link
            href="/datos"
            className="mono mt-8 flex w-full items-center justify-center gap-2 rounded bg-tinta px-4 py-3.5 text-sm uppercase tracking-[0.12em] text-papel transition hover:bg-azul"
          >
            Entrar
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
              <path
                d="M2 8h11M9 4l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <div className="mt-6 border-l-2 border-linea pl-4">
            <p className="text-xs leading-relaxed text-tinta-media">
              <span className="font-medium text-tinta">Acceso de demostración.</span> Este
              formulario es decorativo: no valida nada, no guarda credenciales y no
              registra quién entra. Cualquiera con el enlace recorre el prototipo
              completo.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <label className="block">
      <span className="rotulo">{etiqueta}</span>
      <input
        readOnly
        defaultValue={valor}
        className="mono mt-1.5 w-full rounded border border-linea bg-papel px-3 py-3 text-sm text-tinta outline-none transition focus:border-azul"
      />
    </label>
  );
}
