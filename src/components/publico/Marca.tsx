/** Logo de la demo: bloque de piedra tallado. Reemplazar por el del cliente. */
export function Isotipo({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 10 L14 4 L28 8 L28 22 L18 28 L4 24 Z" fill="currentColor" />
      <path d="M4 10 L14 4 L28 8 L18 13 Z" fill="var(--color-ocre-claro)" />
      <path d="M18 13 L18 28" stroke="var(--color-ocre-claro)" strokeWidth="1.4" opacity=".6" />
    </svg>
  );
}
