import { textosFundadores } from '@/modules/fundadores/language'
import { BienvenidaView } from '@/modules/fundadores/presentation/BienvenidaView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { guardarBienvenidaAccion } from '@/composition/acciones/accionesFundadores'
import { BarraEnfocadaConectado } from './BarraEnfocadaConectado'

export function BienvenidaConectado({ idioma }: { idioma: Idioma }) {
  return (
    <BienvenidaView
      textos={textosFundadores(idioma)}
      alGuardar={guardarBienvenidaAccion}
      hrefSiguiente={`/${idioma}/habilidades/tareas`}
      barra={<BarraEnfocadaConectado idioma={idioma} />}
    />
  )
}
