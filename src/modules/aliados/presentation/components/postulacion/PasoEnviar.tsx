import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Casilla } from '@/shared/ui/Casilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { contactoValido, sitioParaMostrar } from '@/modules/aliados/domain/perfilPostulacion'
import { contarPalabras, type PasoPostulacion } from '@/modules/aliados/domain/postulacion'
import { mensajeDeError } from '../../mappers/mensajesError'
import type { PropsPaso } from './tiposPaso'

type Props = PropsPaso & {
  hrefPolitica: string
  alEditar: (paso: PasoPostulacion) => void
}

function Fila({ etiqueta, paso, textoEditar, alEditar, children }: { etiqueta: string; paso: PasoPostulacion; textoEditar: string; alEditar: (paso: PasoPostulacion) => void; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-5 border-b border-borde/15 py-3.5">
      <dt className="text-parrafo flex-none opacity-60">{etiqueta}</dt>
      <dd className="text-parrafo text-right font-medium">
        {children}
        <button
          type="button"
          onClick={() => alEditar(paso)}
          aria-label={`${textoEditar}: ${etiqueta}`}
          className={`text-nota ml-3 font-normal underline underline-offset-4 ${foco}`}
        >
          {textoEditar}
        </button>
      </dd>
    </div>
  )
}

// Paso 4: resumen de lo escrito, con acceso para corregir cada parte, y la aceptación de la política de datos.
export function PasoEnviar({ textos, datos, errores, cambiar, hrefPolitica, alEditar }: Props) {
  const t = textos.enviar
  const tipo = datos.tipo === '' ? t.sinElegir : textos.quien.tipos[datos.tipo].titulo
  const apoyos = datos.apoyos.filter((apoyo) => apoyo.trim() !== '').length
  const areas = datos.areas.filter((area) => area.trim() !== '').length
  const redes = [datos.linkedin.trim() !== '' && textos.contacto.linkedin, datos.instagram.trim() !== '' && textos.contacto.instagram].filter(Boolean)
  const presencia = [datos.ciudad.trim(), sitioParaMostrar(datos.sitioWeb), ...redes].filter(Boolean).join(' · ')
  const contacto = contactoValido(datos)
  const publico = [contacto.whatsapp && t.whatsapp, contacto.agenda && t.agenda].filter(Boolean).join(` ${t.y} `)

  return (
    <div>
      <dl>
        <Fila etiqueta={t.resumen.tipoNombre} paso={1} textoEditar={t.editar} alEditar={alEditar}>
          {tipo} · {datos.nombre.trim() || t.sinNombre}
        </Fila>
        <Fila etiqueta={t.resumen.contacto} paso={1} textoEditar={t.editar} alEditar={alEditar}>
          {datos.personaContacto.trim() || '—'} · {datos.correo.trim() || '—'}
        </Fila>
        <Fila etiqueta={t.resumen.aporte} paso={2} textoEditar={t.editar} alEditar={alEditar}>
          {rellenarPlantilla(t.palabras, { n: contarPalabras(datos.descripcionCorta) })} · {rellenarPlantilla(t.apoyos, { n: apoyos })} ·{' '}
          {rellenarPlantilla(t.areas, { n: areas })}
        </Fila>
        <Fila etiqueta={t.resumen.presencia} paso={3} textoEditar={t.editar} alEditar={alEditar}>
          {presencia || '—'}
        </Fila>
        <Fila etiqueta={t.resumen.contactoPublico} paso={3} textoEditar={t.editar} alEditar={alEditar}>
          {publico || t.ninguno}
        </Fila>
      </dl>

      <div className="mt-6">
        <Casilla
          clave="aceptaPolitica"
          marcada={datos.aceptaPolitica}
          alCambiar={(marcada) => cambiar('aceptaPolitica', marcada)}
          error={mensajeDeError(textos, errores.aceptaPolitica)}
        >
          {t.politicaInicio}{' '}
          <a href={hrefPolitica} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-4 ${foco}`}>
            {t.politicaEnlace}
          </a>
          . {t.politicaFin}
        </Casilla>
      </div>

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
    </div>
  )
}
