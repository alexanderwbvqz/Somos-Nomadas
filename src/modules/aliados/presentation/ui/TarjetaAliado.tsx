import Image from 'next/image'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { Aliado } from '../../domain/Aliado'
import { colorTipoAliado } from './coloresTipoAliado'

/** Un aliado listo para mostrar en una tarjeta: lo que necesita, más su etiqueta de tipo y su enlace */
export type AliadoVista = Pick<Aliado, 'id' | 'nombre' | 'tipo' | 'descripcion' | 'logoSrc'> & { etiquetaTipo: string; href: string }

// Tarjeta de un aliado: bloque con su logo (o su nombre) sobre el color de su tipo, nombre, tipo, texto y "Leer más".
// La usan el listado de la red y los "más aliados de este tipo" de cada página de detalle.
export function TarjetaAliado({ aliado, textoLeerMas }: { aliado: AliadoVista; textoLeerMas: string }) {
  return (
    <>
      <div className={`flex h-36 items-center justify-center border-b-[1.5px] border-texto p-4 text-center ${colorTipoAliado[aliado.tipo]}`}>
        {aliado.logoSrc ? (
          <Image src={aliado.logoSrc} alt="" width={200} height={64} unoptimized className="h-16 w-auto" />
        ) : (
          <span aria-hidden="true" className="text-titulo-tarjeta texto-equilibrado">
            {aliado.nombre}
          </span>
        )}
      </div>
      <h3 className="text-titulo-tarjeta-grande mt-5">{aliado.nombre}</h3>
      <p className="text-etiqueta-chica mt-3">{aliado.etiquetaTipo}</p>
      {/* Tope de cinco líneas: red de seguridad para textos largos o columnas estrechas; el texto completo está en su página */}
      <p className="text-cuerpo mt-3 line-clamp-5 max-w-md">{aliado.descripcion}</p>
      <div className="mt-5">
        <EnlaceBoton href={aliado.href} variante="enlace">
          {textoLeerMas}
        </EnlaceBoton>
      </div>
    </>
  )
}
