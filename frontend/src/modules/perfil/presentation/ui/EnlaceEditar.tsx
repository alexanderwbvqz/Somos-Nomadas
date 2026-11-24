import Link from 'next/link'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { areaTactil, foco } from '@/shared/ui/EnlaceBoton'
import type { TextosPerfil } from '../../language/tipos'
import type { PasoPerfil } from '../pasos'

// «Editar» lleva al paso del recorrido donde se corrige lo que muestra el bloque; para quien lee con lector de pantalla
// el nombre completo dice a cuál.
export function EnlaceEditar({ textos, paso }: { textos: TextosPerfil; paso: PasoPerfil }) {
  return (
    <Link href={paso.href} className={`text-etiqueta-chica ${areaTactil} underline underline-offset-[5px] ${foco}`}>
      {textos.editar}
      {' '}
      <span className="sr-only">{rellenarPlantilla(textos.editarEn, { paso: paso.nombre })}</span>
    </Link>
  )
}
