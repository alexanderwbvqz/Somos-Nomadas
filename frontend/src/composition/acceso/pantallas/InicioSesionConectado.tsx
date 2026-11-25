import { textosAcceso } from '@/modules/acceso/language'
import { InicioSesionView } from '@/modules/acceso/presentation/InicioSesionView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { continuarConGoogleAccion, iniciarSesionAccion } from '@/composition/acceso/acciones/accionesAcceso'
import { googleDisponible } from '@/composition/acceso/fabricas/cuentas'
import { BarraEnfocadaConectado } from '@/composition/sitio/pantallas/BarraEnfocadaConectado'

export function InicioSesionConectado({ idioma }: { idioma: Idioma }) {
  return (
    <>
      <BarraEnfocadaConectado idioma={idioma} />
      <main className="flex-1">
        <InicioSesionView
          textos={textosAcceso(idioma)}
          alIniciar={iniciarSesionAccion}
          alContinuarConGoogle={googleDisponible() ? continuarConGoogleAccion : undefined}
          hrefRegistro={`/${idioma}/registro`}
          hrefContinuar={`/${idioma}/bienvenida`}
        />
      </main>
    </>
  )
}
