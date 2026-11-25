/**
 * Todo lo que cambia entre clientes. Datos de DEMO: nombres, teléfonos y direcciones ficticios.
 * El perfil activo sale de la variable PERFIL ("autos" | "propiedades").
 */
import type { RubroId } from "@/rubros";

type Perfil = {
  rubro: RubroId;
  nombre: string;
  nombreCorto: string;
  /** Prefijo del código visible de cada publicación: "PA-0042" */
  prefijoCodigo: string;
  bajada: string;
  hero: { titulo: string; texto: string };
  /** Bloques de confianza que muestra la home (3 como máximo) */
  ventajas: { titulo: string; texto: string }[];
  telefono: string;
  whatsapp: string;
  email: string;
  direccion: { calle: string; ciudad: string; provincia: string; cp: string; referencia?: string };
  geo: { lat: number; lng: number };
  horario: string;
  redes: { instagram?: string; facebook?: string };
  seo: { titulo: string; descripcion: string };
};

const autos: Perfil = {
  rubro: "vehiculo",
  nombre: "Piedra Autos",
  nombreCorto: "Piedra",
  prefijoCodigo: "PA",
  bajada: "Usados seleccionados en Olavarría. Tomamos tu auto y financiamos.",
  hero: {
    titulo: "Usados revisados, con los papeles al día.",
    texto: "Cada auto pasa por el taller antes de publicarse. Tomamos tu usado en parte de pago y financiamos hasta en 36 cuotas.",
  },
  ventajas: [
    { titulo: "Revisión mecánica", texto: "Frenos, tren delantero, motor y caja revisados antes de publicar. Te damos el informe." },
    { titulo: "Tomamos tu usado", texto: "Lo tasamos en el momento y lo descontamos del precio." },
    { titulo: "Transferencia incluida", texto: "Hacemos el trámite en el registro: vos te llevás el auto a tu nombre." },
  ],
  telefono: "+54 2284 00-0000",
  whatsapp: "5492284000000",
  email: "ventas@piedraautos.demo",
  direccion: { calle: "Av. del Valle 0000", ciudad: "Olavarría", provincia: "Buenos Aires", cp: "7400", referencia: "Playón con estacionamiento propio." },
  geo: { lat: -36.9097, lng: -60.3131 },
  horario: "Lunes a viernes de 9 a 13 y de 16 a 20. Sábados de 9 a 13.",
  redes: { instagram: "https://instagram.com/" },
  seo: {
    titulo: "Piedra Autos · Usados en Olavarría",
    descripcion: "Autos, camionetas y utilitarios usados en Olavarría. Revisados, con financiación y tomamos tu usado. Consultá por WhatsApp.",
  },
};

const propiedades: Perfil = {
  rubro: "inmueble",
  nombre: "Piedra Propiedades",
  nombreCorto: "Piedra",
  prefijoCodigo: "PP",
  bajada: "Venta y alquiler de propiedades en Olavarría, Sierras Bayas y Loma Negra.",
  hero: {
    titulo: "Casas, departamentos y lotes en Olavarría.",
    texto: "Buscá por barrio, ambientes o precio. Si vendés, te tasamos sin cargo y publicamos con fotos profesionales.",
  },
  ventajas: [
    { titulo: "Tasación sin cargo", texto: "Visitamos tu propiedad y te damos un valor de mercado por escrito." },
    { titulo: "Fotos profesionales", texto: "Cada propiedad se publica con fotos y plano." },
    { titulo: "Acompañamiento legal", texto: "Boleto, escritura y contratos con escribanía de confianza." },
  ],
  telefono: "+54 2284 00-0002",
  whatsapp: "5492284000002",
  email: "consultas@piedrapropiedades.demo",
  direccion: { calle: "Av. Colón 0000", ciudad: "Olavarría", provincia: "Buenos Aires", cp: "7400" },
  geo: { lat: -36.8927, lng: -60.3225 },
  horario: "Lunes a viernes de 9 a 13 y de 16:30 a 20.",
  redes: { instagram: "https://instagram.com/" },
  seo: {
    titulo: "Piedra Propiedades · Inmobiliaria en Olavarría",
    descripcion: "Casas, departamentos, lotes y campos en venta y alquiler en Olavarría. Tasaciones sin cargo.",
  },
};

export const perfiles = { autos, propiedades } as const;
export type PerfilId = keyof typeof perfiles;

export function perfilActivo(): Perfil & { id: PerfilId } {
  const id = (process.env.PERFIL ?? "autos") as PerfilId;
  const p = perfiles[id] ?? perfiles.autos;
  return { ...p, id: perfiles[id] ? id : "autos" };
}

export const general = {
  esDemo: true,
  credito: { texto: "Web hecha por Tincho", url: "https://github.com/" },
  /** Límites del rol demo (para que la reunión no llene el storage) */
  limitesDemo: { fotosPorDia: 20, publicacionesPorDia: 5 },
  maxFotosPorPublicacion: 30,
  zonaHoraria: "America/Argentina/Buenos_Aires",
};
