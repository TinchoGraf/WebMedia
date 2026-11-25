import type { Metadata } from "next";
import { perfilActivo } from "@config";

export const metadata: Metadata = { title: "Privacidad" };

export default function Privacidad() {
  const p = perfilActivo();
  return (
    <div className="contenedor max-w-[70ch] py-14">
      <h1 className="titulo text-grande">Política de privacidad</h1>
      <div className="mt-8 grid gap-5 text-[1.05rem]">
        <p>Cuando nos mandás una consulta guardamos tu nombre, teléfono, email (si lo dejás) y el mensaje, solo para responderte. No los vendemos ni los compartimos.</p>
        <p>Para evitar abusos guardamos una versión cifrada e irreversible de tu dirección IP. No usamos cookies de seguimiento ni publicidad. La única cookie es la de inicio de sesión del panel interno.</p>
        <p>El mapa de Google solo se carga si tocás el botón para verlo; desde ese momento rige la política de Google.</p>
        <p>Podés pedir ver, corregir o borrar tus datos escribiendo a <a className="enlace" href={`mailto:${p.email}`}>{p.email}</a>. La Ley 25.326 de Protección de Datos Personales te da ese derecho; el órgano de control es la Agencia de Acceso a la Información Pública.</p>
      </div>
    </div>
  );
}
