import Link from 'next/link'
import type { FormEvent } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { CampoClave } from '@/shared/ui/CampoClave'
import { CampoTexto } from '@/shared/ui/CampoTexto'
import { foco } from '@/shared/ui/EnlaceBoton'
import { LIMITES_CUENTA, type DatosInicioSesion, type ErroresInicioSesion } from '../../domain/cuenta'
import type { TextosAcceso } from '../../language/tipos'
import { mensajeDeErrorCuenta } from '../mappers/mensajesError'
import { AccesoGoogle } from '../ui/AccesoGoogle'

type Props = {
  textos: TextosAcceso
  datos: DatosInicioSesion
  errores: ErroresInicioSesion
  enviando: boolean
  aviso?: 'credenciales' | 'limite' | 'sinConfirmar' | 'fallo'
  cambiar: (clave: keyof DatosInicioSesion, valor: string) => void
  alEnviar: () => void
  /** Sin esto no se muestra «Continuar con Google» */
  google?: { cargando: boolean; aviso?: 'limite' | 'fallo' | 'rechazada'; alPulsar: () => void }
  hrefRegistro: string
  /** Con el correo sin confirmar: pedir otro enlace al correo escrito */
  otroEnlace: { estado: 'listo' | 'enviando' | 'enviado' | 'limite' | 'fallo'; alPulsar: () => void }
}

// Formulario de iniciar sesión: con Google, o con correo y contraseña. Un aviso general cubre los datos que no
// corresponden, sin decir cuál de los dos falla.
export function FormularioInicioSesion({ textos, datos, errores, enviando, aviso, cambiar, alEnviar, google, hrefRegistro, otroEnlace }: Props) {
  const t = textos.inicio
  const error = (campo: keyof DatosInicioSesion) => mensajeDeErrorCuenta(textos, campo, errores[campo])

  function alEnviarFormulario(evento: FormEvent) {
    evento.preventDefault()
    alEnviar()
  }

  return (
    <>
      <h2 className="text-titulo-seccion">{t.tarjeta.titulo}</h2>
      <p className="text-parrafo mt-2 text-texto-suave">{t.tarjeta.intro}</p>

      {google && <AccesoGoogle textos={textos} cargando={google.cargando} aviso={google.aviso} alPulsar={google.alPulsar} />}

      {aviso && (
        <p role="alert" className="text-cuerpo mt-6 flex items-start gap-2.5 rounded-xl border-2 border-primario px-4 py-3 font-medium">
          <span aria-hidden="true" className="text-etiqueta-chica mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-primario leading-none text-tarjeta">
            !
          </span>
          <span>{aviso === 'credenciales' ? t.credenciales : textos.avisos[aviso]}</span>
        </p>
      )}
      {aviso === 'sinConfirmar' && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={otroEnlace.alPulsar}
            disabled={otroEnlace.estado === 'enviando'}
            className={`text-parrafo font-medium underline underline-offset-4 disabled:opacity-60 ${foco}`}
          >
            {otroEnlace.estado === 'enviando' ? t.otroEnlace.enviando : t.otroEnlace.boton}
          </button>
          <p role="status" className="text-cuerpo">
            {otroEnlace.estado === 'enviado'
              ? t.otroEnlace.enviado
              : otroEnlace.estado === 'limite' || otroEnlace.estado === 'fallo'
                ? textos.avisos[otroEnlace.estado]
                : ''}
          </p>
        </div>
      )}

      <form noValidate onSubmit={alEnviarFormulario} className="mt-6 grid gap-6">
        <CampoTexto
          clave="correo"
          etiqueta={textos.campos.correo}
          tipo="email"
          inputMode="email"
          autoComplete="email"
          placeholder={textos.campos.correoEjemplo}
          maxLength={LIMITES_CUENTA.correo * 2}
          valor={datos.correo}
          alCambiar={(valor) => cambiar('correo', valor)}
          error={error('correo')}
        />
        <CampoClave
          clave="clave"
          etiqueta={textos.campos.clave}
          autoComplete="current-password"
          textos={textos.campos}
          maxLength={LIMITES_CUENTA.claveMax * 2}
          valor={datos.clave}
          alCambiar={(valor) => cambiar('clave', valor)}
          error={error('clave')}
        />
        <div>
          <Boton tipo="submit" lleno deshabilitado={enviando}>
            {enviando ? t.enviando : t.enviar}
          </Boton>
        </div>
      </form>

      <p className="text-parrafo mt-7 border-t border-borde/15 pt-5">
        {t.pie.texto}{' '}
        <Link href={hrefRegistro} className={`font-medium underline underline-offset-4 ${foco}`}>
          {t.pie.enlace}
        </Link>
      </p>
    </>
  )
}
