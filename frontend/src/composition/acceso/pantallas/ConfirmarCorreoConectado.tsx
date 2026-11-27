import { confirmarCorreoAccion, reenviarConfirmacionAccion } from '@/composition/acceso/acciones/accionesAcceso'
import { BarraEnfocadaConectado } from '@/composition/sitio/pantallas/BarraEnfocadaConectado'
import { textosAcceso } from '@/modules/acceso/language'
import { ConfirmarCorreoView } from '@/modules/acceso/presentation/ConfirmarCorreoView'
import type { Idioma } from '@/shared/idiomas/idiomas'

export function ConfirmarCorreoConectado({ idioma }: { idioma: Idioma }) {
  return (
    <>
      <BarraEnfocadaConectado idioma={idioma} />
      {/* Flexible: la página se centra en el alto que queda bajo la barra */}
      <main className="flex flex-1 flex-col">
        <ConfirmarCorreoView
          textos={textosAcceso(idioma)}
          alConfirmar={confirmarCorreoAccion}
          alReenviar={reenviarConfirmacionAccion.bind(null, idioma)}
          hrefInicioSesion={`/${idioma}/iniciar-sesion`}
          hrefContinuar={`/${idioma}/bienvenida`}
        />
      </main>
    </>
  )
}
