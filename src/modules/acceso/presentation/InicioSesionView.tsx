'use client'

import { useEffect } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { TextosAcceso } from '../language/tipos'
import { FormularioInicioSesion } from './components/FormularioInicioSesion'
import { useInicioSesion, type AccionIniciarSesion } from './hooks/useInicioSesion'
import { PaginaAcceso } from './ui/PaginaAcceso'

export type InicioSesionViewProps = {
  textos: TextosAcceso
  alIniciar: AccionIniciarSesion
  hrefRegistro: string
  /** Adónde lleva "Volver al inicio" una vez dentro, mientras no exista el panel */
  hrefInicio: string
}

// Pantalla de iniciar sesión. Al entrar muestra un saludo provisional: el panel todavía no existe.
export function InicioSesionView({ textos, alIniciar, hrefRegistro, hrefInicio }: InicioSesionViewProps) {
  const { datos, errores, enviando, aviso, sesion, enfoque, cambiar, enviar } = useInicioSesion(alIniciar)
  const t = textos.inicio

  useEffect(() => {
    if (enfoque) document.getElementById(enfoque.id)?.focus()
  }, [enfoque])

  if (sesion) {
    return (
      <PaginaAcceso
        etiqueta={t.etiqueta}
        titulo={rellenarPlantilla(t.dentro.titulo, { nombre: sesion.nombre })}
        parrafo={t.dentro.texto}
      >
        <div className="flex">
          <EnlaceBoton href={hrefInicio}>{t.dentro.volver}</EnlaceBoton>
        </div>
      </PaginaAcceso>
    )
  }

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
        hrefRegistro={hrefRegistro}
      />
    </PaginaAcceso>
  )
}
