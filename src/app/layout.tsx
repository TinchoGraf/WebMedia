import type { Metadata, Viewport } from "next";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource-variable/geist/index.css";
import "@/styles/global.css";
import { headers } from "next/headers";
import { perfilActivo } from "@config";

const perfil = perfilActivo();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  title: { default: perfil.seo.titulo, template: `%s | ${perfil.nombre}` },
  description: perfil.seo.descripcion,
  openGraph: { type: "website", locale: "es_AR", siteName: perfil.nombre, images: ["/og.png"] },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#F4F2EE", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Leer los headers hace que todo se renderice por request: necesario para que cada página lleve el nonce de la CSP.
  await headers();
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
