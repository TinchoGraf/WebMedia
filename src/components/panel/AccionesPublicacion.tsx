"use client";
import { useState, useTransition } from "react";
import { duplicar, eliminar, estado as cambiarEstado } from "@/app/acciones/panel";
import { Confirmar } from "./Confirmar";

const PASOS = [
  { valor: "publicada", texto: "Publicar", ayuda: "Se ve en el sitio." },
  { valor: "reservada", texto: "Marcar reservada", ayuda: "Se sigue viendo, con la marca Reservado." },
  { valor: "cerrada", texto: "Marcar vendida", ayuda: "Sale del sitio, queda en el panel." },
  { valor: "borrador", texto: "Pasar a borrador", ayuda: "Sale del sitio." },
];

export function AccionesPublicacion({ id, estado, puedeBorrar, urlPublica }: { id: string; estado: string; puedeBorrar: boolean; urlPublica: string }) {
  const [pend, start] = useTransition();
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  return (
    <section aria-labelledby="t-estado" className="rounded-xl bg-hoja p-5">
      <h2 id="t-estado" className="text-base font-semibold">Estado</h2>
      <div className="mt-3 grid gap-2">
        {PASOS.filter((p) => p.valor !== estado).map((p) => (
          <button key={p.valor} type="button" disabled={pend} title={p.ayuda}
            className={`boton justify-start ${p.valor === "publicada" ? "boton-principal" : "boton-suave"}`}
            onClick={() => start(async () => {
              const r = await cambiarEstado(id, p.valor);
              setAviso(r.ok ? { ok: true, texto: r.mensaje ?? "Listo." } : { ok: false, texto: r.error });
            })}>
            {p.texto}
          </button>
        ))}
      </div>
      {aviso && <p role={aviso.ok ? "status" : "alert"} className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${aviso.ok ? "bg-[#E2ECE5] text-verde" : "bg-[#F6E3E0] text-alerta"}`}>{aviso.texto}</p>}

      <div className="mt-5 grid gap-2 border-t border-borde pt-5">
        {(estado === "publicada" || estado === "reservada") && <a href={urlPublica} target="_blank" className="boton boton-borde">Ver en el sitio</a>}
        <button type="button" disabled={pend} className="boton boton-suave" onClick={() => start(async () => { const r = await duplicar(id); if (r && !r.ok) setAviso({ ok: false, texto: r.error }); })}>
          Duplicar
        </button>
        {puedeBorrar && (
          <Confirmar texto="Borrar publicación" pregunta="¿Borrar esta publicación?" detalle="Se borran también sus fotos. No se puede deshacer. Si se vendió, mejor marcala como vendida."
            confirmar="Sí, borrar" accion={() => eliminar(id)} />
        )}
      </div>
    </section>
  );
}
