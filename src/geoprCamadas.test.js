import { describe, expect, it } from 'vitest';
import {
  RAIO_MERCATOR,
  atributosLegiveis,
  caixaParaBBox,
  mercatorParaMapa,
  pontoParaMercator,
  urlDaImagem,
  urlDeAtributos,
  vistaParaCaixa,
} from './geoprCamadas.js';

// A mesma projecao gravada em src/data/mapa-parana.json. Se ela mudar la, estes
// numeros mudam aqui, e e proposital: o encaixe entre o desenho local e a
// imagem do GeoPR depende de os dois lerem o mesmo recorte.
const PROJECAO = {
  type: 'web-mercator',
  normalizedExtent: {
    xMin: 0.346527200518,
    yMin: 0.563924756684,
    xMax: 0.368193716148,
    yMax: 0.577357996374,
  },
};
const LARG = 1000;
const ALT = 620;

describe('vistaParaCaixa', () => {
  it('converte o mapa inteiro para a caixa do Parana em metros', () => {
    const caixa = vistaParaCaixa(PROJECAO, LARG, ALT, null);
    // Conferido contra a imagem WMS renderizada: com esta caixa o servidor
    // devolve o contorno do Parana encaixado na borda do quadro.
    expect(caixa.minX).toBeCloseTo(-6150425, 0);
    expect(caixa.minY).toBeCloseTo(-3100123, 0);
    expect(caixa.maxX).toBeCloseTo(-5282139, 0);
    expect(caixa.maxY).toBeCloseTo(-2561785.7, 0);
  });

  it('mantem o norte em cima: o topo da janela vira o maior valor de y', () => {
    // Este e o erro classico do Mercator. No SVG, y cresce para BAIXO; em
    // Mercator, para o NORTE. Trocar os dois espelha o mapa na vertical e o
    // resultado continua parecendo um mapa, so que de cabeca para baixo.
    const topo = vistaParaCaixa(PROJECAO, LARG, ALT, { x: 0, y: 0, w: LARG, h: ALT / 2 });
    const baixo = vistaParaCaixa(PROJECAO, LARG, ALT, { x: 0, y: ALT / 2, w: LARG, h: ALT / 2 });
    expect(topo.maxY).toBeGreaterThan(baixo.maxY);
    expect(topo.minY).toBeGreaterThan(baixo.minY);
  });

  it('a caixa acompanha o deslocamento da janela para leste', () => {
    const esquerda = vistaParaCaixa(PROJECAO, LARG, ALT, { x: 0, y: 0, w: 200, h: 124 });
    const direita = vistaParaCaixa(PROJECAO, LARG, ALT, { x: 800, y: 0, w: 200, h: 124 });
    expect(direita.minX).toBeGreaterThan(esquerda.minX);
  });

  it('aproximar produz caixa menor, e ela cabe dentro do mapa inteiro', () => {
    const inteiro = vistaParaCaixa(PROJECAO, LARG, ALT, null);
    const perto = vistaParaCaixa(PROJECAO, LARG, ALT, { x: 400, y: 240, w: 200, h: 124 });
    expect(perto.maxX - perto.minX).toBeLessThan(inteiro.maxX - inteiro.minX);
    expect(perto.minX).toBeGreaterThanOrEqual(inteiro.minX);
    expect(perto.maxY).toBeLessThanOrEqual(inteiro.maxY);
  });

  it('recusa projecao, dimensao ou janela invalida em vez de gerar caixa torta', () => {
    expect(vistaParaCaixa(null, LARG, ALT, null)).toBeNull();
    expect(vistaParaCaixa({ type: 'outra' }, LARG, ALT, null)).toBeNull();
    expect(vistaParaCaixa(PROJECAO, 0, ALT, null)).toBeNull();
    expect(vistaParaCaixa(PROJECAO, LARG, ALT, { x: 0, y: 0, w: 0, h: 10 })).toBeNull();
    const invertida = {
      type: 'web-mercator',
      normalizedExtent: { xMin: 0.5, yMin: 0.5, xMax: 0.4, yMax: 0.6 },
    };
    expect(vistaParaCaixa(invertida, LARG, ALT, null)).toBeNull();
  });

  it('nao extrapola o mundo mesmo com a janela inteira', () => {
    const caixa = vistaParaCaixa(PROJECAO, LARG, ALT, null);
    for (const valor of [caixa.minX, caixa.minY, caixa.maxX, caixa.maxY]) {
      expect(Math.abs(valor)).toBeLessThanOrEqual(RAIO_MERCATOR);
    }
  });
});

describe('mercatorParaMapa', () => {
  it('desfaz exatamente o que pontoParaMercator fez', () => {
    for (const [x, y] of [[0, 0], [500, 310], [999, 619], [123.4, 456.7]]) {
      const m = pontoParaMercator(PROJECAO, LARG, ALT, x, y);
      const volta = mercatorParaMapa(PROJECAO, LARG, ALT, m.x, m.y);
      expect(volta.x).toBeCloseTo(x, 6);
      expect(volta.y).toBeCloseTo(y, 6);
    }
  });

  it('recusa projecao ou ponto invalido', () => {
    expect(mercatorParaMapa(null, LARG, ALT, 0, 0)).toBeNull();
    expect(mercatorParaMapa(PROJECAO, LARG, ALT, NaN, 0)).toBeNull();
    expect(mercatorParaMapa(PROJECAO, 0, ALT, 0, 0)).toBeNull();
  });
});

describe('caixaParaBBox', () => {
  it('escreve na ordem leste, sul, leste, norte que o EPSG:3857 usa', () => {
    const bbox = caixaParaBBox({ minX: -1, minY: -2, maxX: 3, maxY: 4 });
    expect(bbox).toBe('-1.0,-2.0,3.0,4.0');
  });

  it('devolve nulo sem caixa', () => {
    expect(caixaParaBBox(null)).toBeNull();
  });
});

describe('urlDaImagem', () => {
  const camada = { caminho: '00_PUBLICACOES/grandes_bacias_50k', camadas: '0' };
  const bbox = '-6150425.0,-3100123.0,-5282139.0,-2561785.7';

  it('monta um GetMap de WMS 1.3.0 transparente em Web Mercator', () => {
    const url = new URL(urlDaImagem(camada, { bbox, larguraPx: 800, alturaPx: 496 }));
    expect(url.origin).toBe('https://geopr.iat.pr.gov.br');
    expect(url.pathname).toBe(
      '/server/services/00_PUBLICACOES/grandes_bacias_50k/MapServer/WMSServer',
    );
    expect(url.searchParams.get('request')).toBe('GetMap');
    expect(url.searchParams.get('version')).toBe('1.3.0');
    expect(url.searchParams.get('crs')).toBe('EPSG:3857');
    expect(url.searchParams.get('bbox')).toBe(bbox);
    expect(url.searchParams.get('transparent')).toBe('true');
    expect(url.searchParams.get('width')).toBe('800');
    expect(url.searchParams.get('height')).toBe('496');
  });

  it('nao usa EPSG:4326, cuja ordem de eixos e latitude e longitude', () => {
    // Em WMS 1.3.0 o 4326 inverte os eixos. Pedir 4326 com a caixa escrita em
    // leste e norte devolve imagem de outro lugar do planeta, sem erro nenhum.
    const url = urlDaImagem(camada, { bbox, larguraPx: 800, alturaPx: 496 });
    expect(url).not.toContain('4326');
  });

  it('arredonda a dimensao, porque o servidor recusa pixel fracionario', () => {
    const url = new URL(urlDaImagem(camada, { bbox, larguraPx: 800.4, alturaPx: 496.7 }));
    expect(url.searchParams.get('width')).toBe('800');
    expect(url.searchParams.get('height')).toBe('497');
  });

  it('recusa camada sem caminho, caixa ausente ou dimensao nao positiva', () => {
    expect(urlDaImagem({ camadas: '0' }, { bbox, larguraPx: 10, alturaPx: 10 })).toBeNull();
    expect(urlDaImagem(camada, { bbox: null, larguraPx: 10, alturaPx: 10 })).toBeNull();
    expect(urlDaImagem(camada, { bbox, larguraPx: 0, alturaPx: 10 })).toBeNull();
  });

  it('escapa cada trecho do caminho sem destruir a barra que separa a pasta', () => {
    const acentuada = { caminho: '00_PUBLICACOES/Patrimônio_Cultural_IPHAN', camadas: '0' };
    const url = urlDaImagem(acentuada, { bbox, larguraPx: 10, alturaPx: 10 });
    expect(url).toContain('/00_PUBLICACOES/Patrim%C3%B4nio_Cultural_IPHAN/MapServer/');
  });
});

describe('urlDeAtributos', () => {
  const camada = { caminho: 'Geoprocessamento/Terras_indigenas_funai', camadas: '0' };
  const caixa = { minX: -6150425, minY: -3100123, maxX: -5282139, maxY: -2561785.7 };

  it('consulta o identify do REST, que responde em JSON', () => {
    const url = new URL(
      urlDeAtributos(camada, { caixa, larguraPx: 800, alturaPx: 496, x: -5700000, y: -2800000 }),
    );
    // O GetFeatureInfo deste servidor devolve HTML ou GML. Ler HTML de
    // terceiro para extrair atributo quebra quando o estilo do servidor muda.
    expect(url.pathname).toContain('/rest/services/');
    expect(url.pathname).toContain('/MapServer/identify');
    expect(url.searchParams.get('f')).toBe('json');
    expect(url.searchParams.get('sr')).toBe('3857');
    expect(url.searchParams.get('returnGeometry')).toBe('false');
    expect(JSON.parse(url.searchParams.get('geometry'))).toEqual({
      x: -5700000,
      y: -2800000,
      spatialReference: { wkid: 3857 },
    });
  });

  it('recusa ponto sem coordenada finita', () => {
    expect(
      urlDeAtributos(camada, { caixa, larguraPx: 800, alturaPx: 496, x: NaN, y: 0 }),
    ).toBeNull();
  });
});

describe('atributosLegiveis', () => {
  it('descarta identificador interno e campo vazio', () => {
    const lido = atributosLegiveis({
      results: [
        {
          layerName: 'Unidades de Conservação',
          attributes: {
            OBJECTID: '412',
            'Shape.STArea()': '99881',
            Nome: 'Reserva de exemplo',
            Categoria: 'Uso Sustentável',
            Ato: '   ',
            Observacao: 'Null',
          },
        },
      ],
    });
    expect(lido).toHaveLength(1);
    expect(lido[0].camada).toBe('Unidades de Conservação');
    expect(lido[0].valores).toEqual([
      { chave: 'Nome', valor: 'Reserva de exemplo' },
      { chave: 'Categoria', valor: 'Uso Sustentável' },
    ]);
  });

  it('limita a quantidade para o painel nao virar despejo de tabela', () => {
    const muitos = Object.fromEntries(
      Array.from({ length: 40 }, (_, i) => [`campo${i}`, `valor${i}`]),
    );
    const lido = atributosLegiveis({ results: [{ layerName: 'X', attributes: muitos }] }, 5);
    expect(lido[0].valores).toHaveLength(5);
  });

  it('aguenta resposta vazia ou malformada sem lancar', () => {
    expect(atributosLegiveis(null)).toEqual([]);
    expect(atributosLegiveis({})).toEqual([]);
    expect(atributosLegiveis({ results: [{}] })).toEqual([
      { camada: '', valores: [], ocultos: 0 },
    ]);
  });
});

describe('atributosLegiveis: dado identificavel nao chega a tela', () => {
  // Os nomes de campo abaixo sao os que o servico
  // 00_PUBLICACOES/iap_gerad_energ_hidreletricas devolveu de verdade numa
  // consulta real: objectid, PROTOCOLO, BACIA, DATA_PROTO, TIPO, NOME, RIO,
  // SITUACAO, TIPOS_DE_L, POT_SOLIC. O dado e publico na origem; a regra de
  // nao exibir protocolo dentro de material de treinamento e desta plataforma.
  const RESPOSTA_REAL = {
    results: [
      {
        layerName: 'Usinas de Geração de Energia Hidrelétrica - IAT',
        attributes: {
          objectid: '318',
          PROTOCOLO: '18.945.221-4',
          BACIA: 'Iguaçu',
          DATA_PROTO: '2021-03-11',
          TIPO: 'CGH',
          NOME: 'Exemplo do serviço',
          RIO: 'Rio de exemplo',
          'SITUAÇÃO': 'Em análise',
          POT_SOLIC: '3,40',
        },
      },
    ],
  };

  it('retem o protocolo e conta quantos campos ficaram de fora', () => {
    const [lido] = atributosLegiveis(RESPOSTA_REAL);
    const chaves = lido.valores.map((p) => p.chave);
    expect(chaves).not.toContain('PROTOCOLO');
    expect(lido.ocultos).toBe(1);
  });

  it('preserva o que ensina: bacia, tipo, rio, situacao e potencia', () => {
    const [lido] = atributosLegiveis(RESPOSTA_REAL);
    const chaves = lido.valores.map((p) => p.chave);
    for (const esperada of ['BACIA', 'TIPO', 'RIO', 'SITUAÇÃO', 'POT_SOLIC']) {
      expect(chaves).toContain(esperada);
    }
    // O nome da usina fica: o mapa ja plota o registro publico da ANEEL com
    // nome, e comparar as duas leituras e o proprio exercicio.
    expect(chaves).toContain('NOME');
  });

  it('pega o formato mesmo quando o campo tem nome inocente', () => {
    // A lista por nome so pega o que alguem lembrou de listar. Um servico novo
    // pode chamar o protocolo de NUM_DOC, e ai so a forma do valor denuncia.
    const [lido] = atributosLegiveis({
      results: [{
        layerName: 'X',
        attributes: {
          NUM_DOC: '18.945.221-4',
          INSCRICAO: '12.345.678/0001-95',
          DOC: '123.456.789-01',
          FONE: '(41) 3350-4000',
          LOCAL: '80530-900',
          CORRIDO: '12345678000195',
          POTENCIA: '3,40',
          AREA_HA: '12345678',
        },
      }],
    });
    const chaves = lido.valores.map((p) => p.chave);
    expect(chaves).toEqual(['POTENCIA', 'AREA_HA']);
    expect(lido.ocultos).toBe(6);
  });

  it('nao derruba medida legitima que so parece documento', () => {
    // Armadilha ao contrario: se o padrao de CEP fosse \d{5}-?\d{3}, uma area
    // de oito digitos sumiria da tela sem motivo. Exigir a pontuacao evita isso.
    const [lido] = atributosLegiveis({
      results: [{ layerName: 'X', attributes: { AREA_M2: '12345678', COTA: '12345' } }],
    });
    expect(lido.valores.map((p) => p.chave)).toEqual(['AREA_M2', 'COTA']);
    expect(lido.ocultos).toBe(0);
  });
});
