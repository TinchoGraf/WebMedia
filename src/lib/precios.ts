import type { Moneda } from "../rubros/define-rubro";

/** "85000" | 85000 → 8_500_000 centavos. Acepta "85.000" y "85.000,50" (formato argentino). */
export function aCentavos(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number") return Math.round(valor * 100);
  const limpio = valor.trim().replace(/[^\d.,]/g, "");
  if (!limpio) return null;
  // En es-AR el punto separa miles y la coma decimales. "15500000", "15.500.000" y "15.500.000,50" valen.
  const normal = limpio.includes(",") ? limpio.replace(/\./g, "").replace(",", ".") : /^\d{1,3}(\.\d{3})+$/.test(limpio) ? limpio.replace(/\./g, "") : limpio;
  const n = Number(normal);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function formatoPrecio(centavos: number | null | undefined, moneda: Moneda): string {
  if (centavos === null || centavos === undefined) return "Consultar precio";
  const n = Math.round(centavos / 100).toLocaleString("es-AR");
  return moneda === "USD" ? `US$ ${n}` : `$ ${n}`;
}

/** Para inputs del panel: 8_500_000 centavos → "85000" */
export const centavosAEntero = (c: number | null | undefined) => (c === null || c === undefined ? "" : String(Math.round(c / 100)));
