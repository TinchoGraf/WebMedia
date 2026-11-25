import Link from "next/link";
import { perfilActivo } from "@config";
import { rubro } from "@/rubros";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Icono } from "./Icono";
import { Isotipo } from "./Marca";

export function Encabezado() {
  const p = perfilActivo();
  const r = rubro(p.rubro);
  const [primera, ...resto] = p.nombre.split(" ");
  return (
    <header className="border-b border-borde bg-piedra">
      <div className="contenedor flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 no-underline" aria-label={`${p.nombre}, inicio`}>
          <Isotipo />
          <span className="titulo text-[1.4rem] leading-none whitespace-nowrap sm:text-[1.7rem]">
            {primera} <span className="text-cemento">{resto.join(" ")}</span>
          </span>
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[0.95rem] font-medium">
            <li><Link className="hover:text-ocre" href={`/${r.ruta}`}>{r.nombre.plural}</Link></li>
            <li><Link className="hover:text-ocre" href="/contacto?tipo=tasacion">{p.rubro === "vehiculo" ? "Vendé tu auto" : "Tasá tu propiedad"}</Link></li>
            <li><Link className="hover:text-ocre" href="/contacto">Contacto</Link></li>
          </ul>
        </nav>
        <a href={linkWhatsApp(p.whatsapp, `Hola ${p.nombre}, quería hacer una consulta.`)} target="_blank" rel="noopener noreferrer" className="boton boton-oscuro min-h-10 px-4 text-sm">
          <Icono nombre="whatsapp" className="size-[1.1rem]" />
          <span className="hidden sm:inline">Escribinos</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>
      <nav aria-label="Principal (móvil)" className="border-t border-borde md:hidden">
        <ul className="contenedor flex gap-5 overflow-x-auto py-2.5 text-sm font-medium">
          <li><Link href={`/${r.ruta}`}>{r.nombre.plural}</Link></li>
          <li className="whitespace-nowrap"><Link href="/contacto?tipo=tasacion">{p.rubro === "vehiculo" ? "Vendé tu auto" : "Tasá tu propiedad"}</Link></li>
          <li><Link href="/contacto">Contacto</Link></li>
        </ul>
      </nav>
    </header>
  );
}
