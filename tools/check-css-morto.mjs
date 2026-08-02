// Classes de CSS que nenhum arquivo-fonte menciona.
//
// Por que existe. O orcamento de CSS chegou a 96,9% do teto e travaria a
// proxima melhoria visual, do mesmo jeito que o de JS travava antes. Dividir
// folha nao resolve: o orcamento e do total. O que resolve e apagar o que nao
// e usado.
//
// Como decide. Uma classe e considerada USADA quando aparece em qualquer lugar
// dos fontes: className literal, template string, concatenacao, atributo em
// HTML, seletor em querySelector, ou nome montado dentro de uma expressao. O
// criterio e deliberadamente frouxo, porque falso positivo aqui significa
// apagar estilo de tela viva. Na duvida, mantem.
//
// O que ele NAO faz: apagar nada. Ele relata. A remocao e decisao humana,
// conferida no navegador.
//
// Uso:  node tools/check-css-morto.mjs
import { readdir, readFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');

async function arquivos(dir, exts, saida = []) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (['node_modules', 'dist', 'dist-pages', '.git'].includes(entrada.name)) continue;
      await arquivos(caminho, exts, saida);
    } else if (exts.includes(extname(entrada.name))) {
      saida.push(caminho);
    }
  }
  return saida;
}

const folhas = (await arquivos(join(raiz, 'src'), ['.css']));
const fontes = [
  ...(await arquivos(join(raiz, 'src'), ['.js', '.jsx'])),
  ...(await arquivos(join(raiz, 'tools'), ['.mjs', '.js'])),
  join(raiz, 'index.html'),
];

// Todo o texto dos fontes numa string so. Procurar a classe como SUBSTRING
// cobre className literal, template string, concatenacao e seletor montado.
let textoFonte = '';
for (const caminho of fontes) {
  try {
    textoFonte += await readFile(caminho, 'utf8');
  } catch { /* index.html pode nao existir em algum contexto */ }
}

// Zero, porque em 01/08/2026 a folha ficou limpa. Comecar a catraca no valor
// medido e o unico jeito de ela significar alguma coisa: com folga, o lixo
// volta a acumular ate consumir o orcamento, que foi o que aconteceu antes.
// Se este numero precisar subir, suba com a justificativa no mesmo commit.
const TOLERANCIA_ORFAS = 0;
const CLASSE = /\.(-?[_a-zA-Z][\w-]*)/g;

/**
 * Classe montada em pedacos, como `vls-theme-${tema}` ou `n-${grupo.id}`.
 *
 * O nome inteiro nunca aparece nos fontes, so o prefixo e o sufixo separados.
 * Sem esta verificacao o relatorio acusava .vls-theme-dam, .n-decisao e
 * .mode-desafio como mortas, e apagar qualquer uma delas quebraria tela viva.
 * Testa todos os prefixos terminados em hifen e tambem o ultimo segmento.
 */
function montadaPorConcatenacao(classe) {
  const partes = classe.split('-');
  if (partes.length < 2) return false;
  for (let corte = 1; corte < partes.length; corte += 1) {
    const prefixo = `${partes.slice(0, corte).join('-')}-`;
    if (textoFonte.includes(prefixo)) return true;
  }
  return false;
}
const usadas = new Set();
const orfas = new Map();     // classe -> folhas onde aparece
let totalClasses = 0;

for (const folha of folhas) {
  const css = await readFile(folha, 'utf8');
  const nome = folha.slice(raiz.length + 1).replace(/\\/g, '/');
  // Percorre so o que vem antes de cada bloco, para nao pegar valores.
  const seletores = css.replace(/\/\*[\s\S]*?\*\//g, '').split('}')
    .map((bloco) => bloco.split('{')[0] || '')
    .join(' ');
  const vistas = new Set();
  for (const m of seletores.matchAll(CLASSE)) vistas.add(m[1]);
  for (const classe of vistas) {
    totalClasses += 1;
    if (textoFonte.includes(classe) || montadaPorConcatenacao(classe)) {
      usadas.add(classe);
    } else {
      if (!orfas.has(classe)) orfas.set(classe, []);
      orfas.get(classe).push(nome);
    }
  }
}

const lista = [...orfas.entries()].sort((a, b) => a[0].localeCompare(b[0]));

console.log(`${folhas.length} folhas, ${totalClasses} classes declaradas, ${usadas.size} referenciadas nos fontes.\n`);
if (!lista.length) {
  console.log('OK: nenhuma classe orfa.');
} else {
  console.log(`${lista.length} classe(s) que nenhum fonte menciona:\n`);
  for (const [classe, ondes] of lista) {
    console.log(`  .${classe.padEnd(34)} ${[...new Set(ondes)].join(', ')}`);
  }
  console.log('\nEste relatorio NAO apaga nada. Classe montada por concatenacao');
  console.log('parcial pode aparecer aqui sem estar morta: confira antes de remover.');
  // Catraca. A remocao continua sendo decisao humana, conferida no navegador;
  // o que o portao impede e o acumulo passar despercebido e comer a folga do
  // orcamento de CSS, que foi exatamente o que aconteceu ate 01/08/2026.
  if (lista.length > TOLERANCIA_ORFAS) {
    console.log(`\nFALHA: ${lista.length} classes orfas, acima da tolerancia de ${TOLERANCIA_ORFAS}.`);
    process.exit(1);
  }
}
