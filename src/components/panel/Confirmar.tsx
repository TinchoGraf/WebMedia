"use client";
import { useRef, useState, useTransition } from "react";

/** Botón con confirmación en un diálogo propio (sin window.confirm). */
export function Confirmar({ texto, pregunta, detalle, confirmar, accion, peligro = true, className }: {
  texto: string; pregunta: string; detalle?: string; confirmar: string; accion: () => Promise<{ ok: boolean; error?: string } | void>; peligro?: boolean; className?: string;
}) {
  const d = useRef<HTMLDialogElement>(null);
  const [pend, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button type="button" className={className ?? `boton ${peligro ? "boton-peligro" : "boton-suave"}`} onClick={() => { setError(null); d.current?.showModal(); }}>{texto}</button>
      <dialog ref={d} className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl bg-hoja p-6 text-carbon backdrop:bg-carbon/50">
        <h2 className="text-lg font-semibold">{pregunta}</h2>
        {detalle && <p className="mt-2 text-sm text-cemento">{detalle}</p>}
        {error && <p role="alert" className="mt-3 rounded-lg bg-[#F6E3E0] px-3 py-2 text-sm text-alerta">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="boton boton-suave" onClick={() => d.current?.close()}>Cancelar</button>
          <button type="button" disabled={pend} className={`boton ${peligro ? "bg-alerta text-hoja hover:bg-[#861f19]" : "boton-oscuro"}`}
            onClick={() => start(async () => {
              const r = await accion();
              if (r && !r.ok) setError(r.error ?? "No se pudo completar.");
              else d.current?.close();
            })}>
            {pend ? "Un momento…" : confirmar}
          </button>
        </div>
      </dialog>
    </>
  );
}
