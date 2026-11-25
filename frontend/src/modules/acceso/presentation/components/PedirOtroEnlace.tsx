'use client'

import { useState, type FormEvent } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { CampoTexto } from '@/shared/ui/CampoTexto'
import { LIMITES_CUENTA } from '../../domain/cuenta'
import type { TextosAcceso } from '../../language/tipos'
import type { AccionReenviar } from './ConfirmaCorreo'

type Props = { textos: TextosAcceso; alReenviar: AccionReenviar }

// Pedir un enlace nuevo escribiendo el correo, para cuando no se tiene el enlace o el que se tiene ya no vale.
// La respuesta no dice si el correo tiene cuenta: el mensaje es el mismo en los dos casos.
export function PedirOtroEnlace({ textos, alReenviar }: Props) {
  const t = textos.confirmar.otroEnlace
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<'enviado' | 'limite' | 'fallo' | undefined>()

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (enviando) return
    setEnviando(true)
    setResultado(undefined)
    try {
      const respuesta = await alReenviar(correo)
      setResultado(respuesta.ok ? 'enviado' : respuesta.motivo)
    } catch {
      setResultado('fallo')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form noValidate onSubmit={enviar} className="grid gap-5">
      <h2 className="text-titulo-seccion">{t.texto}</h2>
      <CampoTexto
        clave="correo-otro-enlace"
        etiqueta={textos.campos.correo}
        tipo="email"
        inputMode="email"
        autoComplete="email"
        placeholder={textos.campos.correoEjemplo}
        maxLength={LIMITES_CUENTA.correo * 2}
        valor={correo}
        alCambiar={setCorreo}
      />
      <div>
        <Boton tipo="submit" lleno deshabilitado={enviando}>
          {enviando ? t.enviando : t.boton}
        </Boton>
      </div>
      <p role="status" className="text-cuerpo min-h-5 font-medium">
        {resultado === 'enviado' ? t.enviado : resultado ? textos.avisos[resultado] : ''}
      </p>
    </form>
  )
}
