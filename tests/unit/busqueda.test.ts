import { describe, expect, it } from "vitest";
import { filtrosAParams, parsearFiltros } from "../../src/lib/busqueda";
import { rubro } from "../../src/rubros";

const auto = rubro("vehiculo");
const casa = rubro("inmueble");

describe("parsearFiltros", () => {
  it("toma filtros válidos de la URL", () => {
    const f = parsearFiltros({ tipo: "camioneta", marca: "Toyota", anio_min: "2018", km_max: "150.000", financiacion: "1", orden: "precio-asc", pagina: "2" }, auto);
    expect(f).toMatchObject({ tipo: "camioneta", orden: "precio-asc", pagina: 2 });
    expect(f.atributos).toEqual([
      { clave: "marca", modo: "igual", valor: "Toyota" },
      { clave: "anio", modo: "rango", min: 2018, max: undefined },
      { clave: "km", modo: "rango", min: undefined, max: 150000 },
      { clave: "financiacion", modo: "si" },
    ]);
  });
  it("descarta en silencio lo que no está en la lista blanca", () => {
    const f = parsearFiltros({ tipo: "tanque", combustible: "plutonio", orden: "DROP TABLE", pagina: "-3", zona: "Centro", "estado": "borrador", anio_min: "abc" }, auto);
    expect(f.tipo).toBeUndefined();
    expect(f.atributos).toEqual([]);
    expect(f.orden).toBe("recientes");
    expect(f.pagina).toBe(1);
    expect(f.zona).toBeUndefined(); // autos no usa zona
  });
  it("valores fuera de rango no se usan", () => {
    expect(parsearFiltros({ anio_min: "1800" }, auto).atributos).toEqual([]);
  });
  it("búsqueda de texto recortada a 60 caracteres", () => {
    expect(parsearFiltros({ q: "x".repeat(500) }, auto).q).toHaveLength(60);
  });
  it("inmuebles: zona solo si está en la lista", () => {
    expect(parsearFiltros({ zona: "Centro" }, casa).zona).toBe("Centro");
    expect(parsearFiltros({ zona: "Palermo" }, casa).zona).toBeUndefined();
    expect(parsearFiltros({ ambientes: "3" }, casa).atributos).toEqual([{ clave: "ambientes", modo: "minimo", min: 3 }]);
  });
});

describe("filtrosAParams", () => {
  it("ida y vuelta da los mismos filtros", () => {
    const f = parsearFiltros({ tipo: "auto", marca: "Fiat", km_max: "50000", aceptaPermuta: "1", orden: "km-asc" }, auto);
    const qs = filtrosAParams(f);
    const f2 = parsearFiltros(Object.fromEntries(new URLSearchParams(qs.slice(1))), auto);
    expect(f2).toEqual(f);
  });
  it("quitar un filtro y cambiar de página", () => {
    const f = parsearFiltros({ tipo: "auto", marca: "Fiat" }, auto);
    expect(filtrosAParams(f, { marca: undefined })).toBe("?tipo=auto&orden=recientes");
    expect(filtrosAParams(f, { pagina: "2" })).toContain("pagina=2");
  });
});
