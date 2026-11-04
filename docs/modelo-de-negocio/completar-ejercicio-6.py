# -*- coding: utf-8 -*-
import re, html

DOC = 'un/word/document.xml'
IND = 1068            # sangría del cuerpo en el original
TW  = 8504 - IND      # ancho útil para tablas

def esc(t): return html.escape(t, quote=False)


def segments(t):
    """**negrita** y *cursiva* -> [(texto, negrita, cursiva)]"""
    out = []
    for i, part in enumerate(str(t).split('**')):
        b = bool(i % 2)
        for j, sub in enumerate(part.split('*')):
            if sub == '': continue
            out.append((sub, b, bool(j % 2)))
    return out

def rpr(b, it, sz=None):
    x = ('<w:b/><w:bCs/>' if b else '') + ('<w:i/><w:iCs/>' if it else '')
    if sz: x += '<w:sz w:val="%d"/><w:szCs w:val="%d"/>' % (sz, sz)
    return '<w:rPr>%s</w:rPr>' % x if x else ''

def runs(t):
    """**negrita** dentro del texto."""
    return ''.join('<w:r>%s<w:t xml:space="preserve">%s</w:t></w:r>'
                   % (rpr(b, it), esc(txt)) for txt, b, it in segments(t))

def P(t='', ind=IND, before=0, after=60):
    sp = '<w:spacing w:before="%d" w:after="%d"/>' % (before, after)
    return ('<w:p><w:pPr><w:pStyle w:val="Prrafodelista"/><w:adjustRightInd w:val="0"/>'
            '%s<w:ind w:left="%d"/><w:jc w:val="both"/></w:pPr>%s</w:p>' % (sp, ind, runs(t)))

def SUB(t):
    """Subtítulo del desarrollo: negrita, sin justificar."""
    return ('<w:p><w:pPr><w:pStyle w:val="Prrafodelista"/><w:adjustRightInd w:val="0"/>'
            '<w:spacing w:before="200" w:after="80"/><w:ind w:left="%d"/></w:pPr>'
            '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">%s</w:t></w:r></w:p>'
            % (IND, esc(t)))

def _tc(txt, w, bold=False, fill=None, align=None):
    shd = '<w:shd w:val="clear" w:color="auto" w:fill="%s"/>' % fill if fill else ''
    jc  = '<w:jc w:val="%s"/>' % align if align else ''
    empty_rpr = '<w:rPr>%s<w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' % ('<w:b/><w:bCs/>' if bold else '')
    body = ''
    for seg, b, it in segments(txt):
        for j, line in enumerate(seg.split('\n')):
            br = '<w:br/>' if j else ''
            body += ('<w:r>%s%s<w:t xml:space="preserve">%s</w:t></w:r>'
                     % (rpr(b or bold, it, 18), br, esc(line)))
    if not body:
        body = '<w:r>%s<w:t/></w:r>' % empty_rpr
    return ('<w:tc><w:tcPr><w:tcW w:w="%d" w:type="dxa"/>%s'
            '<w:vAlign w:val="center"/></w:tcPr>'
            '<w:p><w:pPr><w:spacing w:before="20" w:after="20" w:line="240" w:lineRule="auto"/>%s'
            '<w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:pPr>%s</w:p></w:tc>'
            % (w, shd, jc, body))

def TABLE(head, rows, widths, aligns=None):
    assert sum(widths) == TW, 'anchos suman %d, deben sumar %d' % (sum(widths), TW)
    aligns = aligns or [None]*len(widths)
    bd = ''.join('<w:%s w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>' % s
                 for s in ('top','left','bottom','right','insideH','insideV'))
    x = ('<w:tbl><w:tblPr><w:tblW w:w="%d" w:type="dxa"/>'
         '<w:tblInd w:w="%d" w:type="dxa"/><w:tblBorders>%s</w:tblBorders>'
         '<w:tblLayout w:type="fixed"/>'
         '<w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/>'
         '<w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar>'
         '</w:tblPr><w:tblGrid>%s</w:tblGrid>'
         % (TW, IND, bd, ''.join('<w:gridCol w:w="%d"/>' % w for w in widths)))
    if head:
        x += ('<w:tr><w:trPr><w:tblHeader/></w:trPr>%s</w:tr>'
              % ''.join(_tc(h, widths[i], bold=True, fill='F2F2F2',
                            align=aligns[i]) for i, h in enumerate(head)))
    for r in rows:
        tot = isinstance(r, tuple)
        cells = r[0] if tot else r
        x += '<w:tr>%s</w:tr>' % ''.join(
            _tc(c, widths[i], bold=tot, fill='FAFAFA' if tot else None, align=aligns[i])
            for i, c in enumerate(cells))
    return x + '</w:tbl>' + P('', after=0)

def TOT(cells): return (cells,)


# ─────────────────────────────── a ───────────────────────────────
A = []
A.append(SUB('Respuesta'))
A.append(P('**Unidad de cobro.** Kairos factura **por sede** y cambia la tarifa según el **tipo de sede**. No cobramos por usuario, porque los que sufren el problema son dos o tres personas y el valor no crece con los asientos. Tampoco por evento, porque ganaríamos más en los años de desastre y el valor aparece entre eventos, cuando todavía se puede invertir en prevención.'))
A.append(P('Hay **tres tipos de sede** porque el modelo las representa de tres formas distintas.'))
A.append(TABLE(
    ['Tipo', 'Cómo se modela', 'Qué cubre'],
    [['**Punto**', 'Una coordenada', 'Bodega, oficina, planta pequeña, centro de acopio'],
     ['**Complejo**', 'Un grafo de dependencias entre activos', 'Planta industrial, centro de poscosecha y frío, subestación, puerto, mina'],
     ['**Campo**', 'Un polígono con series climáticas interpoladas', 'Cultivo, invernadero, potrero, finca ganadera, corredor vial']],
    [1100, 2300, 4036]))
A.append(P('El complejo es el más caro de implementar, porque hay que levantar cada activo y cada dependencia, y es ahí donde aparece el efecto cascada que diferencia al producto. El campo es el más caro de operar, porque se recalibra en cada ciclo de cultivo. El punto sale barato en las dos cosas.'))
A.append(P('Estas son las fichas que usamos del cuadernillo *26 revenue model cards* de Board of Innovation. El mazo pide combinar categorías y nosotros tomamos *Value proposition* con *Pricing tactic*.'))
A.append(TABLE(
    ['Categoría', 'Fichas', 'Cómo aplican'],
    [['Value proposition', '#2 Loss/aversion\n#6 Convenience', 'La aversión a la pérdida y la conveniencia frente a leer boletines del IDEAM. El gemelo digital además crea costo de cambio.'],
     ['Pricing tactic', '#18 Subscription\n#23 Upselling\n#22 Flat rate\n#20 Pay-per-use\n#24 Pre-sales', 'Suscripción anual por sede, complementos, tarifa única de implementación y reportes, decremento por volumen y cobro por hectárea, Programa Fundadores.'],
     ['Free for the user', '#16 Freemium\n#13 Non-monetary', 'Mirador gratis entra por quien sufre el problema sin pasar por quien firma. Cada ubicación configurada calibra el modelo.'],
     ['Third party pays\nthe bills', '#11 Affiliate/referral', 'Canal asegurador desde 2029. La ficha fija la comisión entre 5 y 10% del precio.']],
    [1250, 1700, 4486]))
A.append(P('Descartamos *Data selling*, porque vender datos de exposición de un cliente acaba con la confianza, y también *Advertising* y *Marketplace*, que no aplican a un producto con pocos compradores y un solo lado. A *Dynamic pricing* la aplazamos. Su ejemplo es Flock, una plataforma de riesgo que ajusta la prima con datos en vivo, y es a donde queremos llegar en 2029, pero exige historial de siniestros y licencia de aseguradora.'))
A.append(P('De los patrones de Osterwalder aplicamos dos. *GRATIS como modelo de negocio* en su variante freemium, y *plataformas multilaterales* desde 2029, cuando la aseguradora pague por llegar a empresas ya caracterizadas. No aplican la desagregación ni la larga cola.'))
A.append(P('Quedan seis líneas de ingreso. La suscripción anual por sede es el negocio. Mirador gratis abre la puerta y la implementación del gemelo digital se cobra una vez. El Reporte de Priorización es la cuña con la que el jefe de riesgos defiende el presupuesto. Los complementos suben el ticket y el canal asegurador llega en 2029.'))

# ─────────────────────────────── b ───────────────────────────────
B = []
B.append(SUB('Respuesta'))
B.append(P('**Moneda.** La lista va en dólares y el peso queda como referencia. Entre el 1 y el 19 de octubre de 2026 la TRM bajó de $3.312,84 a $3.174,67, un 4,2% en diecinueve días, y buena parte del costo se causa en dólares (nube, licencias de datos, herramientas) mientras la nómina se causa en pesos. Como el cliente factura en pesos, el contrato fija la TRM de la firma por doce meses con banda de ±5%. Aquí usamos COP $3.160 por dólar, sin IVA y con pago anual anticipado.'))
B.append(P('Para fijar el precio cruzamos **tres anclas**, siguiendo el paso 16 de Aulet. El **techo** lo da el valor, porque en el caso demo la plataforma encuentra USD 184.500 al año de pérdida evitable y capturar entre 10 y 25% dejaría el precio entre 18.450 y 46.100. La **referencia** es lo que el cliente hace hoy, que es pagar un analista de continuidad por unos COP 82 millones al año cargados o USD 25.975, según las ofertas publicadas. El **piso** lo da el costo de servir una sede, entre USD 120 y 312 al año. El precio quedó en el traslape.'))
B.append(P('Hay una restricción que viene de la validación. Quien sufre el problema no es quien firma, y en empresas grandes la compra pasa por comité según el monto. Dimensionamos los planes para que quepan bajo la firma del gerente, porque cada paso al comité son semanas de ciclo y esas semanas son costo de adquisición.'))
B.append(SUB('Suscripción anual por sede (USD)'))
B.append(TABLE(
    ['Tipo', 'S', 'M', 'L'],
    [['**Punto**', '2.400\n≤ 10 activos', '3.600\n11 a 25', '5.400\n26 a 50'],
     ['**Complejo**', '6.000\n≤ 25 activos', '9.600\n26 a 60', '15.600\n61 a 120'],
     ['**Campo**', '3.600\n≤ 50 ha', '7.200\n51 a 300', '13.200\n301 a 1.500']],
    [1436, 2000, 2000, 2000], [None, 'center', 'center', 'center']))
B.append(P('Campo XL, por encima de 1.500 ha, cuesta 13.200 más 4 dólares por hectárea adicional. La plataforma base vale USD 2.400 al año por cuenta. El volumen tiene decremento, de modo que las sedes 1 a 3 pagan el 100%, las 4 a 10 el 75%, las 11 a 25 el 55% y de la 26 en adelante el 40%.'))
B.append(SUB('Pagos únicos y complementos (USD)'))
B.append(TABLE(
    ['Concepto', 'Punto', 'Complejo', 'Campo'],
    [['Implementación del gemelo digital', '1.800', '4.800', '3.600'],
     ['Reporte de Priorización, se abona 100% si convierte en 90 días', '1.200', '3.000', '2.400']],
    [3836, 1200, 1200, 1200], [None, 'center', 'center', 'center']))
B.append(TABLE(
    ['Complemento', 'Precio'],
    [['Paquete de amenaza especializada (descargas eléctricas, radar de granizo)', '1.080 por amenaza, sede y año'],
     ['Conector a ERP, SCADA o sensores', '4.200 una vez más 195 al mes'],
     ['Estación meteorológica en sitio, equipo de aliado revendido', '2.880 más 80 al mes de telemetría'],
     ['Taller de continuidad o simulacro asistido', '1.560 por jornada'],
     ['Kairos Embedded para aseguradoras, desde 2029', '20 por sede asegurada al año, mínimo 250']],
    [4436, 3000]))
B.append(P('**Política de precios.** El precio lista es alto y público y el descuento va en el contrato, porque bajar un precio es fácil y subirlo no. Los primeros ocho clientes entran al Programa Fundadores con 40% de descuento el primer año, a cambio de caso de estudio, histórico de eventos y dos referencias. El pago anual anticipado lleva 15% y baja el churn. La implementación no se regala aunque se abone después. Cotizamos siempre contra la pérdida esperada de esa empresa, nunca contra el precio de un competidor.'))
B.append(P('**El caso demo.** Flores del Oriente tiene dos sedes, Facatativá como Campo S y Funza como Complejo S. Paga USD 22.560 el primer año y USD 14.160 de ahí en adelante, unos COP 71,3 y 44,7 millones, con implementación y paquete de tormenta eléctrica incluidos. Eso es el 12,2% y el 7,7% de la pérdida que la plataforma le identifica. Entramos bajo a propósito, porque todavía no tenemos disposición a pagar validada y preferimos subir en la renovación.'))

# ─────────────────────────────── c ───────────────────────────────
Cx = []
Cx.append(SUB('Respuesta'))
Cx.append(P('Clasificamos los costos por el corte que pide el enunciado y por dos más. Separamos costo de servir de gasto de operación, porque sin eso no hay margen bruto para los Unit Economics de los incisos k y l. También separamos pesos de dólares, porque la nómina y la oficina se pagan en pesos mientras la nube y los datos se pagan en dólares.'))
Cx.append(SUB('Costos variables recurrentes, por sede activa al año (USD)'))
Cx.append(TABLE(
    ['Concepto', 'Punto', 'Complejo', 'Campo', 'Casilla del lienzo'],
    [['Cómputo y almacenamiento del motor', '60', '168', '144', 'Recursos clave'],
     ['Soporte de primer nivel', '48', '108', '84', 'Actividades clave'],
     ['Recalibración de perfiles de amenaza', '12', '36', '48', 'Actividades clave'],
     TOT(['**Total por sede al año**', '**120**', '**312**', '**276**', ''])],
    [2736, 800, 800, 800, 2300], [None, 'center', 'center', 'center', None]))
Cx.append(P('El complejo gasta más en cómputo porque cada simulación recorre un grafo de dependencias en vez de una tabla, y más en soporte porque es donde el cliente pregunta. El campo se recalibra en cada ciclo de cultivo y guarda series climáticas diarias sobre un polígono.'))
Cx.append(SUB('Otros costos variables'))
Cx.append(TABLE(
    ['Concepto', 'Valor', 'Casilla del lienzo'],
    [['Implementación de punto, complejo y campo', 'USD 780, 2.100 y 1.560 por sede', 'Actividades clave'],
     ['Reporte de Priorización', 'USD 560 a 1.400', 'Actividades clave'],
     ['Comisión de ventas', '8% del ACV del primer año', 'Canales'],
     ['Recaudo y facturación electrónica', '0,8% del recaudo', 'Aliados'],
     ['Estación meteorológica revendida', 'USD 2.300 por estación', 'Aliados']],
    [2736, 2400, 2300]))
Cx.append(P('La comisión de ventas es la única variable que no es costo de servir. Es gasto comercial y entra en el COCA del inciso g, no en el margen bruto.'))
Cx.append(SUB('Costos fijos mensuales, año 1 con equipo de seis personas'))
Cx.append(TABLE(
    ['Concepto', 'COP', 'USD', 'Casilla del lienzo'],
    [['Nómina cargada, 6 personas, factor prestacional 1,52', '49.400.000', '15.633', 'Recursos clave'],
     ['Marketing digital, pauta y eventos sectoriales', '6.000.000', '1.899', 'Canales'],
     ['Licencias de datos de alcance nacional', '4.582.000', '1.450', 'Aliados'],
     ['Oficina y coworking, 6 puestos', '3.600.000', '1.139', 'Recursos clave'],
     ['Viajes y visitas comerciales', '2.500.000', '791', 'Canales'],
     ['Legal, contable y revisoría fiscal', '2.400.000', '759', 'General'],
     ['Herramientas del equipo (CRM, repositorio, diseño)', '2.212.000', '700', 'Recursos clave'],
     ['Infraestructura base (dev, staging, respaldos)', '1.801.200', '570', 'Recursos clave'],
     ['Seguridad y certificación ISO 27001', '1.501.000', '475', 'Actividades clave'],
     ['Seguro de responsabilidad civil profesional', '1.100.000', '348', 'General'],
     ['Imprevistos, 5%', '3.754.810', '1.188', 'General'],
     TOT(['**Total mensual**', '**78.851.010**', '**24.953**', ''])],
    [3236, 1400, 900, 1900], [None, 'right', 'right', None]))
Cx.append(P('En el año suman **USD 299.400**, unos COP 946,2 millones. La licencia de datos es fija y no variable, porque se licencia por cobertura nacional y cuesta lo mismo con tres clientes que con cincuenta, y de ahí sale el apalancamiento operativo del negocio. El seguro de responsabilidad civil tampoco es opcional, porque Kairos vende la recomendación de en qué invertir y no el dato.'))
Cx.append(P('Los costos fijos tampoco son planos. Cada estructura de equipo atiende un rango de clientes y pasar al siguiente rango es un escalón.'))
Cx.append(TABLE(
    ['Tramo', 'Clientes que puede servir', 'Equipo', 'USD al año'],
    [['1', '0 a 15', '6 personas', '299.400'],
     ['2', '16 a 35', '9 personas', '452.000'],
     ['3', '36 a 60', '12 personas', '617.000']],
    [900, 2736, 2000, 1800], ['center', 'center', None, 'right']))
Cx.append(P('Con esto queda armado el inciso d. El ingreso promedio por cliente es de USD 13.710 con una cartera de clientes pequeños y de USD 25.635 si entran cuentas con sedes tipo complejo y campo grandes, con 95% de contribución bruta en los dos casos. Con la primera mezcla no llegamos al 30% en tres años, porque harían falta 51 clientes y el equipo del tramo 2 solo atiende 35. Con la segunda llegamos con 28 clientes y nueve personas, a 31,8%. El 30% no sale del precio sino de la mezcla de tipos de sede.'))

# ─────────────────────────────── inserción ───────────────────────────────
x = open(DOC, encoding='utf-8').read()
ps = [m.group(0) for m in re.finditer(r'<w:p\b.*?</w:p>', x, re.S)]
for idx, blk in sorted([(13, A), (15, B), (17, Cx)], reverse=True):
    anchor = ps[idx]
    pos = x.index(anchor) + len(anchor)
    x = x[:pos] + ''.join(blk) + P('', after=0) + x[pos:]
open(DOC, 'w', encoding='utf-8').write(x)
print('insertado')
