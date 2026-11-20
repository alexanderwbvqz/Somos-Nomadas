'use client'

import { useEffect } from 'react'
import type { TextosAcceso } from '../language/tipos'
import { ConfirmaCorreo, type AccionReenviar } from './components/ConfirmaCorreo'
import { FormularioRegistro } from './components/FormularioRegistro'
import { useRegistro, type AccionRegistrar } from './hooks/useRegistro'
import { PaginaAcceso } from './ui/PaginaAcceso'

export type RegistroViewProps = {
  textos: TextosAcceso
  alRegistrar: AccionRegistrar
  alReenviar: AccionReenviar
  hrefInicioSesion: string
  hrefPolitica: string
}

// Pantalla de crear cuenta: el formulario y, una vez enviado, la confirmación de que el enlace va en camino.
export function RegistroView({ textos, alRegistrar, alReenviar, hrefInicioSesion, hrefPolitica }: RegistroViewProps) {
  const { datos, errores, enviando, aviso, correoEnviado, enfoque, cambiar, enviar, volverAlFormulario } = useRegistro(alRegistrar)

  // Si hay un error, el foco va al primer campo con problema
  useEffect(() => {
    if (enfoque) document.getElementById(enfoque.id)?.focus()
  }, [enfoque])

  if (correoEnviado) {
    const c = textos.confirmacion
    return (
      <PaginaAcceso etiqueta={c.etiqueta} titulo={c.titulo} parrafo={c.parrafo}>
        <ConfirmaCorreo textos={textos} correo={correoEnviado} alReenviar={alReenviar} alCambiarCorreo={volverAlFormulario} />
      </PaginaAcceso>
    )
  }

  const t = textos.registro
  return (
    <PaginaAcceso
      etiqueta={t.etiqueta}
      titulo={t.titulo}
      parrafo={t.parrafo}
      izquierda={
        <ol className="mt-10 max-w-md border-t-[1.5px] border-texto">
          {t.pasos.map((paso, indice) => (
            <li key={paso.titulo} className="grid grid-cols-[2.25rem_1fr] items-baseline gap-3 border-b border-borde/15 py-4">
              <span className="text-etiqueta-chica">{String(indice + 1).padStart(2, '0')}</span>
              <span>
                <b className="text-parrafo block font-medium">{paso.titulo}</b>
                <span className="text-cuerpo mt-0.5 block opacity-75">{paso.texto}</span>
              </span>
            </li>
          ))}
        </ol>
      }
    >
      <FormularioRegistro
        textos={textos}
        datos={datos}
        errores={errores}
        enviando={enviando}
        aviso={aviso}
        cambiar={cambiar}
        alEnviar={enviar}
        hrefInicioSesion={hrefInicioSesion}
        hrefPolitica={hrefPolitica}
      />
    </PaginaAcceso>
  )
}
