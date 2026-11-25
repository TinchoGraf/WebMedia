import Link from "next/link";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { rubro } from "@/rubros";
import { conteoPorTipo, destacadas, valoresAtributo } from "@/server/lecturas";
import { Tarjeta } from "@/components/publico/Tarjeta";
import { formatoPrecio } from "@/lib/precios";
import { subtitulo } from "@/lib/fichas";

export default async function Inicio() {
  const p = perfilActivo();
  const r = rubro(p.rubro);
  const [items, conteo, marcas] = await Promise.all([
    destacadas(db, r, 7),
    conteoPorTipo(db, r),
    r.id === "vehiculo" ? valoresAtributo(db, r, "marca") : Promise.resolve([] as string[]),
  ]);
  const [principal, ...resto] = items;
  const total = Object.values(conteo).reduce((a, b) => a + b, 0);

  return (
    <>
      <section className="textura border-b border-borde">
        <div className="contenedor grid gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
          <div>
            <h1 className="titulo max-w-[14ch] text-enorme">{p.hero.titulo}</h1>
            <p className="mt-6 max-w-[48ch] text-medio text-cemento">{p.hero.texto}</p>

            <form action={`/${r.ruta}`} method="get" className="mt-9 grid gap-3 rounded-xl bg-hoja p-4 shadow-[0_1px_0_var(--color-borde),0_12px_32px_-20px_rgb(31_29_26/0.35)] sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end" role="search" aria-label={`Buscar ${r.nombre.plural.toLowerCase()}`}>
              <div>
                <label className="etiqueta" htmlFor="b-tipo">Tipo</label>
                <select id="b-tipo" name="tipo" className="campo" defaultValue="">
                  <option value="">Todos</option>
                  {r.tipos.map((t) => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
                </select>
              </div>
              {r.id === "vehiculo" ? (
                <div>
                  <label className="etiqueta" htmlFor="b-marca">Marca</label>
                  <select id="b-marca" name="marca" className="campo" defaultValue="">
                    <option value="">Todas</option>
                    {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="etiqueta" htmlFor="b-operacion">Operación</label>
                  <select id="b-operacion" name="operacion" className="campo" defaultValue="">
                    <option value="">Venta o alquiler</option>
                    {r.operaciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
                  </select>
                </div>
              )}
              {r.id === "vehiculo" ? (
                <div>
                  <label className="etiqueta" htmlFor="b-precio">Hasta $</label>
                  <input id="b-precio" name="precio_max" inputMode="numeric" pattern="[0-9.]*" placeholder="20.000.000" className="campo tabular" />
                </div>
              ) : (
                <div>
                  <label className="etiqueta" htmlFor="b-zona">Zona</label>
                  <select id="b-zona" name="zona" className="campo" defaultValue="">
                    <option value="">Todas</option>
                    {r.zonas?.map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              )}
              <button className="boton boton-principal">Buscar</button>
            </form>
          </div>

          {principal?.portada && (
            <Link href={`/${r.ruta}/${principal.slug}`} className="group relative block overflow-hidden rounded-xl bg-arena">
              <img
                src={principal.portada.url}
                srcSet={`${principal.portada.miniatura} 640w, ${principal.portada.url} 1600w`}
                sizes="(min-width: 1024px) 45vw, 100vw"
                width={principal.portada.ancho}
                height={principal.portada.alto}
                alt={principal.portada.alt}
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[var(--ease-salida)] group-hover:scale-[1.02]"
              />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-4 rounded-lg bg-hoja/95 px-4 py-3 backdrop-blur">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{principal.titulo}</p>
                  <p className="truncate text-sm text-cemento">{subtitulo(r, principal) || "Recién publicado"}</p>
                </div>
                <p className="titulo shrink-0 text-[1.75rem] tabular text-ocre">{formatoPrecio(principal.precio, principal.moneda)}</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="contenedor py-16 md:py-20" aria-labelledby="t-recientes">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="t-recientes" className="titulo text-grande">{r.genero === "m" ? "Recién publicados" : "Recién publicadas"}</h2>
          <Link href={`/${r.ruta}`} className="enlace font-medium">Ver {r.genero === "m" ? "los" : "las"} {total} {r.nombre.plural.toLowerCase()}</Link>
        </div>
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {resto.slice(0, 6).map((it) => <Tarjeta key={it.id} p={it} r={r} />)}
        </div>
      </section>

      <section className="border-y border-borde bg-hoja" aria-labelledby="t-tipos">
        <div className="contenedor py-12">
          <h2 id="t-tipos" className="sr-only">Buscar por tipo</h2>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-borde md:grid-cols-4">
            {r.tipos.filter((t) => conteo[t.valor]).slice(0, 4).map((t) => (
              <li key={t.valor} className="bg-hoja">
                <Link href={`/${r.ruta}?tipo=${t.valor}`} className="flex h-full flex-col gap-1 px-4 py-5 hover:bg-piedra sm:px-5 sm:py-6">
                  <span className="titulo text-[1.55rem] break-words sm:text-[2.2rem]">{["SUV", "PH"].includes(t.etiqueta) ? t.etiqueta : `${t.etiqueta}${t.etiqueta.endsWith("l") ? "es" : "s"}`}</span>
                  <span className="text-sm text-cemento tabular">{conteo[t.valor]} {r.genero === "m" ? (conteo[t.valor] === 1 ? "publicado" : "publicados") : (conteo[t.valor] === 1 ? "publicada" : "publicadas")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="contenedor grid gap-10 py-16 md:grid-cols-3 md:py-20" aria-label="Por qué elegirnos">
        {p.ventajas.map((v) => (
          <div key={v.titulo} className="border-t-2 border-carbon pt-5">
            <h2 className="text-lg font-semibold">{v.titulo}</h2>
            <p className="mt-2 text-cemento">{v.texto}</p>
          </div>
        ))}
      </section>

      <section className="contenedor">
        <div className="grid gap-6 rounded-2xl bg-carbon px-6 py-10 text-hoja md:grid-cols-[1.4fr_auto] md:items-center md:px-12 md:py-14">
          <div>
            <h2 className="titulo text-grande">{p.rubro === "vehiculo" ? "¿Querés vender tu auto?" : "¿Querés vender o alquilar tu propiedad?"}</h2>
            <p className="mt-3 max-w-[52ch] text-[#CFC9BF]">
              {p.rubro === "vehiculo"
                ? "Contanos marca, modelo y kilómetros. Te pasamos una tasación en el día y, si te sirve, lo tomamos como parte de pago."
                : "Te visitamos, te damos un valor de mercado por escrito y publicamos con fotos profesionales."}
            </p>
          </div>
          <Link href="/contacto?tipo=tasacion" className="boton boton-principal justify-self-start">Pedir tasación</Link>
        </div>
      </section>
    </>
  );
}
