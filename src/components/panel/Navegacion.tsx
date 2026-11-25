"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; texto: string; contador?: number };

export function Navegacion({ items }: { items: Item[] }) {
  const ruta = usePathname();
  return (
    <ul className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map((it) => {
        const activo = it.href === "/panel" ? ruta === "/panel" : ruta.startsWith(it.href);
        return (
          <li key={it.href}>
            <Link href={it.href} aria-current={activo ? "page" : undefined}
              className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm whitespace-nowrap ${activo ? "bg-white/12 font-semibold text-hoja" : "hover:bg-white/8"}`}>
              {it.texto}
              {!!it.contador && <span className="rounded-full bg-ocre-claro px-2 text-xs font-semibold text-carbon tabular">{it.contador}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
