import Link from "next/link";
import { perfilActivo } from "@config";
import { crear } from "@/app/acciones/panel";
import { rubro } from "@/rubros";
import { usuarioActual } from "@/server/auth";
import { FormPublicacion } from "@/components/panel/FormPublicacion";

export const metadata = { title: "Nueva publicación" };

export default async function Nueva() {
  const u = (await usuarioActual())!;
  const r = rubro(perfilActivo().rubro);
  return (
    <div className="max-w-4xl">
      <Link href="/panel/publicaciones" className="enlace text-sm">Volver a {r.nombre.plural.toLowerCase()}</Link>
      <h1 className="titulo mt-2 text-grande">Nueva publicación</h1>
      <p className="mt-2 text-cemento">Primero los datos. En el paso siguiente subís las fotos y la publicás.</p>
      <div className="mt-8">
        <FormPublicacion rubroId={r.id} accion={crear} textoBoton="Guardar y seguir con las fotos" puedeDestacar={u.rol !== "demo"} />
      </div>
    </div>
  );
}
