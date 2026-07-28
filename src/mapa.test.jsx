// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import MapaParana, { faixaDidaticaDe } from './mapa.jsx';

const dados = {
  largura: 1000,
  altura: 620,
  bacias: [
    { nome: 'Bacia A', area: 100, usinas: 1, d: 'M0 0 H500 V620 H0 Z' },
    { nome: 'Bacia B', area: 200, usinas: 1, d: 'M500 0 H1000 V620 H500 Z' },
  ],
  usinas: [
    {
      nome: 'Usina pequena',
      tipo: 'CGH',
      mw: 0.4,
      fase: 'Operação',
      mun: 'Município A',
      bacia: 'Sub-bacia A',
      baciaPR: 'Bacia A',
      x: 100,
      y: 100,
    },
    {
      nome: 'Usina maior',
      tipo: 'PCH',
      mw: 10,
      fase: 'Operação',
      mun: 'Município B',
      bacia: 'Sub-bacia B',
      baciaPR: 'Bacia B',
      x: 700,
      y: 300,
    },
  ],
  fontes: ['Fonte pública de teste'],
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('didática e acesso por teclado no mapa', () => {
  it('distingue a faixa didática do tipo existente no registro', () => {
    expect(faixaDidaticaDe(0.075)?.sigla).toBe('MCH');
    expect(faixaDidaticaDe(0.5)?.sigla).toBe('MGH');
    expect(faixaDidaticaDe(5)?.sigla).toBe('CGH');
    expect(faixaDidaticaDe(30)?.sigla).toBe('PCH');
    expect(faixaDidaticaDe(31)?.sigla).toBe('UHE');
  });

  it('oferece uma lista nativa de bacias e filtra a relação ao selecioná-la', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={dados} />);
    });

    const select = host.querySelector('#mp-bacia-select');
    expect(select).not.toBeNull();
    expect(select.labels[0]?.textContent).toContain('Filtrar usinas por bacia hidrográfica');
    expect([...select.options].map((option) => option.textContent)).toEqual([
      'Todas as bacias hidrográficas',
      'Bacia A',
      'Bacia B',
    ]);

    await act(async () => {
      select.value = 'Bacia B';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(host.querySelector('.mp-lista-cab')?.textContent).toContain('1 de 2 em exibição · bacia Bacia B');
    expect(host.querySelector('.mp-lista')?.textContent).toContain('Usina maior');
    expect(host.querySelector('.mp-lista')?.textContent).not.toContain('Usina pequena');

    await act(async () => root.unmount());
  });

  it('explica que registro ANEEL e faixa didática podem divergir', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={dados} />);
    });

    expect(host.textContent).toContain('reproduzem o tipo do registro consultado');
    expect(host.textContent).toContain('uma divergência exige conferência oficial');
    expect(host.textContent).toContain('podem divergir');

    await act(async () => root.unmount());
  });
});
