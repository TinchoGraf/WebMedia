"use client";
import { useActionState, useMemo, useState } from "react";
import type { Resultado } from "@/lib/errores";
import { rubro as obtenerRubro, type Campo } from "@/rubros";

export type ValoresIniciales = {
  titulo?: string; descripcion?: string; operacion?: string | null; tipo?: string; precio?: string; moneda?: string;
  expensas?: string; zona?: string | null; direccion?: string | null; destacada?: boolean; atributos?: Record<string, unknown>;
};

type Props = {
  rubroId: string;
  accion: (prev: Resultado | null, form: FormData) => Promise<Resultado>;
  inicial?: ValoresIniciales;
  textoBoton: string;
  puedeDestacar: boolean;
};

/** El formulario se arma solo a partir de la definición del rubro (src/rubros). */
export function FormPublicacion({ rubroId, accion, inicial = {}, textoBoton, puedeDestacar }: Props) {
  const r = obtenerRubro(rubroId);
  const [estado, enviar, enviando] = useActionState<Resultado | null, FormData>(accion, null);
  const err = (k: string) => (estado && !estado.ok ? estado.campos?.[k] : undefined);
  const [operacion, setOperacion] = useState(inicial.operacion ?? r.operaciones[0].valor);
  const [tipo, setTipo] = useState(inicial.tipo ?? r.tipos[0].valor);
  const [attrs, setAttrs] = useState<Record<string, unknown>>(inicial.atributos ?? {});
  const [desc, setDesc] = useState(inicial.descripcion ?? "");
  const sugerido = useMemo(() => r.tituloSugerido(tipo, attrs, operacion), [r, tipo, attrs, operacion]);

  const campoInput = (c: Campo) => {
    const nombre = `atributos.${c.clave}`;
    const valor = attrs[c.clave];
    const comun = {
      id: `a-${c.clave}`, name: nombre, "aria-invalid": !!err(nombre), "aria-describedby": err(nombre) ? `e-${c.clave}` : c.ayuda ? `h-${c.clave}` : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setAttrs((a) => ({ ...a, [c.clave]: e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value })),
    };
    if (c.tipo === "booleano") {
      return (
        <label key={c.clave} className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-piedra px-3 py-2.5">
          <input type="checkbox" {...comun} value="true" defaultChecked={!!valor} className="size-[1.1rem] accent-[var(--color-ocre)]" />
          <span className="text-sm font-medium">{c.etiqueta}</span>
        </label>
      );
    }
    return (
      <div key={c.clave}>
        <label className="etiqueta" htmlFor={comun.id}>{c.etiqueta}{c.opcional && <span className="font-normal text-cemento"> (opcional)</span>}</label>
        {c.tipo === "opcion" ? (
          <select {...comun} className="campo" defaultValue={String(valor ?? "")}>
            <option value="">Elegí…</option>
            {c.opciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </select>
        ) : c.tipo === "texto" ? (
          <>
            <input {...comun} className="campo" maxLength={c.max} defaultValue={String(valor ?? "")} list={c.sugerencias ? `l-${c.clave}` : undefined} autoComplete="off" />
            {c.sugerencias && <datalist id={`l-${c.clave}`}>{c.sugerencias.map((s) => <option key={s} value={s} />)}</datalist>}
          </>
        ) : (
          <div className="relative">
            <input {...comun} className="campo tabular" inputMode={c.tipo === "decimal" ? "decimal" : "numeric"} defaultValue={valor === undefined || valor === null ? "" : String(valor)} />
            {"sufijo" in c && c.sufijo && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-cemento">{c.sufijo}</span>}
          </div>
        )}
        {c.ayuda && !err(nombre) && <p id={`h-${c.clave}`} className="ayuda">{c.ayuda}</p>}
        {err(nombre) && <p id={`e-${c.clave}`} className="error-campo">{err(nombre)}</p>}
      </div>
    );
  };

  const textos = r.campos.filter((c) => c.tipo !== "booleano");
  const sinoes = r.campos.filter((c) => c.tipo === "booleano");
  const monedaDefecto = inicial.moneda ?? r.moneda(operacion);

  return (
    <form action={enviar} className="grid gap-8" noValidate>
      {estado && !estado.ok && <p role="alert" className="rounded-lg bg-[#F6E3E0] px-4 py-3 text-sm font-medium text-alerta">{estado.error}</p>}
      {estado?.ok && estado.mensaje && <p role="status" className="rounded-lg bg-[#E2ECE5] px-4 py-3 text-sm font-medium text-verde">{estado.mensaje}</p>}

      <fieldset className="grid gap-4 rounded-xl bg-hoja p-5 md:p-6">
        <legend className="float-left mb-1 w-full text-base font-semibold">Qué es</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {r.operaciones.length > 1 && (
            <div>
              <label className="etiqueta" htmlFor="operacion">Operación</label>
              <select id="operacion" name="operacion" className="campo" value={operacion} onChange={(e) => setOperacion(e.target.value)}>
                {r.operaciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="etiqueta" htmlFor="tipo">Tipo</label>
            <select id="tipo" name="tipo" className="campo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {r.tipos.map((t) => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="etiqueta" htmlFor="titulo">Título <span className="font-normal text-cemento">(si lo dejás vacío usamos el sugerido)</span></label>
          <input id="titulo" name="titulo" maxLength={120} defaultValue={inicial.titulo} placeholder={sugerido || "Ej.: Casa de 3 ambientes con patio"} className="campo" aria-invalid={!!err("titulo")} />
          {err("titulo") && <p className="error-campo">{err("titulo")}</p>}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-xl bg-hoja p-5 md:p-6">
        <legend className="float-left mb-1 w-full text-base font-semibold">Datos {r.genero === "m" ? "del" : "de la"} {r.nombre.singular.toLowerCase()}</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{textos.map(campoInput)}</div>
        {sinoes.length > 0 && <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{sinoes.map(campoInput)}</div>}
      </fieldset>

      <fieldset className="grid gap-4 rounded-xl bg-hoja p-5 md:p-6">
        <legend className="float-left mb-1 w-full text-base font-semibold">Precio</legend>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem] lg:grid-cols-[1fr_9rem_1fr]">
          <div>
            <label className="etiqueta" htmlFor="precio">Precio <span className="font-normal text-cemento">(vacío = &quot;Consultar precio&quot;)</span></label>
            <input id="precio" name="precio" inputMode="numeric" defaultValue={inicial.precio} placeholder="Ej.: 15500000" className="campo tabular" aria-invalid={!!err("precio")} />
            {err("precio") && <p className="error-campo">{err("precio")}</p>}
          </div>
          <div>
            <label className="etiqueta" htmlFor="moneda">Moneda</label>
            <select key={monedaDefecto} id="moneda" name="moneda" className="campo" defaultValue={monedaDefecto}>
              <option value="ARS">Pesos</option><option value="USD">Dólares</option>
            </select>
          </div>
          {r.usaZona && (
            <div>
              <label className="etiqueta" htmlFor="expensas">Expensas <span className="font-normal text-cemento">(opcional, en pesos)</span></label>
              <input id="expensas" name="expensas" inputMode="numeric" defaultValue={inicial.expensas} className="campo tabular" />
            </div>
          )}
        </div>
      </fieldset>

      {r.usaZona && (
        <fieldset className="grid gap-4 rounded-xl bg-hoja p-5 md:p-6">
          <legend className="float-left mb-1 w-full text-base font-semibold">Ubicación</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="zona">Zona o barrio</label>
              <select id="zona" name="zona" className="campo" defaultValue={inicial.zona ?? ""} aria-invalid={!!err("zona")}>
                <option value="">Elegí…</option>
                {r.zonas?.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
              {err("zona") && <p className="error-campo">{err("zona")}</p>}
            </div>
            <div>
              <label className="etiqueta" htmlFor="direccion">Dirección exacta <span className="font-normal text-cemento">(no se publica)</span></label>
              <input id="direccion" name="direccion" maxLength={200} defaultValue={inicial.direccion ?? ""} className="campo" />
              <p className="ayuda">Solo la ven los usuarios del panel. En el sitio se muestra la zona.</p>
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="grid gap-2 rounded-xl bg-hoja p-5 md:p-6">
        <legend className="float-left mb-1 w-full text-base font-semibold">Descripción</legend>
        <label className="sr-only" htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={6} maxLength={5000} value={desc} onChange={(e) => setDesc(e.target.value)} className="campo" placeholder="Contá lo que una persona querría saber antes de llamar." />
        <p className="ayuda text-right tabular">{desc.length} / 5000</p>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {puedeDestacar ? (
          <label className="flex items-center gap-2.5 text-sm font-medium">
            <input type="checkbox" name="destacada" value="true" defaultChecked={inicial.destacada} className="size-[1.1rem] accent-[var(--color-ocre)]" />
            Destacar en la página de inicio
          </label>
        ) : <span />}
        <button className="boton boton-principal" disabled={enviando}>{enviando ? "Guardando…" : textoBoton}</button>
      </div>
    </form>
  );
}
