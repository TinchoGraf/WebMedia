/** Aviso por email al dueño cuando entra una consulta. Si no hay RESEND_API_KEY, no hace nada. */
export async function avisarConsulta(d: { nombre: string; telefono: string; mensaje: string; publicacion?: string }) {
  const key = process.env.RESEND_API_KEY;
  const para = process.env.EMAIL_AVISOS;
  if (!key || !para) return;
  const { Resend } = await import("resend");
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  await new Resend(key).emails.send({
    from: process.env.EMAIL_DESDE ?? "Avisos <onboarding@resend.dev>",
    to: para,
    subject: `Nueva consulta de ${d.nombre}`.slice(0, 120),
    html: `<p><b>${esc(d.nombre)}</b> (${esc(d.telefono)})${d.publicacion ? ` sobre <b>${esc(d.publicacion)}</b>` : ""}:</p><p>${esc(d.mensaje).replace(/\n/g, "<br>")}</p><p>Respondé desde el panel.</p>`,
  }).catch((e) => console.error("No se pudo enviar el aviso:", e?.message));
}
