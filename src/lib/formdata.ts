/** FormData → objeto, convirtiendo "atributos.marca" en { atributos: { marca } }. Ignora claves internas de Next ($ACTION_…). */
export function formAObjeto(form: FormData) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) {
    if (k.startsWith("$") || typeof v !== "string") continue;
    const partes = k.split(".");
    if (partes.length > 2 || partes.some((p) => !/^[a-zA-Z0-9_]{1,40}$/.test(p))) continue;
    if (partes.length === 2) {
      const [a, b] = partes;
      if (a === "__proto__" || b === "__proto__") continue;
      const sub = (out[a] ??= {}) as Record<string, unknown>;
      sub[b] = v;
    } else out[k] = v;
  }
  return out;
}
