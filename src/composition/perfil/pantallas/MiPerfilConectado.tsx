import { textosFundadores } from '@/modules/fundadores/language'
import { textosHabilidades } from '@/modules/habilidades/language'
import { obtenerPerfil } from '@/modules/perfil/application/obtenerPerfil'
import { textosPerfil } from '@/modules/perfil/language'
import { MiPerfilView } from '@/modules/perfil/presentation/MiPerfilView'
import type { PasosPerfil } from '@/modules/perfil/presentation/pasos'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { guardarEvidenciaAccion, guardarSobreMiAccion, guardarTrayectoriaAccion } from '@/composition/perfil/acciones/accionesPerfil'
import { crearPerfilRepository } from '@/composition/perfil/fabricas/perfil'

// Aquí se juntan tres módulos: el perfil trae lo suyo del backend, y los nombres de los pasos donde se corrige cada cosa salen
// de los módulos dueños de esos pasos (fundadores y habilidades), para que el nombre siga definido en un solo lugar.
export async function MiPerfilConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosPerfil(idioma)
  const resultado = await obtenerPerfil(crearPerfilRepository())

  if (!resultado.ok) {
    return (
      <p role="alert" className="text-parrafo mx-auto w-full max-w-[80rem] px-6 py-10 md:px-12">
        {textos.errorCarga}
      </p>
    )
  }

  const habilidades = textosHabilidades(idioma)
  const pasos: PasosPerfil = {
    bienvenida: { nombre: textosFundadores(idioma).bienvenida.busca.titulo, href: `/${idioma}/bienvenida` },
    tareas: { nombre: habilidades.tareas.titulo, href: `/${idioma}/habilidades/tareas` },
    historias: { nombre: habilidades.historias.titulo, href: `/${idioma}/habilidades/historias` },
    forma: { nombre: habilidades.forma.titulo, href: `/${idioma}/habilidades/forma` },
  }

  return (
    <MiPerfilView
      textos={textos}
      perfil={resultado.perfil}
      pasos={pasos}
      acciones={{ sobreMi: guardarSobreMiAccion, trayectoria: guardarTrayectoriaAccion, evidencia: guardarEvidenciaAccion }}
    />
  )
}
