import type { ReactNode } from 'react'
import { CirculoFlecha, claseBoton } from './EnlaceBoton'

type Props = {
  /** Sin esto el botón no hace nada por sí solo; con `tipo="submit"` envía el formulario que lo contiene */
  alPulsar?: () => void
  /** button por defecto; submit para enviar un formulario */
  tipo?: 'button' | 'submit'
  /** Flecha hacia abajo, para acciones que muestran más contenido */
  flechaAbajo?: boolean
  /** Botón oscuro con flecha en círculo claro, para la acción principal */
  lleno?: boolean
  deshabilitado?: boolean
  children: ReactNode
}

// Botón de acción con el mismo aspecto que EnlaceBoton (contorno por defecto, o lleno).
export function Boton({ alPulsar, tipo = 'button', flechaAbajo = false, lleno = false, deshabilitado = false, children }: Props) {
  return (
    <button
      type={tipo}
      onClick={alPulsar}
      disabled={deshabilitado}
      className={`${claseBoton(lleno)} disabled:cursor-wait disabled:opacity-60`}
    >
      {children}
      <CirculoFlecha lleno={lleno} abajo={flechaAbajo} />
    </button>
  )
}
