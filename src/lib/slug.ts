export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

/** El número asegura que el slug sea único aunque haya dos "Gol Trend 2015" */
export const slugPublicacion = (titulo: string, numero: number) => `${slugify(titulo) || "publicacion"}-${numero}`;

export const codigoPublicacion = (prefijo: string, numero: number) => `${prefijo}-${String(numero).padStart(4, "0")}`;
