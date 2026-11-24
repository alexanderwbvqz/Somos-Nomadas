import { Badge } from '@/shared/ui/Badge'
import type { FichaPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'

// Lo principal: la portada, las iniciales, el nombre, dónde vive y en qué área cae (más de una si empata).
// `paraOtros`: es la página donde otra persona lee el perfil; el nombre es entonces el título de la página (h1) y las iniciales
// no se anuncian, porque ya está el nombre.
export function FichaDelPerfil({ ficha, textos, paraOtros = false }: { ficha: FichaPerfil; textos: TextosPerfil; paraOtros?: boolean }) {
  const Nombre = paraOtros ? 'h1' : 'h2'
  return (
    <section aria-label={textos.ficha.etiqueta} className="rounded-3xl bg-tarjeta p-2.5">
      <div className="fondo-portada h-[10.625rem] rounded-[1.125rem]" />
      <div className="px-6 pb-6">
        <div role={paraOtros ? undefined : 'img'} aria-label={paraOtros ? undefined : textos.ficha.avatar} className="-mt-14 flex size-28 items-center justify-center rounded-full border-[5px] border-tarjeta bg-fondo font-serif text-[2.625rem]">
          <span aria-hidden="true">{ficha.iniciales}</span>
        </div>
        <Nombre className="text-titulo-tarjeta-grande mt-3.5">
          {ficha.nombre} {ficha.apellidos}
        </Nombre>
        <p className="mt-2 text-texto-suave">
          {ficha.ciudad}, {ficha.pais}
          {ficha.modalidad ? ` · ${ficha.modalidad}` : ''}
        </p>
        <ul className="mt-3.5 flex flex-wrap gap-2">
          {ficha.areas.map((area) => (
            <li key={area}>
              <Badge tono="oscuro" formato="respuesta">
                {area}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
