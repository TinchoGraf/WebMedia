import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // sharp y PGlite se cargan en el servidor tal cual (binarios / wasm)
  serverExternalPackages: ["sharp", "@electric-sql/pglite"],
  experimental: {
    // las fotos se achican en el navegador antes de subir; esto es el techo
    serverActions: { bodySizeLimit: "8mb" },
  },
  async headers() {
    // La CSP con nonce la pone src/proxy.ts (cambia en cada request). Acá van las fijas.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default config;
