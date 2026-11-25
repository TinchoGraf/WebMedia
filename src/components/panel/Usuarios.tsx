"use client";
import { useActionState, useState, useTransition } from "react";
import { activarUsuario, nuevoUsuario, rolUsuario } from "@/app/acciones/panel";
import type { Resultado } from "@/lib/errores";

export function FormNuevoUsuario() {
  const [estado, accion, pend] = useActionState<Resultado | null, FormData>(nuevoUsuario, null);
  const [clave, setClave] = useState("");
  const err = (k: string) => (estado && !estado.ok ? estado.campos?.[k] : undefined);
  const generar = () => {
    const a = new Uint8Array(15); crypto.getRandomValues(a);
    setClave(btoa(String.fromCharCode(...a)).replace(/[+/=]/g, "").slice(0, 16));
  };
  return (
    <form action={accion} className="grid gap-4 rounded-xl bg-hoja p-5 md:grid-cols-2">
      <h2 className="text-base font-semibold md:col-span-2">Agregar usuario</h2>
      <div><label className="etiqueta" htmlFor="u-nombre">Nombre</label><input id="u-nombre" name="nombre" required maxLength={80} className="campo" aria-invalid={!!err("nombre")} />{err("nombre") && <p className="error-campo">{err("nombre")}</p>}</div>
      <div><label className="etiqueta" htmlFor="u-email">Email</label><input id="u-email" name="email" type="email" required maxLength={120} className="campo" aria-invalid={!!err("email")} />{err("email") && <p className="error-campo">{err("email")}</p>}</div>
      <div>
        <label className="etiqueta" htmlFor="u-password">Contraseña inicial</label>
        <div className="flex gap-2"><input id="u-password" name="password" required minLength={12} maxLength={128} value={clave} onChange={(e) => setClave(e.target.value)} className="campo font-mono" aria-invalid={!!err("password")} /><button type="button" className="boton boton-suave" onClick={generar}>Generar</button></div>
        {err("password") ? <p className="error-campo">{err("password")}</p> : <p className="ayuda">Mínimo 12 caracteres. Pasala por un canal seguro, no por mail.</p>}
      </div>
      <div>
        <label className="etiqueta" htmlFor="u-rol">Rol</label>
        <select id="u-rol" name="rol" className="campo" defaultValue="editor">
          <option value="editor">Vendedor: publicaciones y consultas</option>
          <option value="dueno">Dueño: todo, incluidos usuarios</option>
          <option value="demo">Demo: para mostrar, con límites</option>
        </select>
      </div>
      {estado && <p role={estado.ok ? "status" : "alert"} className={`rounded-lg px-3 py-2 text-sm font-medium md:col-span-2 ${estado.ok ? "bg-[#E2ECE5] text-verde" : "bg-[#F6E3E0] text-alerta"}`}>{estado.ok ? estado.mensaje : estado.error}</p>}
      <div className="md:col-span-2"><button className="boton boton-oscuro" disabled={pend}>{pend ? "Creando…" : "Crear usuario"}</button></div>
    </form>
  );
}

export function ControlesUsuario({ id, activo, rol, esYo }: { id: string; activo: boolean; rol: string; esYo: boolean }) {
  const [pend, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  if (esYo) return <span className="text-sm text-cemento">Sos vos</span>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`rol-${id}`}>Rol</label>
      <select id={`rol-${id}`} defaultValue={rol} disabled={pend} className="campo min-h-9 w-auto py-1 text-sm"
        onChange={(e) => start(async () => { const r = await rolUsuario(id, e.target.value); if (!r.ok) setError(r.error); })}>
        <option value="dueno">Dueño</option><option value="editor">Vendedor</option><option value="demo">Demo</option>
      </select>
      <button type="button" disabled={pend} className={`boton min-h-9 px-3 text-sm ${activo ? "boton-peligro" : "boton-suave"}`}
        onClick={() => start(async () => { const r = await activarUsuario(id, !activo); if (!r.ok) setError(r.error); })}>
        {activo ? "Desactivar" : "Activar"}
      </button>
      {error && <span role="alert" className="text-sm text-alerta">{error}</span>}
    </div>
  );
}
