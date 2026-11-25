import { inmueble } from "./inmueble";
import { vehiculo } from "./vehiculo";
import type { DefinicionRubro } from "./define-rubro";

export const rubros = { vehiculo, inmueble } satisfies Record<string, DefinicionRubro>;
export type RubroId = keyof typeof rubros;

export function rubro(id: string): DefinicionRubro {
  const r = (rubros as Record<string, DefinicionRubro>)[id];
  if (!r) throw new Error(`Rubro desconocido: ${id}`);
  return r;
}

export * from "./define-rubro";
