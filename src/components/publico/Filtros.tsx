import type { DefinicionRubro } from "@/rubros";
import type { Filtros as TFiltros } from "@/lib/busqueda";
import { AutoEnviar } from "./AutoEnviar";

type Props = { r: DefinicionRubro; f: TFiltros; valores: Record<string, string[]>; id: string };

const valorAttr = (f: TFiltros, clave: string) => f.atributos.find((a) => a.clave === clave);

export function Filtros({ r, f, valores, id }: Props) {
  const moneda = r.moneda(f.operacion ?? null) === "USD" ? "US$" : "$";
  return (
    <form id={id} action={`/${r.ruta}`} method="get" className="grid gap-5">
      <AutoEnviar formId={id} />
      <input type="hidden" name="orden" value={f.orden} />
      <div>
        <label className="etiqueta" htmlFor={`${id}-q`}>Buscar</label>
        <input id={`${id}-q`} name="q" defaultValue={f.q} maxLength={60} placeholder={r.id === "vehiculo" ? "Ej.: Hilux, 208" : "Ej.: quincho, esquina"} className="campo" />
      </div>
      {r.operaciones.length > 1 && (
        <div>
          <label className="etiqueta" htmlFor={`${id}-operacion`}>Operación</label>
          <select id={`${id}-operacion`} name="operacion" className="campo" defaultValue={f.operacion ?? ""}>
            <option value="">Todas</option>
            {r.operaciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="etiqueta" htmlFor={`${id}-tipo`}>Tipo</label>
        <select id={`${id}-tipo`} name="tipo" className="campo" defaultValue={f.tipo ?? ""}>
          <option value="">Todos</option>
          {r.tipos.map((t) => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
        </select>
      </div>
      {r.usaZona && (
        <div>
          <label className="etiqueta" htmlFor={`${id}-zona`}>Zona</label>
          <select id={`${id}-zona`} name="zona" className="campo" defaultValue={f.zona ?? ""}>
            <option value="">Todas</option>
            {r.zonas?.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      )}
      <fieldset>
        <legend className="etiqueta">Precio ({moneda})</legend>
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Precio desde" name="precio_min" inputMode="numeric" pattern="[0-9.]*" placeholder="Desde" defaultValue={f.precioMin} className="campo tabular" />
          <input aria-label="Precio hasta" name="precio_max" inputMode="numeric" pattern="[0-9.]*" placeholder="Hasta" defaultValue={f.precioMax} className="campo tabular" />
        </div>
      </fieldset>

      {r.campos.map((c) => {
        if (!("filtro" in c) || !c.filtro) return null;
        const actual = valorAttr(f, c.clave);
        if (c.filtro === "igual") {
          const opciones = c.tipo === "opcion" ? c.opciones : (valores[c.clave] ?? []).map((v) => ({ valor: v, etiqueta: v }));
          if (!opciones.length) return null;
          return (
            <div key={c.clave}>
              <label className="etiqueta" htmlFor={`${id}-${c.clave}`}>{c.etiqueta}</label>
              <select id={`${id}-${c.clave}`} name={c.clave} className="campo" defaultValue={actual?.modo === "igual" ? actual.valor : ""}>
                <option value="">{c.tipo === "texto" ? "Todas" : "Cualquiera"}</option>
                {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              </select>
            </div>
          );
        }
        if (c.filtro === "rango") {
          const a = actual?.modo === "rango" ? actual : undefined;
          return (
            <fieldset key={c.clave}>
              <legend className="etiqueta">{c.etiqueta}{"sufijo" in c && c.sufijo ? ` (${c.sufijo})` : ""}</legend>
              <div className="grid grid-cols-2 gap-2">
                <input aria-label={`${c.etiqueta} desde`} name={`${c.clave}_min`} inputMode="numeric" placeholder="Desde" defaultValue={a?.min} className="campo tabular" />
                <input aria-label={`${c.etiqueta} hasta`} name={`${c.clave}_max`} inputMode="numeric" placeholder="Hasta" defaultValue={a?.max} className="campo tabular" />
              </div>
            </fieldset>
          );
        }
        if (c.filtro === "minimo") {
          const a = actual?.modo === "minimo" ? actual.min : "";
          return (
            <div key={c.clave}>
              <label className="etiqueta" htmlFor={`${id}-${c.clave}`}>{c.etiqueta}</label>
              <select id={`${id}-${c.clave}`} name={c.clave} className="campo" defaultValue={String(a)}>
                <option value="">Cualquier cantidad</option>
                {(c.clave.startsWith("m2") ? [100, 200, 300, 500, 1000] : [1, 2, 3, 4]).map((n) => (
                  <option key={n} value={n}>{c.clave.startsWith("m2") ? `${n} m² o más` : `${n} o más`}</option>
                ))}
              </select>
            </div>
          );
        }
        return (
          <label key={c.clave} className="flex cursor-pointer items-center gap-2.5 text-[0.95rem]">
            <input type="checkbox" name={c.clave} value="1" defaultChecked={actual?.modo === "si"} className="size-[1.1rem] accent-[var(--color-ocre)]" />
            {c.etiqueta}
          </label>
        );
      })}
      <button className="boton boton-oscuro">Aplicar filtros</button>
    </form>
  );
}
