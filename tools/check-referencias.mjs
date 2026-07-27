// Referencias nao resolvidas nos modulos de UI extraidos.
//
// Por que existe: a primeira extracao de componentes de main.jsx levou o
// Suporte sem levar o PageHeader que ele usa. O build passou, o smoke passou,
// e a tela quebrou em runtime com "PageHeader is not defined". Nem o
// compilador nem o smoke pegam isso, porque em JavaScript um identificador
// livre so falha quando a linha executa.
//
// Este teste e deliberadamente simples: encontra o que cada arquivo USA como
// componente ou funcao com inicial maiuscula e confere contra o que ele define
// ou importa. Nao substitui um lint completo; pega exatamente a classe de erro
// que ja aconteceu.
//
// Uso:  node tools/check-referencias.mjs
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
// Modulos de UI fora de main.jsx. main.jsx nao entra: la tudo divide o mesmo
// escopo e o verificador so acusaria ruido.
const ARQUIVOS = ['src/ui.jsx', 'src/painelAluno.jsx', 'src/redator.jsx', 'src/mapa.jsx', 'src/hydro.jsx', 'src/hydroCases.jsx'];

// Globais e nativos que nao precisam de import.
const AMBIENTE = new Set([
  'React', 'Object', 'Blob', 'URL', 'Date', 'Math', 'JSON', 'Array', 'String',
  'Number', 'Promise', 'Set', 'Map', 'WeakSet', 'WeakMap', 'RegExp', 'Error',
  'Intl', 'Boolean', 'Infinity', 'NaN', 'MessageChannel', 'Headers', 'Request',
  'Response', 'PointerEvent', 'KeyboardEvent', 'MouseEvent', 'Event',
]);

let erros = 0;

for (const rel of ARQUIVOS) {
  let s;
  try {
    s = await readFile(resolve(raiz, rel), 'utf8');
  } catch {
    continue;
  }

  // Uso em JSX, nas duas formas que ja produziram falha real:
  //   <Componente            -> "PageHeader is not defined"
  //   prop={Componente}      -> "CircleHelp is not defined", um icone passado
  //                             como valor, que a primeira versao nao via.
  // O padrao "Nome(" foi descartado: casa com prosa em portugues, e "Terra (",
  // "Souza (" e "Itaipu (" viravam referencia inexistente nos arquivos de texto.
  const usados = new Set();
  for (const m of s.matchAll(/<([A-Z]\w*)/g)) usados.add(m[1]);
  for (const m of s.matchAll(/[=:]\s*\{\s*([A-Z]\w*)\s*[}\s,)]/g)) usados.add(m[1]);

  const definidos = new Set();
  for (const m of s.matchAll(/^import\s*\{([^}]+)\}/gm)) {
    for (const p of m[1].split(',')) definidos.add(p.trim().split(/\s+as\s+/).pop());
  }
  for (const m of s.matchAll(/^import\s+(\w+)/gm)) definidos.add(m[1]);
  for (const m of s.matchAll(/^(?:export\s+)?(?:function|const|let|class)\s+([A-Za-z_]\w*)/gm)) definidos.add(m[1]);
  // declaracoes internas ao arquivo (funcoes aninhadas, consts em componentes)
  for (const m of s.matchAll(/(?:function|const|let|class)\s+([A-Z][A-Za-z0-9_]*)/g)) definidos.add(m[1]);
  // renome em desestruturacao, como ({ icon: Icon }): o nome novo existe no
  // escopo da funcao e nao vem de import.
  for (const m of s.matchAll(/:\s*([A-Z][A-Za-z0-9_]*)/g)) definidos.add(m[1]);

  const faltando = [...usados].filter((u) => !definidos.has(u) && !AMBIENTE.has(u));
  if (faltando.length) {
    erros += faltando.length;
    console.log(`FALHA ${rel}: usa sem definir nem importar -> ${faltando.join(', ')}`);
  }
}

console.log(`\n${ARQUIVOS.length} modulos verificados.`);
if (erros) { console.log(`${erros} referencia(s) nao resolvida(s).`); process.exit(1); }
console.log('OK: nenhuma referencia solta.');
