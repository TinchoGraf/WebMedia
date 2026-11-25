import Link from "next/link";
import { perfilActivo } from "@config";
import { rubro } from "@/rubros";
import { db } from "@/db";
import { puede } from "@/lib/permisos";
import { linkTelefono, linkWhatsApp } from "@/lib/whatsapp";
import { usuarioActual } from "@/server/auth";
import { listarConsultas } from "@/server/lecturas";
import { AccionesConsulta } from "@/components/panel/AccionesConsulta";
import { Estado } from "@/components/panel/Estado";

export const metadata = { title: "Consultas" };

const fecha = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });
const PESTANAS = [{ v: "", t: "Todas" }, { v: "nueva", t: "Nuevas" }, { v: "respondida", t: "Respondidas" }, { v: "cerrada", t: "Cerradas" }];
const TIPOS = { consulta: "Consulta", tasacion: "Pedido de tasación", contacto: "Contacto" } as const;

export default async function Consultas({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const u = (await usuarioActual())!;
  const p = perfilActivo();
  const lista = await listarConsultas(db, rubro(p.rubro), estado);
  return (
    <div className="max-w-5xl">
      <h1 className="titulo text-grande">Consultas</h1>
      <nav aria-label="Filtrar consultas" className="mt-6 flex flex-wrap gap-1">
        {PESTANAS.map((x) => {
          const activo = (estado ?? "") === x.v;
          return <Link key={x.v} href={x.v ? `?estado=${x.v}` : "?"} aria-current={activo ? "page" : undefined} className={`rounded-md px-3 py-1.5 text-sm font-medium ${activo ? "bg-carbon text-hoja" : "hover:bg-arena"}`}>{x.t}</Link>;
        })}
      </nav>
      {lista.length === 0 ? (
        <p className="mt-8 rounded-xl bg-hoja px-5 py-8 text-center text-cemento">No hay consultas acá.</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {lista.map((c) => (
            <li key={c.id} className="rounded-xl bg-hoja p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.nombre}</p>
                  <p className="text-sm text-cemento">
                    {TIPOS[c.tipo]}
                    {c.publicacion?.id ? <> sobre <Link className="enlace" href={`/panel/publicaciones/${c.publicacion.id}`}>{c.publicacion.titulo}</Link></> : null}
                    , {fecha.format(c.creadoEn)}
                  </p>
                </div>
                <Estado valor={c.estado} de="consulta" />
              </div>
              <p className="mt-3 max-w-[70ch] whitespace-pre-line">{c.mensaje}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borde pt-4">
                <div className="flex flex-wrap gap-2 text-sm">
                  <a className="boton boton-principal min-h-9 px-3" target="_blank" rel="noopener noreferrer"
                    href={linkWhatsApp(c.telefono.replace(/^(\+?54)?\s*9?\s*/, "549"), `Hola ${c.nombre.split(" ")[0]}, te escribo de ${p.nombre} por tu consulta${c.publicacion ? ` sobre ${c.publicacion.titulo}` : ""}.`)}>
                    Responder por WhatsApp
                  </a>
                  <a className="boton boton-borde min-h-9 px-3" href={linkTelefono(c.telefono)}>{c.telefono}</a>
                  {c.email && <a className="boton boton-borde min-h-9 px-3" href={`mailto:${c.email}`}>{c.email}</a>}
                </div>
                <AccionesConsulta id={c.id} estado={c.estado} puedeBorrar={puede(u, "consultas:borrar")} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
