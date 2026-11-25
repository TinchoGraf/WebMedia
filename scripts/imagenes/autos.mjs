// Ilustraciones de autos "de estudio" para la demo. Todo vectorial, se rasteriza con sharp.
// Vistas: lateral, frente, trasera, interior. Carrocerías: hatch, sedan, pickup, suv, van.

const W = 1600, H = 1200, PISO = 905;

export function tono(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const m = (c) => Math.max(0, Math.min(255, Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f))));
  return `#${[m(r), m(g), m(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function defs(color, id) {
  return `
  <linearGradient id="pared${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEEAE3"/><stop offset="1" stop-color="#DCD6CB"/></linearGradient>
  <linearGradient id="piso${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6D0C5"/><stop offset="1" stop-color="#C4BDB1"/></linearGradient>
  <linearGradient id="pint${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${tono(color, 0.22)}"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="${tono(color, -0.32)}"/>
  </linearGradient>
  <linearGradient id="vidrio${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B6670"/><stop offset=".55" stop-color="#2E353C"/><stop offset="1" stop-color="#1F2428"/></linearGradient>
  <radialGradient id="llanta${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#D9DCDF"/><stop offset=".7" stop-color="#A9AEB3"/><stop offset="1" stop-color="#7D838A"/></radialGradient>
  <filter id="sombra${id}" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="suave${id}"><feGaussianBlur stdDeviation="1.2"/></filter>`;
}

const fondo = (id) => `
  <rect width="${W}" height="${H}" fill="url(#pared${id})"/>
  <rect y="760" width="${W}" height="${H - 760}" fill="url(#piso${id})"/>
  <rect y="756" width="${W}" height="10" fill="#fff" opacity=".25"/>`;

function rueda(cx, cy, r, id) {
  const rayos = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 * Math.PI) / 180;
    const x = cx + Math.cos(a) * r * 0.52, y = cy + Math.sin(a) * r * 0.52;
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#8C9298" stroke-width="${(r * 0.14).toFixed(1)}" stroke-linecap="round"/>`;
  }).join("");
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1C1D1F"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="#2A2B2E"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.64}" fill="url(#llanta${id})"/>
    ${rayos}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="#5D6268"/>
  </g>`;
}

/* ───── Lateral ───── */

const PERFILES = {
  hatch: {
    ruedas: [470, 1110], r: 100,
    cuerpo: "M300 850 L298 700 C300 640 320 600 360 585 L470 470 C490 452 520 445 560 444 L860 446 C900 447 930 458 955 478 L1080 590 C1100 604 1130 610 1170 615 L1320 640 C1360 648 1380 668 1385 700 L1390 790 C1392 830 1380 850 1350 852 L1218 852 A118 118 0 1 0 1002 852 L578 852 A118 118 0 1 0 362 852 Z",
    vidrios: "M512 600 L585 474 C595 466 608 463 625 463 L855 465 C885 467 905 475 925 491 L1030 597 Z",
    pilarB: [770, 798], puertas: [560, 784, 1040], cintura: 610, faro: "M1335 668 L1380 688 L1385 722 L1336 708 Z", trasera: "M300 640 L348 612 L352 668 L300 682 Z",
    espejo: "M1005 596 C1000 575 1030 568 1048 584 L1040 606 Z", manijas: [700, 940],
  },
  sedan: {
    ruedas: [460, 1110], r: 100,
    cuerpo: "M262 850 L258 720 C258 672 276 648 318 640 L520 618 L640 480 C660 458 690 448 730 446 L880 446 C918 447 944 460 968 482 L1085 592 C1105 606 1135 612 1175 616 L1330 640 C1370 648 1390 670 1394 702 L1398 790 C1400 830 1388 850 1358 852 L1218 852 A118 118 0 1 0 1002 852 L568 852 A118 118 0 1 0 352 852 Z",
    vidrios: "M560 605 L655 488 C668 472 690 464 720 464 L875 465 C905 467 924 476 944 494 L1036 598 Z",
    pilarB: [790, 818], puertas: [600, 805, 1045], cintura: 615, faro: "M1342 668 L1390 690 L1394 724 L1344 708 Z", trasera: "M260 662 L318 648 L322 688 L260 698 Z",
    espejo: "M1010 598 C1005 577 1035 570 1053 586 L1045 608 Z", manijas: [715, 945],
  },
  suv: {
    ruedas: [480, 1120], r: 112,
    cuerpo: "M290 840 L286 620 C287 560 300 520 330 500 L410 420 C428 404 455 398 495 397 L880 398 C922 399 952 412 976 436 L1090 560 C1110 576 1140 584 1180 588 L1330 610 C1372 618 1396 642 1400 680 L1404 780 C1406 822 1394 842 1362 844 L1250 844 A128 128 0 1 0 990 844 L610 844 A128 128 0 1 0 350 844 Z",
    vidrios: "M335 560 L345 515 C352 496 370 470 400 448 L425 426 C440 418 460 416 490 416 L880 418 C912 419 936 430 955 450 L1045 566 Z",
    pilarB: [700, 730], puertas: [490, 720, 1050], cintura: 575, faro: "M1350 640 L1398 660 L1402 700 L1352 684 Z", trasera: "M288 560 L330 548 L332 640 L288 650 Z",
    espejo: "M1018 566 C1012 544 1044 536 1063 554 L1054 578 Z", manijas: [640, 930],
  },
  pickup: {
    ruedas: [430, 1150], r: 110,
    cuerpo: "M240 842 L238 610 L770 610 L776 440 C778 428 790 420 812 420 L1010 422 C1040 423 1062 434 1080 454 L1150 570 C1168 590 1200 598 1240 602 L1360 616 C1396 622 1416 646 1420 682 L1424 784 C1426 824 1414 842 1384 844 L1276 844 A126 126 0 1 0 1024 844 L556 844 A126 126 0 1 0 304 844 Z",
    vidrios: "M800 590 L802 452 C803 444 810 440 824 440 L1005 441 C1028 442 1044 452 1058 470 L1124 588 Z",
    pilarB: [940, 966], puertas: [790, 950, 1130], cintura: 600, faro: "M1372 640 L1418 660 L1422 700 L1374 684 Z", trasera: "M240 640 L268 636 L268 700 L240 702 Z",
    espejo: "M1100 572 C1094 550 1126 542 1145 560 L1136 584 Z", manijas: [880, 1060],
    extra: `<rect x="250" y="604" width="512" height="14" rx="4" fill="#000" opacity=".25"/>`,
  },
  van: {
    ruedas: [470, 1150], r: 104,
    cuerpo: "M250 846 L248 380 C248 345 268 330 300 330 L1060 332 C1100 333 1124 350 1140 380 L1250 560 C1265 584 1290 596 1330 604 L1380 614 C1410 622 1420 646 1422 680 L1426 788 C1428 828 1414 846 1384 848 L1272 848 A122 122 0 1 0 1028 848 L592 848 A122 122 0 1 0 348 848 Z",
    vidrios: "M1010 520 L1012 360 C1013 352 1020 348 1034 348 L1070 350 C1094 352 1110 364 1124 386 L1226 560 L1012 562 Z",
    pilarB: [990, 1012], puertas: [640, 1000, 1240], cintura: 570, faro: "M1380 640 L1420 658 L1424 698 L1382 684 Z", trasera: "M250 560 L278 556 L278 660 L250 664 Z",
    espejo: "M1200 560 C1194 538 1226 530 1245 548 L1236 572 Z", manijas: [900, 1120],
    extra: `<path d="M620 400 L980 400" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`,
  },
};

function lateral(tipo, color, id) {
  const p = PERFILES[tipo];
  const [r1, r2] = p.ruedas;
  const cy = PISO - p.r;
  const largo = r2 - r1;
  const pozos = p.ruedas.map((x) => `<circle cx="${x}" cy="${cy}" r="${p.r * 1.17}" fill="#141516"/>`).join("");
  const puertas = p.puertas.map((x) => `<path d="M${x} ${p.cintura - 6} Q${x + 4} ${p.cintura + 120} ${x - 2} ${PISO - p.r * 0.55}" stroke="${tono(color, -0.45)}" stroke-width="2.6" fill="none" opacity=".8"/>`).join("");
  const manijas = p.manijas.map((x) => `<rect x="${x}" y="${p.cintura + 28}" width="52" height="12" rx="6" fill="${tono(color, -0.4)}"/><rect x="${x + 2}" y="${p.cintura + 29}" width="48" height="4" rx="2" fill="#fff" opacity=".35"/>`).join("");
  return `
  <ellipse cx="${(r1 + r2) / 2}" cy="${PISO + 4}" rx="${largo / 2 + 300}" ry="34" fill="#000" opacity=".38" filter="url(#sombra${id})"/>
  <clipPath id="arriba${id}"><rect width="${W}" height="${PISO - p.r * 0.47}"/></clipPath>
  <g clip-path="url(#arriba${id})">${pozos}</g>
  <path d="${p.cuerpo}" fill="url(#pint${id})"/>
  ${p.extra ?? ""}
  <path d="${p.vidrios}" fill="url(#vidrio${id})"/>
  <path d="${p.vidrios}" fill="none" stroke="#111" stroke-width="5" opacity=".65"/>
  <rect x="${p.pilarB[0]}" y="380" width="${p.pilarB[1] - p.pilarB[0]}" height="${p.cintura - 372}" fill="#1E2226" clip-path="url(#v${id})"/>
  <clipPath id="v${id}"><path d="${p.vidrios}"/></clipPath>
  <path d="M260 ${p.cintura + 6} L1400 ${p.cintura + 22}" stroke="#fff" stroke-width="3" opacity=".28"/>
  ${puertas}${manijas}
  <path d="${p.faro}" fill="#F3F1EA" stroke="#9AA0A6" stroke-width="2"/>
  <path d="${p.trasera}" fill="#A3271F" stroke="#5E1612" stroke-width="2"/>
  <path d="${p.espejo}" fill="${tono(color, -0.15)}" stroke="${tono(color, -0.5)}" stroke-width="2"/>
  <path d="M${r1 - p.r * 1.3} ${PISO - p.r * 0.5} L${r2 + p.r * 1.3} ${PISO - p.r * 0.5}" stroke="#000" stroke-opacity=".22" stroke-width="10"/>
  ${rueda(r1, cy, p.r, id)}${rueda(r2, cy, p.r, id)}`;
}

/* ───── Frente / trasera ───── */

const ANCHOS = { hatch: [470, 1130, 470], sedan: [460, 1140, 470], suv: [440, 1160, 420], pickup: [430, 1170, 430], van: [450, 1150, 340] };

function frente(tipo, color, id, atras = false) {
  const [x1, x2, techo] = ANCHOS[tipo];
  const c = 800, cin = 590, base = 870;
  const gx1 = x1 + 70, gx2 = x2 - 70;
  const tx1 = x1 + 110, tx2 = x2 - 110;
  const cuerpo = `M${x1} ${base - 30} L${x1 - 6} ${cin + 40} C${x1 - 4} ${cin + 8} ${x1 + 14} ${cin - 6} ${x1 + 50} ${cin - 10} L${tx1 - 20} ${techo + 30} C${tx1} ${techo} ${tx1 + 30} ${techo - 6} ${tx1 + 70} ${techo - 8} L${tx2 - 70} ${techo - 8} C${tx2 - 30} ${techo - 6} ${tx2} ${techo} ${tx2 + 20} ${techo + 30} L${x2 - 50} ${cin - 10} C${x2 - 14} ${cin - 6} ${x2 + 4} ${cin + 8} ${x2 + 6} ${cin + 40} L${x2} ${base - 30} C${x2} ${base} ${x2 - 20} ${base + 8} ${x2 - 60} ${base + 8} L${x1 + 60} ${base + 8} C${x1 + 20} ${base + 8} ${x1} ${base} ${x1} ${base - 30} Z`;
  const vidrio = `M${tx1 + 6} ${cin - 26} L${tx1 + 34} ${techo + 26} C${tx1 + 44} ${techo + 12} ${tx1 + 60} ${techo + 10} ${tx1 + 84} ${techo + 10} L${tx2 - 84} ${techo + 10} C${tx2 - 60} ${techo + 10} ${tx2 - 44} ${techo + 12} ${tx2 - 34} ${techo + 26} L${tx2 - 6} ${cin - 26} Z`;
  const luz = atras ? "#A3271F" : "#F3F1EA";
  const borde = atras ? "#5E1612" : "#8E949A";
  const luces = atras
    ? `<path d="M${x1 + 10} ${cin + 30} L${x1 + 190} ${cin + 40} L${x1 + 180} ${cin + 92} L${x1 + 6} ${cin + 84} Z" fill="${luz}" stroke="${borde}" stroke-width="3"/>
       <path d="M${x2 - 10} ${cin + 30} L${x2 - 190} ${cin + 40} L${x2 - 180} ${cin + 92} L${x2 - 6} ${cin + 84} Z" fill="${luz}" stroke="${borde}" stroke-width="3"/>`
    : `<path d="M${x1 + 20} ${cin + 34} L${x1 + 200} ${cin + 52} L${x1 + 190} ${cin + 92} L${x1 + 24} ${cin + 80} Z" fill="${luz}" stroke="${borde}" stroke-width="3"/>
       <path d="M${x2 - 20} ${cin + 34} L${x2 - 200} ${cin + 52} L${x2 - 190} ${cin + 92} L${x2 - 24} ${cin + 80} Z" fill="${luz}" stroke="${borde}" stroke-width="3"/>`;
  const parrilla = atras
    ? `<rect x="${c - 70}" y="${cin + 120}" width="140" height="44" rx="4" fill="#F7F6F2" stroke="#888" stroke-width="2"/>`
    : `<rect x="${c - 170}" y="${cin + 70}" width="340" height="84" rx="22" fill="#1C1F22"/>
       ${Array.from({ length: 4 }, (_, i) => `<rect x="${c - 156}" y="${cin + 86 + i * 16}" width="312" height="5" rx="2" fill="#3A3F44"/>`).join("")}
       <rect x="${c - 70}" y="${cin + 172}" width="140" height="44" rx="4" fill="#F7F6F2" stroke="#888" stroke-width="2"/>`;
  return `
  <ellipse cx="${c}" cy="${PISO + 2}" rx="${(x2 - x1) / 2 + 120}" ry="30" fill="#000" opacity=".4" filter="url(#sombra${id})"/>
  <rect x="${x1 + 20}" y="${base - 60}" width="110" height="${PISO - base + 60}" rx="20" fill="#1C1D1F"/>
  <rect x="${x2 - 130}" y="${base - 60}" width="110" height="${PISO - base + 60}" rx="20" fill="#1C1D1F"/>
  <path d="${cuerpo}" fill="url(#pint${id})"/>
  <path d="${vidrio}" fill="url(#vidrio${id})" stroke="#111" stroke-width="5" stroke-opacity=".6"/>
  <path d="M${x1 + 40} ${cin - 4} L${x2 - 40} ${cin - 4}" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
  ${luces}${parrilla}
  <rect x="${gx1}" y="${base - 46}" width="${gx2 - gx1}" height="30" rx="12" fill="#000" opacity=".28"/>
  <path d="M${x1 - 30} ${cin - 6} C${x1 - 40} ${cin - 40} ${x1 + 6} ${cin - 46} ${x1 + 16} ${cin - 20} L${x1 + 10} ${cin + 6} Z" fill="${tono(color, -0.15)}"/>
  <path d="M${x2 + 30} ${cin - 6} C${x2 + 40} ${cin - 40} ${x2 - 6} ${cin - 46} ${x2 - 16} ${cin - 20} L${x2 - 10} ${cin + 6} Z" fill="${tono(color, -0.15)}"/>`;
}

/* ───── Interior ───── */

function interior(color, id) {
  const costura = tono(color, 0.1);
  return `
  <defs>
    <linearGradient id="afuera${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D4D9"/><stop offset="1" stop-color="#E4E1D8"/></linearGradient>
    <linearGradient id="tablero${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3D41"/><stop offset="1" stop-color="#1E2023"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#afuera${id})"/>
  <path d="M0 330 C300 300 600 290 800 290 C1000 290 1300 300 1600 330" stroke="#B9C2C4" stroke-width="2" fill="none"/>
  <path d="M0 0 L0 1200 L120 1200 L260 300 L240 0 Z" fill="#26282B"/>
  <path d="M1600 0 L1600 1200 L1480 1200 L1340 300 L1360 0 Z" fill="#26282B"/>
  <path d="M0 640 C220 560 520 540 800 540 C1080 540 1380 560 1600 640 L1600 1200 L0 1200 Z" fill="url(#tablero${id})"/>
  <path d="M120 640 C380 590 600 580 800 580 C1000 580 1220 590 1480 640" stroke="${costura}" stroke-width="3" stroke-dasharray="10 8" fill="none" opacity=".8"/>
  <rect x="440" y="610" width="320" height="120" rx="26" fill="#121315"/>
  <circle cx="530" cy="670" r="42" fill="none" stroke="#5C88A6" stroke-width="5"/>
  <circle cx="670" cy="670" r="42" fill="none" stroke="#5C88A6" stroke-width="5"/>
  <rect x="860" y="610" width="300" height="170" rx="18" fill="#0E1012" stroke="#444" stroke-width="3"/>
  <rect x="876" y="626" width="268" height="138" rx="10" fill="#21323F"/>
  <rect x="896" y="650" width="120" height="12" rx="6" fill="#5C88A6"/><rect x="896" y="676" width="200" height="10" rx="5" fill="#3E5869"/><rect x="896" y="698" width="160" height="10" rx="5" fill="#3E5869"/>
  <rect x="1200" y="640" width="150" height="40" rx="12" fill="#121315"/><rect x="250" y="640" width="150" height="40" rx="12" fill="#121315"/>
  <circle cx="600" cy="900" r="250" fill="none" stroke="#151617" stroke-width="56"/>
  <circle cx="600" cy="900" r="250" fill="none" stroke="${costura}" stroke-width="2" stroke-dasharray="9 9" opacity=".7"/>
  <path d="M370 920 L540 880 L660 880 L830 920" stroke="#151617" stroke-width="58" fill="none" stroke-linecap="round"/>
  <circle cx="600" cy="900" r="76" fill="#1B1C1E" stroke="#333" stroke-width="4"/>
  <rect x="900" y="820" width="220" height="380" rx="40" fill="#1A1B1D"/>
  <circle cx="1010" cy="900" r="36" fill="#2C2E31" stroke="#55595e" stroke-width="3"/>
  <path d="M1180 1200 C1180 1000 1220 940 1330 930 C1450 930 1520 980 1540 1200 Z" fill="${tono(color, -0.55)}"/>
  <path d="M1220 1200 C1222 1030 1260 980 1330 975 C1410 975 1470 1010 1490 1200" stroke="${costura}" stroke-width="3" stroke-dasharray="10 8" fill="none" opacity=".7"/>`;
}

export function autoSVG(tipo, color, vista, id = "a") {
  // Se escala alrededor del punto de apoyo para que el auto llene el cuadro
  const escalar = (svg, k) => `<g transform="translate(800 ${PISO}) scale(${k}) translate(-800 -${PISO})">${svg}</g>`;
  const cuerpo =
    vista === "lateral" ? escalar(lateral(tipo, color, id), 1.06)
    : vista === "frente" ? escalar(frente(tipo, color, id), 1.32)
    : vista === "trasera" ? escalar(frente(tipo, color, id, true), 1.32)
    : null;
  if (vista === "interior") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs(color, id)}</defs>${interior(color, id)}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs(color, id)}</defs>${fondo(id)}${cuerpo}</svg>`;
}
