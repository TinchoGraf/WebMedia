"use client";
import { useState } from "react";
import { Icono } from "./Icono";

/** Mapa de Google que solo se carga si la persona lo pide (privacidad y velocidad). Muestra la ZONA, no la dirección. */
export function MapaZona({ consulta }: { consulta: string }) {
  const [abierto, setAbierto] = useState(false);
  const src = `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&z=14&output=embed`;
  return (
    <div className="relative mt-4 grid aspect-[16/9] place-items-center overflow-hidden rounded-xl bg-arena">
      {abierto ? (
        <iframe src={src} title={`Mapa de ${consulta}`} className="absolute inset-0 size-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <button type="button" onClick={() => setAbierto(true)} className="boton boton-oscuro"><Icono nombre="ubicacion" />Ver la zona en el mapa</button>
      )}
    </div>
  );
}
