/**
 * Sección del equipo.
 *
 * Esta sección se mantiene como Server Component a propósito.
 *
 * Los cinco retratos están en `public/equipo/`, recortados a 4 a 5 y con la
 * cara a la misma escala en todos, que es lo que hace que la fila se lea como
 * una rejilla y no como cinco fotos sueltas.
 *
 * Aun así la tarjeta no da por hecho que el archivo esté. `next/image` protesta
 * en consola cuando falta, así que hay que saberlo antes de renderizar la
 * imagen. Al correr en el servidor podemos mirar el disco con `existsSync`, que
 * es la respuesta real y no una suposición. Si alguien cambia una foto y se
 * equivoca en el nombre, la tarjeta vuelve a las iniciales en vez de romperse.
 *
 * El encuadre del retrato es el mismo con foto y sin foto (4 a 5), así que la
 * rejilla no salta cuando las fotos vayan llegando una por una.
 *
 * Sobre el monograma: mañana el sitio se presenta con iniciales en las cinco
 * tarjetas, así que las iniciales no pueden verse como el hueco que dejó una
 * foto que falta. Van grandes, en la serif del display y sobre una superficie
 * hundida con luz propia, de modo que el estado sin foto se lea como una ficha
 * de archivo y no como una imagen rota. Es el estado normal, no el de error.
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
        aquí y no se repite en cada tarjeta. Van como píldoras y no como un
        rótulo suelto entre líneas: a tres metros una insignia se ve y un rótulo
        de 10px se pierde.
      */}
      <Revelar retraso={80}>
        <div className="mt-10 flex flex-wrap items-center gap-2.5">
          <span className="pildora pildora-papel">{universidad}</span>
          <span className="pildora pildora-papel">Grupo 1</span>
        </div>
      </Revelar>

      {/*
        `h-full` encadenado hasta la tarjeta es lo que mantiene parejas las
        cinco alturas: la rejilla estira la fila, el `li` y el `Revelar` pasan
        ese alto hacia abajo y la tarjeta lo ocupa completo.
      */}
      <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5 lg:gap-5">
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
    <article className="lamina lamina-viva flex h-full flex-col overflow-hidden rounded-lg">
      {/*
        La superficie del retrato queda hundida respecto del papel de la
        tarjeta. Esa diferencia de plano es la que separa la imagen del texto,
        por eso aquí no hace falta una línea divisoria.
      */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-papel-hundido shadow-[inset_0_-1px_0_color-mix(in_srgb,var(--tinta)_9%,transparent)]">
        {retrato ? (
          <Image
            src={retrato}
            alt={integrante.nombre}
            fill
            sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 45vw"
            // Con los archivos ya recortados a 4 a 5 esto no mueve nada, pero
            // sostiene el caso de una foto sin recortar. Va en línea porque es
            // un dato de cada persona, no una decisión de estilo repetible.
            style={{ objectPosition: integrante.encuadre ?? "50% 35%" }}
            className="object-cover saturate-[0.65] contrast-[1.02]"
          />
        ) : (
          <>
            {/* Luz que entra por arriba a la izquierda, la misma dirección que
                la del papel del sitio. Sin esto el panel es un gris plano. */}
            <div className="absolute inset-0 bg-[radial-gradient(135%_100%_at_28%_0%,var(--papel-alto),var(--papel-hundido)_64%)]" />
            <span
              className="display absolute inset-0 grid place-items-center text-[3.3rem] leading-none tracking-[0.02em] text-[color-mix(in_srgb,var(--tinta)_34%,transparent)] sm:text-[3.6rem]"
              aria-hidden
            >
              {integrante.iniciales}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="display text-[18px] leading-tight sm:text-[19px]">
          {integrante.nombre}
        </h3>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-tinta-media">
          {integrante.programa}
        </p>

        {/* La nota va pegada al programa y no al final, para que la insignia
            del semestre quede a la misma altura en las cinco tarjetas. */}
        {integrante.nota && (
          <p className="mt-2 text-[12.5px] leading-relaxed text-tinta-tenue">
            {integrante.nota}
          </p>
        )}

        {/* El semestre es un dato de una sola línea, así que va como insignia
            y se apoya en el fondo de la tarjeta en vez de flotar en gris. */}
        <div className="mt-auto pt-5">
          <span className="pildora pildora-papel">{integrante.semestre}</span>
        </div>
      </div>
    </article>
  );
}
