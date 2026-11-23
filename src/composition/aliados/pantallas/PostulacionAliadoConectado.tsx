import { textosAliados } from '@/modules/aliados/language'
import { PostulacionView } from '@/modules/aliados/presentation/PostulacionView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { enviarPostulacionAccion } from '@/composition/aliados/acciones/accionesPostulacion'

export function PostulacionAliadoConectado({ idioma }: { idioma: Idioma }) {
  const { postulacion } = textosAliados(idioma)

  return (
    <PostulacionView
      hero={postulacion.hero}
      como={postulacion.como}
      formulario={{
        textos: postulacion,
        alEnviar: enviarPostulacionAccion,
        hrefAliados: `/${idioma}/aliados`,
        hrefPolitica: `/${idioma}/politica-de-datos`,
      }}
    />
  )
}
