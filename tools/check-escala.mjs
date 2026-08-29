#!/usr/bin/env node
// Portao da escala de raio de borda.
//
// Medido em 22/08/2026, antes da migracao: 19 valores distintos em 369 usos,
// cobrindo quase todo inteiro entre 2 e 16. Nao era sistema; era cada
// componente escolhendo um numero proximo por conta propria. E dai que vem a
// sensacao de acabamento faltando, mais do que da cor ou do espaco em branco:
// o olho percebe que dois cartoes vizinhos tem cantos diferentes sem conseguir
// dizer o que esta errado.
//
// A escala tem cinco degraus e eles seguem o que a peca E, e nao o tamanho que
// ela tem por acaso:
//
//   --raio-1   4px   detalhe: marcador, faixa fina
//   --raio-2   8px   controle: botao, campo, ficha
//   --raio-3  12px   bloco: cartao, painel
//   --raio-4  18px   superficie grande
//   --raio-pill      pilula
//
// Este portao existe porque a migracao sozinha nao segura nada: bastaria a
// proxima tela nova escrever `border-radius:9px` para a dispersao recomecar, e
// ninguem repara numa linha dessas em revisao.
//
// O que ele NAO proibe: `0`, porcentagem e `50%`, que resolvem casos legitimos
// como circulo e canto reto. O alvo e o numero em px escolhido a mao.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = join(raiz, 'src');

const TOKENS = ['--raio-1', '--raio-2', '--raio-3', '--raio-4', '--raio-pill'];
const DECLARACAO = /border-radius:\s*([^;}]+)/g;
const LITERAL_PX = /(?<![-\w.])\d+(?:\.\d+)?px/;

/** Declaracoes de raio que usam px na mao em vez de um degrau da escala. */
export function raiosForaDaEscala(css, arquivo = '') {
  const fora = [];
  for (const achado of css.matchAll(DECLARACAO)) {
    const valor = achado[1].trim();
    if (!LITERAL_PX.test(valor)) continue;
    const linha = css.slice(0, achado.index).split('\n').length;
    fora.push({ arquivo, linha, valor });
  }
  return fora;
}

// --- peso de fonte --------------------------------------------------------
//
// A Manrope e variavel e a face declara `font-weight: 200 800`. Acima de 800 o
// navegador limita, e nao ha master mais pesado para ele alcancar.
//
// Medido no navegador, com a fonte carregada, o mesmo texto a 32px:
//
//   800 -> 646,18 px      850 -> 646,18 px
//   900 -> 646,18 px      950 -> 646,18 px
//
// Antes desta trava o CSS tinha 57 declaracoes em 850, 900 e 950. Elas se
// julgavam uma hierarquia e rendiam identicas. O custo nao e estetico: quem
// fosse ajustar aquilo mudava o numero, nada acontecia na tela, e a conclusao
// natural seria que o problema estava em outro lugar.
//
// A escala tem cinco degraus, e todos existem de verdade na fonte.
const PESOS_VALIDOS = new Set([400, 500, 600, 700, 800]);
const PESO = /font-weight:\s*(\d{3})\b(?!\s+\d)/g;

/** Pesos escritos fora dos cinco degraus que a fonte entrega. */
export function pesosForaDaEscala(css, arquivo = '') {
  const fora = [];
  for (const achado of css.matchAll(PESO)) {
    const valor = Number(achado[1]);
    if (PESOS_VALIDOS.has(valor)) continue;
    const linha = css.slice(0, achado.index).split('\n').length;
    fora.push({ arquivo, linha, valor, alemDoMaximo: valor > 800 });
  }
  return fora;
}

// --- tamanho de fonte -----------------------------------------------------
//
// Medido em 22/08/2026, antes da migracao: 23 valores em px, 767 usos.
//
//   texto de interface  11 a 17, com 713 usos, e meios-passos 11,5 / 12,5 / 13,5
//   titulos             18 a 39, com 55 usos espalhados por TREZE valores
//
// Treze tamanhos para 55 titulos quer dizer que quase todo titulo escolheu o
// proprio. Nao ha ritmo possivel assim: a diferenca entre 24 e 25 px nao
// comunica nada, so gasta uma decisao.
//
// A escala tem dez degraus. O mapeamento moveu o minimo: cada valor foi para o
// degrau vizinho, e no empate para o mais usado, que e o que menos mexe na
// tela. Onde havia quase-duplicado, encolheu em vez de crescer, porque crescer
// e o que transborda em 320 px.
//
//   11 12 13 14 16       interface
//   19 22 26 31 39       titulos
//
// clamp(), rem e var() ficam de fora: eles existem justamente para o caso em
// que o tamanho depende da largura, e nao sao numero escolhido a mao.
const TAMANHOS_VALIDOS = new Set([11, 12, 13, 14, 16, 19, 22, 26, 31, 39]);
const TAMANHO = /font-size:\s*(\d+(?:\.\d+)?)px/g;

/** Tamanhos escritos fora dos dez degraus. */
export function tamanhosForaDaEscala(css, arquivo = '') {
  const fora = [];
  for (const achado of css.matchAll(TAMANHO)) {
    const valor = Number(achado[1]);
    if (TAMANHOS_VALIDOS.has(valor)) continue;
    const linha = css.slice(0, achado.index).split('\n').length;
    fora.push({ arquivo, linha, valor });
  }
  return fora;
}

// --- autoteste ------------------------------------------------------------
// Um portao que nunca reprovou e indistinguivel de um portao quebrado. Estas
// armadilhas provam que ele reage ao defeito que promete pegar, e que nao
// reprova o que e legitimo.
function autoteste() {
  const casos = [
    ['.a{border-radius:9px}', 1, 'px na mao passou batido'],
    ['.a{border-radius:12px 12px 0 0}', 1, 'px em atalho de quatro cantos passou batido'],
    ['.a{border-radius:var(--raio-3)}', 0, 'token da escala foi reprovado'],
    ['.a{border-radius:var(--raio-3) var(--raio-3) 0 0}', 0, 'atalho com token foi reprovado'],
    ['.a{border-radius:50%}', 0, 'porcentagem foi reprovada, e circulo e legitimo'],
    ['.a{border-radius:0}', 0, 'canto reto foi reprovado'],
  ];
  for (const [css, esperado, queixa] of casos) {
    const achados = raiosForaDaEscala(css).length;
    if (achados !== esperado) {
      console.error(`FALHA no autoteste: ${queixa} (${css})`);
      process.exit(1);
    }
  }

  const casosPeso = [
    ['.a{font-weight:900}', 1, 'peso acima do que a fonte entrega passou batido'],
    ['.a{font-weight:850}', 1, 'peso acima do que a fonte entrega passou batido'],
    ['.a{font-weight:750}', 1, 'peso fora dos degraus passou batido'],
    ['.a{font-weight:800}', 0, 'degrau valido foi reprovado'],
    ['.a{font-weight:400}', 0, 'degrau valido foi reprovado'],
    ['@font-face{font-weight:200 800}', 0, 'a FAIXA da face foi confundida com peso de uso'],
  ];
  for (const [css, esperado, queixa] of casosPeso) {
    const achados = pesosForaDaEscala(css).length;
    if (achados !== esperado) {
      console.error(`FALHA no autoteste: ${queixa} (${css})`);
      process.exit(1);
    }
  }

  const casosTamanho = [
    ['.a{font-size:12.5px}', 1, 'meio-passo passou batido'],
    ['.a{font-size:25px}', 1, 'tamanho fora dos degraus passou batido'],
    ['.a{font-size:13px}', 0, 'degrau valido foi reprovado'],
    ['.a{font-size:39px}', 0, 'degrau valido foi reprovado'],
    ['.a{font-size:clamp(32px,4.2vw,52px)}', 0, 'clamp foi tratado como numero na mao'],
    ['.a{font-size:.8rem}', 0, 'rem foi tratado como numero na mao'],
  ];
  for (const [css, esperado, queixa] of casosTamanho) {
    const achados = tamanhosForaDaEscala(css).length;
    if (achados !== esperado) {
      console.error(`FALHA no autoteste: ${queixa} (${css})`);
      process.exit(1);
    }
  }
}

autoteste();

const arquivos = (await readdir(fonte)).filter((n) => n.endsWith('.css'));
const problemas = [];
const problemasPeso = [];
const problemasTamanho = [];
for (const nome of arquivos) {
  const css = await readFile(join(fonte, nome), 'utf8');
  problemas.push(...raiosForaDaEscala(css, `src/${nome}`));
  problemasPeso.push(...pesosForaDaEscala(css, `src/${nome}`));
  problemasTamanho.push(...tamanhosForaDaEscala(css, `src/${nome}`));
}

const declaracoes = (
  await Promise.all(
    arquivos.map(async (n) => (await readFile(join(fonte, n), 'utf8')).match(DECLARACAO) || []),
  )
).flat().length;

if (problemas.length) {
  console.error(
    `FALHA: ${problemas.length} raio(s) de borda escritos em px, fora da escala.`,
  );
  for (const p of problemas.slice(0, 12)) {
    console.error(`- ${p.arquivo}:${p.linha} → border-radius: ${p.valor}`);
  }
  console.error(`Use um degrau: ${TOKENS.join(', ')}.`);
  process.exit(1);
}

if (problemasPeso.length) {
  console.error(
    `FALHA: ${problemasPeso.length} peso(s) de fonte fora dos cinco degraus da escala.`,
  );
  for (const p of problemasPeso.slice(0, 12)) {
    const causa = p.alemDoMaximo
      ? ' (a face vai ate 800; acima disso o navegador limita e a tela nao muda)'
      : '';
    console.error(`- ${p.arquivo}:${p.linha} → font-weight: ${p.valor}${causa}`);
  }
  console.error('Use 400, 500, 600, 700 ou 800.');
  process.exit(1);
}

console.log(
  `Escala de raio: ${declaracoes} declaracoes em ${arquivos.length} folhas, `
  + `todas nos ${TOKENS.length} degraus.`,
);
if (problemasTamanho.length) {
  console.error(
    `FALHA: ${problemasTamanho.length} tamanho(s) de fonte fora dos dez degraus da escala.`,
  );
  for (const p of problemasTamanho.slice(0, 12)) {
    console.error(`- ${p.arquivo}:${p.linha} → font-size: ${p.valor}px`);
  }
  console.error('Use 11, 12, 13, 14, 16, 19, 22, 26, 31 ou 39, ou clamp() quando depender da largura.');
  process.exit(1);
}

console.log('Escala de peso: todos nos 5 degraus que a Manrope entrega.');
console.log('Escala de tamanho: todos nos 10 degraus.');
