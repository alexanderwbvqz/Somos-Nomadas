import type { TextosFundadores } from './tipos'

export const en: TextosFundadores = {
  bienvenida: {
    metadatos: {
      titulo: 'Welcome | Nómadas',
      descripcion: 'Tell us who you are, where you are and what you are looking for to start seeing other founders.',
    },
    paso: 'Step {actual} of {total}',
    titulo: 'Three things and you are in',
    intro: 'With this you can already see other founders. To be seen in full, you finish your profile afterwards.',
    campos: {
      nombre: 'First name',
      nombreEjemplo: 'For example: Ana',
      apellidos: 'Last name',
      apellidosEjemplo: 'For example: Torres Rojas',
      pais: 'Where you are',
      paisPlaceholder: 'Choose your country',
      ciudad: 'City',
      ciudadOpcional: '(optional)',
      ciudadEjemplo: 'For example: Lima',
    },
    paises: {
      AR: 'Argentina',
      BO: 'Bolivia',
      CL: 'Chile',
      CO: 'Colombia',
      EC: 'Ecuador',
      MX: 'Mexico',
      PY: 'Paraguay',
      PE: 'Peru',
      UY: 'Uruguay',
      otro: 'Other country',
    },
    busca: {
      titulo: 'What you are looking for',
      ayuda: 'You can choose up to {max}.',
      opciones: {
        socioTecnico: 'A technical partner',
        socioComercial: 'A business partner',
        alguienConIdea: 'Someone with an idea',
        sumarmeAIdea: 'To join an idea',
        explorando: 'Still exploring',
      },
    },
    errores: {
      nombre: 'Enter your first name.',
      apellidos: 'Enter your last name.',
      pais: 'Choose your country.',
      textoLargo: 'This is too long.',
      busquedaVacia: 'Choose at least one option.',
    },
    avisos: {
      limite: 'You made too many attempts in a row. Try again in a few minutes.',
      fallo: 'We could not save your details. Try again in a moment.',
    },
    enviar: 'See founders',
    enviando: 'Saving…',
    listo: {
      etiqueta: 'Founders',
      titulo: 'All set, {nombre}',
      texto: 'We saved your details. The founders directory opens very soon with the first 100 users.',
      volver: 'Back to home',
    },
  },
}
