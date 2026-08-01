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

// Legibilidade da legenda, travada em 31/07/2026. A medicao anterior a essa
// data encontrou 88% dos blocos com uma linha acima de 42 caracteres (a maior
// com 220) e 64% acima de 6 segundos na tela, porque o gerador escrevia a fala
// inteira numa linha so. Estes tetos existem para isso nao voltar.
const MAX_LINHA_CHARS = 42;
const MAX_LINHAS_CUE = 2;
const MAX_CUE_SEG = 6.0;
// A cue de titulo e a excecao declarada: o portao compara o texto dela com o
// titulo da aula, entao ela nao pode ser dividida em varias cues. Titulo longo
// do POP fica em ate 3 linhas e pode passar do teto de tempo.
const MAX_LINHAS_TITULO = 3;
// Tolerancia de linha: sobram poucos casos em que nenhuma fronteira de palavra
// divide o bloco em duas linhas dentro do teto. Hoje sao 6 linhas em cerca de
// 3.700, todas entre 43 e 46 caracteres. Se este numero crescer, a segmentacao
// regrediu.
const TOLERANCIA_LINHA_LONGA = 8;
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
  // Uma cue de titulo alem das cenas, e agora POSSIVELMENTE mais de uma cue
  // por cena. A regra era igualdade estrita (cues === cenas + 1), o que
  // impedia legenda legivel: uma fala de 11 segundos com 170 caracteres nao
  // cabe num bloco so. Desde 31/07/2026 a fala e reparticionada em blocos de
  // ate 2 linhas de 42 caracteres e no maximo 6 segundos, entao a relacao
  // vira "pelo menos uma por cena, mais o titulo".
  if (
    meta.generatorVersion >= 2
    && (!Number.isInteger(meta.cues) || meta.cues < meta.cenas + 1)
  ) {
    fail(`${id}: gerador v2 deve declarar o titulo e ao menos uma cue por cena`);
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
const linhasLongas = [];

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
    const corpo = linhas.slice(indiceTempo + 1);
    const texto = corpo.join(' ').trim();
    cues.push({ inicio, fim, texto, corpo });
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

    // Legibilidade: comprimento de linha, numero de linhas e tempo na tela.
    // A cue de titulo (indice 0) tem regra propria, declarada nas constantes.
    const ehTitulo = cueIndex === 0;
    const maxLinhas = ehTitulo ? MAX_LINHAS_TITULO : MAX_LINHAS_CUE;
    if ((cue.corpo?.length || 1) > maxLinhas) {
      fail(`${id}: cue com ${cue.corpo.length} linhas (maximo ${maxLinhas})`);
    }
    for (const linha of cue.corpo || []) {
      if (linha.length > MAX_LINHA_CHARS) linhasLongas.push({ id, chars: linha.length });
    }
    if (!ehTitulo && cue.fim - cue.inicio > MAX_CUE_SEG + 0.01) {
      fail(`${id}: cue de ${(cue.fim - cue.inicio).toFixed(1)}s na tela (maximo ${MAX_CUE_SEG}s)`);
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

if (linhasLongas.length > TOLERANCIA_LINHA_LONGA) {
  const maior = linhasLongas.reduce((a, b) => (b.chars > a.chars ? b : a));
  fail(
    `${linhasLongas.length} linhas de legenda acima de ${MAX_LINHA_CHARS} caracteres `
    + `(tolerancia ${TOLERANCIA_LINHA_LONGA}); a maior tem ${maior.chars} em ${maior.id}`,
  );
} else if (linhasLongas.length) {
  console.log(
    `${linhasLongas.length} linha(s) entre ${MAX_LINHA_CHARS + 1} e `
    + `${linhasLongas.reduce((a, b) => (b.chars > a.chars ? b : a)).chars} caracteres: `
    + 'nenhuma fronteira de palavra divide o bloco dentro do teto.',
  );
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
