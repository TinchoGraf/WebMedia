import { notFound } from "next/navigation";
import { db } from "@/db";
import { puede } from "@/lib/permisos";
import { usuarioActual } from "@/server/auth";
import { listarUsuarios } from "@/server/lecturas";
import { ControlesUsuario, FormNuevoUsuario } from "@/components/panel/Usuarios";

export const metadata = { title: "Usuarios" };

export default async function Usuarios() {
  const u = await usuarioActual();
  if (!puede(u, "usuarios:gestionar")) notFound();
  const lista = await listarUsuarios(db);
  return (
    <div className="max-w-5xl">
      <h1 className="titulo text-grande">Usuarios</h1>
      <p className="mt-2 text-cemento">Quién puede entrar al panel. Desactivar un usuario cierra sus sesiones al instante.</p>
      <ul className="mt-8 divide-y divide-borde rounded-xl bg-hoja">
        {lista.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className={x.activo ? "" : "opacity-55"}>
              <p className="font-medium">{x.nombre}{!x.activo && " (desactivado)"}</p>
              <p className="text-sm text-cemento">{x.email}</p>
            </div>
            <ControlesUsuario id={x.id} activo={x.activo} rol={x.rol} esYo={x.id === u!.id} />
          </li>
        ))}
      </ul>
      <div className="mt-10"><FormNuevoUsuario /></div>
    </div>
  );
}
