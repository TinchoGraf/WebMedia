import { redirect } from "next/navigation";
import { perfilActivo } from "@config";
import { usuarioActual } from "@/server/auth";
import { Isotipo } from "@/components/publico/Marca";
import { FormLogin } from "@/components/panel/FormLogin";

export default async function Login({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  if (await usuarioActual()) redirect("/panel");
  const { volver } = await searchParams;
  // Solo rutas internas del panel: evita redirecciones abiertas a otros sitios
  const destino = volver && /^\/panel(\/[a-z0-9/-]*)?$/.test(volver) ? volver : "/panel";
  const p = perfilActivo();
  return (
    <div className="textura grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="flex items-center justify-center gap-2.5"><Isotipo /><span className="titulo text-3xl">{p.nombre}</span></p>
        <div className="mt-8 rounded-2xl bg-hoja p-7 shadow-[0_1px_0_var(--color-borde),0_20px_40px_-28px_rgb(31_29_26/0.45)]">
          <h1 className="text-xl font-semibold">Entrar al panel</h1>
          <p className="mt-1 text-sm text-cemento">Para cargar y editar publicaciones.</p>
          <FormLogin destino={destino} />
        </div>
      </div>
    </div>
  );
}
