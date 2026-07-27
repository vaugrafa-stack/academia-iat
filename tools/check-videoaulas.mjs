// Regressao das videoaulas por secao.
//
// O que precisa valer:
//   1. o manifesto so lista secoes que existem;
//   2. toda secao listada tem de fato os tres arquivos (mp4, vtt e poster);
//   3. as secoes SEM video proprio sao poucas e conhecidas: as organizacionais,
//      que nao tem conteudo para roteiro e caem no video do modulo. Se esse
//      numero crescer, alguma coisa quebrou na geracao e o aluno volta a ver o
//      mesmo video em varias subaulas, que era exatamente o defeito corrigido.
//
// Uso:  node tools/check-videoaulas.mjs
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pop = JSON.parse(await readFile(resolve(root, 'src/data/pop-content.json'), 'utf8'));
const { tracks } = await import('../src/courseData.js');
const { derivarAulas } = await import('../src/lessons.js');
const { lessons } = derivarAulas(pop, tracks);

const TOLERANCIA_SEM_VIDEO = 4;

let manifesto = {};
try {
  manifesto = JSON.parse(await readFile(resolve(root, 'src/data/aula-media.json'), 'utf8'));
} catch {
  console.log('FALHA: src/data/aula-media.json ausente. Rode: python tools/build_lesson_videos.py');
  process.exit(1);
}

const idsValidos = new Set(lessons.map((l) => l.id));
let erros = 0;
const fail = (m) => { erros++; console.log('FALHA ' + m); };

const existe = async (p) => { try { const s = await stat(p); return s.size > 0; } catch { return false; } };

for (const id of Object.keys(manifesto)) {
  if (!idsValidos.has(id)) { fail(`${id}: no manifesto mas nao e uma aula`); continue; }
  for (const ext of ['mp4', 'vtt', 'jpg']) {
    if (!(await existe(resolve(root, `public/media/aula/${id}.${ext}`)))) fail(`${id}: falta o arquivo .${ext}`);
  }
}

const sem = lessons.filter((l) => !manifesto[l.id]);
if (sem.length > TOLERANCIA_SEM_VIDEO) {
  fail(`${sem.length} aulas sem video proprio (tolerancia ${TOLERANCIA_SEM_VIDEO}): ${sem.slice(0, 8).map((l) => (l.number || '-') + ' ' + l.title.slice(0, 30)).join(' | ')}`);
} else if (sem.length) {
  console.log(`aulas sem video proprio (caem no video do modulo): ${sem.map((l) => (l.number || '-') + ' ' + l.title.slice(0, 34)).join(' | ')}`);
}

console.log(`\n${Object.keys(manifesto).length} videoaulas de secao para ${lessons.length} aulas.`);
if (erros) { console.log(`${erros} problema(s).`); process.exit(1); }
console.log('OK: manifesto e arquivos conferem.');
