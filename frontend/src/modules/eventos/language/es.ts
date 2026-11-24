import type { TextosEventos } from './tipos'

export const es: TextosEventos = {
  metadatos: {
    titulo: 'Eventos | Nómadas',
    descripcion:
      'Próximos eventos de Nómadas: encuentros presenciales con dinámicas y match para encontrar a tu equipo fundador.',
  },
  hero: {
    etiqueta: 'Eventos',
    titulo: 'Próximos eventos',
    parrafo:
      'Los eventos son el corazón de Nómadas. Confirmas tu asistencia con tu WhatsApp, registras tu llegada al entrar y recibes la lista de personas con las que más conviene hablar, cada una con una pregunta para romper el hielo. Hacemos dinámicas para conocerse mejor, y todas las conexiones son con personas que están en la sala.',
  },
  proximo: {
    etiquetaSeccion: 'El próximo evento',
    lugar: 'Lugar',
    hora: 'Hora',
    confirmar: 'Confirmar asistencia',
    notaConfirmar: 'Confirmas con tu WhatsApp. Así podemos sugerirte conexiones con quienes asistan.',
    mensajeConfirmar: 'Hola, quiero confirmar mi asistencia al evento «{evento}».',
    hoy: 'Hoy',
    manana: 'Mañana',
    enDias: 'En {dias} días',
    modalidades: { presencial: 'Presencial', enlinea: 'En línea' },
    sinEventosTitulo: 'Por ahora no hay eventos programados',
    sinEventosTexto: 'Escríbenos y te avisamos en cuanto haya uno.',
    sinEventosBoton: 'Avísame',
    mensajeAvisar: 'Hola, quiero que me avisen del próximo evento de Nómadas.',
  },
  comoFunciona: {
    etiquetaSeccion: 'Cómo funciona un evento',
    pasos: [
      { titulo: 'Confirma', texto: 'Avisas con tu WhatsApp que vas a asistir, antes del evento.' },
      { titulo: 'Llega', texto: 'Registras tu llegada al entrar, para que sepamos quiénes están en la sala.' },
      { titulo: 'Conecta', texto: 'Recibes tus conexiones del match, solo con personas que asistieron, y una pregunta para empezar.' },
      { titulo: 'Participa', texto: 'Dinámicas para descubrir cómo piensa cada quien antes de decidir con quién construir.' },
    ],
  },
  llamado: {
    tituloInicio: '¿Tienes un espacio o una comunidad?',
    tituloResaltado: 'Organiza un evento con nosotros.',
    boton: 'Quiero ser aliado',
    nota: 'Los organizadores son parte de la red: ponen los espacios y las comunidades donde se reúnen los nómadas.',
  },
  masEventos: {
    etiquetaSeccion: 'Más eventos',
    contador: '{cantidad} eventos',
    verMas: 'Ver más eventos',
    mostrando: 'Mostrando {mostrados} de {total}',
  },
}
