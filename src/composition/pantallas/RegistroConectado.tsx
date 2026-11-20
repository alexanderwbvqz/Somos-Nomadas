import { textosAcceso } from '@/modules/acceso/language'
import { RegistroView } from '@/modules/acceso/presentation/RegistroView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { registrarCuentaAccion, reenviarConfirmacionAccion } from '../accionesAcceso'

export function RegistroConectado({ idioma }: { idioma: Idioma }) {
  return (
    <RegistroView
      textos={textosAcceso(idioma)}
      alRegistrar={registrarCuentaAccion}
      alReenviar={reenviarConfirmacionAccion}
      hrefInicioSesion={`/${idioma}/iniciar-sesion`}
      hrefPolitica={`/${idioma}/politica-de-datos`}
    />
  )
}
