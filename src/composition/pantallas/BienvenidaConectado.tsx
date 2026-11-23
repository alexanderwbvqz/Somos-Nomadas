import { textosFundadores } from '@/modules/fundadores/language'
import { BienvenidaView } from '@/modules/fundadores/presentation/BienvenidaView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Progreso } from '@/shared/ui/Progreso'
import { guardarBienvenidaAccion } from '@/composition/acciones/accionesFundadores'
import { BarraEnfocadaConectado } from './BarraEnfocadaConectado'

const PASOS_TOTAL = 2

export function BienvenidaConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosFundadores(idioma)
  // La barra cambia con el paso, y la vista (que sabe en cuál está) no conoce el sitio: se le pasan ya hechas
  const barra = (actual: number) => (
    <BarraEnfocadaConectado
      idioma={idioma}
      derecha={<Progreso texto={rellenarPlantilla(textos.bienvenida.paso, { actual, total: PASOS_TOTAL })} actual={actual} total={PASOS_TOTAL} />}
    />
  )

  return (
    <BienvenidaView
      textos={textos}
      alGuardar={guardarBienvenidaAccion}
      hrefInicio={`/${idioma}`}
      barraPaso1={barra(1)}
      barraPaso2={barra(2)}
    />
  )
}
