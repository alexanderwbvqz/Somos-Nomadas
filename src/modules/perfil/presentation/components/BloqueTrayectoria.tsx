'use client'

import { useEffect, useRef } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Badge } from '@/shared/ui/Badge'
import { Boton } from '@/shared/ui/Boton'
import { CampoTexto } from '@/shared/ui/Campos'
import { foco } from '@/shared/ui/EnlaceBoton'
import { LIMITES_TRAYECTORIA } from '../../domain/trayectoria'
import type { TextosPerfil } from '../../language/tipos'
import type { useTrayectoria } from '../hooks/useTrayectoria'
import { mensajeDeListaTrayectoria, mensajesDeEntradaTrayectoria } from '../mappers/mensajesError'
import { rangoAnios } from '../mappers/rangoAnios'
import { TarjetaBloque } from '../ui/TarjetaBloque'

type Props = { textos: TextosPerfil; trayectoria: ReturnType<typeof useTrayectoria> }

const claseTextoSubrayado = `text-etiqueta-chica cursor-pointer underline underline-offset-[5px] ${foco}`

// «Trayectoria»: dónde ha trabajado la persona, si lo ha hecho. Es opcional. Cada entrada que se suma o se quita se guarda en
// el momento. El foco va al primer campo al abrirlo y vuelve al botón al cerrarlo.
export function BloqueTrayectoria({ textos, trayectoria }: Props) {
  const t = textos.trayectoria
  const abrir = useRef<HTMLButtonElement>(null)
  const primeraVez = useRef(true)
  const mensajes = mensajesDeEntradaTrayectoria(t, trayectoria.errores)

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    if (trayectoria.editando) document.getElementById('campo-tray-desde')?.focus()
    else abrir.current?.focus()
  }, [trayectoria.editando])

  return (
    <TarjetaBloque
      titulo={t.titulo}
      detalle={<Badge>{t.opcional}</Badge>}
      accion={
        !trayectoria.editando && (
          <button ref={abrir} type="button" onClick={trayectoria.abrir} className={claseTextoSubrayado}>
            {trayectoria.entradas.length > 0 ? textos.editar : t.sumar}
            {' '}
            <span className="sr-only">{t.titulo}</span>
          </button>
        )
      }
    >
      {trayectoria.entradas.length > 0 ? (
        <ul className="grid gap-2.5">
          {trayectoria.entradas.map((entrada, lugar) => (
            <li key={`${entrada.desde}-${entrada.rol}-${entrada.donde}`} className="grid grid-cols-1 items-start gap-x-[1.125rem] gap-y-1 rounded-2xl border-[1.5px] border-texto/20 px-4 py-3 escritorio:grid-cols-[9.5rem_1fr_auto]">
              <span className="text-etiqueta-chica pt-0.5 opacity-70">{rangoAnios(entrada, t.hoy)}</span>
              <div>
                <p className="font-medium">
                  {entrada.rol} <span className="font-normal opacity-75">· {entrada.donde}</span>
                </p>
                {entrada.que && <p className="text-nota mt-1 opacity-75">{entrada.que}</p>}
              </div>
              {trayectoria.editando ? (
                <button type="button" onClick={() => void trayectoria.quitar(lugar)} disabled={trayectoria.guardando} className={`text-nota cursor-pointer underline underline-offset-4 disabled:cursor-wait ${foco}`}>
                  {t.quitar}{' '}
                  <span className="sr-only">
                    {entrada.rol} · {entrada.donde}
                  </span>
                </button>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>
      ) : (
        !trayectoria.editando && <p className="text-parrafo italic opacity-65">{t.vacio}</p>
      )}

      {trayectoria.editando && (
        <form
          noValidate
          onSubmit={(evento) => {
            evento.preventDefault()
            void trayectoria.agregar()
          }}
          className="mt-3"
        >
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 rounded-2xl border-[1.5px] border-texto/20 p-3.5 escritorio:grid-cols-4">
            <CampoTexto clave="tray-desde" etiqueta={<span className="sr-only">{t.campos.desde}</span>} placeholder={t.campos.desde} inputMode="text" maxLength={4} valor={trayectoria.nueva.desde} alCambiar={(valor) => trayectoria.cambiar('desde', valor)} error={mensajes.desde} />
            <CampoTexto clave="tray-hasta" etiqueta={<span className="sr-only">{t.campos.hasta}</span>} placeholder={t.campos.hasta} inputMode="text" maxLength={4} valor={trayectoria.nueva.hasta} alCambiar={(valor) => trayectoria.cambiar('hasta', valor)} error={mensajes.hasta} />
            <CampoTexto clave="tray-rol" etiqueta={<span className="sr-only">{t.campos.rol}</span>} placeholder={t.campos.rol} maxLength={LIMITES_TRAYECTORIA.rol * 2} valor={trayectoria.nueva.rol} alCambiar={(valor) => trayectoria.cambiar('rol', valor)} error={mensajes.rol} />
            <CampoTexto clave="tray-donde" etiqueta={<span className="sr-only">{t.campos.donde}</span>} placeholder={t.campos.donde} maxLength={LIMITES_TRAYECTORIA.donde * 2} valor={trayectoria.nueva.donde} alCambiar={(valor) => trayectoria.cambiar('donde', valor)} error={mensajes.donde} />
            <div className="col-span-full mt-1.5">
              <CampoTexto clave="tray-que" etiqueta={<span className="sr-only">{t.campos.que}</span>} placeholder={t.campos.que} maxLength={LIMITES_TRAYECTORIA.que * 2} valor={trayectoria.nueva.que} alCambiar={(valor) => trayectoria.cambiar('que', valor)} error={mensajes.que} />
            </div>
          </div>

          {(trayectoria.listaLlena || trayectoria.aviso) && (
            <p role="alert" className="text-cuerpo mt-3 font-medium">
              {trayectoria.listaLlena ? mensajeDeListaTrayectoria(t) : trayectoria.aviso ? textos.avisos[trayectoria.aviso] : ''}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-nota opacity-65">{rellenarPlantilla(t.contador, { n: trayectoria.entradas.length, max: LIMITES_TRAYECTORIA.entradas })}</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={trayectoria.cerrar} className={`text-etiqueta cursor-pointer underline underline-offset-8 ${foco}`}>
                {t.listo}
              </button>
              <Boton tipo="submit" lleno deshabilitado={trayectoria.guardando} cursorDeshabilitado="espera">
                {trayectoria.guardando ? t.guardando : t.guardar}
              </Boton>
            </div>
          </div>
        </form>
      )}
    </TarjetaBloque>
  )
}
