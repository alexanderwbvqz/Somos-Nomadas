import { Casilla, CampoTexto } from '@/shared/ui/Campos'
import { LIMITES } from '@/modules/aliados/domain/postulacion'
import { mensajeDeError, type PropsPaso } from './tiposPaso'

// Paso 3: dónde se encuentra al aliado y cómo lo contactan directamente los emprendedores.
export function PasoContacto({ textos, datos, errores, cambiar }: PropsPaso) {
  const t = textos.contacto
  const url = { tipo: 'url' as const, inputMode: 'url' as const, maxLength: LIMITES.url * 2 }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <CampoTexto
          clave="ciudad"
          etiqueta={t.ciudad}
          autoComplete="address-level2"
          maxLength={LIMITES.ciudad * 2}
          valor={datos.ciudad}
          alCambiar={(valor) => cambiar('ciudad', valor)}
          error={mensajeDeError(textos, errores.ciudad)}
        />
        <CampoTexto
          clave="sitioWeb"
          etiqueta={t.sitioWeb}
          {...url}
          valor={datos.sitioWeb}
          alCambiar={(valor) => cambiar('sitioWeb', valor)}
          error={mensajeDeError(textos, errores.sitioWeb)}
        />
        <CampoTexto
          clave="linkedin"
          etiqueta={t.linkedin}
          {...url}
          placeholder="https://www.linkedin.com/…"
          valor={datos.linkedin}
          alCambiar={(valor) => cambiar('linkedin', valor)}
          error={mensajeDeError(textos, errores.linkedin)}
        />
        <CampoTexto
          clave="instagram"
          etiqueta={t.instagram}
          {...url}
          placeholder="https://www.instagram.com/…"
          valor={datos.instagram}
          alCambiar={(valor) => cambiar('instagram', valor)}
          error={mensajeDeError(textos, errores.instagram)}
        />
      </div>

      <div className="mt-2">
        <h3 className="text-titulo-tarjeta">{t.directo}</h3>
        <p className="text-cuerpo mt-1.5 opacity-80">{t.directoNota}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <CampoTexto
          clave="whatsapp"
          etiqueta={t.whatsapp}
          tipo="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={40}
          ayuda={t.whatsappAyuda}
          valor={datos.whatsapp}
          alCambiar={(valor) => cambiar('whatsapp', valor)}
          // Si falta toda forma de contacto, el aviso va junto al primer campo de contacto
          error={mensajeDeError(textos, errores.whatsapp ?? errores.contacto)}
        />
        <CampoTexto
          clave="enlaceAgenda"
          etiqueta={t.agenda}
          {...url}
          ayuda={t.agendaAyuda}
          valor={datos.enlaceAgenda}
          alCambiar={(valor) => cambiar('enlaceAgenda', valor)}
          error={mensajeDeError(textos, errores.enlaceAgenda)}
        />
      </div>

      {datos.whatsapp.trim() !== '' && (
        <Casilla
          clave="consentimientoWhatsapp"
          marcada={datos.consentimientoWhatsapp}
          alCambiar={(marcada) => cambiar('consentimientoWhatsapp', marcada)}
          error={mensajeDeError(textos, errores.consentimientoWhatsapp)}
        >
          {t.consentimiento}
        </Casilla>
      )}
    </div>
  )
}
