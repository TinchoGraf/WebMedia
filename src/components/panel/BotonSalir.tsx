"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/cliente/auth";

export function BotonSalir() {
  const router = useRouter();
  return (
    <button type="button" className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
      onClick={async () => { await authClient.signOut(); router.replace("/panel/login"); router.refresh(); }}>
      Salir
    </button>
  );
}
