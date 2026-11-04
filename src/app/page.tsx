import { Encabezado } from "@/components/sitio/encabezado";
import { Hero } from "@/components/sitio/hero";
import { Problema } from "@/components/sitio/problema";
import { PorQueAhora } from "@/components/sitio/por-que-ahora";
import { ComoFunciona } from "@/components/sitio/como-funciona";
import { Prototipo } from "@/components/sitio/prototipo";
import { Validacion } from "@/components/sitio/validacion";
import { Modelo } from "@/components/sitio/modelo";
import { Equipo } from "@/components/sitio/equipo";
import { Pie } from "@/components/sitio/pie";

/**
 * El sitio público.
 *
 * El orden de las secciones es el del pitch y no es decorativo: primero el
 * problema, después por qué hay que resolverlo ahora, después cómo, y recién
 * entonces el prototipo. Quien llega buscando el producto entra por el botón
 * del encabezado, que está fijo desde el primer scroll y nunca queda lejos.
 *
 * La validación va antes del modelo de negocio a propósito. Dice en voz alta lo
 * que todavía no sabemos, y es más creíble admitirlo antes de hablar de precios
 * que después.
 */
export default function Landing() {
  return (
    <>
      <Encabezado />
      <main>
        <Hero />
        <Problema />
        <PorQueAhora />
        <ComoFunciona />
        <Prototipo />
        <Validacion />
        <Modelo />
        <Equipo />
      </main>
      <Pie />
    </>
  );
}
