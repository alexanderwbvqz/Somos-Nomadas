import type { TextosFundadores } from './tipos'

export const es: TextosFundadores = {
  bienvenida: {
    metadatos: {
      titulo: 'Bienvenida | Nómadas',
      descripcion: 'Cuéntanos quién eres, dónde estás y qué buscas para empezar a ver a otros founders.',
    },
    titulo: 'Tres cosas y entras',
    intro: 'Con esto ya ves a otros founders. Para que te vean completo, después terminas tu perfil.',
    campos: {
      nombre: 'Nombre',
      nombreEjemplo: 'Ana',
      apellidos: 'Apellidos',
      apellidosEjemplo: 'Torres Rojas',
      pais: 'Dónde estás',
      paisPlaceholder: 'Elige tu país',
      ciudad: 'Ciudad',
      ciudadOpcional: '(opcional)',
      ciudadEjemplo: 'Lima',
    },
    paises: {
      AR: 'Argentina',
      BO: 'Bolivia',
      CL: 'Chile',
      CO: 'Colombia',
      EC: 'Ecuador',
      MX: 'México',
      PY: 'Paraguay',
      PE: 'Perú',
      UY: 'Uruguay',
      otro: 'Otro país',
    },
    busca: {
      titulo: 'Qué estás buscando',
      ayuda: 'Puedes elegir hasta {max}.',
      opciones: {
        socioTecnico: 'Un socio técnico',
        socioComercial: 'Un socio comercial',
        alguienConIdea: 'Alguien con una idea',
        sumarmeAIdea: 'Sumarme a una idea',
        explorando: 'Todavía explorando',
      },
    },
    errores: {
      nombre: 'Escribe tu nombre.',
      apellidos: 'Escribe tus apellidos.',
      pais: 'Elige tu país.',
      textoLargo: 'Es demasiado largo.',
      busquedaVacia: 'Elige al menos una opción.',
    },
    avisos: {
      limite: 'Hiciste demasiados intentos seguidos. Inténtalo de nuevo en unos minutos.',
      fallo: 'No pudimos guardar tus datos. Inténtalo de nuevo en un momento.',
    },
    enviar: 'Ver founders',
    enviando: 'Guardando…',
  },
}
