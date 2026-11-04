/**
 * Sección del equipo.
 *
 * Esta sección se mantiene como Server Component a propósito.
 *
 * Los retratos todavía no existen: `public/equipo/` está creado y vacío, y cada
 * integrante ya trae el nombre del archivo que le corresponde. La idea es que
 * cuando alguien deje el `.jpg` ahí la foto aparezca sin tocar código. El
 * problema es que `next/image` protesta en consola cuando el archivo no está,
 * así que hay que saber si está antes de renderizar la imagen. Al correr en el
 * servidor podemos simplemente mirar el disco con `existsSync`, que es la
 * respuesta real y no una suposición. Si el archivo falta, la tarjeta dibuja las
 * iniciales sobre papel hundido: un estado válido, no un hueco de error.
 *
 * El encuadre del retrato es el mismo con foto y sin foto (4 a 5), así que la
 * rejilla no salta cuando las fotos vayan llegando una por una.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Seccion, RotuloSeccion, TituloSeccion } from "@/components/sitio/base";
import { Revelar } from "@/components/sitio/revelar";
import { equipo, universidad, type Integrante } from "@/data/equipo";

/** Directorio donde se dejan los retratos, resuelto una sola vez. */
const DIRECTORIO_RETRATOS = path.join(process.cwd(), "public", "equipo");

/** Devuelve la ruta pública del retrato solo si el archivo existe en disco. */
function retratoDisponible(foto?: string): string | null {
  if (!foto) return null;
  return existsSync(path.join(DIRECTORIO_RETRATOS, foto))
    ? `/equipo/${foto}`
    : null;
}

export function Equipo() {
  return (
    <Seccion id="equipo" tono="papel">
      <Revelar>
        <RotuloSeccion n="07">El equipo</RotuloSeccion>
        <TituloSeccion
          bajada={
            <>
              Kairos nació en ISIS 2007, Diseño de Productos e Innovación con TI.
              El mismo grupo que hizo la investigación de campo construyó el
              prototipo.
            </>
          }
        >
          Cinco estudiantes de los Andes.
        </TituloSeccion>
      </Revelar>

      {/*
        La universidad es la misma para los cinco, así que se nombra una vez
        aquí y no se repite en cada tarjeta.
      */}
      <Revelar retraso={80}>
        <p className="rotulo mt-12 flex items-center gap-3">
          <span className="whitespace-nowrap">{universidad}</span>
          <span className="h-px flex-1 bg-linea-fina" />
          <span className="whitespace-nowrap">Grupo 1</span>
        </p>
      </Revelar>

      <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {equipo.map((integrante, i) => (
          <li key={integrante.nombre} className="h-full">
            <Revelar retraso={i * 70} className="h-full">
              <Tarjeta integrante={integrante} />
            </Revelar>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

function Tarjeta({ integrante }: { integrante: Integrante }) {
  const retrato = retratoDisponible(integrante.foto);

  return (
    <article className="lamina flex h-full flex-col rounded">
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-linea bg-papel-hundido">
        {retrato ? (
          <Image
            src={retrato}
            alt={integrante.nombre}
            fill
            sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover saturate-[0.65] contrast-[1.02]"
          />
        ) : (
          <span className="display absolute inset-0 grid place-items-center text-[2.25rem] leading-none text-tinta-tenue">
            {integrante.iniciales}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="display text-[17px] leading-tight">{integrante.nombre}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-tinta-media">
          {integrante.programa}
        </p>
        <p className="rotulo mt-auto pt-3">{integrante.semestre}</p>
        {integrante.nota && (
          <p className="mt-3 border-t border-linea-fina pt-3 text-[12px] leading-relaxed text-tinta-media">
            {integrante.nota}
          </p>
        )}
      </div>
    </article>
  );
}
