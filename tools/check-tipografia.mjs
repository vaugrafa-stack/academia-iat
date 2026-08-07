// Portão: nenhum texto abaixo do piso de leitura.
//
// Medido em 07/08/2026, antes da correção: **130 regras em 11px ou menos**, das
// quais 13 em 9px e 40 em 10px. E não eram só rótulos. Estavam em 10px a revisão
// de resposta do laboratório, o texto da transcrição, a lista de evidências do
// caso e a citação da fonte, que é conteúdo que a pessoa lê para decidir.
//
// A causa não foi descuido isolado, foi método: a plataforma só tinha UMA
// ferramenta para fazer texto recuar, encolher e acinzentar. Das 228
// declarações de peso, 3 estavam na faixa leve, então a metade clara de uma
// fonte variável de 200 a 800 nunca entrou. Sem registro quieto, sobra diminuir.
//
// Quem usa isto é servidor de carreira, no computador do escritório, o dia
// inteiro, e boa parte passa dos cinquenta. Nove pixels não é decisão de design,
// é decisão tomada por falta de alternativa.
//
// O piso é 11px para rótulo em caixa alta, que é lido por reconhecimento e não
// por leitura corrida. Abaixo disso, reprova.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PISO = 11;
const PASTA = "src";

/** Tira comentário antes de medir: exemplo em prosa não é declaração. */
function semComentario(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Declarações de `font-size` em pixel, com o seletor a que pertencem. */
export function tamanhosDeclarados(css) {
  const achados = [];
  for (const regra of semComentario(css).matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const seletor = regra[1].trim().replace(/\s+/g, " ");
    for (const decl of regra[2].matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) {
      achados.push({ seletor, px: Number(decl[1]) });
    }
  }
  return achados;
}

const falhas = [];
for (const arquivo of readdirSync(PASTA).filter((n) => n.endsWith(".css"))) {
  const css = readFileSync(join(PASTA, arquivo), "utf8");
  for (const { seletor, px } of tamanhosDeclarados(css)) {
    if (px < PISO) {
      falhas.push(`${arquivo}: ${px}px em ${seletor.slice(0, 70)}`);
    }
  }
}

// Autoteste em toda execução. Portão que nunca reprovou é indistinguível de
// portão quebrado, e este nasce com a árvore já corrigida, então sem armadilha
// ele passaria para sempre sem provar nada.
const DEVE_ACUSAR = ".alguma-coisa{font-size:9px}";
const NAO_PODE_ACUSAR = "/* antes era font-size:9px aqui */\n.outra{font-size:11px}";
if (!tamanhosDeclarados(DEVE_ACUSAR).some((d) => d.px < PISO)) {
  falhas.push("autoteste: deveria acusar 9px e nao acusou");
}
if (tamanhosDeclarados(NAO_PODE_ACUSAR).some((d) => d.px < PISO)) {
  falhas.push("autoteste: acusou tamanho que estava dentro de comentario");
}

if (falhas.length) {
  console.error(`REPROVADO: texto abaixo do piso de ${PISO}px.\n`);
  for (const f of falhas) console.error(`  ${f}`);
  console.error(
    "\nPara fazer um texto recuar sem encolher, use peso e cor: Manrope aqui e"
    + " variavel de 200 a 800, e a faixa leve quase nao e usada.",
  );
  process.exit(1);
}

const total = readdirSync(PASTA)
  .filter((n) => n.endsWith(".css"))
  .reduce((n, f) => n + tamanhosDeclarados(readFileSync(join(PASTA, f), "utf8")).length, 0);
console.log(`OK: ${total} tamanhos declarados, nenhum abaixo de ${PISO}px.`);
