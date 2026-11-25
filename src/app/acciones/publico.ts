"use server";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { ErrorVisible, type Resultado } from "@/lib/errores";
import { avisarConsulta } from "@/lib/email";
import { ipCliente } from "@/lib/ip";
import { crearConsulta } from "@/server/consultas";

export async function enviarConsulta(_prev: Resultado | null, form: FormData): Promise<Resultado> {
  try {
    const datos = Object.fromEntries(form.entries());
    const r = await crearConsulta(db, datos, await ipCliente(), perfilActivo().rubro);
    if (r.guardada) {
      await avisarConsulta({ nombre: String(datos.nombre), telefono: String(datos.telefono), mensaje: String(datos.mensaje), publicacion: String(datos.titulo ?? "") || undefined });
    }
    return { ok: true, mensaje: "¡Gracias! Recibimos tu consulta y te respondemos en el día." };
  } catch (e) {
    if (e instanceof ErrorVisible) return { ok: false, error: e.message, campos: e.campos };
    console.error(e);
    return { ok: false, error: "No pudimos enviar la consulta. Probá de nuevo o escribinos por WhatsApp." };
  }
}
