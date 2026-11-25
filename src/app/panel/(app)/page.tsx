import Link from "next/link";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { rubro } from "@/rubros";
import { resumenPanel } from "@/server/lecturas";
import { usuarioActual } from "@/server/auth";
import { Estado } from "@/components/panel/Estado";

export default async function Resumen() {
  const u = (await usuarioActual())!;
  const r = rubro(perfilActivo().rubro);
  const s = await resumenPanel(db, r);
  const cifras = [
    { n: s.porEstado.publicada ?? 0, t: "Publicadas", href: "/panel/publicaciones?estado=publicada" },
    { n: s.porEstado.reservada ?? 0, t: "Reservadas", href: "/panel/publicaciones?estado=reservada" },
    { n: s.porEstado.borrador ?? 0, t: "Borradores", href: "/panel/publicaciones?estado=borrador" },
    { n: s.nuevas, t: "Consultas sin responder", href: "/panel/consultas?estado=nueva" },
  ];
  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="titulo text-grande">Hola, {u.name.split(" ")[0]}.</h1>
        <Link href="/panel/publicaciones/nueva" className="boton boton-principal">Nueva publicación</Link>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-borde lg:grid-cols-4">
        {cifras.map((c) => (
          <li key={c.t} className="bg-hoja">
            <Link href={c.href} className="block px-5 py-5 hover:bg-piedra">
              <span className="titulo block text-[2.8rem] leading-none tabular">{c.n}</span>
              <span className="mt-2 block text-sm text-cemento">{c.t}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Consultas nuevas</h2>
          <Link href="/panel/consultas" className="enlace text-sm">Ver todas</Link>
        </div>
        {s.ultimas.length === 0 ? (
          <p className="mt-4 rounded-xl bg-hoja px-5 py-6 text-cemento">No hay consultas sin responder.</p>
        ) : (
          <ul className="mt-4 divide-y divide-borde rounded-xl bg-hoja">
            {s.ultimas.map((c) => (
              <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{c.nombre} <span className="font-normal text-cemento">sobre {c.publicacion?.titulo ?? (c.tipo === "tasacion" ? "Pedido de tasación" : "Consulta general")}</span></p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-cemento">{c.mensaje}</p>
                </div>
                <Estado valor={c.estado} de="consulta" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
