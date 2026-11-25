import { sql } from "drizzle-orm";
import {
  bigint, boolean, check, index, integer, jsonb, numeric, pgTable, serial, text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

const marcas = {
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};

/* ───────────── Tablas de Better Auth (nombres de campo que espera la librería) ───────────── */

export const usuarios = pgTable("usuarios", {
  id: text("id").primaryKey(),
  name: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verificado").notNull().default(false),
  image: text("imagen"),
  /** dueno: todo · editor: publicaciones y consultas · demo: como editor, con límites y sin borrar */
  rol: text("rol", { enum: ["dueno", "editor", "demo"] }).notNull().default("editor"),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [check("rol_valido", sql`${t.rol} IN ('dueno','editor','demo')`)]);

export const sesiones = pgTable("sesiones", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expira_en", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip"),
  userAgent: text("user_agent"),
  userId: text("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
});

export const cuentas = pgTable("cuentas", {
  id: text("id").primaryKey(),
  accountId: text("cuenta_id").notNull(),
  providerId: text("proveedor_id").notNull(),
  userId: text("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expira_en", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expira_en", { withTimezone: true }),
  scope: text("scope"),
  /** hash de la contraseña (lo calcula Better Auth; nunca se guarda en claro) */
  password: text("password"),
  createdAt: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow(),
});

export const verificaciones = pgTable("verificaciones", {
  id: text("id").primaryKey(),
  identifier: text("identificador").notNull(),
  value: text("valor").notNull(),
  expiresAt: timestamp("expira_en", { withTimezone: true }).notNull(),
  createdAt: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow(),
});

export const limitesAuth = pgTable("limites_auth", {
  id: text("id").primaryKey(),
  key: text("clave").notNull().unique(),
  count: integer("cantidad").notNull(),
  lastRequest: bigint("ultimo_pedido", { mode: "number" }).notNull(),
});

/* ───────────── Catálogo ───────────── */

export const publicaciones = pgTable(
  "publicaciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    numero: serial("numero").notNull().unique(),
    rubro: text("rubro").notNull(),
    slug: text("slug").notNull().unique(),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion").notNull().default(""),
    operacion: text("operacion"),
    tipo: text("tipo").notNull(),
    /** en centavos; null = "Consultar precio" */
    precio: bigint("precio", { mode: "number" }),
    moneda: text("moneda", { enum: ["ARS", "USD"] }).notNull().default("ARS"),
    expensas: bigint("expensas", { mode: "number" }),
    estado: text("estado", { enum: ["borrador", "publicada", "reservada", "cerrada"] }).notNull().default("borrador"),
    destacada: boolean("destacada").notNull().default(false),
    /** campos propios del rubro, validados con el Zod que genera src/rubros */
    atributos: jsonb("atributos").$type<Record<string, unknown>>().notNull().default({}),
    zona: text("zona"),
    /** dirección exacta: solo se ve en el panel */
    direccion: text("direccion"),
    lat: numeric("lat", { precision: 9, scale: 6, mode: "number" }),
    lng: numeric("lng", { precision: 9, scale: 6, mode: "number" }),
    creadoPor: text("creado_por").references(() => usuarios.id, { onDelete: "set null" }),
    publicadoEn: timestamp("publicado_en", { withTimezone: true }),
    ...marcas,
  },
  (t) => [
    index("publicaciones_listado_idx").on(t.rubro, t.estado, t.precio),
    index("publicaciones_zona_idx").on(t.zona),
    index("publicaciones_atributos_idx").using("gin", t.atributos),
    check("precio_no_negativo", sql`${t.precio} IS NULL OR ${t.precio} >= 0`),
    check("titulo_largo", sql`char_length(${t.titulo}) BETWEEN 3 AND 120`),
    check("descripcion_largo", sql`char_length(${t.descripcion}) <= 5000`),
    check("estado_valido", sql`${t.estado} IN ('borrador','publicada','reservada','cerrada')`),
    check("moneda_valida", sql`${t.moneda} IN ('ARS','USD')`),
  ],
);

export const fotos = pgTable(
  "fotos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publicacionId: uuid("publicacion_id").notNull().references(() => publicaciones.id, { onDelete: "cascade" }),
    /** clave en el storage (sin dominio); la URL se arma al mostrar */
    clave: text("clave").notNull(),
    claveMiniatura: text("clave_miniatura").notNull(),
    ancho: integer("ancho").notNull(),
    alto: integer("alto").notNull(),
    blur: text("blur").notNull(),
    alt: text("alt").notNull().default(""),
    orden: integer("orden").notNull(),
    subidaPor: text("subida_por").references(() => usuarios.id, { onDelete: "set null" }),
    creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("fotos_orden_unico").on(t.publicacionId, t.orden),
    check("alt_largo", sql`char_length(${t.alt}) <= 150`),
  ],
);

export const consultas = pgTable(
  "consultas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publicacionId: uuid("publicacion_id").references(() => publicaciones.id, { onDelete: "set null" }),
    /** rubro del sitio donde entró (si una base atiende dos perfiles, cada panel ve las suyas) */
    rubro: text("rubro").notNull().default("vehiculo"),
    tipo: text("tipo", { enum: ["consulta", "tasacion", "contacto"] }).notNull().default("consulta"),
    nombre: text("nombre").notNull(),
    telefono: text("telefono").notNull(),
    email: text("email"),
    mensaje: text("mensaje").notNull(),
    estado: text("estado", { enum: ["nueva", "respondida", "cerrada"] }).notNull().default("nueva"),
    /** hash de la IP con sal: sirve para limitar abusos sin guardar la IP */
    ipHash: text("ip_hash"),
    ...marcas,
  },
  (t) => [
    index("consultas_estado_idx").on(t.rubro, t.estado, t.creadoEn),
    check("mensaje_largo", sql`char_length(${t.mensaje}) <= 2000`),
    check("consulta_estado_valido", sql`${t.estado} IN ('nueva','respondida','cerrada')`),
    check("consulta_tipo_valido", sql`${t.tipo} IN ('consulta','tasacion','contacto')`),
  ],
);

export const actividad = pgTable(
  "actividad",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    usuarioId: text("usuario_id").references(() => usuarios.id, { onDelete: "set null" }),
    usuarioNombre: text("usuario_nombre"),
    accion: text("accion").notNull(),
    entidad: text("entidad").notNull(),
    entidadId: text("entidad_id"),
    detalle: jsonb("detalle").$type<Record<string, unknown>>(),
    creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("actividad_fecha_idx").on(t.creadoEn)],
);

/** Contador genérico para limitar abusos (consultas públicas, subidas del rol demo) */
export const limites = pgTable("limites", {
  clave: text("clave").primaryKey(),
  cantidad: integer("cantidad").notNull().default(0),
  ventanaHasta: timestamp("ventana_hasta", { withTimezone: true }).notNull(),
});

export type Publicacion = typeof publicaciones.$inferSelect;
export type Foto = typeof fotos.$inferSelect;
export type Consulta = typeof consultas.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
