import type { ReactNode } from "react";

/** Superficie base: una lámina de papel sobre el fondo milimetrado. */
export function Lamina({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`lamina rounded ${className}`}>{children}</section>;
}

/** Etiqueta de campo técnico. */
export function Rotulo({ children }: { children: ReactNode }) {
  return <p className="rotulo">{children}</p>;
}

export function CabeceraLamina({
  titulo,
  descripcion,
  extra,
}: {
  titulo: string;
  descripcion?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-linea px-5 py-4">
      <div>
        <h2 className="display text-lg leading-tight">{titulo}</h2>
        {descripcion && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-tinta-media">
            {descripcion}
          </p>
        )}
      </div>
      {extra}
    </div>
  );
}

export function TituloPagina({
  rotulo,
  titulo,
  bajada,
  extra,
}: {
  rotulo?: string;
  titulo: string;
  bajada: string;
  extra?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="max-w-3xl">
        {rotulo && (
          <p className="rotulo mb-2 flex items-center gap-2">
            <span className="inline-block h-px w-6 bg-tinta-tenue" />
            {rotulo}
          </p>
        )}
        <h1 className="display text-3xl leading-tight">{titulo}</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-tinta-media">{bajada}</p>
      </div>
      {extra}
    </header>
  );
}

export function Metrica({
  rotulo,
  valor,
  detalle,
  tono = "tinta",
  extra,
}: {
  rotulo: string;
  valor: string;
  detalle?: string;
  tono?: "tinta" | "ocre" | "verde" | "bermellon";
  extra?: ReactNode;
}) {
  const color = {
    tinta: "",
    ocre: "text-ocre",
    verde: "text-verde",
    bermellon: "text-bermellon",
  }[tono];

  return (
    <div className="lamina rounded p-5">
      <div className="flex items-start justify-between gap-2">
        <Rotulo>{rotulo}</Rotulo>
        {extra}
      </div>
      <p className={`display mt-2 text-3xl ${color}`}>{valor}</p>
      {detalle && (
        <p className="mt-1.5 text-xs leading-snug text-tinta-media">{detalle}</p>
      )}
    </div>
  );
}

export function AvisoFalla({ motivo }: { motivo: string }) {
  return (
    <div className="rounded border border-bermellon/40 bg-[color-mix(in_srgb,var(--bermellon)_6%,transparent)] px-4 py-3 text-sm text-tinta-media">
      <span className="font-medium text-bermellon">Fuente no disponible.</span> {motivo}.
      El resto de la plataforma sigue funcionando.
    </div>
  );
}
