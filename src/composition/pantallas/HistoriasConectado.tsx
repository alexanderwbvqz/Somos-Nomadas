import Link from 'next/link'
import { obtenerRespuestas } from '@/modules/habilidades/application/respuestas'
import { PASOS_TOTAL } from '@/modules/habilidades/domain/camino'
import { datosHistoriasVacios } from '@/modules/habilidades/domain/historias'
import { textosHabilidades } from '@/modules/habilidades/language'
import { HistoriasView } from '@/modules/habilidades/presentation/HistoriasView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { Progreso } from '@/shared/ui/Progreso'
import { guardarHistoriasAccion } from '@/composition/acciones/accionesRespuestas'
import { crearRespuestasRepository } from '@/composition/fabricas/respuestas'
import { BarraEnfocadaConectado } from './BarraEnfocadaConectado'

// Cuarto paso del recorrido de «de cero»: lo que la persona ya había escrito (si vuelve) se lee aquí y se le pasa a la vista.
export async function HistoriasConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const { historias } = await obtenerRespuestas(crearRespuestasRepository())

  const barra = (
    <BarraEnfocadaConectado
      idioma={idioma}
      centro={<Progreso texto={rellenarPlantilla(textos.comun.paso, { actual: 4, total: PASOS_TOTAL })} actual={4} total={PASOS_TOTAL} />}
      derecha={
        // provisional: todavía no existe el panel adonde llevar a quien salta; por ahora va al inicio del sitio
        <Link href={`/${idioma}`} className={`text-etiqueta-chica underline underline-offset-8 ${foco}`}>
          {textos.comun.saltar} <span aria-hidden="true">→</span>
        </Link>
      }
    />
  )

  return (
    <HistoriasView
      textos={textos}
      inicial={historias ?? datosHistoriasVacios()}
      alGuardar={guardarHistoriasAccion}
      barra={barra}
      hrefAtras={`/${idioma}/habilidades/profundizar`}
      hrefSiguiente={`/${idioma}/habilidades/forma`}
      hrefInformacion={`/${idioma}/politica-de-datos`}
    />
  )
}
