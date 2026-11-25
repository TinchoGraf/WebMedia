/**
 * Achica la foto en el navegador antes de subirla (las del celular pesan 4–8 MB).
 * Si el navegador no puede leerla (ej. HEIC fuera de Safari), se manda el original y el servidor decide.
 */
export async function achicarFoto(archivo: File, maxLado = 2400): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(archivo, { imageOrientation: "from-image" });
    const k = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
    const canvas = new OffscreenCanvas(w, h);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    return await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
  } catch {
    return archivo;
  }
}
