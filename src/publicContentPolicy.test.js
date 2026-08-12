import { describe, expect, it } from 'vitest';
import source from './data/pop-content.json';
import publicContent from './data/pop-public-content.json';

const forbidden = /\bIA\b|intelig[êe]ncia artificial|artificial intelligence|\b(?:ChatGPT|GPT(?:-\d+)?|LLM)\b|(?:modelos? de linguagem|large language models?|machine learning|aprendizado de máquina)|(?:revisão|validação|autoria|aprovação|conferência|avaliação)(?:\s+técnica)?\s+humana/iu;

describe('política editorial da apresentação pública', () => {
  it('preserva a identidade da fonte e remove os termos da superfície publicada', () => {
    expect(publicContent.source).toEqual(source.source);
    expect(JSON.stringify(publicContent)).not.toMatch(forbidden);
    // Os números eram os da minuta v1.7. Fixá-los aqui fazia o teste medir a
    // fonte, e a fonte muda: a v1.9 removeu do próprio POP as duas linhas de
    // política interna sobre IA e a menção no título da seção. O que precisa
    // continuar valendo é a relação entre a fonte e o público, e é isso que as
    // asserções abaixo verificam, qualquer que seja a versão do POP.
    expect(publicContent.publicPresentation).toMatchObject({
      policyVersion: 1,
      sourceContentPreservedSeparately: true,
    });
    const { omittedSourceRows, omittedSourceParagraphNodes, renamedSectionIds } =
      publicContent.publicPresentation;
    expect(omittedSourceRows).toBeGreaterThanOrEqual(0);
    // Omitir linha só reduz nós de parágrafo, e nunca aumenta.
    expect(omittedSourceParagraphNodes).toBeGreaterThanOrEqual(0);
    expect(omittedSourceRows === 0).toBe(omittedSourceParagraphNodes === 0);
    expect(publicContent.stats.tableParagraphCount).toBe(
      source.stats.tableParagraphCount - omittedSourceParagraphNodes,
    );
    expect(publicContent.stats.allDocumentParagraphNodes).toBe(
      publicContent.stats.bodyParagraphCount + publicContent.stats.tableParagraphCount,
    );
    expect(publicContent.stats.searchableParagraphNodes).toBe(
      publicContent.stats.allDocumentParagraphNodes,
    );
    // Só pode constar como renomeada a seção cujo título realmente mudou.
    for (const id of renamedSectionIds) {
      const antes = source.sections.find((item) => item.id === id);
      const depois = publicContent.sections.find((item) => item.id === id);
      expect(depois.title).not.toBe(antes.title);
    }
  });

  it('não deixa linha de política interna sobre IA chegar ao público', () => {
    const linhaInterna = /^(Declaração sobre|Limites de)\s+IA$/u;
    const naFonte = source.tables.flatMap((table) =>
      table.rows.filter((row) => linhaInterna.test(row.cells[0]?.text || '')),
    );
    const noPublico = publicContent.tables.flatMap((table) =>
      table.rows.filter((row) => linhaInterna.test(row.cells[0]?.text || '')),
    );

    // A v1.9 não traz mais essas linhas. O filtro continua sendo exercitado
    // porque a fonte pode voltar a trazê-las, e aí elas não podem passar.
    expect(noPublico).toEqual([]);
    expect(publicContent.publicPresentation.omittedSourceRows).toBe(naFonte.length);

    const sourceSection = source.sections.find((item) => item.id === 'pop-section-072');
    const publicSection = publicContent.sections.find((item) => item.id === 'pop-section-072');
    expect(publicSection.number).toBe(sourceSection.number);
    expect(publicSection.title).not.toMatch(forbidden);
    expect(JSON.stringify(publicSection)).not.toMatch(forbidden);
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
