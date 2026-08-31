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
// chutar. O teto agora e percentual: 20% preserva a folga da medicao atual sem
// punir o simples crescimento do banco; acima disso o padrao voltou e precisa
// de correcao.
// A pista so existe quando a correta e VISIVELMENTE a maior. Empate, ou
// vantagem de poucos caracteres, nao orienta ninguem: a primeira versao deste
// portao contava "47, 47, 44" como pista porque pegava o primeiro maximo, e
// media formato do array em vez de percepcao de quem responde. A margem de 10%
// e o que separa "a maior" de "uma das maiores".
const MARGEM = 1.10;
const TETO_CHUTADOR_PCT = 20;

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

if ((100 * acertosDoChutador) / questionBank.length > TETO_CHUTADOR_PCT) {
  fail(
    `pista de comprimento piorou: um chutador que escolhe a alternativa mais `
    + `longa acerta ${acertosDoChutador} de ${questionBank.length} (${percentual}%), `
    + `acima do teto de ${TETO_CHUTADOR_PCT}%. Equilibre o tamanho das alternativas.`,
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
  + `acaso ${acaso}%, teto ${TETO_CHUTADOR_PCT}%`,
);
if (percentual > acaso + 8) {
  console.log(
    'AVISO: a alternativa correta ainda e reconhecivel pelo tamanho. Ao reescrever '
    + 'uma questao, deixe as alternativas com comprimento parecido e baixe o teto.',
  );
}
// ---------------------------------------------------------------- pistas de
// eliminacao: absoluto e eco do enunciado
//
// O portao acima travou a pista de COMPRIMENTO e parou ali. Medidas em
// 21/08/2026, as outras duas pistas classicas de prova estavam livres, e
// juntas valiam mais que a primeira valia sozinha.
//
// Absoluto na alternativa: 84 alternativas usam sempre, nunca, todo, qualquer,
// exclusivamente. Apenas 6 delas sao a correta. Sao 7% contra 33% esperado,
// z = -5,1. A regra "se diz sempre, esta errada" elimina um distrator em 78 de
// 84 vezes, e numa questao de tres alternativas isso leva o chute de 33% para
// 50%.
//
// Eco do enunciado: em 89 questoes uma alternativa repete mais palavras do
// enunciado que as outras, e e a correta em 47% delas contra 33% do acaso,
// z = 2,8.
//
// Somadas, com desempate pela mais longa: quem nao sabe NADA do POP acerta 107
// de 224, 48%, contra 33% do acaso. Sao 15 pontos de graca num banco usado
// para avaliacao.
//
// O que este portao NAO faz, e por que:
//
// Nao mando reescrever os 78 distratores. Olhei um a um e na maioria o
// absoluto E o erro: "Sempre como renovacao", "qualquer plano com ART comprova
// a execucao", "sem qualquer material cartografico". Tirar a palavra muda o
// valor de verdade e pode transformar o distrator em alternativa correta.
// Parte deste sinal e intrinseca ao dominio: em direito administrativo a
// alternativa errada erra tipicamente POR generalizar.
//
// Isso explica o numero, mas nao o desculpa: o aluno continua acertando sem
// saber. A saida certa e de conteudo, alternativa por alternativa, com quem
// responde pela norma, e nao um conserto mecanico de texto feito por quem nao
// pode conferir cada afirmacao contra o POP.
//
// Entao o teto abaixo nao aprova os 48%. Ele impede que virem 49%, e mantem o
// numero visivel em toda execucao para que a decisao de conteudo seja tomada
// com ele a vista, e nao esquecida.
const ABSOLUTO = /\b(sempre|nunca|jamais|todo|todos|toda|todas|qualquer|nenhum|nenhuma|obrigatoriamente|exclusivamente)\b/i;
const VAZIAS = new Set(
  'a o as os de do da das dos e ou que um uma para com por no na nos nas ao aos se nao em ser sao pode deve qual quais'.split(' '),
);
const conteudo = (t) => new Set(
  (t.toLowerCase().match(/[a-zà-ú]{4,}/g) || []).filter((w) => !VAZIAS.has(w)),
);

/** Indice que um respondente sem conhecimento marcaria usando so as pistas. */
export function escolhaDeQuemNaoSabe(q) {
  const indices = q.options.map((_, i) => i);
  const semAbsoluto = indices.filter((i) => !ABSOLUTO.test(q.options[i]));
  const vivos = semAbsoluto.length ? semAbsoluto : indices;
  const doEnunciado = conteudo(q.question);
  const eco = new Map(vivos.map((i) => [i, [...conteudo(q.options[i])].filter((w) => doEnunciado.has(w)).length]));
  const maior = Math.max(...eco.values());
  const lideres = vivos.filter((i) => eco.get(i) === maior);
  if (maior > 0 && lideres.length === 1) return lideres[0];
  return lideres.reduce((a, b) => (q.options[b].length > q.options[a].length ? b : a));
}

// Baixado de 112 para 95 em 22/08/2026, depois de o numero cair de 107 para 91.
//
// O que mudou: 58 distratores comecavam com "Somente" ou "Apenas". Medidos, eles
// eram a alternativa correta em 1 de 58 casos, 2% contra 33% do acaso. A regra
// "comecou com Somente, esta errada" eliminava um distrator com 98% de acerto em
// 45 questoes, e numa questao de tres alternativas isso leva o chute de 33% para
// 50%. Nenhuma medicao anterior pegava isso, porque a lista de absolutos aqui
// nao incluia essas duas palavras.
//
// Os 58 foram reescritos para afirmar a MESMA proposicao falsa sem o limitador
// de escopo que os denunciava. Cada reescrita passou por conferencia adversarial
// contra o trecho do POP, e 11 foram recusadas por terem virado verdadeiras ou
// defensaveis, o que criaria uma segunda resposta certa. Exemplo recusado: "A
// triagem incide sobre o ponto do barramento" e verdade, porque o barramento
// integra o arranjo integral do empreendimento.
//
// Resultado: pontos de graca caem de 33 para 17. Eco sai de 14 para 3, e
// comprimento de 13 para 8.
//
// O QUE PIOROU, e fica registrado: alongar distratores fez a alternativa mais
// CURTA ser a correta em 46% das questoes, contra 41% antes. A pista do mais
// longo melhorou, a do mais curto piorou, e a composta melhorou muito. Quem
// continuar este trabalho ataca o comprimento nas duas pontas.
// 42,5% equivale ao teto anterior de 95 em 224 questoes, mas continua
// comparavel quando novas aulas acrescentam itens ao banco.
const TETO_ESPERTALHAO_PCT = 42.5;
const acertosEspertalhao = questionBank.filter((q) => escolhaDeQuemNaoSabe(q) === q.answer).length;
const pctEspertalhao = Math.round((100 * acertosEspertalhao) / questionBank.length);
console.log(
  `pistas de eliminacao: quem nao sabe acerta ${acertosEspertalhao} (${pctEspertalhao}%), `
  + `acaso ${acaso}%, teto ${TETO_ESPERTALHAO_PCT}%`,
);
if ((100 * acertosEspertalhao) / questionBank.length > TETO_ESPERTALHAO_PCT) {
  console.error(
    `FALHA: eliminar absolutos e seguir o eco do enunciado leva a ${acertosEspertalhao} acertos, `
    + `acima do teto ${TETO_ESPERTALHAO_PCT}%. A pista de formato cresceu.`,
  );
  erros += 1;
}

// ------------------------------------------------------------------ de onde
// vem o excedente
//
// O numero acima diz QUANTO se ganha de graca, e nao ONDE. Sem a separacao
// abaixo, quem for corrigir o banco nao sabe por onde comecar, e as tres
// pistas nao se corrigem da mesma forma nem pela mesma pessoa:
//
//   ABSOLUTO decidindo sozinho: as unicas alternativas sem "sempre/qualquer/
//   todo" sao a correta. Medido em 21/08/2026, isso ocorre em 9 questoes e
//   acerta as 9. Li as nove uma a uma: em todas a pergunta e "vale uma regra
//   automatica?" e a resposta certa e "depende, verifique". O distrator
//   generaliza porque e assim que se erra em direito administrativo. Tirar a
//   palavra muda o valor de verdade. Correcao possivel: acrescentar ao banco
//   questoes em que a norma E categorica, com citacao, para que "absoluto e
//   errado" pare de valer como regra. O POP tem material: a secao 011 diz que
//   TODA manifestacao tecnica deve ser rastreavel, a 068 que o PACUERA e
//   revisto OBRIGATORIAMENTE a cada 10 anos.
//
//   ECO DO ENUNCIADO: a alternativa que mais repete palavras da pergunta.
//   Decide 86 e acerta 42. E artefato de redacao, nao do dominio, e se corrige
//   sem tocar em afirmacao nenhuma: distribuir os termos do enunciado entre as
//   alternativas, ou tira-los da correta.
//
//   COMPRIMENTO: o desempate, quando as duas pistas anteriores empatam. Decide
//   129 e acerta 56. Tambem e redacao: a correta costuma ser a mais longa
//   porque carrega as ressalvas que a tornam correta.
//
// Isto e relatorio, e nao portao: nao reprova. O teto acima e que segura o
// numero. Aqui so fica dito onde os pontos moram, para a decisao de conteudo
// ser tomada com o mapa a vista.
const decisao = (q) => {
  const indices = q.options.map((_, i) => i);
  const semAbsoluto = indices.filter((i) => !ABSOLUTO.test(q.options[i]));
  const vivos = semAbsoluto.length ? semAbsoluto : indices;
  if (vivos.length === 1) return 'absoluto';
  const doEnunciado = conteudo(q.question);
  const eco = new Map(vivos.map((i) => [i, [...conteudo(q.options[i])].filter((w) => doEnunciado.has(w)).length]));
  const maior = Math.max(...eco.values());
  if (maior > 0 && vivos.filter((i) => eco.get(i) === maior).length === 1) return 'eco';
  return 'comprimento';
};
const porPista = new Map([['absoluto', [0, 0]], ['eco', [0, 0]], ['comprimento', [0, 0]]]);
for (const q of questionBank) {
  const par = porPista.get(decisao(q));
  par[0] += 1;
  if (escolhaDeQuemNaoSabe(q) === q.answer) par[1] += 1;
}
const esperadoPorQuestao = questionBank.reduce((soma, q) => soma + 1 / q.options.length, 0)
  / questionBank.length;
for (const [pista, [casos, certos]] of porPista) {
  const esperado = Math.round(casos * esperadoPorQuestao);
  const taxa = casos ? Math.round((100 * certos) / casos) : 0;
  console.log(
    `   ${pista.padEnd(11)} decide ${String(casos).padStart(3)}, acerta `
    + `${String(certos).padStart(3)} (${taxa}%), acaso ${esperado}, de graca ${certos - esperado}`,
  );
}

// --------------------------------------------------- comprimento, outra ponta
// O portao ja media "chutar na mais LONGA". Faltava a ponta oposta, e faltar
// custou caro: a reescrita dos distratores de escopo, em 22/08/2026, alongou
// alternativas erradas e levou "chutar na mais CURTA" de 41% para 46% sem que
// nada acusasse. Uma pista trocada por outra e um empate disfarcado de avanco.
//
// Medido em 31/08/2026: 101 de 232 (43,5%), sem contar empate. Olhei as 9 questoes em que a
// diferenca e gritante, com a correta abaixo de 72% da media das outras, e nao
// ha conserto mecanico ali. A correta e curta porque e uma afirmacao normativa
// seca; o distrator e longo porque precisa carregar a condicao falsa que o torna
// errado. "APA e RPPN" tem 10 caracteres e nao se infla sem escrever pior.
//
// Entao aqui o teto nao promete conserto: ele impede que a proxima rodada de
// edicao empurre o numero para cima sem ninguem ver.
// 47% preserva o limite anterior de 105 em 224 questoes sem transformar o
// crescimento do banco, por si so, em regressao.
const TETO_MAIS_CURTA_PCT = 47;
const acertosMaisCurta = questionBank.filter((q) => {
  const tamanhos = q.options.map((opcao) => opcao.length);
  const menor = Math.min(...tamanhos);
  return tamanhos[q.answer] === menor
    && tamanhos.filter((tamanho) => tamanho === menor).length === 1;
}).length;
console.log(
  `pista de comprimento, ponta curta: chutador acerta ${acertosMaisCurta} `
  + `(${Math.round((100 * acertosMaisCurta) / questionBank.length)}%), acaso ${acaso}%, `
  + `teto ${TETO_MAIS_CURTA_PCT}%`,
);
if ((100 * acertosMaisCurta) / questionBank.length > TETO_MAIS_CURTA_PCT) {
  console.error(
    `FALHA: chutar na alternativa mais curta leva a ${acertosMaisCurta} acertos, acima do `
    + `teto ${TETO_MAIS_CURTA_PCT}%. Alongar distrator resolve uma ponta e piora a outra.`,
  );
  erros += 1;
}

// ------------------------------------------------------------ pista de escopo
// Impede que "Somente" e "Apenas" voltem a abrir distrator em massa. Elas sao
// mais perigosas que os absolutos comuns porque nao afirmam nada: so limitam o
// alcance, e limitar alcance e o jeito mais rapido de escrever uma alternativa
// obviamente errada. Sobraram 11 apos a reescrita; o teto percentual da folga
// para uma questao nova ocasional e continua comparavel se o banco crescer.
const TETO_ESCOPO_PCT = 2.1;
const abrePorEscopo = questionBank.flatMap((q) => q.options).filter(
  (opcao) => /^\s*(somente|apenas)\b/i.test(opcao),
);
const totalAlternativas = questionBank.reduce((total, q) => total + q.options.length, 0);
const percentualEscopo = (100 * abrePorEscopo.length) / totalAlternativas;
const escopoCorretas = questionBank.filter(
  (q) => /^\s*(somente|apenas)\b/i.test(q.options[q.answer]),
).length;
console.log(
  `pista de escopo: ${abrePorEscopo.length} alternativa(s) abrem com Somente/Apenas, `
  + `${escopoCorretas} delas e a correta, ${percentualEscopo.toFixed(1)}% do banco, `
  + `teto ${TETO_ESCOPO_PCT}%`,
);
if (percentualEscopo > TETO_ESCOPO_PCT) {
  console.error(
    `FALHA: ${abrePorEscopo.length} alternativas abrem com Somente/Apenas `
    + `(${percentualEscopo.toFixed(1)}%), acima do teto ${TETO_ESCOPO_PCT}%. `
    + 'Quem nao sabe elimina essas primeiro, e quase sempre acerta.',
  );
  erros += 1;
}

if (erros) { console.log(`${erros} problema(s) no banco de questoes.`); process.exit(1); }
console.log('OK: cobertura, estrutura e citacoes conferem.');
