/**
 * Datos de emisión del documento.
 *
 * Un plano no lleva la fecha de hoy: lleva la fecha en que se emitió esa
 * revisión. Por eso esto es una constante y no `new Date()` — si el número
 * cambiara solo, dejaría de significar algo.
 */
export const DOCUMENTO = {
  revision: "B",
  fechaEmision: "08-09-2026",
  /** Qué cambió en esta revisión, para el pie de página. */
  notaRevision:
    "Rev. B — plano de planta interactivo y simulación de caída en cadena.",
} as const;
