import Link from 'next/link'
import { areaTactil, foco } from '@/shared/ui/EnlaceBoton'
import type { PerfilPublico } from '../domain/perfilPublico'
import type { TextosPerfil } from '../language/tipos'
import { FichaDelPerfil } from './components/FichaDelPerfil'
import { LecturaBuscando } from './components/LecturaBuscando'
import { LecturaEvidencia } from './components/LecturaEvidencia'
import { LecturaForma } from './components/LecturaForma'
import { LecturaHabilidades } from './components/LecturaHabilidades'
import { LecturaHistorias } from './components/LecturaHistorias'
import { LecturaSobreMi } from './components/LecturaSobreMi'
import { LecturaTrayectoria } from './components/LecturaTrayectoria'

export type PerfilPublicoViewProps = {
  textos: TextosPerfil
  /** Lo que ve otra persona, ya decidido por el dominio (`perfilPublico`) */
  perfil: PerfilPublico
  /** A Mi perfil; lo pone quien arma la pantalla */
  hrefVolver: string
}

// «Ver como me ven»: el perfil como lo lee otra persona, sin nada que editar. Va en el mismo orden que Mi perfil y deja fuera los
// bloques que no tienen nada: aquí no hay a quién invitar a completarlos. Va dentro del <main> de la cuenta.
export function PerfilPublicoView({ textos, perfil, hrefVolver }: PerfilPublicoViewProps) {
  const hayHistorias = perfil.historias.length > 0 || perfil.sectores.respuestas.length > 0
  const hayForma = perfil.forma.length > 0 || perfil.buscaPerfil.respuestas.length > 0 || perfil.socioIdeal.texto.trim() !== ''

  return (
    <div className="mx-auto w-full max-w-[50rem] px-6 pb-24 pt-7">
      <Link href={hrefVolver} className={`text-etiqueta ${areaTactil} underline underline-offset-8 ${foco}`}>
        <span aria-hidden="true">← </span>
        {textos.publico.volver}
      </Link>
      <p className="text-cuerpo mt-4 text-texto-tenue">{textos.publico.aviso}</p>

      <div className="mt-4 grid gap-4">
        <FichaDelPerfil ficha={perfil.ficha} textos={textos} paraOtros />
        {perfil.sobreMi.trim() !== '' && <LecturaSobreMi textos={textos} sobreMi={perfil.sobreMi} />}
        {perfil.trayectoria.length > 0 && <LecturaTrayectoria textos={textos} entradas={perfil.trayectoria} />}
        {perfil.evidencia.length > 0 && <LecturaEvidencia textos={textos} enlaces={perfil.evidencia} />}
        {perfil.buscando.length > 0 && <LecturaBuscando textos={textos} buscando={perfil.buscando} />}
        {hayHistorias && <LecturaHistorias textos={textos} historias={perfil.historias} sectores={perfil.sectores} />}
        {perfil.habilidades.length > 0 && <LecturaHabilidades textos={textos} habilidades={perfil.habilidades} />}
        {hayForma && <LecturaForma textos={textos} forma={perfil.forma} buscaPerfil={perfil.buscaPerfil} socioIdeal={perfil.socioIdeal} />}
      </div>
    </div>
  )
}
