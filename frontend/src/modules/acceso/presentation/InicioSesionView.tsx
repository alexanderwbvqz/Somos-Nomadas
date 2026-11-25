'use client'

import { useEffect } from 'react'
import type { TextosAcceso } from '../language/tipos'
import { FormularioInicioSesion } from './components/FormularioInicioSesion'
import { SesionIniciada } from './components/SesionIniciada'
import { useGoogle, type AccionGoogle } from './hooks/useGoogle'
import { useInicioSesion, type AccionIniciarSesion } from './hooks/useInicioSesion'
import { PaginaAcceso } from './components/PaginaAcceso'

export type InicioSesionViewProps = {
  textos: TextosAcceso
  alIniciar: AccionIniciarSesion
  /** Sin esta acción no se muestra «Continuar con Google» */
  alContinuarConGoogle?: AccionGoogle
  hrefRegistro: string
  /** Adónde lleva "Completar mi perfil" una vez dentro */
  hrefContinuar: string
}

// Pantalla de iniciar sesión (con Google o con correo y contraseña). Al entrar muestra un mensaje provisional:
// el panel todavía no existe.
export function InicioSesionView({ textos, alIniciar, alContinuarConGoogle, hrefRegistro, hrefContinuar }: InicioSesionViewProps) {
  const { datos, errores, enviando, aviso, correoDentro, enfoque, cambiar, enviar } = useInicioSesion(alIniciar)
  const google = useGoogle(alContinuarConGoogle)
  const t = textos.inicio

  useEffect(() => {
    if (enfoque) document.getElementById(enfoque.id)?.focus()
  }, [enfoque])

  const correo = correoDentro ?? google.correo
  if (correo) return <SesionIniciada textos={textos} correo={correo} hrefContinuar={hrefContinuar} />

  return (
    <PaginaAcceso etiqueta={t.etiqueta} titulo={t.titulo} parrafo={t.parrafo}>
      <FormularioInicioSesion
        textos={textos}
        datos={datos}
        errores={errores}
        enviando={enviando}
        aviso={aviso}
        cambiar={cambiar}
        alEnviar={enviar}
        google={alContinuarConGoogle ? { cargando: google.cargando, aviso: google.aviso, alPulsar: google.continuar } : undefined}
        hrefRegistro={hrefRegistro}
      />
    </PaginaAcceso>
  )
}
