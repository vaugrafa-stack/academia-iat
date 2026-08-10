// Deriva src/data/question-bank.json de src/questions.js.
//
// Por que o banco sai do JavaScript. O acervo de questoes entrava no pacote
// de todo mundo porque courseData.js importava questionsExtra.js na linha 1.
// Como arquivo buscado, o banco sai do orcamento de JS, ganha cache proprio do
// navegador e passa a ser versionado com hash pelo empacotador.
//
// Por que no ARRANQUE e nao sob demanda, ao contrario do corpo dos casos. A
// tela de aula usa uma questao comentada em cada topico (selectLessonQuestion),
// entao o banco e necessario na area mais visitada da plataforma. Buscar sob
// demanda so trocaria o custo de lugar. A aplicacao ja aguarda o conteudo do
// POP no arranque; somar a busca paralela do banco nessa mesma espera evita
// uma segunda etapa visivel sem inflar o JavaScript inicial.
//
// Uso:
//   node tools/build-question-data.mjs           grava
//   node tools/build-question-data.mjs --check   falha se estiver desatualizado
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const { questionBank } = await import('../src/questions.js');
const pop = JSON.parse(
  await readFile(resolve(raiz, 'src/data/pop-public-content.json'), 'utf8'),
);

const DESTINO = resolve(raiz, 'src/data/question-bank.json');
const ROTULO = 'src/data/question-bank.json';

const sectionById = new Map(pop.sections.map((section) => [section.id, section]));

const COGNITIVE_LABELS = Object.freeze({
  recordar: 'Recordar',
  compreender: 'Compreender',
  aplicar: 'Aplicar',
  analisar: 'Analisar',
});

const OBJECTIVE_VERBS = Object.freeze({
  recordar: 'Reconhecer',
  compreender: 'Explicar',
  aplicar: 'Aplicar',
  analisar: 'Analisar',
});

function canonical(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// A taxonomia e uma classificacao editorial automatizada. Ela descreve a
// acao predominante solicitada pelo enunciado e nao mede aprendizagem.
function cognitiveLevel(question) {
  const stem = canonical(question.question);
  if (/\b(distinguir|comparar|coerencia|conflito|compatibil|classificar|fundamenta|relacao entre|divisao de papeis|avaliar)\b/.test(stem)) {
    return 'analisar';
  }
  if (/\b(em um processo|na analise|ao verificar|ao selecionar|na triagem|em pedido|como proceder|encaminhamento|o tecnico deve|quando |se uma |deve ser analisad)\b/.test(stem)) {
    return 'aplicar';
  }
  if (/^(o que e|qual documento|para quem|quanto |quem |o que significa|qual e a sigla)/.test(stem)) {
    return 'recordar';
  }
  return 'compreender';
}

function tokens(text = '') {
  return new Set(
    canonical(text)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 3),
  );
}

function optionSimilarity(options) {
  let total = 0;
  let pairs = 0;
  for (let left = 0; left < options.length; left += 1) {
    for (let right = left + 1; right < options.length; right += 1) {
      const a = tokens(options[left]);
      const b = tokens(options[right]);
      const union = new Set([...a, ...b]);
      const intersection = [...a].filter((token) => b.has(token));
      total += union.size ? intersection.length / union.size : 0;
      pairs += 1;
    }
  }
  return pairs ? total / pairs : 0;
}

// Dificuldade aqui e estrutural, nao psicometrica: considera a acao cognitiva,
// extensao do caso, quantidade de opcoes e proximidade lexical dos distratores.
function difficulty(question, level) {
  const weights = { recordar: 1, compreender: 2, aplicar: 3, analisar: 4 };
  let score = weights[level];
  const signals = [`ação cognitiva: ${COGNITIVE_LABELS[level].toLowerCase()}`];
  if (question.options.length > 3) {
    score += 1;
    signals.push(`${question.options.length} alternativas`);
  }
  if (question.question.length > 180) {
    score += 1;
    signals.push('enunciado contextual extenso');
  }
  if (optionSimilarity(question.options) >= 0.22) {
    score += 1;
    signals.push('alternativas lexicalmente próximas');
  }
  return {
    id: score <= 2 ? 'introdutoria' : score <= 4 ? 'intermediaria' : 'avancada',
    signals,
  };
}

// Prioridade de remediacao nao e gravidade de pendencia processual. Ela apenas
// ordena a revisao didatica quando o estudante erra um conceito sensivel.
function remediationPriority(question, level) {
  const context = canonical(
    `${question.question} ${question.explanation} ${question.source?.quote || ''}`,
  );
  if (/\b(competencia|outorga|titularidade|seguranca de barragem|eia|rima|inviabilidade|deferimento|decisao segura|pendencia critica|modalidade|dlam|iphan|pacuera)\b/.test(context)) {
    return 'alta';
  }
  if (level === 'aplicar' || level === 'analisar' || /\b(documento|relatorio|estudo|processo|checklist|vistoria|condicionante)\b/.test(context)) {
    return 'media';
  }
  return 'regular';
}

function distractorFeedback(option) {
  const text = canonical(option);
  if (/\b(sempre|nunca|automatic|apenas|somente|exclusiv|irrelevante|dispensa|substitui)\b/.test(text)) {
    return 'A alternativa usa uma regra absoluta ou uma dispensa que o trecho citado não sustenta. Compare os limites da afirmação com a justificativa e a fonte.';
  }
  if (/\b(competencia|aneel|iat|iphan|ibama|outorga|licenca)\b/.test(text)) {
    return 'A alternativa atribui um papel ou efeito a um ator ou ato que não corresponde ao fundamento deste item. Refaça a separação de competências e atos com apoio do trecho citado.';
  }
  return 'A alternativa não é sustentada pelo trecho do POP citado para esta questão. Compare-a com a justificativa e localize no texto-fonte o critério que muda a conclusão.';
}

function pedagogyFor(question) {
  const section = sectionById.get(question.source?.sec);
  if (!section) throw new Error(`${question.id}: secao-fonte ausente para metadados pedagogicos.`);
  const level = cognitiveLevel(question);
  const estimatedDifficulty = difficulty(question, level);
  const sourceLabel = `${section.number ? `${section.number} ` : ''}${section.title}`.trim();
  return {
    schemaVersion: 1,
    derivation: 'regras-editoriais-automaticas-v1',
    reviewStatus: 'revisao-humana-pendente',
    objective: `${OBJECTIVE_VERBS[level]} a orientação de ${sourceLabel} e justificar a escolha com o trecho citado.`,
    cognitiveLevel: level,
    difficulty: estimatedDifficulty.id,
    difficultySignals: estimatedDifficulty.signals,
    remediationPriority: remediationPriority(question, level),
    distractors: question.options.flatMap((option, index) => (
      index === question.answer
        ? []
        : [{ option, feedback: distractorFeedback(option) }]
    )),
  };
}

const derivedQuestionBank = questionBank.map((question) => ({
  ...question,
  pedagogy: pedagogyFor(question),
}));

function distribution(field) {
  return Object.fromEntries(
    [...derivedQuestionBank.reduce((counts, question) => {
      const value = question.pedagogy[field];
      counts.set(value, (counts.get(value) || 0) + 1);
      return counts;
    }, new Map())].sort(([left], [right]) => left.localeCompare(right)),
  );
}

const metrics = {
  cognitiveLevel: distribution('cognitiveLevel'),
  difficulty: distribution('difficulty'),
  remediationPriority: distribution('remediationPriority'),
};

const texto = `${JSON.stringify(derivedQuestionBank)}\n`;
let atual = null;
try {
  atual = await readFile(DESTINO, 'utf8');
} catch {
  atual = null;
}

if (atual === texto) {
  console.log(`OK: ${ROTULO} atualizado (${questionBank.length} questoes).`);
  console.log(`Metadados pedagogicos automaticos: ${JSON.stringify(metrics)}.`);
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
console.log(`Metadados pedagogicos automaticos: ${JSON.stringify(metrics)}.`);
