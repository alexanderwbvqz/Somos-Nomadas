'use client'

import { useEffect, useRef } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { CampoArea } from '@/shared/ui/CampoArea'
import { areaTactil, foco } from '@/shared/ui/EnlaceBoton'
import { LIMITE_SOBRE_MI } from '../../domain/sobreMi'
import type { TextosPerfil } from '../../language/tipos'
import type { useSobreMi } from '../hooks/useSobreMi'
import { mensajeDeErrorSobreMi } from '../mappers/mensajesError'
import { TarjetaBloque } from '../ui/TarjetaBloque'

type Props = { textos: TextosPerfil; sobreMi: ReturnType<typeof useSobreMi> }

// «Sobre mí»: una presentación corta que la persona escribe aquí mismo. El foco va al cuadro al abrirlo y vuelve al botón al cerrarlo.
export function BloqueSobreMi({ textos, sobreMi }: Props) {
  const t = textos.sobreMi
  const abrir = useRef<HTMLButtonElement>(null)
  const primeraVez = useRef(true)

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    if (sobreMi.editando) document.getElementById('campo-sobreMi')?.focus()
    else abrir.current?.focus()
  }, [sobreMi.editando])

  return (
    <TarjetaBloque
      titulo={t.titulo}
      accion={
        !sobreMi.editando && (
          <button ref={abrir} type="button" onClick={sobreMi.abrir} className={`text-etiqueta-chica ${areaTactil} cursor-pointer underline underline-offset-[5px] ${foco}`}>
            {sobreMi.guardado ? textos.editar : t.escribir}
            {' '}
            <span className="sr-only">{t.titulo}</span>
          </button>
        )
      }
    >
      {sobreMi.editando ? (
        <form
          noValidate
          onSubmit={(evento) => {
            evento.preventDefault()
            void sobreMi.guardar()
          }}
        >
          <CampoArea
            clave="sobreMi"
            etiqueta={<span className="sr-only">{t.etiqueta}</span>}
            filas={4}
            maxLength={LIMITE_SOBRE_MI * 2}
            placeholder={t.placeholder}
            ayuda={rellenarPlantilla(t.ayuda, { max: LIMITE_SOBRE_MI })}
            valor={sobreMi.borrador}
            alCambiar={sobreMi.cambiar}
            error={mensajeDeErrorSobreMi(t, sobreMi.errores)}
          />
          {sobreMi.aviso && (
            <p role="alert" className="text-cuerpo mt-3 font-medium">
              {textos.avisos[sobreMi.aviso]}
            </p>
          )}
          <div className="mt-3 flex items-center justify-end gap-3">
            <button type="button" onClick={sobreMi.cancelar} className={`text-etiqueta ${areaTactil} cursor-pointer underline underline-offset-8 ${foco}`}>
              {t.cancelar}
            </button>
            <Boton tipo="submit" lleno deshabilitado={sobreMi.guardando} cursorDeshabilitado="espera">
              {sobreMi.guardando ? t.guardando : t.guardar}
            </Boton>
          </div>
        </form>
      ) : sobreMi.guardado ? (
        <p className="text-parrafo whitespace-pre-line">{sobreMi.guardado}</p>
      ) : (
        <p className="text-parrafo italic opacity-65">{t.vacio}</p>
      )}
    </TarjetaBloque>
  )
}
