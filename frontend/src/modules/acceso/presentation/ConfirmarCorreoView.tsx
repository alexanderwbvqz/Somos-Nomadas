'use client'

import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { TextosAcceso } from '../language/tipos'
import type { AccionReenviar } from './components/ConfirmaCorreo'
import { PaginaAcceso } from './components/PaginaAcceso'
import { PedirOtroEnlace } from './components/PedirOtroEnlace'
import { useConfirmarCorreo, type AccionConfirmar } from './hooks/useConfirmarCorreo'

export type ConfirmarCorreoViewProps = {
  textos: TextosAcceso
  alConfirmar: AccionConfirmar
  alReenviar: AccionReenviar
  hrefInicioSesion: string
}

// La página a la que lleva el enlace del correo: confirma el correo y, si el enlace no vale, deja pedir otro.
export function ConfirmarCorreoView({ textos, alConfirmar, alReenviar, hrefInicioSesion }: ConfirmarCorreoViewProps) {
  const { estado, reintentar } = useConfirmarCorreo(alConfirmar)
  const t = textos.confirmar

  switch (estado.tipo) {
    case 'confirmando':
      return (
        <PaginaAcceso etiqueta={t.etiqueta} titulo={t.confirmando} parrafo="">
          <p role="status" className="text-parrafo text-texto-suave">
            {t.confirmando}
          </p>
        </PaginaAcceso>
      )
    case 'confirmado':
      return (
        <PaginaAcceso
          etiqueta={t.etiqueta}
          titulo={t.confirmado.titulo}
          parrafo={rellenarPlantilla(t.confirmado.texto, { correo: estado.correo })}
        >
          <div className="flex">
            <EnlaceBoton href={hrefInicioSesion} variante="lleno">
              {t.confirmado.boton}
            </EnlaceBoton>
          </div>
        </PaginaAcceso>
      )
    case 'invalido':
    case 'sinEnlace': {
      const texto = estado.tipo === 'invalido' ? t.invalido : t.sinEnlace
      return (
        <PaginaAcceso etiqueta={t.etiqueta} titulo={texto.titulo} parrafo={texto.texto}>
          <PedirOtroEnlace textos={textos} alReenviar={alReenviar} />
        </PaginaAcceso>
      )
    }
    case 'limite':
    case 'fallo':
      return (
        <PaginaAcceso etiqueta={t.etiqueta} titulo={t.error.titulo} parrafo="">
          <p role="alert" className="text-cuerpo font-medium">
            {textos.avisos[estado.tipo]}
          </p>
          <div className="mt-6">
            <Boton alPulsar={reintentar}>{t.reintentar}</Boton>
          </div>
        </PaginaAcceso>
      )
  }
}
