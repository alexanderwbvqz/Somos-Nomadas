import { textosFundadores } from '@/modules/fundadores/language'
import { BienvenidaView } from '@/modules/fundadores/presentation/BienvenidaView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { guardarBienvenidaAccion } from '@/composition/acciones/accionesFundadores'

export function BienvenidaConectado({ idioma }: { idioma: Idioma }) {
  return <BienvenidaView textos={textosFundadores(idioma)} alGuardar={guardarBienvenidaAccion} hrefInicio={`/${idioma}`} />
}
