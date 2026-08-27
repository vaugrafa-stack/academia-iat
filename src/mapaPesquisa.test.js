import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  classificarEntradaMapa,
  entradaContemIdentificador,
  limparCachePesquisaMapaParaTestes,
  localizarResultadoMapa,
  normalizarBuscaMapa,
  pesquisarMapa,
  resultadosLocaisMapa,
} from './mapaPesquisa.js';

const dados = {
  usinas: [
    {
      nome: 'Cantú 2', tipo: 'PCH', mw: 19.81, fase: 'Operação',
      mun: 'Laranjal - PR, Nova Cantu - PR', bacia: 'Paraná, Paranapanema',
      baciaPR: 'Piquiri', x: 350, y: 320,
    },
    {
      nome: 'São João', tipo: 'CGH', mw: 2, fase: 'Operação',
      mun: 'Ponta Grossa - PR', bacia: 'Tibagi', baciaPR: 'Tibagi', x: 610, y: 240,
    },
    {
      nome: 'Santa Clara', tipo: 'PCH', mw: 8, fase: 'Operação',
      mun: 'Ponta Grossa - PR', bacia: 'Tibagi', baciaPR: 'Tibagi', x: 620, y: 250,
    },
  ],
  bacias: [
    { nome: 'Piquiri', area: 24000, usinas: 1 },
    { nome: 'Tibagi', area: 24937, usinas: 2 },
  ],
};

afterEach(() => {
  limparCachePesquisaMapaParaTestes();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('classificação da busca única do mapa', () => {
  it('mantém a precedência dos três formatos de coordenada', () => {
    expect(classificarEntradaMapa('-25.4284 -49.2733')).toMatchObject({ tipo: 'coordenada' });
    expect(classificarEntradaMapa(`25° 25' 42,24" S, 49° 16' 23,88" O`)).toMatchObject({ tipo: 'coordenada' });
    expect(classificarEntradaMapa('22 673648.49 7186491.01')).toMatchObject({ tipo: 'coordenada' });
    expect(classificarEntradaMapa('Cantú 2')).toMatchObject({ tipo: 'texto', normalizada: 'cantu 2' });
  });

  it('bloqueia identificadores sem confundir o número do empreendimento', () => {
    for (const identificador of [
      '18.945.221-4', '18 945 221 4', '18.945.221/4', '189452214',
      '529.982.247-25', '52998224725', '11.222.333/0001-81', '11222333000181',
      '(41) 99999-8888', '41 99999-8888', '41999998888', '80530-900', '80530900',
      'tecnico@example.org',
    ]) expect(entradaContemIdentificador(identificador), identificador).toBe(true);
    expect(entradaContemIdentificador('Cantú 2')).toBe(false);
    expect(classificarEntradaMapa('18.945.221-4')).toMatchObject({ tipo: 'protegida' });
    expect(classificarEntradaMapa('52998224725')).toMatchObject({ tipo: 'protegida' });
  });

  it('informa quando ha mais resultados do que a lista mostra', async () => {
    const muitos = {
      bacias: [],
      usinas: Array.from({ length: 45 }, (_, indice) => ({
        nome: `Parque hídrico ${String(indice + 1).padStart(2, '0')}`,
        tipo: 'CGH', mw: 1, mun: 'Palmas - PR', bacia: 'Iguaçu', baciaPR: 'Iguaçu',
        x: indice + 1, y: indice + 1,
      })),
    };
    const resposta = await pesquisarMapa({
      dados: muitos,
      termo: 'parque',
      incluirOficiais: false,
      limite: 5,
    });
    expect(resposta.resultados).toHaveLength(5);
    expect(resposta.total).toBe(45);
    expect(resposta.limitado).toBe(true);
  });

  it('normaliza acentos e separa empreendimento, município, bacia, APP e zona', () => {
    expect(normalizarBuscaMapa('  ÁREA de Proteção ')).toBe('area de protecao');

    const empreendimento = resultadosLocaisMapa({ dados, termo: 'cantu 2' });
    expect(empreendimento[0]).toMatchObject({ tipo: 'empreendimento', titulo: 'Cantú 2' });

    const municipio = resultadosLocaisMapa({ dados, termo: 'Ponta Grossa' });
    expect(municipio.some((item) => item.tipo === 'municipio' && item.titulo === 'Ponta Grossa')).toBe(true);
    expect(municipio.filter((item) => item.tipo === 'empreendimento')).toHaveLength(2);

    const bacia = resultadosLocaisMapa({ dados, termo: 'bacia tibagi' });
    expect(bacia.some((item) => item.tipo === 'bacia' && item.titulo === 'Tibagi')).toBe(true);

    const app = resultadosLocaisMapa({ dados, termo: 'APP' });
    expect(app.some((item) => item.titulo === 'Áreas de Preservação Permanente hídricas')).toBe(true);

    const zona = resultadosLocaisMapa({ dados, termo: 'zona de proteção' });
    expect(zona.some((item) => item.titulo === 'Zoneamento de Planos de Manejo')).toBe(true);
  });
});

describe('índices oficiais sem envio do texto digitado', () => {
  it('pagina um índice oficial e encontra registros além do primeiro limite', async () => {
    const fetchMock = vi.fn().mockImplementation(async (entrada) => {
      const url = new URL(String(entrada));
      const caminho = decodeURIComponent(url.pathname);
      if (caminho.includes('iap_gerad_energ_hidreletricas/MapServer/0/query')) {
        const deslocamento = Number(url.searchParams.get('resultOffset'));
        const features = deslocamento === 0
          ? Array.from({ length: 1000 }, (_, indice) => ({
              attributes: {
                nome: `Usina índice ${indice}`,
                tipo: 'CGH',
                situação: 'Operação',
                município: 'Município de teste',
                rio: 'Rio teste',
                bacia: 'Bacia teste',
              },
              geometry: { x: -5500000 + indice, y: -2900000 },
            }))
          : [{
              attributes: {
                nome: 'Usina além do limite',
                tipo: 'PCH',
                situação: 'Operação',
                município: 'Palmas',
                rio: 'Rio limite',
                bacia: 'Iguaçu',
              },
              geometry: { x: -5700000, y: -3000000 },
            }];
        return {
          ok: true,
          json: async () => ({
            features,
            exceededTransferLimit: deslocamento === 0,
          }),
        };
      }
      return {
        ok: true,
        json: async () => (caminho.endsWith('/MapServer')
          ? { layers: [] }
          : caminho.endsWith('/rest/services')
            ? { services: [] }
            : { features: [] }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const resposta = await pesquisarMapa({
      dados,
      termo: 'além do limite',
      incluirOficiais: true,
      fetchImpl: fetchMock,
    });

    expect(resposta.resultados).toContainEqual(expect.objectContaining({
      tipo: 'empreendimento-geopr',
      titulo: 'Usina além do limite',
    }));
    const paginas = fetchMock.mock.calls
      .map(([entrada]) => new URL(String(entrada)))
      .filter((url) => decodeURIComponent(url.pathname)
        .includes('iap_gerad_energ_hidreletricas/MapServer/0/query'));
    expect(paginas.map((url) => url.searchParams.get('resultOffset'))).toEqual(['0', '1000']);
    expect(paginas.every((url) => url.searchParams.get('orderByFields') === 'objectid ASC')).toBe(true);
    expect(paginas.every((url) => url.searchParams.get('where') === '1=1')).toBe(true);
    expect(paginas.map(String).join('\n')).not.toContain('al%C3%A9m');
  });

  it('usa somente consultas fixas e preserva os resultados locais quando a rede falha', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);

    const resposta = await pesquisarMapa({
      dados,
      termo: 'Cantú 2',
      incluirOficiais: true,
      fetchImpl: fetchMock,
    });

    expect(resposta.resultados[0]).toMatchObject({ titulo: 'Cantú 2' });
    expect(resposta.oficial).toBe('parcial');
    const trafego = fetchMock.mock.calls.map(([url]) => decodeURIComponent(String(url))).join('\n');
    expect(trafego).not.toContain('Cantú 2');
    expect(trafego).not.toContain('cantu 2');
  });

  it('nem inicia consulta oficial quando a entrada parece protocolo ou CPF', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const resposta = await pesquisarMapa({
      dados,
      termo: '18.945.221-4 529.982.247-25',
      incluirOficiais: true,
      fetchImpl: fetchMock,
    });
    expect(resposta.classificacao.tipo).toBe('protegida');
    expect(resposta.resultados).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('nao torna pesquisavel um campo identificavel inesperado do servidor', async () => {
    const fetchMock = vi.fn().mockImplementation(async (entrada) => {
      const url = new URL(String(entrada));
      const caminho = decodeURIComponent(url.pathname);
      if (caminho.includes('iap_gerad_energ_hidreletricas/MapServer/0/query')) {
        return {
          ok: true,
          json: async () => ({
            features: [{
              attributes: {
                nome: 'Usina segura',
                tipo: 'CGH',
                situação: 'Operação',
                município: 'Palmas',
                rio: 'Rio seguro',
                bacia: 'Iguaçu',
                NM_REQUERENTE: 'Pessoa Exclusiva',
                protocolo: '18.945.221-4',
              },
              geometry: { x: -5700000, y: -3000000 },
            }],
          }),
        };
      }
      return {
        ok: true,
        json: async () => (caminho.endsWith('/MapServer') ? { layers: [] }
          : caminho.endsWith('/rest/services') ? { services: [] } : { features: [] }),
      };
    });

    const identificavel = await pesquisarMapa({
      dados,
      termo: 'Pessoa Exclusiva',
      incluirOficiais: true,
      fetchImpl: fetchMock,
    });
    expect(identificavel.resultados).toEqual([]);

    const permitido = await pesquisarMapa({
      dados,
      termo: 'Usina segura',
      incluirOficiais: true,
      fetchImpl: fetchMock,
    });
    const usina = permitido.resultados.find((item) => item.titulo === 'Usina segura');
    expect(usina).toBeTruthy();
    expect(usina.achado.valores.map(({ chave }) => chave)).not.toContain('NM_REQUERENTE');
    expect(usina.achado.valores.map(({ chave }) => chave)).not.toContain('protocolo');
  });

  it('refaz um indice parcial depois do prazo e incorpora a fonte recuperada', async () => {
    const agora = vi.spyOn(Date, 'now').mockReturnValue(1000);
    let tentativasFederais = 0;
    const fetchMock = vi.fn().mockImplementation(async (entrada) => {
      const url = new URL(String(entrada));
      const caminho = decodeURIComponent(url.pathname);
      if (caminho.includes('uc_federal_cnuc_mma/MapServer/0/query')) {
        tentativasFederais += 1;
        if (tentativasFederais === 1) throw new Error('indisponível');
        return {
          ok: true,
          json: async () => ({
            features: [{
              attributes: {
                nome_uc: 'Reserva recuperada',
                municipio: 'Guaraqueçaba',
                esfera: 'Federal',
                grupo: 'Proteção integral',
                categoria: 'Reserva biológica',
              },
            }],
          }),
        };
      }
      return {
        ok: true,
        json: async () => (caminho.endsWith('/MapServer') ? { layers: [] }
          : caminho.endsWith('/rest/services') ? { services: [] } : { features: [] }),
      };
    });

    const primeira = await pesquisarMapa({
      dados,
      termo: 'Reserva recuperada',
      incluirOficiais: true,
      fetchImpl: fetchMock,
    });
    expect(primeira.resultados).toEqual([]);
    expect(primeira.oficial).toBe('parcial');

    agora.mockReturnValue(47000);
    const segunda = await pesquisarMapa({
      dados,
      termo: 'Reserva recuperada',
      incluirOficiais: true,
      fetchImpl: fetchMock,
    });
    expect(segunda.resultados).toContainEqual(expect.objectContaining({
      tipo: 'area-protegida',
      titulo: 'Reserva recuperada',
    }));
    expect(tentativasFederais).toBe(2);
  });

  it('resolve uma extensão oficial apenas depois da escolha', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        extent: {
          xmin: -5500000,
          ymin: -2960000,
          xmax: -5470000,
          ymax: -2920000,
          spatialReference: { wkid: 102100, latestWkid: 3857 },
        },
      }),
    });
    const resultado = resultadosLocaisMapa({ dados, termo: 'Ponta Grossa' })
      .find((item) => item.tipo === 'municipio');
    const localizado = await localizarResultadoMapa(resultado, { fetchImpl: fetchMock });
    expect(localizado.pontoMercator).toEqual({ x: -5485000, y: -2940000 });
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('where'))
      .toBe("UPPER(nome)='PONTA GROSSA'");
  });

  it('rejeita uma extensão devolvida em um sistema de referência incompatível', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        extent: {
          xmin: 500000,
          ymin: 7100000,
          xmax: 510000,
          ymax: 7110000,
          spatialReference: { wkid: 31982 },
        },
      }),
    });
    const resultado = resultadosLocaisMapa({ dados, termo: 'Ponta Grossa' })
      .find((item) => item.tipo === 'municipio');
    await expect(localizarResultadoMapa(resultado, { fetchImpl: fetchMock })).resolves.toBeNull();
  });
});
