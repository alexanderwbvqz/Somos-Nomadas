import { foco } from '@/shared/ui/EnlaceBoton'
import type { TextosAcceso } from '../../language/tipos'
import { BotonGoogle } from '../ui/BotonGoogle'

type Props = {
  textos: TextosAcceso
  cargando: boolean
  aviso?: 'limite' | 'fallo' | 'rechazada'
  alPulsar: () => void
  /** Si se da, bajo el botón va la nota de aceptar la política de datos (en crear cuenta) */
  hrefPolitica?: string
}

// "Continuar con Google" y, debajo, el separador hacia el formulario con correo y contraseña.
export function AccesoGoogle({ textos, cargando, aviso, alPulsar, hrefPolitica }: Props) {
  const g = textos.google

  return (
    <div className="mt-7">
      <BotonGoogle texto={g.continuar} alPulsar={alPulsar} deshabilitado={cargando} />
      {hrefPolitica && (
        <p className="text-nota mt-2.5 text-center opacity-75">
          {g.notaInicio}{' '}
          <a href={hrefPolitica} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-4 ${foco}`}>
            {g.notaEnlace}
          </a>
          .
        </p>
      )}
      {aviso && (
        <p role="alert" className="text-cuerpo mt-3 text-center font-medium">
          {aviso === 'rechazada' ? textos.avisos.google : textos.avisos[aviso]}
        </p>
      )}
      <p aria-hidden="true" className="text-etiqueta-chica mt-6 flex items-center gap-4 opacity-60">
        <span className="h-px flex-1 bg-texto/25" />
        {g.separador}
        <span className="h-px flex-1 bg-texto/25" />
      </p>
    </div>
  )
}
