import type { TextosAcceso } from '../../language/tipos'
import { BotonGoogle } from './BotonGoogle'

type Props = {
  textos: TextosAcceso
  cargando: boolean
  aviso?: 'limite' | 'fallo' | 'rechazada'
  alPulsar: () => void
}

// "Continuar con Google" y, debajo, el separador hacia el formulario con correo y contraseña.
export function AccesoGoogle({ textos, cargando, aviso, alPulsar }: Props) {
  const g = textos.google

  return (
    <div className="mt-7">
      <BotonGoogle texto={g.continuar} alPulsar={alPulsar} deshabilitado={cargando} />
      {aviso && (
        <p role="alert" className="text-cuerpo mt-3 text-center font-medium">
          {aviso === 'rechazada' ? textos.avisos.google : textos.avisos[aviso]}
        </p>
      )}
      <p aria-hidden="true" className="text-etiqueta-chica mt-6 flex items-center gap-4 text-texto-tenue">
        <span className="h-px flex-1 bg-texto/25" />
        {g.separador}
        <span className="h-px flex-1 bg-texto/25" />
      </p>
    </div>
  )
}
