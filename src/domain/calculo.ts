/**
 * Motor de cálculo del prototipo.
 *
 * La idea completa cabe en tres líneas:
 *
 *   daño físico     = valor de reposición × severidad × vulnerabilidad
 *   lucro cesante   = margen diario × días fuera de servicio, propio y de lo que depende
 *   pérdida esperada = probabilidad anual × (daño físico + lucro cesante)
 *
 * Lo que hace interesante al resultado no es la fórmula sino la propagación: un
 * activo que no sufrió daño alguno igual deja de producir si depende de otro que
 * sí cayó. Ahí es donde el número deja de parecerse al de una póliza.
 */

import type {
  Activo,
  AmenazaId,
  Dependencia,
  Escenario,
  Medida,
  Sede,
} from "./tipos";

export interface AporteAmenaza {
  amenaza: AmenazaId;
  danioFisico: number;
  lucroCesantePropio: number;
  lucroCesantePropagado: number;
  perdidaEsperada: number;
  diasFuera: number;
}

export interface ResultadoActivo {
  activo: Activo;
  sede: Sede;
  perdidaEsperada: number;
  danioFisico: number;
  lucroCesante: number;
  /** Parte del lucro cesante que sufren OTROS activos por depender de este. */
  lucroCesantePropagado: number;
  /** Activos que dejan de operar por depender de este. */
  arrastra: string[];
  porAmenaza: AporteAmenaza[];
}

export interface Resultado {
  perdidaEsperadaAnual: number;
  danioFisicoTotal: number;
  lucroCesanteTotal: number;
  activosComprometidos: number;
  porActivo: ResultadoActivo[];
  porAmenaza: { amenaza: AmenazaId; perdidaEsperada: number }[];
  porSede: { sedeId: string; nombre: string; perdidaEsperada: number }[];
}

/**
 * Qué fracción de la pérdida define el grupo de "activos comprometidos".
 *
 * Se cuenta cuántos activos, de mayor a menor, hacen falta para acumular este
 * porcentaje de la pérdida total. Un umbral en pesos fijo no sirve: con
 * cualquier valor bajo entran los 13 y la métrica deja de distinguir nada.
 */
const CONCENTRACION_COMPROMETIDOS = 0.8;

/**
 * Activos que quedan fuera de servicio, directa o indirectamente, si cae `raiz`.
 * Recorrido en anchura sobre el grafo de dependencias, con marca de visitados
 * para que un ciclo no cuelgue el navegador.
 */
export function descendientes(
  raiz: string,
  dependencias: Dependencia[],
): string[] {
  const salientes = new Map<string, string[]>();
  for (const d of dependencias) {
    const lista = salientes.get(d.origen) ?? [];
    lista.push(d.objetivo);
    salientes.set(d.origen, lista);
  }

  const vistos = new Set<string>([raiz]);
  const cola = [raiz];
  const resultado: string[] = [];

  while (cola.length > 0) {
    const actual = cola.shift()!;
    for (const siguiente of salientes.get(actual) ?? []) {
      if (vistos.has(siguiente)) continue;
      vistos.add(siguiente);
      resultado.push(siguiente);
      cola.push(siguiente);
    }
  }

  return resultado;
}

/**
 * Aplica un conjunto de medidas sobre el escenario y devuelve uno nuevo.
 * No muta el original: el comparador con/sin medida depende de eso.
 */
export function aplicarMedidas(
  escenario: Escenario,
  medidasIds: string[],
): Escenario {
  if (medidasIds.length === 0) return escenario;

  const activas = escenario.medidas.filter((m) => medidasIds.includes(m.id));

  const activos = escenario.activos.map((activo) => {
    const aplicables = activas.filter((m) => m.aplicaA.includes(activo.id));
    if (aplicables.length === 0) return activo;

    const vulnerabilidad = { ...activo.vulnerabilidad };
    let factorDias = 1;

    for (const medida of aplicables) {
      for (const amenaza of medida.amenazas) {
        const actual = vulnerabilidad[amenaza];
        if (actual === undefined) continue;
        // Efectos multiplicativos: dos medidas sobre la misma amenaza reducen
        // sobre lo que quede, no sobre el valor original. Sin esto, dos medidas
        // podrian llevar la vulnerabilidad a cero o incluso a negativo.
        vulnerabilidad[amenaza] = actual * (1 - medida.reduccionDanio);
      }
      factorDias *= 1 - medida.reduccionDias;
    }

    return {
      ...activo,
      vulnerabilidad,
      diasReparacion: activo.diasReparacion * factorDias,
    };
  });

  return { ...escenario, activos };
}

export function calcular(escenario: Escenario): Resultado {
  const sedesPorId = new Map(escenario.sedes.map((s) => [s.id, s]));
  const activosPorId = new Map(escenario.activos.map((a) => [a.id, a]));

  const porActivo: ResultadoActivo[] = [];

  for (const activo of escenario.activos) {
    const sede = sedesPorId.get(activo.sedeId);
    if (!sede) continue;

    const arrastra = descendientes(activo.id, escenario.dependencias);
    // Solo cuentan los que estan en la misma sede: un evento en Facatativa no
    // apaga el cuarto frio de Funza.
    const arrastraEnSede = arrastra.filter(
      (id) => activosPorId.get(id)?.sedeId === activo.sedeId,
    );
    const margenArrastrado = arrastraEnSede.reduce(
      (suma, id) => suma + (activosPorId.get(id)?.margenDiario ?? 0),
      0,
    );

    const porAmenaza: AporteAmenaza[] = [];

    for (const perfil of sede.amenazas) {
      const vulnerabilidad = activo.vulnerabilidad[perfil.amenaza];
      if (!vulnerabilidad) continue;

      const fraccionDanio = perfil.severidad * vulnerabilidad;
      const danioFisico = activo.valorReposicion * fraccionDanio;
      const diasFuera = activo.diasReparacion * fraccionDanio;
      const lucroCesantePropio = activo.margenDiario * diasFuera;
      const lucroCesantePropagado = margenArrastrado * diasFuera;

      const perdidaEsperada =
        perfil.probabilidadAnual *
        (danioFisico + lucroCesantePropio + lucroCesantePropagado);

      porAmenaza.push({
        amenaza: perfil.amenaza,
        danioFisico: perfil.probabilidadAnual * danioFisico,
        lucroCesantePropio: perfil.probabilidadAnual * lucroCesantePropio,
        lucroCesantePropagado: perfil.probabilidadAnual * lucroCesantePropagado,
        perdidaEsperada,
        diasFuera,
      });
    }

    const danioFisico = suma(porAmenaza.map((a) => a.danioFisico));
    const lucroCesante = suma(
      porAmenaza.map((a) => a.lucroCesantePropio + a.lucroCesantePropagado),
    );

    porActivo.push({
      activo,
      sede,
      perdidaEsperada: danioFisico + lucroCesante,
      danioFisico,
      lucroCesante,
      lucroCesantePropagado: suma(porAmenaza.map((a) => a.lucroCesantePropagado)),
      arrastra: arrastraEnSede,
      porAmenaza: porAmenaza.sort((a, b) => b.perdidaEsperada - a.perdidaEsperada),
    });
  }

  porActivo.sort((a, b) => b.perdidaEsperada - a.perdidaEsperada);

  const acumuladoAmenaza = new Map<AmenazaId, number>();
  for (const r of porActivo) {
    for (const a of r.porAmenaza) {
      acumuladoAmenaza.set(
        a.amenaza,
        (acumuladoAmenaza.get(a.amenaza) ?? 0) + a.perdidaEsperada,
      );
    }
  }

  const acumuladoSede = new Map<string, number>();
  for (const r of porActivo) {
    acumuladoSede.set(
      r.sede.id,
      (acumuladoSede.get(r.sede.id) ?? 0) + r.perdidaEsperada,
    );
  }

  const perdidaTotal = suma(porActivo.map((r) => r.perdidaEsperada));

  let acumulado = 0;
  let comprometidos = 0;
  for (const r of porActivo) {
    if (acumulado >= perdidaTotal * CONCENTRACION_COMPROMETIDOS) break;
    acumulado += r.perdidaEsperada;
    comprometidos += 1;
  }

  return {
    perdidaEsperadaAnual: perdidaTotal,
    danioFisicoTotal: suma(porActivo.map((r) => r.danioFisico)),
    lucroCesanteTotal: suma(porActivo.map((r) => r.lucroCesante)),
    activosComprometidos: comprometidos,
    porActivo,
    porAmenaza: [...acumuladoAmenaza.entries()]
      .map(([amenaza, perdidaEsperada]) => ({ amenaza, perdidaEsperada }))
      .sort((a, b) => b.perdidaEsperada - a.perdidaEsperada),
    porSede: escenario.sedes.map((s) => ({
      sedeId: s.id,
      nombre: s.nombre,
      perdidaEsperada: acumuladoSede.get(s.id) ?? 0,
    })),
  };
}

export interface SimulacionCaida {
  caidos: string[];
  /** Los que caen por dependencia, sin haber recibido daño. */
  arrastrados: string[];
  fueraDeServicio: string[];
  margenDiarioDetenido: number;
  /** Fracción del margen diario de toda la empresa que se detiene. 0..1 */
  fraccionOperacion: number;
  danioFisico: number;
  diasEstimados: number;
  perdidaEvento: number;
}

/**
 * Simulación operativa: "si HOY cae esto, ¿qué pasa?".
 *
 * Distinta de `calcular()`, que da una pérdida esperada anual promediada por
 * probabilidades. Aquí no hay probabilidad: el evento ya ocurrió y lo que se
 * responde es el alcance. Es la pregunta que hace un jefe de planta, no la que
 * hace un actuario.
 *
 * Supuesto explícito: un activo marcado como caído se da por perdido por
 * completo. Es el peor caso de ese activo, no su daño esperado.
 */
export function simularCaida(
  escenario: Escenario,
  caidos: string[],
): SimulacionCaida {
  const porId = new Map(escenario.activos.map((a) => [a.id, a]));

  const arrastrados = new Set<string>();
  for (const id of caidos) {
    const sede = porId.get(id)?.sedeId;
    for (const hijo of descendientes(id, escenario.dependencias)) {
      if (caidos.includes(hijo)) continue;
      if (porId.get(hijo)?.sedeId !== sede) continue;
      arrastrados.add(hijo);
    }
  }

  const fueraDeServicio = [...caidos, ...arrastrados];
  const margenDiarioDetenido = fueraDeServicio.reduce(
    (s, id) => s + (porId.get(id)?.margenDiario ?? 0),
    0,
  );
  const margenTotal = escenario.activos.reduce((s, a) => s + a.margenDiario, 0);
  const danioFisico = caidos.reduce(
    (s, id) => s + (porId.get(id)?.valorReposicion ?? 0),
    0,
  );
  const diasEstimados = caidos.reduce(
    (max, id) => Math.max(max, porId.get(id)?.diasReparacion ?? 0),
    0,
  );

  return {
    caidos,
    arrastrados: [...arrastrados],
    fueraDeServicio,
    margenDiarioDetenido,
    fraccionOperacion: margenTotal > 0 ? margenDiarioDetenido / margenTotal : 0,
    danioFisico,
    diasEstimados,
    perdidaEvento: danioFisico + margenDiarioDetenido * diasEstimados,
  };
}

export interface MedidaEvaluada {
  medida: Medida;
  perdidaEvitada: number;
  costo: number;
  /** Pesos ahorrados por peso invertido, al año. */
  retorno: number;
  /** Años para recuperar la inversión. Infinito si no evita nada. */
  aniosRetorno: number;
  seleccionada: boolean;
  /** Orden de ejecución recomendado. 0 si no entró en el presupuesto. */
  orden: number;
}

export interface Priorizacion {
  perdidaBase: number;
  perdidaFinal: number;
  perdidaEvitadaTotal: number;
  inversionTotal: number;
  presupuesto: number;
  medidas: MedidaEvaluada[];
  seleccionadas: string[];
}

/**
 * Elige el orden de inversión bajo un presupuesto.
 *
 * Greedy con recálculo: en cada ronda se mide cuánto evita cada medida
 * ADEMÁS de lo ya seleccionado, y se toma la de mejor retorno que quepa.
 *
 * El recálculo es lo importante. Si se midiera cada medida por separado contra
 * el escenario base, dos medidas que protegen el mismo activo sumarían dos veces
 * el mismo ahorro y el portafolio quedaría sobreestimado — en silencio, que es
 * la peor forma de estar mal.
 */
export function priorizar(
  escenario: Escenario,
  presupuesto: number,
): Priorizacion {
  const perdidaBase = calcular(escenario).perdidaEsperadaAnual;

  const seleccionadas: string[] = [];
  const evaluadas = new Map<string, MedidaEvaluada>();
  let perdidaActual = perdidaBase;
  let restante = presupuesto;
  let orden = 0;

  while (true) {
    let mejor: { medida: Medida; evitada: number; retorno: number } | null = null;

    for (const medida of escenario.medidas) {
      if (seleccionadas.includes(medida.id)) continue;
      if (medida.costo > restante) continue;

      const conMedida = calcular(
        aplicarMedidas(escenario, [...seleccionadas, medida.id]),
      ).perdidaEsperadaAnual;
      const evitada = perdidaActual - conMedida;
      const retorno = evitada / medida.costo;

      if (evitada <= 0) continue;
      if (!mejor || retorno > mejor.retorno) {
        mejor = { medida, evitada, retorno };
      }
    }

    if (!mejor) break;

    orden += 1;
    seleccionadas.push(mejor.medida.id);
    restante -= mejor.medida.costo;
    perdidaActual -= mejor.evitada;

    evaluadas.set(mejor.medida.id, {
      medida: mejor.medida,
      perdidaEvitada: mejor.evitada,
      costo: mejor.medida.costo,
      retorno: mejor.retorno,
      aniosRetorno: mejor.evitada > 0 ? mejor.medida.costo / mejor.evitada : Infinity,
      seleccionada: true,
      orden,
    });
  }

  // Las que no entraron se evalúan igual, contra el escenario base, para poder
  // mostrarlas en la tabla con su retorno individual.
  for (const medida of escenario.medidas) {
    if (evaluadas.has(medida.id)) continue;
    const conMedida = calcular(
      aplicarMedidas(escenario, [medida.id]),
    ).perdidaEsperadaAnual;
    const evitada = perdidaBase - conMedida;

    evaluadas.set(medida.id, {
      medida,
      perdidaEvitada: evitada,
      costo: medida.costo,
      retorno: evitada / medida.costo,
      aniosRetorno: evitada > 0 ? medida.costo / evitada : Infinity,
      seleccionada: false,
      orden: 0,
    });
  }

  const medidas = [...evaluadas.values()].sort((a, b) => {
    if (a.seleccionada !== b.seleccionada) return a.seleccionada ? -1 : 1;
    if (a.seleccionada) return a.orden - b.orden;
    return b.retorno - a.retorno;
  });

  return {
    perdidaBase,
    perdidaFinal: perdidaActual,
    perdidaEvitadaTotal: perdidaBase - perdidaActual,
    inversionTotal: presupuesto - restante,
    presupuesto,
    medidas,
    seleccionadas,
  };
}

function suma(valores: number[]): number {
  return valores.reduce((a, b) => a + b, 0);
}
