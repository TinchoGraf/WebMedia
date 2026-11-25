import Link from "next/link";
import { notFound } from "next/navigation";
import { general, perfilActivo } from "@config";
import { guardar } from "@/app/acciones/panel";
import { db } from "@/db";
import { puede } from "@/lib/permisos";
import { centavosAEntero } from "@/lib/precios";
import { codigoPublicacion } from "@/lib/slug";
import { rubro } from "@/rubros";
import { usuarioActual } from "@/server/auth";
import { paraEditar } from "@/server/lecturas";
import { AccionesPublicacion } from "@/components/panel/AccionesPublicacion";
import { Estado } from "@/components/panel/Estado";
import { FormPublicacion } from "@/components/panel/FormPublicacion";
import { GestorFotos } from "@/components/panel/GestorFotos";

export const metadata = { title: "Editar publicación" };

export default async function Editar({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nueva?: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const u = (await usuarioActual())!;
  const p = await paraEditar(db, id);
  const perfil = perfilActivo();
  if (!p || p.rubro !== perfil.rubro) notFound();
  const r = rubro(p.rubro);
  const nueva = (await searchParams).nueva;

  return (
    <div className="max-w-6xl">
      <Link href="/panel/publicaciones" className="enlace text-sm">Volver a {r.nombre.plural.toLowerCase()}</Link>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="titulo text-grande">{p.titulo}</h1>
        <Estado valor={p.estado} />
      </div>
      <p className="mt-1 text-sm text-cemento tabular">Código {codigoPublicacion(perfil.prefijoCodigo, p.numero)}</p>
      {nueva && <p role="status" className="mt-4 rounded-lg bg-[#E2ECE5] px-4 py-3 text-sm text-verde"><b>Guardada como borrador.</b> Ahora subí las fotos y tocá &quot;Publicar&quot;.</p>}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_17rem]">
        <div className="grid min-w-0 gap-8">
          <GestorFotos publicacionId={p.id} fotos={p.fotos} max={general.maxFotosPorPublicacion} />
          <FormPublicacion
            rubroId={r.id}
            accion={guardar.bind(null, p.id)}
            textoBoton="Guardar cambios"
            puedeDestacar={u.rol !== "demo"}
            inicial={{
              titulo: p.titulo, descripcion: p.descripcion, operacion: p.operacion, tipo: p.tipo, precio: centavosAEntero(p.precio),
              moneda: p.moneda, expensas: centavosAEntero(p.expensas), zona: p.zona, direccion: p.direccion, destacada: p.destacada, atributos: p.atributos,
            }}
          />
        </div>
        <div className="xl:sticky xl:top-6 xl:self-start">
          <AccionesPublicacion id={p.id} estado={p.estado} puedeBorrar={puede(u, "publicaciones:borrar")} urlPublica={`/${r.ruta}/${p.slug}`} />
        </div>
      </div>
    </div>
  );
}
