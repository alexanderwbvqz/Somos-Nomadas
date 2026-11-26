type Estado = 'confirmado' | 'aviso' | 'espera'

// El fondo y el dibujo de cada estado. Mismo círculo que el sobre de «Confirma tu correo».
const FONDO: Record<Estado, string> = {
  confirmado: 'bg-degradado-amarillo',
  aviso: 'bg-degradado-durazno',
  espera: 'bg-suave',
}

function Dibujo({ estado }: { estado: Estado }) {
  if (estado === 'confirmado') return <path d="m5 12.5 4.5 4.5L19 7.5" />
  if (estado === 'aviso')
    return (
      <>
        <path d="M12 6.5v7" />
        <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
      </>
    )
  return (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.2l2.8 1.8" />
    </>
  )
}

// Icono en círculo que encabeza una pantalla corta. Es decorativo: el título dice lo mismo con palabras.
export function IconoEstado({ estado }: { estado: Estado }) {
  return (
    <span aria-hidden="true" className={`flex size-[4.5rem] items-center justify-center rounded-full border-[1.5px] border-texto ${FONDO[estado]}`}>
      <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Dibujo estado={estado} />
      </svg>
    </span>
  )
}
