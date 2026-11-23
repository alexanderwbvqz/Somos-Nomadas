import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { CirculoFlecha } from '@/shared/ui/CirculoFlecha'
import {
  contactoValido,
  partesDelPerfil,
  sitioParaMostrar,
  type PartesPerfil,
} from '@/modules/aliados/domain/perfilPostulacion'
import type { DatosPostulacion, PasoPostulacion } from '@/modules/aliados/domain/postulacion'
import type { TextosPostulacion } from '@/modules/aliados/language/tipos'
import { colorTipoAliado } from '../../ui/coloresTipoAliado'

type Props = {
  textos: TextosPostulacion
  datos: DatosPostulacion
  paso: PasoPostulacion
}

const partes: { clave: keyof PartesPerfil; paso: PasoPostulacion }[] = [
  { clave: 'nombreYTipo', paso: 1 },
  { clave: 'descripcionCorta', paso: 2 },
  { clave: 'detalle', paso: 2 },
  { clave: 'presencia', paso: 3 },
  { clave: 'contacto', paso: 3 },
]

function Rotulo({ izquierda, derecha }: { izquierda: string; derecha: string }) {
  return (
    <p className="text-etiqueta-chica mb-2.5 flex justify-between gap-4 opacity-70">
      <span>{izquierda}</span>
      <span>{derecha}</span>
    </p>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-borde/15 py-3">
      <dt className="text-parrafo opacity-60">{etiqueta}</dt>
      <dd className={`text-parrafo text-right font-medium ${valor ? '' : 'opacity-30'}`}>{valor || '—'}</dd>
    </div>
  )
}

function BotonEstatico({ lleno, children }: { lleno: boolean; children: string }) {
  return (
    <span
      className={`text-etiqueta-chica inline-flex items-center gap-3 rounded-full border-2 border-texto py-1.5 pl-5 pr-1.5 ${
        lleno ? 'bg-texto text-fondo' : 'text-texto'
      }`}
    >
      {children}
      <CirculoFlecha lleno={lleno} />
    </span>
  )
}

function Candado() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

// Vista previa del perfil que se va armando: la tarjeta de la red (pasos 1 y 2), la ficha de su página (paso 3),
// las dos al enviar, y la lista de qué parte aparece en qué sitio. Empieza vacía y se llena al escribir.
export function VistaPreviaPerfil({ textos, datos, paso }: Props) {
  const t = textos.vista
  const nombre = datos.nombre.trim()
  const descripcion = datos.descripcionCorta.trim().replace(/\s+/g, ' ')
  const tipo = datos.tipo === '' ? undefined : textos.quien.tipos[datos.tipo].titulo
  const listas = partesDelPerfil(datos)
  const contacto = contactoValido(datos)
  const redes = [datos.linkedin.trim() !== '' && textos.contacto.linkedin, datos.instagram.trim() !== '' && textos.contacto.instagram].filter(Boolean)

  const verTarjeta = paso !== 3
  const verFicha = paso >= 3

  return (
    <div>
      <h3 id="titulo-vista-previa" className="text-etiqueta mb-4">
        {t.titulo}
      </h3>

      {verTarjeta && (
        <section aria-label={t.tarjeta}>
          <Rotulo izquierda={t.tarjeta} derecha={t.pasos1y2} />
          <div
            className={`transicion-suave flex h-36 items-center justify-center border-b-[1.5px] border-texto p-4 text-center ${
              datos.tipo === '' ? 'bg-suave' : colorTipoAliado[datos.tipo]
            }`}
          >
            <span className={`text-titulo-tarjeta texto-equilibrado ${nombre ? '' : 'opacity-35'}`}>{nombre || t.tuNombre}</span>
          </div>
          <p className={`text-titulo-tarjeta-grande mt-5 ${nombre ? '' : 'opacity-35'}`}>{nombre || t.tuNombre}</p>
          <p className={`text-etiqueta-chica mt-3 ${tipo ? '' : 'opacity-35'}`}>{tipo ?? t.tipo}</p>
          {descripcion ? (
            <p className="text-cuerpo mt-3 line-clamp-5 max-w-md break-words">{descripcion}</p>
          ) : (
            <div className="mt-3">
              <div className="h-3 rounded-md bg-suave" />
              <div className="mt-2.5 h-3 w-[85%] rounded-md bg-suave" />
              <div className="mt-2.5 h-3 w-3/5 rounded-md bg-suave" />
              <p className="text-nota mt-3 italic opacity-65">{t.sinDescripcion}</p>
            </div>
          )}
          <span aria-hidden="true" className="text-etiqueta mt-4 inline-block underline underline-offset-8 opacity-50">
            {t.leerMas} ↗
          </span>
        </section>
      )}

      {verFicha && (
        <section aria-label={t.ficha} className={verTarjeta ? 'mt-8' : ''}>
          <Rotulo izquierda={t.ficha} derecha={t.paso3} />
          <div className="rounded-3xl bg-tarjeta px-6 py-4">
            <dl>
              <Fila etiqueta={t.fichaFilas.tipo} valor={tipo} />
              <Fila etiqueta={t.fichaFilas.ciudad} valor={datos.ciudad.trim()} />
              <Fila etiqueta={t.fichaFilas.sitioWeb} valor={sitioParaMostrar(datos.sitioWeb)} />
              <Fila etiqueta={t.fichaFilas.redes} valor={redes.join(' · ')} />
            </dl>
            <div className="mt-4 flex flex-col items-start gap-2.5">
              {contacto.agenda && <BotonEstatico lleno>{t.agendar}</BotonEstatico>}
              {contacto.whatsapp && <BotonEstatico lleno={false}>{t.whatsapp}</BotonEstatico>}
              {!contacto.agenda && !contacto.whatsapp && <p className="text-nota italic opacity-65">{t.sinBotones}</p>}
            </div>
          </div>
        </section>
      )}

      <section aria-label={t.donde} className="mt-8 border-t-[1.5px] border-texto">
        <h4 className="text-etiqueta-chica pb-1.5 pt-3 opacity-70">{t.donde}</h4>
        <ul>
          {partes.map(({ clave, paso: pasoParte }) => (
            <li key={clave} className="grid grid-cols-[1.5rem_1fr_auto] items-baseline gap-2.5 border-b border-borde/15 py-2.5">
              <span
                aria-hidden="true"
                className={`self-center inline-flex size-[1.125rem] items-center justify-center rounded-full border-[1.5px] text-etiqueta-chica ${
                  listas[clave] ? 'border-texto bg-texto text-fondo' : 'border-texto/50'
                }`}
              >
                {listas[clave] ? '✓' : ''}
              </span>
              <span className="text-cuerpo">
                {t.partes[clave].texto}
                <span className="sr-only">{`: ${listas[clave] ? t.listo : t.pendiente}`}</span>
                <small className="text-nota mt-0.5 block opacity-65">{t.partes[clave].lugar}</small>
              </span>
              <span className="text-etiqueta-chica whitespace-nowrap opacity-60">{rellenarPlantilla(t.paso, { n: pasoParte })}</span>
            </li>
          ))}
          <li className="mt-2.5 grid grid-cols-[1.5rem_1fr_auto] items-baseline gap-2.5 rounded-xl bg-suave px-3 py-2.5">
            <span className="self-center">
              <Candado />
            </span>
            <span className="text-cuerpo">
              <b className="font-medium">{t.privadas.texto}</b>
              <small className="text-nota mt-0.5 block opacity-65">{t.privadas.lugar}</small>
            </span>
            <span className="text-etiqueta-chica whitespace-nowrap opacity-60">{rellenarPlantilla(t.paso, { n: 1 })}</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
