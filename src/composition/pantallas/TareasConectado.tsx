import Link from 'next/link'
import { obtenerRespuestas } from '@/modules/habilidades/application/respuestas'
import { PASOS_TOTAL } from '@/modules/habilidades/domain/camino'
import { textosHabilidades } from '@/modules/habilidades/language'
import { TareasView } from '@/modules/habilidades/presentation/TareasView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { Progreso } from '@/shared/ui/Progreso'
import { guardarTareasAccion } from '@/composition/acciones/accionesRespuestas'
import { crearRespuestasRepository } from '@/composition/fabricas/respuestas'
import { BarraEnfocadaConectado } from './BarraEnfocadaConectado'

// Segundo paso del recorrido de «de cero»: lo que la persona ya había marcado (si vuelve) se lee aquí y se le pasa a la vista.
export async function TareasConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const { marcas } = await obtenerRespuestas(crearRespuestasRepository())

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
    <TareasView
      textos={textos}
      marcasIniciales={marcas}
      alGuardar={guardarTareasAccion}
      barra={barra}
      hrefAtras={`/${idioma}/habilidades`}
      hrefSiguiente={`/${idioma}/habilidades/profundizar`}
    />
  )
}
