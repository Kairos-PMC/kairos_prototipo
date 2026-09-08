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
  title: "Kairos — Simulador digital de riesgos",
  description:
    "Centro de datos públicos sobre amenazas naturales en Colombia y simulador de riesgo para la infraestructura física de las empresas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
