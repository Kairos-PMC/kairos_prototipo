/**
 * El equipo.
 *
 * Los retratos se agregan dejando el archivo en `public/equipo/` con el nombre
 * que indica `foto`. Mientras no exista, la tarjeta dibuja las iniciales sobre
 * papel y el sitio no se rompe ni muestra un hueco: es un estado válido, no un
 * error.
 *
 * `rol` todavía no está asignado para nadie — el reparto de roles del equipo
 * está pendiente (ver docs/video-pitch/escaleta-3min.md, minuto 2:37). Lo que
 * se muestra es el programa académico, que sí es un hecho verificable.
 */

export interface Integrante {
  nombre: string;
  iniciales: string;
  /** Programa o programas que cursa. */
  programa: string;
  /** Semestre en curso. */
  semestre: string;
  /** Una línea adicional solo si hay algo real que decir. */
  nota?: string;
  /** Nombre del archivo dentro de public/equipo/. */
  foto?: string;
  /**
   * Dónde queda la cara dentro del recorte 4 a 5 de la tarjeta.
   *
   * Existe porque las fotos del grupo no son retratos de estudio: hay una de
   * cuerpo entero contra un atardecer, otra en un puerto y una de cámara web.
   * Con el centro por defecto la cara de las de cuerpo entero cae en mitad de
   * la tarjeta o más abajo. El valor es un `object-position` de CSS, primero
   * horizontal y después vertical.
   */
  encuadre?: string;
}

export const universidad = "Universidad de los Andes";

export const equipo: Integrante[] = [
  {
    nombre: "María Alejandra Rodríguez",
    iniciales: "MR",
    programa: "Ingeniería de Sistemas",
    semestre: "7.º semestre",
    foto: "maria-alejandra-rodriguez.jpg",
    // Cuerpo entero en un puerto, la cara queda algo abajo del centro.
    encuadre: "52% 50%",
  },
  {
    nombre: "Juan Camilo Solano",
    iniciales: "JS",
    programa: "Ingeniería de Sistemas y Matemáticas",
    semestre: "7.º semestre",
    foto: "juan-camilo-solano.jpg",
    // Vertical y de cerca, la cara va alta.
    encuadre: "58% 20%",
  },
  {
    nombre: "Samuel Montoya",
    iniciales: "SM",
    programa: "Ingeniería de Sistemas y Matemáticas",
    semestre: "7.º semestre",
    foto: "samuel-montoya.jpg",
    // Cámara web apaisada, la cara queda centrada y un poco arriba.
    encuadre: "52% 34%",
  },
  {
    nombre: "Antonio Muñoz",
    iniciales: "AM",
    programa: "Ingeniería de Sistemas",
    semestre: "7.º semestre",
    foto: "antonio-munoz.jpg",
    // Cuerpo entero contra el atardecer, hay que subir mucho el recorte.
    encuadre: "42% 30%",
  },
  {
    nombre: "Raúl Ruiz",
    iniciales: "RR",
    programa: "Ingeniería de Sistemas y Gobierno y Asuntos Públicos",
    semestre: "7.º semestre",
    nota: "Experiencia en startups",
    foto: "raul-ruiz.jpg",
    // Medio cuerpo sobre fondo liso, la cara va en el tercio de arriba.
    encuadre: "50% 24%",
  },
];
