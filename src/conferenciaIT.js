// Conferencia da minuta de Informacao Tecnica.
//
// Por que este arquivo existe. O Redator e a tela do produto que o analista
// assina, e ate aqui o unico retorno que ela dava era contar caracteres: 60 de
// qualquer coisa devolviam "registro suficiente para avancar e revisar". As
// doze secoes ja traziam `exige` e `armadilha`, derivados dos itens 23, 24.1 e
// 25 do POP, escritos e nunca conferidos.
//
// O que esta conferencia NAO faz, e a regra vale para qualquer verificacao
// acrescentada aqui depois:
//
//   1. Nao da nota, nem percentual, nem selo. O comentario do proprio redator
//      ja dizia que julgar redacao seria fingir competencia que ele nao tem, e
//      um numero de 0 a 100 sobre um texto tecnico e exatamente esse fingimento
//      com outra roupa. A conferencia devolve itens para revisar, e o analista
//      decide.
//   2. Nao afirma que a minuta esta correta. Silencio aqui significa que
//      nenhuma das verificacoes encontrou o que sabe procurar, e nada alem
//      disso. Por isso `conferirMinuta` nunca devolve "aprovado".
//   3. Nao julga estilo, coesao nem gramatica.
//
// O que ela faz e conferir o conferivel: presenca de elemento que o item 23.1
// exige, marca textual das armadilhas que o proprio POP nomeia, coerencia
// entre secoes que nao podem se contradizer, e ancoragem no caso escolhido.
// A mesma disciplina da rubrica do laboratorio: grupo conceitual de termos,
// com o texto generico nao pontuando nada.
//
// Cada verificacao tem `id` estavel porque o portao exercita as duas direcoes,
// o texto que deve acionar e o que nao deve. Verificacao sem os dois exemplos
// reprova a bateria: regra que nunca dispara e regra que nunca se cala valem o
// mesmo, que e nada.

import { ESTRUTURA_IT, MINIMO_SECAO } from './redatorIT.js';
import { bateAlgum, normalizarTexto } from './textoTermos.js';

export const TIPOLOGIAS = ['MCH', 'MGH', 'CGH', 'PCH', 'UHE'];

// Marca de citacao normativa. O que interessa aqui e o dispositivo, e nao o
// nome da norma: "Resolucao CEMA" sozinho nao diz qual regra se aplica.
const NORMA = [
  'lei', 'decreto', 'resolucao', 'portaria', 'instrucao normativa', ' in ',
  'deliberacao', 'termo de referencia', 'tr', 'condicionante', 'norma',
];
const DISPOSITIVO = ['art', 'artigo', 'inciso', 'paragrafo', '§', 'alinea', 'anexo', 'item'];
const POP_COMO_FONTE = ['pop', 'procedimento operacional padrao'];

const APRESENTACAO = ['apresentad', 'juntad', 'consta', 'anexad', 'protocolad'];
const CONSEQUENCIA = [
  'insuficien', 'impede', 'prejudic', 'consequencia', 'efeito', 'compromet',
  'inviabiliza', 'nao permite', 'obsta', 'suficien',
];

const MODALIDADE = ['modalidade', 'enquadr', 'tipologia', 'licenca', 'autorizacao', 'consulta previa'];
const SUFICIENCIA = ['suficien', 'insuficien', 'documenta', 'instruc', 'complet'];

const IMPEDITIVO = ['impeditiv', 'impede', 'obsta', 'inviabiliza', 'nao permite decisao'];
const CONDICIONANTE = ['condicionante'];
const DILIGENCIA = ['diligencia', 'complementac', 'complementar', 'notific', 'exigencia'];
// Deferir e indeferir compartilham o radical, e "apto" cabe inteiro dentro de
// "inapto" e de "adaptou". Sem a lista de exclusao, a verificacao de coerencia
// acusaria justamente quem concluiu pela insuficiencia e encaminhou pelo
// indeferimento, que e a decisao coerente. Acusar o acerto e pior do que nao
// verificar: destroi a confianca na conferencia inteira.
const DEFERIMENTO = ['deferimento', 'deferir', 'defiro', 'favoravel a emissao', 'pode ser emitid', 'recomendo a emissao'];
const NEGA_DEFERIMENTO = ['indeferimento', 'indeferir', 'indefiro', 'nao favoravel', 'inapto'];

function texto(rascunho, id) {
  return String(rascunho?.[id] || '').trim();
}

function secaoPor(id) {
  return ESTRUTURA_IT.find((s) => s.id === id);
}

function achado({ id, secaoId, natureza, tipo, mensagem, criterio }) {
  const secao = secaoPor(secaoId);
  return {
    id,
    secaoId,
    secaoN: secao?.n ?? null,
    secaoTitulo: secao?.titulo ?? '',
    natureza,
    tipo,
    mensagem,
    criterio,
  };
}

// Cada verificacao recebe o texto normalizado por secao e devolve um achado ou
// null. Nenhuma delas olha o texto bruto: acento e caixa nao podem decidir se
// a minuta tem um problema.
const VERIFICACOES = [
  {
    id: 'tipologia-ausente',
    // Item 23.1 pede a tipologia na identificacao. Sem ela, nada do que vem
    // depois tem referencia: a mesma exigencia muda com CGH, PCH ou UHE.
    aplica: ({ secoes }) => Boolean(secoes.identificacao),
    conferir: ({ secoes }) => (
      bateAlgum(secoes.identificacao, TIPOLOGIAS)
        ? null
        : achado({
            id: 'tipologia-ausente',
            secaoId: 'identificacao',
            natureza: 'faltou',
            tipo: 'cobertura',
            mensagem: 'A identificação não declara a tipologia. Escreva MCH, MGH, CGH, PCH ou UHE: a exigência documental muda com ela.',
            criterio: 'Item 23.1, elemento 1',
          })
    ),
  },
  {
    id: 'tipologia-divergente',
    // Divergencia factual, e nao de redacao: o caso declara a tipologia e a
    // minuta afirma outra. E a armadilha da secao 1, registrar a tipologia
    // pelo nome do empreendimento em vez de confrontar potencia e reservatorio.
    aplica: ({ secoes, caso }) => Boolean(secoes.identificacao) && Boolean(caso?.type),
    conferir: ({ secoes, caso }) => {
      const declaradas = TIPOLOGIAS.filter((t) => bateAlgum(secoes.identificacao, [t]));
      const doCaso = String(caso.type || '').toUpperCase();
      if (!declaradas.length || declaradas.includes(doCaso)) return null;
      return achado({
        id: 'tipologia-divergente',
        secaoId: 'identificacao',
        natureza: 'risco',
        tipo: 'armadilha',
        mensagem: `A identificação declara ${declaradas.join(' e ')}, e o caso é ${doCaso}. Confronte potência e reservatório antes de fixar a tipologia.`,
        criterio: 'Armadilha do elemento 1',
      });
    },
  },
  {
    id: 'base-pop-como-fundamento',
    // A armadilha mais cara do conjunto, e a unica que o manual do projeto
    // repete fora do redator: o POP organiza o metodo e nao cria exigencia.
    // So acusa quando o POP aparece E nenhuma norma aparece, porque citar o
    // POP ao lado do dispositivo e legitimo.
    aplica: ({ secoes }) => Boolean(secoes.base),
    conferir: ({ secoes }) => {
      const citaPop = bateAlgum(secoes.base, POP_COMO_FONTE);
      const citaNorma = bateAlgum(secoes.base, NORMA);
      if (!citaPop || citaNorma) return null;
      return achado({
        id: 'base-pop-como-fundamento',
        secaoId: 'base',
        natureza: 'risco',
        tipo: 'armadilha',
        mensagem: 'A base legal cita o POP e nenhuma norma. O POP organiza o método e não cria exigência: o fundamento está na norma, no Termo de Referência ou em condicionante anterior.',
        criterio: 'Armadilha do elemento 4',
      });
    },
  },
  {
    id: 'base-sem-dispositivo',
    // "Cite o dispositivo, nao so o numero da norma" e a dica da propria
    // secao. Nao dispara junto com a anterior: se nao ha norma nenhuma, o
    // achado util e o de cima.
    aplica: ({ secoes }) => Boolean(secoes.base),
    conferir: ({ secoes }) => {
      if (!bateAlgum(secoes.base, NORMA)) return null;
      if (bateAlgum(secoes.base, DISPOSITIVO)) return null;
      return achado({
        id: 'base-sem-dispositivo',
        secaoId: 'base',
        natureza: 'faltou',
        tipo: 'cobertura',
        mensagem: 'A base legal nomeia norma sem apontar o dispositivo. Indique artigo, inciso ou anexo e confirme a vigência na data do protocolo.',
        criterio: 'Item 23.1, elemento 4',
      });
    },
  },
  {
    id: 'documental-sem-consequencia',
    // "Apresentar nao e sinonimo de suficiente" esta escrito no `exige` da
    // secao 7. Aqui a marca e textual: a minuta lista pecas e nao diz o que a
    // presenca ou a falta de cada uma faz com a decisao.
    aplica: ({ secoes }) => Boolean(secoes.documental),
    conferir: ({ secoes }) => {
      if (!bateAlgum(secoes.documental, APRESENTACAO)) return null;
      if (bateAlgum(secoes.documental, CONSEQUENCIA)) return null;
      return achado({
        id: 'documental-sem-consequencia',
        secaoId: 'documental',
        natureza: 'risco',
        tipo: 'armadilha',
        mensagem: 'A análise documental registra que as peças foram apresentadas e não avalia suficiência. Apresentar não é sinônimo de suficiente: escreva a consequência técnica de cada achado.',
        criterio: 'Armadilha do elemento 7',
      });
    },
  },
  {
    id: 'conclusao-um-juizo-so',
    // A conclusao precisa separar adequacao da modalidade e suficiencia
    // documental. Sao dois juizos, e a armadilha e mistura-los: a modalidade
    // pode estar adequada e a documentacao ainda ser insuficiente.
    aplica: ({ secoes }) => Boolean(secoes.conclusao),
    conferir: ({ secoes }) => {
      const temModalidade = bateAlgum(secoes.conclusao, MODALIDADE);
      const temSuficiencia = bateAlgum(secoes.conclusao, SUFICIENCIA);
      if (temModalidade && temSuficiencia) return null;
      const faltando = !temModalidade ? 'da adequação da modalidade' : 'da suficiência documental';
      return achado({
        id: 'conclusao-um-juizo-so',
        secaoId: 'conclusao',
        natureza: 'faltou',
        tipo: 'cobertura',
        mensagem: `A conclusão não trata ${faltando}. Escreva os dois juízos separadamente, mesmo quando um deles for favorável.`,
        criterio: 'Item 23.1, elemento 10',
      });
    },
  },
  {
    id: 'condicionante-para-pendencia-impeditiva',
    // Coerencia entre as secoes 9 e 11. Usar condicionante para adiar
    // pendencia impeditiva e a armadilha nomeada no elemento 11, e ela so
    // aparece confrontando as duas secoes.
    aplica: ({ secoes }) => Boolean(secoes.pendencias) && Boolean(secoes.encaminhamento),
    conferir: ({ secoes }) => {
      if (!bateAlgum(secoes.pendencias, IMPEDITIVO)) return null;
      if (!bateAlgum(secoes.encaminhamento, CONDICIONANTE)) return null;
      if (bateAlgum(secoes.encaminhamento, DILIGENCIA)) return null;
      return achado({
        id: 'condicionante-para-pendencia-impeditiva',
        secaoId: 'encaminhamento',
        natureza: 'risco',
        tipo: 'coerencia',
        mensagem: 'As pendências indicam impedimento e o encaminhamento responde com condicionante, sem diligência ou complementação. Condicionante não adia pendência impeditiva.',
        criterio: 'Armadilha do elemento 11, confrontada com o elemento 9',
      });
    },
  },
  {
    id: 'conclusao-contradiz-encaminhamento',
    // A armadilha do elemento 12, e a unica que so existe na leitura inversa:
    // assinar texto cuja conclusao contradiz os achados.
    aplica: ({ secoes }) => Boolean(secoes.conclusao) && Boolean(secoes.encaminhamento),
    conferir: ({ secoes }) => {
      if (!bateAlgum(secoes.conclusao, ['insuficien', ...IMPEDITIVO])) return null;
      if (!bateAlgum(secoes.encaminhamento, DEFERIMENTO)) return null;
      if (bateAlgum(secoes.encaminhamento, NEGA_DEFERIMENTO)) return null;
      if (bateAlgum(secoes.encaminhamento, DILIGENCIA)) return null;
      return achado({
        id: 'conclusao-contradiz-encaminhamento',
        secaoId: 'controle_qualidade',
        natureza: 'risco',
        tipo: 'coerencia',
        mensagem: 'A conclusão aponta insuficiência ou impedimento e o encaminhamento defere sem diligência. Faça a leitura inversa: do encaminhamento para cada evidência que o sustenta.',
        criterio: 'Armadilha do elemento 12, confrontada com os elementos 10 e 11',
      });
    },
  },
  {
    id: 'minuta-generica',
    // A propriedade que o portao da rubrica do laboratorio ja cobrava: texto
    // sem conteudo do caso nao pontua. Aqui vale para a minuta inteira, porque
    // uma IT que serve para qualquer processo nao serve para nenhum.
    aplica: ({ ancoras, escritas }) => ancoras.length > 0 && escritas >= 3,
    conferir: ({ tudo, ancoras }) => (
      ancoras.some((termo) => bateAlgum(tudo, [termo]))
        ? null
        : achado({
            id: 'minuta-generica',
            secaoId: 'metodologia',
            natureza: 'risco',
            tipo: 'ancoragem',
            mensagem: 'A minuta não cita nenhuma evidência nem nenhum fato do caso escolhido. Diga o que foi efetivamente confrontado, com o nome da peça.',
            criterio: 'Armadilha do elemento 5',
          })
    ),
  },
];

/**
 * Termos do caso que uma minuta ancorada precisa tocar em algum lugar.
 * Sai das evidencias e dos fatos, que sao o material que o caso oferece.
 */
export function ancorasDoCaso(caso) {
  const bruto = [...(caso?.evidence || []), ...(caso?.facts || [])];
  const termos = new Set();
  for (const item of bruto) {
    for (const palavra of normalizarTexto(item).split(/[^a-z0-9]+/)) {
      if (palavra.length >= 5) termos.add(palavra);
    }
  }
  return [...termos];
}

/**
 * Confere a minuta e devolve o que revisar. Nunca devolve aprovacao.
 *
 * @returns {{achados: Array, escritas: number, total: number, conferiveis: number}}
 */
export function conferirMinuta(caso, rascunho = {}) {
  const secoes = {};
  let escritas = 0;
  for (const secao of ESTRUTURA_IT) {
    const conteudo = texto(rascunho, secao.id);
    if (conteudo.length >= MINIMO_SECAO) escritas += 1;
    secoes[secao.id] = conteudo ? normalizarTexto(conteudo) : '';
  }
  const contexto = {
    caso,
    secoes,
    escritas,
    tudo: Object.values(secoes).join(' \n '),
    ancoras: ancorasDoCaso(caso),
  };

  const achados = [];
  let conferiveis = 0;
  for (const verificacao of VERIFICACOES) {
    if (!verificacao.aplica(contexto)) continue;
    conferiveis += 1;
    const resultado = verificacao.conferir(contexto);
    if (resultado) achados.push(resultado);
  }

  return {
    achados,
    escritas,
    total: ESTRUTURA_IT.length,
    conferiveis,
  };
}

/** Ids das verificacoes, para o portao provar que nenhuma ficou sem exemplo. */
export const IDS_VERIFICACAO = VERIFICACOES.map((v) => v.id);
