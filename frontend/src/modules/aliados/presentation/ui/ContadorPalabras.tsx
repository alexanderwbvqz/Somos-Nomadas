import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { LIMITES } from '../../domain/postulacion'
import type { TextosPostulacion } from '../../language/tipos'

export function ContadorPalabras({ textos: t, palabras }: { textos: TextosPostulacion['aporte']; palabras: number }) {
  const dentro = palabras >= LIMITES.palabrasMin && palabras <= LIMITES.palabrasMax
  const desvio =
    palabras < LIMITES.palabrasMin
      ? rellenarPlantilla(t.faltan, { n: LIMITES.palabrasMin - palabras })
      : palabras > LIMITES.palabrasMax
        ? rellenarPlantilla(t.sobran, { n: palabras - LIMITES.palabrasMax })
        : ''
  return (
    <span className="text-nota flex-none font-medium">
      {dentro && <span aria-hidden="true">✓ </span>}
      {rellenarPlantilla(t.palabras, { n: palabras })}
      {desvio && ` · ${desvio}`}
    </span>
  )
}
