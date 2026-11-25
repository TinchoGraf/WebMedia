import { etiquetaDe, formatearAtributo, type DefinicionRubro } from "../rubros/define-rubro";

/** Datos que van en la tarjeta del listado (los campos marcados como destacados) */
export function datosClave(r: DefinicionRubro, atributos: Record<string, unknown>) {
  return r.campos
    .filter((c) => c.destacado && atributos[c.clave] !== undefined && atributos[c.clave] !== null && atributos[c.clave] !== "")
    .map((c) => ({ etiqueta: c.etiqueta, valor: formatearAtributo(c, atributos[c.clave]) }));
}

/** Todos los datos para la tabla de la ficha */
export function todosLosDatos(r: DefinicionRubro, p: { tipo: string; operacion: string | null; atributos: Record<string, unknown> }) {
  const filas = [{ etiqueta: "Tipo", valor: etiquetaDe(r.tipos, p.tipo) }];
  if (r.operaciones.length > 1 && p.operacion) filas.push({ etiqueta: "Operación", valor: etiquetaDe(r.operaciones, p.operacion) });
  for (const c of r.campos) {
    const v = p.atributos[c.clave];
    if (v === undefined || v === null || v === "") continue;
    if (c.tipo === "booleano" && !v) continue; // solo mostramos los "Sí"
    filas.push({ etiqueta: c.etiqueta, valor: formatearAtributo(c, v) });
  }
  return filas;
}

export function subtitulo(r: DefinicionRubro, p: { zona: string | null; operacion: string | null; atributos: Record<string, unknown> }) {
  if (r.id === "vehiculo") return String(p.atributos.version ?? "");
  return [p.operacion ? etiquetaDe(r.operaciones, p.operacion) : "", p.zona].filter(Boolean).join(" en ");
}
