// Liga as aulas do Anexo B ao que o Redator de IT ja ensina sobre cada seção.
//
// Por que existe. A medição de 01/08/2026 encontrou oito aulas com menos de
// 200 caracteres de texto do POP, sem quadro e sem subaulas. Todas no M14, e
// todas seções do modelo de Informação Técnica do Anexo B: Objeto, Histórico,
// Base legal, Metodologia, Análise documental, Conclusão, Condicionantes ou
// pendências e Encaminhamento.
//
// Elas são magras porque no POP são de fato só rótulos de um modelo: a seção
// "Conclusão" tem 74 caracteres. Quem abria essas aulas via um título e
// praticamente nada, em oito de dezessete aulas do módulo mais importante do
// curso, que é justamente o de suficiência, pendências e conclusão.
//
// O conteúdo didático delas JÁ EXISTIA na plataforma, dentro do Redator de IT:
// para cada um dos 12 elementos do item 23.1 há o que o POP exige ali e o erro
// que mais aparece. Faltava ligar as duas coisas. Isto não inventa conteúdo:
// reaproveita o que já foi escrito e autorizado, e leva a pessoa da leitura
// para a prática de escrever aquela seção.
import { ESTRUTURA_IT } from './redatorIT.js';

// Título da aula no POP -> id do elemento no Redator. O casamento é por título
// porque o número da seção do Anexo B (1 a 10) colide com os capítulos 1 a 10
// do POP, um defeito que este projeto já corrigiu uma vez no roteamento.
const POR_TITULO = new Map([
  ['identificacao', 'identificacao'],
  ['objeto', 'objeto'],
  ['historico', 'historico'],
  ['base legal', 'base'],
  ['metodologia', 'metodologia'],
  ['analise documental', 'documental'],
  ['analise tecnica', 'tecnica'],
  ['pendencias', 'pendencias'],
  ['pendencias classificadas', 'pendencias'],
  ['conclusao', 'conclusao'],
  ['condicionantes ou pendencias', 'pendencias'],
  ['condicionantes', 'encaminhamento'],
  ['encaminhamento', 'encaminhamento'],
  ['controle de qualidade', 'controle_qualidade'],
]);

const ELEMENTO_POR_ID = new Map(ESTRUTURA_IT.map((s) => [s.id, s]));

function chave(titulo = '') {
  return titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Elemento do Redator correspondente a uma aula, ou null.
 *
 * Só responde para aula do módulo do Anexo B (m14). Fora dele, "Conclusão" e
 * "Metodologia" são palavras comuns e casariam por acidente, colando
 * orientação de redação de IT em aula que não trata disso.
 */
export function elementoDaAula(lesson) {
  if (!lesson || lesson.trackId !== 'm14') return null;
  const id = POR_TITULO.get(chave(lesson.title));
  return id ? ELEMENTO_POR_ID.get(id) || null : null;
}

/**
 * A aula é magra o bastante para justificar o complemento?
 *
 * O critério é o texto próprio da seção, não o título. Aula do Anexo B que
 * ganhe conteúdo numa extração futura deixa de receber o bloco sozinha, sem
 * ninguém precisar lembrar de remover.
 */
export function precisaDeComplemento(textoDaSecao = '', lesson = null) {
  return textoDaSecao.trim().length < 400 && Boolean(elementoDaAula(lesson));
}
