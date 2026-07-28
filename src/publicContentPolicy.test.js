import { describe, expect, it } from 'vitest';
import source from './data/pop-content.json';
import publicContent from './data/pop-public-content.json';

const forbidden = /\bIA\b|intelig[êe]ncia artificial|artificial intelligence|\b(?:ChatGPT|GPT(?:-\d+)?|LLM)\b|(?:modelos? de linguagem|large language models?|machine learning|aprendizado de máquina)|(?:revisão|validação|autoria|aprovação|conferência|avaliação)(?:\s+técnica)?\s+humana/iu;

describe('política editorial da apresentação pública', () => {
  it('preserva a identidade da fonte e remove os termos da superfície publicada', () => {
    expect(publicContent.source).toEqual(source.source);
    expect(JSON.stringify(publicContent)).not.toMatch(forbidden);
    expect(publicContent.publicPresentation).toMatchObject({
      policyVersion: 1,
      sourceContentPreservedSeparately: true,
      omittedSourceRows: 2,
      omittedSourceParagraphNodes: 6,
      renamedSectionIds: ['pop-section-072'],
    });
    expect(publicContent.stats).toMatchObject({
      tableParagraphCount: 2634,
      allDocumentParagraphNodes: 3333,
      searchableParagraphNodes: 3333,
      sourceParagraphNodeCount: 3359,
    });
  });

  it('mantém a seção de participação e complementações sem as duas linhas omitidas', () => {
    const sourceSection = source.sections.find((item) => item.id === 'pop-section-072');
    const publicSection = publicContent.sections.find((item) => item.id === 'pop-section-072');
    const sourceTable = source.tables.find((table) =>
      table.rows.some((row) => /^Declaração sobre IA$/u.test(row.cells[0]?.text || '')),
    );
    const publicTable = publicContent.tables.find((table) => table.id === sourceTable.id);

    expect(publicSection.number).toBe(sourceSection.number);
    expect(publicSection.title).toBe('Participação social, complementações');
    expect(sourceTable.rows).toHaveLength(publicTable.rows.length + 2);
    expect(JSON.stringify(publicTable)).not.toMatch(forbidden);
  });

  it('preserva exatamente campos não alcançados pela política editorial', () => {
    expect(publicContent.metadata.supplementalParts).toEqual(
      source.metadata.supplementalParts,
    );
    expect(publicContent.blocks[380].paragraph.text).toBe(
      source.blocks[380].paragraph.text,
    );
    expect(publicContent.tables[21].rows[2].cells[0].paragraphs[0].text).toBe(
      source.tables[21].rows[2].cells[0].paragraphs[0].text,
    );
  });
});
