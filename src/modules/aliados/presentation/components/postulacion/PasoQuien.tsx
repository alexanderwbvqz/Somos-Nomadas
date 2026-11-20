import { CampoTexto, MensajeError } from '@/shared/ui/Campos'
import { tiposAliado } from '@/modules/aliados/domain/Aliado'
import { LIMITES } from '@/modules/aliados/domain/postulacion'
import { colorTipoAliado } from '../../ui/coloresTipoAliado'
import { mensajeDeError, type PropsPaso } from './tiposPaso'

function InsigniaPrivado({ texto }: { texto: string }) {
  return <span className="text-etiqueta-chica ml-2 rounded-md bg-texto px-2 py-0.5 align-middle text-fondo">{texto}</span>
}

// Paso 1: cómo quiere sumarse la persona, el nombre que se mostrará y su contacto privado.
export function PasoQuien({ textos, datos, errores, cambiar }: PropsPaso) {
  const t = textos.quien
  const errorTipo = mensajeDeError(textos, errores.tipo)

  return (
    <div className="grid gap-6">
      <fieldset aria-describedby={errorTipo ? 'error-tipo' : undefined}>
        <legend className="text-parrafo mb-2 font-medium">{t.comoSumarte}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {tiposAliado.map((tipo, indice) => (
            <label key={tipo} className="cursor-pointer">
              <input
                id={indice === 0 ? 'campo-tipo' : undefined}
                type="radio"
                name="tipo"
                value={tipo}
                checked={datos.tipo === tipo}
                onChange={() => cambiar('tipo', tipo)}
                className="peer sr-only"
              />
              <span
                className={`block h-full rounded-2xl border-2 bg-tarjeta p-4 peer-checked:border-texto peer-checked:ring-2 peer-checked:ring-texto peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario ${
                  errorTipo ? 'border-primario' : 'border-texto/35'
                }`}
              >
                <span aria-hidden="true" className={`mb-3 block h-2.5 rounded ${colorTipoAliado[tipo]}`} />
                <span className="text-titulo-tarjeta block">{t.tipos[tipo].titulo}</span>
                <span className="text-nota mt-1.5 block opacity-80">{t.tipos[tipo].texto}</span>
              </span>
            </label>
          ))}
        </div>
        {errorTipo && <MensajeError id="error-tipo">{errorTipo}</MensajeError>}
      </fieldset>

      <CampoTexto
        clave="nombre"
        etiqueta={t.nombre}
        ayuda={t.nombreAyuda}
        placeholder={t.nombreEjemplo}
        autoComplete="organization"
        maxLength={LIMITES.nombre * 2}
        valor={datos.nombre}
        alCambiar={(valor) => cambiar('nombre', valor)}
        error={mensajeDeError(textos, errores.nombre)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <CampoTexto
          clave="personaContacto"
          etiqueta={t.persona}
          extraEtiqueta={<InsigniaPrivado texto={textos.formulario.privado} />}
          placeholder={t.personaEjemplo}
          autoComplete="name"
          maxLength={LIMITES.persona * 2}
          valor={datos.personaContacto}
          alCambiar={(valor) => cambiar('personaContacto', valor)}
          error={mensajeDeError(textos, errores.personaContacto)}
        />
        <CampoTexto
          clave="correo"
          etiqueta={t.correo}
          extraEtiqueta={<InsigniaPrivado texto={textos.formulario.privado} />}
          tipo="email"
          inputMode="email"
          placeholder={t.correoEjemplo}
          autoComplete="email"
          maxLength={LIMITES.correo * 2}
          valor={datos.correo}
          alCambiar={(valor) => cambiar('correo', valor)}
          error={mensajeDeError(textos, errores.correo)}
        />
      </div>

      <p className="text-cuerpo rounded-xl bg-suave px-4 py-3">{t.notaPrivada}</p>
    </div>
  )
}
