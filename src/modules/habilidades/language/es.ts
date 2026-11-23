import type { TextosHabilidades } from './tipos'

export const es: TextosHabilidades = {
  inicio: {
    metadatos: {
      titulo: 'Empezar | Nómadas',
      descripcion: 'Elige cómo quieres empezar a armar tu perfil.',
    },
    paso: 'Paso {actual} de {total}',
    saltar: 'Saltar por ahora',
    saludo: 'Hola, {nombre}. Empecemos por ti.',
    saludoSinNombre: 'Empecemos por ti.',
    subtitulo: 'La gente que te va a leer quiere saber cómo piensas. Elige por dónde arrancar.',
    etiquetaCaminos: 'Cómo quieres empezar',
    caminos: {
      escritas: {
        titulo: 'Tengo cosas escritas',
        texto: 'Sube tu CV o tu LinkedIn en PDF, o pega enlaces a tu web o a tu GitHub. Lo ordenamos en bloques y tú lo revisas.',
        tiempo: 'Unos 2 minutos',
        etiqueta: 'Pronto',
      },
      cero: {
        titulo: 'Arranco de cero',
        texto: 'Preguntas cortas y marcar lo que ya has hecho. Ideal si todavía no tienes nada escrito.',
        tiempo: 'Unos 6 minutos',
        etiqueta: 'Recomendado',
      },
    },
    arrancar: 'Arrancar',
    notaPublicar: 'Nada se publica hasta que lo revises.',
    proximo: 'El siguiente paso llega muy pronto.',
  },
}
