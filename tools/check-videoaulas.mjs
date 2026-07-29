// Regressao das videoaulas por secao.
//
// O que precisa valer:
//   1. o manifesto so lista secoes que existem;
//   2. toda secao listada tem de fato os tres arquivos (mp4, vtt e poster);
//   3. nenhuma legenda comeca no meio de uma frase;
//   4. as secoes SEM video proprio sao poucas e conhecidas: as organizacionais,
//      que nao tem conteudo para roteiro e caem no video do modulo. Se esse
//      numero crescer, alguma coisa quebrou na geracao e o aluno volta a ver o
//      mesmo video em varias subaulas, que era exatamente o defeito corrigido.
//
// Uso:  node tools/check-videoaulas.mjs
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pop = JSON.parse(await readFile(resolve(root, 'src/data/pop-public-content.json'), 'utf8'));
const { tracks } = await import('../src/courseData.js');
const { derivarAulas } = await import('../src/lessons.js');
const { lessons } = derivarAulas(pop, tracks);

const TOLERANCIA_SEM_VIDEO = 4;
const MAX_CPS = 17;
const MAX_CUE_CHARS = 220;
const TAMANHO_MINIMO = { mp4: 100_000, vtt: 40, jpg: 20_000 };

let manifesto = {};
let manifestoPublico = {};
try {
  manifesto = JSON.parse(await readFile(resolve(root, 'src/data/aula-media.json'), 'utf8'));
  manifestoPublico = JSON.parse(await readFile(resolve(root, 'public/media/aula/manifest.json'), 'utf8'));
} catch {
  console.log('FALHA: um dos manifestos de videoaula esta ausente ou invalido. Rode: python tools/build_lesson_videos.py');
  process.exit(1);
}

const idsValidos = new Set(lessons.map((l) => l.id));
const aulasPorId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
let erros = 0;
const fail = (m) => { erros++; console.log('FALHA ' + m); };

if (JSON.stringify(manifesto) !== JSON.stringify(manifestoPublico)) {
  fail('src/data/aula-media.json diverge de public/media/aula/manifest.json');
}

const tamanho = async (p) => { try { return (await stat(p)).size; } catch { return 0; } };

for (const [id, meta] of Object.entries(manifesto)) {
  if (!idsValidos.has(id)) { fail(`${id}: no manifesto mas nao e uma aula`); continue; }
  if (!meta || typeof meta !== 'object') {
    fail(`${id}: metadados invalidos no manifesto`);
    continue;
  }
  if (!Number.isFinite(meta.dur) || meta.dur <= 0) fail(`${id}: duracao invalida no manifesto`);
  if (!Number.isInteger(meta.cenas) || meta.cenas < 1) fail(`${id}: quantidade de cenas invalida`);
  if (
    meta.generatorVersion >= 2
    && (!Number.isInteger(meta.cues) || meta.cues !== meta.cenas + 1)
  ) {
    fail(`${id}: gerador v2 deve declarar uma cue de titulo alem das cenas visuais`);
  }
  if (meta.generatorVersion != null && meta.generatorVersion < 2) {
    fail(`${id}: versao de gerador declarada, mas anterior ao contrato atual`);
  }
  if (meta.generatorVersion >= 2 && (!Number.isFinite(meta.maxCps) || meta.maxCps > MAX_CPS + 0.01)) {
    fail(`${id}: manifesto declara ${meta.maxCps ?? 'nenhum'} cps (maximo ${MAX_CPS})`);
  }
  for (const ext of ['mp4', 'vtt', 'jpg']) {
    const bytes = await tamanho(resolve(root, `public/media/aula/${id}.${ext}`));
    if (bytes < TAMANHO_MINIMO[ext]) {
      fail(`${id}: arquivo .${ext} ausente, vazio ou pequeno demais (${bytes} bytes)`);
    }
  }
}

// Fala cortada no meio. A quebra de frases chegou a dividir "O art. 15 da
// Instrucao Normativa" em duas, e a segunda comecava em "15 da Instrucao": quem
// assiste ouve uma frase que comeca do nada. Legenda iniciando por minuscula,
// ou por numero solto seguido de palavra, denuncia esse corte.
const MEIO = new RegExp('^(?:[a-zà-ú]|\\d+\\s+[a-zà-ú])');
const SEP_BLOCO = new RegExp('\\r?\\n\\r?\\n');
const SEP_LINHA = new RegExp('\\r?\\n');
const TEMPO = /^(?:(\d{2}):)?(\d{2}):(\d{2}\.\d{3})$/;
const segundos = (valor) => {
  const match = valor.trim().match(TEMPO);
  if (!match) return NaN;
  return Number(match[1] || 0) * 3600 + Number(match[2]) * 60 + Number(match[3]);
};

let cuesLegadosAcimaDoTeto = 0;
let maiorCpsLegado = { cps: 0, id: '' };

for (const [id, meta] of Object.entries(manifesto)) {
  let vtt = '';
  try {
    vtt = await readFile(resolve(root, `public/media/aula/${id}.vtt`), 'utf8');
  } catch {
    continue;
  }
  if (!vtt.startsWith('WEBVTT')) fail(`${id}: legenda sem cabecalho WEBVTT`);
  const cues = [];
  for (const bloco of vtt.split(SEP_BLOCO).slice(1)) {
    const linhas = bloco.split(SEP_LINHA).map((linha) => linha.trim()).filter(Boolean);
    const indiceTempo = linhas.findIndex((linha) => linha.includes('-->'));
    if (indiceTempo < 0) continue;
    const [inicioTexto, fimComOpcoes] = linhas[indiceTempo].split('-->').map((item) => item.trim());
    const fimTexto = fimComOpcoes?.split(/\s+/)[0];
    const inicio = segundos(inicioTexto);
    const fim = segundos(fimTexto || '');
    const texto = linhas.slice(indiceTempo + 1).join(' ').trim();
    cues.push({ inicio, fim, texto });
  }
  const cuesEsperadas = meta.cues ?? meta.cenas;
  if (cues.length !== cuesEsperadas) {
    fail(`${id}: manifesto declara ${cuesEsperadas} cues, mas a VTT contem ${cues.length}`);
  }
  if (meta.generatorVersion >= 2 && cues.length) {
    const lesson = aulasPorId.get(id);
    const tituloEsperado = `${lesson?.number ? `${lesson.number} ` : ''}${lesson?.title || ''}`.trim();
    if (cues[0].texto !== tituloEsperado || cues[0].inicio > 0.75) {
      fail(`${id}: titulo narrado sem cue inicial equivalente`);
    }
  }
  let fimAnterior = 0;
  for (const [cueIndex, cue] of cues.entries()) {
    const c = cue.texto;
    if (!Number.isFinite(cue.inicio) || !Number.isFinite(cue.fim) || cue.fim <= cue.inicio) {
      fail(`${id}: intervalo de legenda invalido`);
      continue;
    }
    if (cue.inicio + 0.001 < fimAnterior) fail(`${id}: legendas sobrepostas ou fora de ordem`);
    if (cue.fim > meta.dur + 0.25) fail(`${id}: legenda termina depois da duracao declarada`);
    if (!c) fail(`${id}: cue sem texto`);
    if (meta.generatorVersion >= 2 && c.length > MAX_CUE_CHARS) {
      fail(`${id}: cue excede ${MAX_CUE_CHARS} caracteres (${c.length})`);
    }
    const anterior = cues[cueIndex - 1]?.texto || '';
    const continuacaoDeliberada = cueIndex > 1 && !/[.!?]$/.test(anterior);
    if (MEIO.test(c) && !continuacaoDeliberada) {
      fail(`${id}: legenda comeca no meio da frase -> "${c.slice(0, 60)}"`);
    }

    const cps = c.replace(/\s+/g, ' ').length / (cue.fim - cue.inicio);
    if (meta.generatorVersion >= 2) {
      if (cps > MAX_CPS + 0.01) fail(`${id}: legenda com ${cps.toFixed(1)} cps (maximo ${MAX_CPS})`);
      if (/…|\.\.\.$/.test(c)) fail(`${id}: nova legenda sinaliza frase truncada -> "${c.slice(-60)}"`);
    } else if (cps > MAX_CPS) {
      cuesLegadosAcimaDoTeto++;
      if (cps > maiorCpsLegado.cps) maiorCpsLegado = { cps, id };
    }
    fimAnterior = cue.fim;
  }
}

const sem = lessons.filter((l) => !manifesto[l.id]);
if (sem.length > TOLERANCIA_SEM_VIDEO) {
  fail(`${sem.length} aulas sem video proprio (tolerancia ${TOLERANCIA_SEM_VIDEO}): ${sem.slice(0, 8).map((l) => (l.number || '-') + ' ' + l.title.slice(0, 30)).join(' | ')}`);
} else if (sem.length) {
  console.log(`aulas sem video proprio (caem no video do modulo): ${sem.map((l) => (l.number || '-') + ' ' + l.title.slice(0, 34)).join(' | ')}`);
}

console.log(`\n${Object.keys(manifesto).length} videoaulas de secao para ${lessons.length} aulas.`);
if (cuesLegadosAcimaDoTeto) {
  console.log(
    `AVISO: acervo legado tem ${cuesLegadosAcimaDoTeto} cues acima de ${MAX_CPS} cps `
    + `(maximo ${maiorCpsLegado.cps.toFixed(1)} em ${maiorCpsLegado.id}). `
    + 'O gerador v2 aplica o teto nas proximas regeneracoes.',
  );
}
if (erros) { console.log(`${erros} problema(s).`); process.exit(1); }
console.log('OK: manifestos, arquivos, tempos e legendas conferem.');
