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
}

autoteste();

const arquivos = (await readdir(fonte)).filter((n) => n.endsWith('.css'));
const problemas = [];
for (const nome of arquivos) {
  const css = await readFile(join(fonte, nome), 'utf8');
  problemas.push(...raiosForaDaEscala(css, `src/${nome}`));
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

console.log(
  `Escala de raio: ${declaracoes} declaracoes em ${arquivos.length} folhas, `
  + `todas nos ${TOKENS.length} degraus.`,
);
