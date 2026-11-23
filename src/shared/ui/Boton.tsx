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
  /** Ocupa todo el ancho disponible, con el texto a la izquierda y la flecha a la derecha */
  anchoCompleto?: boolean
  /** Cursor cuando está deshabilitado: «espera» mientras se envía, «bloqueado» si falta algo por completar */
  cursorDeshabilitado?: 'espera' | 'bloqueado'
  children: ReactNode
}

// Botón de acción con el mismo aspecto que EnlaceBoton (contorno por defecto, o lleno).
export function Boton({ alPulsar, tipo = 'button', flechaAbajo = false, lleno = false, deshabilitado = false, anchoCompleto = false, cursorDeshabilitado = 'espera', children }: Props) {
  return (
    <button
      type={tipo}
      onClick={alPulsar}
      disabled={deshabilitado}
      className={`${claseBoton(lleno)} disabled:opacity-60 ${
        cursorDeshabilitado === 'espera' ? 'disabled:cursor-wait' : 'disabled:cursor-not-allowed'
      } ${lleno ? 'disabled:hover:bg-texto disabled:hover:text-fondo' : 'disabled:hover:bg-transparent disabled:hover:text-texto'} ${anchoCompleto ? 'w-full justify-between' : ''}`}
    >
      {children}
      <CirculoFlecha lleno={lleno} abajo={flechaAbajo} />
    </button>
  )
}
