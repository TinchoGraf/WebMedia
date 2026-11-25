import { describe, expect, it } from "vitest";
import { aCentavos, formatoPrecio } from "../../src/lib/precios";
import { codigoPublicacion, slugify, slugPublicacion } from "../../src/lib/slug";
import { exigir, puede, type UsuarioSesion } from "../../src/lib/permisos";
import { formAObjeto } from "../../src/lib/formdata";
import { CLAVE_VALIDA } from "../../src/lib/storage";
import { ErrorPermiso, ErrorSesion } from "../../src/lib/errores";

const u = (rol: UsuarioSesion["rol"], activo = true): UsuarioSesion => ({ id: "x", name: "X", email: "x@x", rol, activo });

describe("precios", () => {
  it.each([["15500000", 1_550_000_000], ["15.500.000", 1_550_000_000], ["85.000,50", 8_500_050], ["$ 9.800.000", 980_000_000], ["", null]])(
    "aCentavos(%s) = %s", (e, s) => expect(aCentavos(e)).toBe(s));
  it("formatea pesos y dólares", () => {
    expect(formatoPrecio(1_550_000_000, "ARS")).toBe("$ 15.500.000");
    expect(formatoPrecio(6_800_000, "USD")).toBe("US$ 68.000");
    expect(formatoPrecio(null, "USD")).toBe("Consultar precio");
  });
});

describe("slugs y códigos", () => {
  it("saca tildes, símbolos y espacios", () => expect(slugify("Peugeot 208 1.6 Allure ¡Único dueño!")).toBe("peugeot-208-1-6-allure-unico-dueno"));
  it("el número hace único al slug", () => expect(slugPublicacion("Gol Trend", 42)).toBe("gol-trend-42"));
  it("título solo con símbolos no deja slug vacío", () => expect(slugPublicacion("¡¡¡", 7)).toBe("publicacion-7"));
  it("código con ceros", () => expect(codigoPublicacion("PA", 7)).toBe("PA-0007"));
});

describe("permisos por rol", () => {
  it("solo el dueño gestiona usuarios y ve la actividad", () => {
    expect(puede(u("dueno"), "usuarios:gestionar")).toBe(true);
    expect(puede(u("editor"), "usuarios:gestionar")).toBe(false);
    expect(puede(u("demo"), "actividad:ver")).toBe(false);
  });
  it("demo no puede borrar publicaciones", () => expect(puede(u("demo"), "publicaciones:borrar")).toBe(false));
  it("un usuario desactivado no puede nada", () => expect(puede(u("dueno", false), "publicaciones:ver")).toBe(false));
  it("sin sesión → ErrorSesion; sin permiso → ErrorPermiso", () => {
    expect(() => exigir(null, "publicaciones:ver")).toThrow(ErrorSesion);
    expect(() => exigir(u("editor"), "usuarios:gestionar")).toThrow(ErrorPermiso);
  });
});

describe("formAObjeto", () => {
  it("arma objetos anidados con atributos.x", () => {
    const f = new FormData();
    f.set("titulo", "Hola"); f.set("atributos.marca", "Fiat"); f.set("$ACTION_ID_abc", "x");
    expect(formAObjeto(f)).toEqual({ titulo: "Hola", atributos: { marca: "Fiat" } });
  });
  it("ignora intentos de contaminar el prototipo", () => {
    const f = new FormData();
    f.set("__proto__.admin", "true"); f.set("atributos.__proto__", "x"); f.set("a.b.c", "y");
    const o = formAObjeto(f);
    expect(({} as Record<string, unknown>).admin).toBeUndefined();
    expect(o).toEqual({});
  });
});

describe("claves de archivos", () => {
  it.each(["publicaciones/abc/123.webp", "a-b/c-d.webp"])("acepta %s", (c) => expect(CLAVE_VALIDA.test(c)).toBe(true));
  it.each(["../etc/passwd", "publicaciones/../../x.webp", "/abs.webp", "x.svg", "a\\b.webp", "A.WEBP"])("rechaza %s", (c) => expect(CLAVE_VALIDA.test(c)).toBe(false));
});
