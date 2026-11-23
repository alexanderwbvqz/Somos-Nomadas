import type { FormEvent } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { CampoArchivo } from '@/shared/ui/CampoArchivo'
import { CampoTexto, Casilla, MensajeError } from '@/shared/ui/Campos'
import { foco } from '@/shared/ui/EnlaceBoton'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { camposEnlace, LIMITES_MATERIAL, type CampoEnlace, type DatosMaterial, type ErroresMaterial } from '../../domain/material'
import type { TextosHabilidades } from '../../language/tipos'
import { mensajeDeErrorMaterial } from '../mappers/mensajesError'

type Props = {
  textos: TextosHabilidades['escritas']
  datos: DatosMaterial
  errores: ErroresMaterial
  aviso?: 'limite' | 'fallo'
  puedeAnalizar: boolean
  /** Adónde lleva «Más información» sobre el permiso */
  hrefInformacion: string
  alElegirArchivo: (archivo: File) => void
  alQuitarArchivo: () => void
  alCambiarEnlace: (campo: CampoEnlace, valor: string) => void
  alMarcarPermiso: (marcado: boolean) => void
  alEnviar: () => void
}

const MEGA = 1024 * 1024

// Subir un PDF o pegar enlaces, dar el permiso para analizarlos y pedir el análisis. Valida al enviar.
export function ZonaMaterial({
  textos,
  datos,
  errores,
  aviso,
  puedeAnalizar,
  hrefInformacion,
  alElegirArchivo,
  alQuitarArchivo,
  alCambiarEnlace,
  alMarcarPermiso,
  alEnviar,
}: Props) {
  const error = (campo: keyof ErroresMaterial) => mensajeDeErrorMaterial(textos, errores[campo])

  function alEnviarFormulario(evento: FormEvent) {
    evento.preventDefault()
    alEnviar()
  }

  return (
    <form noValidate onSubmit={alEnviarFormulario} className="mt-8 grid gap-6">
      <div>
        <CampoArchivo
          clave="pdf"
          titulo={textos.archivo.titulo}
          ayuda={
            <>
              {rellenarPlantilla(textos.archivo.ayuda, { max: LIMITES_MATERIAL.pdfBytes / MEGA })}
              <br />
              {textos.archivo.linkedin}
            </>
          }
          accept="application/pdf,.pdf"
          archivo={datos.archivo}
          alElegir={alElegirArchivo}
          alQuitar={alQuitarArchivo}
          textoQuitar={textos.archivo.quitar}
          error={error('archivo')}
        />
        {error('material') && <MensajeError id="error-material">{error('material')}</MensajeError>}
      </div>

      <p aria-hidden="true" className="text-etiqueta-chica flex items-center gap-4 opacity-65">
        <span className="h-px flex-1 bg-texto/25" />
        {textos.separador}
        <span className="h-px flex-1 bg-texto/25" />
      </p>

      {camposEnlace.map((campo) => (
        <CampoTexto
          key={campo}
          clave={campo}
          etiqueta={
            <>
              {textos.enlaces[campo].etiqueta} <span className="font-normal opacity-65">{textos.opcional}</span>
            </>
          }
          inputMode="url"
          autoComplete="off"
          placeholder={textos.enlaces[campo].ejemplo}
          maxLength={LIMITES_MATERIAL.enlaceLargo * 2}
          ayuda={campo === 'otro' ? textos.otroAyuda : undefined}
          valor={datos[campo]}
          alCambiar={(valor) => alCambiarEnlace(campo, valor)}
          error={error(campo)}
        />
      ))}

      <Casilla clave="aceptaAnalisis" marcada={datos.aceptaAnalisis} alCambiar={alMarcarPermiso} error={error('aceptaAnalisis')}>
        {textos.permisoTexto}{' '}
        <a href={hrefInformacion} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-4 ${foco}`}>
          {textos.permisoEnlace}
        </a>
        .
      </Casilla>

      {aviso && (
        <p role="alert" className="text-cuerpo flex items-start gap-2.5 rounded-xl border-2 border-primario px-4 py-3 font-medium">
          <span aria-hidden="true" className="text-etiqueta-chica mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-primario leading-none text-tarjeta">
            !
          </span>
          <span>{textos.avisos[aviso]}</span>
        </p>
      )}

      <div>
        <Boton tipo="submit" lleno deshabilitado={!puedeAnalizar} cursorDeshabilitado="bloqueado">
          {textos.analizar}
        </Boton>
        <p className="text-nota mt-3 opacity-75">{textos.pie}</p>
      </div>
    </form>
  )
}
