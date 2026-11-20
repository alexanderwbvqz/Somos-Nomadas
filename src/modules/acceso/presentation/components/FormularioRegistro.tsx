import Link from 'next/link'
import type { FormEvent } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { CampoClave } from '@/shared/ui/CampoClave'
import { Casilla, CampoSelect, CampoTexto } from '@/shared/ui/Campos'
import { foco } from '@/shared/ui/EnlaceBoton'
import {
  LIMITES_CUENTA,
  PAISES,
  fuerzaDeClave,
  type DatosRegistro,
  type ErroresRegistro,
} from '../../domain/cuenta'
import type { TextosAcceso } from '../../language/tipos'
import { mensajeDeErrorCuenta } from '../ui/mensajesError'

type Props = {
  textos: TextosAcceso
  datos: DatosRegistro
  errores: ErroresRegistro
  enviando: boolean
  aviso?: 'limite' | 'fallo'
  cambiar: <K extends keyof DatosRegistro>(clave: K, valor: DatosRegistro[K]) => void
  alEnviar: () => void
  hrefInicioSesion: string
  hrefPolitica: string
}

function FuerzaClave({ clave, textos }: { clave: string; textos: TextosAcceso['registro']['fuerza'] }) {
  const nivel = fuerzaDeClave(clave)
  const palabra = clave === '' ? textos.minimo : [textos.muyCorta, textos.aceptable, textos.buena, textos.fuerte][nivel]
  return (
    <div id="fuerza-clave" className="mt-2.5 flex items-center gap-3">
      <span aria-hidden="true" className="grid w-28 grid-cols-3 gap-1">
        {[1, 2, 3].map((barra) => (
          <span key={barra} className={`h-1.5 rounded-full ${barra <= nivel && clave !== '' ? 'bg-texto' : 'bg-texto/15'}`} />
        ))}
      </span>
      <span className="text-nota">{palabra}</span>
    </div>
  )
}

// Formulario de crear cuenta: nombre, apellidos, país, correo y contraseña, con un campo trampa contra robots.
export function FormularioRegistro({ textos, datos, errores, enviando, aviso, cambiar, alEnviar, hrefInicioSesion, hrefPolitica }: Props) {
  const t = textos.registro
  const error = (campo: keyof DatosRegistro) => mensajeDeErrorCuenta(textos, campo, errores[campo])

  function alEnviarFormulario(evento: FormEvent) {
    evento.preventDefault()
    alEnviar()
  }

  return (
    <>
      <h2 className="text-titulo-seccion">{t.tarjeta.titulo}</h2>
      <p className="text-parrafo mt-2 opacity-80">{t.tarjeta.intro}</p>

      <form noValidate onSubmit={alEnviarFormulario} className="relative mt-8 grid gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <CampoTexto
            clave="nombre"
            etiqueta={t.nombre}
            placeholder={t.nombreEjemplo}
            autoComplete="given-name"
            maxLength={LIMITES_CUENTA.nombre * 2}
            valor={datos.nombre}
            alCambiar={(valor) => cambiar('nombre', valor)}
            error={error('nombre')}
          />
          <CampoTexto
            clave="apellidos"
            etiqueta={t.apellidos}
            placeholder={t.apellidosEjemplo}
            autoComplete="family-name"
            maxLength={LIMITES_CUENTA.apellidos * 2}
            valor={datos.apellidos}
            alCambiar={(valor) => cambiar('apellidos', valor)}
            error={error('apellidos')}
          />
        </div>

        <CampoSelect
          clave="pais"
          etiqueta={t.pais}
          placeholder={t.paisElige}
          autoComplete="country-name"
          valor={datos.pais}
          alCambiar={(valor) => cambiar('pais', valor as DatosRegistro['pais'])}
          opciones={PAISES.map((pais) => ({ valor: pais, texto: textos.paises[pais] }))}
          error={error('pais')}
        />

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
          <Boton tipo="submit" lleno deshabilitado={enviando}>
            {enviando ? t.enviando : t.enviar}
          </Boton>
          <p className="text-nota mt-3 opacity-75">{t.nota}</p>
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
