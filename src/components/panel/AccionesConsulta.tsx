"use client";
import { useState, useTransition } from "react";
import { borrarConsulta, estadoConsulta } from "@/app/acciones/panel";
import { Confirmar } from "./Confirmar";

export function AccionesConsulta({ id, estado, puedeBorrar }: { id: string; estado: string; puedeBorrar: boolean }) {
  const [pend, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const cambiar = (e: string) => start(async () => { const r = await estadoConsulta(id, e); if (!r.ok) setError(r.error); });
  return (
    <div className="flex flex-wrap items-center gap-2">
      {estado !== "respondida" && <button type="button" disabled={pend} className="boton boton-suave min-h-9 px-3 text-sm" onClick={() => cambiar("respondida")}>Marcar respondida</button>}
      {estado !== "cerrada" && <button type="button" disabled={pend} className="boton boton-suave min-h-9 px-3 text-sm" onClick={() => cambiar("cerrada")}>Cerrar</button>}
      {estado !== "nueva" && <button type="button" disabled={pend} className="boton boton-suave min-h-9 px-3 text-sm" onClick={() => cambiar("nueva")}>Marcar como nueva</button>}
      {puedeBorrar && <Confirmar texto="Borrar" className="boton boton-peligro min-h-9 px-3 text-sm" pregunta="¿Borrar esta consulta?" detalle="Se borran los datos de contacto. No se puede deshacer." confirmar="Sí, borrar" accion={() => borrarConsulta(id)} />}
      {error && <p role="alert" className="text-sm text-alerta">{error}</p>}
    </div>
  );
}
