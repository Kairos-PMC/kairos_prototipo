const pptxgen = require("pptxgenjs");
const path = require("path");

const DIR = __dirname;

// Paleta de la marca — la misma que corre en el prototipo desplegado, para que
// la presentación y la demo se vean como una sola cosa.
const C = {
  papel: "F0ECE1",
  alto: "FAF8F3",
  tinta: "16191D",
  media: "55606D",
  tenue: "8B95A1",
  linea: "CDC6B5",
  bermellon: "C4372A",
  ocre: "A8710C",
  verde: "2C6446",
  verdeClaro: "3D9168",
  azul: "1B4A7A",
};

const F = { serif: "Cambria", sans: "Calibri", mono: "Courier New" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "Grupo 1 — ISIS 2007";
pres.title = "Kairos — Pitch No. 2";

const M = 0.6; // margen
const W = 13.33;

// ── Piezas reutilizables ────────────────────────────────────────────────────

/** La marca: tres fichas, la primera caída, la última en pie. */
function marca(slide, x, y, alto, sobreTinta) {
  const h = alto;
  const w = h * 0.23;
  const piezas = [
    { dx: 0.0, rot: 34, fill: C.bermellon },
    { dx: h * 0.42, rot: 16, fill: C.ocre },
    { dx: h * 0.84, rot: 0, fill: sobreTinta ? C.verdeClaro : C.verde },
  ];
  for (const p of piezas) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + p.dx,
      y,
      w,
      h,
      rectRadius: 0.02,
      fill: { color: p.fill },
      rotate: p.rot,
      line: { color: p.fill, width: 0 },
    });
  }
}

/** Rótulo técnico: mono, versalitas, muy pequeño. */
function rotulo(slide, texto, x, y, color = C.tenue, w = 6) {
  slide.addText(texto.toUpperCase(), {
    x,
    y,
    w,
    h: 0.24,
    isTextBox: true,
    margin: 0,
    fontFace: F.mono,
    fontSize: 10,
    charSpacing: 1.6,
    color,
    valign: "middle",
  });
}

/** Encabezado de lámina de contenido. Devuelve la Y donde empieza el cuerpo. */
function cabecera(slide, criterio, titulo, bajada) {
  slide.background = { color: C.papel };
  rotulo(slide, criterio, M, 0.42, C.bermellon, 8);
  slide.addText(titulo, {
    x: M,
    y: 0.72,
    w: W - M * 2,
    h: 0.62,
    isTextBox: true,
    margin: 0,
    fontFace: F.serif,
    fontSize: 34,
    bold: true,
    color: C.tinta,
  });
  let y = 1.44;
  if (bajada) {
    slide.addText(bajada, {
      x: M,
      y,
      w: 11.4,
      h: 0.42,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 14,
      color: C.media,
    });
    y += 0.6;
  }
  marca(slide, W - M - 0.62, 0.44, 0.42, false);
  return y;
}

/** Tarjeta de papel. */
function tarjeta(slide, { x, y, w, h, tinte }) {
  slide.addShape(pres.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: tinte || C.alto },
    line: { color: C.linea, width: 1 },
  });
}

/** Cifra grande con su etiqueta y su pie. */
function cifra(slide, { x, y, w, h, valor, etiqueta, pie, color }) {
  tarjeta(slide, { x, y, w, h });
  rotulo(slide, etiqueta, x + 0.28, y + 0.26, C.tenue, w - 0.56);
  slide.addText(valor, {
    x: x + 0.28,
    y: y + 0.56,
    w: w - 0.56,
    h: 0.85,
    isTextBox: true,
    margin: 0,
    fontFace: F.serif,
    fontSize: 40,
    bold: true,
    color: color || C.tinta,
  });
  slide.addText(pie, {
    x: x + 0.28,
    y: y + 1.44,
    w: w - 0.56,
    h: h - 1.66,
    isTextBox: true,
    margin: 0,
    fontFace: F.sans,
    fontSize: 12.5,
    color: C.media,
    lineSpacingMultiple: 1.15,
  });
}

/** Pie de lámina con la numeración. */
function pie(slide, n) {
  slide.addText(`Kairos · Pitch No. 2 · Grupo 1`, {
    x: M,
    y: 6.94,
    w: 6,
    h: 0.26,
    isTextBox: true,
    margin: 0,
    fontFace: F.mono,
    fontSize: 9,
    color: C.tenue,
  });
  slide.addText(`${n}`, {
    x: W - M - 1,
    y: 6.94,
    w: 1,
    h: 0.26,
    isTextBox: true,
    margin: 0,
    fontFace: F.mono,
    fontSize: 9,
    color: C.tenue,
    align: "right",
  });
}

// ── 1 · Portada ─────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.tinta };

  marca(s, M, 1.5, 1.1, true);

  s.addText("Kairos", {
    x: M,
    y: 3.0,
    w: 9,
    h: 1.1,
    isTextBox: true,
    margin: 0,
    fontFace: F.serif,
    fontSize: 60,
    bold: true,
    color: C.papel,
  });
  s.addText("Simulador digital de riesgos por fenómenos naturales", {
    x: M,
    y: 4.05,
    w: 9,
    h: 0.4,
    isTextBox: true,
    margin: 0,
    fontFace: F.sans,
    fontSize: 18,
    color: C.ocre,
  });

  s.addText(
    "Lo que golpea el fenómeno rara vez es lo caro.\nLo caro es lo que ese golpe arrastra.",
    {
      x: M,
      y: 4.9,
      w: 7.6,
      h: 0.9,
      isTextBox: true,
      margin: 0,
      fontFace: F.serif,
      fontSize: 17,
      italic: true,
      color: C.tenue,
      lineSpacingMultiple: 1.25,
    },
  );

  s.addText(
    [
      { text: "Pitch No. 2 · Presentación de la Solución", options: { breakLine: true, color: C.papel } },
      { text: "ISIS 2007 — Diseño de Productos e Innovación con TI · Grupo 1", options: { breakLine: true } },
      { text: "María Alejandra Rodríguez · Samuel Montoya · Antonio Muñoz · Juan Camilo Solano · Raúl Ruiz", options: {} },
    ],
    {
      x: M,
      y: 6.15,
      w: 11,
      h: 0.9,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 10.5,
      color: C.tenue,
      lineSpacingMultiple: 1.4,
    },
  );
  s.addNotes(
    "Portada. Presentarse y dar la frase de arranque: lo que golpea el fenómeno rara vez es lo caro; lo caro es lo que ese golpe arrastra. Ese es el hilo de todo el pitch.",
  );
}

// ── 2 · Criterio A — el problema está bien definido ─────────────────────────
{
  const s = pres.addSlide();
  const y0 = cabecera(
    s,
    "Criterio A · El problema está bien definido",
    "El dato existe. La decisión, no",
    "El árbol de problemas lo planteó; la validación en campo lo corrigió.",
  );

  s.addText(
    "En Colombia los mecanismos para reportar y alertar sobre fenómenos naturales están poco integrados entre sí y son poco accesibles. Eso retrasa la identificación temprana de la amenaza y limita la respuesta coordinada de empresas y autoridades.",
    {
      x: M,
      y: y0,
      w: 6.5,
      h: 1.5,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 16,
      color: C.tinta,
      lineSpacingMultiple: 1.3,
    },
  );

  tarjeta(s, { x: M, y: y0 + 1.7, w: 6.5, h: 2.5, tinte: "F6E7E3" });
  rotulo(s, "La validación lo precisó", M + 0.3, y0 + 1.95, C.bermellon, 5.9);
  s.addText(
    "El problema no es falta de información: es falta de traducción. La empresa ya maneja análisis detallados de fenómenos naturales, pero son generales y no aplican a las regiones donde opera.",
    {
      x: M + 0.3,
      y: y0 + 2.3,
      w: 5.9,
      h: 1.75,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 15,
      color: C.tinta,
      lineSpacingMultiple: 1.3,
    },
  );

  // Árbol de problemas, condensado
  const bx = 7.5;
  const bloques = [
    {
      rot: "Causas",
      col: C.tenue,
      txt: "Fuentes fragmentadas · sistemas sin integrar · bajo acceso a herramientas",
    },
    {
      rot: "Problema",
      col: C.bermellon,
      txt: "Los datos se producen, pero no llegan como decisión a una sede concreta",
    },
    {
      rot: "Efectos",
      col: C.ocre,
      txt: "Decisiones tardías · daño evitable a infraestructura · menor capacidad de respuesta",
    },
  ];
  bloques.forEach((b, i) => {
    const y = y0 + i * 1.5;
    tarjeta(s, { x: bx, y, w: 5.2, h: 1.2 });
    rotulo(s, b.rot, bx + 0.28, y + 0.2, b.col, 4.6);
    s.addText(b.txt, {
      x: bx + 0.28,
      y: y + 0.5,
      w: 4.64,
      h: 0.62,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 13,
      color: C.tinta,
      lineSpacingMultiple: 1.15,
    });
  });

  pie(s, 2);
  s.addNotes(
    "Criterio A. El árbol de problemas del Taller 1 daba el planteamiento; la entrevista de campo lo corrigió. Insistir en la corrección: no competimos vendiendo datos, el IDEAM ya los regala. Competimos traduciéndolos.",
  );
}

// ── 3 · Criterio B — el problema es importante ──────────────────────────────
{
  const s = pres.addSlide();
  const y0 = cabecera(
    s,
    "Criterio B · El problema es importante",
    "No es un riesgo teórico, y ya tiene precio",
    "Tres cifras: el evento que abrió la ventana, la exposición del país y lo que se recupera al prevenir.",
  );

  const anchoC = (W - M * 2 - 0.6) / 3;
  cifra(s, {
    x: M,
    y: y0,
    w: anchoC,
    h: 2.5,
    etiqueta: "Agosto de 2026",
    valor: "7,4",
    color: C.bermellon,
    pie: "Magnitud del sismo más fuerte registrado en Colombia en más de un siglo. Dejó cientos de víctimas y daños graves en infraestructura y comunicaciones.",
  });
  cifra(s, {
    x: M + anchoC + 0.3,
    y: y0,
    w: anchoC,
    h: 2.5,
    etiqueta: "Exposición del país",
    valor: "83 de 100",
    color: C.ocre,
    pie: "Colombianos que viven en zona de riesgo sísmico alto o medio, según la propuesta legislativa presentada tras el sismo.",
  });
  cifra(s, {
    x: M + (anchoC + 0.3) * 2,
    y: y0,
    w: anchoC,
    h: 2.5,
    etiqueta: "Lo que está en juego",
    valor: "15 %",
    color: C.verde,
    pie: "Menos costo por incidente en organizaciones con programa de continuidad, y 78 días menos para identificarlo y contenerlo (IBM / Ponemon).",
  });

  tarjeta(s, { x: M, y: y0 + 2.8, w: W - M * 2, h: 1.5 });
  s.addText(
    "El Servicio Geológico Colombiano tiene más de 200 estaciones sísmicas activas, y el país no cuenta con una red pública de alerta temprana.",
    {
      x: M + 0.35,
      y: y0 + 3.0,
      w: 11.6,
      h: 0.72,
      isTextBox: true,
      margin: 0,
      fontFace: F.serif,
      fontSize: 18,
      bold: true,
      color: C.tinta,
    },
  );
  s.addText(
    "«No existe la orden legal ni el puente tecnológico» para convertir ese dato en una alarma en el celular. — Senado de la República, agosto de 2026. El problema no es la falta de datos: es que nadie los traduce.",
    {
      x: M + 0.35,
      y: y0 + 3.74,
      w: 11.6,
      h: 0.55,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 13,
      color: C.media,
      lineSpacingMultiple: 1.2,
    },
  );

  pie(s, 3);
  s.addNotes(
    "Criterio B. Las tres cifras van en orden: el evento que abrió la ventana, el tamaño de la exposición, y la plata que se recupera al prevenir. La tarjeta de abajo es el remate y repite la tesis.",
  );
}

// ── 4 · Criterio C — el cliente afectado ────────────────────────────────────
{
  const s = pres.addSlide();
  const y0 = cabecera(
    s,
    "Criterio C · Se identificó al cliente afectado",
    "Quien sufre el problema no es quien firma",
    "Empresas medianas y grandes con activos físicos expuestos, en cinco sectores.",
  );

  tarjeta(s, { x: M, y: y0, w: 6.3, h: 4.3 });
  rotulo(s, "Arquetipo", M + 0.35, y0 + 0.28, C.azul, 5.6);
  s.addText("Empresa mediana o grande con activos físicos críticos", {
    x: M + 0.35,
    y: y0 + 0.6,
    w: 5.6,
    h: 0.6,
    isTextBox: true,
    margin: 0,
    fontFace: F.serif,
    fontSize: 19,
    bold: true,
    color: C.tinta,
  });
  s.addText(
    [
      { text: "Sectores: ", options: { bold: true } },
      { text: "agrícola, agropecuario, transporte, minero-energético e hidroeléctrico.", options: { breakLine: true } },
      { text: "Quién sufre el problema: ", options: { bold: true } },
      { text: "el responsable de gestión de riesgos, continuidad, operaciones o HSEQ.", options: { breakLine: true } },
      { text: "Quién firma: ", options: { bold: true } },
      { text: "el gerente general o el financiero; en empresas grandes pasa además por comité según el monto.", options: { breakLine: true } },
      { text: "Su dolor: ", options: { bold: true } },
      { text: "un día de retraso puede volver inutilizable todo el producto perecedero.", options: {} },
    ],
    {
      x: M + 0.35,
      y: y0 + 1.35,
      w: 5.6,
      h: 2.7,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 13.5,
      color: C.tinta,
      lineSpacingMultiple: 1.35,
      paraSpaceAfter: 6,
    },
  );

  rotulo(s, "Cuántos son — empresas grandes por sector", 7.35, y0 - 0.02, C.tenue, 5.5);
  const sectores = [
    ["Manufactura", "1.920"],
    ["Construcción", "756"],
    ["Agropecuario", "393"],
    ["Minero", "182"],
  ];
  sectores.forEach(([nombre, n], i) => {
    const x = 7.35 + (i % 2) * 2.75;
    const y = y0 + 0.38 + Math.floor(i / 2) * 1.55;
    tarjeta(s, { x, y, w: 2.5, h: 1.3 });
    s.addText(n, {
      x: x + 0.25,
      y: y + 0.22,
      w: 2,
      h: 0.6,
      isTextBox: true,
      margin: 0,
      fontFace: F.serif,
      fontSize: 30,
      bold: true,
      color: C.azul,
    });
    s.addText(nombre, {
      x: x + 0.25,
      y: y + 0.85,
      w: 2,
      h: 0.3,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 12.5,
      color: C.media,
    });
  });

  s.addText(
    "Fuente: «Las 10.000 empresas más grandes de Colombia 2024», Colfirma. Son el techo del segmento inicial, no el mercado total.",
    {
      x: 7.35,
      y: y0 + 3.62,
      w: 5.35,
      h: 0.68,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 11.5,
      color: C.media,
      lineSpacingMultiple: 1.2,
    },
  );

  pie(s, 4);
  s.addNotes(
    "Criterio C. Lo importante no es el número de empresas sino que quien sufre el problema no es quien firma la compra: eso define cómo se vende y por qué el producto tiene que hablar en pesos.",
  );
}

// ── 5 · Criterio G — la solución es clara ───────────────────────────────────
{
  const s = pres.addSlide();
  const y0 = cabecera(
    s,
    "Criterio G · La solución propuesta es clara",
    "Mapear, cuantificar, priorizar",
    "Sin jerga y sin pedirle al cliente que aprenda a leer un dato meteorológico.",
  );

  const pasos = [
    {
      n: "1",
      col: C.azul,
      t: "Mapear",
      d: "La empresa arma la réplica de sus sedes: edificios, cultivos, subestaciones, y qué depende de qué.",
    },
    {
      n: "2",
      col: C.ocre,
      t: "Cuantificar",
      d: "Cada fenómeno se cruza con cada activo. La salida son dos cifras: activos comprometidos y pesos que se perderían.",
    },
    {
      n: "3",
      col: C.verde,
      t: "Priorizar",
      d: "Con un presupuesto dado, la plataforma ordena en qué invertir primero según cuánta pérdida evita cada peso.",
    },
  ];

  const anchoP = (W - M * 2 - 0.6) / 3;
  pasos.forEach((p, i) => {
    const x = M + i * (anchoP + 0.3);
    tarjeta(s, { x, y: y0, w: anchoP, h: 2.75 });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.32,
      y: y0 + 0.3,
      w: 0.62,
      h: 0.62,
      fill: { color: p.col },
      line: { color: p.col, width: 0 },
    });
    s.addText(p.n, {
      x: x + 0.32,
      y: y0 + 0.38,
      w: 0.62,
      h: 0.46,
      isTextBox: true,
      margin: 0,
      fontFace: F.serif,
      fontSize: 22,
      bold: true,
      color: C.alto,
      align: "center",
    });
    s.addText(p.t, {
      x: x + 0.32,
      y: y0 + 1.08,
      w: anchoP - 0.64,
      h: 0.45,
      isTextBox: true,
      margin: 0,
      fontFace: F.serif,
      fontSize: 22,
      bold: true,
      color: C.tinta,
    });
    s.addText(p.d, {
      x: x + 0.32,
      y: y0 + 1.6,
      w: anchoP - 0.64,
      h: 1.0,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 13.5,
      color: C.media,
      lineSpacingMultiple: 1.25,
    });
  });

  tarjeta(s, { x: M, y: y0 + 3.05, w: W - M * 2, h: 1.32, tinte: C.tinta });
  rotulo(s, "Qué lo hace único", M + 0.35, y0 + 3.26, C.ocre, 6);
  s.addText(
    "En vez de mandar boletines o alertas sin convertirlos en decisiones, Kairos personaliza el análisis por lugar, activo y tipo de fenómeno. No solo alerta: prioriza en qué invertir según el retorno esperado.",
    {
      x: M + 0.35,
      y: y0 + 3.6,
      w: 11.6,
      h: 0.65,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 14.5,
      color: C.papel,
      lineSpacingMultiple: 1.2,
    },
  );

  pie(s, 5);
  s.addNotes(
    "Criterio G. Los tres pasos son el recorrido literal del prototipo, así que la demo se puede seguir en el mismo orden. La franja oscura es la respuesta a «qué hace único al proyecto» de la lámina del pitch.",
  );
}

// ── 6 · Criterio H — la solución resolvería el problema ─────────────────────
{
  const s = pres.addSlide();
  const y0 = cabecera(
    s,
    "Criterio H · La solución resolvería el problema",
    "Caiga la subestación y mire qué arrastra",
    "Prototipo funcionando, no un mockup: las cifras se recalculan al marcar la instalación.",
  );

  s.addImage({
    path: path.join(DIR, "cascada-crop.png"),
    x: M,
    y: y0,
    w: 7.4,
    h: 4.3,
    sizing: { type: "contain", w: 7.4, h: 4.3 },
  });

  const bx = 8.25;
  const stats = [
    {
      et: "El golpe",
      v: "$ 240 M",
      col: C.bermellon,
      p: "Vale la subestación eléctrica: el 3,5 % del valor asegurable de la sede.",
    },
    {
      et: "Lo que arrastra",
      v: "$ 5.600 M",
      col: C.ocre,
      p: "En invernaderos y riego que se detienen sin haber recibido un rasguño. Ninguna póliza sobre el activo caído los cubre.",
    },
    {
      et: "Decisión que habilita",
      v: "1,3 años",
      col: C.verde,
      p: "En recuperar una inversión de $ 800 M que evita $ 583 M de pérdida esperada al año.",
    },
  ];
  stats.forEach((st, i) => {
    const y = y0 + i * 1.5;
    tarjeta(s, { x: bx, y, w: 4.48, h: 1.46 });
    rotulo(s, st.et, bx + 0.26, y + 0.16, C.tenue, 3.9);
    s.addText(st.v, {
      x: bx + 0.26,
      y: y + 0.42,
      w: 3.96,
      h: 0.5,
      isTextBox: true,
      margin: 0,
      fontFace: F.serif,
      fontSize: 27,
      bold: true,
      color: st.col,
    });
    s.addText(st.p, {
      x: bx + 0.26,
      y: y + 0.88,
      w: 3.96,
      h: 0.55,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 10.5,
      color: C.media,
      lineSpacingMultiple: 1.1,
    });
  });

  s.addText(
    "Cifras de la empresa demo: ilustrativas y rotuladas como tales dentro de la plataforma.",
    {
      x: M,
      y: y0 + 4.42,
      w: 7.4,
      h: 0.34,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 10.5,
      italic: true,
      color: C.media,
    },
  );

  pie(s, 6);
  s.addNotes(
    "Criterio H. Aquí se hace la demo en vivo si hay internet: kairos-prototipo.vercel.app/simulacion?caidos=subest-f abre esta misma pantalla ya armada. El punto que tiene que quedar: 240 millones tumban 5.600.",
  );
}

// ── 7 · Criterio I — validación con clientes ────────────────────────────────
{
  const s = pres.addSlide();
  const y0 = cabecera(
    s,
    "Criterio I · La solución fue validada con clientes",
    "Una entrevista cambió el producto",
    "Cliente del sector floricultor. Lo que confirmó, y lo que todavía no alcanza.",
  );

  tarjeta(s, { x: M, y: y0, w: 6.15, h: 3.5, tinte: "E4EEE7" });
  rotulo(s, "Lo que la validación confirmó", M + 0.32, y0 + 0.24, C.verde, 5.5);
  s.addText(
    [
      { text: "La hipótesis central se sostuvo: la empresa ya tiene análisis de fenómenos naturales, pero son generales y no aplican a sus regiones de operación.", options: { bullet: true, breakLine: true } },
      { text: "Cambió el diseño del producto: apareció la tormenta eléctrica, una amenaza que no teníamos mapeada. Definir el catálogo desde afuera era un error de método.", options: { bullet: true, breakLine: true } },
      { text: "Por eso el catálogo de fenómenos hoy se configura por sede, y no viene fijo de fábrica.", options: { bullet: true } },
    ],
    {
      x: M + 0.32,
      y: y0 + 0.62,
      w: 5.5,
      h: 2.75,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 13,
      color: C.tinta,
      lineSpacingMultiple: 1.2,
      paraSpaceAfter: 8,
    },
  );

  tarjeta(s, { x: 7.2, y: y0, w: 5.5, h: 3.5, tinte: "F6EDDB" });
  rotulo(s, "Lo que todavía falta", 7.52, y0 + 0.24, C.ocre, 4.9);
  s.addText(
    [
      { text: "Una entrevista no basta. No obtuvimos cifra concreta de pérdida, ni rango de lo que pagarían, ni el nombre de quien aprueba la compra.", options: { bullet: true, breakLine: true } },
      { text: "Falta cubrir los otros cuatro sectores, que se comportan distinto entre sí.", options: { bullet: true, breakLine: true } },
      { text: "Siguiente paso: entre 8 y 10 entrevistas, con el foco puesto en obtener esas tres cosas.", options: { bullet: true } },
    ],
    {
      x: 7.52,
      y: y0 + 0.62,
      w: 4.9,
      h: 2.75,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 13,
      color: C.tinta,
      lineSpacingMultiple: 1.2,
      paraSpaceAfter: 8,
    },
  );

  s.addText(
    "El momento juega a favor: el sismo de agosto y el fenómeno de El Niño previsto para el segundo semestre son justamente los detonantes que abren la ventana en que las empresas deciden invertir en prevención. Esa ventana no dura mucho.",
    {
      x: M,
      y: y0 + 3.75,
      w: 12.1,
      h: 0.6,
      isTextBox: true,
      margin: 0,
      fontFace: F.serif,
      fontSize: 14,
      italic: true,
      color: C.media,
      lineSpacingMultiple: 1.2,
    },
  );

  pie(s, 7);
  s.addNotes(
    "Criterio I. Es el flanco más débil y conviene decirlo antes de que lo pregunten: decir qué cambió por la entrevista demuestra que sirvió, y admitir lo que falta con un plan concreto vale más que inflar la evidencia.",
  );
}

// ── 8 · Criterio F — los datos de soporte son coherentes ───────────────────
{
  const s = pres.addSlide();
  const y0 = cabecera(
    s,
    "Criterio F · Los datos de soporte son coherentes",
    "Cada cifra dice de dónde salió",
    "Y el prototipo ya está en línea: cualquiera con el enlace lo recorre completo.",
  );

  const sellos = [
    {
      col: C.verde,
      t: "En vivo",
      d: "Viene de una API pública en este momento. Sismos del USGS con la distancia a cada sede; clima de Open-Meteo por las coordenadas exactas de la finca, no por región.",
    },
    {
      col: C.azul,
      t: "Referencia",
      d: "Valor real de una fuente citada, no consultado en vivo: IDEAM, Servicio Geológico Colombiano, UNGRD, DesInventar, Colfirma.",
    },
    {
      col: C.ocre,
      t: "Ilustrativo",
      d: "Inventado para la demostración. Las cifras de la empresa demo son de este tipo, y la plataforma lo dice en la misma pantalla donde las muestra.",
    },
  ];

  sellos.forEach((sl, i) => {
    const y = y0 + i * 1.42;
    tarjeta(s, { x: M, y, w: 6.1, h: 1.28 });
    s.addShape(pres.ShapeType.ellipse, {
      x: M + 0.28,
      y: y + 0.3,
      w: 0.16,
      h: 0.16,
      fill: { color: sl.col },
      line: { color: sl.col, width: 0 },
    });
    s.addText(sl.t, {
      x: M + 0.56,
      y: y + 0.22,
      w: 3,
      h: 0.32,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 12,
      bold: true,
      color: sl.col,
    });
    s.addText(sl.d, {
      x: M + 0.28,
      y: y + 0.6,
      w: 5.55,
      h: 0.6,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 12,
      color: C.media,
      lineSpacingMultiple: 1.15,
    });
  });

  s.addText("kairos-prototipo.vercel.app", {
    x: M,
    y: y0 + 4.4,
    w: 6.1,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.mono,
    fontSize: 15,
    bold: true,
    color: C.tinta,
  });

  s.addImage({
    path: path.join(DIR, "datos-crop.png"),
    x: 7.0,
    y: y0,
    w: 5.7,
    h: 3.92,
    sizing: { type: "contain", w: 5.7, h: 3.92 },
  });
  s.addText(
    "Centro de datos de la plataforma. Los sellos verdes son consultas reales hechas al abrir la pantalla.",
    {
      x: 7.0,
      y: y0 + 4.05,
      w: 5.7,
      h: 0.34,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 11,
      italic: true,
      color: C.media,
    },
  );

  pie(s, 8);
  s.addNotes(
    "Criterio F. Este es el criterio que se gana enseñando el sistema de rótulos, no citando fuentes en una lista. El argumento: no presentamos un dato inventado como oficial, y quien nos evalúa puede verificar cuál es cuál en la pantalla.",
  );
}

// ── 9 · Cierre — Factor WOW ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.tinta };
  marca(s, M, 0.6, 0.5, true);

  rotulo(s, "Criterio J · La solución es innovadora — Factor WOW!", M, 1.55, C.ocre, 9);
  s.addText(
    "Permitimos la simulación real de desastres naturales y centralizamos el monitoreo del medio ambiente.",
    {
      x: M,
      y: 1.95,
      w: 11.3,
      h: 1.98,
      isTextBox: true,
      margin: 0,
      fontFace: F.serif,
      fontSize: 36,
      bold: true,
      color: C.papel,
      lineSpacingMultiple: 1.15,
    },
  );

  const cols = [
    {
      rot: "Por qué crece en el tiempo",
      txt: "Cada cliente nuevo y cada evento registrado alimentan el modelo y lo hacen más preciso. La ventaja se acumula: el que llega después empieza sin historia.",
    },
    {
      rot: "Hacia dónde escala",
      txt: "A los otros cuatro sectores, y a servicios que hoy no existen en el mercado local: seguros paramétricos que se activan solos cuando se cumple el umbral.",
    },
    {
      rot: "Lo que sigue",
      txt: "De 8 a 10 entrevistas para cerrar la evidencia de disposición a pagar, y calibrar las probabilidades contra los registros de la UNGRD y DesInventar.",
    },
  ];
  const anchoCol = (W - M * 2 - 0.7) / 3;
  cols.forEach((c, i) => {
    const x = M + i * (anchoCol + 0.35);
    rotulo(s, c.rot, x, 4.15, C.ocre, anchoCol);
    s.addText(c.txt, {
      x,
      y: 4.5,
      w: anchoCol,
      h: 1.6,
      isTextBox: true,
      margin: 0,
      fontFace: F.sans,
      fontSize: 13,
      color: C.tenue,
      lineSpacingMultiple: 1.3,
    });
  });

  s.addText("kairos-prototipo.vercel.app", {
    x: M,
    y: 6.5,
    w: 8,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.mono,
    fontSize: 14,
    color: C.papel,
  });

  s.addNotes(
    "Cierre. Rematar con el Factor WOW tal como está en la lámina y dejar la URL en pantalla mientras responden preguntas.",
  );
}

const salida = path.join(DIR, "Kairos-Pitch-2.pptx");
pres.writeFile({ fileName: salida }).then(() => console.log("escrito:", salida));
