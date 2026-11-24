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
    <ul aria-label={etiqueta} className="flex items-start justify-center escritorio:justify-end">
      {personas.map((persona, lugar) => (
        <li
          key={persona.nombre}
          className={`flex flex-col items-center text-center ${lugar > 0 ? '-ml-9 escritorio:-ml-14' : ''} ${lugar === 1 ? 'mt-4 escritorio:mt-8' : ''} ${lugar === 2 ? 'mt-2 escritorio:mt-10' : ''}`}
        >
          <span
            aria-hidden="true"
            data-area={persona.area}
            className={`flex items-center justify-center rounded-full border-[1.5px] border-texto font-serif ${colorArea[persona.area]} ${
              lugar < 2 ? 'text-cifra size-32 escritorio:size-48' : 'text-titulo-tarjeta-grande size-20 escritorio:size-28'
            } ${lugar === 1 ? 'mix-blend-multiply' : ''}`}
          >
            {persona.iniciales}
          </span>
          <span className="text-cuerpo mt-3">{persona.nombre}</span>
          <span className="text-etiqueta-chica">{persona.aporte}</span>
        </li>
      ))}
    </ul>
  )
}
