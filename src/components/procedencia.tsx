// Alias: el componente exportado se llama igual que el tipo.
import type { Procedencia as TipoProcedencia } from "@/domain/tipos";

const estilos: Record<
  TipoProcedencia,
  { texto: string; color: string; ayuda: string }
> = {
  vivo: {
    texto: "En vivo",
    color: "var(--verde)",
    ayuda: "Consultado ahora mismo a una API pública.",
  },
  referencia: {
    texto: "Referencia",
    color: "var(--azul)",
    ayuda: "Valor real tomado de una fuente citada, no consultado en vivo.",
  },
  ilustrativo: {
    texto: "Ilustrativo",
    color: "var(--ocre)",
    ayuda: "Cifra inventada para la demostración. No proviene de ninguna fuente.",
  },
};

/**
 * Sello de procedencia. Acompaña a toda cifra en pantalla, sin excepción.
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
      className={`mono inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] ${className}`}
      style={{
        color: e.color,
        borderColor: `color-mix(in srgb, ${e.color} 40%, transparent)`,
        background: `color-mix(in srgb, ${e.color} 8%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: e.color }}
        aria-hidden
      />
      {e.texto}
    </span>
  );
}

export function LeyendaProcedencia() {
  return (
    <div className="lamina rounded px-5 py-4">
      <p className="rotulo">¿De dónde salen las cifras?</p>
      <ul className="mt-3 space-y-2">
        {(Object.keys(estilos) as TipoProcedencia[]).map((tipo) => (
          <li key={tipo} className="flex flex-wrap items-center gap-2.5 text-sm">
            <Procedencia tipo={tipo} />
            <span className="text-tinta-media">{estilos[tipo].ayuda}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
