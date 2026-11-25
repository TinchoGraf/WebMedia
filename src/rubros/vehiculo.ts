import { defineRubro } from "./define-rubro";

export const MARCAS = [
  "Chevrolet", "Citroën", "Fiat", "Ford", "Honda", "Jeep", "Nissan", "Peugeot", "Renault", "Toyota", "Volkswagen",
];

export const vehiculo = defineRubro({
  id: "vehiculo",
  nombre: { singular: "Vehículo", plural: "Vehículos" },
  ruta: "autos",
  genero: "m",
  operaciones: [{ valor: "venta", etiqueta: "Venta" }],
  tipos: [
    { valor: "auto", etiqueta: "Auto" },
    { valor: "camioneta", etiqueta: "Camioneta" },
    { valor: "suv", etiqueta: "SUV" },
    { valor: "utilitario", etiqueta: "Utilitario" },
  ],
  moneda: () => "ARS",
  usaZona: false,
  usaMapa: false,
  campos: [
    { tipo: "texto", clave: "marca", etiqueta: "Marca", max: 30, filtro: "igual", sugerencias: MARCAS },
    { tipo: "texto", clave: "modelo", etiqueta: "Modelo", max: 40 },
    { tipo: "texto", clave: "version", etiqueta: "Versión", max: 60, opcional: true, ayuda: "Ej.: 1.6 Highline MSI" },
    { tipo: "entero", clave: "anio", etiqueta: "Año", min: 1970, max: 2027, filtro: "rango", destacado: true, formato: "simple" },
    { tipo: "entero", clave: "km", etiqueta: "Kilómetros", min: 0, max: 1_500_000, sufijo: "km", filtro: "rango", destacado: true },
    {
      tipo: "opcion", clave: "combustible", etiqueta: "Combustible", filtro: "igual", destacado: true,
      opciones: [
        { valor: "nafta", etiqueta: "Nafta" }, { valor: "diesel", etiqueta: "Diésel" }, { valor: "gnc", etiqueta: "Nafta y GNC" },
        { valor: "hibrido", etiqueta: "Híbrido" }, { valor: "electrico", etiqueta: "Eléctrico" },
      ],
    },
    {
      tipo: "opcion", clave: "transmision", etiqueta: "Caja", filtro: "igual", destacado: true,
      opciones: [{ valor: "manual", etiqueta: "Manual" }, { valor: "automatica", etiqueta: "Automática" }],
    },
    { tipo: "texto", clave: "color", etiqueta: "Color", max: 30 },
    { tipo: "entero", clave: "puertas", etiqueta: "Puertas", min: 2, max: 5, opcional: true, formato: "simple" },
    { tipo: "booleano", clave: "unicoDueno", etiqueta: "Único dueño", filtro: "si" },
    { tipo: "booleano", clave: "aceptaPermuta", etiqueta: "Acepta permuta", filtro: "si" },
    { tipo: "booleano", clave: "financiacion", etiqueta: "Con financiación", filtro: "si" },
  ],
  tituloSugerido: (_tipo, a) => [a.marca, a.modelo].filter(Boolean).join(" "),
  ordenes: [
    { valor: "recientes", etiqueta: "Recién publicados" },
    { valor: "precio-asc", etiqueta: "Menor precio" },
    { valor: "precio-desc", etiqueta: "Mayor precio" },
    { valor: "km-asc", etiqueta: "Menos kilómetros" },
    { valor: "anio-desc", etiqueta: "Más nuevos" },
  ],
});
