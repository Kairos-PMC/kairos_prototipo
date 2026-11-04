"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Revela un bloque cuando entra en pantalla.
 *
 * Es el único movimiento del sitio y existe por una razón concreta: el landing
 * es largo y la aparición marca dónde empieza cada idea. No se usa para
 * decorar. Si el sistema pide menos movimiento, el contenido aparece quieto y
 * visible — nunca oculto.
 */
export function Revelar({
  children,
  retraso = 0,
  className = "",
}: {
  children: ReactNode;
  /** Milisegundos de retraso, para escalonar hermanos. */
  retraso?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quieto || !ref.current) {
      setVisible(true);
      return;
    }

    const nodo = ref.current;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.unobserve(nodo);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`revelar ${visible ? "revelar-visible" : ""} ${className}`}
      style={retraso ? { transitionDelay: `${retraso}ms` } : undefined}
    >
      {children}
    </div>
  );
}
