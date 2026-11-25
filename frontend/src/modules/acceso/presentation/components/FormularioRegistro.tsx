import Link from 'next/link'
import type { FormEvent } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { CampoClave } from '@/shared/ui/CampoClave'
import { CampoTexto } from '@/shared/ui/CampoTexto'
import { Casilla } from '@/shared/ui/Casilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { LIMITES_CUENTA, type DatosRegistro, type ErroresRegistro } from '../../domain/cuenta'
import type { TextosAcceso } from '../../language/tipos'
import { mensajeDeErrorCuenta } from '../mappers/mensajesError'
import { AccesoGoogle } from '../ui/AccesoGoogle'
import { FuerzaClave } from '../ui/FuerzaClave'

type Props = {
  textos: TextosAcceso
  datos: DatosRegistro
  errores: ErroresRegistro
  enviando: boolean
  aviso?: 'limite' | 'fallo'
  cambiar: <K extends keyof DatosRegistro>(clave: K, valor: DatosRegistro[K]) => void
  alEnviar: () => void
  /** Sin esto no se muestra «Continuar con Google» */
  google?: { cargando: boolean; aviso?: 'limite' | 'fallo' | 'rechazada'; alPulsar: () => void }
  hrefInicioSesion: string
  hrefPolitica: string
}

// Formulario de crear cuenta: con Google, o con correo y contraseña (con un campo trampa contra robots). La casilla de la
// política de datos va antes del botón de crear cuenta, que sigue apagado mientras no se marque.
// Una cuenta es solo identidad; el nombre y el país se piden después, dentro, al completar el perfil.
export function FormularioRegistro({ textos, datos, errores, enviando, aviso, cambiar, alEnviar, google, hrefInicioSesion, hrefPolitica }: Props) {
  const t = textos.registro
  const error = (campo: keyof DatosRegistro) => mensajeDeErrorCuenta(textos, campo, errores[campo])

  function alEnviarFormulario(evento: FormEvent) {
    evento.preventDefault()
    alEnviar()
  }

  return (
    <>
      <h2 className="text-titulo-seccion">{t.tarjeta.titulo}</h2>
      <p className="text-parrafo mt-2 text-texto-suave">{t.tarjeta.intro}</p>

      {google && <AccesoGoogle textos={textos} cargando={google.cargando} aviso={google.aviso} alPulsar={google.alPulsar} />}

      <form noValidate onSubmit={alEnviarFormulario} className="relative mt-6 grid gap-6">
        <CampoTexto
          clave="correo"
          etiqueta={textos.campos.correo}
          tipo="email"
          inputMode="email"
          autoComplete="email"
          placeholder={textos.campos.correoEjemplo}
          maxLength={LIMITES_CUENTA.correo * 2}
          ayuda={t.correoAyuda}
          valor={datos.correo}
          alCambiar={(valor) => cambiar('correo', valor)}
          error={error('correo')}
        />

        <CampoClave
          clave="clave"
          etiqueta={textos.campos.clave}
          autoComplete="new-password"
          textos={textos.campos}
          maxLength={LIMITES_CUENTA.claveMax * 2}
          valor={datos.clave}
          alCambiar={(valor) => cambiar('clave', valor)}
          error={error('clave')}
          pie={<FuerzaClave clave={datos.clave} textos={t.fuerza} />}
          idPie="fuerza-clave"
        />

        <Casilla
          clave="aceptaPolitica"
          marcada={datos.aceptaPolitica}
          alCambiar={(marcada) => cambiar('aceptaPolitica', marcada)}
          error={error('aceptaPolitica')}
        >
          {t.politicaInicio}{' '}
          <a href={hrefPolitica} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-4 ${foco}`}>
            {t.politicaEnlace}
          </a>
          .
        </Casilla>

        {/* Campo trampa: una persona no lo ve ni lo rellena, un robot sí */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-0 overflow-hidden">
          <input
            type="text"
            name="sitio-secundario"
            tabIndex={-1}
            autoComplete="off"
            value={datos.sitioSecundario}
            onChange={(evento) => cambiar('sitioSecundario', evento.target.value)}
          />
        </div>

        {aviso && (
          <p role="alert" className="text-cuerpo font-medium">
            {textos.avisos[aviso]}
          </p>
        )}

        <div>
          <Boton
            tipo="submit"
            lleno
            deshabilitado={enviando || !datos.aceptaPolitica}
            cursorDeshabilitado={enviando ? 'espera' : 'bloqueado'}
          >
            {enviando ? t.enviando : t.enviar}
          </Boton>
          <p className="text-nota mt-3 text-texto-suave">{t.nota}</p>
        </div>
      </form>

      <p className="text-parrafo mt-7 border-t border-borde/15 pt-5">
        {t.pie.texto}{' '}
        <Link href={hrefInicioSesion} className={`font-medium underline underline-offset-4 ${foco}`}>
          {t.pie.enlace}
        </Link>
      </p>
    </>
  )
}
