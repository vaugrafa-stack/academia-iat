import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AREA_MARKERS,
  BUNDLE_BUDGETS,
  MINIMUM_JS_BYTES,
  collectBundleMetrics,
  evaluateBudgetMetrics,
  evaluateBundleStructure,
  gzipSize,
  isFlowchartsChunk,
  resolveEntryAsset,
} from "../tools/check-bundle.mjs";

function measured(name, rawBytes, gzipBytes) {
  return { name, rawBytes, gzipBytes };
}

function budgetMetrics(delta = 0) {
  return {
    entry: measured(
      "index-HASH.js",
      BUNDLE_BUDGETS.entry.raw + delta,
      BUNDLE_BUDGETS.entry.gzip + delta,
    ),
    largestJsRaw: measured(
      "main-HASH.js",
      BUNDLE_BUDGETS.largestJs.raw + delta,
      0,
    ),
    largestJsGzip: measured(
      "main-HASH.js",
      0,
      BUNDLE_BUDGETS.largestJs.gzip + delta,
    ),
    totalJs: measured(
      null,
      BUNDLE_BUDGETS.totalJs.raw + delta,
      BUNDLE_BUDGETS.totalJs.gzip + delta,
    ),
    totalCss: measured(
      null,
      BUNDLE_BUDGETS.totalCss.raw + delta,
      BUNDLE_BUDGETS.totalCss.gzip + delta,
    ),
    largestCompressibleAssetRaw: measured(
      "pop-content-HASH.json",
      BUNDLE_BUDGETS.largestCompressibleAsset.raw + delta,
      0,
    ),
    largestCompressibleAssetGzip: measured(
      "pop-content-HASH.json",
      0,
      BUNDLE_BUDGETS.largestCompressibleAsset.gzip + delta,
    ),
    flowcharts: measured(
      "Flowcharts-HASH.js",
      BUNDLE_BUDGETS.flowcharts.raw + delta,
      BUNDLE_BUDGETS.flowcharts.gzip + delta,
    ),
  };
}

describe("orçamento reproduzível do bundle", () => {
  it("aceita exatamente os limites e agrega todas as violações de um byte", () => {
    expect(evaluateBudgetMetrics(budgetMetrics())).toEqual([]);

    const violations = evaluateBudgetMetrics(budgetMetrics(1));
    expect(violations).toHaveLength(12);
    expect(violations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("entrada JS bruta"),
        expect.stringContaining("maior chunk JS gzip"),
        expect.stringContaining("JS total bruto"),
        expect.stringContaining("CSS total gzip"),
        expect.stringContaining("maior asset compressível bruto"),
        expect.stringContaining("chunk Flowcharts gzip"),
      ]),
    );
  });

  it("resolve a entrada e o chunk por papel, sem fixar o hash", () => {
    const html = [
      "<!doctype html>",
      '<script crossorigin src="/academia-iat/assets/index-A_b-19.js?v=7" type="module"></script>',
    ].join("\n");

    expect(resolveEntryAsset(html)).toBe("assets/index-A_b-19.js");
    expect(isFlowchartsChunk("Flowcharts-X_y-9.js")).toBe(true);
    expect(isFlowchartsChunk("Flowcharts.js")).toBe(false);
    expect(isFlowchartsChunk("main-X_y-9.js")).toBe(false);
  });

  it("calcula gzip determinístico para o mesmo conteúdo", () => {
    const content = Buffer.from("Academia IAT\n".repeat(500), "utf8");
    const first = gzipSize(content);

    expect(first).toBeGreaterThan(0);
    expect(gzipSize(content)).toBe(first);
  });

  it("soma arquivos e identifica hashes arbitrários em fixture autocontida", async () => {
    const directory = await mkdtemp(join(tmpdir(), "academia-bundle-"));
    const assets = join(directory, "assets");
    const entryName = "index-Q7_w.js";
    const mainName = "main-r4N.js";
    const flowchartsName = "Flowcharts-A9_z.js";
    const entryContent = "console.log('entry');";
    const mainContent = AREA_MARKERS.map(([, marker]) => marker).join("|");
    const flowchartsContent = "export default 'fluxos';";
    const cssA = ".a{color:green}";
    const cssB = ".b{color:blue}";
    const data = JSON.stringify({ content: "POP".repeat(100) });

    try {
      await mkdir(assets);
      await Promise.all([
        writeFile(
          join(directory, "index.html"),
          `<script src="/repo/assets/${entryName}?release=1" type="module"></script>`,
        ),
        writeFile(join(assets, entryName), entryContent),
        writeFile(join(assets, mainName), mainContent),
        writeFile(join(assets, flowchartsName), flowchartsContent),
        writeFile(join(assets, "main-A.css"), cssA),
        writeFile(join(assets, "extra-B.css"), cssB),
        writeFile(join(assets, "pop-content-C.json"), data),
      ]);

      const metrics = await collectBundleMetrics(directory);

      expect(metrics.entry?.name).toBe(entryName);
      expect(metrics.flowcharts?.name).toBe(flowchartsName);
      expect(metrics.totalJs.rawBytes).toBe(
        Buffer.byteLength(entryContent + mainContent + flowchartsContent),
      );
      expect(metrics.totalCss.rawBytes).toBe(
        Buffer.byteLength(cssA + cssB),
      );
      expect(metrics.largestCompressibleAssetRaw?.name).toBe(
        "pop-content-C.json",
      );
      expect(metrics.totalJs.gzipBytes).toBe(
        gzipSize(Buffer.from(entryContent)) +
          gzipSize(Buffer.from(mainContent)) +
          gzipSize(Buffer.from(flowchartsContent)),
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("preserva o piso, as marcas e a unicidade do chunk de fluxos", () => {
    const complete = {
      declaredEntry: "assets/index-HASH.js",
      entry: measured("index-HASH.js", 1, 1),
      flowchartsChunks: [measured("Flowcharts-HASH.js", 1, 1)],
      allJavaScript: AREA_MARKERS.map(([, marker]) => marker).join("\n"),
      totalJs: { rawBytes: MINIMUM_JS_BYTES, gzipBytes: 1 },
    };

    expect(evaluateBundleStructure(complete)).toEqual([]);

    const violations = evaluateBundleStructure({
      ...complete,
      flowchartsChunks: [],
      allJavaScript: "",
      totalJs: { rawBytes: MINIMUM_JS_BYTES - 1, gzipBytes: 1 },
    });
    expect(violations).toHaveLength(AREA_MARKERS.length + 2);
    expect(violations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("exatamente um chunk Flowcharts"),
        expect.stringContaining("abaixo do piso"),
        expect.stringContaining('área "fluxogramas"'),
      ]),
    );
  });
});
