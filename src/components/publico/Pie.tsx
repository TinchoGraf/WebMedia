import Link from "next/link";
import { general, perfilActivo } from "@config";
import { linkTelefono } from "@/lib/whatsapp";
import { Isotipo } from "./Marca";

export function Pie() {
  const p = perfilActivo();
  return (
    <footer className="mt-24 bg-carbon pt-14 pb-10 text-[#CFC9BF]">
      <div className="contenedor grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2.5 text-hoja"><Isotipo /><span className="titulo text-2xl">{p.nombre}</span></p>
          <p className="mt-3 max-w-[38ch] text-sm">{p.bajada}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-hoja">Dónde estamos</p>
          <p className="mt-2">{p.direccion.calle}, {p.direccion.ciudad}</p>
          <p className="mt-1">{p.horario}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-hoja">Contacto</p>
          <ul className="mt-2 grid gap-1.5">
            <li><a className="enlace" href={linkTelefono(p.telefono)}>{p.telefono}</a></li>
            <li><a className="enlace" href={`mailto:${p.email}`}>{p.email}</a></li>
            {p.redes.instagram && <li><a className="enlace" href={p.redes.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>}
            <li><Link className="enlace" href="/privacidad">Privacidad</Link></li>
          </ul>
        </div>
      </div>
      <div className="contenedor mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-xs">
        <p>© {new Date().getFullYear()} {p.nombre}.{general.esDemo && " Sitio de demostración: nombre, datos de contacto y publicaciones son ficticios."}</p>
        <a className="enlace" href={general.credito.url} target="_blank" rel="noopener noreferrer">{general.credito.texto}</a>
      </div>
    </footer>
  );
}
