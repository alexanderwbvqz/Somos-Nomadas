import Link from 'next/link'
import { PASOS_TOTAL } from '@/modules/habilidades/domain/camino'
import { textosHabilidades } from '@/modules/habilidades/language'
import { EscritasView } from '@/modules/habilidades/presentation/EscritasView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { Progreso } from '@/shared/ui/Progreso'
import { analizarMaterialAccion } from '@/composition/acciones/accionesHabilidades'
import { BarraEnfocadaConectado } from './BarraEnfocadaConectado'

export function EscritasConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)

  const barra = (
    <BarraEnfocadaConectado
      idioma={idioma}
      centro={<Progreso texto={rellenarPlantilla(textos.comun.paso, { actual: 2, total: PASOS_TOTAL })} actual={2} total={PASOS_TOTAL} />}
      derecha={
        // provisional: todavía no existe el panel adonde llevar a quien salta; por ahora va al inicio del sitio
        <Link href={`/${idioma}`} className={`text-etiqueta-chica underline underline-offset-8 ${foco}`}>
          {textos.comun.saltar} <span aria-hidden="true">→</span>
        </Link>
      }
    />
  )

  return (
    <EscritasView
      textos={textos}
      alAnalizar={analizarMaterialAccion}
      barra={barra}
      hrefCambiarCamino={`/${idioma}/habilidades`}
      hrefInformacion={`/${idioma}/politica-de-datos`}
    />
  )
}
