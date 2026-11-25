"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/cliente/auth";

export function FormLogin({ destino }: { destino: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const f = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({ email: String(f.get("email")), password: String(f.get("password")) });
    setCargando(false);
    if (error) {
      // Mismo mensaje para email o contraseña incorrectos: no revela qué usuarios existen
      setError(error.status === 429 ? "Demasiados intentos. Esperá 15 minutos y volvé a probar." : "Email o contraseña incorrectos.");
      return;
    }
    router.replace(destino);
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="mt-6 grid gap-4">
      <div>
        <label className="etiqueta" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" minLength={12} className="campo" />
      </div>
      {error && <p role="alert" className="rounded-lg bg-[#F6E3E0] px-3 py-2 text-sm font-medium text-alerta">{error}</p>}
      <button className="boton boton-oscuro" disabled={cargando}>{cargando ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
