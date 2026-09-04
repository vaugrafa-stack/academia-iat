// Regressao da conferencia da minuta de Informacao Tecnica.
//
// A conferencia so vale alguma coisa se cada verificacao provar as duas
// direcoes. Regra que nunca dispara e regra que nunca se cala valem o mesmo,
// que e nada, e as duas passam despercebidas: a primeira parece rigor, a
// segunda parece limpeza.
//
// Quatro propriedades:
//
//   1. cada verificacao declarada em `conferenciaIT.js` tem, aqui, um texto que
//      ela DEVE acusar e um que ela NAO PODE acusar. Verificacao sem os dois
//      exemplos reprova, e acrescentar verificacao sem exemplo tambem;
//   2. a minuta modelo, que atende os doze elementos, nao recebe nenhum achado.
//      Senao a conferencia acusa quem escreveu certo, que e o defeito mais caro
//      possivel numa ferramenta de revisao;
//   3. os mesmos textos genericos que o portao da rubrica do laboratorio usa
//      produzem achado aqui. Senao a conferencia e decorativa;
//   4. nenhuma verificacao acusa uma minuta vazia. Quem ainda nao escreveu nao
//      pode receber uma lista de erros: `aplica` precisa exigir a secao escrita.
//
// Uso:  node tools/check-conferencia-it.mjs

import { conferirMinuta, IDS_VERIFICACAO } from '../src/conferenciaIT.js';

const CASO = {
  id: 'cp',
  type: 'CGH',
  title: 'CGH com sensibilidade locacional na Consulta Prévia',
  facts: [
    'Potência de 2,4 MW',
    'ADA a cerca de 600 m de unidade de conservação',
  ],
  evidence: [
    'Requerimento da Consulta Prévia',
    'Memorial preliminar',
    'Mapa da ADA e arranjo em KMZ',
  ],
};

// O minimo por secao e 60 caracteres. Os exemplos precisam passar disso para
// contar como secao escrita, senao o teste mediria o preenchimento e nao a
// verificacao.
const encorpar = (texto) => (texto.length >= 70 ? texto : `${texto} ${'.'.repeat(70 - texto.length)}`);

// Minuta que atende os doze elementos. Serve de base para os exemplos: cada
// caso troca so a secao em questao, para que o achado observado venha da troca
// e nao de outra lacuna.
const MODELO = {
  identificacao: encorpar('CGH do empreendedor, com município, corpo hídrico, modalidade requerida e protocolo registrados.'),
  objeto: encorpar('Analisa-se o requerimento quanto à suficiência documental, e fica fora o juízo de viabilidade.'),
  historico: encorpar('Não há licença anterior; a Consulta Prévia é a primeira movimentação registrada no processo.'),
  base: encorpar('Resolução CEMA aplicável, art. 5º, inciso II, e o Termo de Referência vigente na data do protocolo.'),
  metodologia: encorpar('Confrontei o Requerimento da Consulta Prévia, o Memorial preliminar e o Mapa da ADA e arranjo em KMZ.'),
  identificacao_tecnica: encorpar('Configuração pretendida de CGH, com potência e reservatório declarados e arranjo a confirmar.'),
  documental: encorpar('O Memorial preliminar foi apresentado, porém é insuficiente para caracterizar o arranjo integral.'),
  tecnica: encorpar('A lacuna do arranjo compromete a leitura da ADA e da sensibilidade do entorno nesta fase.'),
  pendencias: encorpar('Pendência impeditiva: o Memorial não caracteriza o arranjo, o que impede decisão segura agora.'),
  conclusao: encorpar('A modalidade requerida está adequada; a instrução documental é insuficiente para o deferimento.'),
  encaminhamento: encorpar('Encaminho em diligência, para complementação do Memorial, antes de qualquer juízo de mérito.'),
  controle_qualidade: encorpar('Fiz a leitura inversa do encaminhamento até cada evidência e registrei o que exige conferência.'),
};

const com = (mudancas) => ({ ...MODELO, ...mudancas });

// Para cada verificacao: um exemplo que deve acusar e um que nao pode.
const EXEMPLOS = {
  'tipologia-ausente': {
    acusa: com({ identificacao: encorpar('Trata-se do empreendimento do interessado, com protocolo e município registrados.') }),
    silencia: MODELO,
  },
  'tipologia-divergente': {
    acusa: com({ identificacao: encorpar('Trata-se de PCH do empreendedor, com município, modalidade requerida e protocolo.') }),
    silencia: MODELO,
  },
  'base-pop-como-fundamento': {
    acusa: com({ base: encorpar('A exigência decorre do POP de licenciamento, que orienta a análise desta fase processual.') }),
    // Citar o POP ao lado do dispositivo e legitimo, e nao pode ser acusado.
    silencia: com({ base: encorpar('Resolução CEMA, art. 5º, inciso II; o POP organiza o método aplicado a esta análise.') }),
  },
  'base-sem-dispositivo': {
    acusa: com({ base: encorpar('Aplica-se a Resolução CEMA e o Termo de Referência próprio da tipologia requerida aqui.') }),
    silencia: MODELO,
  },
  'documental-sem-consequencia': {
    acusa: com({ documental: encorpar('Todos os documentos foram apresentados e constam do processo, juntados pelo interessado.') }),
    silencia: MODELO,
  },
  'conclusao-um-juizo-so': {
    acusa: com({ conclusao: encorpar('Entendo que a instrução documental está insuficiente para a decisão pretendida agora.') }),
    silencia: MODELO,
  },
  'condicionante-para-pendencia-impeditiva': {
    acusa: com({ encaminhamento: encorpar('Encaminho com condicionante a ser cumprida na etapa seguinte do licenciamento ambiental.') }),
    silencia: MODELO,
  },
  'conclusao-contradiz-encaminhamento': {
    acusa: com({
      pendencias: encorpar('Registro pendência quanto ao Memorial preliminar, que ainda precisa de conferência técnica.'),
      encaminhamento: encorpar('Encaminho pelo deferimento do pedido, na forma requerida pelo interessado neste processo.'),
    }),
    silencia: MODELO,
  },
  'minuta-generica': {
    acusa: {
      identificacao: encorpar('CGH do empreendedor, com município, corpo hídrico, modalidade requerida e protocolo registrados.'),
      conclusao: encorpar('A modalidade está adequada e a instrução documental é suficiente para o deferimento pedido.'),
      controle_qualidade: encorpar('Revisei a forma, a rastreabilidade e os limites de competência antes de encerrar o texto.'),
    },
    silencia: MODELO,
  },
};

// Os mesmos textos do portao da rubrica do laboratorio.
const GENERICOS = [
  'Analisei o processo e considero que esta tudo certo, os documentos foram juntados e nao vejo impedimento para seguir com o pedido apresentado pelo interessado.',
  'O empreendimento ja opera ha varios anos sem qualquer problema relevante e por isso entendo que a solicitacao merece deferimento imediato.',
  'Conforme verificado, tudo foi conferido e esta em ordem, motivo pelo qual encaminho para as providencias cabiveis.',
];

const falhas = [];
const ids = (resultado) => resultado.achados.map((a) => a.id);

// 1. As duas direcoes de cada verificacao.
for (const id of IDS_VERIFICACAO) {
  const exemplo = EXEMPLOS[id];
  if (!exemplo) {
    falhas.push(`${id}: verificacao declarada sem exemplo neste portao`);
    continue;
  }
  const acusou = ids(conferirMinuta(CASO, exemplo.acusa));
  if (!acusou.includes(id)) {
    falhas.push(`${id}: o exemplo que deveria acusar nao acusou (achados: ${acusou.join(', ') || 'nenhum'})`);
  }
  const silenciou = ids(conferirMinuta(CASO, exemplo.silencia));
  if (silenciou.includes(id)) {
    falhas.push(`${id}: acusou o exemplo que nao pode acusar`);
  }
}
for (const id of Object.keys(EXEMPLOS)) {
  if (!IDS_VERIFICACAO.includes(id)) falhas.push(`${id}: exemplo sem verificacao correspondente`);
}

// 2. O modelo nao recebe achado.
const noModelo = conferirMinuta(CASO, MODELO);
if (noModelo.achados.length) {
  falhas.push(`a minuta modelo recebeu achado: ${ids(noModelo).join(', ')}`);
}
if (noModelo.escritas !== noModelo.total) {
  falhas.push(`a minuta modelo tem ${noModelo.escritas} de ${noModelo.total} secoes escritas`);
}

// 3. Texto generico produz achado.
for (const [indice, generico] of GENERICOS.entries()) {
  const minuta = {};
  for (const secao of ['identificacao', 'base', 'documental', 'metodologia', 'conclusao']) {
    minuta[secao] = encorpar(generico);
  }
  const resultado = conferirMinuta(CASO, minuta);
  if (!resultado.achados.length) {
    falhas.push(`texto generico ${indice + 1} nao produziu nenhum achado`);
  }
}

// 4. Minuta vazia nao recebe achado.
const vazia = conferirMinuta(CASO, {});
if (vazia.achados.length) {
  falhas.push(`minuta vazia recebeu achado: ${ids(vazia).join(', ')}`);
}
if (vazia.conferiveis !== 0) {
  falhas.push(`minuta vazia declarou ${vazia.conferiveis} verificacoes aplicaveis`);
}

// Autoteste do proprio portao. Sem ele, um erro que fizesse `conferirMinuta`
// devolver sempre lista vazia passaria em 1, 2 e 4 e so seria pego em 3.
const ARMADILHAS = [
  ['conferencia sempre silenciosa', () => conferirMinuta(CASO, com({
    base: encorpar('A exigência decorre do POP de licenciamento, que orienta a análise desta fase processual.'),
  })).achados.length > 0],
  ['conferencia sempre ruidosa', () => conferirMinuta(CASO, MODELO).achados.length === 0],
  ['achado sem secao identificada', () => conferirMinuta(CASO, EXEMPLOS['tipologia-ausente'].acusa)
    .achados.every((a) => Number.isInteger(a.secaoN) && a.secaoTitulo.length > 0)],
  ['achado sem criterio citado', () => conferirMinuta(CASO, EXEMPLOS['base-sem-dispositivo'].acusa)
    .achados.every((a) => typeof a.criterio === 'string' && a.criterio.length > 0)],
  // Radical compartilhado: "indeferimento" contem "deferimento". Concluir pela
  // insuficiencia e encaminhar pelo indeferimento e coerente, e a conferencia
  // acusava isso antes da lista de exclusao.
  ['indeferimento tratado como deferimento', () => !ids(conferirMinuta(CASO, com({
    encaminhamento: encorpar('Encaminho pelo indeferimento do pedido, na forma da conclusão registrada.'),
  }))).includes('conclusao-contradiz-encaminhamento')],
];
for (const [nome, prova] of ARMADILHAS) {
  if (!prova()) falhas.push(`autoteste: ${nome}`);
}

if (falhas.length) {
  for (const falha of falhas) console.log(`FALHA ${falha}`);
  console.log(`\n${falhas.length} problema(s) na conferencia da minuta.`);
  process.exit(1);
}
console.log(
  `OK: ${IDS_VERIFICACAO.length} verificacoes com as duas direcoes provadas, `
  + `minuta modelo sem achado, ${GENERICOS.length} textos genericos acusados, `
  + `minuta vazia silenciosa e ${ARMADILHAS.length} armadilhas do autoteste conferidas.`,
);
