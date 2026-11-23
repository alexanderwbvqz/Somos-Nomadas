import Link from 'next/link'
import { PASOS_TOTAL } from '@/modules/habilidades/domain/recorrido'
import type { TextosHabilidades } from '@/modules/habilidades/language/tipos'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { areaTactil, foco } from '@/shared/ui/EnlaceBoton'
import { ProgresoPaso } from '@/shared/ui/ProgresoPaso'
import { BarraEnfocadaConectado } from '@/composition/sitio/pantallas/BarraEnfocadaConectado'

type Props = {
  idioma: Idioma
  textos: TextosHabilidades
  /** El número del paso, de 1 a PASOS_TOTAL */
  paso: number
  /** Cómo se llama el paso; va a la derecha del progreso */
  nombre: string
}

// Lo de arriba de cada paso del recorrido: la barra con el logo y «Saltar por ahora», y debajo el progreso.
export function BarraDePaso({ idioma, textos, paso, nombre }: Props) {
  return (
    <>
      <BarraEnfocadaConectado
        idioma={idioma}
        derecha={
          // provisional: todavía no existe el panel adonde llevar a quien salta; por ahora va al inicio del sitio
          <Link href={`/${idioma}`} className={`text-etiqueta-chica ${areaTactil} underline underline-offset-8 ${foco}`}>
            {textos.comun.saltar} <span aria-hidden="true">→</span>
          </Link>
        }
      />
      <ProgresoPaso texto={rellenarPlantilla(textos.comun.paso, { actual: paso, total: PASOS_TOTAL })} nombre={nombre} actual={paso} total={PASOS_TOTAL} />
    </>
  )
}
