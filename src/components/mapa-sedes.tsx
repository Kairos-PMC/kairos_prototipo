"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

export interface PuntoMapa {
  id: string;
  nombre: string;
  detalle: string;
  lat: number;
  lon: number;
  /** 0..1 — intensidad del marcador según la exposición relativa. */
  peso: number;
}

/**
 * Mapa de sedes.
 *
 * Usa MapLibre con el estilo Dark Matter de CARTO: gratuito, sin API key y sin
 * cuenta en ningún proveedor — la misma restricción que rige todo el prototipo.
 *
 * Dos detalles que no son opcionales:
 *  - La librería se importa DENTRO del efecto. MapLibre toca `window` al
 *    cargarse, y un componente cliente igual se renderiza en el servidor.
 *  - Desde la versión 6 no hay export por defecto; todo es nombrado.
 */
export function MapaSedes({ puntos }: { puntos: PuntoMapa[] }) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contenedor.current) return;

    let mapa: { remove: () => void } | null = null;
    let cancelado = false;

    (async () => {
      const { Map, Marker, Popup, NavigationControl, LngLatBounds } = await import(
        "maplibre-gl"
      );
      if (cancelado || !contenedor.current) return;

      const m = new Map({
        container: contenedor.current,
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [-74.28, 4.76],
        zoom: 9.5,
        attributionControl: { compact: true },
      });
      mapa = m;
      m.addControl(new NavigationControl({ showCompass: false }), "top-right");

      for (const p of puntos) {
        const elemento = document.createElement("div");
        const tamano = 18 + p.peso * 16;
        elemento.style.cssText = `
          width:${tamano}px;height:${tamano}px;border-radius:999px;
          background:rgba(240,165,0,${0.35 + p.peso * 0.4});
          border:2px solid #f0a500;
          box-shadow:0 0 ${8 + p.peso * 16}px rgba(240,165,0,.55);
          cursor:pointer;
        `;

        new Marker({ element: elemento })
          .setLngLat([p.lon, p.lat])
          .setPopup(
            new Popup({ offset: 18, closeButton: false }).setHTML(
              `<div style="font-family:system-ui;color:#0b1220;padding:2px 4px">
                 <strong>${p.nombre}</strong><br>
                 <span style="font-size:12px">${p.detalle}</span>
               </div>`,
            ),
          )
          .addTo(m);
      }

      // Encuadre automático: sirve igual si mañana se agregan sedes en otra
      // región del país.
      if (puntos.length > 1) {
        const limites = puntos.reduce(
          (b, p) => b.extend([p.lon, p.lat] as [number, number]),
          new LngLatBounds(
            [puntos[0].lon, puntos[0].lat],
            [puntos[0].lon, puntos[0].lat],
          ),
        );
        m.fitBounds(limites, { padding: 90, maxZoom: 11, duration: 0 });
      }
    })();

    return () => {
      cancelado = true;
      mapa?.remove();
    };
  }, [puntos]);

  return (
    <div
      ref={contenedor}
      className="h-80 w-full overflow-hidden rounded-lg border border-[var(--borde)] bg-[var(--fondo)]"
    />
  );
}
