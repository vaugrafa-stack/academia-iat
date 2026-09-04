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

// Raiz padrão do navegador. Nada no projeto redefine `font-size` no html, então
// a conversão de rem é exata. Se um dia redefinir, esta linha passa a mentir.
const RAIZ_PX = 16;

/** Declarações de `font-size`, com o seletor a que pertencem.
 *
 * Mede pixel e rem. O padrão anterior só aceitava `px`, e o portão anunciava
 * que nenhum texto ficava abaixo do piso de leitura enquanto rem, em e %
 * passavam sem ser medidos. Entre os invisíveis estava
 * `.vls-video::cue{font-size:78%}`, o tamanho da legenda do vídeo, que é
 * justamente o texto de leitura corrida que este arquivo existe para proteger.
 *
 * em e % NÃO são convertidos: dependem do elemento pai e não são resolvíveis
 * lendo o arquivo. Eles saem em `dependentes` para virar aviso visível, em vez
 * de silêncio. */
/** Tokens `--texto-*` e `--titulo-*` declarados, em pixels. */
export function escalaDeclarada(css) {
  const escala = new Map();
  for (const m of semComentario(css).matchAll(/(--(?:texto|titulo)-\d+)\s*:\s*(\d*\.?\d+)px/g)) {
    escala.set(m[1], Number(m[2]));
  }
  return escala;
}

export function tamanhosDeclarados(css, escala = new Map()) {
  const achados = [];
  const dependentes = [];
  for (const regra of semComentario(css).matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const seletor = regra[1].trim().replace(/\s+/g, " ");
    // Tamanho vindo da escala tipográfica.
    //
    // Sem isto, migrar os 785 literais para token cegaria este portão por
    // inteiro: ele continuaria anunciando que nada está abaixo do piso de
    // leitura enquanto deixaria de medir a quase totalidade das declarações.
    // O mesmo buraco que `check-normas` tinha com número curto.
    for (const decl of regra[2].matchAll(/font-size:\s*var\(\s*(--[\w-]+)\s*\)/g)) {
      const px = escala.get(decl[1]);
      if (px === undefined) {
        achados.push({ seletor, px: Number.NaN, unidade: 'token', token: decl[1] });
        continue;
      }
      achados.push({ seletor, px, unidade: 'token', token: decl[1] });
    }
    for (const decl of regra[2].matchAll(/font-size:\s*(\d*\.?\d+)(px|rem)\b/g)) {
      const valor = Number(decl[1]);
      achados.push({
        seletor,
        px: decl[2] === "rem" ? valor * RAIZ_PX : valor,
        unidade: decl[2],
      });
    }
    // O `%` não leva `\b`: ele não é caractere de palavra, e em
    // `font-size:78%}` a fronteira entre `%` e `}` não existe. Com a fronteira
    // exigida, o único caso que motivou este conserto, a legenda do vídeo em
    // 78%, continuava invisível para a régua que passou a procurá-lo.
    for (const decl of regra[2].matchAll(/font-size:\s*(\d*\.?\d+)(?:(em)\b|(%))/g)) {
      const unidade = decl[2] || decl[3];
      dependentes.push({ seletor, valor: Number(decl[1]), unidade });
    }
  }
  achados.dependentes = dependentes;
  return achados;
}

const falhas = [];
const folhas = readdirSync(PASTA).filter((n) => n.endsWith(".css"));
// A escala é declarada uma vez, em `styles.css`, e usada por todas as folhas.
const escala = new Map();
for (const arquivo of folhas) {
  for (const [token, px] of escalaDeclarada(readFileSync(join(PASTA, arquivo), "utf8"))) {
    escala.set(token, px);
  }
}
if (!escala.size) falhas.push("nenhum token da escala tipografica encontrado");
let medidas = 0;
for (const arquivo of folhas) {
  const css = readFileSync(join(PASTA, arquivo), "utf8");
  for (const { seletor, px, token } of tamanhosDeclarados(css, escala)) {
    medidas += 1;
    if (Number.isNaN(px)) {
      falhas.push(`${arquivo}: ${token} nao existe na escala, em ${seletor.slice(0, 60)}`);
      continue;
    }
    if (px < PISO) {
      falhas.push(`${arquivo}: ${px}px em ${seletor.slice(0, 70)}`);
    }
  }
}

// Autoteste em toda execução. Portão que nunca reprovou é indistinguível de
// portão quebrado, e este nasce com a árvore já corrigida, então sem armadilha
// ele passaria para sempre sem provar nada.
const DEVE_ACUSAR = ".alguma-coisa{font-size:9px}";
// A armadilha em rem existe porque o autoteste atestava só o caso que a régua
// já sabia medir: com 9px na entrada, ele provava que pixel funciona e nada
// sobre o resto. Meio rem são 8px e precisam reprovar igual.
const DEVE_ACUSAR_REM = ".pequena{font-size:.5rem}";
const NAO_PODE_ACUSAR = "/* antes era font-size:9px aqui */\n.outra{font-size:11px}";
if (!tamanhosDeclarados(DEVE_ACUSAR).some((d) => d.px < PISO)) {
  falhas.push("autoteste: deveria acusar 9px e nao acusou");
}
if (!tamanhosDeclarados(DEVE_ACUSAR_REM).some((d) => d.px < PISO)) {
  falhas.push("autoteste: deveria acusar .5rem, que sao 8px, e nao acusou");
}
if (tamanhosDeclarados(NAO_PODE_ACUSAR).some((d) => d.px < PISO)) {
  falhas.push("autoteste: acusou tamanho que estava dentro de comentario");
}
// Armadilhas da escala em token. A primeira prova que o portao mede o valor
// atras do token, e nao apenas registra que ha um token; a segunda, que token
// inexistente reprova em vez de passar como tamanho desconhecido.
const ESCALA_TESTE = escalaDeclarada(":root{--texto-9:9px;--texto-8:16px}");
if (!tamanhosDeclarados(".x{font-size:var(--texto-9)}", ESCALA_TESTE).some((d) => d.px < PISO)) {
  falhas.push("autoteste: nao mediu o valor por tras do token da escala");
}
if (!tamanhosDeclarados(".y{font-size:var(--nao-existe)}", ESCALA_TESTE)
  .some((d) => Number.isNaN(d.px))) {
  falhas.push("autoteste: aceitou token fora da escala em silencio");
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

let total = 0;
const relativos = [];
for (const arquivo of readdirSync(PASTA).filter((n) => n.endsWith(".css"))) {
  const medidos = tamanhosDeclarados(readFileSync(join(PASTA, arquivo), "utf8"));
  total += medidos.length;
  for (const d of medidos.dependentes) {
    relativos.push(`${arquivo}: ${d.valor}${d.unidade} em ${d.seletor.slice(0, 56)}`);
  }
}
console.log(`OK: ${total} tamanhos declarados, nenhum abaixo de ${PISO}px.`);
// O que a régua NÃO alcança sai por escrito. Silêncio sobre o não medido é o
// que fazia este portão parecer cobrir a folha inteira: em e % dependem do
// elemento pai, e a única forma honesta de tratá-los é dizer que existem e
// pedir conferência humana, em vez de omitir.
if (relativos.length) {
  console.log(
    `\n${relativos.length} tamanho(s) em unidade relativa ao pai, fora do alcance da régua.`
    + " Confira na tela, porque o valor final depende do contexto:",
  );
  for (const r of relativos) console.log(`  ${r}`);
}
