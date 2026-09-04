// Portao: sigla expandida em texto de tela precisa bater com o glossario do POP.
//
// Por que existe, com data. Em 03/09/2026, escrevendo o guia do empreendedor,
// eu expandi DLAM como "Declaracao de licenciamento ambiental municipal". O
// POP diz outra coisa, e a diferenca nao e de redacao: DLAM e "Declaracao de
// Dispensa de Licenciamento Ambiental Estadual", ato administrativo de
// dispensa, que o proprio POP distingue de licenca e de modalidade de
// licenciamento. LAC eu escrevi como "por cadastro" quando e "por Adesao e
// Compromisso".
//
// Nenhum portao pegou. `check-normas` confere numero de norma, `check-questoes`
// confere a fonte de cada questao, `check-provenance` confere hash e contagem,
// e nada olhava para o significado de uma sigla. E a sigla e exatamente o que a
// pessoa leva para dentro de um documento sem reconferir, porque parece
// vocabulario e nao afirmacao.
//
// A tabela "Siglas e abreviacoes" do POP tem 105 linhas e e a fonte. Este
// portao compara o que a tela afirma com o que ela diz.
//
// O que ele NAO faz: exigir que toda sigla seja expandida, nem proibir sinonimo
// em prosa corrida. Ele so age quando o codigo declara um par sigla e nome,
// que e a forma em que a afirmacao fica explicita.
//
// Uso:  node tools/check-siglas.mjs

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const RAIZ = process.cwd();

const pop = JSON.parse(await readFile(join(RAIZ, 'src/data/pop-content.json'), 'utf8'));
const tabela = (pop.tables || []).find((t) => /siglas e abrevia/i.test(t.title || ''));
if (!tabela) {
  console.log('FALHA: a tabela de siglas do POP nao foi encontrada.');
  process.exit(1);
}

const normalizar = (v) => String(v || '')
  .normalize('NFD')
  .replace(/\p{Mn}/gu, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const GLOSSARIO = new Map();
for (const linha of tabela.rows.slice(1)) {
  const celulas = linha.cells || [];
  const sigla = ((celulas[0] && celulas[0].text) || '').trim();
  const nome = ((celulas[1] && celulas[1].text) || '').trim();
  if (sigla && nome) GLOSSARIO.set(sigla, nome);
}

/**
 * Pares sigla e nome declarados em um modulo.
 * A forma reconhecida e a do guia: `sigla: 'X'` seguido de `nome: 'Y'`.
 */
export function paresDeclarados(fonte) {
  const pares = [];
  const re = /sigla:\s*'([^']+)'\s*,\s*\n\s*nome:\s*'([^']+)'/g;
  for (const m of fonte.matchAll(re)) pares.push([m[1].trim(), m[2].trim()]);
  return pares;
}

/** Verdadeiro quando o nome declarado corresponde ao do glossario. */
export function nomeConfere(declarado, oficial) {
  return normalizar(declarado) === normalizar(oficial);
}

const ARQUIVOS = ['src/empreendedorGuia.js'];

const falhas = [];
let conferidos = 0;
for (const caminho of ARQUIVOS) {
  const fonte = await readFile(join(RAIZ, caminho), 'utf8');
  for (const [sigla, nome] of paresDeclarados(fonte)) {
    const oficial = GLOSSARIO.get(sigla);
    // Rotulo que nao e sigla do glossario, como "LP, LI e LO", nao e afirmacao
    // sobre o significado de uma sigla e fica de fora de proposito.
    if (!oficial) continue;
    conferidos += 1;
    if (!nomeConfere(nome, oficial)) {
      falhas.push(`${caminho}: ${sigla} declarada como "${nome}", e o POP diz "${oficial}"`);
    }
  }
}

// Autoteste em toda execucao. Este portao nasce com a arvore ja corrigida, e
// sem armadilha ele passaria para sempre sem provar nada.
const ARMADILHAS = [
  [
    'expansao errada aceita',
    () => !nomeConfere('Declaracao de licenciamento ambiental municipal', GLOSSARIO.get('DLAM') || ''),
  ],
  [
    'expansao certa recusada',
    () => nomeConfere(GLOSSARIO.get('DLAM') || 'x', GLOSSARIO.get('DLAM') || 'y'),
  ],
  [
    'acento ou caixa tratados como divergencia',
    () => nomeConfere('LICENCA AMBIENTAL SIMPLIFICADA', 'Licença Ambiental Simplificada'),
  ],
  [
    'par sigla e nome nao reconhecido no formato do guia',
    () => paresDeclarados("    sigla: 'AA',\n    nome: 'Autorização Ambiental',").length === 1,
  ],
];
for (const [nome, prova] of ARMADILHAS) {
  if (!prova()) falhas.push(`autoteste: ${nome}`);
}

if (falhas.length) {
  for (const f of falhas) console.log(`FALHA ${f}`);
  console.log(`\n${falhas.length} divergencia(s) entre sigla e glossario do POP.`);
  process.exit(1);
}
console.log(
  `OK: ${conferidos} sigla(s) expandida(s) em tela conferem com as ${GLOSSARIO.size} do `
  + `glossario do POP; ${ARMADILHAS.length} armadilhas do autoteste conferidas.`,
);
