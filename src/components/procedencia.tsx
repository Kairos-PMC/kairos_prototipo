// Alias: el componente exportado se llama igual que el tipo.
import type { Procedencia as TipoProcedencia } from "@/domain/tipos";

const estilos: Record<TipoProcedencia, { texto: string; clase: string; ayuda: string }> = {
  vivo: {
    texto: "En vivo",
    clase: "bg-[color-mix(in_srgb,var(--exito)_18%,transparent)] text-[var(--exito)] border-[color-mix(in_srgb,var(--exito)_35%,transparent)]",
    ayuda: "Consultado ahora mismo a una API pública.",
  },
  referencia: {
    texto: "Referencia",
    clase: "bg-[color-mix(in_srgb,var(--info)_18%,transparent)] text-[var(--info)] border-[color-mix(in_srgb,var(--info)_35%,transparent)]",
    ayuda: "Valor real tomado de una fuente citada, no consultado en vivo.",
  },
  ilustrativo: {
    texto: "Ilustrativo",
    clase: "bg-[color-mix(in_srgb,var(--acento)_18%,transparent)] text-[var(--acento)] border-[color-mix(in_srgb,var(--acento)_35%,transparent)]",
    ayuda: "Cifra inventada para la demostración. No proviene de ninguna fuente.",
  },
};

/**
 * Rótulo de procedencia. Acompaña a toda cifra en pantalla, sin excepción.
 *
 * Es la regla de honestidad del prototipo: un dato inventado y marcado es
 * legítimo en una demostración; uno inventado y presentado como oficial, no.
 */
export function Procedencia({
  tipo,
  className = "",
}: {
  tipo: TipoProcedencia;
  className?: string;
}) {
  const e = estilos[tipo];
  return (
    <span
      title={e.ayuda}
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${e.clase} ${className}`}
    >
      {e.texto}
    </span>
  );
}

export function LeyendaProcedencia() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--texto-tenue)]">
      <span className="font-medium text-[var(--texto)]">¿De dónde salen las cifras?</span>
      {(Object.keys(estilos) as TipoProcedencia[]).map((tipo) => (
        <span key={tipo} className="inline-flex items-center gap-2">
          <Procedencia tipo={tipo} />
          {estilos[tipo].ayuda}
        </span>
      ))}
    </div>
  );
}
