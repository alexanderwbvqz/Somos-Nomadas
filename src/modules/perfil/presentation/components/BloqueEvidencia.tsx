'use client'

import { useEffect, useRef } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { CampoTexto } from '@/shared/ui/CampoTexto'
import { areaTactil, foco } from '@/shared/ui/EnlaceBoton'
import { LIMITES_EVIDENCIA } from '../../domain/evidencia'
import type { TextosPerfil } from '../../language/tipos'
import type { useEvidencia } from '../hooks/useEvidencia'
import { mensajeDeErrorEvidencia } from '../mappers/mensajesError'
import { TarjetaBloque } from '../ui/TarjetaBloque'

type Props = { textos: TextosPerfil; evidencia: ReturnType<typeof useEvidencia> }

// «Evidencia»: enlaces a cosas que la persona hizo. Cada enlace que se suma o se quita se guarda en el momento. Se abren en otra
// pestaña, sin dar acceso a esta página y sin que el sitio de destino sepa de dónde vienen.
export function BloqueEvidencia({ textos, evidencia }: Props) {
  const t = textos.evidencia
  const abrir = useRef<HTMLButtonElement>(null)
  const primeraVez = useRef(true)
  const contador = rellenarPlantilla(t.contador, { n: evidencia.enlaces.length, max: LIMITES_EVIDENCIA.enlaces })

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    if (evidencia.editando) document.getElementById('campo-evidencia-enlace')?.focus()
    else abrir.current?.focus()
  }, [evidencia.editando])

  return (
    <TarjetaBloque
      titulo={`${t.titulo} · ${contador}`}
      accion={
        !evidencia.editando && (
          <button ref={abrir} type="button" onClick={evidencia.abrir} className={`text-etiqueta-chica ${areaTactil} cursor-pointer underline underline-offset-[5px] ${foco}`}>
            {evidencia.enlaces.length > 0 ? textos.editar : t.sumar}
            {' '}
            <span className="sr-only">{t.titulo}</span>
          </button>
        )
      }
    >
      {evidencia.enlaces.length > 0 ? (
        <ul className="grid gap-2">
          {evidencia.enlaces.map((enlace, lugar) => (
            <li key={enlace} className="flex items-center justify-between gap-3 rounded-2xl border-[1.5px] border-texto/20 px-3.5 py-2.5 [overflow-wrap:anywhere]">
              <a href={enlace} target="_blank" rel="noopener noreferrer nofollow" className={`underline underline-offset-4 ${foco}`}>
                {enlace}
              </a>
              {evidencia.editando && (
                <button type="button" onClick={() => void evidencia.quitar(lugar)} disabled={evidencia.guardando} className={`text-nota flex-none cursor-pointer underline underline-offset-4 disabled:cursor-wait ${foco}`}>
                  {t.quitar}{' '}
                  <span className="sr-only">{enlace}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !evidencia.editando && <p className="text-parrafo italic opacity-65">{t.vacio}</p>
      )}

      {evidencia.editando && (
        <form
          noValidate
          onSubmit={(evento) => {
            evento.preventDefault()
            void evidencia.agregar()
          }}
          className="mt-3"
        >
          <div className="flex flex-col gap-2.5 escritorio:flex-row escritorio:items-start">
            <div className="flex-1">
              <CampoTexto
                clave="evidencia-enlace"
                etiqueta={<span className="sr-only">{t.campo}</span>}
                tipo="text"
                inputMode="url"
                placeholder={t.placeholder}
                maxLength={LIMITES_EVIDENCIA.largo * 2}
                valor={evidencia.nuevo}
                alCambiar={evidencia.cambiar}
                error={evidencia.error ? mensajeDeErrorEvidencia(t, evidencia.error) : undefined}
              />
            </div>
            <Boton tipo="submit" lleno deshabilitado={evidencia.guardando || evidencia.enlaces.length >= LIMITES_EVIDENCIA.enlaces} cursorDeshabilitado="espera">
              {evidencia.guardando ? t.guardando : t.agregar}
            </Boton>
          </div>

          {evidencia.aviso && (
            <p role="alert" className="text-cuerpo mt-3 font-medium">
              {textos.avisos[evidencia.aviso]}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-nota opacity-65">{t.ayuda}</span>
            <button type="button" onClick={evidencia.cerrar} className={`text-etiqueta ${areaTactil} cursor-pointer underline underline-offset-8 ${foco}`}>
              {t.listo}
            </button>
          </div>
        </form>
      )}
    </TarjetaBloque>
  )
}
