import { CabeceraAliado, type CabeceraAliadoProps } from './components/CabeceraAliado'
import { ContenidoAliado, tieneContenidoAliado, type ContenidoAliadoProps } from './components/ContenidoAliado'
import { FichaAliado, type FichaAliadoProps } from './components/FichaAliado'
import { SeccionMasAliados, type SeccionMasAliadosProps } from './components/SeccionMasAliados'

export type DetalleAliadoViewProps = {
  cabecera: CabeceraAliadoProps
  contenido: ContenidoAliadoProps
  ficha: FichaAliadoProps
  masAliados: SeccionMasAliadosProps
}

// Vista pura de la página de un aliado: recibe todo por props.
// Si el aliado no ha contado más que lo básico, la ficha ocupa el lugar del contenido.
export function DetalleAliadoView({ cabecera, contenido, ficha, masAliados }: DetalleAliadoViewProps) {
  const hayContenido = tieneContenidoAliado(contenido)

  return (
    <>
      <CabeceraAliado {...cabecera} />
      <div className="mx-auto grid w-full max-w-7xl items-start gap-12 px-6 py-14 escritorio:grid-cols-12 escritorio:gap-16 escritorio:px-12 escritorio:py-[4.5rem]">
        {hayContenido && (
          <div className="escritorio:col-span-7">
            <ContenidoAliado {...contenido} />
          </div>
        )}
        <div className={hayContenido ? 'escritorio:col-span-5' : 'max-w-xl escritorio:col-span-12'}>
          <FichaAliado {...ficha} />
        </div>
      </div>
      <SeccionMasAliados {...masAliados} />
    </>
  )
}
