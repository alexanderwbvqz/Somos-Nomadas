import type { TextosEventos } from './tipos'

export const pt: TextosEventos = {
  metadatos: {
    titulo: 'Eventos',
    descripcion:
      'Próximos eventos da Nómadas: encontros presenciais com dinâmicas e match para encontrar a sua equipe fundadora.',
  },
  hero: {
    etiqueta: 'Eventos',
    titulo: 'Próximos eventos',
    parrafo:
      'Os eventos são o coração da Nómadas. Você confirma a sua presença pelo WhatsApp, registra a sua chegada ao entrar e recebe a lista de pessoas com quem mais vale a pena conversar, cada uma com uma pergunta para quebrar o gelo. Fazemos dinâmicas para se conhecerem melhor, e todas as conexões são com pessoas que estão na sala.',
  },
  proximo: {
    etiquetaSeccion: 'O próximo evento',
    lugar: 'Local',
    hora: 'Horário',
    confirmar: 'Confirmar presença',
    notaConfirmar: 'Você confirma com o seu WhatsApp. Assim podemos sugerir conexões com quem for participar.',
    mensajeConfirmar: 'Olá, quero confirmar a minha presença no evento «{evento}».',
    hoy: 'Hoje',
    manana: 'Amanhã',
    enDias: 'Em {dias} dias',
    modalidades: { presencial: 'Presencial', enlinea: 'Online' },
    sinEventosTitulo: 'Por enquanto não há eventos programados',
    sinEventosTexto: 'Escreva para nós e avisamos assim que houver um.',
    sinEventosBoton: 'Avise-me',
    mensajeAvisar: 'Olá, quero ser avisado sobre o próximo evento da Nómadas.',
  },
  comoFunciona: {
    etiquetaSeccion: 'Como funciona um evento',
    pasos: [
      { titulo: 'Confirme', texto: 'Você avisa pelo WhatsApp que vai participar, antes do evento.' },
      { titulo: 'Chegue', texto: 'Você registra a sua chegada ao entrar, para sabermos quem está na sala.' },
      { titulo: 'Conecte', texto: 'Você recebe as suas conexões do match, só com pessoas que compareceram, e uma pergunta para começar.' },
      { titulo: 'Participe', texto: 'Dinâmicas para descobrir como cada pessoa pensa antes de decidir com quem construir.' },
    ],
  },
  llamado: {
    tituloInicio: 'Você tem um espaço ou uma comunidade?',
    tituloResaltado: 'Organize um evento conosco.',
    boton: 'Quero ser aliado',
    nota: 'Os organizadores fazem parte da rede: oferecem os espaços e as comunidades onde os nómadas se reúnem.',
  },
  masEventos: {
    etiquetaSeccion: 'Mais eventos',
    contador: '{cantidad} eventos',
    verMas: 'Ver mais eventos',
    mostrando: 'Mostrando {mostrados} de {total}',
  },
}
