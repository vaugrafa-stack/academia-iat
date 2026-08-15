import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildNormativeLedger,
  HYDRO_AUTHORITY_AXES,
  resolveOfficialSource,
  sourceRegistryStats,
} from './officialSources.js';

const requiredReferences = [
  'INSTITUTO ÁGUA E TERRA. Instrução Normativa IAT nº 09, de 28 de abril de 2025.',
  'INSTITUTO ÁGUA E TERRA. Termo de Referência para elaboração do PACUERA, ano 2026.',
  'PARANÁ. Lei Estadual nº 22.252, de 12 de dezembro de 2024.',
  'PARANÁ. Decreto Estadual nº 9.541, de 10 de abril de 2025.',
  'BRASIL. Lei Federal nº 15.190, de 8 de agosto de 2025.',
];

describe('registro de fontes oficiais', () => {
  it('abre fonte oficial direta para as referências de maior risco', () => {
    for (const reference of requiredReferences) {
      const source = resolveOfficialSource(reference);
      expect(source?.kind, reference).toBe('direct');
      expect(source?.url, reference).toMatch(/^https:\/\//);
      expect(source?.checkedAt, reference).toBe('2026-07-27');
      expect(source?.humanReview, reference).toBe('pendente');
    }
  });

  it('nunca usa pesquisa Google como substituto de fonte oficial', () => {
    const references = [
      ...requiredReferences,
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
      ...requiredReferences,
      'CONAMA. Resolução nº 279, de 27 de junho de 2001.',
    ];
    expect(sourceRegistryStats(references)).toEqual({
      direct: 5,
      index: 1,
      unmapped: 0,
    });
  });

  it('mapeia as 66 referências do POP sem desviar para buscador genérico', () => {
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

    expect(references).toHaveLength(66);
    // Eram 60 na minuta v1.7. A v1.9 acrescentou seis referencias, todas do
    // Diagnostico Climatico: PNMC federal, politica estadual do clima e seu
    // decreto, a Portaria IAT no 42/2022 e o Greenhouse Gas Protocol.
    expect(stats).toEqual({
      direct: 22,
      index: 44,
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

  it('gera ledger completo e explícito para as 66 referências do POP', () => {
    const pop = JSON.parse(
      readFileSync(resolve(import.meta.dirname, 'data/pop-content.json'), 'utf8'),
    );
    const section = pop.sections.find(
      (item) => item.title === 'Referências normativas e técnicas',
    );
    const references = section.blockIds
      .map((id) => pop.blocks.find((block) => block.id === id)?.paragraph?.text)
      .filter(Boolean);
    const ledger = buildNormativeLedger(references);
    const officialHosts = [
      /(^|\.)gov\.br$/,
      /(^|\.)pr\.gov\.br$/,
      /(^|\.)iat\.pr\.gov\.br$/,
      /(^|\.)legislacao\.pr\.gov\.br$/,
      /(^|\.)aneel\.gov\.br$/,
      /(^|\.)mma\.gov\.br$/,
      /(^|\.)abntcatalogo\.com\.br$/,
      // A lista já admitia entidade normalizadora privada com a ABNT. O mesmo
      // critério vale para o Greenhouse Gas Protocol, que a v1.9 passou a citar
      // no Diagnóstico Climático: o host é o do próprio publicador do padrão,
      // porque não existe publicação oficial brasileira dele para apontar.
      /(^|\.)ghgprotocol\.org$/,
    ];

    expect(ledger).toHaveLength(66);
    for (const entry of ledger) {
      expect(entry.authorityCode, entry.reference).not.toBe('nao-identificada');
      expect(entry.authority, entry.reference).toBeTruthy();
      expect(entry.act, entry.reference).toBeTruthy();
      expect(entry.scope, entry.reference).toBeTruthy();
      expect(entry.consultedAt, entry.reference).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.officialUrl, entry.reference).toMatch(/^https:\/\//);
      if (entry.linkKind === 'direct') {
        expect(entry.directOfficialUrl, entry.reference).toBe(entry.officialUrl);
        expect(entry.officialIndexUrl, entry.reference).toBeNull();
      } else {
        expect(entry.directOfficialUrl, entry.reference).toBeNull();
        expect(entry.officialIndexUrl, entry.reference).toBe(entry.officialUrl);
      }
      expect(
        officialHosts.some((pattern) => pattern.test(new URL(entry.officialUrl).hostname)),
        entry.officialUrl,
      ).toBe(true);
      expect([
        'fonte primária localizada',
        'índice oficial localizado',
      ]).toContain(entry.epistemicStatus);
      expect(entry.humanReview).toBe('pendente');
      expect(entry.epistemicStatus).not.toMatch(/validada|vigente|evidência/i);
      expect(entry.temporalStatus).toBeTruthy();
    }
  });

  it('separa as afirmações decisivas por autoridade, escopo e fonte oficial direta', () => {
    expect(HYDRO_AUTHORITY_AXES.map((axis) => axis.id)).toEqual([
      'iat-ambiental',
      'aneel-setorial',
      'gestao-hidrica',
    ]);

    for (const axis of HYDRO_AUTHORITY_AXES) {
      expect(axis.authority, axis.id).toBeTruthy();
      expect(axis.act, axis.id).toBeTruthy();
      expect(axis.scope, axis.id).toBeTruthy();
      expect(axis.checkedAt, axis.id).toBe('2026-08-10');
      expect(axis.officialUrl, axis.id).toMatch(/^https:\/\//);
      expect(axis.supportingUrl, axis.id).toMatch(/^https:\/\//);
      expect(axis.epistemicStatus, axis.id).toBe('fonte primária localizada');
      expect(axis.humanReview, axis.id).toBe('pendente');
      expect(axis.temporalStatus, axis.id).toBe('vigência-e-aplicação-a-confirmar');
      expect(axis.limitation, axis.id).toMatch(/não substitui/i);
    }

    const iat = HYDRO_AUTHORITY_AXES.find((axis) => axis.id === 'iat-ambiental');
    const aneel = HYDRO_AUTHORITY_AXES.find((axis) => axis.id === 'aneel-setorial');
    expect(iat.criteria.join(' ')).toContain('reservatório de até 3 km²');
    expect(aneel.act).toContain('1.070/2023');
    expect(aneel.officialUrl).toBe('https://www2.aneel.gov.br/cedoc/ren2020875.pdf');
    expect(aneel.amendingAct).toContain('1.070/2023');
    expect(aneel.amendingUrl).toBe('https://www2.aneel.gov.br/cedoc/ren20231070.pdf');
    expect(aneel.criteria.join(' ')).toContain('não adota limite de área do reservatório');
    expect(aneel.criteria.join(' ')).not.toContain('13 km²');
    expect(aneel.sourceAlert).toContain('15/05/2025');
    expect(aneel.sourceAlert).toContain('13 km²');
    expect(aneel.sourceAlert).toContain('20/02/2026');
    expect(aneel.divergentUrl).toBe('https://www.gov.br/aneel/pt-br/assuntos/geracao/outorgas');

    const [iatEntry, aneelEntry, waterEntry] = buildNormativeLedger([
      'INSTITUTO ÁGUA E TERRA. Instrução Normativa IAT nº 09, de 28 de abril de 2025. Licenciamento ambiental de unidades de geração de energia elétrica a partir de potencial hidráulico.',
      'AGÊNCIA NACIONAL DE ENERGIA ELÉTRICA. Resolução Normativa nº 875, de 10 de março de 2020.',
      'BRASIL. Lei Federal nº 9.433, de 8 de janeiro de 1997. Política Nacional de Recursos Hídricos.',
    ]);
    expect(iatEntry.scope).toBe('licenciamento e gestão ambiental estadual');
    expect(aneelEntry.scope).toBe('regulação e outorga do setor elétrico');
    expect(waterEntry.scope).toBe('gestão de recursos hídricos');
  });
});
