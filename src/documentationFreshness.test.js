import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const catalogUrl = new URL("./data/content-catalog.json", import.meta.url);

async function readRoot(file) {
  return readFile(new URL(file, root), "utf8");
}

function normalize(document) {
  return document.replace(/\r\n/g, "\n");
}

function markdownSection(document, heading) {
  const normalized = normalize(document);
  const marker = `${heading}\n`;
  const start = normalized.indexOf(marker);
  expect(start, `seção ausente: ${heading}`).toBeGreaterThanOrEqual(0);
  const level = heading.match(/^#+/)?.[0].length || 1;
  const contentStart = start + marker.length;
  const remainder = normalized.slice(contentStart);
  const nextHeading = remainder.search(new RegExp(`^#{1,${level}}\\s`, "m"));
  return nextHeading < 0 ? remainder : remainder.slice(0, nextHeading);
}

function captured(document, pattern, label) {
  const match = normalize(document).match(pattern);
  expect(match, `declaração corrente ausente: ${label}`).not.toBeNull();
  return match?.[1];
}

describe("documentação corrente derivada da fonte de verdade", () => {
  it("mantém fonte e estado técnico corrente alinhados ao catálogo gerado", async () => {
    const [
      catalogRaw,
      readme,
      status,
      learningDesign,
      audiovisualPilot,
      mediaReadme,
      labSources,
    ] = await Promise.all([
      readFile(catalogUrl, "utf8"),
      readRoot("README.md"),
      readRoot("STATUS_ATUAL.md"),
      readRoot("LEARNING_DESIGN.md"),
      readRoot("AUDIOVISUAL_PILOT.md"),
      readRoot("public/media/README.md"),
      readRoot("src/labSources.js"),
    ]);
    const catalog = JSON.parse(catalogRaw);
    const source = catalog.documents.find((document) => document.id === "pop")?.source;

    expect(source?.fileName).toBeTruthy();
    expect(source?.sha256).toMatch(/^[a-f0-9]{64}$/);

    const readmeSource = markdownSection(readme, "## Fonte e rastreabilidade");
    expect(captured(
      readmeSource,
      /^- arquivo-fonte atual: `([^`]+)`;$/m,
      "README/arquivo-fonte atual",
    )).toBe(source.fileName);
    expect(captured(
      readmeSource,
      /^- SHA-256: `([a-f0-9]{64})`;$/m,
      "README/SHA-256",
    )).toBe(source.sha256);

    const statusSource = markdownSection(status, "## Fonte e medidas reproduzíveis");
    expect(captured(
      statusSource,
      /Fonte congelada:[\s\S]*?arquivo\s*\n`([^`]+)`, versão operacional/,
      "STATUS_ATUAL/arquivo congelado",
    )).toBe(source.fileName);
    expect(captured(
      statusSource,
      /indicada na capa, SHA-256\s*\n`([a-f0-9]{64})`\./,
      "STATUS_ATUAL/SHA-256 congelado",
    )).toBe(source.sha256);

    const learningSources = [...normalize(learningDesign).matchAll(
      /^- `([^`]+\.docx)`;$/gm,
    )];
    expect(learningSources[0]?.[1], "LEARNING_DESIGN/primeira fonte").toBe(source.fileName);
    const learningControl = markdownSection(
      learningDesign,
      "### Controle da fonte e status deste documento",
    );
    expect(captured(
      learningControl,
      /^- SHA-256 da fonte: `([a-f0-9]{64})`;$/m,
      "LEARNING_DESIGN/SHA-256 da fonte",
    )).toBe(source.sha256);

    expect(captured(
      labSources,
      /^\s*sourceDocument:\s*['"]([^'"]+)['"],$/m,
      "labSources/sourceDocument",
    )).toBe(source.fileName);
    expect(captured(
      labSources,
      /^\s*sourceSha256:\s*['"]([a-f0-9]{64})['"],$/m,
      "labSources/sourceSha256",
    )).toBe(source.sha256);

    const audiovisualSource = markdownSection(
      audiovisualPilot,
      "## Fontes oficiais complementares",
    );
    expect(captured(
      audiovisualSource,
      /O POP público usado pelo gate tem SHA-256\s*\n`([a-f0-9]{64})`\./,
      "AUDIOVISUAL_PILOT/SHA-256 corrente",
    )).toBe(source.sha256);
    expect(captured(
      mediaReadme,
      /a fonte operacional atual[^\n]*?SHA-256 `([a-f0-9]{64})`\./,
      "public\/media\/README/SHA-256 operacional",
    )).toBe(source.sha256);

    expect(status).toContain("barreira antimalware");
    expect(status).toContain("falha fechada");
    expect(status).not.toMatch(/não há OCR nem antimalware/i);
  });
});
