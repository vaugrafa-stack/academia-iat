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
  vi.useRealTimers();
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

  it('filtra as camadas do GeoPR por módulo e avisa o que ficou ligado fora do filtro', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={dados} />);
    });

    const fichas = () => [...host.querySelectorAll('.gp-modulos-fichas button')];
    const camadasVisiveis = () => host.querySelectorAll('.gp-grupo li').length;
    const porRotulo = (inicio) => fichas().find((b) => b.textContent.trim().startsWith(inicio));

    // A contagem na ficha e o que diz se vale filtrar, entao ela precisa bater
    // com o que a lista mostra depois do clique. Se as duas divergirem, a ficha
    // vira enfeite e o numero passa a mentir.
    const todas = camadasVisiveis();
    expect(todas).toBeGreaterThan(0);
    expect(porRotulo('Todas')?.textContent.replace(/\s+/g, ' ')).toContain(String(todas));

    const m12 = porRotulo('M12');
    const quantasM12 = Number(m12.querySelector('b').textContent);
    await act(async () => {
      m12.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(camadasVisiveis()).toBe(quantasM12);
    expect(m12.getAttribute('aria-pressed')).toBe('true');

    // Ligar uma camada de outro modulo e voltar ao filtro nao pode deixa-la
    // desenhando no mapa sem aviso: uma camada invisivel na lista nao tem como
    // ser desligada dali.
    await act(async () => {
      porRotulo('Todas').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const forasteira = [...host.querySelectorAll('.gp-grupo button[aria-pressed]')]
      .find((b) => !/M12/.test(b.textContent));
    await act(async () => {
      forasteira.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await act(async () => {
      porRotulo('M12').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const aviso = host.querySelector('.gp-modulos .gp-nota');
    expect(aviso?.textContent).toMatch(/continuam? desenhando no mapa/i);
    const verTodas = host.querySelector('.gp-nota-acao');
    expect(verTodas).not.toBeNull();
    await act(async () => {
      verTodas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(camadasVisiveis()).toBe(todas);

    await act(async () => root.unmount());
  });

  it('ordena busca, mapa e camadas no DOM e recolhe a ajuda detalhada', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={dados} />);
    });

    const layout = host.querySelector('.mapa-layout');
    const pesquisa = layout?.querySelector(':scope > .mp-pesquisa-unificada');
    const mapa = layout?.querySelector(':scope > .mp-quadro');
    const painel = layout?.querySelector(':scope > .mp-painel');
    expect([...layout.children]).toEqual([pesquisa, mapa, painel]);

    const ajuda = host.querySelector('details.mp-como-usar');
    expect(ajuda?.open).toBe(false);
    expect(ajuda?.querySelector('summary')?.textContent).toBe('Como usar e interpretar este mapa');
    expect(ajuda?.textContent).toContain('Clique ou toque para fixar os detalhes');
    expect(host.querySelector('.mp-limite-camada')).toBeNull();
    expect(host.querySelector('.mp-map-stage > svg')?.getAttribute('aria-describedby'))
      .toContain('mp-ajuda-teclado');
    expect(host.querySelector('#mp-ajuda-teclado')?.classList.contains('sr-only')).toBe(false);
    expect(host.querySelector('#mp-ajuda-teclado')?.textContent).toMatch(/setas para deslocar/i);

    await act(async () => root.unmount());
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

    const busca = host.querySelector('input[aria-label="Buscar no mapa"]');
    await act(async () => {
      preencherCampo(busca, 'pequena');
      await Promise.resolve();
    });

    const opcao = [...host.querySelectorAll('[role="option"]')]
      .find((item) => item.textContent.includes('Usina pequena'));
    expect(opcao).toBeTruthy();
    await act(async () => opcao.click());

    const itensFiltrados = [...host.querySelectorAll('.mp-item')];
    expect(itensFiltrados).toHaveLength(1);
    expect(itensFiltrados[0].textContent).toContain('Usina pequena');
    expect(itensFiltrados[0].tabIndex).toBe(0);
    expect(host.querySelector('.mp-lista-cab')?.getAttribute('role')).toBe('status');

    await act(async () => {
      preencherCampo(busca, '');
      await Promise.resolve();
    });
    expect(host.querySelectorAll('.mp-item')).toHaveLength(2);
    expect(host.querySelector('.mp-lista-cab')?.textContent).not.toContain('· busca');

    await act(async () => {
      preencherCampo(busca, 'pequena');
      await Promise.resolve();
    });
    const opcaoNovamente = [...host.querySelectorAll('[role="option"]')]
      .find((item) => item.textContent.includes('Usina pequena'));
    await act(async () => opcaoNovamente.click());

    await act(async () => {
      preencherCampo(busca, 'inexistente');
      await Promise.resolve();
    });
    expect(host.querySelector('[role="status"]')?.textContent).toBeDefined();

    const limparBusca = host.querySelector('button[aria-label="Limpar busca no mapa"]');
    await act(async () => limparBusca.click());
    expect(host.querySelectorAll('.mp-item')).toHaveLength(2);
    expect(host.querySelector('.mp-lista-cab')?.textContent).not.toContain('· busca');

    await act(async () => root.unmount());
  });

  it('centraliza uma bacia por referência sem inventar uma coordenada precisa', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => root.render(<MapaParana dados={dados} />));
    const busca = host.querySelector('input[aria-label="Buscar no mapa"]');
    await act(async () => {
      preencherCampo(busca, 'Bacia B');
      await Promise.resolve();
    });
    const opcao = [...host.querySelectorAll('[role="option"]')]
      .find((item) => item.textContent.includes('Bacia hidrográfica')
        && item.textContent.includes('Bacia B'));
    expect(opcao).toBeTruthy();
    await act(async () => opcao.click());

    expect(host.querySelector('.mp-lista-cab')?.textContent).toContain('bacia Bacia B');
    expect(host.querySelector('.co-marca')).toBeNull();
    expect(host.textContent).toContain('Bacia localizada');

    await act(async () => root.unmount());
  });

  it('conclui a localização e mostra detalhes se Escape for pressionado durante a consulta', async () => {
    let concluirExtensao;
    vi.stubGlobal('fetch', vi.fn().mockImplementation((entrada) => {
      const url = new URL(String(entrada));
      if (url.searchParams.get('returnExtentOnly') === 'true') {
        return new Promise((resolve) => {
          concluirExtensao = () => resolve({
            ok: true,
            json: async () => ({
              extent: {
                xmin: -5500000,
                ymin: -2960000,
                xmax: -5470000,
                ymax: -2920000,
                spatialReference: { latestWkid: 3857 },
              },
            }),
          });
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ features: [], layers: [], services: [] }) });
    }));

    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<MapaParana dados={dados} />));

    const busca = host.querySelector('input[aria-label="Buscar no mapa"]');
    await act(async () => {
      preencherCampo(busca, 'Município A');
      await Promise.resolve();
    });
    const municipio = [...host.querySelectorAll('[role="option"]')]
      .find((item) => item.textContent.startsWith('MunicípioMunicípio A'));
    await act(async () => {
      municipio.click();
      await Promise.resolve();
    });
    expect(concluirExtensao).toBeTypeOf('function');
    expect(host.textContent).toContain('Localizando e preparando os detalhes');

    await act(async () => {
      busca.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      concluirExtensao();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(host.textContent).not.toContain('Localizando e preparando os detalhes');
    expect(host.textContent).toContain('Município filtrado e enquadrado pelo limite oficial');
    expect(host.querySelector('.gp-atributos')?.textContent).toContain('Detalhes da busca');
    expect(host.querySelector('.gp-atributos')?.textContent).toContain('Município A');
    expect(host.querySelector('.co-marca')).toBeNull();

    await act(async () => root.unmount());
  });

  it('ignora uma localização oficial antiga depois que a pessoa inicia outra busca', async () => {
    let concluirExtensao;
    const fetchMock = vi.fn().mockImplementation((entrada) => {
      const url = new URL(String(entrada));
      if (url.searchParams.get('returnExtentOnly') === 'true') {
        return new Promise((resolve) => {
          concluirExtensao = () => resolve({
            ok: true,
            json: async () => ({
              extent: {
                xmin: -5500000,
                ymin: -2960000,
                xmax: -5470000,
                ymax: -2920000,
                spatialReference: { latestWkid: 3857 },
              },
            }),
          });
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ features: [], layers: [], services: [] }) });
    });
    vi.stubGlobal('fetch', fetchMock);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<MapaParana dados={dados} />));

    const busca = host.querySelector('input[aria-label="Buscar no mapa"]');
    await act(async () => {
      preencherCampo(busca, 'Município A');
      await Promise.resolve();
    });
    const municipio = [...host.querySelectorAll('[role="option"]')]
      .find((item) => item.textContent.startsWith('MunicípioMunicípio A'));
    await act(async () => municipio.click());
    expect(concluirExtensao).toBeTypeOf('function');

    await act(async () => {
      preencherCampo(busca, 'Usina pequena');
      await Promise.resolve();
    });
    const usina = [...host.querySelectorAll('[role="option"]')]
      .find((item) => item.textContent.includes('Usina pequena')
        && item.textContent.includes('Empreendimento'));
    await act(async () => usina.click());
    expect(host.querySelector('.mp-detalhe')?.textContent).toContain('Usina pequena');

    await act(async () => {
      concluirExtensao();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(host.querySelector('.mp-detalhe')?.textContent).toContain('Usina pequena');
    expect(host.querySelector('.mp-lista-cab')?.textContent).toContain('busca Usina pequena');

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
    expect(host.querySelector('.mp-usinas')?.getAttribute('aria-hidden')).toBe('true');
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

  it('identifica camada GeoPR no hover e fixa detalhes seguros no clique', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async (alvo) => {
      const url = String(alvo);
      if (url.includes('/legend?')) {
        return {
          ok: true,
          json: async () => ({ layers: [] }),
        };
      }
      if (url.includes('/identify?')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [{
              layerName: 'Usinas de Geração de Energia Hidrelétrica - IAT',
              attributes: {
                OBJECTID: '318',
                PROTOCOLO: '18.945.221-4',
                NOME: 'Usina consultada',
                TIPO: 'CGH',
                'SITUAÇÃO': 'Em análise',
                MUNICIPIO: 'Município de exemplo',
                RIO: 'Rio de exemplo',
              },
            }],
          }),
        };
      }
      throw new Error(`Busca inesperada: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<MapaParana dados={dados} />);
    });
    const botao = [...host.querySelectorAll('.gp-grupo button')]
      .find((item) => item.textContent.includes('Usinas de geração hidrelétrica'));
    await act(async () => botao.click());
    expect(host.textContent).toContain('Passe o mouse sobre um símbolo do GeoPR');

    const svg = host.querySelector('.mp-map-stage>svg');
    Object.defineProperty(svg, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, top: 0, right: 1000, bottom: 620, width: 1000, height: 620 }),
    });
    const mover = new MouseEvent('pointermove', {
      bubbles: true,
      clientX: 400,
      clientY: 300,
    });
    Object.defineProperty(mover, 'pointerType', { value: 'mouse' });
    await act(async () => {
      svg.dispatchEvent(mover);
      vi.advanceTimersByTime(221);
      await Promise.resolve();
      await Promise.resolve();
    });

    const tooltip = host.querySelector('.gp-tooltip');
    expect(tooltip?.textContent).toContain('Usina consultada');
    expect(tooltip?.textContent).toContain('CGH');
    expect(tooltip?.textContent).toContain('Clique para fixar os detalhes');
    expect(tooltip?.textContent).not.toContain('18.945.221-4');
    expect(host.querySelector('.gp-atributos')).toBeNull();

    // Voltar a uma celula consultada reutiliza o resultado por alguns segundos,
    // em vez de repetir requests identicos no servidor publico (A -> B -> A).
    const moverOutroPonto = new MouseEvent('pointermove', {
      bubbles: true,
      clientX: 440,
      clientY: 300,
    });
    Object.defineProperty(moverOutroPonto, 'pointerType', { value: 'mouse' });
    await act(async () => {
      svg.dispatchEvent(moverOutroPonto);
      vi.advanceTimersByTime(221);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/identify?'))).toHaveLength(2);
    await act(async () => {
      svg.dispatchEvent(mover);
      await Promise.resolve();
    });
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/identify?'))).toHaveLength(2);

    // A mesma celula depois de zoom representa outra coordenada e nao pode
    // herdar o resultado armazenado antes de a imagem WMS estabilizar.
    await act(async () => host.querySelector('button[aria-label="Aproximar"]').click());
    await act(async () => {
      svg.dispatchEvent(mover);
      vi.advanceTimersByTime(221);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/identify?'))).toHaveLength(3);

    await act(async () => {
      svg.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        clientX: 400,
        clientY: 300,
      }));
      await Promise.resolve();
      await Promise.resolve();
    });

    const painel = host.querySelector('.gp-atributos');
    expect(painel?.textContent).toContain('Detalhes do ponto');
    expect(painel?.textContent).toContain('Usina consultada');
    expect(painel?.textContent).toContain('Município de exemplo');
    expect(painel?.textContent).toContain('Fonte declarada pelo serviço: IAT, 2021');
    expect(painel?.textContent).toContain('1 campo não exibido');
    expect(painel?.textContent).not.toContain('18.945.221-4');
    expect(host.querySelector('.gp-tooltip.fixada')?.textContent).toContain('Detalhes fixados no painel');

    const identify = fetchMock.mock.calls.filter(([url]) => String(url).includes('/identify?'));
    expect(identify).toHaveLength(4);
    await act(async () => host.querySelector('button[aria-label="Fechar detalhes do ponto"]').click());
    expect(document.activeElement).toBe(svg);
    expect(host.querySelector('.gp-atributos')).toBeNull();
    await act(async () => root.unmount());
  });

  it('nao consulta hover de toque e diferencia ponto vazio de erro do servico', async () => {
    vi.useFakeTimers();
    let modo = 'vazio';
    const fetchMock = vi.fn(async (alvo) => {
      const url = String(alvo);
      if (url.includes('/legend?')) return { ok: true, json: async () => ({ layers: [] }) };
      if (url.includes('/identify?')) {
        if (modo === 'erro') throw new TypeError('falha de rede');
        return { ok: true, status: 200, json: async () => ({ results: [] }) };
      }
      throw new Error(`Busca inesperada: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<MapaParana dados={dados} />));
    const botao = [...host.querySelectorAll('.gp-grupo button')]
      .find((item) => item.textContent.includes('Usinas de geração hidrelétrica'));
    await act(async () => botao.click());
    const svg = host.querySelector('.mp-map-stage>svg');
    Object.defineProperty(svg, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, top: 0, right: 1000, bottom: 620, width: 1000, height: 620 }),
    });

    const mouse = new MouseEvent('pointermove', { bubbles: true, clientX: 300, clientY: 200 });
    Object.defineProperty(mouse, 'pointerType', { value: 'mouse' });
    await act(async () => {
      svg.dispatchEvent(mouse);
      vi.advanceTimersByTime(221);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(host.querySelector('.gp-tooltip:not(.fixada)')?.textContent)
      .toContain('Nenhum objeto identificado');
    const antesDoToque = fetchMock.mock.calls.filter(([url]) => String(url).includes('/identify?')).length;

    const toque = new MouseEvent('pointermove', { bubbles: true, clientX: 300, clientY: 200 });
    Object.defineProperty(toque, 'pointerType', { value: 'touch' });
    await act(async () => svg.dispatchEvent(toque));
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/identify?'))).toHaveLength(antesDoToque);

    await act(async () => {
      svg.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 300, clientY: 200 }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(host.querySelector('.gp-atributos')?.textContent).toContain('Nenhum objeto foi identificado');
    expect(host.querySelector('.gp-tooltip.fixada')?.textContent).toContain('Nenhum objeto identificado');

    modo = 'erro';
    await act(async () => {
      svg.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 320, clientY: 220 }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(host.querySelector('.gp-atributos')?.textContent).toContain('serviço de atributos não respondeu');
    expect(host.querySelector('.gp-tooltip.fixada')?.textContent).toContain('Consulta indisponível');

    await act(async () => root.unmount());
  });

  it('encerra uma consulta GeoPR que nao responde em vez de carregar para sempre', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn(async (alvo, opcoes) => {
      const url = String(alvo);
      if (url.includes('/legend?')) return { ok: true, json: async () => ({ layers: [] }) };
      if (url.includes('/identify?')) {
        return new Promise((resolve, reject) => {
          opcoes.signal.addEventListener('abort', () => {
            const erro = new Error('consulta cancelada');
            erro.name = 'AbortError';
            reject(erro);
          });
        });
      }
      throw new Error(`Busca inesperada: ${url}`);
    }));
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<MapaParana dados={dados} />));
    const botao = [...host.querySelectorAll('.gp-grupo button')]
      .find((item) => item.textContent.includes('Usinas de geração hidrelétrica'));
    await act(async () => botao.click());
    const svg = host.querySelector('.mp-map-stage>svg');
    Object.defineProperty(svg, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, top: 0, right: 1000, bottom: 620, width: 1000, height: 620 }),
    });
    await act(async () => {
      svg.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 300, clientY: 200 }));
    });
    expect(host.querySelector('.gp-tooltip.fixada')?.textContent).toContain('Consultando o GeoPR');

    await act(async () => {
      vi.advanceTimersByTime(20_001);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(host.querySelector('.gp-tooltip.fixada')?.textContent).toContain('Consulta indisponível');
    expect(host.querySelector('.gp-atributos')?.textContent).toContain('serviço de atributos não respondeu');
    await act(async () => root.unmount());
  });
});
