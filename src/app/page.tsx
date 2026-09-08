import Link from "next/link";
import { empresaDemo } from "@/data/empresa-demo";

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid lg:grid-cols-2">
      {/* Panel de marca */}
      <section className="relative hidden lg:flex flex-col justify-between p-12 bg-[var(--fondo-panel)] border-r border-[var(--borde)] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, var(--acento) 0, transparent 45%), radial-gradient(circle at 75% 70%, var(--info) 0, transparent 40%)",
          }}
        />
        <div className="relative">
          <Marca />
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            La información ya existe.
            <br />
            <span className="text-[var(--acento)]">Lo que falta es traducirla.</span>
          </h1>
          <p className="mt-6 text-[var(--texto-tenue)] leading-relaxed">
            El IDEAM, el Servicio Geológico y la UNGRD publican datos todos los días. Son
            regionales, y no dicen nada sobre <em>tu</em> bodega. Kairos toma esos datos,
            los aterriza sobre cada activo de tu empresa y los convierte en una decisión:
            cuánto perderías, y en qué te conviene invertir primero.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-4">
            <Cifra valor="6" etiqueta="fenómenos modelados" />
            <Cifra valor="3" etiqueta="fuentes públicas conectadas" />
            <Cifra valor="$" etiqueta="pérdida estimada en pesos" />
          </dl>
        </div>

        <p className="relative text-xs text-[var(--texto-tenue)]">
          Prototipo académico · ISIS 2007 — Diseño de Productos e Innovación con TI ·
          Universidad de los Andes
        </p>
      </section>

      {/* Panel de acceso */}
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10">
            <Marca />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Ingresar</h2>
          <p className="mt-2 text-sm text-[var(--texto-tenue)]">
            Entra como responsable de riesgos de {empresaDemo.nombre}.
          </p>

          <div className="mt-8 space-y-4">
            <Campo etiqueta="Correo" valor={empresaDemo.usuarioDemo.correo} />
            <Campo etiqueta="Contraseña" valor="••••••••••••" />
          </div>

          <Link
            href="/datos"
            className="mt-8 flex w-full items-center justify-center rounded-lg bg-[var(--acento)] px-4 py-3 font-medium text-[#1a1200] transition hover:brightness-110"
          >
            Entrar a la plataforma
          </Link>

          <div className="mt-6 rounded-lg border border-[var(--borde)] bg-[var(--fondo-panel)] p-4">
            <p className="text-xs leading-relaxed text-[var(--texto-tenue)]">
              <span className="font-medium text-[var(--texto)]">Acceso de demostración.</span>{" "}
              Este login es decorativo: no valida nada y no guarda credenciales. Cualquiera
              con el enlace puede entrar y recorrer el prototipo completo.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--acento)] text-[#1a1200]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
          <path
            d="M12 3v18M4 14l4-5 3 4 3-6 6 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold leading-none tracking-tight">Kairos</p>
        <p className="mt-1 text-xs text-[var(--texto-tenue)]">
          Simulador digital de riesgos
        </p>
      </div>
    </div>
  );
}

function Cifra({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div>
      <dt className="text-2xl font-semibold text-[var(--acento)]">{valor}</dt>
      <dd className="mt-1 text-xs leading-snug text-[var(--texto-tenue)]">{etiqueta}</dd>
    </div>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[var(--texto-tenue)]">{etiqueta}</span>
      <input
        readOnly
        defaultValue={valor}
        className="mt-1.5 w-full rounded-lg border border-[var(--borde)] bg-[var(--fondo-panel)] px-3 py-2.5 text-sm text-[var(--texto)] outline-none focus:border-[var(--acento)]"
      />
    </label>
  );
}
