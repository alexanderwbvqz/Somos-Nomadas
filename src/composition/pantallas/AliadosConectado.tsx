import { listarAliados } from '@/modules/aliados/application/listarAliados'
import { filtroDesde } from '@/modules/aliados/domain/aliados'
import { textosAliados } from '@/modules/aliados/language'
import { AliadosView } from '@/modules/aliados/presentation/AliadosView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { crearAliadoRepository } from '../fabricas/aliados'

type Props = {
  idioma: Idioma
  /** Valor de ?tipo= en la URL; lo inválido o ausente significa "todos" */
  tipo?: string
}

export async function AliadosConectado({ idioma, tipo }: Props) {
  const t = textosAliados(idioma)
  const aliados = await listarAliados(crearAliadoRepository())

  return (
    <AliadosView
      hero={t.hero}
      listado={{
        textos: t.listado,
        filtroInicial: filtroDesde(tipo),
        aliados: aliados.map((aliado) => ({
          ...aliado,
          etiquetaTipo: t.listado.tipos[aliado.tipo].singular,
          href: `/${idioma}/aliados/${aliado.id}`,
        })),
      }}
    />
  )
}
