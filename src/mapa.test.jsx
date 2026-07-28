// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MapaParana, { faixaDidaticaDe } from './mapa.jsx';
import { tilesParaVista } from './satelliteLayer.js';

const dados = {
  largura: 1000,
  altura: 620,
  tileProjection: {
    type: 'web-mercator',
    normalizedExtent: {
      xMin: 0.34,
      yMin: 0.56,
      xMax: 0.36,
      yMax: 0.58,
    },
  },
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: true,
  });
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

  it('calcula somente os mosaicos Web Mercator visíveis', () => {
    const grid = tilesParaVista({
      projection: dados.tileProjection,
      largura: dados.largura,
      altura: dados.altura,
      vista: { x: 0, y: 0, w: 1000, h: 620 },
      escala: 1,
    });

    expect(grid.level).toBe(8);
    expect(grid.tiles.length).toBeGreaterThan(0);
    expect(grid.tiles.length).toBeLessThan(80);
    expect(grid.tiles.every((tile) => tile.href.startsWith('https://services.arcgisonline.com/'))).toBe(true);
  });

  it('ativa a imagem online, mantém as camadas interativas e mostra a atribuição', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        copyrightText: 'Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
      }),
    }));
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={dados} />);
    });
    const satelliteButton = [...host.querySelectorAll('.mp-camadas button')]
      .find((button) => button.textContent === 'Satélite');

    await act(async () => satelliteButton.click());
    const images = host.querySelectorAll('.mp-satelite image');
    expect(images.length).toBeGreaterThan(0);
    expect(host.textContent).toContain('Carregando imagens de satélite');

    await act(async () => {
      images[0].dispatchEvent(new Event('load'));
      await Promise.resolve();
    });

    expect(host.querySelectorAll('.mp-bacias path')).toHaveLength(2);
    expect(host.querySelectorAll('.mp-usinas circle')).toHaveLength(2);
    expect(host.querySelector('.mp-satelite-credito')?.textContent).toContain('Esri, Vantor');

    await act(async () => {
      images[1].dispatchEvent(new Event('error'));
    });

    expect(host.textContent).toContain('Algumas imagens de satélite não carregaram');
    expect(host.querySelector('.mp-satelite-credito')).not.toBeNull();

    await act(async () => root.unmount());
  });

  it('limita a indisponibilidade à imagem de satélite quando não há conexão', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={dados} />);
    });
    const satelliteButton = [...host.querySelectorAll('.mp-camadas button')]
      .find((button) => button.textContent === 'Satélite');
    await act(async () => satelliteButton.click());

    expect(host.textContent).toContain('A imagem de satélite precisa de internet');
    expect(host.textContent).toContain('O mapa vetorial continua disponível');
    expect(host.querySelector('.mp-satelite')).toBeNull();
    expect(host.querySelectorAll('.mp-bacias path')).toHaveLength(2);
    expect(host.querySelectorAll('.mp-usinas circle')).toHaveLength(2);

    await act(async () => root.unmount());
  });
});
