import { SeccionAliados, type SeccionAliadosProps } from './components/SeccionAliados'
import { Hero, type HeroProps } from './components/Hero'
import { SeccionCifras, type SeccionCifrasProps } from './components/SeccionCifras'
import { SeccionMatch, type SeccionMatchProps } from './components/SeccionMatch'
import { SeccionPilares, type SeccionPilaresProps } from './components/SeccionPilares'
import { SeccionProblemas, type SeccionProblemasProps } from './components/SeccionProblemas'

export type LandingViewProps = {
  hero: HeroProps
  problemas: SeccionProblemasProps
  cifras: SeccionCifrasProps
  match: SeccionMatchProps
  pilares: SeccionPilaresProps
  aliados: SeccionAliadosProps
}

// Vista pura de la landing: recibe todo por props, no conoce idiomas ni datos.
// Orden: el problema, la evidencia, la solución (el match), las áreas que buscamos y la red de respaldo.
export function LandingView({ hero, problemas, cifras, match, pilares, aliados }: LandingViewProps) {
  return (
    <>
      <Hero {...hero} />
      <SeccionProblemas {...problemas} />
      <SeccionCifras {...cifras} />
      <SeccionMatch {...match} />
      <SeccionPilares {...pilares} />
      <SeccionAliados {...aliados} />
    </>
  )
}
