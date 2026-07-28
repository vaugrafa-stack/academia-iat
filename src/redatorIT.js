// Estrutura da Informacao Tecnica pelo item 23.1 do POP.
//
// Por que este arquivo existe. A plataforma ensinava a RECONHECER: julgar
// sim ou nao, apontar o defeito, escolher o encaminhamento. Mas o produto que
// o analista assina e a Informacao Tecnica, e ate aqui ninguem escrevia uma.
// Aqui estao os 12 elementos minimos que o item 23.1 exige, com o que
// cada uma precisa conter e o erro que mais aparece em cada.
//
// O Anexo B apresenta um modelo resumido em 10 secoes. A interface explicita
// essa divergencia e adota os 12 elementos para nao apagar identificacao
// tecnica nem controle de qualidade. `armadilha` deriva dos criterios do POP
// (itens 23, 24.1 e 25).

export const ESTRUTURA_IT = [
  {
    n: 1, id: 'identificacao', titulo: 'Identificação',
    exige: 'Empreendimento, empreendedor, município, corpo hídrico, bacia, tipologia (MCH, MGH, CGH, PCH ou UHE), modalidade requerida e protocolo.',
    armadilha: 'Registrar a tipologia pelo nome do empreendimento em vez de confrontar potência e reservatório.',
    dica: (c) => `Neste caso a tipologia é ${c.type}. Escreva os campos que o caso permite preencher e marque como "a confirmar" o que ele não informa.`,
  },
  {
    n: 2, id: 'objeto', titulo: 'Objeto',
    exige: 'O que se analisa e o limite do escopo: qual requerimento, com vistas a avaliar a suficiência documental e técnica dos elementos apresentados.',
    armadilha: 'Deixar o escopo aberto e depois concluir sobre matéria que não foi analisada.',
    dica: (c) => `Delimite: o objeto aqui é "${c.title}". Diga também o que fica fora.`,
  },
  {
    n: 3, id: 'historico', titulo: 'Histórico',
    exige: 'Licenças anteriores, Consulta Prévia, autorizações, transferências, outorga, atos setoriais, condicionantes e movimentações relevantes.',
    armadilha: 'Pular o histórico e concluir sobre a fase atual sem saber o que já foi decidido.',
    dica: (c) => `Use os fatos do caso: ${(c.facts || []).slice(0, 2).join('; ')}.`,
  },
  {
    n: 4, id: 'base', titulo: 'Base legal',
    exige: 'Normas aplicáveis, regra de transição quando houver e Termos de Referência pertinentes, conforme a data do protocolo e a fase.',
    armadilha: 'Citar o POP como fundamento. Ele organiza o método e não cria exigência: o fundamento está na norma, no TR ou em condicionante anterior.',
    dica: () => 'Cite o dispositivo, não só o número da norma, e confirme a vigência na data do protocolo.',
  },
  {
    n: 5, id: 'metodologia', titulo: 'Metodologia',
    exige: 'Registrar que a análise considerou documento apresentado, fase, tipologia, data do protocolo, norma aplicável, suficiência ou inconsistência, consequência técnica e encaminhamento.',
    armadilha: 'Descrever a metodologia de forma genérica, sem dizer o que foi efetivamente confrontado.',
    dica: (c) => `Diga quais evidências você examinou: ${(c.evidence || []).slice(0, 2).join('; ')}.`,
  },
  {
    n: 6, id: 'identificacao_tecnica', titulo: 'Identificação técnica do empreendimento',
    exige: 'Identificação técnica do empreendimento: configuração pretendida ou instalada, potência, reservatório, arranjo, estruturas associadas e dados necessários para confrontar os documentos.',
    armadilha: 'Repetir apenas a identificação cadastral e não caracterizar tecnicamente o objeto que está sendo analisado.',
    dica: (c) => `Comece pela tipologia ${c.type} e use os fatos técnicos disponíveis. Marque como "a confirmar" o que o caso não informa.`,
  },
  {
    n: 7, id: 'documental', titulo: 'Análise documental',
    exige: 'Tabela com documento, status, gravidade, achado, consequência e encaminhamento. Apresentar não é sinônimo de suficiente.',
    armadilha: 'Marcar tudo como apresentado sem avaliar suficiência, e derivar a gravidade da falta formal em vez do efeito sobre a decisão.',
    dica: (c) => `Liste as ${(c.evidence || []).length} evidências do caso com status e gravidade, uma linha por documento.`,
  },
  {
    n: 8, id: 'tecnica', titulo: 'Análise técnica',
    exige: 'Memorial, estudo, cartografia, APP, flora, fauna, recursos hídricos, unidades de conservação, Planos de Manejo, bases geoespaciais, competência, ANEEL, IPHAN, condicionantes e sistemas associados, no que couber.',
    armadilha: 'Repetir o checklist em prosa. A análise técnica interpreta o conjunto e explica a consequência de cada lacuna.',
    dica: (c) => `O achado central deste caso é o que a prática apontou. Explique por que ele importa, não apenas que ele existe.`,
  },
  {
    n: 9, id: 'pendencias', titulo: 'Pendências classificadas',
    exige: 'Pendências classificadas por status e gravidade, sempre vinculadas ao achado, à base normativa, à consequência técnica e à providência necessária.',
    armadilha: 'Classificar a gravidade pela simples ausência formal do arquivo, sem explicar o efeito da lacuna sobre a decisão.',
    dica: () => 'Se a pendência impede decisão segura, deixe isso explícito e não a postergue como condicionante.',
  },
  {
    n: 10, id: 'conclusao', titulo: 'Conclusão',
    exige: 'Separar duas coisas: a adequação da modalidade requerida e a suficiência documental para deferimento.',
    armadilha: 'Misturar as duas. A modalidade pode estar adequada e a documentação ainda ser insuficiente.',
    dica: () => 'Escreva os dois juízos separadamente, mesmo quando um deles for favorável.',
  },
  {
    n: 11, id: 'encaminhamento', titulo: 'Condicionantes e encaminhamento',
    exige: 'Condicionantes proporcionais e verificáveis, diligência ou complementação, deferimento, manifestação não favorável ou envio à unidade competente, conforme a conclusão.',
    armadilha: 'Usar condicionante para adiar pendência impeditiva, responder automaticamente com não favorável ou fracionar exigências em pedidos sucessivos.',
    dica: (c) => `Compare o seu encaminhamento com o desfecho do caso depois de escrever.`,
  },
  {
    n: 12, id: 'controle_qualidade', titulo: 'Controle de qualidade e revisão final',
    exige: 'Conferir coerência entre objeto, base, achados, gravidade, conclusão, pendências, condicionantes e encaminhamento; revisar forma, rastreabilidade e limites de competência.',
    armadilha: 'Assinar texto cuja conclusão contradiz os achados ou que declara como validada matéria atribuída a outro órgão.',
    dica: () => 'Faça uma leitura inversa: do encaminhamento para cada evidência que o sustenta, e registre o que ainda exige revisão humana.',
  },
];

// Minimo de caracteres por secao para a secao contar como escrita. Nao mede
// qualidade: mede que a pessoa parou para escrever, em vez de deixar em branco.
export const MINIMO_SECAO = 60;

export function progressoIT(rascunho = {}) {
  const feitas = ESTRUTURA_IT.filter((s) => (rascunho[s.id] || '').trim().length >= MINIMO_SECAO);
  return { feitas: feitas.length, total: ESTRUTURA_IT.length, ids: feitas.map((s) => s.id) };
}

// Monta o texto corrido para leitura e exportacao.
export function montarIT(caso, rascunho = {}) {
  const linhas = [
    'INFORMAÇÃO TÉCNICA · EXERCÍCIO DIDÁTICO',
    'Documento de treinamento. Não é peça processual, não tem validade e não representa manifestação do IAT.',
    '',
    `Caso: ${caso.title}`,
    `Tipologia do exercício: ${caso.type}`,
    '',
  ];
  for (const s of ESTRUTURA_IT) {
    linhas.push(`${s.n}. ${s.titulo.toUpperCase()}`);
    linhas.push((rascunho[s.id] || '').trim() || '[não preenchido]');
    linhas.push('');
  }
  return linhas.join('\n');
}
