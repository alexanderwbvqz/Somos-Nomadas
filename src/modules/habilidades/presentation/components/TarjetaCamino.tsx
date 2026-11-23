import { Badge } from '@/shared/ui/Badge'
import type { Camino } from '../../domain/camino'
import type { TextosHabilidades } from '../../language/tipos'

type Props = {
  camino: Camino
  textos: TextosHabilidades['inicio']['caminos'][Camino]
  elegido: boolean
  disponible: boolean
  alElegir: (camino: Camino) => void
}

const iconos: Record<Camino, string> = {
  // Un documento
  escritas: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  // Una chispa
  cero: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
}

// Una opción para empezar. Es un radio de verdad (con el teclado se elige con las flechas); si no está disponible
// queda apagado y con su etiqueta («Pronto»).
export function TarjetaCamino({ camino, textos, elegido, disponible, alElegir }: Props) {
  return (
    <label className="relative block">
      <input
        type="radio"
        name="camino"
        value={camino}
        checked={elegido}
        disabled={!disponible}
        onChange={() => alElegir(camino)}
        className="peer sr-only"
      />
      <span
        className={`block h-full rounded-3xl border-2 p-6 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primario ${
          disponible
            ? 'cursor-pointer border-texto/20 bg-tarjeta peer-checked:border-texto peer-checked:ring-1 peer-checked:ring-texto'
            : 'cursor-not-allowed border-dashed border-texto/30 bg-suave'
        }`}
      >
        <span className="absolute right-5 top-5">
          <Badge tono={disponible ? 'oscuro' : 'suave'}>{textos.etiqueta}</Badge>
        </span>
        <span className={`block ${disponible ? '' : 'opacity-60'}`}>
          <span
            aria-hidden="true"
            className={`flex size-10 items-center justify-center rounded-full ${elegido ? 'bg-texto text-fondo' : 'bg-suave text-texto'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={iconos[camino]} />
            </svg>
          </span>
          <span className="text-titulo-tarjeta mt-4 block">{textos.titulo}</span>
          <span className="text-parrafo mt-2 block opacity-85">{textos.texto}</span>
          <span className="text-etiqueta-chica mt-4 block opacity-70">{textos.tiempo}</span>
        </span>
      </span>
    </label>
  )
}
