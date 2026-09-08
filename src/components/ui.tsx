import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-[var(--borde)] bg-[var(--fondo-panel)] ${className}`}
    >
      {children}
    </section>
  );
}

export function EncabezadoPanel({
  titulo,
  descripcion,
  extra,
}: {
  titulo: string;
  descripcion?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--borde)] px-5 py-4">
      <div>
        <h2 className="font-semibold tracking-tight">{titulo}</h2>
        {descripcion && (
          <p className="mt-1 max-w-2xl text-sm text-[var(--texto-tenue)]">
            {descripcion}
          </p>
        )}
      </div>
      {extra}
    </div>
  );
}

export function TituloPagina({
  titulo,
  bajada,
  extra,
}: {
  titulo: string;
  bajada: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[var(--texto-tenue)]">
          {bajada}
        </p>
      </div>
      {extra}
    </div>
  );
}

export function Metrica({
  etiqueta,
  valor,
  detalle,
  acento = false,
  extra,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  acento?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--borde)] bg-[var(--fondo-panel)] p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--texto-tenue)]">
          {etiqueta}
        </p>
        {extra}
      </div>
      <p
        className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${
          acento ? "text-[var(--acento)]" : ""
        }`}
      >
        {valor}
      </p>
      {detalle && (
        <p className="mt-1.5 text-xs leading-snug text-[var(--texto-tenue)]">{detalle}</p>
      )}
    </div>
  );
}

export function AvisoFalla({ motivo }: { motivo: string }) {
  return (
    <div className="rounded-lg border border-[color-mix(in_srgb,var(--peligro)_35%,transparent)] bg-[color-mix(in_srgb,var(--peligro)_10%,transparent)] px-4 py-3 text-sm text-[var(--texto-tenue)]">
      <span className="font-medium text-[var(--peligro)]">Fuente no disponible.</span>{" "}
      {motivo}. El resto de la plataforma sigue funcionando.
    </div>
  );
}
