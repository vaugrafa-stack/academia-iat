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
import { derivarAulas } from '../src/lessons.js';

const root = resolve(import.meta.dirname, '..');
const pop = JSON.parse(await readFile(resolve(root, 'src/data/pop-content.json'), 'utf8'));
const { questionBank } = await import('../src/questions.js');
const { tracks } = await import('../src/courseData.js');
const { lessons } = derivarAulas(pop, tracks);

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

// Uma pergunta apenas relacionada ao modulo nao comprova o objetivo da aula.
// A tela distingue esse fallback de uma checagem objetiva e, por isso, cada
// secao didatica precisa ter ao menos uma questao do mesmo modulo cuja fonte
// seja exatamente o id da secao. Quando uma nova aula entrar no POP sem sua
// avaliacao, este portao interrompe a publicacao.
const coberturaExclusiva = new Set(
  questionBank
    .filter((q) => q?.source?.sec)
    .map((q) => `${q.track}:${q.source.sec}`),
);
for (const lesson of lessons) {
  if (!coberturaExclusiva.has(`${lesson.trackId}:${lesson.id}`)) {
    fail(`${lesson.id}: aula sem questao exclusiva alinhada ao modulo ${lesson.trackId}`);
  }
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

// ---------------------------------------------------------------- pista de
// comprimento
//
// Alternativa correta sistematicamente mais longa e a pista classica de prova
// de multipla escolha: quem nao sabe o conteudo acerta escolhendo a maior.
//
// Medido em 01/08/2026: um chutador que escolhe SEMPRE a alternativa mais
// longa acertava 85 das 136 questoes, 63%, contra 33% do acaso com tres
// alternativas. A pista quase dobrava o acerto sem nenhum conhecimento, o que
// significa que parte do resultado da autoavaliacao media leitura de formato,
// e nao dominio do POP.
//
// Em 04/08/2026 a meta foi ATINGIDA: 41 de 136, ou 30,1%, contra 32,8% do
// acaso. Escolher a alternativa mais longa deixou de dar vantagem sobre
// chutar. O teto fica em 45, um pouco acima do medido, para uma questao nova
// legitimamente longa nao reprovar o build sozinha; acima disso o padrao
// voltou e precisa de correcao.
// A pista so existe quando a correta e VISIVELMENTE a maior. Empate, ou
// vantagem de poucos caracteres, nao orienta ninguem: a primeira versao deste
// portao contava "47, 47, 44" como pista porque pegava o primeiro maximo, e
// media formato do array em vez de percepcao de quem responde. A margem de 10%
// e o que separa "a maior" de "uma das maiores".
const MARGEM = 1.10;
const TETO_CHUTADOR = 45;

// Palavra portuguesa comum escrita sem acento. Entrou porque eu mesmo escrevi
// dezenove alternativas sem acentuacao ao reescrever distratores em 04/08/2026,
// e nada acusaria: o texto compila, o portao de citacao passa, e o defeito so
// apareceria na tela para quem estuda. A lista e curta e literal de proposito;
// nao tenta ser um corretor ortografico, so pega o vocabulario recorrente
// deste dominio.
const SEM_ACENTO = [
  'licenca', 'licencas', 'agua', 'aguas', 'analise', 'analises', 'tecnica',
  'tecnico', 'tecnicas', 'tecnicos', 'potencia', 'supressao', 'orgao', 'orgaos',
  'emissao', 'previa', 'previo', 'hidreletrica', 'hidreletrico', 'comprovacao',
  'audiencia', 'periodo', 'responsavel', 'disponivel', 'vegetacao', 'extraido',
  'proprio', 'propria', 'inicio', 'operacao', 'condicao', 'condicoes',
  'exigencia', 'referencia', 'evidencia', 'competencia', 'area', 'areas',
  'nivel', 'niveis', 'criterio', 'criterios', 'relatorio', 'relatorios',
  'obrigatorio', 'necessario', 'ja', 'sera', 'apos', 'ate', 'entao',
];
const REGEX_SEM_ACENTO = new RegExp(`\\b(${SEM_ACENTO.join('|')})\\b`, 'i');

for (const q of questionBank) {
  for (const texto of [q.question, ...q.options, q.explanation]) {
    const achado = REGEX_SEM_ACENTO.exec(String(texto || ''));
    if (achado) fail(`${q.id}: "${achado[1]}" sem acento -> "${String(texto).slice(0, 60)}"`);
  }
}

function temPistaDeComprimento(q) {
  const tamanhos = q.options.map((o) => String(o).length);
  const correta = tamanhos[q.answer];
  const maiorRival = Math.max(...tamanhos.filter((_, i) => i !== q.answer));
  return correta >= maiorRival * MARGEM;
}

const acertosDoChutador = questionBank.filter(temPistaDeComprimento).length;

const percentual = Math.round((100 * acertosDoChutador) / questionBank.length);
const acaso = Math.round(
  (100 * questionBank.reduce((s, q) => s + 1 / q.options.length, 0)) / questionBank.length,
);

if (acertosDoChutador > TETO_CHUTADOR) {
  fail(
    `pista de comprimento piorou: um chutador que escolhe a alternativa mais `
    + `longa acerta ${acertosDoChutador} de ${questionBank.length} (${percentual}%), `
    + `acima do teto de ${TETO_CHUTADOR}. Equilibre o tamanho das alternativas.`,
  );
}

const comFonte = questionBank.filter((q) => q.source).length;
console.log(
  `\n${questionBank.length} questoes | ${comFonte} com fonte verificada | `
  + `${lessons.length}/${lessons.length} aulas com questao exclusiva | `
  + `minimo por modulo: ${Math.min(...tracks.map((t) => porTrilha[t.id] || 0))}`,
);
console.log(
  `pista de comprimento: chutador acerta ${acertosDoChutador} (${percentual}%), `
  + `acaso ${acaso}%, teto ${TETO_CHUTADOR}`,
);
if (acertosDoChutador > acaso + 8) {
  console.log(
    'AVISO: a alternativa correta ainda e reconhecivel pelo tamanho. Ao reescrever '
    + 'uma questao, deixe as alternativas com comprimento parecido e baixe o teto.',
  );
}
if (erros) { console.log(`${erros} problema(s) no banco de questoes.`); process.exit(1); }
console.log('OK: cobertura, estrutura e citacoes conferem.');
