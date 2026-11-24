import type { PersonaHistoria } from '../../domain/Historia'
import { colorArea } from './coloresArea'

type Props = {
  personas: PersonaHistoria[]
  /** Nombre accesible de la lista */
  etiqueta: string
}

// Las personas de una historia: círculos grandes que se cruzan, cada uno con el color del área de su persona, y debajo su nombre
// y lo que aportó. Las iniciales van en vez de la foto y no se anuncian: el nombre ya lo dice.
export function PersonasHistoria({ personas, etiqueta }: Props) {
  return (
    <ul aria-label={etiqueta} className="flex items-start justify-center gap-4 escritorio:justify-end escritorio:gap-0">
      {personas.map((persona, lugar) => (
        <li
          key={persona.nombre}
          className={`flex flex-col items-center text-center ${lugar === 1 ? 'escritorio:-ml-14 escritorio:mt-8' : ''} ${lugar === 2 ? 'mt-2 escritorio:ml-3 escritorio:mt-4' : ''}`}
        >
          <span
            aria-hidden="true"
            data-area={persona.area}
            className={`flex items-center justify-center rounded-full border-[1.5px] border-texto font-serif ${colorArea[persona.area]} ${
              lugar < 2 ? 'text-cifra size-24 escritorio:size-48' : 'text-titulo-tarjeta-grande size-16 escritorio:size-28'
            } ${lugar === 1 ? 'mix-blend-multiply' : ''}`}
          >
            {persona.iniciales}
          </span>
          <span className="text-cuerpo mt-3 max-w-28 escritorio:max-w-none">{persona.nombre}</span>
          <span className="text-etiqueta-chica">{persona.aporte}</span>
        </li>
      ))}
    </ul>
  )
}
