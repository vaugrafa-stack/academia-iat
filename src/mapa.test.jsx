// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MapaParana, {
  carregarDadosMapa,
  faixaDidaticaDe,
  indiceCatalogoPorTecla,
  validarDadosMapa,
} from './mapa.jsx';
import { tilesParaVista } from './satelliteLayer.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function preencherCampo(campo, valor) {
  const definirValor = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  ).set;
  definirValor.call(campo, valor);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
}

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
  it('valida e compartilha uma única busca da base cartográfica', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dados,
    });
    vi.stubGlobal('fetch', fetchMock);

    expect(() => validarDadosMapa({})).toThrow(/dimensoes invalidas/);
    const [primeiro, segundo] = await Promise.all([
      carregarDadosMapa(),
      carregarDadosMapa(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(primeiro).toBe(dados);
    expect(segundo).toBe(dados);
  });

  it('distingue a faixa didática do tipo existente no registro', () => {
    expect(faixaDidaticaDe(0.075)?.sigla).toBe('MCH');
    expect(faixaDidaticaDe(0.5)?.sigla).toBe('MGH');
    expect(faixaDidaticaDe(5)?.sigla).toBe('CGH');
    expect(faixaDidaticaDe(30)?.sigla).toBe('PCH');
    expect(faixaDidaticaDe(31)?.sigla).toBe('UHE');
  });

  it('calcula a navegação do catálogo sem ultrapassar os limites', () => {
    expect(indiceCatalogoPorTecla('ArrowDown', 0, 147)).toBe(1);
    expect(indiceCatalogoPorTecla('ArrowUp', 0, 147)).toBe(0);
    expect(indiceCatalogoPorTecla('PageDown', 2, 147)).toBe(12);
    expect(indiceCatalogoPorTecla('PageUp', 5, 147)).toBe(0);
    expect(indiceCatalogoPorTecla('End', 0, 147)).toBe(146);
    expect(indiceCatalogoPorTecla('Home', 146, 147)).toBe(0);
    expect(indiceCatalogoPorTecla('Enter', 2, 147)).toBeNull();
    expect(indiceCatalogoPorTecla('ArrowDown', 0, 0)).toBeNull();
  });

  it('mantém somente uma usina no fluxo de Tab e permite navegar pelo teclado', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback) => {
      callback();
      return 1;
    });
    const muitasUsinas = Array.from({ length: 147 }, (_, indice) => ({
      ...dados.usinas[indice % dados.usinas.length],
      nome: `Usina ${String(indice + 1).padStart(3, '0')}`,
      x: indice + 1,
      y: indice + 1,
    }));
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={{ ...dados, usinas: muitasUsinas }} />);
    });

    const itens = [...host.querySelectorAll('.mp-item')];
    expect(itens).toHaveLength(147);
    expect(itens.filter((item) => item.tabIndex === 0)).toHaveLength(1);
    expect(itens.filter((item) => item.tabIndex === -1)).toHaveLength(146);
    expect(host.querySelector('#mp-lista-instrucoes')?.textContent).toContain('setas para cima e para baixo');

    itens[0].focus();
    await act(async () => {
      itens[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });

    expect(document.activeElement).toBe(itens[1]);
    expect(itens[0].tabIndex).toBe(-1);
    expect(itens[1].tabIndex).toBe(0);
    expect(itens[1].getAttribute('aria-current')).toBe('true');
    expect(host.querySelector('.mp-detalhe')?.textContent).toContain('Usina 002');

    await act(async () => {
      itens[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    });
    expect(document.activeElement).toBe(itens[146]);
    expect(itens[146].tabIndex).toBe(0);

    await act(async () => root.unmount());
  });

  it('preserva um único ponto de Tab após busca e seleção por mouse', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback) => {
      callback();
      return 1;
    });
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={dados} />);
    });

    const itensIniciais = [...host.querySelectorAll('.mp-item')];
    await act(async () => itensIniciais[1].click());
    expect(itensIniciais[1].tabIndex).toBe(0);
    expect(itensIniciais[1].getAttribute('aria-current')).toBe('true');

    const busca = host.querySelector('input[aria-label="Buscar usina, município ou bacia"]');
    await act(async () => {
      preencherCampo(busca, 'pequena');
    });

    const itensFiltrados = [...host.querySelectorAll('.mp-item')];
    expect(itensFiltrados).toHaveLength(1);
    expect(itensFiltrados[0].textContent).toContain('Usina pequena');
    expect(itensFiltrados[0].tabIndex).toBe(0);
    expect(host.querySelector('.mp-lista-cab')?.getAttribute('role')).toBe('status');

    await act(async () => {
      preencherCampo(busca, 'inexistente');
    });
    expect(host.querySelectorAll('.mp-item')).toHaveLength(0);
    expect(host.querySelector('.mp-vazio')?.textContent).toContain('Nenhuma usina');

    await act(async () => root.unmount());
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
