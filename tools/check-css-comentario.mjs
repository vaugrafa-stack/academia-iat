// Portão: comentário de CSS aberto, que mata as regras seguintes em silêncio.
//
// Em 05/08/2026 um `/*` sem fechamento em `nota10.css` engoliu as 72 linhas
// seguintes, até encontrar o fechamento de outro comentário. Ficaram mortas:
//
//   - o piso de 12 px de tamanho de texto, para cerca de sessenta seletores.
//     Os textos que ele protege estavam renderizando em 10 e 11 px, que é
//     exatamente o que a regra existe para impedir;
//   - a trava de rolagem do fundo quando a barra lateral móvel abre, o que
//     deixava a página correr atrás do menu no celular;
//   - o alinhamento de um bloco da trilha.
//
// **Nenhum dos vinte e um portões pegava isso**, e nenhum pegaria: CSS com
// comentário aberto é CSS VÁLIDO. O navegador não reclama, o build não reclama,
// e `check-css-morto` só olha classe declarada contra classe usada, então uma
// classe comentada por acidente aparece como "não declarada", não como morta.
//
// O defeito apareceu por acaso, ao medir por que um bloco renderizava no
// tamanho errado. Achado por acaso é achado que não se repete: por isso virou
// portão.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "src";
const falhas = [];

/**
 * Percorre o arquivo caractere a caractere.
 *
 * Contar `/*` e `*​/` com expressão regular não serve: uma abertura escrita
 * DENTRO de um comentário, como exemplo em texto, seria contada como abertura
 * de verdade. Comentário de CSS não aninha, então o que vale é o estado.
 */
function comentarios(texto) {
  const achados = [];
  let dentro = false;
  let linha = 1;
  let aberturaEm = 0;
  let inicioEm = 0;
  for (let i = 0; i < texto.length; i += 1) {
    if (texto[i] === "\n") linha += 1;
    if (!dentro && texto.startsWith("/*", i)) {
      dentro = true;
      aberturaEm = linha;
      inicioEm = i;
      i += 1;
      continue;
    }
    if (dentro && texto.startsWith("*/", i)) {
      achados.push({
        de: aberturaEm,
        ate: linha,
        fechado: true,
        texto: texto.slice(inicioEm, i),
      });
      dentro = false;
      i += 1;
    }
  }
  if (dentro) {
    achados.push({
      de: aberturaEm,
      ate: linha,
      fechado: false,
      texto: texto.slice(inicioEm),
    });
  }
  return achados;
}

/**
 * O que denuncia o defeito é REGRA dentro de comentário, e não tamanho.
 *
 * A primeira versão deste portão só olhava comentário com mais de trinta
 * linhas, e não pegou o defeito quando eu o plantei de propósito: com um
 * fechamento por perto, o comentário engole poucas linhas e passa. O tamanho
 * do estrago depende de onde está o próximo fechamento, que é acaso.
 *
 * Prosa não tem `{ ... : ... }`. Regra tem. É esse o sinal.
 */
function regrasDentro(trecho) {
  return (trecho.match(/\{[^{}]*:[^{}]*\}/g) || []).length;
}

for (const nome of readdirSync(RAIZ).filter((n) => n.endsWith(".css"))) {
  const caminho = join(RAIZ, nome);
  const texto = readFileSync(caminho, "utf8");

  for (const c of comentarios(texto)) {
    if (!c.fechado) {
      falhas.push(
        `${caminho}:${c.de}: comentário aberto e nunca fechado. `
        + "Tudo até o fim do arquivo virou comentário.",
      );
      continue;
    }
    const regras = regrasDentro(c.texto);
    if (regras > 0) {
      falhas.push(
        `${caminho}:${c.de}-${c.ate}: comentário contendo ${regras} bloco(s) de `
        + "regra. Ou falta um fechamento, ou há CSS comentado que deveria "
        + "ser apagado.",
      );
    }
  }
}

// Autoteste: o portão precisa provar que ACUSA. Portão que nunca reprovou é
// indistinguível de portão quebrado.
const ABERTURA = "/" + "*";
const FECHAMENTO = "*" + "/";
const ARMADILHAS = [
  [`${ABERTURA} sem fechar\n.a{color:red}`, "comentário aberto"],
  [
    `${ABERTURA} prosa\n${".x{a:b}\n".repeat(35)}${FECHAMENTO}`,
    "comentário longo engolindo regra",
  ],
];
const LIMPOS = [
  `${ABERTURA} nota curta ${FECHAMENTO}\n.a{color:red}`,
  `${ABERTURA} exemplo citando ${ABERTURA} no texto ${FECHAMENTO}\n.a{color:red}`,
  `${ABERTURA}${"\n prosa longa sem regra nenhuma".repeat(40)}\n${FECHAMENTO}`,
];

const acusa = (amostra) =>
  comentarios(amostra).some((c) => !c.fechado || regrasDentro(c.texto) > 0);

for (const [amostra, rotulo] of ARMADILHAS) {
  if (!acusa(amostra)) {
    falhas.push(`autoteste: deveria acusar e não acusou: ${rotulo}`);
  }
}
for (const amostra of LIMPOS) {
  if (acusa(amostra)) {
    falhas.push(`autoteste: acusou o que não deveria: ${amostra.slice(0, 45)}`);
  }
}

if (falhas.length) {
  console.error("REPROVADO: comentário de CSS engolindo regra.\n");
  for (const f of falhas) console.error(`  ${f}`);
  console.error(
    "\nCSS com comentário aberto e CSS VÁLIDO: o navegador não reclama e o "
    + "build passa. As regras somem sem aviso.",
  );
  process.exit(1);
}

console.log(
  `OK: comentários equilibrados em ${readdirSync(RAIZ).filter((n) => n.endsWith(".css")).length} folhas; `
  + `${ARMADILHAS.length} armadilhas do autoteste foram detectadas.`,
);
