import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'

// El nivel de una habilidad, de 1 a 5, como cinco puntos; el nivel se dice en el nombre accesible.
export function PuntosNivel({ nivel, etiqueta }: { nivel: number; /** Lleva {n}, por ejemplo «Nivel {n} de 5» */ etiqueta: string }) {
  return (
    <span role="img" aria-label={rellenarPlantilla(etiqueta, { n: nivel })} className="inline-flex flex-none gap-1">
      {[0, 1, 2, 3, 4].map((punto) => (
        <span key={punto} data-lleno={punto < nivel} className={`block size-[0.5625rem] rounded-full border-[1.3px] border-texto ${punto < nivel ? 'bg-texto' : ''}`} />
      ))}
    </span>
  )
}
