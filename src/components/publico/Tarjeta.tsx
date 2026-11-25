import Link from "next/link";
import type { ItemListado } from "@/server/lecturas";
import type { DefinicionRubro } from "@/rubros";
import { datosClave, subtitulo } from "@/lib/fichas";
import { formatoPrecio } from "@/lib/precios";
import { Icono } from "./Icono";

export function Tarjeta({ p, r, prioridad = false, nivel = 3 }: { p: ItemListado; r: DefinicionRubro; prioridad?: boolean; nivel?: 2 | 3 }) {
  const Titulo = nivel === 2 ? "h2" : "h3";
  const datos = datosClave(r, p.atributos).slice(0, 3);
  const sub = subtitulo(r, p);
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-foto bg-arena">
        {p.portada ? (
          <img
            src={p.portada.miniatura}
            srcSet={`${p.portada.miniatura} 640w, ${p.portada.url} 1600w`}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            width={p.portada.ancho}
            height={p.portada.alto}
            alt={p.portada.alt || p.titulo}
            loading={prioridad ? "eager" : "lazy"}
            fetchPriority={prioridad ? "high" : undefined}
            style={{ backgroundImage: `url(${p.portada.blur})`, backgroundSize: "cover" }}
            className="size-full object-cover transition-transform duration-500 ease-[var(--ease-salida)] group-hover:scale-[1.025]"
          />
        ) : (
          <div className="grid size-full place-items-center text-cemento"><Icono nombre="foto" className="size-10" /></div>
        )}
        {p.estado === "reservada" && (
          <span className="absolute top-3 left-3 rounded bg-carbon px-2.5 py-1 text-xs font-semibold text-hoja">Reservado</span>
        )}
        {p.fotos > 1 && (
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded bg-carbon/75 px-2 py-0.5 text-xs font-medium text-hoja tabular">
            <Icono nombre="foto" className="size-3.5" />{p.fotos}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <Titulo className="text-[1.05rem] leading-snug font-semibold">
          <Link href={`/${r.ruta}/${p.slug}`} className="after:absolute after:inset-0 hover:text-ocre">{p.titulo}</Link>
        </Titulo>
        {sub && <p className="mt-0.5 text-sm text-cemento">{sub}</p>}
        <p className="titulo mt-3 text-[2rem] tabular">{formatoPrecio(p.precio, p.moneda)}</p>
        {datos.length > 0 && (
          <dl className="mt-3 grid grid-cols-3 border-t border-borde pt-3 text-sm">
            {datos.map((d) => (
              <div key={d.etiqueta} className="min-w-0 pr-2">
                <dt className="text-xs text-cemento">{d.etiqueta}</dt>
                <dd className="truncate font-medium tabular">{d.valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
