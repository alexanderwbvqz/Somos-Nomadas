import { fuerzaDeClave } from '../../domain/cuenta'
import type { TextosAcceso } from '../../language/tipos'

export function FuerzaClave({ clave, textos }: { clave: string; textos: TextosAcceso['registro']['fuerza'] }) {
  const nivel = fuerzaDeClave(clave)
  const palabra = clave === '' ? textos.minimo : [textos.muyCorta, textos.aceptable, textos.buena, textos.fuerte][nivel]
  return (
    <div id="fuerza-clave" className="mt-2.5 flex items-center gap-3">
      <span aria-hidden="true" className="grid w-28 grid-cols-3 gap-1">
        {[1, 2, 3].map((barra) => (
          <span key={barra} className={`h-1.5 rounded-full ${barra <= nivel && clave !== '' ? 'bg-texto' : 'bg-texto/15'}`} />
        ))}
      </span>
      <span className="text-nota">{palabra}</span>
    </div>
  )
}
