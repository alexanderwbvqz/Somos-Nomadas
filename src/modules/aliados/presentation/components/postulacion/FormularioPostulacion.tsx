'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { foco } from '@/shared/ui/EnlaceBoton'
import { contarPartesListas, partesDelPerfil, TOTAL_PARTES_PERFIL } from '@/modules/aliados/domain/perfilPostulacion'
import { hayErrores, type PasoPostulacion } from '@/modules/aliados/domain/postulacion'
import type { TextosPostulacion } from '@/modules/aliados/language/tipos'
import { usePostulacion, type AccionEnviarPostulacion } from '../../hooks/usePostulacion'
import { ConfirmacionPostulacion } from './ConfirmacionPostulacion'
import { PasoAporte } from './PasoAporte'
import { PasoContacto } from './PasoContacto'
import { PasoEnviar } from './PasoEnviar'
import { PasoQuien } from './PasoQuien'
import { VistaPreviaPerfil } from './VistaPreviaPerfil'

export type FormularioPostulacionProps = {
  textos: TextosPostulacion
  alEnviar: AccionEnviarPostulacion
  /** Adónde lleva "Volver a la red de aliados" tras enviar */
  hrefAliados: string
  hrefPolitica: string
}

const pasos: PasoPostulacion[] = [1, 2, 3, 4]

// Formulario de postulación en cuatro pasos, con una vista previa del perfil que empieza vacía y se llena al escribir.
// En pantallas estrechas la vista previa es una hoja que sube desde una barra fija al pie.
export function FormularioPostulacion({ textos, alEnviar, hrefAliados, hrefPolitica }: FormularioPostulacionProps) {
  const { datos, vista, errores, enviando, avisoEnvio, enfoque, cambiar, siguiente, anterior, irA, enviar } = usePostulacion(alEnviar)
  const [hojaAbierta, setHojaAbierta] = useState(false)
  const refBarra = useRef<HTMLButtonElement>(null)
  const refCerrar = useRef<HTMLButtonElement>(null)
  const vistaAnterior = useRef(vista)
  const f = textos.formulario
  const nombresPasos = [f.pasos.quien, f.pasos.aporte, f.pasos.contacto, f.pasos.enviar]

  // Al cambiar de paso, el foco va al título del paso (o al de la confirmación) para que se anuncie el cambio
  useEffect(() => {
    if (vistaAnterior.current === vista) return
    vistaAnterior.current = vista
    document.getElementById(vista === 'listo' ? 'titulo-confirmacion' : 'titulo-paso')?.focus()
  }, [vista])

  // Si hay un error, el foco va al primer campo con problema (va después del anterior para imponerse)
  useEffect(() => {
    if (enfoque) document.getElementById(enfoque.id)?.focus()
  }, [enfoque])

  // Al abrir la hoja, el foco va a "Cerrar" (la hoja pasa a visible al instante, solo el desplazamiento se anima)
  useEffect(() => {
    if (hojaAbierta) refCerrar.current?.focus()
  }, [hojaAbierta])

  function cerrarHoja() {
    setHojaAbierta(false)
    refBarra.current?.focus()
  }

  useEffect(() => {
    if (!hojaAbierta) return
    function alPulsarTecla(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return
      setHojaAbierta(false)
      refBarra.current?.focus()
    }
    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [hojaAbierta])

  function alEnviarFormulario(evento: FormEvent) {
    evento.preventDefault()
    if (vista === 4) void enviar()
    else siguiente()
  }

  if (vista === 'listo') {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-14 escritorio:py-20">
        <div className="rounded-3xl bg-tarjeta p-6 escritorio:p-10">
          <ConfirmacionPostulacion textos={textos.confirmacion} hrefVolver={hrefAliados} />
        </div>
      </div>
    )
  }

  const cabecera = { 1: textos.quien, 2: textos.aporte, 3: textos.contacto, 4: textos.enviar }[vista]
  const propsPaso = { textos, datos, errores, cambiar }
  const listas = contarPartesListas(partesDelPerfil(datos))
  const porcentaje = Math.round((listas / TOTAL_PARTES_PERFIL) * 100)

  return (
    <div className="mx-auto grid w-full max-w-7xl items-start gap-12 px-6 pb-28 pt-10 escritorio:grid-cols-12 escritorio:px-12 escritorio:pb-24 escritorio:pt-16">
      <div className="escritorio:col-span-7">
        <ol aria-label={f.etiquetaPasos} className="text-etiqueta-chica mb-5 flex flex-wrap gap-2">
          {pasos.map((paso) => (
            <li
              key={paso}
              aria-current={paso === vista ? 'step' : undefined}
              className={`rounded-full border-2 border-texto px-3.5 py-1.5 ${paso === vista ? 'bg-texto text-fondo' : paso < vista ? 'bg-suave' : ''}`}
            >
              {paso < vista ? '✓ ' : `${paso} · `}
              {nombresPasos[paso - 1]}
            </li>
          ))}
        </ol>

        <form noValidate onSubmit={alEnviarFormulario} className="relative rounded-3xl bg-tarjeta p-6 escritorio:p-9">
          <h2 id="titulo-paso" tabIndex={-1} className="text-titulo-seccion outline-none">
            {cabecera.titulo}
          </h2>
          <p className="text-parrafo mt-2 opacity-80">{cabecera.subtitulo}</p>

          <div className="mt-7">
            {vista === 1 && <PasoQuien {...propsPaso} />}
            {vista === 2 && <PasoAporte {...propsPaso} />}
            {vista === 3 && <PasoContacto {...propsPaso} />}
            {vista === 4 && <PasoEnviar {...propsPaso} hrefPolitica={hrefPolitica} alEditar={irA} />}
          </div>

          {hayErrores(errores) && (
            <p role="alert" className="text-cuerpo mt-6 font-medium">
              {f.avisoErrores}
            </p>
          )}
          {avisoEnvio && (
            <p role="alert" className="text-cuerpo mt-6 font-medium">
              {f.envio[avisoEnvio]}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-4">
            {vista > 1 ? (
              <button type="button" onClick={anterior} className={`text-etiqueta text-texto underline underline-offset-8 ${foco}`}>
                <span aria-hidden="true">←</span> {f.anterior}
              </button>
            ) : (
              <span />
            )}
            <Boton tipo="submit" lleno deshabilitado={enviando}>
              {vista === 4 ? (enviando ? f.enviando : f.enviar) : f.siguiente}
            </Boton>
          </div>
        </form>
      </div>

      {/* Fondo que se toca para cerrar la hoja (solo en pantallas estrechas) */}
      <div
        aria-hidden="true"
        onClick={cerrarHoja}
        className={`fixed inset-0 z-30 bg-texto/45 transition-opacity duration-300 motion-reduce:transition-none escritorio:hidden ${
          hojaAbierta ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="vista-previa"
        aria-labelledby="titulo-vista-previa"
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto rounded-t-3xl border-t-[1.5px] border-texto bg-fondo px-5 pb-8 pt-4 motion-reduce:[transition:none] ${
          // Al abrir, visible al instante y se desliza; al cerrar, se desliza y se oculta al terminar
          hojaAbierta
            ? 'visible translate-y-0 [transition:transform_300ms,visibility_0s]'
            : 'invisible translate-y-full [transition:transform_300ms,visibility_0s_300ms]'
        } escritorio:visible escritorio:sticky escritorio:inset-auto escritorio:top-6 escritorio:z-auto escritorio:col-span-5 escritorio:max-h-[calc(100vh-3rem)] escritorio:translate-y-0 escritorio:rounded-none escritorio:border-0 escritorio:bg-transparent escritorio:p-0`}
      >
        <button
          ref={refCerrar}
          type="button"
          onClick={cerrarHoja}
          className={`text-etiqueta-chica mb-3.5 ml-auto block underline underline-offset-4 escritorio:hidden ${foco}`}
        >
          {textos.vista.cerrar} <span aria-hidden="true">✕</span>
        </button>
        <VistaPreviaPerfil textos={textos} datos={datos} paso={vista} />
      </aside>

      {/* Barra fija al pie con el avance del perfil (solo en pantallas estrechas) */}
      <button
        ref={refBarra}
        type="button"
        aria-expanded={hojaAbierta}
        aria-controls="vista-previa"
        onClick={() => (hojaAbierta ? cerrarHoja() : setHojaAbierta(true))}
        className="fixed inset-x-0 bottom-0 z-20 flex w-full items-center gap-4 bg-texto px-5 py-3.5 text-left text-fondo focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primario escritorio:hidden"
      >
        <span className="flex-1">
          <span className="text-etiqueta-chica block opacity-75">{textos.vista.barraTitulo}</span>
          <span className="text-parrafo font-medium">
            {rellenarPlantilla(textos.vista.barraAvance, { listos: listas, total: TOTAL_PARTES_PERFIL })}
          </span>
        </span>
        <span aria-hidden="true" className="h-1.5 w-16 overflow-hidden rounded bg-fondo/25">
          <span className="block h-full bg-degradado-amarillo transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${porcentaje}%` }} />
        </span>
        <span aria-hidden="true">▲</span>
      </button>
    </div>
  )
}
