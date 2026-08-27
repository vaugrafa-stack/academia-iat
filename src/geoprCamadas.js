// Camadas oficiais do GeoPR dentro do mapa da Academia.
//
// O GeoPR e o portal geoespacial do IAT. Ele publica cada servico com tres
// interfaces: REST da Esri, WFS e WMS. Aqui usamos WMS por um motivo pratico,
// nao por gosto: o acervo mistura projecoes (SIRGAS 2000 geografico 4674,
// SIRGAS 2000 UTM 22S 31982 e Web Mercator 3857) e o WMS reprojeta no servidor.
// Pelo REST, cada camada chegaria num sistema diferente e a conversao ficaria
// por nossa conta, camada a camada, que e onde o erro de datum entra.
//
// A imagem WMS e uma requisicao por camada por vista, e nao uma grade de
// blocos como no satelite. Camada vetorial de orgao publico nao tem cache de
// blocos: pedir 12 blocos seria 12 desenhos do mesmo shapefile em vez de um.
//
// LIMITE QUE A INTERFACE PRECISA CARREGAR: a secao 137 do POP diz que as
// camadas do GeoPR sao instrumento de apoio e NAO substituem a leitura do ato
// legal. Ver uma poligonal aqui nao decide sobreposicao; serve para levantar a
// duvida que se confirma na fonte. Por isso todo item deste catalogo carrega
// fonte e ano, e a tela exibe os dois: o POP manda registrar camada, fonte e
// data da consulta.

import { useCallback, useEffect, useMemo, useState } from 'react';

/** Raio equatorial usado pelo Web Mercator, em metros. */
export const RAIO_MERCATOR = 20037508.342789244;

export const GEOPR_BASE = 'https://geopr.iat.pr.gov.br/server';
export const GEOPR_PORTAL =
  'https://geopr.iat.pr.gov.br/portal/home/gallery.html?sortField=title&sortOrder=asc';

/**
 * Converte a janela visivel do mapa para a caixa Web Mercator que o WMS espera.
 *
 * `normalizedExtent` guarda o recorte do Parana em coordenada normalizada de
 * bloco (0 a 1, onde 0 e -180 graus e 0 e o polo norte), que e o mesmo sistema
 * que a camada de satelite ja usa. Converter para metros e uma reta:
 * 0 vira -RAIO e 1 vira +RAIO em x, e o eixo y inverte porque no mapa y cresce
 * para baixo e no Mercator cresce para o norte.
 */
export function vistaParaCaixa(projecao, largura, altura, vista) {
  const ext = projecao?.type === 'web-mercator' ? projecao.normalizedExtent : null;
  if (
    !ext
    || ![ext.xMin, ext.yMin, ext.xMax, ext.yMax, largura, altura].every(Number.isFinite)
    || ext.xMax <= ext.xMin
    || ext.yMax <= ext.yMin
    || !(largura > 0)
    || !(altura > 0)
  ) {
    return null;
  }
  const janela = vista || { x: 0, y: 0, w: largura, h: altura };
  if (!(janela.w > 0) || !(janela.h > 0)) return null;

  const normX = (x) => ext.xMin + (x / largura) * (ext.xMax - ext.xMin);
  const normY = (y) => ext.yMin + (y / altura) * (ext.yMax - ext.yMin);
  const metrosX = (n) => (n * 2 - 1) * RAIO_MERCATOR;
  const metrosY = (n) => (1 - n * 2) * RAIO_MERCATOR;

  return {
    // y inverte: o topo da janela e o NORTE, ou seja o maior valor em Mercator.
    minX: metrosX(normX(janela.x)),
    minY: metrosY(normY(janela.y + janela.h)),
    maxX: metrosX(normX(janela.x + janela.w)),
    maxY: metrosY(normY(janela.y)),
  };
}

/**
 * Um ponto do mapa em metros Web Mercator.
 *
 * Mesma conversao de `vistaParaCaixa`, aplicada a um ponto so. Serve para
 * perguntar ao servidor o que existe no lugar onde a pessoa clicou.
 */
export function pontoParaMercator(projecao, largura, altura, x, y) {
  const ext = projecao?.type === 'web-mercator' ? projecao.normalizedExtent : null;
  if (!ext || !(largura > 0) || !(altura > 0)) return null;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const nx = ext.xMin + (x / largura) * (ext.xMax - ext.xMin);
  const ny = ext.yMin + (y / altura) * (ext.yMax - ext.yMin);
  return { x: (nx * 2 - 1) * RAIO_MERCATOR, y: (1 - ny * 2) * RAIO_MERCATOR };
}

/**
 * O caminho de volta: metros Web Mercator para as unidades do desenho.
 *
 * Serve para marcar no mapa um ponto que veio de fora, digitado em grau ou em
 * UTM. Sem isto, dava para LER a coordenada de onde a pessoa clicou, mas nao
 * para MOSTRAR onde cai uma coordenada que ela tem em maos, que e justamente o
 * gesto de quem confere um memorial.
 */
export function mercatorParaMapa(projecao, largura, altura, x, y) {
  const ext = projecao?.type === 'web-mercator' ? projecao.normalizedExtent : null;
  if (!ext || !(largura > 0) || !(altura > 0)) return null;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const nx = (x / RAIO_MERCATOR + 1) / 2;
  const ny = (1 - y / RAIO_MERCATOR) / 2;
  return {
    x: ((nx - ext.xMin) / (ext.xMax - ext.xMin)) * largura,
    y: ((ny - ext.yMin) / (ext.yMax - ext.yMin)) * altura,
  };
}

/** A caixa no formato que o parametro `bbox` do WMS 1.3.0 pede. */
export function caixaParaBBox(caixa) {
  if (!caixa) return null;
  // Em EPSG:3857 a ordem dos eixos e leste, norte. A inversao para latitude e
  // longitude vale para EPSG:4326, e por isso nao usamos 4326 aqui.
  return [caixa.minX, caixa.minY, caixa.maxX, caixa.maxY]
    .map((v) => v.toFixed(1))
    .join(',');
}

/** Endereco da imagem de uma camada para a vista corrente. */
export function urlDaImagem(camada, { bbox, larguraPx, alturaPx }) {
  if (!camada?.caminho || !bbox) return null;
  if (!(larguraPx > 0) || !(alturaPx > 0)) return null;
  const parametros = new URLSearchParams({
    service: 'WMS',
    request: 'GetMap',
    version: '1.3.0',
    layers: String(camada.camadas ?? '0'),
    styles: '',
    crs: 'EPSG:3857',
    bbox,
    width: String(Math.round(larguraPx)),
    height: String(Math.round(alturaPx)),
    format: 'image/png',
    transparent: 'true',
  });
  const caminho = camada.caminho.split('/').map(encodeURIComponent).join('/');
  return `${GEOPR_BASE}/services/${caminho}/MapServer/WMSServer?${parametros}`;
}

/**
 * Endereco da consulta de atributos num ponto.
 *
 * Usa o `identify` do REST da Esri, e nao o GetFeatureInfo do WMS. O WMS passou
 * a anunciar GeoJSON em 2026, mas o REST continua sendo o contrato comum aos
 * servicos curados e ja devolve o envelope JSON que a filtragem abaixo valida.
 */
export function urlDeAtributos(camada, { caixa, larguraPx, alturaPx, x, y, tolerancia = 6 }) {
  if (!camada?.caminho || !caixa) return null;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (!(larguraPx > 0) || !(alturaPx > 0)) return null;
  const parametros = new URLSearchParams({
    f: 'json',
    geometry: JSON.stringify({ x, y, spatialReference: { wkid: 3857 } }),
    geometryType: 'esriGeometryPoint',
    sr: '3857',
    tolerance: String(tolerancia),
    mapExtent: [caixa.minX, caixa.minY, caixa.maxX, caixa.maxY].join(','),
    imageDisplay: `${Math.round(larguraPx)},${Math.round(alturaPx)},96`,
    layers: `visible:${camada.camadas ?? '0'}`,
    returnGeometry: 'false',
  });
  const caminho = camada.caminho.split('/').map(encodeURIComponent).join('/');
  return `${GEOPR_BASE}/rest/services/${caminho}/MapServer/identify?${parametros}`;
}

/**
 * Reduz a resposta do `identify` a pares rotulo/valor exibiveis.
 *
 * Descarta identificador interno e geometria: numero de objeto do banco do
 * servidor nao ensina nada e ocupa a linha que o atributo util ocuparia.
 */
// Os nomes reais que este servidor emite, e nao os que a gente imagina que ele
// emitiria: `Shape.STArea()` e `Shape.STLength()` do SQL Server, `st_area(shape)`
// do PostGIS, alem do identificador de linha. Um teste pegou justamente a
// versao ingenua desta lista deixando `Shape.STArea()` passar como atributo.
const normalizarChave = (chave) => String(chave || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '_')
  .replace(/^_|_$/g, '')
  .toLowerCase();

const CAMPOS_IGNORADOS = /^(?:objectid\w*|fid|gid|globalid|se_anno\w*|shape(?:_|$).*|st_(?:area|length|perimeter).*)$/i;

/**
 * Campos que esta plataforma nao exibe, mesmo vindo de servico publico.
 *
 * Isto NAO e um juizo sobre o GeoPR: o portal publica o que lhe compete, e o
 * dado e publico na origem. E uma regra da Academia. A camada de geradoras do
 * IAT, por exemplo, responde com PROTOCOLO junto de NOME e SITUACAO. Exibir o
 * numero de protocolo de um processo real dentro de um material de treinamento
 * convida a tratar exercicio como registro de caso, e e exatamente o que a
 * plataforma se proibiu de fazer.
 *
 * O nome da usina continua: o mapa ja plota o registro publico da ANEEL com
 * nome, e a camada do IAT serve justamente para comparar as duas leituras.
 */
const CAMPOS_SENSIVEIS = new RegExp([
  // Identificadores de processo, outorga, pessoa, usuario ou registro.
  '(?:^|_)(?:protocolo|processo|cnpj|cpf|portaria|crh|sei|art|cep|documento|doc|inscricao)(?:_|$)',
  '(?:^|_)(?:id|codigo|cod|usu_codigo|codigo_ponto)(?:_|$)',
  // Localizacao exata nao e necessaria para explicar o simbolo: o proprio mapa
  // ja mostra a posicao sem republicar coordenadas da tabela.
  '(?:^|_)(?:coord(?:enada)?|latitude|longitude|lat|lon|lng|utm|easting|northing)(?:_|$)',
  // Identidade e contato. A chave e normalizada antes do teste, portanto
  // RESPONSÁVEL, ENDEREÇO e RAZÃO_SOCIAL entram aqui tambem.
  'requerent|empreendedor|razao_social|nome_fantasia|propriet|interessad|responsav',
  'contato|email|telefone|celular|endereco|logradouro|usuario|pessoa',
  'autuad|infrac|matricula|imovel',
].join('|'), 'i');

/**
 * Formatos que denunciam dado identificavel independentemente do nome do campo.
 *
 * A lista por nome so pega o que alguem lembrou de listar. Um servico novo pode
 * chamar o protocolo de `NUM_DOC` e passar batido. Por isso o valor tambem e
 * conferido pela forma. Exigimos a pontuacao para nao derrubar medida legitima:
 * uma potencia de oito digitos nao pode ser confundida com CEP.
 */
const VALORES_SENSIVEIS = [
  /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/, // CNPJ pontuado
  /(?:^|\D)\d{14}(?:\D|$)/, // CNPJ corrido
  /\d{3}\.\d{3}\.\d{3}-\d{2}/, // CPF pontuado
  /\d{2}\.\d{3}\.\d{3}-\d(?:\D|$)/, // protocolo estadual
  /\(\d{2}\)\s?\d{4,5}-\d{4}/, // telefone
  /\d{5}-\d{3}(?:\D|$)/, // CEP
];

// A interface nao despeja colunas desconhecidas. Camadas curadas podem mostrar
// nomes de feicoes/empreendimentos e descricoes tecnicas; no acervo arbitrario,
// o fallback e mais conservador porque um campo NOME pode ser o de uma pessoa.
// Nos dois casos, tipo, situacao, municipio, rio, bacia e medidas ambientais
// continuam disponiveis para explicar o que se ve.
const CAMPOS_SEMANTICOS = [
  { teste: /^(?:nome|denominacao|titulo|nm_empreendimento|empreendim|caverna)$/, somenteCurada: true },
  { teste: /^(?:nome|nm)_(?:uc|unidade|caverna|empreendimento|barragem|usina|aproveitamento|sitio|bem|comite)$/, somenteCurada: true },
  { teste: /^(?:tipo|tipologia|categoria|classe|esfera)(?:_|$)/ },
  { teste: /(?:^|_)(?:situacao|status)(?:_|$)|^sitout_descricao$/ },
  { teste: /^(?:municipio|nm_municipio|nome_municipio|mun_nome|cidade)(?:_|$)/ },
  { teste: /^(?:rio|rio_nome|nome_rio|hidrografia)(?:_|$)/ },
  { teste: /^(?:bacia|bac_nome|nome_bacia)(?:_|$)/ },
  { teste: /^(?:pot_solic|potencia|pot_mw|vazao|area(?:_ha|_m2|_km2|_decre)?|cota|altitude|capacidade|extensao|comprimento)(?:_|$)/ },
  { teste: /^(?:bioma|zona|zoneamento|za|app|finalidade|uso|vegetacao|formacao|substrato|litologia|pl_manejo)(?:_|$)/ },
  { teste: /^(?:label|ato_legal)$/, somenteCurada: true },
  { teste: /^(?:data_valid|data_proto|ano|vigencia|tipos_de_l)(?:_|$)/, somenteCurada: true },
  { teste: /^(?:descricao|desc)(?:_|$)/, somenteCurada: true },
];

function prioridadeDoCampo(chave, camada) {
  const normalizada = normalizarChave(chave);
  const curada = camada?.doAcervo !== true;
  for (let indice = 0; indice < CAMPOS_SEMANTICOS.length; indice += 1) {
    const regra = CAMPOS_SEMANTICOS[indice];
    if ((!regra.somenteCurada || curada) && regra.teste.test(normalizada)) return indice;
  }
  return null;
}

export function atributosLegiveis(resposta, limite = 12, camada = null) {
  const achados = Array.isArray(resposta?.results) ? resposta.results : [];
  return achados.slice(0, 4).map((achado) => {
    let ocultos = 0;
    const elegiveis = [];
    Object.entries(achado.attributes || {}).forEach(([chave, valor], indice) => {
      const normalizada = normalizarChave(chave);
      if (CAMPOS_IGNORADOS.test(normalizada)) return;
      const texto = String(valor ?? '').trim();
      if (texto === '' || texto.toLowerCase() === 'null') return;
      const prioridade = prioridadeDoCampo(chave, camada);
      if (
        CAMPOS_SENSIVEIS.test(normalizada)
        || VALORES_SENSIVEIS.some((p) => p.test(texto))
        || prioridade == null
      ) {
        ocultos += 1;
        return;
      }
      elegiveis.push({ chave, texto, prioridade, indice });
    });
    elegiveis.sort((a, b) => a.prioridade - b.prioridade || a.indice - b.indice);
    const omitidos = Math.max(0, elegiveis.length - limite);
    const valores = elegiveis
      .slice(0, limite)
      .map(({ chave, texto }) => {
        // Alguns servicos guardam observacoes inteiras num unico campo. O
        // painel e uma identificacao espacial, nao um despejo da tabela: o
        // limite preserva o contexto sem permitir que um valor cubra a tela.
        return {
          chave,
          valor: texto.length > 500 ? `${texto.slice(0, 497)}...` : texto,
        };
      });
    // `ocultos` volta para a tela contar quantos campos foram retidos. Cortar
    // em silencio faria a pessoa acreditar que o servico respondeu so isso.
    return {
      camada: String(achado.layerName || '').trim(),
      valores,
      ocultos,
      omitidos,
    };
  });
}

const ROTULOS_DE_ATRIBUTO = new Map([
  ['nome', 'Nome'],
  ['tipo', 'Tipo'],
  ['categoria', 'Categoria'],
  ['classe', 'Classe'],
  ['situacao', 'Situação'],
  ['status', 'Situação'],
  ['municipio', 'Município'],
  ['nm_municipio', 'Município'],
  ['rio', 'Rio'],
  ['rio_nome', 'Rio'],
  ['hidrografia', 'Hidrografia'],
  ['bacia', 'Bacia'],
  ['bac_nome', 'Bacia'],
  ['pot_solic', 'Potência solicitada'],
  ['potencia', 'Potência'],
  ['pot_mw', 'Potência (MW)'],
  ['area_ha', 'Área (ha)'],
  ['data_proto', 'Data do protocolo'],
  ['data_valid', 'Data validada'],
  ['tipos_de_l', 'Tipo de licença'],
  ['descricao', 'Descrição'],
  ['denominacao', 'Denominação'],
  ['nm_empreendimento', 'Empreendimento'],
  ['empreendim', 'Empreendimento'],
  ['nome_uc', 'Unidade de conservação'],
  ['nome_comite', 'Comitê de bacia'],
  ['nome_municipio', 'Município'],
  ['sitout_descricao', 'Situação'],
  ['caverna', 'Caverna'],
  ['area_km2', 'Área (km²)'],
  ['area_decre', 'Área declarada'],
  ['za', 'Zona de amortecimento'],
  ['app', 'APP'],
  ['classe_uso', 'Classe de uso'],
  ['pl_manejo', 'Plano de manejo'],
  ['ato_legal', 'Ato legal'],
  ['label', 'Zona'],
]);

/** Traduz nomes de coluna do servico para rotulos que uma pessoa entende. */
export function rotuloDeAtributo(chave) {
  const normalizada = normalizarChave(chave);
  const conhecido = ROTULOS_DE_ATRIBUTO.get(normalizada);
  if (conhecido) return conhecido;
  const texto = String(chave || '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return texto ? texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1).toLocaleLowerCase('pt-BR') : 'Atributo';
}

const CHAVES_DE_TITULO = [
  /^(?:nome|denominacao|titulo|nm_empreendimento|empreendim|caverna)$/,
  /^(?:nome|nm)_(?:uc|unidade|caverna|empreendimento|barragem|usina|aproveitamento|sitio|bem|comite)$/,
  /^hidrografia$/,
  /^(?:descricao|desc)$/,
];

const encurtar = (valor, limite) => {
  const texto = String(valor || '').trim();
  return Number.isFinite(limite) && texto.length > limite
    ? `${texto.slice(0, Math.max(0, limite - 3)).trimEnd()}...`
    : texto;
};

/** Nome curto para o tooltip; cai para a camada quando o registro nao o declara. */
export function tituloDoAchado(achado, limite = Infinity) {
  const valores = Array.isArray(achado?.valores) ? achado.valores : [];
  const principal = valores.find(({ chave }) => {
    const normalizada = normalizarChave(chave);
    return CHAVES_DE_TITULO.some((candidata) => candidata.test(normalizada));
  });
  return encurtar(principal?.valor
    || String(achado?.camada || '').trim()
    || String(achado?.origem?.titulo || '').trim()
    || 'Registro do GeoPR', limite);
}

const ORDEM_DO_RESUMO = [
  /^(?:tipo|tipologia|categoria|classe)(?:_|$)/,
  /(?:^|_)(?:situacao|status)(?:_|$)|^sitout_descricao$/,
  /^(?:municipio|nm_municipio|mun_nome|cidade)(?:_|$)/,
  /^(?:rio|rio_nome|nome_rio|hidrografia)(?:_|$)/,
  /^(?:bacia|bac_nome|nome_bacia)(?:_|$)/,
  /^(?:pot_solic|potencia|pot_mw|vazao|area(?:_ha|_m2)?)(?:_|$)/,
];

/** Dois ou tres fatos uteis para a leitura rapida junto ao cursor. */
export function resumoDoAchado(achado, limite = 3, limiteDoValor = 96) {
  const titulo = tituloDoAchado(achado);
  return (Array.isArray(achado?.valores) ? achado.valores : [])
    .filter((par) => par.valor !== titulo)
    .map((par, indice) => {
      const normalizada = normalizarChave(par.chave);
      const prioridade = ORDEM_DO_RESUMO.findIndex((padrao) => padrao.test(normalizada));
      return { ...par, indice, prioridade: prioridade < 0 ? 999 : prioridade };
    })
    .sort((a, b) => a.prioridade - b.prioridade || a.indice - b.indice)
    .slice(0, Math.max(0, limite))
    .map(({ chave, valor }) => ({
      chave,
      rotulo: rotuloDeAtributo(chave),
      valor: encurtar(valor, limiteDoValor),
    }));
}

const origemPublica = (camada) => ({
  id: String(camada?.id || ''),
  titulo: String(camada?.titulo || ''),
  fonte: camada?.fonte == null ? null : String(camada.fonte),
  paraQue: String(camada?.paraQue || ''),
  caminho: String(camada?.caminho || ''),
});

export const PRAZO_CAMADA_GEOPR_MS = 14000;
export const PRAZO_TOTAL_GEOPR_MS = 20000;

async function consultarUmaCamada(camada, opcoes, fetchImpl) {
  const alvo = urlDeAtributos(camada, opcoes);
  if (!alvo) return { achados: [], consultada: false };
  const controle = new AbortController();
  let relogio;
  let cancelarExterno;
  const abortada = () => {
    const erro = new Error('GeoPR identify: consulta cancelada');
    erro.name = 'AbortError';
    return erro;
  };
  const externa = new Promise((_, rejeitar) => {
    cancelarExterno = () => {
      controle.abort();
      rejeitar(abortada());
    };
    if (opcoes.sinal?.aborted) cancelarExterno();
    else opcoes.sinal?.addEventListener('abort', cancelarExterno, { once: true });
  });
  const expirou = new Promise((_, rejeitar) => {
    relogio = setTimeout(() => {
      controle.abort();
      const erro = new Error('GeoPR identify: prazo da camada excedido');
      erro.name = 'TimeoutError';
      rejeitar(erro);
    }, opcoes.prazoCamadaMs);
  });
  const requisicao = (async () => {
    const resposta = await fetchImpl(alvo, {
      credentials: 'omit',
      mode: 'cors',
      signal: controle.signal,
    });
    if (!resposta.ok) throw new Error(`GeoPR identify: HTTP ${resposta.status}`);
    const corpo = await resposta.json();
    if (corpo?.error) throw new Error('GeoPR identify: resposta de erro');
    const origem = origemPublica(camada);
    return {
      consultada: true,
      achados: atributosLegiveis(corpo, 12, camada).map((achado) => ({ ...achado, origem })),
    };
  })();
  try {
    return await Promise.race([requisicao, externa, expirou]);
  } finally {
    clearTimeout(relogio);
    opcoes.sinal?.removeEventListener('abort', cancelarExterno);
  }
}

/**
 * Consulta as camadas ativas no ponto, sem sobrecarregar o servidor publico.
 *
 * No hover, a ordem e do topo para o fundo e a busca para no primeiro acerto.
 * No clique, todas sao consultadas, mas apenas tres requisicoes correm juntas.
 */
export async function consultarCamadasNoPonto({
  camadas,
  caixa,
  larguraPx,
  alturaPx,
  ponto,
  tolerancia = 10,
  sinal,
  pararNoPrimeiro = false,
  concorrencia = 3,
  prazoCamadaMs = PRAZO_CAMADA_GEOPR_MS,
  prazoTotalMs = PRAZO_TOTAL_GEOPR_MS,
  fetchImpl = globalThis.fetch,
}) {
  const base = [...(camadas || [])];
  // O SVG pinta todas as camadas de fundo primeiro e todas as de topo depois,
  // independentemente da ordem em que foram ligadas. Dentro de cada faixa, a
  // ultima ativada fica por cima. A consulta precisa repetir exatamente isso.
  const fila = [
    ...base.filter((camada) => camada?.ordem === 'topo').reverse(),
    ...base.filter((camada) => camada?.ordem !== 'topo').reverse(),
  ];
  if (!fila.length || !ponto || typeof fetchImpl !== 'function') {
    return { achados: [], consultadas: 0, falhas: 0 };
  }
  const controleTotal = new AbortController();
  const cancelarTotal = () => controleTotal.abort();
  if (sinal?.aborted) cancelarTotal();
  else sinal?.addEventListener('abort', cancelarTotal, { once: true });
  const relogioTotal = setTimeout(cancelarTotal, Math.max(1, prazoTotalMs));
  const opcoes = {
    caixa,
    larguraPx,
    alturaPx,
    x: ponto.x,
    y: ponto.y,
    tolerancia,
    sinal: controleTotal.signal,
    prazoCamadaMs: Math.max(1, prazoCamadaMs),
  };
  let consultadas = 0;
  let falhas = 0;

  const executar = async (camada) => {
    try {
      const resultado = await consultarUmaCamada(camada, opcoes, fetchImpl);
      if (resultado.consultada) consultadas += 1;
      return resultado.achados;
    } catch (erro) {
      // Abort externo significa que o cursor/consulta mudou e o resultado e
      // obsoleto. Timeout interno, inclusive o prazo total, e falha parcial.
      if (sinal?.aborted) throw erro;
      falhas += 1;
      return [];
    }
  };

  try {
    if (pararNoPrimeiro) {
      for (const camada of fila) {
        // Sequencial por intencao: o primeiro acerto e a camada visualmente mais
        // alta, e as demais nem precisam receber uma requisicao de hover.
        // eslint-disable-next-line no-await-in-loop
        const achados = await executar(camada);
        if (achados.length) return { achados, consultadas, falhas };
      }
      return { achados: [], consultadas, falhas };
    }

    const porCamada = Array.from({ length: fila.length }, () => []);
    let proxima = 0;
    const trabalhador = async () => {
      while (proxima < fila.length) {
        const indice = proxima;
        proxima += 1;
        // O indice preserva a ordem visual mesmo quando as respostas chegam fora
        // de ordem; o limite de trabalhadores protege o servico compartilhado.
        // eslint-disable-next-line no-await-in-loop
        porCamada[indice] = await executar(fila[indice]);
      }
    };
    const quantidade = Math.min(fila.length, Math.max(1, Math.floor(concorrencia) || 1));
    await Promise.all(Array.from({ length: quantidade }, trabalhador));
    return { achados: porCamada.flat(), consultadas, falhas };
  } finally {
    clearTimeout(relogioTotal);
    sinal?.removeEventListener('abort', cancelarTotal);
  }
}

// ---------------------------------------------------------------------------
// Ligacao com a tela
// ---------------------------------------------------------------------------

/**
 * Espera o mapa parar antes de pedir imagem nova.
 *
 * Cada GetMap manda um servidor publico desenhar um shapefile inteiro. Sem esta
 * espera, arrastar o mapa por um segundo dispara dezenas de desenhos completos,
 * quase todos jogados fora antes de chegar. A pausa e curta o bastante para
 * parecer imediata e longa o bastante para o servidor receber uma requisicao
 * por gesto, e nao por quadro de animacao.
 */
export const ESPERA_ANTES_DE_PEDIR_MS = 280;

export function useVistaEstavel(vista, espera = ESPERA_ANTES_DE_PEDIR_MS) {
  const [estavel, setEstavel] = useState(vista);
  const chave = vista ? `${vista.x}:${vista.y}:${vista.w}:${vista.h}` : 'inteiro';

  useEffect(() => {
    const id = setTimeout(() => setEstavel(vista), espera);
    return () => clearTimeout(id);
    // A chave e o conteudo da janela; o objeto muda de identidade a cada quadro
    // do arrasto e usa-lo aqui reiniciaria a espera para sempre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, espera]);

  return estavel;
}

/**
 * Camadas do GeoPR desenhadas sobre o mapa local.
 *
 * Cada camada ativa vira UMA imagem por vista. O retangulo devolvido e o da
 * vista em que a imagem foi PEDIDA, e nao o da vista corrente: enquanto a nova
 * imagem nao chega, a anterior continua ancorada no lugar certo do mundo. Se
 * ancorassemos na vista corrente, arrastar o mapa esticaria a camada antiga
 * sobre a area errada, e o resultado pareceria um mapa, so que mentindo.
 */
export function useCamadasGeopr({ camadas, projecao, largura, altura, vista, quadro }) {
  const [falhas, setFalhas] = useState(() => new Set());
  const [carregadas, setCarregadas] = useState(() => new Set());
  const vistaEstavel = useVistaEstavel(vista);

  const larguraPx = Math.max(1, Math.round(quadro?.larguraPx || largura || 1));
  const alturaPx = Math.max(1, Math.round(quadro?.alturaPx || altura || 1));

  const caixa = useMemo(
    () => vistaParaCaixa(projecao, largura, altura, vistaEstavel),
    [projecao, largura, altura, vistaEstavel],
  );

  const pedidos = useMemo(() => {
    const bbox = caixaParaBBox(caixa);
    if (!bbox) return [];
    const retangulo = vistaEstavel || { x: 0, y: 0, w: largura, h: altura };
    return (camadas || [])
      .map((camada) => {
        const href = camada && urlDaImagem(camada, { bbox, larguraPx, alturaPx });
        if (!href) return null;
        return { id: camada.id, camada, href, chave: `${camada.id}@${bbox}`, retangulo };
      })
      .filter(Boolean);
  }, [camadas, caixa, vistaEstavel, largura, altura, larguraPx, alturaPx]);

  // Some com o registro de camadas que a pessoa desligou, para a tela nao
  // guardar erro de algo que nao esta mais na vista.
  useEffect(() => {
    const vivas = new Set(pedidos.map((p) => p.chave));
    const podar = (conjunto) => {
      const novo = new Set([...conjunto].filter((c) => vivas.has(c)));
      return novo.size === conjunto.size ? conjunto : novo;
    };
    setFalhas(podar);
    setCarregadas(podar);
  }, [pedidos]);

  const registrar = useCallback((tipo, chave) => {
    const juntar = (conjunto) => {
      if (conjunto.has(chave)) return conjunto;
      const novo = new Set(conjunto);
      novo.add(chave);
      return novo;
    };
    if (tipo === 'falhou') setFalhas(juntar);
    else setCarregadas(juntar);
  }, []);

  return {
    caixa,
    pedidos,
    registrar,
    carregadas,
    falhas,
    larguraPx,
    alturaPx,
    // Uma camada so e "esperando" enquanto nao carregou nem falhou.
    esperando: pedidos.some((p) => !carregadas.has(p.chave) && !falhas.has(p.chave)),
  };
}

// ---------------------------------------------------------------------------
// Busca no acervo inteiro
// ---------------------------------------------------------------------------

/**
 * Pastas do GeoPR que valem varrer.
 *
 * O servidor tem outras, mas ou estao vazias ou guardam publicacao de outras
 * politicas do Estado. Estas tres mais a raiz cobrem o que um processo de
 * hidreletrica consulta.
 */
export const PASTAS_DO_ACERVO = ['00_PUBLICACOES', 'Geoprocessamento', 'Hosted', ''];

// O acervo tem mais de mil servicos. Embutir a lista no pacote engordaria o
// site para todo mundo por causa de um recurso que poucos vao abrir, e ela
// envelheceria no dia seguinte. Buscar sob demanda e guardar em memoria custa
// uma requisicao por sessao de quem realmente usa a busca.
let acervoEmMemoria = null;

/** Prazo de cada pasta. Passou disso, ela fica de fora e a busca segue. */
export const PRAZO_DA_PASTA_MS = 15000;

async function umaPasta(pasta, sinal, fetchImpl = globalThis.fetch) {
  const alvo = pasta
    ? `${GEOPR_BASE}/rest/services/${encodeURIComponent(pasta)}?f=json`
    : `${GEOPR_BASE}/rest/services?f=json`;
  // Prazo proprio por pasta. `AbortSignal.any` resolveria em uma linha, mas e
  // recente demais para depender dele aqui.
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), PRAZO_DA_PASTA_MS);
  const repassar = () => controle.abort();
  sinal?.addEventListener('abort', repassar);
  try {
    const resposta = await fetchImpl(alvo, {
      credentials: 'omit',
      mode: 'cors',
      signal: controle.signal,
    });
    if (!resposta.ok) return [];
    const dados = await resposta.json();
    return (dados?.services || [])
      // So MapServer: e o unico que desenha imagem. FeatureServer do mesmo
      // dado aparece em duplicidade e nao acrescenta nada aqui.
      .filter((s) => s.type === 'MapServer')
      .map((s) => {
        const nome = String(s.name).split('/').pop();
        return { nome, pasta, caminho: pasta ? `${pasta}/${nome}` : nome };
      });
  } catch {
    return [];
  } finally {
    clearTimeout(relogio);
    sinal?.removeEventListener('abort', repassar);
  }
}

/**
 * Le o acervo, entregando cada pasta assim que ela chega.
 *
 * A primeira versao disto usava `Promise.all` e so devolvia com as quatro
 * pastas prontas. Na medicao em rede real, `00_PUBLICACOES` respondia em tres
 * segundos com 1914 servicos, ou seja quase todo o acervo, e a busca continuava
 * vazia por causa das outras tres. Esperar o mais lento para mostrar o que ja
 * chegou e desperdicio puro: quem procura "caverna" ja tinha a resposta.
 */
export async function carregarAcervo({ sinal, aoChegar, fetchImpl = globalThis.fetch } = {}) {
  if (acervoEmMemoria) {
    aoChegar?.(acervoEmMemoria);
    return acervoEmMemoria;
  }
  const juntos = [];
  await Promise.all(PASTAS_DO_ACERVO.map(async (pasta) => {
    const lista = await umaPasta(pasta, sinal, fetchImpl);
    if (!lista.length) return;
    juntos.push(...lista);
    aoChegar?.(juntos.slice());
  }));
  // Sem resultado nenhum quase sempre e rede caida, e guardar isso em memoria
  // deixaria a busca morta pelo resto da sessao.
  if (juntos.length) acervoEmMemoria = juntos;
  return juntos;
}

/** Evita que o índice de uma simulação atravesse outro teste. */
export function limparCacheAcervoParaTestes() {
  acervoEmMemoria = null;
}

const semAcento = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Filtra o acervo por termo, exigindo que todas as palavras apareçam. */
export function filtrarAcervo(acervo, termo, limite = 40) {
  const palavras = semAcento(termo).split(/\s+/).filter(Boolean);
  if (!palavras.length) return [];
  return (acervo || [])
    .filter((item) => {
      const alvo = semAcento(`${item.nome} ${item.pasta}`);
      return palavras.every((p) => alvo.includes(p));
    })
    .slice(0, limite);
}

/** Transforma um achado da busca em camada exibivel, sem fonte declarada. */
export function camadaDoAcervo(item) {
  if (!item?.caminho) return null;
  return {
    id: `acervo:${item.caminho}`,
    // O nome do servico e tecnico, com sublinhado. Vira rotulo legivel, mas o
    // caminho original continua a vista para quem precisa citar a camada.
    titulo: String(item.nome || '').replace(/_/g, ' ').trim(),
    grupo: 'acervo',
    ordem: 'topo',
    caminho: item.caminho,
    camadas: '0',
    fonte: null,
    doAcervo: true,
    paraQue: null,
  };
}

// ---------------------------------------------------------------------------
// Legenda
// ---------------------------------------------------------------------------

// Uma mancha verde no mapa nao informa nada sem legenda. O REST devolve, por
// servico, o rotulo e o simbolo de cada classe, ja como PNG em base64 de cerca
// de 200 bytes. Vem como `data:`, que o CSP da pagina ja aceita, entao a
// legenda nao acrescenta origem nenhuma a liberar.
const legendaEmMemoria = new Map();

export function simboloParaImagem(simbolo) {
  if (!simbolo?.imageData) return null;
  const tipo = simbolo.contentType || 'image/png';
  return `data:${tipo};base64,${simbolo.imageData}`;
}

/**
 * Legenda de um servico, com um teto de simbolos.
 *
 * O teto existe porque ha camada com dezenas de classes, e uma delas tem 46
 * subcamadas. Despejar tudo empurraria o mapa para fora da tela e ninguem leria
 * ate o fim. A tela mostra quantas ficaram de fora, em vez de fingir que a
 * lista acabou.
 */
export async function carregarLegenda(camada, { sinal, teto = 12 } = {}) {
  if (!camada?.caminho) return null;
  if (legendaEmMemoria.has(camada.caminho)) return legendaEmMemoria.get(camada.caminho);

  const caminho = camada.caminho.split('/').map(encodeURIComponent).join('/');
  try {
    const resposta = await fetch(
      `${GEOPR_BASE}/rest/services/${caminho}/MapServer/legend?f=json`,
      { credentials: 'omit', mode: 'cors', signal: sinal },
    );
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    const pedidas = new Set(String(camada.camadas ?? '0').split(','));
    const simbolos = [];
    for (const bloco of dados?.layers || []) {
      if (!pedidas.has(String(bloco.layerId))) continue;
      for (const simbolo of bloco.legend || []) {
        const imagem = simboloParaImagem(simbolo);
        if (!imagem) continue;
        simbolos.push({
          // Quando a classe nao tem rotulo, o nome da subcamada e a melhor
          // etiqueta disponivel: e assim que camada de uma classe so aparece.
          rotulo: String(simbolo.label || '').trim() || String(bloco.layerName || '').trim(),
          imagem,
        });
      }
    }
    const legenda = { total: simbolos.length, simbolos: simbolos.slice(0, teto) };
    legendaEmMemoria.set(camada.caminho, legenda);
    return legenda;
  } catch {
    return null;
  }
}

/** Legendas das camadas ligadas, buscadas conforme elas entram. */
export function useLegendas(camadas) {
  const [legendas, setLegendas] = useState(() => new Map());

  useEffect(() => {
    const controle = new AbortController();
    let vivo = true;
    for (const camada of camadas || []) {
      if (legendas.has(camada.id)) continue;
      carregarLegenda(camada, { sinal: controle.signal }).then((legenda) => {
        if (!vivo || !legenda) return;
        setLegendas((anteriores) => {
          if (anteriores.has(camada.id)) return anteriores;
          const novo = new Map(anteriores);
          novo.set(camada.id, legenda);
          return novo;
        });
      });
    }
    return () => { vivo = false; controle.abort(); };
    // `legendas` fica de fora de proposito: ela e escrita aqui dentro, e
    // incluir a dependencia reiniciaria o efeito a cada legenda que chega.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camadas]);

  return legendas;
}
