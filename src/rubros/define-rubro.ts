/**
 * Un "rubro" describe qué se publica (autos, propiedades, maquinaria…).
 * De esta definición salen: el esquema de validación (Zod), el formulario del panel,
 * los filtros públicos y los datos destacados de la ficha. Agregar un rubro = agregar un archivo.
 */
import { z } from "zod";

export type Opcion = { valor: string; etiqueta: string };

type Base = {
  clave: string;
  etiqueta: string;
  /** Se muestra como dato destacado en tarjeta y ficha */
  destacado?: boolean;
  /** Texto de ayuda en el formulario del panel */
  ayuda?: string;
  opcional?: boolean;
};

export type Campo =
  | (Base & { tipo: "entero"; min: number; max: number; sufijo?: string; filtro?: "rango" | "minimo"; formato?: "miles" | "simple" })
  | (Base & { tipo: "decimal"; min: number; max: number; sufijo?: string; filtro?: "rango" | "minimo" })
  | (Base & { tipo: "opcion"; opciones: Opcion[]; filtro?: "igual" })
  | (Base & { tipo: "texto"; max: number; filtro?: "igual"; sugerencias?: string[] })
  | (Base & { tipo: "booleano"; filtro?: "si" });

export type Moneda = "ARS" | "USD";

export type DefinicionRubro = {
  id: string;
  nombre: { singular: string; plural: string };
  /** Segmento de URL pública: /autos, /propiedades */
  ruta: string;
  genero: "m" | "f";
  operaciones: Opcion[];
  tipos: Opcion[];
  /** Moneda por defecto al cargar y para filtrar por precio */
  moneda: (operacion: string | null) => Moneda;
  /** ¿Se muestra el filtro de zona/barrio? */
  usaZona: boolean;
  zonas?: string[];
  /** ¿La ficha muestra mapa aproximado de la zona? */
  usaMapa: boolean;
  campos: Campo[];
  /** Arma el título automático si el usuario no escribe uno */
  tituloSugerido: (tipo: string, atributos: Record<string, unknown>, operacion: string | null) => string;
  ordenes: Opcion[];
};

export function defineRubro<const T extends DefinicionRubro>(r: T) {
  return r;
}

/**
 * "98.000" → 98000 · "95,5" → 95.5 · "1.250,75" → 1250.75 · "95.5" → 95.5. Vacío → undefined (para que "requerido" funcione).
 */
export function numeroAr(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const t = v.trim().replace(/\s/g, "");
  if (!t) return undefined;
  if (t.includes(",")) return Number(t.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ""));
  return Number(t);
}

/** Esquema Zod de los atributos propios del rubro (lo que va en la columna JSONB). */
export function esquemaAtributos(r: DefinicionRubro) {
  const forma: Record<string, z.ZodType> = {};
  for (const c of r.campos) {
    let s: z.ZodType;
    switch (c.tipo) {
      case "entero":
        s = z.preprocess(numeroAr, z.number({ message: `${c.etiqueta}: completalo con un número` }).int(`${c.etiqueta}: tiene que ser un número entero`).min(c.min, `${c.etiqueta}: mínimo ${c.min}`).max(c.max, `${c.etiqueta}: máximo ${c.max}`));
        break;
      case "decimal":
        s = z.preprocess(numeroAr, z.number({ message: `${c.etiqueta}: completalo con un número` }).min(c.min, `${c.etiqueta}: mínimo ${c.min}`).max(c.max, `${c.etiqueta}: máximo ${c.max}`));
        break;
      case "opcion":
        s = z.preprocess((v) => (v === "" ? undefined : v), z.enum(c.opciones.map((o) => o.valor) as [string, ...string[]], { message: `${c.etiqueta}: elegí una opción` }));
        break;
      case "texto":
        s = z.string({ message: `${c.etiqueta}: completalo` }).trim().min(1, `${c.etiqueta}: completalo`).max(c.max, `${c.etiqueta}: máximo ${c.max} caracteres`);
        break;
      case "booleano":
        s = z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean());
        break;
    }
    forma[c.clave] = c.opcional ? z.preprocess((v) => (v === "" || v === null ? undefined : v), s.optional()) : s;
  }
  return z.object(forma).strict();
}

export const etiquetaDe = (opciones: Opcion[], valor: string | null | undefined) =>
  opciones.find((o) => o.valor === valor)?.etiqueta ?? valor ?? "";

/** Formatea un atributo para mostrar: 85000 km → "85.000 km", true → "Sí" */
export function formatearAtributo(c: Campo, valor: unknown): string {
  if (valor === undefined || valor === null || valor === "") return "";
  switch (c.tipo) {
    case "entero":
    case "decimal": {
      const n = Number(valor);
      const txt = c.tipo === "entero" && c.formato === "simple" ? String(n) : n.toLocaleString("es-AR");
      return c.sufijo ? `${txt} ${c.sufijo}` : txt;
    }
    case "opcion":
      return etiquetaDe(c.opciones, String(valor));
    case "booleano":
      return valor ? "Sí" : "No";
    default:
      return String(valor);
  }
}
