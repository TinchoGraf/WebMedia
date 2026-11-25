import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { perfilActivo } from "@config";
import { db, schema } from "@/db";
import { puede } from "@/lib/permisos";
import { usuarioActual } from "@/server/auth";
import { Isotipo } from "@/components/publico/Marca";
import { Navegacion } from "@/components/panel/Navegacion";
import { BotonSalir } from "@/components/panel/BotonSalir";

const ROLES = { dueno: "Dueño", editor: "Vendedor", demo: "Demo" } as const;

export default async function PanelApp({ children }: { children: React.ReactNode }) {
  const u = await usuarioActual();
  if (!u || !u.activo) redirect("/panel/login");
  const p = perfilActivo();
  const [{ nuevas }] = await db.select({ nuevas: count() }).from(schema.consultas).where(and(eq(schema.consultas.rubro, p.rubro), eq(schema.consultas.estado, "nueva")));

  const items = [
    { href: "/panel", texto: "Resumen" },
    { href: "/panel/publicaciones", texto: "Publicaciones" },
    { href: "/panel/consultas", texto: "Consultas", contador: nuevas },
    ...(puede(u, "usuarios:gestionar") ? [{ href: "/panel/usuarios", texto: "Usuarios" }] : []),
    ...(puede(u, "actividad:ver") ? [{ href: "/panel/actividad", texto: "Actividad" }] : []),
  ];

  return (
    <div className="md:grid md:min-h-dvh md:grid-cols-[15rem_1fr]">
      <aside className="bg-carbon text-[#CFC9BF] md:sticky md:top-0 md:h-dvh">
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:block md:px-5 md:py-6">
          <Link href="/panel" className="flex items-center gap-2 text-hoja"><Isotipo className="size-7" /><span className="titulo text-2xl">{p.nombre}</span></Link>
          <Link href="/" target="_blank" className="text-xs underline md:mt-2 md:inline-block">Ver el sitio</Link>
        </div>
        <nav aria-label="Panel" className="px-3 pb-3 md:px-3">
          <Navegacion items={items} />
        </nav>
        <div className="hidden border-t border-white/10 px-5 py-4 text-xs md:absolute md:inset-x-0 md:bottom-0 md:block">
          <p className="font-medium text-hoja">{u.name}</p>
          <p className="truncate">{u.email}</p>
          <p className="mt-1">{ROLES[u.rol]}</p>
          <div className="-mx-3 mt-3"><BotonSalir /></div>
        </div>
      </aside>
      <div className="min-w-0">
        {u.rol === "demo" && (
          <p className="bg-ocre-claro/25 px-5 py-2 text-sm">
            <b>Modo demo:</b> probá todo lo que quieras. Los cambios se borran cada noche y algunas acciones están limitadas.
          </p>
        )}
        <div className="px-4 py-7 md:px-10 md:py-10">{children}</div>
        <div className="border-t border-borde px-4 py-4 md:hidden"><BotonSalir /></div>
      </div>
    </div>
  );
}
