import { Hero, type HeroProps } from './components/Hero'

// Vista pura de la landing: recibe todo por props, no conoce idiomas ni datos.
export function LandingView(props: HeroProps) {
  return <Hero {...props} />
}
