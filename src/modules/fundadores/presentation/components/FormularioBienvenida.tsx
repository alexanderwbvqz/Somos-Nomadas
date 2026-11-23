import type { FormEvent } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { CampoLista } from '@/shared/ui/CampoLista'
import { CampoTexto } from '@/shared/ui/Campos'
import { LIMITES_PERFIL, paises, type Busqueda, type DatosBienvenida, type ErroresBienvenida } from '../../domain/perfil'
import type { TextosFundadores } from '../../language/tipos'
import { mensajeDeErrorPerfil } from '../mappers/mensajesError'
import { OpcionesBusqueda } from './OpcionesBusqueda'

type Props = {
  textos: TextosFundadores['bienvenida']
  datos: DatosBienvenida
  errores: ErroresBienvenida
  enviando: boolean
  /** Falta algo por completar: el botón de enviar sigue apagado */
  completo: boolean
  aviso?: 'limite' | 'fallo'
  cambiar: (campo: 'nombre' | 'apellidos' | 'pais' | 'ciudad', valor: string) => void
  alternar: (opcion: Busqueda) => void
  alEnviar: () => void
}

// Formulario de la bienvenida: nombre y apellidos, país y ciudad, y qué busca. El botón se activa al completarlo.
export function FormularioBienvenida({ textos, datos, errores, enviando, completo, aviso, cambiar, alternar, alEnviar }: Props) {
  const c = textos.campos
  const error = (campo: keyof ErroresBienvenida) => mensajeDeErrorPerfil(textos, campo, errores[campo])

  function alEnviarFormulario(evento: FormEvent) {
    evento.preventDefault()
    alEnviar()
  }

  return (
    <form noValidate onSubmit={alEnviarFormulario} className="mt-8 grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <CampoTexto
          clave="nombre"
          etiqueta={c.nombre}
          autoComplete="given-name"
          placeholder={c.nombreEjemplo}
          maxLength={LIMITES_PERFIL.nombre}
          valor={datos.nombre}
          alCambiar={(valor) => cambiar('nombre', valor)}
          error={error('nombre')}
        />
        <CampoTexto
          clave="apellidos"
          etiqueta={c.apellidos}
          autoComplete="family-name"
          placeholder={c.apellidosEjemplo}
          maxLength={LIMITES_PERFIL.apellidos}
          valor={datos.apellidos}
          alCambiar={(valor) => cambiar('apellidos', valor)}
          error={error('apellidos')}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <CampoLista
          clave="pais"
          etiqueta={c.pais}
          placeholder={c.paisPlaceholder}
          opciones={paises.map((pais) => ({ valor: pais, texto: textos.paises[pais] }))}
          valor={datos.pais}
          alCambiar={(valor) => cambiar('pais', valor)}
          error={error('pais')}
        />
        <CampoTexto
          clave="ciudad"
          etiqueta={
            <>
              {c.ciudad} <span className="font-normal opacity-65">{c.ciudadOpcional}</span>
            </>
          }
          autoComplete="address-level2"
          placeholder={c.ciudadEjemplo}
          maxLength={LIMITES_PERFIL.ciudad}
          valor={datos.ciudad}
          alCambiar={(valor) => cambiar('ciudad', valor)}
          error={error('ciudad')}
        />
      </div>

      <OpcionesBusqueda textos={textos} marcadas={datos.busca} alAlternar={alternar} error={error('busca')} />

      {aviso && (
        <p role="alert" className="text-cuerpo flex items-start gap-2.5 rounded-xl border-2 border-primario px-4 py-3 font-medium">
          <span aria-hidden="true" className="text-etiqueta-chica mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-primario leading-none text-tarjeta">
            !
          </span>
          <span>{textos.avisos[aviso]}</span>
        </p>
      )}

      <div>
        <Boton tipo="submit" lleno anchoCompleto deshabilitado={enviando || !completo} cursorDeshabilitado={enviando ? 'espera' : 'bloqueado'}>
          {enviando ? textos.enviando : textos.enviar}
        </Boton>
      </div>
    </form>
  )
}
