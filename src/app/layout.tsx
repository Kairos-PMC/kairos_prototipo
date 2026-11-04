import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

// IBM Plex: la familia tiene carácter técnico sin caer en la neutralidad de las
// grotescas de sistema, y sus tres cortes conviven — serif para titulares, sans
// para lectura, mono para todo lo que sea dato o cota.
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-sans",
  display: "swap",
});

const serif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-serif",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // El título lleva plantilla porque las pantallas internas se nombran solas y
  // el sitio público no debería repetir "Kairos" dos veces en la pestaña.
  title: {
    default: "Kairos — Simulador digital de riesgos",
    template: "%s — Kairos",
  },
  description:
    "Kairos simula fenómenos naturales sobre las sedes de una empresa y le pone precio al efecto en cadena. Lo que golpea el fenómeno rara vez es lo caro, lo caro es lo que ese golpe arrastra.",
  applicationName: "Kairos",
  authors: [{ name: "Grupo 1 · ISIS 2007 · Universidad de los Andes" }],
  keywords: [
    "riesgo",
    "fenómenos naturales",
    "continuidad del negocio",
    "Colombia",
    "simulación",
    "IDEAM",
    "Servicio Geológico Colombiano",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Kairos",
    title: "Kairos — Simulador digital de riesgos",
    description:
      "Lo que golpea el fenómeno rara vez es lo caro. Lo caro es lo que ese golpe arrastra.",
    images: [{ url: "/simulacion-poster.png", width: 1280, height: 760 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kairos — Simulador digital de riesgos",
    description:
      "Lo que golpea el fenómeno rara vez es lo caro. Lo caro es lo que ese golpe arrastra.",
    images: ["/simulacion-poster.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        {/* El revelado al entrar en pantalla lo enciende JavaScript. Si no corre,
            el contenido se quedaría en su estado inicial, que es invisible. Esto
            lo devuelve a la vista. Importa en una demostración pública, donde no
            se controla ni el equipo ni la red. */}
        <noscript>
          <style>{".revelar { opacity: 1 !important; transform: none !important; }"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
