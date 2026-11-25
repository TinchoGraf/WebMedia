import { Encabezado } from "@/components/publico/Encabezado";
import { Pie } from "@/components/publico/Pie";

export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-carbon focus:px-4 focus:py-2 focus:text-hoja">Ir al contenido</a>
      <Encabezado />
      <main id="contenido">{children}</main>
      <Pie />
    </>
  );
}
