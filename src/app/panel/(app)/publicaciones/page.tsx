import Link from "next/link";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { rubro } from "@/rubros";
import { listarPanel } from "@/server/lecturas";
import { formatoPrecio } from "@/lib/precios";
import { codigoPublicacion } from "@/lib/slug";
import { Estado } from "@/components/panel/Estado";

export const metadata = { title: "Publicaciones" };

const PESTANAS = [
  { valor: "", texto: "Todas" }, { valor: "publicada", texto: "Publicadas" }, { valor: "reservada", texto: "Reservadas" },
  { valor: "borrador", texto: "Borradores" }, { valor: "cerrada", texto: "Cerradas" },
];

export default async function Publicaciones({ searchParams }: { searchParams: Promise<{ estado?: string; q?: string; borrada?: string }> }) {
  const sp = await searchParams;
  const perfil = perfilActivo();
  const r = rubro(perfil.rubro);
  const lista = await listarPanel(db, r, sp.estado, sp.q);
  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="titulo text-grande">{r.nombre.plural}</h1>
        <Link href="/panel/publicaciones/nueva" className="boton boton-principal">Nueva publicación</Link>
      </div>
      {sp.borrada && <p role="status" className="mt-4 rounded-lg bg-[#E2ECE5] px-4 py-2 text-sm text-verde">La publicación se borró.</p>}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-1">
          {PESTANAS.map((p) => {
            const activo = (sp.estado ?? "") === p.valor;
            return (
              <Link key={p.valor} href={p.valor ? `?estado=${p.valor}` : "?"} aria-current={activo ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${activo ? "bg-carbon text-hoja" : "hover:bg-arena"}`}>{p.texto}</Link>
            );
          })}
        </nav>
        <form className="flex gap-2" role="search">
          {sp.estado && <input type="hidden" name="estado" value={sp.estado} />}
          <label htmlFor="q" className="sr-only">Buscar por título</label>
          <input id="q" name="q" defaultValue={sp.q} placeholder="Buscar por título" maxLength={60} className="campo w-56" />
          <button className="boton boton-suave">Buscar</button>
        </form>
      </div>

      {lista.length === 0 ? (
        <div className="mt-8 rounded-xl bg-hoja px-6 py-12 text-center">
          <p className="font-semibold">No hay publicaciones acá.</p>
          <p className="mt-1 text-sm text-cemento">Cargá la primera: lleva un par de minutos.</p>
          <Link href="/panel/publicaciones/nueva" className="boton boton-principal mt-5">Nueva publicación</Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-borde overflow-hidden rounded-xl bg-hoja">
          {lista.map((p) => (
            <li key={p.id}>
              <Link href={`/panel/publicaciones/${p.id}`} className="grid grid-cols-[4.5rem_1fr] items-center gap-4 px-4 py-3 hover:bg-piedra sm:grid-cols-[5.5rem_1fr_auto_auto]">
                {p.portada ? <img src={p.portada.miniatura} alt="" width={88} height={66} className="aspect-[4/3] w-full rounded object-cover" /> : <span className="grid aspect-[4/3] place-items-center rounded bg-arena text-xs text-cemento">Sin fotos</span>}
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.titulo}</span>
                  <span className="block text-xs text-cemento tabular">{codigoPublicacion(perfil.prefijoCodigo, p.numero)}, {p.fotos} {p.fotos === 1 ? "foto" : "fotos"}</span>
                  <span className="mt-1 inline-block sm:hidden"><Estado valor={p.estado} /></span>
                </span>
                <span className="hidden font-medium tabular sm:block">{formatoPrecio(p.precio, p.moneda)}</span>
                <span className="hidden w-32 text-right sm:block"><Estado valor={p.estado} /></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
