const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Formato completo: $ 1.234.567.890 */
export function formatearPesos(valor: number): string {
  return pesos.format(Math.round(valor));
}

/**
 * Formato compacto para tarjetas y ejes: $ 1.234 M, $ 2,3 mil M.
 * En cifras de riesgo el orden de magnitud comunica más que el peso exacto.
 */
export function pesosCompactos(valor: number): string {
  const abs = Math.abs(valor);
  if (abs >= 1_000_000_000) {
    return `$ ${(valor / 1_000_000_000).toLocaleString("es-CO", {
      maximumFractionDigits: 1,
    })} mil M`;
  }
  if (abs >= 1_000_000) {
    return `$ ${(valor / 1_000_000).toLocaleString("es-CO", {
      maximumFractionDigits: 0,
    })} M`;
  }
  return pesos.format(Math.round(valor));
}

export function porcentaje(fraccion: number, decimales = 0): string {
  return `${(fraccion * 100).toLocaleString("es-CO", {
    maximumFractionDigits: decimales,
  })} %`;
}

export function numero(valor: number, decimales = 0): string {
  return valor.toLocaleString("es-CO", { maximumFractionDigits: decimales });
}

/** "hace 3 h", "hace 2 días" */
export function hace(fecha: Date): string {
  const minutos = Math.round((Date.now() - fecha.getTime()) / 60000);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}
