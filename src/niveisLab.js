// Escada de niveis do Laboratorio, definida pela NATUREZA DA TAREFA.
//
// Por que existe. Em 01/08/2026 a medicao dos 26 casos encontrou uma coisa
// desconfortavel: todos tem exatamente a mesma forma. Quatro fatos, quatro
// evidencias, cinco perguntas de sim ou nao, quatro elementos de rubrica e
// cinco passos. O unico campo que varia e a serie historica, em cinco deles.
//
// Ou seja, os rotulos de nivel que o catalogo exibe ("Primeiro contato",
// "Aplicacao", "Avancado", "Especialista") sao propriedade do GRUPO, nao do
// caso, e nao correspondem a nenhuma diferenca no que se pede da pessoa. Quem
// resolve o caso 26 faz o mesmo tipo de raciocinio do caso 1.
//
// Este modulo nao inventa progressao: ele MEDE. Cada nivel exige uma marca
// verificavel no dado do caso. Enquanto a marca nao existir, o caso fica no
// degrau de baixo, e o portao check-niveis mostra a lacuna em vez de esconder.
//
// A ordem importa: o nivel de um caso e o mais ALTO que ele satisfaz.

export const NIVEIS = [
  {
    id: 'reconhecer',
    ordem: 1,
    titulo: 'Reconhecer',
    tarefa: 'identificar o que a norma pede',
    recebe: 'caso fechado, com todos os documentos nomeados e presentes',
    marca: 'nenhuma marca especial. E o degrau de partida.',
  },
  {
    id: 'aplicar',
    ordem: 2,
    titulo: 'Aplicar',
    tarefa: 'usar o critério no caso concreto',
    recebe: 'caso com documento que não serve à decisão, para separar o que importa',
    marca: 'ao menos uma evidência marcada com `distrator: true`',
  },
  {
    id: 'decidir',
    ordem: 3,
    titulo: 'Decidir',
    tarefa: 'julgar com informação incompleta',
    recebe: 'caso em que falta evidência, e perceber a falta é parte da resposta',
    marca: 'campo `ausentes` com ao menos um documento que o caso afirma faltar',
  },
  {
    id: 'integrar',
    ordem: 4,
    titulo: 'Integrar',
    tarefa: 'conciliar fontes que não fecham entre si',
    recebe: 'série histórica ou documentos que se contradizem',
    marca: 'campo `serie`, ou evidência marcada com `conflito: true`',
  },
  {
    id: 'fundamentar',
    ordem: 5,
    titulo: 'Fundamentar',
    tarefa: 'sustentar a decisão por escrito',
    recebe: 'pergunta aberta, avaliada por rubrica e por pessoa competente',
    marca: 'campo `openTask` com enunciado e rubrica, ou pergunta cuja resposta não é sim nem não',
  },
];

export const NIVEL_POR_ID = new Map(NIVEIS.map((n) => [n.id, n]));

const RESPOSTAS_FECHADAS = new Set(['sim', 'nao', 'não']);

/** A evidência pode ser texto simples (presente) ou objeto com marcas. */
function marcas(evidencia) {
  if (!evidencia || typeof evidencia === 'string') return {};
  return evidencia;
}

export function temDistrator(caso) {
  if ((caso.evidenceTask?.items || []).some((item) => item.distrator === true)) {
    return true;
  }
  return (caso.evidence || []).some((e) => marcas(e).distrator === true);
}

export function temEvidenciaAusente(caso) {
  // `ausentes` e campo proprio, e nao uma marca dentro de `evidence`, porque
  // evidencia e consumida como texto puro em oito lugares: painel do
  // laboratorio, folha-resposta, provenance e portao de rubricas. Transformar
  // string em objeto quebraria todos eles de uma vez.
  if ((caso.ausentes || []).length) return true;
  return (caso.evidence || []).some((e) => marcas(e).ausente === true);
}

export function temFontesEmConflito(caso) {
  if (caso.serie) return true;
  return (caso.evidence || []).some((e) => marcas(e).conflito === true);
}

export function temPerguntaAberta(caso) {
  if (typeof caso.openTask?.prompt === 'string' && caso.openTask.prompt.trim()) {
    return true;
  }
  return (caso.questions || []).some((q) => {
    const resposta = String(q?.[1] ?? '').trim().toLowerCase();
    return resposta !== '' && !RESPOSTAS_FECHADAS.has(resposta);
  });
}

/**
 * Nível que o caso alcança pela própria estrutura, não pelo rótulo do grupo.
 * Devolve sempre um dos NIVEIS, nunca null: o degrau de partida é reconhecer.
 */
export function nivelDoCaso(caso) {
  if (temPerguntaAberta(caso)) return NIVEL_POR_ID.get('fundamentar');
  if (temFontesEmConflito(caso)) return NIVEL_POR_ID.get('integrar');
  if (temEvidenciaAusente(caso)) return NIVEL_POR_ID.get('decidir');
  if (temDistrator(caso)) return NIVEL_POR_ID.get('aplicar');
  return NIVEL_POR_ID.get('reconhecer');
}

/** Distribuição dos casos pelos degraus, na ordem da escada. */
export function distribuicao(casos = []) {
  const contagem = new Map(NIVEIS.map((n) => [n.id, 0]));
  for (const caso of casos) {
    const nivel = nivelDoCaso(caso);
    contagem.set(nivel.id, contagem.get(nivel.id) + 1);
  }
  return NIVEIS.map((n) => ({ ...n, casos: contagem.get(n.id) }));
}
