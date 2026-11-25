import type { Metadata } from "next";
import { perfilActivo } from "@config";
import { FormConsulta } from "@/components/publico/FormConsulta";
import { MapaZona } from "@/components/publico/MapaZona";
import { Icono } from "@/components/publico/Icono";
import { linkTelefono, linkWhatsApp } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contacto" };

export default async function Contacto({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const p = perfilActivo();
  const tasacion = (await searchParams).tipo === "tasacion";
  const auto = p.rubro === "vehiculo";
  return (
    <div className="contenedor grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h1 className="titulo text-enorme max-w-[12ch]">{tasacion ? (auto ? "Tasamos tu auto." : "Tasamos tu propiedad.") : "Hablemos."}</h1>
        <p className="mt-5 max-w-[46ch] text-medio text-cemento">
          {tasacion
            ? auto ? "Contanos marca, modelo, año, kilómetros y en qué estado está. Te respondemos con un valor en el día." : "Contanos qué propiedad es, dónde está y cuántos ambientes tiene. Coordinamos una visita sin cargo."
            : "Respondemos todas las consultas en el día hábil. Si es por algo publicado, contanos cuál."}
        </p>
        <ul className="mt-8 grid gap-4">
          <li className="flex gap-3"><Icono nombre="ubicacion" className="mt-0.5 size-5 shrink-0" /><span>{p.direccion.calle}, {p.direccion.ciudad}{p.direccion.referencia ? <><br /><span className="text-cemento">{p.direccion.referencia}</span></> : null}</span></li>
          <li className="flex gap-3"><Icono nombre="reloj" className="mt-0.5 size-5 shrink-0" /><span>{p.horario}</span></li>
          <li className="flex gap-3"><Icono nombre="telefono" className="mt-0.5 size-5 shrink-0" /><a className="enlace" href={linkTelefono(p.telefono)}>{p.telefono}</a></li>
          <li className="flex gap-3"><Icono nombre="whatsapp" className="mt-0.5 size-5 shrink-0" /><a className="enlace" href={linkWhatsApp(p.whatsapp, "Hola, quería hacer una consulta.")} target="_blank" rel="noopener noreferrer">Escribinos por WhatsApp</a></li>
        </ul>
        <MapaZona consulta={`${p.direccion.calle}, ${p.direccion.ciudad}, ${p.direccion.provincia}`} />
      </div>
      <div className="rounded-2xl bg-hoja p-6 md:p-9">
        <h2 className="text-xl font-semibold">{tasacion ? "Pedir tasación" : "Mandanos tu consulta"}</h2>
        <div className="mt-6">
          <FormConsulta tipo={tasacion ? "tasacion" : "contacto"} mensajeInicial={tasacion ? (auto ? "Marca y modelo:\nAño:\nKilómetros:\nEstado:" : "Tipo de propiedad:\nZona:\nAmbientes:\n") : ""} />
        </div>
      </div>
    </div>
  );
}
