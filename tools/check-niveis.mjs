// Confere a escada de niveis do Laboratorio contra o que os casos realmente
// pedem, e nao contra o rotulo que o catalogo exibe.
//
// O que ele guarda. O catalogo mostra "Primeiro contato", "Aplicacao",
// "Avancado" e "Especialista" como nivel do GRUPO. Se os casos dentro do grupo
// nao pedirem nada diferente uns dos outros, esse rotulo promete uma progressao
// que nao existe, e a pessoa acha que evoluiu quando so mudou de assunto.
//
// Este portao exige os cinco degraus preenchidos e impede REGRESSAO POR CASO.
// Contar apenas quantos casos existem em cada categoria produz falso positivo:
// uma promocao legitima esvazia o degrau anterior e parece regressao. O piso
// abaixo registra a menor complexidade que cada caso ja demonstrou; subir pode,
// voltar a uma tarefa mais simples nao.
//
// Uso:  node tools/check-niveis.mjs
import { NIVEIS, distribuicao, nivelDoCaso } from '../src/niveisLab.js';

const { scenarios, GRUPOS_LAB } = await import('../src/scenarios.js');

// Piso aprovado apos a introducao de classificacao de evidencias, ausencias
// explicitas, series conflitantes e produtos escritos com rubrica.
const PISO_POR_CASO = {
  cp: 'reconhecer',
  las: 'aplicar',
  lp: 'reconhecer',
  li: 'reconhecer',
  lo: 'reconhecer',
  rlo: 'reconhecer',
  pacuera: 'reconhecer',
  'rlo-vencida': 'decidir',
  'geo-insuficiente': 'reconhecer',
  'cp-antiga': 'aplicar',
  escopo: 'aplicar',
  transicao: 'reconhecer',
  triagem: 'aplicar',
  barragem: 'decidir',
  estudos: 'reconhecer',
  intervenientes: 'aplicar',
  condicionantes: 'fundamentar',
  revisao: 'fundamentar',
  integrador: 'fundamentar',
  'uc-apa': 'reconhecer',
  delegado: 'fundamentar',
  'prog-semestral': 'integrar',
  'prog-residuos': 'integrar',
  'prog-compensacao': 'integrar',
  'prog-app': 'integrar',
  'condic-triagem': 'integrar',
};
const DEGRAUS_MINIMOS = NIVEIS.length;

let erros = 0;
const fail = (m) => { erros += 1; console.log('FALHA ' + m); };

const dist = distribuicao(scenarios);
const atual = Object.fromEntries(dist.map((n) => [n.id, n.casos]));

console.log('Escada medida pela estrutura do caso, nao pelo rotulo do grupo:\n');
for (const nivel of dist) {
  const barra = '#'.repeat(nivel.casos);
  console.log(
    `  ${String(nivel.ordem)}. ${nivel.titulo.padEnd(12)} ${String(nivel.casos).padStart(2)} `
    + `${barra.padEnd(26)} ${nivel.tarefa}`,
  );
}

// 1. Cada caso deve manter ou aumentar a complexidade ja aprovada. Assim uma
//    promocao de Aplicar para Fundamentar nao derruba artificialmente o gate.
const ordemPorId = new Map(NIVEIS.map((nivel) => [nivel.id, nivel.ordem]));
for (const caso of scenarios) {
  const pisoId = PISO_POR_CASO[caso.id];
  if (!pisoId) {
    fail(`caso novo sem piso de complexidade registrado: ${caso.id}.`);
    continue;
  }
  const nivelAtual = nivelDoCaso(caso);
  if (nivelAtual.ordem < ordemPorId.get(pisoId)) {
    fail(`o caso "${caso.id}" regrediu de ${pisoId} para ${nivelAtual.id}.`);
  }
}
for (const id of Object.keys(PISO_POR_CASO)) {
  if (!scenarios.some((caso) => caso.id === id)) {
    fail(`o piso ainda referencia caso removido: ${id}.`);
  }
}

// 2. A escada precisa de mais de um degrau ocupado, senao os rotulos de nivel
//    do catalogo prometem progressao inexistente.
const ocupados = NIVEIS.filter((n) => (atual[n.id] ?? 0) > 0).length;
if (ocupados < DEGRAUS_MINIMOS) {
  fail(`apenas ${ocupados} degrau(s) ocupado(s); o catalogo exibe niveis diferentes por grupo.`);
}

// 3. Grupo cujo rotulo sugere nivel alto precisa ter ao menos um caso acima do
//    degrau de partida. Sem isto, "Especialista" e so uma palavra na aba.
const ROTULO_EXIGENTE = /avan[çc]ado|especialista/i;
for (const grupo of GRUPOS_LAB) {
  if (!ROTULO_EXIGENTE.test(grupo.nivel || '')) continue;
  const casos = (grupo.ids || [])
    .map((id) => scenarios.find((c) => c.id === id))
    .filter(Boolean);
  const acima = casos.filter((c) => nivelDoCaso(c).ordem > 1);
  if (casos.length && !acima.length) {
    fail(
      `grupo "${grupo.titulo}" anuncia nivel "${grupo.nivel}", mas nenhum dos `
      + `${casos.length} casos pede mais do que reconhecer.`,
    );
  }
}

console.log(`\n${scenarios.length} casos - ${ocupados} de ${NIVEIS.length} degraus ocupados.`);

const vazios = NIVEIS.filter((n) => !(atual[n.id] ?? 0));
if (vazios.length) {
  console.log(
    'AVISO: sem nenhum caso em ' + vazios.map((n) => n.titulo.toLowerCase()).join(', ') + '. '
    + 'Para ocupar um degrau, use `evidenceTask` com distrator, `ausentes`, `serie`/'
    + '`conflito` ou `openTask` com rubrica. Ver src/niveisLab.js.',
  );
}

if (erros) { console.log(`\n${erros} problema(s) na escada de niveis.`); process.exit(1); }
console.log('OK: a escada nao regrediu e nenhum rotulo promete mais do que o caso pede.');
