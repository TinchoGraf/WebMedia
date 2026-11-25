// Ilustraciones de propiedades para la demo (fachadas, ambientes, lotes y campo). Vectorial → sharp.
import { tono } from "./autos.mjs";

const W = 1600, H = 1200;
const svg = (cuerpo, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}
  <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FC3DA"/><stop offset="1" stop-color="#E3EEF2"/></linearGradient>
  <linearGradient id="pasto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA868"/><stop offset="1" stop-color="#6F8A4D"/></linearGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="14"/></filter></defs>${cuerpo}</svg>`;

const arbol = (x, y, k = 1, c = "#5E7A45") => `<g transform="translate(${x} ${y}) scale(${k})">
  <rect x="-14" y="-10" width="28" height="170" rx="8" fill="#6B5139"/>
  <circle cx="0" cy="-90" r="120" fill="${c}"/><circle cx="-90" cy="-20" r="80" fill="${tono(c, -0.1)}"/><circle cx="90" cy="-30" r="90" fill="${tono(c, 0.08)}"/>
  <circle cx="20" cy="-150" r="70" fill="${tono(c, 0.12)}"/></g>`;

const nubes = `<g fill="#fff" opacity=".85"><ellipse cx="300" cy="170" rx="140" ry="38"/><ellipse cx="380" cy="150" rx="90" ry="40"/>
  <ellipse cx="1180" cy="120" rx="160" ry="36"/><ellipse cx="1260" cy="100" rx="80" ry="34"/></g>`;

const ventana = (x, y, w, h, marco = "#F4F1EA") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${marco}"/>
  <rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" fill="#4F6070"/>
  <path d="M${x + 10} ${y + 10} L${x + w * 0.55} ${y + 10} L${x + 10} ${y + h * 0.7} Z" fill="#fff" opacity=".18"/>
  <rect x="${x + w / 2 - 4}" y="${y + 10}" width="8" height="${h - 20}" fill="${marco}"/>`;

export function fachadaCasa(pared = "#E8DCC8", techo = "#A4553A") {
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#cielo)"/>${nubes}
  <rect y="880" width="${W}" height="320" fill="url(#pasto)"/>
  <rect y="960" width="${W}" height="70" fill="#B9B3A6"/>
  ${arbol(1380, 720, 1.1)}
  <polygon points="300,470 800,250 1300,470" fill="${techo}"/>
  <polygon points="300,470 800,250 1300,470 1300,490 300,490" fill="${tono(techo, -0.2)}" opacity=".35"/>
  <rect x="340" y="470" width="920" height="420" fill="${pared}"/>
  <rect x="340" y="470" width="920" height="24" fill="#000" opacity=".08"/>
  <rect x="980" y="560" width="250" height="330" fill="#6B5A4A"/>
  ${Array.from({ length: 9 }, (_, i) => `<rect x="980" y="${570 + i * 36}" width="250" height="4" fill="#000" opacity=".18"/>`).join("")}
  <rect x="700" y="610" width="140" height="280" rx="4" fill="#7A4F33"/><circle cx="815" cy="760" r="8" fill="#D8C27A"/>
  ${ventana(410, 590, 220, 180)}
  <rect x="380" y="880" width="560" height="14" fill="#9E9686"/>
  <path d="M0 960 L1600 960" stroke="#857F71" stroke-width="6"/>
  ${Array.from({ length: 13 }, (_, i) => `<rect x="${20 + i * 46}" y="900" width="10" height="60" fill="#F4F1EA"/>`).join("")}
  <rect x="0" y="910" width="610" height="8" fill="#F4F1EA"/>`);
}

export function fachadaDepto(pared = "#D9D2C5", acento = "#5C6B60") {
  const pisos = 6;
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#cielo)"/>${nubes}
  <rect x="0" y="560" width="300" height="600" fill="#C7C0B3"/><rect x="1300" y="480" width="300" height="700" fill="#BDB6A8"/>
  <rect x="420" y="150" width="760" height="900" fill="${pared}"/>
  <rect x="420" y="150" width="760" height="30" fill="${tono(pared, -0.15)}"/>
  ${Array.from({ length: pisos }, (_, i) => {
    const y = 210 + i * 130;
    return `${ventana(470, y, 200, 100)}${ventana(930, y, 200, 100)}
      <rect x="700" y="${y - 6}" width="200" height="112" fill="#46525C"/>
      <rect x="690" y="${y + 74}" width="220" height="40" fill="${acento}" opacity=".9"/>
      ${Array.from({ length: 7 }, (_, k) => `<rect x="${700 + k * 32}" y="${y + 74}" width="5" height="40" fill="${tono(acento, -0.3)}"/>`).join("")}`;
  }).join("")}
  <rect x="700" y="950" width="200" height="100" fill="#3D464D"/>
  <rect y="1050" width="${W}" height="150" fill="#A9A396"/>
  ${arbol(250, 900, 0.9)}${arbol(1400, 920, 0.8, "#6B8550")}`);
}

export function living(pared = "#EDE6DA", sillon = "#7C8B76") {
  return svg(`
  <rect width="${W}" height="760" fill="${pared}"/>
  <rect y="760" width="${W}" height="440" fill="#B48A5F"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="0" y="${770 + i * 38}" width="${W}" height="2" fill="#8E6A45" opacity=".5"/>`).join("")}
  <rect x="980" y="160" width="420" height="460" fill="#F7F4EE"/><rect x="1000" y="180" width="380" height="420" fill="url(#cielo)"/>
  <rect x="1186" y="180" width="8" height="420" fill="#F7F4EE"/>
  <rect x="940" y="140" width="40" height="560" fill="#D6C6AE"/><rect x="1400" y="140" width="40" height="560" fill="#D6C6AE"/>
  <ellipse cx="620" cy="1010" rx="460" ry="80" fill="#D8CDBB"/>
  <rect x="200" y="640" width="720" height="200" rx="40" fill="${sillon}"/>
  <rect x="230" y="560" width="660" height="150" rx="40" fill="${tono(sillon, 0.1)}"/>
  <rect x="170" y="620" width="90" height="240" rx="30" fill="${tono(sillon, -0.1)}"/><rect x="860" y="620" width="90" height="240" rx="30" fill="${tono(sillon, -0.1)}"/>
  <rect x="300" y="600" width="140" height="110" rx="24" fill="#E8D9B9"/><rect x="680" y="600" width="140" height="110" rx="24" fill="#C98C5A"/>
  <rect x="420" y="920" width="400" height="30" rx="8" fill="#6B4E36"/><rect x="450" y="950" width="14" height="70" fill="#6B4E36"/><rect x="776" y="950" width="14" height="70" fill="#6B4E36"/>
  <rect x="1260" y="740" width="90" height="120" rx="12" fill="#C9B79C"/>
  <path d="M1305 740 C1240 640 1250 560 1300 520 C1330 600 1350 640 1305 740" fill="#5E7A45"/><path d="M1305 740 C1380 650 1400 600 1380 540 C1330 600 1310 650 1305 740" fill="#6F8A4D"/>
  <rect x="120" y="230" width="300" height="200" fill="#C8B79F"/><rect x="135" y="245" width="270" height="170" fill="#9AAB8E"/>`);
}

export function cocina(mueble = "#E9E4D9", mesada = "#4A4E52") {
  return svg(`
  <rect width="${W}" height="${H}" fill="#F1ECE2"/>
  <rect x="560" y="200" width="480" height="300" fill="#F7F4EE"/><rect x="580" y="220" width="440" height="260" fill="url(#cielo)"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200}" y="560" width="200" height="120" fill="none" stroke="#D9D1C2" stroke-width="2"/>`).join("")}
  <rect x="0" y="120" width="520" height="300" fill="${mueble}"/><rect x="1080" y="120" width="520" height="300" fill="${mueble}"/>
  ${[0, 260, 1080, 1340].map((x) => `<rect x="${x + 10}" y="130" width="240" height="280" fill="none" stroke="${tono(mueble, -0.15)}" stroke-width="3"/><rect x="${x + 225}" y="250" width="8" height="60" rx="4" fill="#8A8E92"/>`).join("")}
  <rect x="0" y="680" width="${W}" height="40" fill="${mesada}"/>
  <rect x="0" y="720" width="${W}" height="380" fill="${mueble}"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200 + 10}" y="735" width="180" height="350" fill="none" stroke="${tono(mueble, -0.15)}" stroke-width="3"/><rect x="${i * 200 + 80}" y="760" width="40" height="8" rx="4" fill="#8A8E92"/>`).join("")}
  <rect x="640" y="672" width="320" height="18" rx="6" fill="#A6ACB1"/>
  <path d="M800 672 L800 600 C800 570 840 570 840 600" stroke="#A6ACB1" stroke-width="12" fill="none"/>
  <rect y="1100" width="${W}" height="100" fill="#A39B8C"/>
  ${[400, 800, 1200].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="60" stroke="#333" stroke-width="3"/><path d="M${x - 50} 110 L${x + 50} 110 L${x + 30} 60 L${x - 30} 60 Z" fill="#2F3B34"/><ellipse cx="${x}" cy="110" rx="50" ry="8" fill="#F5E4A8"/>`).join("")}
  <rect x="1200" y="610" width="70" height="70" rx="10" fill="#7C8B76"/><path d="M1235 610 C1210 560 1220 540 1240 520 C1250 560 1260 580 1235 610" fill="#5E7A45"/>`);
}

export function dormitorio(pared = "#E4E0D6", ropa = "#B9A68C") {
  return svg(`
  <rect width="${W}" height="800" fill="${pared}"/><rect y="800" width="${W}" height="400" fill="#C4A27D"/>
  <rect x="1100" y="180" width="360" height="440" fill="#F7F4EE"/><rect x="1120" y="200" width="320" height="400" fill="url(#cielo)"/>
  <rect x="380" y="380" width="760" height="300" rx="20" fill="#7A6450"/>
  <rect x="360" y="640" width="800" height="300" rx="24" fill="#F4F0E8"/>
  <rect x="360" y="740" width="800" height="200" rx="24" fill="${ropa}"/>
  <rect x="430" y="590" width="260" height="110" rx="30" fill="#FBF9F4"/><rect x="830" y="590" width="260" height="110" rx="30" fill="#FBF9F4"/>
  <rect x="190" y="700" width="150" height="160" rx="10" fill="#8C735C"/><rect x="1180" y="700" width="150" height="160" rx="10" fill="#8C735C"/>
  <path d="M240 700 L290 700 L300 620 L230 620 Z" fill="#E8D9B9"/><rect x="262" y="640" width="6" height="60" fill="#666"/>
  <rect x="460" y="160" width="260" height="170" fill="#BFAE95"/><rect x="474" y="174" width="232" height="142" fill="#8FA2AC"/>`);
}

export function patioParrilla(pasto = "#8FA868") {
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#cielo)"/>${nubes}
  <rect y="760" width="${W}" height="440" fill="${pasto}"/>
  <rect y="700" width="${W}" height="70" fill="#D9CFBE"/>
  ${Array.from({ length: 40 }, (_, i) => `<rect x="${i * 40}" y="700" width="38" height="20" fill="#C9BBA4"/>`).join("")}
  <rect x="180" y="380" width="520" height="420" fill="#B4553C"/>
  <clipPath id="ladrillos"><rect x="180" y="380" width="520" height="420"/></clipPath>
  <g clip-path="url(#ladrillos)">${Array.from({ length: 14 }, (_, r) => Array.from({ length: 10 }, (_, c) => `<rect x="${150 + c * 60 + (r % 2 ? 30 : 0)}" y="${380 + r * 30}" width="56" height="26" fill="${tono("#B4553C", (r * 7 + c * 3) % 5 * 0.03 - 0.06)}"/>`).join("")).join("")}</g>
  <rect x="300" y="200" width="280" height="190" fill="#A84D36"/><rect x="380" y="80" width="120" height="130" fill="#9A4632"/>
  <rect x="250" y="520" width="380" height="180" fill="#2A2725"/><rect x="270" y="610" width="340" height="10" fill="#777"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${280 + i * 34}" y="600" width="6" height="30" fill="#888"/>`).join("")}
  <rect x="160" y="790" width="560" height="30" fill="#8C3F2C"/>
  <rect x="900" y="720" width="460" height="24" rx="6" fill="#6B4E36"/><rect x="930" y="744" width="16" height="120" fill="#6B4E36"/><rect x="1314" y="744" width="16" height="120" fill="#6B4E36"/>
  <rect x="880" y="790" width="500" height="18" rx="6" fill="#7A5C42"/>
  ${arbol(1400, 600, 1.2)}`);
}

export function lote(pasto = "#9DB070") {
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#cielo)"/>${nubes}
  <path d="M0 640 C300 620 600 630 900 610 C1200 600 1400 615 1600 600 L1600 680 L0 690 Z" fill="#7F9A63"/>
  <rect y="660" width="${W}" height="540" fill="${pasto}"/>
  ${Array.from({ length: 60 }, (_, i) => `<path d="M${(i * 97) % 1600} ${760 + ((i * 53) % 400)} l8 -26 l8 26" stroke="#6F8A4D" stroke-width="3" fill="none"/>`).join("")}
  ${Array.from({ length: 17 }, (_, i) => `<rect x="${60 + i * 92}" y="900" width="12" height="120" fill="#7A5C42"/>`).join("")}
  <path d="M60 930 L1540 930 M60 975 L1540 975" stroke="#888" stroke-width="3"/>
  <rect x="1100" y="640" width="14" height="300" fill="#5D4A37"/><rect x="980" y="600" width="260" height="140" fill="#F4F1EA" stroke="#5D4A37" stroke-width="6"/>
  <rect x="1010" y="640" width="200" height="22" fill="#B4553C"/><rect x="1010" y="680" width="140" height="14" fill="#9C978C"/>
  ${arbol(200, 640, 0.8, "#6B8550")}`);
}

export function campo() {
  const aspas = Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="0" x2="${(Math.cos((i * Math.PI) / 6) * 90).toFixed(1)}" y2="${(Math.sin((i * Math.PI) / 6) * 90).toFixed(1)}" stroke="#7D7F80" stroke-width="10"/>`).join("");
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#cielo)"/>${nubes}
  <rect y="640" width="${W}" height="560" fill="#C9B66E"/>
  ${Array.from({ length: 14 }, (_, i) => `<path d="M0 ${660 + i * 40} C400 ${650 + i * 40} 1200 ${670 + i * 42} 1600 ${660 + i * 44}" stroke="#B5A35C" stroke-width="5" fill="none"/>`).join("")}
  <path d="M0 640 L1600 640" stroke="#7F9A63" stroke-width="16"/>
  <g transform="translate(1150 300)"><line x1="0" y1="0" x2="-80" y2="420" stroke="#6E7173" stroke-width="10"/><line x1="0" y1="0" x2="80" y2="420" stroke="#6E7173" stroke-width="10"/>
  <line x1="-60" y1="300" x2="60" y2="300" stroke="#6E7173" stroke-width="8"/><line x1="-40" y1="200" x2="40" y2="200" stroke="#6E7173" stroke-width="8"/>${aspas}<circle r="18" fill="#555"/></g>
  <ellipse cx="1260" cy="760" rx="120" ry="30" fill="#8FA4B0"/>
  ${arbol(250, 560, 0.9, "#5E7A45")}${arbol(420, 580, 0.7, "#6B8550")}`);
}

export function local(pared = "#3F4B45", toldo = "#B4553C") {
  return svg(`
  <rect width="${W}" height="${H}" fill="#D9D4CA"/>
  <rect x="200" y="160" width="1200" height="800" fill="${pared}"/>
  <rect x="260" y="380" width="1080" height="560" fill="#ECE7DD"/>
  <rect x="280" y="400" width="700" height="520" fill="#9FB3BF" opacity=".85"/>
  <path d="M280 400 L620 400 L280 760 Z" fill="#fff" opacity=".2"/>
  <rect x="1020" y="400" width="300" height="520" fill="#5D4A37"/><circle cx="1050" cy="660" r="10" fill="#D8C27A"/>
  <path d="M220 300 L1380 300 L1420 380 L180 380 Z" fill="${toldo}"/>
  ${Array.from({ length: 12 }, (_, i) => `<path d="M${180 + i * 103} 380 l52 40 l52 -40" fill="${toldo}"/>`).join("")}
  <rect x="460" y="200" width="680" height="70" rx="6" fill="#ECE7DD" opacity=".9"/>
  <rect y="960" width="${W}" height="240" fill="#A9A396"/>`);
}
