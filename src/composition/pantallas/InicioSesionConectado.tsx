import { textosAcceso } from '@/modules/acceso/language'
import { InicioSesionView } from '@/modules/acceso/presentation/InicioSesionView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { continuarConGoogleAccion, iniciarSesionAccion } from '@/composition/acciones/accionesAcceso'

export function InicioSesionConectado({ idioma }: { idioma: Idioma }) {
  return (
    <InicioSesionView
      textos={textosAcceso(idioma)}
      alIniciar={iniciarSesionAccion}
      alContinuarConGoogle={continuarConGoogleAccion}
      hrefRegistro={`/${idioma}/registro`}
      hrefInicio={`/${idioma}`}
    />
  )
}
