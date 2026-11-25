"use client";
import { useEffect } from "react";

/** Envía el formulario de filtros apenas cambia un select o checkbox (sin JS igual funciona con el botón "Aplicar"). */
export function AutoEnviar({ formId }: { formId: string }) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    const alCambiar = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLSelectElement || (t instanceof HTMLInputElement && t.type === "checkbox")) form.requestSubmit();
    };
    form.addEventListener("change", alCambiar);
    return () => form.removeEventListener("change", alCambiar);
  }, [formId]);
  return null;
}
