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
  largestJs: Object.freeze({ raw: 265 * KIB, gzip: 85 * KIB }),
  totalJs: Object.freeze({ raw: 850 * KIB, gzip: 270 * KIB }),
  totalCss: Object.freeze({ raw: 185 * KIB, gzip: 34 * KIB }),
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
  ["painel inicial", "Aprenda o procedimento"],
  ["hidrelétricas", "Microcentral"],
  ["mapa", "Faixa didática do POP"],
  ["formação", "Formação guiada pelo POP"],
  ["fluxogramas", "Fluxos: proposta e atividade"],
  ["laboratório", "Pratique antes de assinar"],
  ["redator de IT", "Escrever uma Informação Técnica"],
  ["avaliações", "AUTOAVALIAÇÃO COMENTADA"],
  ["biblioteca", "Biblioteca operacional"],
  ["suporte", "Relatar dúvida ou problema"],
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

export function resolveEntryAsset(html) {
  const source = findModuleScriptSource(html);
  if (!source) return null;

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

  return {
    directory,
    declaredEntry,
    entry: entryName ?
      jsFiles.find((file) => file.name === entryName) || null
    : null,
    files,
    jsFiles,
    cssFiles,
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
