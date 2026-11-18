import type { ReactNode } from 'react'
import { CirculoFlecha, claseBoton } from './EnlaceBoton'

type Props = {
  alPulsar: () => void
  /** Flecha hacia abajo, para acciones que muestran más contenido */
  flechaAbajo?: boolean
  children: ReactNode
}

// Botón de acción con el mismo aspecto que EnlaceBoton (variante contorno).
export function Boton({ alPulsar, flechaAbajo = false, children }: Props) {
  return (
    <button type="button" onClick={alPulsar} className={claseBoton(false)}>
      {children}
      <CirculoFlecha lleno={false} abajo={flechaAbajo} />
    </button>
  )
}
