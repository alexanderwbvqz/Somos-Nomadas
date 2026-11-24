import Image from 'next/image'
import { foco } from '@/shared/ui/EnlaceBoton'

type Props = {
  /** "Continuar con Google" en el idioma de la persona */
  texto: string
  alPulsar: () => void
  deshabilitado?: boolean
}

// Botón de Google con su logo oficial (public/logo/google.svg), a ancho completo.
export function BotonGoogle({ texto, alPulsar, deshabilitado = false }: Props) {
  return (
    <button
      type="button"
      onClick={alPulsar}
      disabled={deshabilitado}
      className={`text-parrafo inline-flex w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-borde-campo bg-tarjeta px-6 py-3 font-medium text-texto hover:bg-suave disabled:cursor-wait disabled:opacity-60 ${foco}`}
    >
      <Image src="/logo/google.svg" alt="" width={20} height={20} unoptimized aria-hidden="true" />
      {texto}
    </button>
  )
}
