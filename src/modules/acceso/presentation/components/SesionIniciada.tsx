import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { TextosAcceso } from '../../language/tipos'
import { PaginaAcceso } from '../ui/PaginaAcceso'

type Props = {
  textos: TextosAcceso
  correo: string
  hrefInicio: string
}

// Lo que se ve al entrar (con correo o con Google) mientras no exista el panel.
export function SesionIniciada({ textos, correo, hrefInicio }: Props) {
  const t = textos.dentro
  return (
    <PaginaAcceso etiqueta={t.etiqueta} titulo={t.titulo} parrafo={rellenarPlantilla(t.texto, { correo })}>
      <div className="flex">
        <EnlaceBoton href={hrefInicio}>{t.volver}</EnlaceBoton>
      </div>
    </PaginaAcceso>
  )
}
