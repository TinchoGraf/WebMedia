import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { rubro, etiquetaDe, formatearAtributo } from "@/rubros";
import { filtrosAParams, parsearFiltros, type Filtros as TFiltros } from "@/lib/busqueda";
import { listarPublicas, valoresAtributo } from "@/server/lecturas";
import { Tarjeta } from "@/components/publico/Tarjeta";
import { Filtros } from "@/components/publico/Filtros";
import { Icono } from "@/components/publico/Icono";

type Props = { params: Promise<{ rubro: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

function rubroDeRuta(ruta: string) {
  const r = rubro(perfilActivo().rubro);
  return r.ruta === ruta ? r : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = rubroDeRuta((await params).rubro);
  if (!r) return {};
  const p = perfilActivo();
  return { title: `${r.nombre.plural} en ${p.direccion.ciudad}`, description: p.seo.descripcion, alternates: { canonical: `/${r.ruta}` } };
}

/** Etiquetas de los filtros activos, con el link para quitar cada uno */
function chips(r: ReturnType<typeof rubro>, f: TFiltros) {
  const lista: { texto: string; quitar: string }[] = [];
  const quitar = (cambios: Record<string, undefined>) => `/${r.ruta}${filtrosAParams(f, cambios)}`;
  if (f.q) lista.push({ texto: `"${f.q}"`, quitar: quitar({ q: undefined }) });
  if (f.operacion) lista.push({ texto: etiquetaDe(r.operaciones, f.operacion), quitar: quitar({ operacion: undefined }) });
  if (f.tipo) lista.push({ texto: etiquetaDe(r.tipos, f.tipo), quitar: quitar({ tipo: undefined }) });
  if (f.zona) lista.push({ texto: f.zona, quitar: quitar({ zona: undefined }) });
  if (f.precioMin !== undefined) lista.push({ texto: `Desde ${f.precioMin.toLocaleString("es-AR")}`, quitar: quitar({ precio_min: undefined }) });
  if (f.precioMax !== undefined) lista.push({ texto: `Hasta ${f.precioMax.toLocaleString("es-AR")}`, quitar: quitar({ precio_max: undefined }) });
  for (const a of f.atributos) {
    const c = r.campos.find((x) => x.clave === a.clave)!;
    if (a.modo === "igual") lista.push({ texto: formatearAtributo(c, a.valor), quitar: quitar({ [a.clave]: undefined }) });
    if (a.modo === "si") lista.push({ texto: c.etiqueta, quitar: quitar({ [a.clave]: undefined }) });
    if (a.modo === "minimo") lista.push({ texto: `${c.etiqueta}: ${a.min} o más`, quitar: quitar({ [a.clave]: undefined }) });
    if (a.modo === "rango") {
      if (a.min !== undefined) lista.push({ texto: `${c.etiqueta} desde ${formatearAtributo(c, a.min)}`, quitar: quitar({ [`${a.clave}_min`]: undefined }) });
      if (a.max !== undefined) lista.push({ texto: `${c.etiqueta} hasta ${formatearAtributo(c, a.max)}`, quitar: quitar({ [`${a.clave}_max`]: undefined }) });
    }
  }
  return lista;
}

export default async function Listado({ params, searchParams }: Props) {
  const r = rubroDeRuta((await params).rubro);
  if (!r) notFound();
  const f = parsearFiltros(await searchParams, r);

  const camposTexto = r.campos.filter((c) => c.tipo === "texto" && "filtro" in c && c.filtro === "igual").map((c) => c.clave);
  const [res, ...vals] = await Promise.all([listarPublicas(db, r, f), ...camposTexto.map((k) => valoresAtributo(db, r, k))]);
  const valores = Object.fromEntries(camposTexto.map((k, i) => [k, vals[i]]));
  const activos = chips(r, f);
  const link = (cambios: Record<string, string | undefined>) => `/${r.ruta}${filtrosAParams(f, cambios)}`;

  return (
    <div className="contenedor py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-borde pb-6">
        <div>
          <h1 className="titulo text-grande">{f.tipo ? `${etiquetaDe(r.tipos, f.tipo)}` : r.nombre.plural} en {perfilActivo().direccion.ciudad}</h1>
          <p className="mt-2 text-cemento tabular" aria-live="polite">
            {res.total === 0 ? "No hay resultados con estos filtros." : `${res.total} ${res.total === 1 ? "resultado" : "resultados"}`}
          </p>
        </div>
        <form action={`/${r.ruta}`} method="get" className="flex items-center gap-2">
          {[...new URLSearchParams(filtrosAParams(f).slice(1)).entries()].filter(([k]) => k !== "orden").map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <label htmlFor="orden" className="text-sm text-cemento">Ordenar</label>
          <select id="orden" name="orden" defaultValue={f.orden} className="campo w-auto min-w-48">
            {r.ordenes.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </select>
          <button className="boton boton-suave min-h-11 px-3">Aplicar</button>
        </form>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside>
          <details className="group rounded-xl bg-hoja p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2"><Icono nombre="filtro" />Filtros{activos.length ? ` (${activos.length})` : ""}</span>
              <span className="text-sm text-cemento group-open:hidden">Mostrar</span><span className="hidden text-sm text-cemento group-open:inline">Ocultar</span>
            </summary>
            <div className="mt-5"><Filtros id="filtros-movil" r={r} f={f} valores={valores} /></div>
          </details>
          <div className="hidden lg:block lg:sticky lg:top-6"><Filtros id="filtros" r={r} f={f} valores={valores} /></div>
        </aside>

        <div>
          {activos.length > 0 && (
            <ul className="mb-6 flex flex-wrap gap-2" aria-label="Filtros aplicados">
              {activos.map((c) => (
                <li key={c.texto}>
                  <Link href={c.quitar} className="inline-flex items-center gap-1.5 rounded-full bg-arena py-1 pr-2 pl-3 text-sm font-medium hover:bg-borde" aria-label={`Quitar filtro ${c.texto}`}>
                    {c.texto}<Icono nombre="cerrar" className="size-3.5" />
                  </Link>
                </li>
              ))}
              <li><Link href={`/${r.ruta}`} className="enlace px-2 text-sm">Limpiar todo</Link></li>
            </ul>
          )}

          {res.items.length === 0 ? (
            <div className="rounded-xl bg-hoja px-6 py-14 text-center">
              <p className="titulo text-3xl">Nada por acá con esos filtros.</p>
              <p className="mx-auto mt-3 max-w-[44ch] text-cemento">Probá sacando alguno, o escribinos y te avisamos cuando entre {r.genero === "m" ? "uno" : "una"} como {r.genero === "m" ? "el" : "la"} que buscás.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href={`/${r.ruta}`} className="boton boton-borde">Ver todo</Link>
                <Link href="/contacto" className="boton boton-principal">Avisame</Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {res.items.map((it, i) => <Tarjeta key={it.id} p={it} r={r} prioridad={i < 2} nivel={2} />)}
            </div>
          )}

          {res.paginas > 1 && (
            <nav aria-label="Paginación" className="mt-14 flex items-center justify-center gap-2">
              {f.pagina > 1 && <Link className="boton boton-suave" href={link({ pagina: String(f.pagina - 1) })}>Anterior</Link>}
              {Array.from({ length: res.paginas }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={link({ pagina: String(n) })} aria-current={n === f.pagina ? "page" : undefined}
                  className={`grid size-11 place-items-center rounded-lg font-medium tabular ${n === f.pagina ? "bg-carbon text-hoja" : "hover:bg-arena"}`}>{n}</Link>
              ))}
              {f.pagina < res.paginas && <Link className="boton boton-suave" href={link({ pagina: String(f.pagina + 1) })}>Siguiente</Link>}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
