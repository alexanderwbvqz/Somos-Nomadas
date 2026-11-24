import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { TextosAcceso } from '../../language/tipos'
import { PaginaAcceso } from './PaginaAcceso'

type Props = {
  textos: TextosAcceso
  correo: string
  hrefContinuar: string
}

// Lo que se ve al entrar (con correo o con Google) mientras no exista el panel.
export function SesionIniciada({ textos, correo, hrefContinuar }: Props) {
  const t = textos.dentro
  return (
    <PaginaAcceso etiqueta={t.etiqueta} titulo={t.titulo} parrafo={rellenarPlantilla(t.texto, { correo })}>
      <div className="flex">
        <EnlaceBoton href={hrefContinuar}>{t.continuar}</EnlaceBoton>
      </div>
    </PaginaAcceso>
  )
}
