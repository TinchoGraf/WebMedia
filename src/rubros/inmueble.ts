import { defineRubro, etiquetaDe } from "./define-rubro";

export const ZONAS_OLAVARRIA = [
  "Centro", "Pueblo Nuevo", "Lourdes", "Villa Floresta", "Bancalari", "Mariano Moreno", "Sierras Bayas", "Loma Negra", "Hinojo", "Zona rural",
];

const tipos = [
  { valor: "casa", etiqueta: "Casa" },
  { valor: "departamento", etiqueta: "Departamento" },
  { valor: "ph", etiqueta: "PH" },
  { valor: "lote", etiqueta: "Lote" },
  { valor: "local", etiqueta: "Local" },
  { valor: "campo", etiqueta: "Campo" },
];
const operaciones = [
  { valor: "venta", etiqueta: "Venta" },
  { valor: "alquiler", etiqueta: "Alquiler" },
];

export const inmueble = defineRubro({
  id: "inmueble",
  nombre: { singular: "Propiedad", plural: "Propiedades" },
  ruta: "propiedades",
  genero: "f",
  operaciones,
  tipos,
  moneda: (op) => (op === "alquiler" ? "ARS" : "USD"),
  usaZona: true,
  zonas: ZONAS_OLAVARRIA,
  usaMapa: true,
  campos: [
    { tipo: "entero", clave: "ambientes", etiqueta: "Ambientes", min: 1, max: 20, filtro: "minimo", destacado: true, opcional: true, formato: "simple" },
    { tipo: "entero", clave: "dormitorios", etiqueta: "Dormitorios", min: 0, max: 15, filtro: "minimo", destacado: true, opcional: true, formato: "simple" },
    { tipo: "entero", clave: "banos", etiqueta: "Baños", min: 0, max: 10, opcional: true, formato: "simple" },
    { tipo: "decimal", clave: "m2Cubiertos", etiqueta: "Superficie cubierta", min: 0, max: 100_000, sufijo: "m²", destacado: true, opcional: true },
    { tipo: "decimal", clave: "m2Totales", etiqueta: "Superficie total", min: 1, max: 100_000_000, sufijo: "m²", filtro: "minimo" },
    { tipo: "entero", clave: "antiguedad", etiqueta: "Antigüedad", min: 0, max: 200, sufijo: "años", opcional: true, formato: "simple" },
    { tipo: "booleano", clave: "cochera", etiqueta: "Cochera", filtro: "si" },
    { tipo: "booleano", clave: "patio", etiqueta: "Patio o jardín", filtro: "si" },
    { tipo: "booleano", clave: "aptoCredito", etiqueta: "Apto crédito", filtro: "si" },
    { tipo: "booleano", clave: "mascotas", etiqueta: "Acepta mascotas", ayuda: "Solo para alquileres" },
  ],
  tituloSugerido: (tipo, a, op) => {
    const t = etiquetaDe(tipos, tipo);
    const n = Number(a.ambientes);
    const amb = !n ? "" : n === 1 ? " monoambiente" : ` de ${n} ambientes`;
    return `${t}${amb} en ${op === "alquiler" ? "alquiler" : "venta"}`;
  },
  ordenes: [
    { valor: "recientes", etiqueta: "Recién publicadas" },
    { valor: "precio-asc", etiqueta: "Menor precio" },
    { valor: "precio-desc", etiqueta: "Mayor precio" },
    { valor: "m2-desc", etiqueta: "Más metros" },
  ],
});
