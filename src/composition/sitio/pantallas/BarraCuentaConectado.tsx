import { obtenerPerfil } from '@/modules/perfil/application/obtenerPerfil'
import { textosSitio } from '@/modules/sitio/language'
import { BarraCuentaConRuta } from '@/modules/sitio/presentation/BarraCuentaConRuta'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { crearPerfilRepository } from '@/composition/perfil/fabricas/perfil'

// Aquí se juntan dos módulos: las iniciales salen del perfil y se le pasan a la barra, que es de sitio y no conoce al perfil.
// Descubrir, Conversaciones y Guardados todavía no existen: van sin dirección, apagados y con «Pronto».
export async function BarraCuentaConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosSitio(idioma)
  const resultado = await obtenerPerfil(crearPerfilRepository())

  return (
    <BarraCuentaConRuta
      logoSrc="/logo/logo_somos_nomadas_oscuro.svg"
      logoAlt={textos.cabecera.logoAlt}
      hrefInicio={`/${idioma}`}
      etiquetaNavegacion={textos.cuenta.navegacion}
      enlaces={[
        { id: 'descubrir', etiqueta: textos.cuenta.descubrir },
        { id: 'conversaciones', etiqueta: textos.cuenta.conversaciones },
        { id: 'guardados', etiqueta: textos.cuenta.guardados },
      ]}
      pronto={textos.cuenta.pronto}
      perfil={{ etiqueta: textos.cuenta.miPerfil, href: `/${idioma}/perfil`, iniciales: resultado.ok ? resultado.perfil.ficha.iniciales : '' }}
    />
  )
}
