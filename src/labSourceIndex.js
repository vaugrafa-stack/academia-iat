// Índice leve de proveniência do laboratório.
//
// Formato interno: aula principal > fontes da Q1 | ... | fontes da Q5.
// A codificação compacta evita levar os trechos de labSources.js ou uma grande
// estrutura literal ao bundle de entrada. A API exportada continua tipada por
// arrays, adequada para o seletor aula -> caso.
const SOURCE_SPEC = Object.freeze({
  cp: '024>025|027|024,003|024|024',
  las: '032>022|019,078|016,019|032,078|028',
  lp: '034>033,034|034,064|040|033|096',
  li: '036>036,037|050|050|050|033',
  lo: '038>038,039|039,074|041|038,039,098|038',
  rlo: '043>007|043,139|043,098|043,096|074',
  pacuera: '069>067,069|069,070|067,072|069,070|068,069',
  'rlo-vencida': '045>007|074|045,074|045,074|007',
  'geo-insuficiente': '078>019,078|078|078|016,019,078|076,098',
  'cp-antiga': '024>005,024|005,006|006|018,024|024',
  escopo: '003>003|003|003,004|003|008',
  transicao: '006>005|005|006|006|005',
  triagem: '019>017|019|019|019,048|017',
  barragem: '054>051|054|054|051|053,056',
  estudos: '063>063|060|058,076|059,074|057',
  intervenientes: '082>082|082|083|082|004,082',
  condicionantes: '094>094,095|095|092|153|098',
  revisao: '108>108|103|100|099,106|107,108',
  integrador: '110>089,105|110,111,123|095,123|090|037',
  'uc-apa': '138>135,138|136,138|135,138|135|137',
  delegado: '151>132,151|132|132,145|152|147',
  'prog-semestral': '074>074|074|074|074|092',
  'prog-residuos': '074>074|074|074|074|074',
  'prog-compensacao': '074>074|074|074|074|074',
  'prog-app': '074>074|074,078|058,074|074|074',
  'condic-triagem': '094>094,095|094|095|095|095,158',
});

const lessonId = (number) => `pop-section-${number}`;

function decode(spec) {
  const [primary, encodedDecisions] = spec.split('>');
  const decisionSourceLessonIds = encodedDecisions
    .split('|')
    .map((decision) => Object.freeze(decision.split(',').map(lessonId)));
  return Object.freeze({
    primaryLessonId: lessonId(primary),
    sourceLessonIds: Object.freeze([...new Set(decisionSourceLessonIds.flat())]),
    decisionSourceLessonIds: Object.freeze(decisionSourceLessonIds),
  });
}

export const LAB_SOURCE_INDEX = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_SPEC).map(([scenarioId, spec]) => [scenarioId, decode(spec)])),
);

export function getLabSourceIndex(scenarioId) {
  return LAB_SOURCE_INDEX[scenarioId] || null;
}
