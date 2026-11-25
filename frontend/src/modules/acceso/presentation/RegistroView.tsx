'use client'

import { useEffect } from 'react'
import type { TextosAcceso } from '../language/tipos'
import { ConfirmaCorreo, type AccionReenviar } from './components/ConfirmaCorreo'
import { FormularioRegistro } from './components/FormularioRegistro'
import { SesionIniciada } from './components/SesionIniciada'
import { useGoogle, type AccionGoogle } from './hooks/useGoogle'
import { useRegistro, type AccionRegistrar } from './hooks/useRegistro'
import { PaginaAcceso } from './components/PaginaAcceso'

export type RegistroViewProps = {
  textos: TextosAcceso
  alRegistrar: AccionRegistrar
  alReenviar: AccionReenviar
  /** Sin esta acción no se muestra «Continuar con Google» */
  alContinuarConGoogle?: AccionGoogle
  hrefInicioSesion: string
  hrefPolitica: string
  /** Adónde lleva "Completar mi perfil" una vez dentro */
  hrefContinuar: string
}

// Pantalla de crear cuenta: el formulario (con Google o con correo y contraseña) y, si fue con correo, la
// confirmación de que el enlace va en camino. Con Google entra directo: su correo ya viene verificado.
export function RegistroView({ textos, alRegistrar, alReenviar, alContinuarConGoogle, hrefInicioSesion, hrefPolitica, hrefContinuar }: RegistroViewProps) {
  const { datos, errores, enviando, aviso, correoEnviado, enfoque, cambiar, enviar, volverAlFormulario } = useRegistro(alRegistrar)
  const google = useGoogle(alContinuarConGoogle)

  // Si hay un error, el foco va al primer campo con problema
  useEffect(() => {
    if (enfoque) document.getElementById(enfoque.id)?.focus()
  }, [enfoque])

  if (google.correo) return <SesionIniciada textos={textos} correo={google.correo} hrefContinuar={hrefContinuar} />

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
                <span className="text-cuerpo mt-0.5 block text-texto-suave">{paso.texto}</span>
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
        google={alContinuarConGoogle ? { cargando: google.cargando, aviso: google.aviso, alPulsar: google.continuar } : undefined}
        hrefInicioSesion={hrefInicioSesion}
        hrefPolitica={hrefPolitica}
      />
    </PaginaAcceso>
  )
}
