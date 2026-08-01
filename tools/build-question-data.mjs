// Deriva src/data/question-bank.json de src/questions.js.
//
// Por que o banco sai do JavaScript. Os 35 kB de questoes entravam no pacote
// de todo mundo porque courseData.js importava questionsExtra.js na linha 1.
// Como arquivo buscado, o banco sai do orcamento de JS, ganha cache proprio do
// navegador e passa a ser versionado com hash pelo empacotador.
//
// Por que no ARRANQUE e nao sob demanda, ao contrario do corpo dos casos. A
// tela de aula usa uma questao comentada em cada topico (selectLessonQuestion),
// entao o banco e necessario na area mais visitada da plataforma. Buscar sob
// demanda so trocaria o custo de lugar. A aplicacao ja aguarda o conteudo do
// POP no arranque, que tem 853 kB; somar 35 kB nessa mesma espera nao muda a
// percepcao de quem abre.
//
// Uso:
//   node tools/build-question-data.mjs           grava
//   node tools/build-question-data.mjs --check   falha se estiver desatualizado
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const { questionBank } = await import('../src/questions.js');

const DESTINO = resolve(raiz, 'src/data/question-bank.json');
const ROTULO = 'src/data/question-bank.json';

const texto = `${JSON.stringify(questionBank)}\n`;
let atual = null;
try {
  atual = await readFile(DESTINO, 'utf8');
} catch {
  atual = null;
}

if (atual === texto) {
  console.log(`OK: ${ROTULO} atualizado (${questionBank.length} questoes).`);
  process.exit(0);
}

if (process.argv.includes('--check')) {
  console.log(`FALHA: ${ROTULO} esta desatualizado em relacao a src/questions.js.`);
  console.log('Rode `node tools/build-question-data.mjs` e commite o artefato.');
  process.exit(1);
}

await writeFile(DESTINO, texto, 'utf8');
console.log(
  `Gravado: ${ROTULO} · ${questionBank.length} questoes · `
  + `${(texto.length / 1024).toFixed(1)} kB fora do orcamento de JS.`,
);
