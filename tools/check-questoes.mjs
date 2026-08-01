// Regressao do banco de questoes.
//
// Tres propriedades:
//   0. toda questao cita o POP;
//   1. nenhum modulo abaixo de oito questoes. A prontidao exige 80%, e com
//      quatro questoes isso vira 4/4, margem de erro zero;
//   2. toda questao com fonte aponta para uma secao que existe;
//   3. o trecho citado aparece literalmente no texto daquela secao. Citacao que
//      nao bate e pior que citacao ausente: ela da aparencia de lastro.
//
// Uso:  node tools/check-questoes.mjs
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pop = JSON.parse(await readFile(resolve(root, 'src/data/pop-content.json'), 'utf8'));
const { questionBank } = await import('../src/questions.js');
const { tracks } = await import('../src/courseData.js');

const MINIMO = 8;
const blocos = new Map(pop.blocks.map((b) => [b.id, b]));
const tabelas = new Map(pop.tables.map((t) => [t.id, t]));
// O texto da secao inclui os quadros que ela contem: boa parte dos criterios do
// POP vive em Quadro, e citacao de quadro tem o mesmo lastro que a de paragrafo.
const textoDaSecao = new Map(
  pop.sections.map((s) => {
    const partes = [];
    for (const id of s.blockIds || []) {
      const b = blocos.get(id);
      if (!b) continue;
      if (b.paragraph?.text) partes.push(b.paragraph.text);
      const tb = b.tableId ? tabelas.get(b.tableId) : null;
      if (tb) for (const r of tb.rows) for (const c of r.cells) if (c.text) partes.push(c.text);
    }
    return [s.id, partes.join(' ').replace(/\s+/g, ' ')];
  }),
);

// Compara ignorando diferencas de espaco e de aspas curvas, que o Word insere.
const canon = (t) => (t || '').replace(/[“”„]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();

let erros = 0;
const fail = (msg) => { erros++; console.log('FALHA ' + msg); };

const porTrilha = {};
for (const q of questionBank) porTrilha[q.track] = (porTrilha[q.track] || 0) + 1;
for (const t of tracks) {
  const n = porTrilha[t.id] || 0;
  if (n < MINIMO) fail(`${t.code}: ${n} questoes, minimo ${MINIMO} (com ${n}, 80% exige ${Math.ceil(n * 0.8)}/${n})`);
}

const ids = new Set();
for (const q of questionBank) {
  if (ids.has(q.id)) fail(`id duplicado: ${q.id}`);
  ids.add(q.id);
  if (!tracks.some((t) => t.id === q.track)) fail(`${q.id}: trilha inexistente "${q.track}"`);
  if (!Array.isArray(q.options) || q.options.length < 2) fail(`${q.id}: menos de duas alternativas`);
  if (q.answer == null || q.answer < 0 || q.answer >= q.options.length) fail(`${q.id}: indice de resposta fora da faixa`);
  if (new Set(q.options).size !== q.options.length) fail(`${q.id}: alternativas repetidas`);
  if (!q.explanation) fail(`${q.id}: sem explicacao`);
  if (/—/.test(q.question + q.options.join(' ') + q.explanation)) fail(`${q.id}: travessao em texto autoral`);
  // Fonte deixou de ser opcional: 24 questoes viviam sem citacao e a tela nova
  // do feedback mostraria um vazio no lugar do fundamento.
  if (!q.source) { fail(`${q.id}: sem fonte no POP (sec + quote)`); continue; }
  const txt = textoDaSecao.get(q.source.sec);
  if (txt === undefined) { fail(`${q.id}: source.sec inexistente "${q.source.sec}"`); continue; }
  if (!canon(txt).includes(canon(q.source.quote))) {
    fail(`${q.id}: o trecho citado nao aparece em ${q.source.sec}\n         trecho: "${q.source.quote}"`);
  }
}

const comFonte = questionBank.filter((q) => q.source).length;
console.log(`\n${questionBank.length} questoes | ${comFonte} com fonte verificada | minimo por modulo: ${Math.min(...tracks.map((t) => porTrilha[t.id] || 0))}`);
if (erros) { console.log(`${erros} problema(s) no banco de questoes.`); process.exit(1); }
console.log('OK: cobertura, estrutura e citacoes conferem.');
