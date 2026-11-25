"use client";
import { useActionState } from "react";
import { enviarConsulta } from "@/app/acciones/publico";
import type { Resultado } from "@/lib/errores";

type Props = { publicacionId?: string; titulo?: string; tipo?: "consulta" | "tasacion" | "contacto"; mensajeInicial?: string; compacto?: boolean };

export function FormConsulta({ publicacionId, titulo, tipo = "consulta", mensajeInicial = "", compacto = false }: Props) {
  const [estado, accion, enviando] = useActionState<Resultado | null, FormData>(enviarConsulta, null);
  const err = (k: string) => (estado && !estado.ok ? estado.campos?.[k] : undefined);

  if (estado?.ok) {
    return (
      <div role="status" className="rounded-xl bg-[#E7EFE9] px-5 py-6 text-verde">
        <p className="font-semibold">{estado.mensaje}</p>
        <p className="mt-1 text-sm">Si es urgente, escribinos por WhatsApp.</p>
      </div>
    );
  }

  return (
    <form action={accion} className="grid gap-4" noValidate>
      {publicacionId && <input type="hidden" name="publicacionId" value={publicacionId} />}
      {titulo && <input type="hidden" name="titulo" value={titulo} />}
      <input type="hidden" name="tipo" value={tipo} />
      {/* Campo trampa para bots: invisible y fuera del orden de tabulación */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="sitio">No completar</label>
        <input id="sitio" name="sitio" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={compacto ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className="etiqueta" htmlFor="c-nombre">Nombre</label>
          <input id="c-nombre" name="nombre" required maxLength={80} autoComplete="name" className="campo" aria-invalid={!!err("nombre")} aria-describedby={err("nombre") ? "e-nombre" : undefined} />
          {err("nombre") && <p id="e-nombre" className="error-campo">{err("nombre")}</p>}
        </div>
        <div>
          <label className="etiqueta" htmlFor="c-telefono">Teléfono</label>
          <input id="c-telefono" name="telefono" type="tel" required maxLength={25} autoComplete="tel" placeholder="2284 15 000000" className="campo tabular" aria-invalid={!!err("telefono")} aria-describedby={err("telefono") ? "e-telefono" : undefined} />
          {err("telefono") && <p id="e-telefono" className="error-campo">{err("telefono")}</p>}
        </div>
      </div>
      {!compacto && (
        <div>
          <label className="etiqueta" htmlFor="c-email">Email <span className="font-normal text-cemento">(opcional)</span></label>
          <input id="c-email" name="email" type="email" maxLength={120} autoComplete="email" className="campo" aria-invalid={!!err("email")} />
          {err("email") && <p className="error-campo">{err("email")}</p>}
        </div>
      )}
      <div>
        <label className="etiqueta" htmlFor="c-mensaje">Mensaje</label>
        <textarea id="c-mensaje" name="mensaje" required rows={compacto ? 3 : 5} maxLength={2000} defaultValue={mensajeInicial} className="campo resize-y" aria-invalid={!!err("mensaje")} aria-describedby={err("mensaje") ? "e-mensaje" : undefined} />
        {err("mensaje") && <p id="e-mensaje" className="error-campo">{err("mensaje")}</p>}
      </div>
      {estado && !estado.ok && <p role="alert" className="rounded-lg bg-[#F6E3E0] px-3 py-2 text-sm font-medium text-alerta">{estado.error}</p>}
      <button className="boton boton-oscuro" disabled={enviando}>{enviando ? "Enviando…" : "Enviar consulta"}</button>
      <p className="text-xs text-cemento">Usamos tus datos solo para responderte.</p>
    </form>
  );
}
