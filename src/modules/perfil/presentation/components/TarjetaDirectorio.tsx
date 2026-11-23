import { Badge } from '@/shared/ui/Badge'
import type { Perfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import { PuntosNivel } from './PuntosNivel'

// Cómo se vería la persona en el directorio: lo principal de su perfil en una tarjeta. Si no escribió «Sobre mí», esa línea no va.
export function TarjetaDirectorio({ perfil, textos }: { perfil: Perfil; textos: TextosPerfil }) {
  const { ficha } = perfil
  return (
    <article className="rounded-3xl bg-tarjeta p-2.5">
      <div className="fondo-portada h-[5.625rem] rounded-[0.875rem]" />
      <div role="img" aria-label={textos.ficha.avatar} className="-mt-8 ml-3.5 flex size-16 items-center justify-center rounded-full border-4 border-tarjeta bg-fondo font-serif text-2xl">
        <span aria-hidden="true">{ficha.iniciales}</span>
      </div>
      <h3 className="mx-3.5 mt-2.5 font-serif text-xl">
        {ficha.nombre} {ficha.apellidos}
      </h3>
      <p className="text-nota mx-3.5 mt-1 opacity-75">
        {ficha.ciudad}, {ficha.pais}
        {ficha.modalidad ? ` · ${ficha.modalidad}` : ''}
      </p>
      <ul className="mx-3.5 mt-3 flex flex-wrap gap-2">
        {ficha.areas.map((area) => (
          <li key={area}>
            <Badge tono="borde" formato="respuesta">
              {area}
            </Badge>
          </li>
        ))}
      </ul>
      {perfil.sobreMi.trim() !== '' && <p className="text-cuerpo mx-3.5 mt-3 line-clamp-2">{perfil.sobreMi}</p>}
      <ul className="mx-3.5 mt-3.5 grid gap-1.5">
        {perfil.habilidades.slice(0, 3).map((habilidad) => (
          <li key={habilidad.nombre} className="text-cuerpo flex items-center justify-between gap-2.5">
            <span>{habilidad.nombre}</span>
            <PuntosNivel nivel={habilidad.nivel} etiqueta={textos.habilidades.nivel} />
          </li>
        ))}
      </ul>
      {perfil.buscando.length > 0 && (
        <p className="text-nota mx-3.5 mb-2 mt-3.5">
          <span className="opacity-65">{textos.tarjeta.busca}</span> {perfil.buscando.join(' · ')}
        </p>
      )}
    </article>
  )
}
