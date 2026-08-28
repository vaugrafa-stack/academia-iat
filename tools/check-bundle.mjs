// Verifica o artefato que sera publicado, nao apenas o grafo carregado pelo Vite.
//
// O piso e as marcas abaixo protegem contra cortes acidentais da aplicacao.
// Os tetos protegem contra a regressao oposta: um build funcional, mas cada vez
// mais pesado. Todos os limites usam KiB (1 KiB = 1024 bytes).
//
// Uso: node tools/check-bundle.mjs [diretorio-do-build]
import { readFile, readdir } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";

export const KIB = 1024;

export const BUNDLE_BUDGETS = Object.freeze({
  entry: Object.freeze({ raw: 205 * KIB, gzip: 66 * KIB }),
  // Folhas declaradas no HTML ou precarregadas pela entrada JavaScript
  // bloqueiam o primeiro conteudo. O teto total continua protegendo o
  // artefato inteiro; este teto separado impede que CSS de rota volte
  // silenciosamente para a entrada comum.
  initialCss: Object.freeze({ raw: 205 * KIB, gzip: 38 * KIB }),
  largestJs: Object.freeze({ raw: 265 * KIB, gzip: 85 * KIB }),
  // Revisto em 20/08/2026, e este era o unico teto do arquivo sem historico
  // escrito, o que ja e um defeito: numero sem justificativa nao se revisa, so
  // se afrouxa.
  //
  // A requalificacao dos quinze diagramas levou o JS de 761,9 para 788,3 KiB
  // brutos e 258,3 gzip, ou seja, 95,4% do teto de gzip. Faltava uma rodada
  // para o build reprovar, e reprovar DEPOIS de empurrar foi exatamente o erro
  // que custou dois commits nesta mesma sessao.
  //
  // Procurei gordura antes, como manda o bloco do CSS logo abaixo. A medicao
  // certa aqui nao e contar linha repetida, e sim procurar MODULO duplicado
  // entre pedacos, que e o desperdicio real de empacotador: literal longo que
  // aparece em dois arquivos denuncia o mesmo codigo emitido duas vezes.
  // Resultado: ZERO literal repetido em 38 pedacos e 782 KiB. O empacotador
  // nao esta duplicando nada, e o crescimento e desenho de verdade, no pedaco
  // hydro, que passou a ser o segundo maior com 122,2 KiB.
  //
  // Sobe uma vez, com folga real: 900 / 300 KiB, cerca de 14% sobre o medido.
  // Subir de 10 em 10 a cada rodada seria ritual, nao controle, que e o que o
  // bloco do CSS ja registrou em 04/08.
  //
  // Ao contrario do CSS, o JS NAO tem catraca equivalente ao check-css-morto:
  // nao existe aqui um detector de codigo orfao com tolerancia zero. Enquanto
  // nao existir, este teto e a unica trava, e por isso a folga e generosa mas
  // nao infinita.
  totalJs: Object.freeze({ raw: 900 * KIB, gzip: 300 * KIB }),
  // Teto de CSS revisto em 01/08/2026, com a conta na mesa.
  //
  // O anterior (200 / 37 KiB) estava em 96,9% de uso e travaria a proxima
  // melhoria visual. Antes de mexer no teto, procurei gordura, que e a ordem
  // certa: tools/check-css-morto.mjs achou 7 classes que nenhum fonte
  // menciona, e havia tres blocos de prefers-reduced-motion repetindo o que a
  // regra global ja fazia. Removidos, sobraram 1,5 KiB, ou 0,6 ponto
  // percentual. A busca por declaracao identica entre styles.css e nota10.css
  // devolveu ZERO: nao ha duplicacao entre as folhas.
  //
  // Conclusao: o CSS e denso porque a aplicacao tem onze areas, dois temas,
  // folha de impressao e estados de acessibilidade, e nao porque acumulou
  // lixo. O teto e que estava apertado. Sobe para 215 / 40 KiB, cerca de 10%
  // de folga sobre os 192,7 / 35,6 KiB medidos, e o portao check-css-morto
  // entra na bateria como catraca para a folga nao ser consumida por regra
  // orfa.
  //
  // Revisto de novo em 04/08/2026, com a mesma disciplina e duas medicoes
  // independentes: check-css-morto devolveu ZERO classe orfa em 691
  // declaradas, e a busca por declaracao identica entre as CINCO folhas
  // encontrou 35 repeticoes, 635 bytes em 246 kB brutos. Ou seja, 0,26% de
  // sobra. Nao ha o que apagar; o CSS cresce porque a plataforma cresceu.
  //
  // Sobe para 240 / 46 KiB, cerca de 20% de folga sobre os 202 / 37,8 KiB
  // medidos. A folga maior desta vez e deliberada: o modo offline deixou de
  // ser criterio de recusa por peso, entao vem melhoria visual pela frente, e
  // subir o teto de 2 em 2 KiB a cada rodada e ritual, nao controle. A catraca
  // que importa continua sendo check-css-morto com tolerancia zero.
  //
  // Revisto em 20/08/2026, com a mesma disciplina, e desta vez a medicao
  // corrigiu quem media. As quatro rodadas de animacao dos diagramas levaram o
  // CSS total bruto a 241,4 KiB, 1,4 acima do teto, e o portao reprovou o
  // build. Antes de mexer no teto, procurei gordura.
  //
  // A primeira medicao foi ERRADA e vale registrar por que: contei declaracao
  // repetida, e achei 33% de repeticao. Mas `color:var(--muted)` em 192
  // seletores diferentes nao e gordura, e valor compartilhado, que e
  // justamente o que um sistema de design deve produzir. A regua estava
  // medindo coerencia e chamando de desperdicio.
  //
  // A medicao certa e bloco identico: 102 corpos de regra iguais entre as 15
  // folhas. Agrupa-los em seletor unico economiza 7,9 KiB REAIS, porque o
  // seletor permanece dos dois lados e o que some e a copia do corpo. Ou seja,
  // ao contrario das duas rodadas anteriores, desta vez EXISTE gordura, e ela
  // e cinco vezes maior que o estouro.
  //
  // Nao foi colhida, de proposito. Os blocos iguais sao de componentes sem
  // parentesco: `.route-loading div`, `.transcript-panel>summary span` e
  // `.offline-summary article span` compartilham 34 bytes de corpo por
  // coincidencia de aparencia, nao por regra comum. Agrupa-los prende os tres
  // ao mesmo destino: quem mexer no indicador de carregamento amanha muda a
  // transcricao e o resumo offline sem querer. Trocar acoplamento por bytes,
  // com o artefato inteiro em 1 MiB e a rede sendo a de um escritorio, e mau
  // negocio.
  //
  // Fica como reserva declarada: 7,9 KiB disponiveis a qualquer momento, se um
  // dia o peso passar a doer de verdade. Enquanto nao doer, o teto sobe.
  // Total 265 / 50 KiB e inicial 205 / 38 KiB, cerca de 10% de folga sobre os
  // 241,4 / 44,1 e 184,4 / 33,3 medidos. A catraca continua sendo
  // check-css-morto com tolerancia zero, que hoje devolve zero classe orfa.
  totalCss: Object.freeze({ raw: 265 * KIB, gzip: 50 * KIB }),
  // O proximo teto a chegar no limite NAO e o de JS: e este. Em 20/08/2026 o
  // pop-public-content estava em 918,7 de 960 KiB brutos, 95,7%, e 144,2 de
  // 150 gzip, 96,1%. Ele cresce com o conteudo do POP, e nao com codigo, entao
  // quem for mexer precisa decidir se o caso e subir o teto ou fatiar o JSON
  // por area. Nao mexi porque nao foi este trabalho que o fez crescer, e teto
  // que se sobe sem entender a causa deixa de medir alguma coisa.
  largestCompressibleAsset: Object.freeze({
    raw: 960 * KIB,
    gzip: 150 * KIB,
  }),
  flowcharts: Object.freeze({ raw: 14 * KIB, gzip: 5 * KIB }),
});

export const MINIMUM_JS_BYTES = 380 * KIB;

// Uma marca por area principal. Se a arvore de modulos for cortada, alguma
// delas desaparece do artefato.
export const AREA_MARKERS = Object.freeze([
  ["painel inicial", "Onde você parou"],
  ["hidrelétricas", "Microcentral"],
  ["mapa", "Faixa didática do POP"],
  ["formação", "Formação guiada pelo POP"],
  ["fluxogramas", "Fluxos: proposta e atividade"],
  ["laboratório", "Pratique antes de assinar"],
  ["redator de IT", "Redator de Informação Técnica"],
  ["avaliações", "AUTOAVALIAÇÃO COMENTADA"],
  ["biblioteca", "Biblioteca operacional"],
  ["suporte", "Central de Suporte"],
]);

const COMPRESSIBLE_ASSET_EXTENSIONS = new Set([
  ".csv",
  ".html",
  ".json",
  ".svg",
  ".txt",
  ".vtt",
  ".webmanifest",
  ".xml",
]);

const FLOWCHARTS_CHUNK = /^Flowcharts-[^.]+\.js$/i;

export function gzipSize(buffer) {
  // mtime zero evita incorporar horario ao cabecalho. O CI fixa a versao do
  // Node; assim o compressor e a implementacao de zlib tambem ficam fixos.
  return gzipSync(buffer, { level: 9, mtime: 0 }).byteLength;
}

export function isFlowchartsChunk(fileName) {
  return FLOWCHARTS_CHUNK.test(fileName);
}

function findModuleScriptSource(html) {
  const scripts = html.match(/<script\b[^>]*>/gi) || [];
  for (const script of scripts) {
    if (!/\btype\s*=\s*["']module["']/i.test(script)) continue;
    const source = script.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (source) return source;
  }
  return null;
}

function resolveAssetPath(source) {
  let pathname;
  try {
    pathname = new URL(source, "https://bundle.invalid/").pathname;
  } catch {
    return null;
  }

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const marker = "/assets/";
  const markerIndex = pathname.lastIndexOf(marker);
  if (markerIndex < 0) return pathname.replace(/^\/+/, "");
  return pathname.slice(markerIndex + 1);
}

export function resolveEntryAsset(html) {
  const source = findModuleScriptSource(html);
  if (!source) return null;
  return resolveAssetPath(source);
}

export function resolveInitialStyleAssets(html, entryJavaScript = "") {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  const fromHtml = links.flatMap((link) => {
    const rel = link.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    if (!rel.split(/\s+/).some((value) => value.toLowerCase() === "stylesheet")) {
      return [];
    }
    const href = link.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    const asset = href ? resolveAssetPath(href) : null;
    return asset ? [asset] : [];
  });
  const fromEntry = [...entryJavaScript.matchAll(
    /["'`]([^"'`]*assets\/[^"'`?]+\.css)(?:\?[^"'`]*)?["'`]/gi,
  )].flatMap((match) => {
    const asset = resolveAssetPath(match[1]);
    return asset ? [asset] : [];
  });
  return [...new Set([...fromHtml, ...fromEntry])];
}

function sum(files, field) {
  return files.reduce((total, file) => total + file[field], 0);
}

function largest(files, field) {
  return files.reduce(
    (current, file) =>
      current === null || file[field] > current[field] ? file : current,
    null,
  );
}

function measureFile(name, buffer) {
  return {
    name,
    extension: extname(name).toLowerCase(),
    rawBytes: buffer.byteLength,
    gzipBytes: gzipSize(buffer),
    text: name.endsWith(".js") ? buffer.toString("utf8") : null,
  };
}

export async function collectBundleMetrics(buildDirectory) {
  const directory = resolve(buildDirectory);
  const html = await readFile(join(directory, "index.html"), "utf8");
  const declaredEntry = resolveEntryAsset(html);
  const assetDirectory = join(directory, "assets");
  const entries = await readdir(assetDirectory, { withFileTypes: true });
  const assetNames = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "en"));

  const files = await Promise.all(
    assetNames.map(async (name) =>
      measureFile(name, await readFile(join(assetDirectory, name))),
    ),
  );
  const jsFiles = files.filter((file) => file.extension === ".js");
  const cssFiles = files.filter((file) => file.extension === ".css");
  const compressibleAssets = files.filter((file) =>
    COMPRESSIBLE_ASSET_EXTENSIONS.has(file.extension),
  );
  const flowchartsChunks = jsFiles.filter((file) =>
    isFlowchartsChunk(file.name),
  );
  const entryName =
    declaredEntry?.startsWith("assets/") ?
      basename(declaredEntry)
    : null;
  const entry = entryName ?
    jsFiles.find((file) => file.name === entryName) || null
  : null;
  const declaredInitialStyles = resolveInitialStyleAssets(html, entry?.text || "");
  const initialStyleNames = new Set(
    declaredInitialStyles
      .filter((asset) => asset.startsWith("assets/"))
      .map((asset) => basename(asset)),
  );
  const initialCssFiles = cssFiles.filter((file) => initialStyleNames.has(file.name));

  return {
    directory,
    declaredEntry,
    declaredInitialStyles,
    entry,
    files,
    jsFiles,
    cssFiles,
    initialCssFiles,
    compressibleAssets,
    flowchartsChunks,
    largestJsRaw: largest(jsFiles, "rawBytes"),
    largestJsGzip: largest(jsFiles, "gzipBytes"),
    totalJs: {
      rawBytes: sum(jsFiles, "rawBytes"),
      gzipBytes: sum(jsFiles, "gzipBytes"),
    },
    totalCss: {
      rawBytes: sum(cssFiles, "rawBytes"),
      gzipBytes: sum(cssFiles, "gzipBytes"),
    },
    initialCss: {
      rawBytes: sum(initialCssFiles, "rawBytes"),
      gzipBytes: sum(initialCssFiles, "gzipBytes"),
    },
    largestCompressibleAssetRaw: largest(
      compressibleAssets,
      "rawBytes",
    ),
    largestCompressibleAssetGzip: largest(
      compressibleAssets,
      "gzipBytes",
    ),
    flowcharts: flowchartsChunks[0] || null,
    allJavaScript: jsFiles.map((file) => file.text).join("\n"),
  };
}

function budgetViolation(label, measured, limit, fileName) {
  if (typeof measured !== "number" || measured <= limit) return null;
  const file = fileName ? ` (${fileName})` : "";
  return (
    `${label}${file}: ${formatKiB(measured)} KiB, acima do limite de ` +
    `${formatKiB(limit)} KiB`
  );
}

export function evaluateBudgetMetrics(metrics) {
  const checks = [
    [
      "entrada JS bruta",
      metrics.entry?.rawBytes,
      BUNDLE_BUDGETS.entry.raw,
      metrics.entry?.name,
    ],
    [
      "entrada JS gzip",
      metrics.entry?.gzipBytes,
      BUNDLE_BUDGETS.entry.gzip,
      metrics.entry?.name,
    ],
    [
      "maior chunk JS bruto",
      metrics.largestJsRaw?.rawBytes,
      BUNDLE_BUDGETS.largestJs.raw,
      metrics.largestJsRaw?.name,
    ],
    [
      "maior chunk JS gzip",
      metrics.largestJsGzip?.gzipBytes,
      BUNDLE_BUDGETS.largestJs.gzip,
      metrics.largestJsGzip?.name,
    ],
    [
      "CSS inicial bruto",
      metrics.initialCss?.rawBytes,
      BUNDLE_BUDGETS.initialCss.raw,
    ],
    [
      "CSS inicial gzip",
      metrics.initialCss?.gzipBytes,
      BUNDLE_BUDGETS.initialCss.gzip,
    ],
    [
      "JS total bruto",
      metrics.totalJs?.rawBytes,
      BUNDLE_BUDGETS.totalJs.raw,
    ],
    [
      "JS total gzip",
      metrics.totalJs?.gzipBytes,
      BUNDLE_BUDGETS.totalJs.gzip,
    ],
    [
      "CSS total bruto",
      metrics.totalCss?.rawBytes,
      BUNDLE_BUDGETS.totalCss.raw,
    ],
    [
      "CSS total gzip",
      metrics.totalCss?.gzipBytes,
      BUNDLE_BUDGETS.totalCss.gzip,
    ],
    [
      "maior asset compressível bruto",
      metrics.largestCompressibleAssetRaw?.rawBytes,
      BUNDLE_BUDGETS.largestCompressibleAsset.raw,
      metrics.largestCompressibleAssetRaw?.name,
    ],
    [
      "maior asset compressível gzip",
      metrics.largestCompressibleAssetGzip?.gzipBytes,
      BUNDLE_BUDGETS.largestCompressibleAsset.gzip,
      metrics.largestCompressibleAssetGzip?.name,
    ],
    [
      "chunk Flowcharts bruto",
      metrics.flowcharts?.rawBytes,
      BUNDLE_BUDGETS.flowcharts.raw,
      metrics.flowcharts?.name,
    ],
    [
      "chunk Flowcharts gzip",
      metrics.flowcharts?.gzipBytes,
      BUNDLE_BUDGETS.flowcharts.gzip,
      metrics.flowcharts?.name,
    ],
  ];

  return checks
    .map(([label, measured, limit, fileName]) =>
      budgetViolation(label, measured, limit, fileName),
    )
    .filter(Boolean);
}

export function evaluateBundleStructure(metrics) {
  const violations = [];

  if (!metrics.declaredEntry) {
    violations.push("index.html sem script de módulo");
  } else if (!metrics.declaredEntry.startsWith("assets/")) {
    violations.push(
      `a entrada declarada no HTML não está em assets/: ${metrics.declaredEntry}`,
    );
  } else if (!metrics.entry) {
    violations.push(
      `a entrada declarada no HTML não existe no build: ${metrics.declaredEntry}`,
    );
  }

  if (!metrics.declaredInitialStyles?.length) {
    violations.push("entrada sem folha de estilo inicial");
  } else if (!metrics.initialCssFiles?.length) {
    violations.push("folhas de estilo iniciais declaradas nao existem no build");
  }

  if (metrics.flowchartsChunks.length !== 1) {
    violations.push(
      `esperado exatamente um chunk Flowcharts-<hash>.js; encontrados ` +
      `${metrics.flowchartsChunks.length}`,
    );
  }

  for (const [area, marker] of AREA_MARKERS) {
    if (!metrics.allJavaScript.includes(marker)) {
      violations.push(
        `a área "${area}" não está no pacote (marca ausente: "${marker}")`,
      );
    }
  }

  if (metrics.totalJs.rawBytes < MINIMUM_JS_BYTES) {
    violations.push(
      `pacote com ${formatKiB(metrics.totalJs.rawBytes)} KiB, abaixo do piso ` +
      `de ${formatKiB(MINIMUM_JS_BYTES)} KiB: provável corte da árvore de módulos`,
    );
  }

  return violations;
}

function formatKiB(bytes) {
  return (bytes / KIB).toFixed(1);
}

function printMetric(label, measured, limit, fileName) {
  if (typeof measured !== "number") {
    console.log(`AUSENTE  ${label}`);
    return;
  }
  const used = (measured / limit) * 100;
  const status =
    measured > limit ? "FALHA"
    : used >= 90 ? "ATENÇÃO"
    : "OK";
  const file = fileName ? ` · ${fileName}` : "";
  console.log(
    `${status.padEnd(8)} ${label}: ${formatKiB(measured)} / ` +
    `${formatKiB(limit)} KiB (${used.toFixed(1)}%)${file}`,
  );
}

export function printBundleMetrics(metrics) {
  console.log("\nOrçamento do artefato");
  printMetric(
    "Entrada JS · bruto",
    metrics.entry?.rawBytes,
    BUNDLE_BUDGETS.entry.raw,
    metrics.entry?.name,
  );
  printMetric(
    "Entrada JS · gzip",
    metrics.entry?.gzipBytes,
    BUNDLE_BUDGETS.entry.gzip,
    metrics.entry?.name,
  );
  printMetric(
    "Maior chunk JS · bruto",
    metrics.largestJsRaw?.rawBytes,
    BUNDLE_BUDGETS.largestJs.raw,
    metrics.largestJsRaw?.name,
  );
  printMetric(
    "Maior chunk JS · gzip",
    metrics.largestJsGzip?.gzipBytes,
    BUNDLE_BUDGETS.largestJs.gzip,
    metrics.largestJsGzip?.name,
  );
  printMetric(
    "CSS inicial · bruto",
    metrics.initialCss.rawBytes,
    BUNDLE_BUDGETS.initialCss.raw,
  );
  printMetric(
    "CSS inicial · gzip",
    metrics.initialCss.gzipBytes,
    BUNDLE_BUDGETS.initialCss.gzip,
  );
  printMetric(
    "JS total · bruto",
    metrics.totalJs.rawBytes,
    BUNDLE_BUDGETS.totalJs.raw,
  );
  printMetric(
    "JS total · gzip",
    metrics.totalJs.gzipBytes,
    BUNDLE_BUDGETS.totalJs.gzip,
  );
  printMetric(
    "CSS total · bruto",
    metrics.totalCss.rawBytes,
    BUNDLE_BUDGETS.totalCss.raw,
  );
  printMetric(
    "CSS total · gzip",
    metrics.totalCss.gzipBytes,
    BUNDLE_BUDGETS.totalCss.gzip,
  );
  printMetric(
    "Maior asset compressível · bruto",
    metrics.largestCompressibleAssetRaw?.rawBytes,
    BUNDLE_BUDGETS.largestCompressibleAsset.raw,
    metrics.largestCompressibleAssetRaw?.name,
  );
  printMetric(
    "Maior asset compressível · gzip",
    metrics.largestCompressibleAssetGzip?.gzipBytes,
    BUNDLE_BUDGETS.largestCompressibleAsset.gzip,
    metrics.largestCompressibleAssetGzip?.name,
  );
  printMetric(
    "Chunk Flowcharts · bruto",
    metrics.flowcharts?.rawBytes,
    BUNDLE_BUDGETS.flowcharts.raw,
    metrics.flowcharts?.name,
  );
  printMetric(
    "Chunk Flowcharts · gzip",
    metrics.flowcharts?.gzipBytes,
    BUNDLE_BUDGETS.flowcharts.gzip,
    metrics.flowcharts?.name,
  );
}

export async function runBundleCheck(buildDirectory = "dist") {
  let metrics;
  try {
    metrics = await collectBundleMetrics(buildDirectory);
  } catch (error) {
    console.log(
      `FALHA: não foi possível ler o artefato em ${resolve(buildDirectory)}: ` +
      error.message,
    );
    return 1;
  }

  printBundleMetrics(metrics);
  const violations = [
    ...evaluateBundleStructure(metrics),
    ...evaluateBudgetMetrics(metrics),
  ];

  console.log(
    `\n${metrics.jsFiles.length} pedaço(s) de JS, ` +
    `${formatKiB(metrics.totalJs.rawBytes)} KiB no total, ` +
    `${AREA_MARKERS.length} áreas verificadas.`,
  );

  if (violations.length > 0) {
    for (const violation of violations) console.log(`FALHA ${violation}`);
    console.log(`${violations.length} problema(s) no artefato publicado.`);
    return 1;
  }

  console.log("OK: o artefato contém a aplicação e respeita o orçamento.");
  return 0;
}

const invokedAsScript =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (invokedAsScript) {
  process.exitCode = await runBundleCheck(process.argv[2] || "dist");
}
