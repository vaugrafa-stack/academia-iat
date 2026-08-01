// Confere a escada de niveis do Laboratorio contra o que os casos realmente
// pedem, e nao contra o rotulo que o catalogo exibe.
//
// O que ele guarda. O catalogo mostra "Primeiro contato", "Aplicacao",
// "Avancado" e "Especialista" como nivel do GRUPO. Se os casos dentro do grupo
// nao pedirem nada diferente uns dos outros, esse rotulo promete uma progressao
// que nao existe, e a pessoa acha que evoluiu quando so mudou de assunto.
//
// Este portao nao exige que a plataforma ja tenha os cinco degraus preenchidos:
// exige que ela nao REGRIDA e que nao passe a prometer mais do que entrega. O
// piso vem gravado abaixo, medido em 01/08/2026, e sobe conforme o material
// avanca.
//
// Uso:  node tools/check-niveis.mjs
import { NIVEIS, distribuicao, nivelDoCaso } from '../src/niveisLab.js';

const { scenarios, GRUPOS_LAB } = await import('../src/scenarios.js');

// Piso medido em 01/08/2026. Todos os 26 casos tinham a mesma forma: 4 fatos,
// 4 evidencias, 5 perguntas de sim ou nao, 4 elementos de rubrica, 5 passos.
// Cinco tinham serie historica, e so por isso alcancavam o degrau `integrar`.
// Nenhum caso exercitava `aplicar`, `decidir` ou `fundamentar`.
const PISO = { reconhecer: 21, aplicar: 0, decidir: 0, integrar: 5, fundamentar: 0 };
// Quantos degraus a escada precisa ter ocupados para deixar de ser rotulo. Sobe
// junto com o material; nao baixe para o portao passar.
const DEGRAUS_MINIMOS = 2;

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

// 1. Nenhum degrau pode perder casos em relacao ao piso: isso seria regressao
//    de material didatico, que nenhum outro teste pegaria.
for (const nivel of NIVEIS) {
  const piso = PISO[nivel.id] ?? 0;
  const agora = atual[nivel.id] ?? 0;
  if (nivel.ordem >= 2 && agora < piso) {
    fail(`o degrau "${nivel.titulo}" caiu de ${piso} para ${agora} caso(s).`);
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
    + 'Para ocupar um degrau, marque a evidencia do caso: `distrator`, `ausente` ou '
    + '`conflito`, ou escreva uma pergunta aberta. Ver src/niveisLab.js.',
  );
}

if (erros) { console.log(`\n${erros} problema(s) na escada de niveis.`); process.exit(1); }
console.log('OK: a escada nao regrediu e nenhum rotulo promete mais do que o caso pede.');
