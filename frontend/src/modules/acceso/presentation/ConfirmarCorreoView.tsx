'use client'

import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { TextosAcceso } from '../language/tipos'
import type { AccionReenviar } from './components/ConfirmaCorreo'
import { PaginaCentrada } from './components/PaginaCentrada'
import { PedirOtroEnlace } from './components/PedirOtroEnlace'
import { useConfirmarCorreo, type AccionConfirmar } from './hooks/useConfirmarCorreo'

export type ConfirmarCorreoViewProps = {
  textos: TextosAcceso
  alConfirmar: AccionConfirmar
  alReenviar: AccionReenviar
  hrefInicioSesion: string
}

// La página a la que lleva el enlace del correo: confirma el correo y, si el enlace no vale, deja pedir otro.
// Un solo mensaje por estado, en una columna centrada.
export function ConfirmarCorreoView({ textos, alConfirmar, alReenviar, hrefInicioSesion }: ConfirmarCorreoViewProps) {
  const { estado, reintentar } = useConfirmarCorreo(alConfirmar)
  const t = textos.confirmar

  switch (estado.tipo) {
    case 'confirmando':
      return <PaginaCentrada icono="espera" etiqueta={t.etiqueta} titulo={t.confirmando} />
    case 'confirmado':
      return (
        <PaginaCentrada
          icono="confirmado"
          etiqueta={t.etiqueta}
          titulo={t.confirmado.titulo}
          parrafo={rellenarPlantilla(t.confirmado.texto, { correo: estado.correo })}
        >
          <EnlaceBoton href={hrefInicioSesion} variante="lleno">
            {t.confirmado.boton}
          </EnlaceBoton>
        </PaginaCentrada>
      )
    case 'invalido':
    case 'sinEnlace': {
      const texto = estado.tipo === 'invalido' ? t.invalido : t.sinEnlace
      return (
        <PaginaCentrada icono="aviso" etiqueta={t.etiqueta} titulo={texto.titulo} parrafo={texto.texto}>
          <PedirOtroEnlace textos={textos} alReenviar={alReenviar} />
        </PaginaCentrada>
      )
    }
    case 'limite':
    case 'fallo':
      return (
        <PaginaCentrada icono="aviso" etiqueta={t.etiqueta} titulo={t.error.titulo}>
          <p role="alert" className="text-cuerpo font-medium">
            {textos.avisos[estado.tipo]}
          </p>
          <div className="mt-7">
            <Boton alPulsar={reintentar}>{t.reintentar}</Boton>
          </div>
        </PaginaCentrada>
      )
  }
}
