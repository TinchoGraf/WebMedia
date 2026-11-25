// Genera public/og.png (imagen al compartir el link) con la foto de un auto ilustrado + nombre del negocio.
import sharp from "sharp";
import { autoSVG } from "./imagenes/autos.mjs";
const nombre = process.argv[2] ?? "Piedra Autos";
const bajada = process.argv[3] ?? "Usados seleccionados en Olavarría";
const auto = await sharp(Buffer.from(autoSVG("suv", "#9C2B2B", "lateral", "og"))).resize(760, 570).png().toBuffer();
const texto = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#F4F2EE"/>
  <text x="60" y="250" font-family="Georgia, serif" font-size="78" fill="#1F1D1A">${nombre}</text>
  <text x="62" y="310" font-family="Arial, sans-serif" font-size="30" fill="#6B665F">${bajada}</text>
  <rect x="60" y="360" width="260" height="64" rx="10" fill="#9A5222"/>
  <text x="88" y="402" font-family="Arial, sans-serif" font-size="27" font-weight="700" fill="#fff">Ver catálogo</text>
</svg>`;
await sharp(Buffer.from(texto)).composite([{ input: auto, left: 470, top: 60 }]).png().toFile("public/og.png");
console.log("public/og.png listo");
