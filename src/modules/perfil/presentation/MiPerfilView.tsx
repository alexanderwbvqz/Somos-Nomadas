'use client'

import { capasDelPerfil, type Perfil } from '../domain/perfil'
import type { TextosPerfil } from '../language/tipos'
import { AvancePerfil } from './components/AvancePerfil'
import { BloqueBuscando } from './components/BloqueBuscando'
import { BloqueEvidencia } from './components/BloqueEvidencia'
import { BloqueForma } from './components/BloqueForma'
import { BloqueHabilidades } from './components/BloqueHabilidades'
import { BloqueHistorias } from './components/BloqueHistorias'
import { BloqueSobreMi } from './components/BloqueSobreMi'
import { BloqueTareas } from './components/BloqueTareas'
import { BloqueTrayectoria } from './components/BloqueTrayectoria'
import { FichaDelPerfil } from './components/FichaDelPerfil'
import { TarjetaDirectorio } from './components/TarjetaDirectorio'
import { VistaPrevia } from './components/VistaPrevia'
import { useEvidencia, type AccionGuardarEvidencia } from './hooks/useEvidencia'
import { useSobreMi, type AccionGuardarSobreMi } from './hooks/useSobreMi'
import { useTrayectoria, type AccionGuardarTrayectoria } from './hooks/useTrayectoria'
import type { PasosPerfil } from './pasos'

export type MiPerfilViewProps = {
  textos: TextosPerfil
  perfil: Perfil
  /** Los pasos del recorrido donde se corrige lo que muestra el perfil; los pone quien arma la pantalla */
  pasos: PasosPerfil
  acciones: { sobreMi: AccionGuardarSobreMi; trayectoria: AccionGuardarTrayectoria; evidencia: AccionGuardarEvidencia }
  /** Para las pruebas; por defecto, el año de hoy */
  anioActual?: number
}

// «Mi perfil»: lo que la persona contó en el recorrido, para revisarlo y corregirlo, y lo que completa aquí mismo (Sobre mí,
// trayectoria, evidencia). A la derecha, qué tan completo está y cómo se vería en el directorio. Va dentro del <main> de la cuenta.
export function MiPerfilView({ textos, perfil, pasos, acciones, anioActual }: MiPerfilViewProps) {
  const sobreMi = useSobreMi(perfil.sobreMi, acciones.sobreMi)
  const trayectoria = useTrayectoria(perfil.trayectoria, acciones.trayectoria, anioActual)
  const evidencia = useEvidencia(perfil.evidencia, acciones.evidencia)

  // Lo que se ve, con lo último que la persona guardó aquí mismo
  const actual: Perfil = { ...perfil, sobreMi: sobreMi.guardado, trayectoria: trayectoria.entradas, evidencia: evidencia.enlaces }

  return (
    <div className="mx-auto w-full max-w-[80rem] px-6 pb-24 pt-10 md:px-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-titulo-medio">{textos.titulo}</h1>
          <p className="mt-2.5 max-w-[34rem] opacity-80">{textos.subtitulo}</p>
        </div>
        <VistaPrevia textos={textos} perfil={actual} />
      </div>

      <div className="mt-8 grid items-start gap-7 escritorio:grid-cols-[8fr_4fr]">
        <div className="grid gap-4">
          <FichaDelPerfil ficha={actual.ficha} textos={textos} />

          <h2 className="text-etiqueta-chica opacity-60">{textos.completaTuPerfil}</h2>
          <BloqueSobreMi textos={textos} sobreMi={sobreMi} />
          <BloqueTrayectoria textos={textos} trayectoria={trayectoria} />
          <BloqueEvidencia textos={textos} evidencia={evidencia} />

          <BloqueBuscando textos={textos} paso={pasos.bienvenida} buscando={actual.buscando} />
          <BloqueHistorias textos={textos} paso={pasos.historias} historias={actual.historias} sectores={actual.sectores} />
          <BloqueHabilidades textos={textos} paso={pasos.tareas} habilidades={actual.habilidades} />
          <BloqueTareas textos={textos} tareas={actual.tareas} />
          <BloqueForma textos={textos} paso={pasos.forma} forma={actual.forma} buscaPerfil={actual.buscaPerfil} socioIdeal={actual.socioIdeal} />
        </div>

        <aside className="grid gap-4">
          <AvancePerfil textos={textos} capas={capasDelPerfil(actual)} />
          <div>
            <h2 className="mb-2 ml-1 mt-1.5 text-[0.8125rem] font-normal opacity-65">{textos.vistaPrevia.titulo}</h2>
            <TarjetaDirectorio perfil={actual} textos={textos} />
          </div>
        </aside>
      </div>
    </div>
  )
}
