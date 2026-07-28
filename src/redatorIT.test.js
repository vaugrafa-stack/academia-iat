import { describe, expect, it } from 'vitest';
import {
  ESTRUTURA_IT,
  MINIMO_SECAO,
  montarIT,
  progressoIT,
} from './redatorIT.js';

describe('estrutura honesta da Informação Técnica', () => {
  it('preserva os 12 elementos do item 23.1 do POP', () => {
    expect(ESTRUTURA_IT).toHaveLength(12);
    expect(ESTRUTURA_IT.map((item) => item.n)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
    expect(ESTRUTURA_IT.map((item) => item.id)).toContain('identificacao_tecnica');
    expect(ESTRUTURA_IT.map((item) => item.id)).toContain('controle_qualidade');
  });

  it('trata o limite de caracteres somente como registro mínimo', () => {
    const rascunho = Object.fromEntries(
      ESTRUTURA_IT.map((item) => [item.id, 'x'.repeat(MINIMO_SECAO)]),
    );
    const progress = progressoIT(rascunho);

    expect(progress.feitas).toBe(12);
    expect(progress.total).toBe(12);
  });

  it('exporta todos os elementos com aviso de exercício didático', () => {
    const text = montarIT(
      { title: 'Caso sintético', type: 'PCH' },
      { identificacao: 'Registro de teste' },
    );

    expect(text).toContain('INFORMAÇÃO TÉCNICA · EXERCÍCIO DIDÁTICO');
    expect(text).toContain('6. IDENTIFICAÇÃO TÉCNICA DO EMPREENDIMENTO');
    expect(text).toContain('12. CONTROLE DE QUALIDADE E REVISÃO FINAL');
  });
});
