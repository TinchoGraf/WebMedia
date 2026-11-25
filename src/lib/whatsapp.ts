export const linkWhatsApp = (numero: string, mensaje: string) => `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
export const linkTelefono = (numero: string) => `tel:+${numero.replace(/\D/g, "")}`;
