import Link from 'next/link'
import { obtenerRespuestas } from '@/modules/habilidades/application/respuestas'
import { PASOS_TOTAL } from '@/modules/habilidades/domain/camino'
import { datosFormaVacios } from '@/modules/habilidades/domain/forma'
import { textosHabilidades } from '@/modules/habilidades/language'
import { FormaView } from '@/modules/habilidades/presentation/FormaView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { Progreso } from '@/shared/ui/Progreso'
import { guardarFormaAccion } from '@/composition/acciones/accionesRespuestas'
import { crearRespuestasRepository } from '@/composition/fabricas/respuestas'
import { BarraEnfocadaConectado } from './BarraEnfocadaConectado'

// Quinto y último paso de preguntas del recorrido de «de cero»: lo que ya había contestado (si vuelve) se lee aquí.
export async function FormaConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const { forma } = await obtenerRespuestas(crearRespuestasRepository())

  const barra = (
    <BarraEnfocadaConectado
      idioma={idioma}
      centro={<Progreso texto={rellenarPlantilla(textos.comun.paso, { actual: 5, total: PASOS_TOTAL })} actual={5} total={PASOS_TOTAL} />}
      derecha={
        // provisional: todavía no existe el panel adonde llevar a quien salta; por ahora va al inicio del sitio
        <Link href={`/${idioma}`} className={`text-etiqueta-chica underline underline-offset-8 ${foco}`}>
          {textos.comun.saltar} <span aria-hidden="true">→</span>
        </Link>
      }
    />
  )

  return (
    <FormaView
      textos={textos}
      inicial={forma ?? datosFormaVacios()}
      alGuardar={guardarFormaAccion}
      barra={barra}
      hrefAtras={`/${idioma}/habilidades/historias`}
      hrefSiguiente={`/${idioma}/habilidades/listo`}
    />
  )
}
