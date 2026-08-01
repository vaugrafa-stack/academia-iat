// Deriva de src/scenarios.js os dois artefatos que a aplicacao consome:
//
//   src/data/lab-index.json   indice LEVE, entra no pacote e carrega sempre
//   src/data/lab-corpos.json  corpo dos casos, buscado quando o caso abre
//
// Por que separar. O orcamento de JS estava em 99,6% do teto, e dividir chunk
// nao resolve isso: chunk adiado continua contando no total. O que reduz o
// total e tirar dado de dentro do JavaScript. Servido como arquivo buscado, o
// corpo dos casos sai do orcamento de JS, ganha cache proprio do navegador e
// deixa de ser baixado por quem nunca abre o Laboratorio.
//
// O que fica no indice e exatamente o que a tela de AULA precisa, medido no
// codigo e nao chutado:
//   id, track, label, title, type, nivel  roteamento, contagem e rotulo
//   facts                                 ExemploNoProcesso mostra os 3 primeiros
//   questions                             so o ENUNCIADO de cada uma, sem as
//                                         alternativas nem o gabarito
//
// Os nomes dos campos sao os MESMOS do caso completo, e `questions` mantem o
// formato de tupla com o enunciado na posicao 0. Assim `caso.questions[i][0]`,
// `caso.questions.length` e `caso.facts.slice(0, 3)` continuam funcionando sem
// nenhuma alteracao nas telas. Renomear aqui economizaria bytes e custaria uma
// rodada de bugs de runtime que o compilador nao pega.
//
// Tudo o mais (evidence, docs, serie, steps, outcome, elementos, modelo e as
// alternativas das questoes) so aparece no Laboratorio e no Redator, que sao
// carregados sob demanda.
//
// Uso:
//   node tools/build-lab-data.mjs           grava
//   node tools/build-lab-data.mjs --check   falha se estiver desatualizado
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const { scenarios, GRUPOS_LAB } = await import('../src/scenarios.js');

const INDICE = resolve(raiz, 'src/data/lab-index.json');
const CORPOS = resolve(raiz, 'src/data/lab-corpos.json');

// Campos do indice. Quem precisar de mais tem que buscar o corpo, de proposito:
// e o que impede o indice de voltar a engordar sem ninguem perceber.
const leve = (c) => ({
  id: c.id,
  track: c.track,
  label: c.label,
  title: c.title,
  type: c.type,
  ...(c.nivel ? { nivel: c.nivel } : {}),
  facts: (c.facts || []).slice(0, 3),
  questions: (c.questions || []).map((q) => [q[0]]),
});

const indice = {
  grupos: GRUPOS_LAB,
  casos: scenarios.map(leve),
};

// O corpo guarda o caso inteiro, incluindo o que o indice ja tem: assim a tela
// que busca o corpo nao precisa costurar dois objetos campo a campo.
const corpos = Object.fromEntries(scenarios.map((c) => [c.id, c]));

const conferir = process.argv.includes('--check');
let divergiu = false;

for (const [caminho, dado, rotulo] of [
  [INDICE, indice, 'src/data/lab-index.json'],
  [CORPOS, corpos, 'src/data/lab-corpos.json'],
]) {
  const texto = `${JSON.stringify(dado)}\n`;
  let atual = null;
  try {
    atual = await readFile(caminho, 'utf8');
  } catch {
    atual = null;
  }
  if (atual === texto) {
    console.log(`OK: ${rotulo} atualizado.`);
    continue;
  }
  if (conferir) {
    console.log(`FALHA: ${rotulo} esta desatualizado em relacao a src/scenarios.js.`);
    divergiu = true;
    continue;
  }
  await writeFile(caminho, texto, 'utf8');
  console.log(`Gravado: ${rotulo} (${(texto.length / 1024).toFixed(1)} kB).`);
}

if (divergiu) {
  console.log('\nRode `node tools/build-lab-data.mjs` e commite os artefatos.');
  process.exit(1);
}

const kbIndice = JSON.stringify(indice).length / 1024;
const kbCorpos = JSON.stringify(corpos).length / 1024;
console.log(
  `\n${scenarios.length} casos · indice ${kbIndice.toFixed(1)} kB no pacote · `
  + `corpos ${kbCorpos.toFixed(1)} kB sob demanda `
  + `(${(100 * kbCorpos / (kbIndice + kbCorpos)).toFixed(0)}% fora do orcamento de JS).`,
);
