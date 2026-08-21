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
const ARQUIVOS = ['src/ui.jsx', 'src/painelAluno.jsx', 'src/redator.jsx', 'src/mapa.jsx', 'src/hydro.jsx', 'src/hydroCases.jsx', 'src/laboratorio.jsx', 'src/OfflineManager.jsx', 'src/Flowcharts.jsx', 'src/biblioteca.jsx', 'src/perfil.jsx'];

// Globais e nativos que nao precisam de import.
const AMBIENTE = new Set([
  'React', 'Object', 'Blob', 'URL', 'Date', 'Math', 'JSON', 'Array', 'String',
  'Number', 'Promise', 'Set', 'Map', 'WeakSet', 'WeakMap', 'RegExp', 'Error',
  'Intl', 'Boolean', 'Infinity', 'NaN', 'MessageChannel', 'Headers', 'Request',
  'Response', 'PointerEvent', 'KeyboardEvent', 'MouseEvent', 'Event',
]);

/**
 * Nomes que um arquivo traz por `import`.
 *
 * As duas primeiras versoes disto liam so `import { A } from` e
 * `import X from`. A forma COMBINADA, `import X, { A } from`, que e sintaxe
 * padrao, escapava das duas: a primeira exige a chave logo depois de `import`,
 * e a segunda para no nome do padrao. O efeito era falso positivo, acusando de
 * solta uma referencia corretamente importada.
 *
 * Falso positivo em portao nao e defeito menor que falso negativo. Ele ensina
 * quem trabalha no projeto a contornar o portao, e a partir dai ele nao protege
 * mais nada.
 */
export function nomesImportados(texto) {
  const nomes = new Set();
  // Casa a clausula inteira entre `import` e `from`, e so depois separa. Tentar
  // resolver as variantes com um regex por forma e o que produziu o ponto cego.
  for (const m of texto.matchAll(/^import\s+([^;]*?)\s+from\s/gm)) {
    const clausula = m[1].trim();
    const chaves = clausula.match(/\{([^}]*)\}/);
    if (chaves) {
      for (const parte of chaves[1].split(',')) {
        const nome = parte.trim().split(/\s+as\s+/).pop();
        if (nome) nomes.add(nome);
      }
    }
    // O que sobra fora das chaves: o padrao e o `* as NS`.
    for (const parte of clausula.replace(/\{[^}]*\}/g, '').split(',')) {
      const cru = parte.trim();
      if (!cru) continue;
      const apelido = cru.match(/^\*\s+as\s+(\w+)$/);
      if (apelido) { nomes.add(apelido[1]); continue; }
      if (/^\w+$/.test(cru)) nomes.add(cru);
    }
  }
  return nomes;
}

// Um portao que nunca reprovou e indistinguivel de um portao quebrado, e este
// passou tempo demais sem provar que le o que diz ler.
function autoteste() {
  const casos = [
    ["import A from 'x';", ['A']],
    ["import { B, C } from 'x';", ['B', 'C']],
    ["import D, { E } from 'x';", ['D', 'E']],
    ["import F, { G as H } from 'x';", ['F', 'H']],
    ["import * as I from 'x';", ['I']],
    ["import J, * as K from 'x';", ['J', 'K']],
    ["import { L,\n  M } from 'x';", ['L', 'M']],
  ];
  const falhas = [];
  for (const [fonte, esperados] of casos) {
    const lidos = nomesImportados(fonte);
    for (const nome of esperados) {
      if (!lidos.has(nome)) {
        falhas.push(`${JSON.stringify(fonte)}: nao enxergou ${nome}`);
      }
    }
  }
  // Contraprova: sem `from`, nao e importacao de nome.
  if (nomesImportados("import 'apenas/efeito.css';").size) {
    falhas.push('import de efeito colateral virou nome importado');
  }
  return falhas;
}

const falhasDoAutoteste = autoteste();
if (falhasDoAutoteste.length) {
  console.log('FALHA: o proprio verificador nao le as formas de import que promete ler.');
  falhasDoAutoteste.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}

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

  const definidos = new Set(nomesImportados(s));
  for (const m of s.matchAll(/^(?:export\s+)?(?:function|const|let|class)\s+([A-Za-z_]\w*)/gm)) definidos.add(m[1]);
  // declaracoes internas ao arquivo (funcoes aninhadas, consts em componentes)
  for (const m of s.matchAll(/(?:function|const|let|class)\s+([A-Z][A-Za-z0-9_]*)/g)) definidos.add(m[1]);
  // renome em desestruturacao, como ({ icon: Icon }): o nome novo existe no
  // escopo da funcao e nao vem de import.
  for (const m of s.matchAll(/:\s*([A-Z][A-Za-z0-9_]*)/g)) definidos.add(m[1]);
  // desestruturacao de ARRAY em parametro de arrow, o padrao das tabelas de
  // navegacao:  [["buscar", "Buscar", Search]].map(([id, rotulo, I]) => <I/>)
  // Sem isto o verificador acusa "I" como referencia solta, que foi o unico
  // achado da extracao da Biblioteca e era falso.
  for (const m of s.matchAll(/\(\s*\[([^\]]+)\]\s*\)\s*=>/g)) {
    for (const p of m[1].split(',')) {
      const nome = p.trim();
      if (/^[A-Z][A-Za-z0-9_]*$/.test(nome)) definidos.add(nome);
    }
  }

  const faltando = [...usados].filter((u) => !definidos.has(u) && !AMBIENTE.has(u));
  if (faltando.length) {
    erros += faltando.length;
    console.log(`FALHA ${rel}: usa sem definir nem importar -> ${faltando.join(', ')}`);
  }
}

console.log(`\n${ARQUIVOS.length} modulos verificados.`);
if (erros) { console.log(`${erros} referencia(s) nao resolvida(s).`); process.exit(1); }
console.log('OK: nenhuma referencia solta.');
