import { confirmarCorreoAccion, reenviarConfirmacionAccion } from '@/composition/acceso/acciones/accionesAcceso'
import { BarraEnfocadaConectado } from '@/composition/sitio/pantallas/BarraEnfocadaConectado'
import { textosAcceso } from '@/modules/acceso/language'
import { ConfirmarCorreoView } from '@/modules/acceso/presentation/ConfirmarCorreoView'
import type { Idioma } from '@/shared/idiomas/idiomas'

export function ConfirmarCorreoConectado({ idioma }: { idioma: Idioma }) {
  return (
    <>
      <BarraEnfocadaConectado idioma={idioma} />
      <main className="flex-1">
        <ConfirmarCorreoView
          textos={textosAcceso(idioma)}
          alConfirmar={confirmarCorreoAccion}
          alReenviar={reenviarConfirmacionAccion.bind(null, idioma)}
          hrefInicioSesion={`/${idioma}/iniciar-sesion`}
        />
      </main>
    </>
  )
}
