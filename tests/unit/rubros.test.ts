import { describe, expect, it } from "vitest";
import { esquemaAtributos, formatearAtributo, numeroAr, rubro } from "../../src/rubros";

const auto = rubro("vehiculo");
const casa = rubro("inmueble");
const autoValido = { marca: "Toyota", modelo: "Hilux", anio: "2019", km: "140.000", combustible: "diesel", transmision: "automatica", color: "Gris" };

describe("numeroAr (formato argentino)", () => {
  it.each([
    ["98.000", 98000], ["95,5", 95.5], ["1.250,75", 1250.75], ["95.5", 95.5], ["2019", 2019], [" 1 500 ", 1500],
  ])("%s → %s", (entrada, salida) => expect(numeroAr(entrada)).toBe(salida));
  it("vacío → undefined (así funciona 'requerido')", () => expect(numeroAr("  ")).toBeUndefined());
});

describe("esquema de atributos del rubro", () => {
  it("acepta un auto válido y convierte números y booleanos", () => {
    const r = esquemaAtributos(auto).parse({ ...autoValido, unicoDueno: "true" });
    expect(r).toMatchObject({ anio: 2019, km: 140000, unicoDueno: true, aceptaPermuta: false });
  });
  it("rechaza año fuera de rango y km negativo con mensajes en castellano", () => {
    const r = esquemaAtributos(auto).safeParse({ ...autoValido, anio: "1890", km: "-5" });
    expect(r.success).toBe(false);
    const msgs = r.error!.issues.map((i) => i.message).join(" | ");
    expect(msgs).toContain("Año: mínimo 1970");
    expect(msgs).toContain("Kilómetros: mínimo 0");
  });
  it("rechaza opciones que no están en la lista (ej. combustible inventado)", () => {
    expect(esquemaAtributos(auto).safeParse({ ...autoValido, combustible: "nafta'; DROP TABLE" }).success).toBe(false);
  });
  it("rechaza campos que no existen en el rubro (strict)", () => {
    expect(esquemaAtributos(auto).safeParse({ ...autoValido, isAdmin: true }).success).toBe(false);
  });
  it("marca y modelo son obligatorios", () => {
    const r = esquemaAtributos(auto).safeParse({ ...autoValido, marca: "" });
    expect(r.error!.issues[0].path).toEqual(["marca"]);
  });
  it("en inmuebles los opcionales pueden venir vacíos", () => {
    const r = esquemaAtributos(casa).parse({ m2Totales: "300", ambientes: "", dormitorios: "" });
    expect(r.m2Totales).toBe(300);
    expect(r.ambientes).toBeUndefined();
  });
});

describe("títulos sugeridos y formato", () => {
  it("auto: marca y modelo", () => expect(auto.tituloSugerido("auto", { marca: "Fiat", modelo: "Cronos" }, null)).toBe("Fiat Cronos"));
  it("inmueble: monoambiente y plural", () => {
    expect(casa.tituloSugerido("departamento", { ambientes: 1 }, "alquiler")).toBe("Departamento monoambiente en alquiler");
    expect(casa.tituloSugerido("casa", { ambientes: 3 }, "venta")).toBe("Casa de 3 ambientes en venta");
  });
  it("formatea km con separador de miles y año sin separador", () => {
    const km = auto.campos.find((c) => c.clave === "km")!;
    const anio = auto.campos.find((c) => c.clave === "anio")!;
    expect(formatearAtributo(km, 140000)).toBe("140.000 km");
    expect(formatearAtributo(anio, 2019)).toBe("2019");
  });
  it("moneda por operación", () => {
    expect(casa.moneda("venta")).toBe("USD");
    expect(casa.moneda("alquiler")).toBe("ARS");
  });
});
