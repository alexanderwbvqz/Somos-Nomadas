import type { TextosHabilidades } from './tipos'

export const en: TextosHabilidades = {
  inicio: {
    metadatos: {
      titulo: 'Get started | Nómadas',
      descripcion: 'Choose how you want to start building your profile.',
    },
    paso: 'Step {actual} of {total}',
    saltar: 'Skip for now',
    saludo: "Hi, {nombre}. Let's start with you.",
    saludoSinNombre: "Let's start with you.",
    subtitulo: 'The people who will read you want to know how you think. Choose where to start.',
    etiquetaCaminos: 'How you want to start',
    caminos: {
      escritas: {
        titulo: 'I have things written',
        texto: 'Upload your CV or LinkedIn as a PDF, or paste links to your website or GitHub. We organize it into blocks and you review it.',
        tiempo: 'About 2 minutes',
        etiqueta: 'Soon',
      },
      cero: {
        titulo: 'I start from scratch',
        texto: 'Short questions and ticking what you have already done. Ideal if you have nothing written yet.',
        tiempo: 'About 6 minutes',
        etiqueta: 'Recommended',
      },
    },
    arrancar: 'Start',
    notaPublicar: 'Nothing is published until you review it.',
    proximo: 'The next step is coming very soon.',
  },
}
