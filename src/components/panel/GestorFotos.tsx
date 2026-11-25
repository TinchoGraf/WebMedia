"use client";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { borrarFoto, ordenarFotos, portada, subirFoto, textoAlternativo } from "@/app/acciones/panel";
import { achicarFoto } from "@/lib/cliente/imagen";
import type { FotoVista } from "@/server/lecturas";

const posicion = (id: unknown, ids: string[]) => ids.indexOf(String(id)) + 1;
let idsActuales: string[] = [];
const anuncios = {
  onDragStart: ({ active }: { active: { id: unknown } }) => `Agarraste la foto ${posicion(active.id, idsActuales)}.`,
  onDragOver: ({ over }: { over: { id: unknown } | null }) => (over ? `Lugar ${posicion(over.id, idsActuales)} de ${idsActuales.length}.` : "Fuera de la lista."),
  onDragEnd: ({ over }: { over: { id: unknown } | null }) => (over ? `Foto ubicada en el lugar ${posicion(over.id, idsActuales)}.` : "Movimiento cancelado."),
  onDragCancel: () => "Movimiento cancelado.",
};

type Subida = { nombre: string; estado: "esperando" | "subiendo" | "lista" | "error"; error?: string };

export function GestorFotos({ publicacionId, fotos: iniciales, max }: { publicacionId: string; fotos: FotoVista[]; max: number }) {
  const router = useRouter();
  const [fotos, setFotos] = useState(iniciales);
  const [subidas, setSubidas] = useState<Subida[]>([]);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => setFotos(iniciales), [iniciales]);
  idsActuales = fotos.map((f) => f.id);

  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  async function subir(lista: FileList | File[]) {
    const archivos = Array.from(lista).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!archivos.length) return setAviso({ ok: false, texto: "Elegí archivos de imagen (JPG, PNG o WebP)." });
    const lugar = max - fotos.length;
    if (lugar <= 0) return setAviso({ ok: false, texto: `Ya tiene ${max} fotos, que es el máximo.` });
    const tanda = archivos.slice(0, lugar);
    setAviso(null);
    setSubidas(tanda.map((f) => ({ nombre: f.name, estado: "esperando" })));
    let errores = 0;
    // De a una: muestra progreso y evita pasarse del límite de tamaño por pedido
    for (const [i, f] of tanda.entries()) {
      setSubidas((s) => s.map((x, k) => (k === i ? { ...x, estado: "subiendo" } : x)));
      const datos = new FormData();
      datos.append("archivo", await achicarFoto(f), f.name.replace(/\.[^.]+$/, ".jpg"));
      const r = await subirFoto(publicacionId, datos);
      if (!r.ok) errores++;
      setSubidas((s) => s.map((x, k) => (k === i ? { ...x, estado: r.ok ? "lista" : "error", error: r.ok ? undefined : r.error } : x)));
    }
    router.refresh();
    setAviso(errores ? { ok: false, texto: `${errores} ${errores === 1 ? "foto no se pudo subir" : "fotos no se pudieron subir"}. Mirá el detalle abajo.` } : { ok: true, texto: tanda.length === 1 ? "Foto subida." : `${tanda.length} fotos subidas.` });
    if (!errores) setTimeout(() => setSubidas([]), 1500);
    if (archivos.length > lugar) setAviso({ ok: false, texto: `Se subieron ${lugar}: el máximo es ${max} fotos por publicación.` });
  }

  function alSoltar(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const de = fotos.findIndex((f) => f.id === active.id);
    const a = fotos.findIndex((f) => f.id === over.id);
    const nuevas = arrayMove(fotos, de, a);
    setFotos(nuevas);
    start(async () => {
      const r = await ordenarFotos(publicacionId, nuevas.map((f) => f.id));
      if (!r.ok) { setAviso({ ok: false, texto: r.error }); setFotos(fotos); }
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="t-fotos" className="rounded-xl bg-hoja p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="t-fotos" className="text-base font-semibold">Fotos <span className="font-normal text-cemento tabular">({fotos.length} de {max})</span></h2>
        <p className="text-sm text-cemento">Arrastralas para ordenarlas. La primera es la portada.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); if (e.dataTransfer.files.length) subir(e.dataTransfer.files); }}
        className={`mt-4 grid place-items-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${arrastrando ? "border-ocre bg-[#F3E5D6]" : "border-borde"}`}
      >
        <p className="font-medium">Arrastrá las fotos acá</p>
        <p className="mt-1 text-sm text-cemento">o</p>
        <button type="button" className="boton boton-oscuro mt-2" onClick={() => input.current?.click()}>Elegir fotos</button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic" multiple className="sr-only" aria-label="Elegir fotos para subir"
          onChange={(e) => { if (e.target.files) subir(e.target.files); e.target.value = ""; }} />
        <p className="ayuda">JPG, PNG o WebP, hasta 10 MB. Desde el celular podés sacarlas en el momento.</p>
      </div>

      {aviso && <p role={aviso.ok ? "status" : "alert"} className={`mt-4 rounded-lg px-3 py-2 text-sm font-medium ${aviso.ok ? "bg-[#E2ECE5] text-verde" : "bg-[#F6E3E0] text-alerta"}`}>{aviso.texto}</p>}

      {subidas.length > 0 && (
        <ul className="mt-3 grid gap-1 text-sm" aria-live="polite">
          {subidas.map((s, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="truncate">{s.nombre}</span>
              <span className={s.estado === "error" ? "text-alerta" : s.estado === "lista" ? "text-verde" : "text-cemento"}>
                {s.estado === "esperando" ? "En espera" : s.estado === "subiendo" ? "Subiendo…" : s.estado === "lista" ? "Lista" : s.error}
              </span>
            </li>
          ))}
        </ul>
      )}

      {fotos.length > 0 && (
        <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar} accessibility={{ announcements: anuncios, screenReaderInstructions: { draggable: "Para mover una foto, presioná espacio. Usá las flechas para elegir el lugar y espacio otra vez para soltarla. Escape cancela." } }}>
          <SortableContext items={fotos.map((f) => f.id)} strategy={rectSortingStrategy}>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {fotos.map((f, i) => (
                <FotoOrdenable key={f.id} foto={f} indice={i} publicacionId={publicacionId}
                  alAvisar={setAviso} alCambiar={() => router.refresh()} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function FotoOrdenable({ foto, indice, publicacionId, alAvisar, alCambiar }: {
  foto: FotoVista; indice: number; publicacionId: string; alAvisar: (a: { ok: boolean; texto: string }) => void; alCambiar: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: foto.id });
  const [pend, start] = useTransition();
  const [alt, setAlt] = useState(foto.alt);
  const [confirmando, setConfirmando] = useState(false);
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative rounded-lg bg-piedra p-2 ${isDragging ? "z-10 shadow-xl ring-2 ring-ocre" : ""}`}>
      <button type="button" {...attributes} {...listeners} className="block w-full cursor-grab touch-none overflow-hidden rounded-md active:cursor-grabbing" aria-label={`Foto ${indice + 1}. Arrastrá o usá espacio y flechas para moverla`}>
        <img src={foto.miniatura} alt="" width={320} height={240} className="aspect-[4/3] w-full object-cover" draggable={false} />
      </button>
      {indice === 0 && <span className="absolute top-3 left-3 rounded bg-carbon px-2 py-0.5 text-xs font-semibold text-hoja">Portada</span>}
      <label className="sr-only" htmlFor={`alt-${foto.id}`}>Descripción de la foto {indice + 1}</label>
      <input id={`alt-${foto.id}`} value={alt} maxLength={150} onChange={(e) => setAlt(e.target.value)} placeholder="Qué se ve (para Google y lectores de pantalla)"
        onBlur={() => alt !== foto.alt && start(async () => { const r = await textoAlternativo(foto.id, alt); if (!r.ok) alAvisar({ ok: false, texto: r.error }); })}
        className="campo mt-2 min-h-9 py-1.5 text-xs" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {indice > 0 && (
          <button type="button" disabled={pend} className="rounded px-2 py-1 text-xs font-medium hover:bg-arena"
            onClick={() => start(async () => { const r = await portada(publicacionId, foto.id); if (!r.ok) alAvisar({ ok: false, texto: r.error }); alCambiar(); })}>
            Usar de portada
          </button>
        )}
        {confirmando ? (
          <span className="flex gap-1.5">
            <button type="button" disabled={pend} className="rounded bg-alerta px-2 py-1 text-xs font-semibold text-hoja"
              onClick={() => start(async () => { const r = await borrarFoto(foto.id); if (!r.ok) alAvisar({ ok: false, texto: r.error }); setConfirmando(false); alCambiar(); })}>
              Sí, borrar
            </button>
            <button type="button" className="rounded px-2 py-1 text-xs hover:bg-arena" onClick={() => setConfirmando(false)}>No</button>
          </span>
        ) : (
          <button type="button" className="rounded px-2 py-1 text-xs font-medium text-alerta hover:bg-[#F6E3E0]" onClick={() => setConfirmando(true)}>
            Borrar
          </button>
        )}
      </div>
    </li>
  );
}
