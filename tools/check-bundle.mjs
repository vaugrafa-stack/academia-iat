// Guarda contra o build que compila sem a aplicacao dentro.
//
// Isto ja aconteceu. A montagem passou para bootstrap.jsx e o index.html
// continuou apontando para main.jsx, que passou a apenas exportar o App sem
// chamar createRoot. O Rollup considerou o resto inalcancavel: o pacote saiu
// com 138 kB, sem react-dom, sem os icones e sem uma unica tela, o build
// terminou com sucesso e o site ficaria parado no splash para sempre.
//
// Nenhum teste pegava isso porque o smoke test carrega os modulos pelo Vite,
// nao o artefato publicado. Este verifica o ARTEFATO: entrada declarada no
// HTML, presenca das telas e piso de tamanho.
//
// Uso:  node tools/check-bundle.mjs [dir-do-build]
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const dir = resolve(process.argv[2] || 'dist');

// Uma marca por area principal. Se a arvore de modulos for cortada, alguma
// destas cai fora do pacote.
const MARCAS = [
  ['painel inicial', 'Aprenda o procedimento'],
  ['hidrelétricas', 'Microcentral'],
  ['mapa', 'Faixa didática do POP'],
  ['formação', 'Formação guiada pelo POP'],
  ['fluxogramas', 'Fluxos: proposta e atividade'],
  ['laboratório', 'Pratique antes de assinar'],
  ['redator de IT', 'Escrever uma Informação Técnica'],
  ['avaliações', 'AUTOAVALIAÇÃO COMENTADA'],
  ['biblioteca', 'Biblioteca operacional'],
  ['suporte', 'Relatar dúvida ou problema'],
];

const PISO_KB = 380;   // soma dos .js do build; hoje passa de 600 kB

let erros = 0;
const fail = (m) => { erros++; console.log('FALHA ' + m); };

let html;
try {
  html = await readFile(join(dir, 'index.html'), 'utf8');
} catch {
  console.log(`FALHA: ${dir}/index.html nao existe. Rode o build antes.`);
  process.exit(1);
}

// 1. o HTML aponta para um modulo que existe
const entrada = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1];
if (!entrada) fail('index.html sem script de modulo');
else {
  const rel = entrada.replace(/^.*\/assets\//, 'assets/');
  try {
    await stat(join(dir, rel));
  } catch {
    fail(`a entrada declarada no HTML nao existe no build: ${entrada}`);
  }
}

// 2. as telas estao dentro de algum pedaco
const arquivos = (await readdir(join(dir, 'assets'))).filter((f) => f.endsWith('.js'));
let bytes = 0;
const conteudo = [];
for (const f of arquivos) {
  const caminho = join(dir, 'assets', f);
  bytes += (await stat(caminho)).size;
  conteudo.push(await readFile(caminho, 'utf8'));
}
const tudo = conteudo.join('\n');

for (const [area, marca] of MARCAS) {
  if (!tudo.includes(marca)) fail(`a área "${area}" nao esta no pacote (marca ausente: "${marca}")`);
}

// 3. piso de tamanho: um corte de arvore derruba o total muito abaixo disto
const kb = bytes / 1024;
if (kb < PISO_KB) fail(`pacote com ${kb.toFixed(0)} kB, abaixo do piso de ${PISO_KB} kB: provavel corte da arvore de modulos`);

console.log(`\n${arquivos.length} pedaco(s) de JS, ${kb.toFixed(0)} kB no total, ${MARCAS.length} areas verificadas.`);
if (erros) { console.log(`${erros} problema(s) no artefato publicado.`); process.exit(1); }
console.log('OK: o artefato contem a aplicacao.');
