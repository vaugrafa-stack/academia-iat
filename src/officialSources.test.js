import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  resolveOfficialSource,
  sourceRegistryStats,
} from './officialSources.js';

const criticalReferences = [
  'INSTITUTO ÁGUA E TERRA. Instrução Normativa IAT nº 09, de 28 de abril de 2025.',
  'INSTITUTO ÁGUA E TERRA. Termo de Referência para elaboração do PACUERA, ano 2026.',
  'PARANÁ. Lei Estadual nº 22.252, de 12 de dezembro de 2024.',
  'PARANÁ. Decreto Estadual nº 9.541, de 10 de abril de 2025.',
  'BRASIL. Lei Federal nº 15.190, de 8 de agosto de 2025.',
];

describe('registro de fontes oficiais', () => {
  it('abre fonte oficial direta para as referências de maior risco', () => {
    for (const reference of criticalReferences) {
      const source = resolveOfficialSource(reference);
      expect(source?.kind, reference).toBe('direct');
      expect(source?.url, reference).toMatch(/^https:\/\//);
      expect(source?.checkedAt, reference).toBe('2026-07-27');
      expect(source?.humanReview, reference).toBe('pendente');
    }
  });

  it('nunca usa pesquisa Google como substituto de fonte oficial', () => {
    const references = [
      ...criticalReferences,
      'CONAMA. Resolução nº 279, de 27 de junho de 2001.',
      'INSTITUTO ÁGUA E TERRA. Instrução Normativa IAT nº 05/2026.',
      'AGÊNCIA NACIONAL DE ENERGIA ELÉTRICA. Ato setorial a confirmar.',
    ];
    for (const reference of references) {
      expect(resolveOfficialSource(reference)?.url).not.toMatch(/google\./i);
    }
  });

  it('distingue íntegra vinculada de índice oficial', () => {
    const references = [
      ...criticalReferences,
      'CONAMA. Resolução nº 279, de 27 de junho de 2001.',
    ];
    expect(sourceRegistryStats(references)).toEqual({
      direct: 5,
      index: 1,
      unmapped: 0,
    });
  });

  it('mapeia as 60 referências do POP sem desviar para buscador genérico', () => {
    const pop = JSON.parse(
      readFileSync(resolve(import.meta.dirname, 'data/pop-content.json'), 'utf8'),
    );
    const section = pop.sections.find(
      (item) => item.title === 'Referências normativas e técnicas',
    );
    const references = section.blockIds
      .map((id) => pop.blocks.find((block) => block.id === id)?.paragraph?.text)
      .filter(Boolean);
    const stats = sourceRegistryStats(references);

    expect(references).toHaveLength(60);
    expect(stats).toEqual({
      direct: 22,
      index: 38,
      unmapped: 0,
    });
    for (const reference of references) {
      expect(resolveOfficialSource(reference)?.url).not.toMatch(/google\./i);
    }
  });

  it('mantém os atos da ANEEL em páginas temáticas acessíveis sem simular vínculo direto', () => {
    const references = [
      'ANEEL. Resolução Normativa nº 875, de 10 de março de 2020.',
      'ANEEL. Resolução Normativa nº 1.064, de 2 de maio de 2023.',
    ];

    for (const reference of references) {
      const source = resolveOfficialSource(reference);
      expect(source?.kind, reference).toBe('index');
      expect(source?.url, reference).toMatch(/^https:\/\/www\.gov\.br\/aneel\//);
      expect(source?.url, reference).not.toMatch(/www2\.aneel|\.pdf$/i);
      expect(source?.humanReview, reference).toBe('pendente');
    }
  });
});
