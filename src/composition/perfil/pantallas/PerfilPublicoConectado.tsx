import { obtenerPerfil } from '@/modules/perfil/application/obtenerPerfil'
import { perfilPublico } from '@/modules/perfil/domain/perfilPublico'
import { textosPerfil } from '@/modules/perfil/language'
import { PerfilPublicoView } from '@/modules/perfil/presentation/PerfilPublicoView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { crearPerfilRepository } from '@/composition/perfil/fabricas/perfil'

// «Ver como me ven»: lee el mismo perfil que Mi perfil y enseña solo lo que decide el dominio que ve otra persona.
export async function PerfilPublicoConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosPerfil(idioma)
  const resultado = await obtenerPerfil(crearPerfilRepository())

  if (!resultado.ok) {
    return (
      <p role="alert" className="text-parrafo mx-auto w-full max-w-[50rem] px-6 py-10">
        {textos.errorCarga}
      </p>
    )
  }

  return <PerfilPublicoView textos={textos} perfil={perfilPublico(resultado.perfil)} hrefVolver={`/${idioma}/perfil`} />
}
