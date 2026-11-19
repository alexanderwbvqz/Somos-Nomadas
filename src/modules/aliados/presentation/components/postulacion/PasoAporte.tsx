import { useState, type KeyboardEvent } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { CampoArea, CampoTexto, Etiqueta, MensajeError } from '@/shared/ui/Campos'
import { foco } from '@/shared/ui/EnlaceBoton'
import { contarPalabras, LIMITES } from '@/modules/aliados/domain/postulacion'
import { mensajeDeError, type PropsPaso } from './tiposPaso'

const claseControl =
  'w-full rounded-xl border-[1.5px] border-texto/45 bg-tarjeta px-4 py-3 text-base text-texto placeholder:text-texto/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario'

function BotonAnadir({ alPulsar, children }: { alPulsar: () => void; children: string }) {
  return (
    <button type="button" onClick={alPulsar} className={`text-nota mt-3 underline underline-offset-4 ${foco}`}>
      + {children}
    </button>
  )
}

function Opcional({ texto }: { texto: string }) {
  return <span className="text-etiqueta-chica ml-2 opacity-60">{texto}</span>
}

function ContadorPalabras({ textos, palabras }: Pick<PropsPaso, 'textos'> & { palabras: number }) {
  const t = textos.aporte
  const dentro = palabras >= LIMITES.palabrasMin && palabras <= LIMITES.palabrasMax
  const desvio =
    palabras < LIMITES.palabrasMin
      ? rellenarPlantilla(t.faltan, { n: LIMITES.palabrasMin - palabras })
      : palabras > LIMITES.palabrasMax
        ? rellenarPlantilla(t.sobran, { n: palabras - LIMITES.palabrasMax })
        : ''
  return (
    <span className="text-nota flex-none font-medium">
      {dentro && <span aria-hidden="true">✓ </span>}
      {rellenarPlantilla(t.palabras, { n: palabras })}
      {desvio && ` · ${desvio}`}
    </span>
  )
}

// Paso 2: lo que verán los emprendedores en la tarjeta y en la página del aliado.
export function PasoAporte({ textos, datos, errores, cambiar }: PropsPaso) {
  const t = textos.aporte
  const [areaPendiente, setAreaPendiente] = useState('')

  function anadirArea() {
    const nueva = areaPendiente.trim()
    setAreaPendiente('')
    if (nueva === '' || datos.areas.length >= LIMITES.maxAreas) return
    if (datos.areas.some((area) => area.toLowerCase() === nueva.toLowerCase())) return
    cambiar('areas', [...datos.areas, nueva])
  }

  function alPulsarTecla(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key !== 'Enter') return
    // Enter aquí añade el área; no debe enviar el formulario
    evento.preventDefault()
    anadirArea()
  }

  function cambiarApoyo(indice: number, valor: string) {
    cambiar('apoyos', datos.apoyos.map((apoyo, i) => (i === indice ? valor : apoyo)))
  }

  function cambiarDato(indice: number, campo: 'valor' | 'etiqueta', valor: string) {
    cambiar('datosClave', datos.datosClave.map((dato, i) => (i === indice ? { ...dato, [campo]: valor } : dato)))
  }

  const errorApoyos = mensajeDeError(textos, errores.apoyos)
  const errorAreas = mensajeDeError(textos, errores.areas)
  const errorDatos = mensajeDeError(textos, errores.datosClave)

  return (
    <div className="grid gap-6">
      <CampoArea
        clave="descripcionCorta"
        etiqueta={t.corta}
        ayuda={rellenarPlantilla(t.cortaAyuda, { min: LIMITES.palabrasMin, max: LIMITES.palabrasMax })}
        filas={4}
        valor={datos.descripcionCorta}
        alCambiar={(valor) => cambiar('descripcionCorta', valor)}
        error={mensajeDeError(textos, errores.descripcionCorta)}
        contador={<ContadorPalabras textos={textos} palabras={contarPalabras(datos.descripcionCorta)} />}
      />

      <CampoArea
        clave="descripcionLarga"
        etiqueta={t.larga}
        extraEtiqueta={<Opcional texto={textos.formulario.opcional} />}
        ayuda={t.largaAyuda}
        filas={5}
        maxLength={LIMITES.descripcionLarga * 2}
        valor={datos.descripcionLarga}
        alCambiar={(valor) => cambiar('descripcionLarga', valor)}
        error={mensajeDeError(textos, errores.descripcionLarga)}
      />

      <fieldset aria-describedby={errorApoyos ? 'error-apoyos' : undefined}>
        <legend className="text-parrafo mb-2 font-medium">
          {t.apoyos}
          <Opcional texto={textos.formulario.opcional} />
        </legend>
        <div className="grid gap-2.5">
          {datos.apoyos.map((apoyo, indice) => (
            <input
              key={indice}
              id={indice === 0 ? 'campo-apoyos' : undefined}
              type="text"
              aria-label={rellenarPlantilla(t.apoyoNumero, { n: indice + 1 })}
              maxLength={LIMITES.apoyo * 2}
              value={apoyo}
              onChange={(evento) => cambiarApoyo(indice, evento.target.value)}
              aria-invalid={errorApoyos ? true : undefined}
              className={claseControl}
            />
          ))}
        </div>
        {datos.apoyos.length < LIMITES.maxApoyos && (
          <BotonAnadir alPulsar={() => cambiar('apoyos', [...datos.apoyos, ''])}>{t.anadirApoyo}</BotonAnadir>
        )}
        {errorApoyos && <MensajeError id="error-apoyos">{errorApoyos}</MensajeError>}
      </fieldset>

      <div>
        <Etiqueta htmlFor="campo-areas">{t.areas}</Etiqueta>
        <input
          id="campo-areas"
          type="text"
          placeholder={t.areasAyuda}
          maxLength={LIMITES.area * 2}
          value={areaPendiente}
          onChange={(evento) => setAreaPendiente(evento.target.value)}
          onKeyDown={alPulsarTecla}
          onBlur={anadirArea}
          aria-invalid={errorAreas ? true : undefined}
          aria-describedby={errorAreas ? 'error-areas' : undefined}
          className={claseControl}
        />
        {datos.areas.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {datos.areas.map((area) => (
              <li key={area}>
                <button
                  type="button"
                  onClick={() => cambiar('areas', datos.areas.filter((otra) => otra !== area))}
                  aria-label={rellenarPlantilla(t.quitarArea, { area })}
                  className={`text-nota rounded-full border-[1.5px] border-texto px-3.5 py-1 hover:bg-texto hover:text-fondo ${foco}`}
                >
                  {area} <span aria-hidden="true">✕</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {errorAreas && <MensajeError id="error-areas">{errorAreas}</MensajeError>}
      </div>

      <CampoTexto
        clave="paraQuien"
        etiqueta={t.paraQuien}
        extraEtiqueta={<Opcional texto={textos.formulario.opcional} />}
        maxLength={LIMITES.paraQuien * 2}
        valor={datos.paraQuien}
        alCambiar={(valor) => cambiar('paraQuien', valor)}
        error={mensajeDeError(textos, errores.paraQuien)}
      />

      <fieldset aria-describedby={errorDatos ? 'error-datosClave' : undefined}>
        <legend className="text-parrafo mb-2 font-medium">
          {t.datosClave}
          <Opcional texto={textos.formulario.opcional} />
        </legend>
        <div className="grid gap-2.5">
          {datos.datosClave.map((dato, indice) => (
            <div key={indice} className="grid gap-2.5 sm:grid-cols-2">
              <input
                id={indice === 0 ? 'campo-datosClave' : undefined}
                type="text"
                aria-label={rellenarPlantilla(t.datoValor, { n: indice + 1 })}
                placeholder={indice === 0 ? t.ejemploValor : undefined}
                maxLength={LIMITES.datoValor * 2}
                value={dato.valor}
                onChange={(evento) => cambiarDato(indice, 'valor', evento.target.value)}
                aria-invalid={errorDatos ? true : undefined}
                className={claseControl}
              />
              <input
                type="text"
                aria-label={rellenarPlantilla(t.datoEtiqueta, { n: indice + 1 })}
                placeholder={indice === 0 ? t.ejemploEtiqueta : undefined}
                maxLength={LIMITES.datoEtiqueta * 2}
                value={dato.etiqueta}
                onChange={(evento) => cambiarDato(indice, 'etiqueta', evento.target.value)}
                aria-invalid={errorDatos ? true : undefined}
                className={claseControl}
              />
            </div>
          ))}
        </div>
        {datos.datosClave.length < LIMITES.maxDatosClave && (
          <BotonAnadir alPulsar={() => cambiar('datosClave', [...datos.datosClave, { valor: '', etiqueta: '' }])}>{t.anadirDato}</BotonAnadir>
        )}
        {errorDatos && <MensajeError id="error-datosClave">{errorDatos}</MensajeError>}
      </fieldset>
    </div>
  )
}
