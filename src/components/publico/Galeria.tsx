"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FotoVista } from "@/server/lecturas";
import { Icono } from "./Icono";

/**
 * Galería de la ficha: deslizar con el dedo, flechas, teclado (← →), miniaturas y pantalla completa.
 * Funciona con cualquier cantidad de fotos.
 */
export function Galeria({ fotos, titulo }: { fotos: FotoVista[]; titulo: string }) {
  const [refPrincipal, principal] = useEmblaCarousel({ loop: false, align: "start" });
  const [refMinis, minis] = useEmblaCarousel({ containScroll: "keepSnaps", dragFree: true });
  const [refGrande, grande] = useEmblaCarousel({ loop: false });
  const [actual, setActual] = useState(0);
  const dialogo = useRef<HTMLDialogElement>(null);

  const ir = useCallback((i: number) => { principal?.scrollTo(i); grande?.scrollTo(i, true); }, [principal, grande]);

  useEffect(() => {
    if (!principal) return;
    const alSeleccionar = () => {
      const i = principal.selectedScrollSnap();
      setActual(i);
      minis?.scrollTo(i);
    };
    principal.on("select", alSeleccionar).on("reInit", alSeleccionar);
    return () => { principal.off("select", alSeleccionar); };
  }, [principal, minis]);

  useEffect(() => {
    if (!grande) return;
    const alSeleccionar = () => { const i = grande.selectedScrollSnap(); setActual(i); principal?.scrollTo(i, true); };
    grande.on("select", alSeleccionar);
    return () => { grande.off("select", alSeleccionar); };
  }, [grande, principal]);

  const teclado = (e: React.KeyboardEvent, api = principal) => {
    if (e.key === "ArrowRight") { e.preventDefault(); api?.scrollNext(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); api?.scrollPrev(); }
  };

  const abrir = () => {
    dialogo.current?.showModal();
    requestAnimationFrame(() => { grande?.reInit(); grande?.scrollTo(actual, true); });
  };

  if (!fotos.length) {
    return <div className="grid aspect-[4/3] place-items-center rounded-xl bg-arena text-cemento"><Icono nombre="foto" className="size-12" /></div>;
  }

  const total = fotos.length;

  return (
    <div>
      <section aria-roledescription="carrusel" aria-label={`Fotos de ${titulo}`} className="relative" onKeyDown={(e) => teclado(e)}>
        <div ref={refPrincipal} className="overflow-hidden rounded-xl bg-arena" tabIndex={0} aria-label="Usá las flechas del teclado para pasar de foto">
          <div className="flex touch-pan-y">
            {fotos.map((f, i) => (
              <div key={f.id} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="foto" aria-label={`${i + 1} de ${total}`}>
                <img
                  src={f.url}
                  srcSet={`${f.miniatura} 640w, ${f.url} 1600w`}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  width={f.ancho}
                  height={f.alto}
                  alt={f.alt || titulo}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  draggable={false}
                  style={{ backgroundImage: `url(${f.blur})`, backgroundSize: "cover" }}
                  className="aspect-[4/3] w-full object-cover select-none"
                />
              </div>
            ))}
          </div>
        </div>

        {total > 1 && (
          <>
            <button type="button" onClick={() => principal?.scrollPrev()} disabled={actual === 0} aria-label="Foto anterior"
              className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-hoja/90 shadow transition-opacity disabled:opacity-0">
              <Icono nombre="flecha-izq" />
            </button>
            <button type="button" onClick={() => principal?.scrollNext()} disabled={actual === total - 1} aria-label="Foto siguiente"
              className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-hoja/90 shadow transition-opacity disabled:opacity-0">
              <Icono nombre="flecha-der" />
            </button>
          </>
        )}
        <p className="absolute bottom-3 left-3 rounded bg-carbon/80 px-2.5 py-1 text-sm font-medium text-hoja tabular" aria-live="polite">
          {actual + 1} / {total}
        </p>
        <button type="button" onClick={abrir} className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded bg-carbon/80 px-2.5 py-1 text-sm font-medium text-hoja">
          <Icono nombre="ampliar" className="size-4" />Ver grande
        </button>
      </section>

      {total > 1 && (
        <div ref={refMinis} className="mt-2 overflow-hidden p-1">
          <div className="flex gap-2">
            {fotos.map((f, i) => (
              <button key={f.id} type="button" onClick={() => ir(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === actual}
                className={`relative min-w-0 flex-[0_0_22%] overflow-hidden rounded-md sm:flex-[0_0_15%] ${i === actual ? "ring-2 ring-carbon ring-offset-2 ring-offset-piedra" : "opacity-70 hover:opacity-100"}`}>
                <img src={f.miniatura} alt="" width={160} height={120} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <dialog ref={dialogo} aria-label={`Fotos de ${titulo} en pantalla completa`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#141311] p-0 text-hoja backdrop:bg-black/80"
        onKeyDown={(e) => teclado(e, grande)} onClick={(e) => { if (e.target === dialogo.current) dialogo.current?.close(); }}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm tabular">{actual + 1} / {total}</p>
            <button type="button" onClick={() => dialogo.current?.close()} className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Cerrar">
              <Icono nombre="cerrar" />
            </button>
          </div>
          <div ref={refGrande} className="min-h-0 flex-1 overflow-hidden">
            <div className="flex h-full touch-pan-y">
              {fotos.map((f) => (
                <div key={f.id} className="flex min-w-0 flex-[0_0_100%] items-center justify-center px-2">
                  <img src={f.url} alt={f.alt || titulo} loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-3 py-4">
            <button type="button" onClick={() => grande?.scrollPrev()} className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Foto anterior"><Icono nombre="flecha-izq" /></button>
            <button type="button" onClick={() => grande?.scrollNext()} className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Foto siguiente"><Icono nombre="flecha-der" /></button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
