type Nombre = "whatsapp" | "telefono" | "ubicacion" | "reloj" | "buscar" | "filtro" | "cerrar" | "flecha-izq" | "flecha-der" | "ampliar" | "foto" | "instagram" | "check";

/** Íconos propios de trazo 1.8px (sin librerías). "whatsapp" es un globo de chat genérico, no el logo de la marca. */
export function Icono({ nombre, className = "size-5" }: { nombre: Nombre; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
      {nombre === "whatsapp" && <path d="M4 20l1.3-3.8A8 8 0 1 1 8.2 19L4 20zM9 9.5c.5 2.6 2.4 4.5 5 5l1-1.4-1.9-1-1 .8a4 4 0 0 1-1.5-1.5l.8-1-1-1.9z" />}
      {nombre === "telefono" && <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />}
      {nombre === "ubicacion" && <><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>}
      {nombre === "reloj" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
      {nombre === "buscar" && <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>}
      {nombre === "filtro" && <path d="M4 6h16M7 12h10M10 18h4" />}
      {nombre === "cerrar" && <path d="M6 6l12 12M18 6L6 18" />}
      {nombre === "flecha-izq" && <path d="M15 5l-7 7 7 7" />}
      {nombre === "flecha-der" && <path d="M9 5l7 7-7 7" />}
      {nombre === "ampliar" && <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
      {nombre === "foto" && <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M21 16l-5-5-8 8" /></>}
      {nombre === "instagram" && <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17 7h.01" /></>}
      {nombre === "check" && <path d="M5 12l5 5 9-10" />}
    </svg>
  );
}
