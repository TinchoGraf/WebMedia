import { notFound } from "next/navigation";
import { db } from "@/db";
import { puede } from "@/lib/permisos";
import { usuarioActual } from "@/server/auth";
import { listarActividad } from "@/server/lecturas";

export const metadata = { title: "Actividad" };

const fecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" });
const ACCIONES: Record<string, string> = {
  crear: "creó", editar: "editó", borrar: "borró", "subir-foto": "subió una foto a", "borrar-foto": "borró una foto de",
  "estado:publicada": "publicó", "estado:reservada": "marcó como reservada", "estado:cerrada": "marcó como vendida", "estado:borrador": "pasó a borrador",
  activar: "activó", desactivar: "desactivó",
};

export default async function Actividad() {
  if (!puede(await usuarioActual(), "actividad:ver")) notFound();
  const lista = await listarActividad(db, 150);
  return (
    <div className="max-w-5xl">
      <h1 className="titulo text-grande">Actividad</h1>
      <p className="mt-2 text-cemento">Últimos cambios hechos desde el panel.</p>
      <table className="mt-8 w-full overflow-hidden rounded-xl bg-hoja text-left text-sm">
        <thead className="bg-arena"><tr><th className="px-4 py-2.5 font-semibold">Cuándo</th><th className="px-4 py-2.5 font-semibold">Quién</th><th className="px-4 py-2.5 font-semibold">Qué hizo</th></tr></thead>
        <tbody className="divide-y divide-borde">
          {lista.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-2.5 whitespace-nowrap text-cemento tabular">{fecha.format(a.creadoEn)}</td>
              <td className="px-4 py-2.5">{a.usuarioNombre ?? "Sistema"}</td>
              <td className="px-4 py-2.5">
                {ACCIONES[a.accion] ?? a.accion} {a.entidad === "usuario" ? "un usuario" : a.entidad === "consulta" ? "una consulta" : "la publicación"}
                {typeof a.detalle?.titulo === "string" && <span className="text-cemento"> {a.detalle.titulo}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
