import { textosAcceso } from '@/modules/acceso/language'
import { RegistroView } from '@/modules/acceso/presentation/RegistroView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { continuarConGoogleAccion, registrarCuentaAccion, reenviarConfirmacionAccion } from '@/composition/acceso/acciones/accionesAcceso'
import { googleDisponible } from '@/composition/acceso/fabricas/cuentas'
import { BarraEnfocadaConectado } from '@/composition/sitio/pantallas/BarraEnfocadaConectado'

export function RegistroConectado({ idioma }: { idioma: Idioma }) {
  return (
    <>
      <BarraEnfocadaConectado idioma={idioma} />
      <main className="flex-1">
        <RegistroView
          textos={textosAcceso(idioma)}
          alRegistrar={registrarCuentaAccion}
          alReenviar={reenviarConfirmacionAccion}
          alContinuarConGoogle={googleDisponible() ? continuarConGoogleAccion : undefined}
          hrefInicioSesion={`/${idioma}/iniciar-sesion`}
          hrefPolitica={`/${idioma}/politica-de-datos`}
          hrefContinuar={`/${idioma}/bienvenida`}
        />
      </main>
    </>
  )
}
