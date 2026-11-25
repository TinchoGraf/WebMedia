import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { rubro } from "@/rubros";
import { publicaPorSlug, similares } from "@/server/lecturas";
import { datosClave, subtitulo, todosLosDatos } from "@/lib/fichas";
import { formatoPrecio } from "@/lib/precios";
import { codigoPublicacion } from "@/lib/slug";
import { linkTelefono, linkWhatsApp } from "@/lib/whatsapp";
import { Galeria } from "@/components/publico/Galeria";
import { FormConsulta } from "@/components/publico/FormConsulta";
import { Tarjeta } from "@/components/publico/Tarjeta";
import { Icono } from "@/components/publico/Icono";
import { MapaZona } from "@/components/publico/MapaZona";

type Props = { params: Promise<{ rubro: string; slug: string }> };

async function cargar(params: Props["params"]) {
  const { rubro: ruta, slug } = await params;
  const r = rubro(perfilActivo().rubro);
  if (r.ruta !== ruta || !/^[a-z0-9-]{1,90}$/.test(slug)) return null;
  const p = await publicaPorSlug(db, r, slug);
  return p ? { r, p } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await cargar(params);
  if (!d) return { title: "No encontrado" };
  const { r, p } = d;
  const desc = `${formatoPrecio(p.precio, p.moneda)}. ${datosClave(r, p.atributos).map((x) => `${x.etiqueta}: ${x.valor}`).join(", ")}. ${p.descripcion}`.slice(0, 160);
  const img = p.fotos[0];
  return {
    title: p.titulo,
    description: desc,
    alternates: { canonical: `/${r.ruta}/${p.slug}` },
    openGraph: { title: p.titulo, description: desc, images: img ? [{ url: img.url, width: img.ancho, height: img.alto }] : undefined },
  };
}

export default async function Ficha({ params }: Props) {
  const d = await cargar(params);
  if (!d) notFound();
  const { r, p } = d;
  const perfil = perfilActivo();
  const codigo = codigoPublicacion(perfil.prefijoCodigo, p.numero);
  const base = process.env.BETTER_AUTH_URL ?? "";
  const mensaje = `Hola, me interesa ${r.genero === "m" ? "el" : "la"} ${p.titulo} (${codigo}) que vi en ${base}/${r.ruta}/${p.slug}`;
  const datos = todosLosDatos(r, p);
  const claves = datosClave(r, p.atributos);
  const sim = await similares(db, r, p);
  const sub = subtitulo(r, p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": r.id === "vehiculo" ? "Car" : "Residence",
    name: p.titulo,
    description: p.descripcion,
    image: p.fotos.map((f) => f.url),
    ...(r.id === "vehiculo" ? { brand: p.atributos.marca, model: p.atributos.modelo, vehicleModelDate: p.atributos.anio, mileageFromOdometer: { "@type": "QuantitativeValue", value: p.atributos.km, unitCode: "KMT" } } : {}),
    offers: p.precio ? { "@type": "Offer", price: p.precio / 100, priceCurrency: p.moneda, availability: p.estado === "reservada" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock" } : undefined,
  };

  return (
    <div className="contenedor py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Ruta" className="text-sm text-cemento">
        <Link href={`/${r.ruta}`} className="enlace">{r.nombre.plural}</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/${r.ruta}?tipo=${p.tipo}`} className="enlace">{r.tipos.find((t) => t.valor === p.tipo)?.etiqueta}</Link>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
        <div className="min-w-0">
          <Galeria fotos={p.fotos} titulo={p.titulo} />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="text-sm text-cemento tabular">Código {codigo}</p>
          <h1 className="mt-1 text-[1.75rem] leading-tight font-semibold tracking-tight md:text-[2rem]">{p.titulo}</h1>
          {sub && <p className="mt-1 text-cemento">{sub}</p>}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="titulo text-[3.4rem] tabular">{formatoPrecio(p.precio, p.moneda)}</p>
            {p.estado === "reservada" && <span className="rounded bg-carbon px-2.5 py-1 text-sm font-semibold text-hoja">Reservado</span>}
          </div>
          {p.expensas ? <p className="text-sm text-cemento tabular">+ {formatoPrecio(p.expensas, "ARS")} de expensas</p> : null}

          <dl className={`mt-6 grid gap-px overflow-hidden rounded-xl bg-borde ${claves.length === 3 ? "grid-cols-3" : claves.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"}`}>
            {claves.map((x) => (
              <div key={x.etiqueta} className="bg-hoja px-4 py-3">
                <dt className="text-xs text-cemento">{x.etiqueta}</dt>
                <dd className="font-semibold tabular">{x.valor}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <a href={linkWhatsApp(perfil.whatsapp, mensaje)} target="_blank" rel="noopener noreferrer" className="boton boton-principal">
              <Icono nombre="whatsapp" />Consultar por WhatsApp
            </a>
            <a href={linkTelefono(perfil.telefono)} className="boton boton-borde"><Icono nombre="telefono" />Llamar</a>
          </div>

          <details className="group mt-6 rounded-xl bg-hoja p-5">
            <summary className="cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
              Preferís que te contactemos <span className="font-normal text-cemento group-open:hidden">(dejanos tus datos)</span>
            </summary>
            <div className="mt-4">
              <FormConsulta publicacionId={p.id} titulo={`${p.titulo} (${codigo})`} compacto mensajeInicial={`Hola, me interesa ${r.genero === "m" ? "el" : "la"} ${p.titulo}. ¿Sigue disponible?`} />
            </div>
          </details>
        </div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
        <section aria-labelledby="t-desc">
          <h2 id="t-desc" className="titulo text-[2.2rem]">Descripción</h2>
          <div className="mt-4 max-w-[68ch] text-[1.05rem] whitespace-pre-line">{p.descripcion || "Sin descripción."}</div>
          {r.usaMapa && p.zona && (
            <div className="mt-10">
              <h2 className="titulo text-[2.2rem]">Zona</h2>
              <p className="mt-2 text-cemento">{p.zona}, {perfil.direccion.ciudad}. La dirección exacta te la pasamos cuando coordinamos la visita.</p>
              <MapaZona consulta={`${p.zona}, ${perfil.direccion.ciudad}, ${perfil.direccion.provincia}`} />
            </div>
          )}
        </section>
        <section aria-labelledby="t-datos">
          <h2 id="t-datos" className="titulo text-[2.2rem]">Ficha técnica</h2>
          <table className="mt-4 w-full text-left">
            <tbody>
              {datos.map((x) => (
                <tr key={x.etiqueta} className="border-b border-borde">
                  <th scope="row" className="py-2.5 pr-4 font-normal text-cemento">{x.etiqueta}</th>
                  <td className="py-2.5 text-right font-medium tabular">{x.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {sim.length > 0 && (
        <section className="mt-20" aria-labelledby="t-sim">
          <h2 id="t-sim" className="titulo text-grande">También te puede interesar</h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {sim.map((s) => <Tarjeta key={s.id} p={s} r={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
