# Ejercicio 6 — incisos a, b y c

`Ejercicio 6 - Modelo de Negocio Consolidado - Grupo 1.docx` es lo que se entrega.
Es **el documento del profesor con las respuestas insertadas**: conserva el
enunciado original intacto —texto, imagen del canvas y la numeración a) a n)— y
agrega un bloque «Respuesta» debajo de los incisos a, b y c.

## Cómo se regenera

`completar-ejercicio-6.py` desempaqueta el enunciado original, inserta las
respuestas en `word/document.xml` respetando los estilos del documento
(`Párrafo de lista`, justificado, A4) y lo vuelve a empaquetar.

```bash
unzip -q "Ejercicio 6 -Modelo de Negocio Consolidado Precio y Modelo Financiero V2 (1).docx" -d un
python3 completar-ejercicio-6.py
(cd un && zip -Xrq ../salida.docx .)
```

Se genera por código y no se edita a mano: así una corrección de cifra no hay que
repetirla en seis tablas. Si se edita el `.docx` directamente, la siguiente
ejecución lo pisa.

> El orden de los elementos en OOXML es estricto y el esquema lo valida: dentro
> de `w:pPr`, `spacing` va **antes** de `ind`; dentro de `w:tblPr`, `tblLayout`
> va **antes** de `tblCellMar`. Ponerlos al revés produce un archivo que Word
> abre pero que no valida.

## Las cifras

En `parametros.md` — es lo único que los incisos d a l necesitan de aquí.

## Reglas de redacción

El texto de las respuestas no usa punto y coma ni raya larga, y evita los dos
puntos. Son tres caracteres que delatan la prosa generada y que el profesor
nota. Si se edita el contenido, conviene verificar antes de entregar.

```bash
python3 -c "
import re
s=open('completar-ejercicio-6.py',encoding='utf-8').read().split('─── a ───')[1]
t=' '.join(re.findall(r\"'([^']{12,})'\", s))
print({c: t.count(c) for c in ';—–:'})
"
```
