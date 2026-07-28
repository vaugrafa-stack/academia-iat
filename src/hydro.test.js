import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  PowerCalc,
  faixaDidaticaPorPotencia,
  turbinasCompativeisPorQueda,
} from './hydro.jsx';

describe('didática da calculadora hidrelétrica', () => {
  it('preserva as fronteiras de MCH, MGH e CGH antes de PCH e UHE', () => {
    expect(faixaDidaticaPorPotencia(0.075)?.sigla).toBe('MCH');
    expect(faixaDidaticaPorPotencia(0.075001)?.sigla).toBe('MGH');
    expect(faixaDidaticaPorPotencia(0.5)?.sigla).toBe('MGH');
    expect(faixaDidaticaPorPotencia(0.500001)?.sigla).toBe('CGH');
    expect(faixaDidaticaPorPotencia(5)?.sigla).toBe('CGH');
    expect(faixaDidaticaPorPotencia(5.000001)?.sigla).toBe('PCH');
    expect(faixaDidaticaPorPotencia(30)?.sigla).toBe('PCH');
    expect(faixaDidaticaPorPotencia(30.000001)?.sigla).toBe('UHE');
    expect(faixaDidaticaPorPotencia(Number.NaN)).toBeNull();
  });

  it('retorna todas as faixas de turbina compatíveis pela queda, inclusive sobreposições', () => {
    expect(turbinasCompativeisPorQueda(10)).toEqual(['Kaplan', 'Bulbo']);
    expect(turbinasCompativeisPorQueda(60)).toEqual(['Francis', 'Kaplan']);
    expect(turbinasCompativeisPorQueda(300)).toEqual(['Pelton', 'Francis']);
    expect(turbinasCompativeisPorQueda(Number.NaN)).toEqual([]);
  });

  it('declara no resultado que faixa e turbina não são decisões automáticas', () => {
    const html = renderToStaticMarkup(React.createElement(PowerCalc));

    expect(html).toContain('Faixa didática por potência (POP)');
    expect(html).toContain('não determina nem altera cadastro, registro ou ato setorial da ANEEL');
    expect(html).toContain('A vazão Q participa');
    expect(html).toContain('não é usada para escolher a máquina');
    expect(html).not.toContain('Classe pela potência');
    expect(html).not.toContain('Turbina indicada pela queda');
  });
});
