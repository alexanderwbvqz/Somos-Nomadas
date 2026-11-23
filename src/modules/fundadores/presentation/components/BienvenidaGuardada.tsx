import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { TextosFundadores } from '../../language/tipos'
import { TarjetaBienvenida } from '../ui/TarjetaBienvenida'

type Props = {
  textos: TextosFundadores['bienvenida']
  nombre: string
  hrefInicio: string
}

// Lo que se ve al guardar la bienvenida mientras no exista el directorio.
export function BienvenidaGuardada({ textos, nombre, hrefInicio }: Props) {
  const t = textos.listo
  return (
    <TarjetaBienvenida>
      <p className="text-etiqueta-chica">{t.etiqueta}</p>
      <h1 className="text-titulo-seccion mt-4">{rellenarPlantilla(t.titulo, { nombre })}</h1>
      <p className="text-parrafo mt-3 opacity-80">{t.texto}</p>
      <div className="mt-8 flex">
        <EnlaceBoton href={hrefInicio}>{t.volver}</EnlaceBoton>
      </div>
    </TarjetaBienvenida>
  )
}
