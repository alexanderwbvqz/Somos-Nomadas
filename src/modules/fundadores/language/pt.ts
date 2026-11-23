import type { TextosFundadores } from './tipos'

export const pt: TextosFundadores = {
  bienvenida: {
    metadatos: {
      titulo: 'Boas-vindas | Nómadas',
      descripcion: 'Conte quem você é, onde está e o que procura para começar a ver outros founders.',
    },
    paso: 'Passo {actual} de {total}',
    titulo: 'Três coisas e você entra',
    intro: 'Com isso você já vê outros founders. Para que vejam você por completo, depois você termina seu perfil.',
    campos: {
      nombre: 'Nome',
      nombreEjemplo: 'Ana',
      apellidos: 'Sobrenome',
      apellidosEjemplo: 'Torres Rojas',
      pais: 'Onde você está',
      paisPlaceholder: 'Escolha seu país',
      ciudad: 'Cidade',
      ciudadOpcional: '(opcional)',
      ciudadEjemplo: 'Lima',
    },
    paises: {
      AR: 'Argentina',
      BO: 'Bolívia',
      CL: 'Chile',
      CO: 'Colômbia',
      EC: 'Equador',
      MX: 'México',
      PY: 'Paraguai',
      PE: 'Peru',
      UY: 'Uruguai',
      otro: 'Outro país',
    },
    busca: {
      titulo: 'O que você procura',
      ayuda: 'Você pode escolher até {max}.',
      opciones: {
        socioTecnico: 'Um sócio técnico',
        socioComercial: 'Um sócio comercial',
        alguienConIdea: 'Alguém com uma ideia',
        sumarmeAIdea: 'Entrar em uma ideia',
        explorando: 'Ainda explorando',
      },
    },
    errores: {
      nombre: 'Escreva seu nome.',
      apellidos: 'Escreva seu sobrenome.',
      pais: 'Escolha seu país.',
      textoLargo: 'Está muito longo.',
      busquedaVacia: 'Escolha pelo menos uma opção.',
    },
    avisos: {
      limite: 'Você fez muitas tentativas seguidas. Tente de novo em alguns minutos.',
      fallo: 'Não conseguimos salvar seus dados. Tente de novo em um momento.',
    },
    enviar: 'Ver founders',
    enviando: 'Salvando…',
    listo: {
      etiqueta: 'Founders',
      titulo: 'Pronto, {nombre}',
      texto: 'Salvamos seus dados. O diretório de founders abre muito em breve com os primeiros 100 usuários.',
      volver: 'Voltar ao início',
    },
  },
}
