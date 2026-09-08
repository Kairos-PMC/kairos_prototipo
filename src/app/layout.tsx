import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kairos — Simulador digital de riesgos",
  description:
    "Prototipo: centro de datos públicos sobre amenazas naturales en Colombia y simulador de riesgo para la infraestructura física de las empresas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
