/** Datos de ejemplo. Todo ficticio, pensado para Olavarría. Precios en pesos/dólares enteros (no centavos). */

export type SemillaAuto = {
  carroceria: "hatch" | "sedan" | "suv" | "pickup" | "van";
  color: string;
  tipo: "auto" | "camioneta" | "suv" | "utilitario";
  precio: number | null;
  estado?: "publicada" | "reservada" | "borrador";
  destacada?: boolean;
  descripcion: string;
  atributos: Record<string, unknown>;
};

export const AUTOS: SemillaAuto[] = [
  {
    carroceria: "hatch", color: "#8E9AA3", tipo: "auto", precio: 9_800_000, destacada: true,
    descripcion: "Gol Trend con service al día en concesionario oficial. Cubiertas nuevas, aire funcionando, cierre centralizado. Ideal primer auto.",
    atributos: { marca: "Volkswagen", modelo: "Gol Trend", version: "1.6 Pack I", anio: 2015, km: 98000, combustible: "nafta", transmision: "manual", color: "Gris plata", puertas: 5, unicoDueno: false, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "hatch", color: "#8A2329", tipo: "auto", precio: 15_500_000,
    descripcion: "Onix LT con pantalla multimedia y cámara de retroceso. Un solo dueño, nunca chocado. Se entrega con VTV vigente.",
    atributos: { marca: "Chevrolet", modelo: "Onix", version: "1.4 LT", anio: 2019, km: 61000, combustible: "nafta", transmision: "manual", color: "Rojo", puertas: 5, unicoDueno: true, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "hatch", color: "#ECEAE4", tipo: "auto", precio: 21_900_000, destacada: true,
    descripcion: "208 Allure en excelente estado. Techo panorámico, sensores de estacionamiento y llantas de aleación. Garantía de motor y caja por 3 meses.",
    atributos: { marca: "Peugeot", modelo: "208", version: "1.6 Allure", anio: 2021, km: 38000, combustible: "nafta", transmision: "manual", color: "Blanco", puertas: 5, unicoDueno: true, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "sedan", color: "#A7ADB2", tipo: "auto", precio: 24_500_000, destacada: true,
    descripcion: "Corolla XEi automático con caja CVT. Todos los services en Toyota, tapizado de cuero y control crucero. Muy cuidado.",
    atributos: { marca: "Toyota", modelo: "Corolla", version: "1.8 XEi CVT", anio: 2018, km: 82000, combustible: "nafta", transmision: "automatica", color: "Gris plata", puertas: 4, unicoDueno: false, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "sedan", color: "#2F4A6B", tipo: "auto", precio: 19_800_000,
    descripcion: "Cronos Drive con pocos kilómetros. Baúl enorme, consumo bajo en ruta. Se entrega transferido.",
    atributos: { marca: "Fiat", modelo: "Cronos", version: "1.3 Drive", anio: 2022, km: 29000, combustible: "nafta", transmision: "manual", color: "Azul", puertas: 4, unicoDueno: true, aceptaPermuta: false, financiacion: true },
  },
  {
    carroceria: "sedan", color: "#F1F0EB", tipo: "auto", precio: 10_900_000,
    descripcion: "Logan con equipo de GNC de quinta generación habilitado. Ideal para trabajo o remís: el más económico de la agencia.",
    atributos: { marca: "Renault", modelo: "Logan", version: "1.6 Life", anio: 2017, km: 110000, combustible: "gnc", transmision: "manual", color: "Blanco", puertas: 4, unicoDueno: false, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "pickup", color: "#4A4F55", tipo: "camioneta", precio: 42_000_000, destacada: true,
    descripcion: "Hilux SRV 4x4 automática, cubre caja y enganche. Uso campo y ruta, service oficial cada 10.000 km. Lista para trabajar.",
    atributos: { marca: "Toyota", modelo: "Hilux", version: "2.8 SRV 4x4 AT", anio: 2019, km: 140000, combustible: "diesel", transmision: "automatica", color: "Gris oscuro", puertas: 4, unicoDueno: true, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "pickup", color: "#2D3A4A", tipo: "camioneta", precio: 29_500_000,
    descripcion: "Ranger XLS 4x2 doble cabina. Embrague nuevo y distribución hecha. Acepto permuta por auto de menor valor.",
    atributos: { marca: "Ford", modelo: "Ranger", version: "3.2 XLS 4x2", anio: 2017, km: 165000, combustible: "diesel", transmision: "manual", color: "Azul", puertas: 4, unicoDueno: false, aceptaPermuta: true, financiacion: false },
  },
  {
    carroceria: "pickup", color: "#ECEAE4", tipo: "camioneta", precio: 27_000_000, estado: "reservada",
    descripcion: "Amarok Highline con barra antivuelco y lona. Reservada: consultá por otras camionetas similares.",
    atributos: { marca: "Volkswagen", modelo: "Amarok", version: "2.0 Highline", anio: 2016, km: 180000, combustible: "diesel", transmision: "manual", color: "Blanco", puertas: 4, unicoDueno: false, aceptaPermuta: false, financiacion: true },
  },
  {
    carroceria: "suv", color: "#9C2B2B", tipo: "suv", precio: 25_900_000,
    descripcion: "Renegade Sport con sistema de tracción Traction Control+. Sensores, multimedia y climatizador.",
    atributos: { marca: "Jeep", modelo: "Renegade", version: "1.8 Sport", anio: 2020, km: 55000, combustible: "nafta", transmision: "manual", color: "Rojo", puertas: 5, unicoDueno: true, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "suv", color: "#6E757B", tipo: "suv", precio: 28_400_000,
    descripcion: "Kicks Advance automático, cámara 360 y arranque sin llave. Se entrega con informe de dominio y libre de multas.",
    atributos: { marca: "Nissan", modelo: "Kicks", version: "1.6 Advance CVT", anio: 2021, km: 41000, combustible: "nafta", transmision: "automatica", color: "Gris", puertas: 5, unicoDueno: true, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "van", color: "#F2F1EC", tipo: "utilitario", precio: 14_200_000,
    descripcion: "Kangoo Express con puerta lateral corrediza. Caja de carga con piso de goma. Ideal para reparto.",
    atributos: { marca: "Renault", modelo: "Kangoo", version: "1.6 Express", anio: 2018, km: 120000, combustible: "nafta", transmision: "manual", color: "Blanco", puertas: 4, unicoDueno: false, aceptaPermuta: true, financiacion: true },
  },
  {
    carroceria: "van", color: "#E7E5DF", tipo: "utilitario", precio: 13_500_000, estado: "borrador",
    descripcion: "Fiorino Endurance. Falta cargar las fotos del interior antes de publicar.",
    atributos: { marca: "Fiat", modelo: "Fiorino", version: "1.4 Endurance", anio: 2020, km: 70000, combustible: "nafta", transmision: "manual", color: "Blanco", puertas: 3, unicoDueno: true, aceptaPermuta: false, financiacion: true },
  },
];

export type SemillaPropiedad = {
  operacion: "venta" | "alquiler";
  tipo: "casa" | "departamento" | "ph" | "lote" | "local" | "campo";
  zona: string;
  precio: number | null;
  expensas?: number;
  titulo?: string;
  estado?: "publicada" | "reservada" | "borrador";
  destacada?: boolean;
  /** Escenas a ilustrar, en orden */
  escenas: ("casa" | "depto" | "living" | "cocina" | "dormitorio" | "patio" | "lote" | "campo" | "local")[];
  paleta: { pared: string; acento: string };
  descripcion: string;
  atributos: Record<string, unknown>;
};

export const PROPIEDADES: SemillaPropiedad[] = [
  {
    operacion: "venta", tipo: "casa", zona: "Pueblo Nuevo", precio: 68_000, destacada: true,
    escenas: ["casa", "living", "cocina", "dormitorio", "patio"], paleta: { pared: "#E8DCC8", acento: "#A4553A" },
    descripcion: "Casa de 3 ambientes sobre lote de 10 x 30. Living comedor, cocina separada, dos dormitorios, patio con parrilla y cochera para un auto. A tres cuadras de la avenida.",
    atributos: { ambientes: 3, dormitorios: 2, banos: 1, m2Cubiertos: 95, m2Totales: 300, antiguedad: 30, cochera: true, patio: true, aptoCredito: true, mascotas: false },
  },
  {
    operacion: "venta", tipo: "casa", zona: "Centro", precio: 115_000, destacada: true,
    escenas: ["casa", "living", "cocina", "dormitorio", "dormitorio", "patio"], paleta: { pared: "#DCD4C6", acento: "#5C5650" },
    descripcion: "Casa de 4 ambientes reciclada a nuevo, a dos cuadras de la plaza. Calefacción por radiadores, aberturas de aluminio con DVH y patio con quincho.",
    atributos: { ambientes: 4, dormitorios: 3, banos: 2, m2Cubiertos: 160, m2Totales: 340, antiguedad: 45, cochera: true, patio: true, aptoCredito: true, mascotas: false },
  },
  {
    operacion: "alquiler", tipo: "departamento", zona: "Centro", precio: 420_000, expensas: 45_000,
    escenas: ["depto", "living", "cocina", "dormitorio"], paleta: { pared: "#D9D2C5", acento: "#5C6B60" },
    descripcion: "Departamento de 2 ambientes con balcón a la calle. Cocina integrada, calefacción por tiro balanceado. Contrato a 2 años, ajuste semestral.",
    atributos: { ambientes: 2, dormitorios: 1, banos: 1, m2Cubiertos: 48, m2Totales: 52, antiguedad: 12, cochera: false, patio: false, aptoCredito: false, mascotas: true },
  },
  {
    operacion: "venta", tipo: "departamento", zona: "Centro", precio: 75_000,
    escenas: ["depto", "living", "dormitorio", "cocina"], paleta: { pared: "#CFC8BA", acento: "#3F4B45" },
    descripcion: "Departamento de 3 ambientes en tercer piso con ascensor. Muy luminoso, orientación norte. Cochera opcional en el mismo edificio.",
    atributos: { ambientes: 3, dormitorios: 2, banos: 1, m2Cubiertos: 72, m2Totales: 78, antiguedad: 8, cochera: false, patio: false, aptoCredito: true, mascotas: false },
  },
  {
    operacion: "venta", tipo: "ph", zona: "Lourdes", precio: 52_000,
    escenas: ["casa", "living", "cocina", "patio"], paleta: { pared: "#EAE2D2", acento: "#7A6450" },
    descripcion: "PH al frente sin expensas, con patio propio y lavadero. Entrada independiente. Ideal para primera vivienda.",
    atributos: { ambientes: 3, dormitorios: 2, banos: 1, m2Cubiertos: 70, m2Totales: 110, antiguedad: 35, cochera: false, patio: true, aptoCredito: true, mascotas: false },
  },
  {
    operacion: "venta", tipo: "lote", zona: "Sierras Bayas", precio: 18_000, titulo: "Lote de 12 x 35 con vista a las sierras",
    escenas: ["lote"], paleta: { pared: "#9DB070", acento: "#7F9A63" },
    descripcion: "Lote de 12 x 35 con vista a las sierras. Luz y agua en la cuadra, calle de tierra consolidada. Escritura inmediata.",
    atributos: { m2Totales: 420, cochera: false, patio: false, aptoCredito: false, mascotas: false },
  },
  {
    operacion: "venta", tipo: "lote", zona: "Villa Floresta", precio: 24_000, titulo: "Lote esquina en Villa Floresta",
    escenas: ["lote"], paleta: { pared: "#8FA868", acento: "#6F8A4D" },
    descripcion: "Lote esquina de 15 x 30 en zona en crecimiento. Todos los servicios. Apto para construir dos viviendas.",
    atributos: { m2Totales: 450, cochera: false, patio: false, aptoCredito: false, mascotas: false },
  },
  {
    operacion: "venta", tipo: "campo", zona: "Zona rural", precio: null, titulo: "Campo de 120 hectáreas agrícola-ganadero",
    escenas: ["campo", "lote"], paleta: { pared: "#C9B66E", acento: "#7F9A63" },
    descripcion: "Campo mixto de 120 ha a 15 km de la ciudad por camino mejorado. Molino, aguadas, alambrados en buen estado y casa de casero. Precio a consultar.",
    atributos: { m2Totales: 1_200_000, cochera: false, patio: false, aptoCredito: false, mascotas: false },
  },
  {
    operacion: "alquiler", tipo: "local", zona: "Centro", precio: 650_000, titulo: "Local comercial sobre avenida",
    escenas: ["local"], paleta: { pared: "#3F4B45", acento: "#B4553C" },
    descripcion: "Local de 60 m² con vidriera de 6 metros, baño y depósito. Excelente ubicación comercial.",
    atributos: { m2Cubiertos: 60, m2Totales: 75, banos: 1, antiguedad: 20, cochera: false, patio: false, aptoCredito: false, mascotas: false },
  },
  {
    operacion: "venta", tipo: "casa", zona: "Loma Negra", precio: 45_000, estado: "reservada",
    escenas: ["casa", "living", "patio"], paleta: { pared: "#E2D5BE", acento: "#8C4A33" },
    descripcion: "Casa de 3 ambientes con amplio terreno. Reservada: consultanos por propiedades similares.",
    atributos: { ambientes: 3, dormitorios: 2, banos: 1, m2Cubiertos: 85, m2Totales: 600, antiguedad: 40, cochera: true, patio: true, aptoCredito: true, mascotas: false },
  },
  {
    operacion: "alquiler", tipo: "departamento", zona: "Bancalari", precio: 290_000, expensas: 20_000,
    escenas: ["depto", "living", "cocina"], paleta: { pared: "#D4CCBE", acento: "#6E7B70" },
    descripcion: "Monoambiente amplio con cocina separada. Ideal estudiantes de la facultad. Acepta mascotas pequeñas.",
    atributos: { ambientes: 1, dormitorios: 0, banos: 1, m2Cubiertos: 34, m2Totales: 34, antiguedad: 6, cochera: false, patio: false, aptoCredito: false, mascotas: true },
  },
  {
    operacion: "alquiler", tipo: "casa", zona: "Mariano Moreno", precio: 550_000, estado: "borrador",
    escenas: ["casa", "living"], paleta: { pared: "#E6DDCC", acento: "#94503A" },
    descripcion: "Casa de 3 ambientes con patio. Falta confirmar con el propietario el valor del alquiler.",
    atributos: { ambientes: 3, dormitorios: 2, banos: 1, m2Cubiertos: 90, m2Totales: 250, antiguedad: 25, cochera: true, patio: true, aptoCredito: false, mascotas: true },
  },
];

export const CONSULTAS = [
  { indice: 0, nombre: "Martina López", telefono: "2284 15-000001", mensaje: "Hola, ¿el auto tiene algún detalle de chapa? ¿Aceptan un Clio 2010 como parte de pago?", estado: "nueva" as const },
  { indice: 6, nombre: "Jorge Ibáñez", telefono: "2284 15-000002", mensaje: "Me interesa la Hilux. ¿Se puede ver el sábado a la mañana?", estado: "nueva" as const },
  { indice: 3, nombre: "Lucía F.", telefono: "2284 15-000003", email: "lucia@example.com", mensaje: "¿Qué financiación tienen para el Corolla? Tengo la mitad en efectivo.", estado: "respondida" as const },
  { indice: 1, nombre: "Pablo Ríos", telefono: "2284 15-000004", mensaje: "¿Tiene la VTV al día? ¿Se puede llevar a revisar a un mecánico de confianza?", estado: "nueva" as const },
  { indice: null, nombre: "Claudia Medina", telefono: "2284 15-000005", mensaje: "Quiero tasar mi Fiesta Kinetic 2013 para entregarlo en parte de pago.", estado: "cerrada" as const, tipo: "tasacion" as const },
];
