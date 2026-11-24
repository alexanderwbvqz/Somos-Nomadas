/** Círculo con flecha que va al final de un botón */
export function CirculoFlecha({ lleno, abajo = false }: { lleno: boolean; abajo?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-8 items-center justify-center rounded-full ${
        lleno
          ? 'bg-fondo text-texto group-hover:bg-texto group-hover:text-fondo'
          : 'bg-texto text-fondo group-hover:bg-fondo group-hover:text-texto'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={abajo ? 'rotate-90' : undefined}
      >
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </span>
  )
}
