import type { TextosHabilidades } from './tipos'

export const pt: TextosHabilidades = {
  inicio: {
    metadatos: {
      titulo: 'Começar | Nómadas',
      descripcion: 'Escolha como você quer começar a montar seu perfil.',
    },
    paso: 'Passo {actual} de {total}',
    saltar: 'Pular por enquanto',
    saludo: 'Olá, {nombre}. Vamos começar por você.',
    saludoSinNombre: 'Vamos começar por você.',
    subtitulo: 'As pessoas que vão ler você querem saber como você pensa. Escolha por onde começar.',
    etiquetaCaminos: 'Como você quer começar',
    caminos: {
      escritas: {
        titulo: 'Tenho coisas escritas',
        texto: 'Envie seu CV ou seu LinkedIn em PDF, ou cole links do seu site ou do seu GitHub. Organizamos em blocos e você revisa.',
        tiempo: 'Cerca de 2 minutos',
        etiqueta: 'Em breve',
      },
      cero: {
        titulo: 'Começo do zero',
        texto: 'Perguntas curtas e marcar o que você já fez. Ideal se você ainda não tem nada escrito.',
        tiempo: 'Cerca de 6 minutos',
        etiqueta: 'Recomendado',
      },
    },
    arrancar: 'Começar',
    notaPublicar: 'Nada é publicado até você revisar.',
    proximo: 'O próximo passo chega muito em breve.',
  },
}
