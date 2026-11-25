import Link from "next/link";
import { Encabezado } from "@/components/publico/Encabezado";
import { Pie } from "@/components/publico/Pie";
import { perfilActivo } from "@config";
import { rubro } from "@/rubros";

export default function NoEncontrado() {
  const r = rubro(perfilActivo().rubro);
  return (
    <>
      <Encabezado />
      <main id="contenido" className="contenedor py-24">
        <h1 className="titulo text-enorme max-w-[14ch]">{r.id === "vehiculo" ? "Este auto ya no está en el playón." : "Esta propiedad ya no está publicada."}</h1>
        <p className="mt-5 max-w-[46ch] text-medio text-cemento">Puede que se haya vendido o que el link esté mal. Fijate en lo que tenemos ahora.</p>
        <div className="mt-8 flex gap-3">
          <Link href={`/${r.ruta}`} className="boton boton-principal">Ver {r.nombre.plural.toLowerCase()}</Link>
          <Link href="/" className="boton boton-borde">Ir al inicio</Link>
        </div>
      </main>
      <Pie />
    </>
  );
}
