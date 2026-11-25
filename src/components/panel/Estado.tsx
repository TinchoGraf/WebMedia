const ESTILOS: Record<string, { texto: string; clase: string }> = {
  borrador: { texto: "Borrador", clase: "bg-arena text-cemento" },
  publicada: { texto: "Publicada", clase: "bg-[#E2ECE5] text-verde" },
  reservada: { texto: "Reservada", clase: "bg-[#F3E5D6] text-ocre" },
  cerrada: { texto: "Vendida / cerrada", clase: "bg-carbon text-hoja" },
  nueva: { texto: "Nueva", clase: "bg-[#F3E5D6] text-ocre" },
  respondida: { texto: "Respondida", clase: "bg-[#E2ECE5] text-verde" },
};
export function Estado({ valor, de = "publicacion" }: { valor: string; de?: "publicacion" | "consulta" }) {
  const e = de === "consulta" && valor === "cerrada" ? { texto: "Cerrada", clase: "bg-arena text-cemento" } : (ESTILOS[valor] ?? { texto: valor, clase: "bg-arena" });
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${e.clase}`}>{e.texto}</span>;
}
