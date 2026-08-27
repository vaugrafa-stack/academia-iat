// Busca unica do mapa.
//
// A entrada digitada nunca e enviada como termo de consulta. Coordenadas e
// identificadores ficam no navegador; quando a rede esta disponivel, baixamos
// indices publicos com consultas fixas (where=1=1) e filtramos tudo localmente.
// Isso permite pesquisar o GeoPR sem transformar o campo numa caixa que pode
// vazar, por engano, protocolo, CPF ou coordenada para um servico externo.

import { lerCoordenada } from './coordenadas.js';
import {
  atributosLegiveis,
  camadaDoAcervo,
  carregarAcervo,
  filtrarAcervo,
  GEOPR_BASE,
  limparCacheAcervoParaTestes,
} from './geoprCamadas.js';
import { CAMADAS_GEOPR, camadaPorId } from './geoprCatalogo.js';

export const LIMITE_RESULTADOS_MAPA = 30;
const PRAZO_INDICE_MS = 14000;
const TAMANHO_PAGINA_INDICE = 1000;
const MAXIMO_PAGINAS_INDICE = 20;
const TTL_INDICE_PARCIAL_MS = 45000;

export const normalizarBuscaMapa = (valor) => String(valor || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('pt-BR')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const PADROES_IDENTIFICAVEIS = [
  /\d{3}\.\d{3}\.\d{3}-\d{2}/,             // CPF
  /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/,   // CNPJ
  /\d{2}\.\d{3}\.\d{3}-\d(?:\D|$)/,      // protocolo estadual
  /\b\d{5}-\d{3}\b/,                        // CEP
  /\([1-9]\d\)\s?\d{4,5}-\d{4}/,          // telefone
  /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/,         // e-mail
];

export function entradaContemIdentificador(valor) {
  const texto = String(valor || '');
  if (PADROES_IDENTIFICAVEIS.some((padrao) => padrao.test(texto))) return true;
  // Tambem protege formas copiadas sem mascara. Restringir o teste a uma
  // entrada composta apenas por numeros e pontuacao evita bloquear nomes como
  // "Cantú 2" ou "PCH 14 Bis".
  const restante = texto.replace(/[\d\s()./+\-]/g, '');
  const quantidade = texto.replace(/\D/g, '').length;
  return !restante && [8, 9, 10, 11, 14].includes(quantidade);
}

/** Coordenada sempre tem precedencia; texto identificavel nunca dispara rede. */
export function classificarEntradaMapa(valor) {
  const texto = String(valor || '').trim();
  if (!texto) return { tipo: 'vazia', texto };
  const coordenada = lerCoordenada(texto);
  if (coordenada) return { tipo: 'coordenada', texto, coordenada };
  if (entradaContemIdentificador(texto)) return { tipo: 'protegida', texto };
  const normalizada = normalizarBuscaMapa(texto);
  if (normalizada.length < 2) return { tipo: 'curta', texto, normalizada };
  return { tipo: 'texto', texto, normalizada };
}

function pontuar(alvoBruto, consulta) {
  const alvo = normalizarBuscaMapa(alvoBruto);
  if (!alvo || !consulta) return null;
  if (alvo === consulta) return 0;
  if (alvo.startsWith(consulta)) return 1;
  if (alvo.split(' ').some((palavra) => palavra.startsWith(consulta))) return 2;
  if (alvo.includes(consulta)) return 3;
  const palavras = consulta.split(' ').filter(Boolean);
  return palavras.length && palavras.every((palavra) => alvo.includes(palavra)) ? 4 : null;
}

const ORDEM_TIPO = new Map([
  ['municipio', 0],
  ['empreendimento', 1],
  ['empreendimento-geopr', 2],
  ['bacia', 3],
  ['area-protegida', 4],
  ['zoneamento', 5],
  ['camada', 6],
]);

const compararResultados = (a, b) => (
  (a.ordem ?? 99) - (b.ordem ?? 99)
  || (ORDEM_TIPO.get(a.tipo) ?? 99) - (ORDEM_TIPO.get(b.tipo) ?? 99)
  || a.titulo.localeCompare(b.titulo, 'pt-BR')
);

export function nomesDeMunicipios(valor) {
  return String(valor || '')
    .split(',')
    .map((nome) => nome.replace(/\s*-\s*PR\s*$/i, '').trim())
    .filter(Boolean);
}

function centroDosPontos(pontos) {
  const validos = (pontos || []).filter((ponto) => Number.isFinite(ponto?.x) && Number.isFinite(ponto?.y));
  if (!validos.length) return null;
  return {
    x: validos.reduce((soma, ponto) => soma + ponto.x, 0) / validos.length,
    y: validos.reduce((soma, ponto) => soma + ponto.y, 0) / validos.length,
  };
}

const ALIASES_CAMADAS = new Map([
  ['apps-hidricas-fbds', 'app apps area preservacao permanente hidrica curso agua rio nascente faixa protegida'],
  ['uso-apps-hidricas-fbds', 'app apps area preservacao permanente uso cobertura solo intervencao'],
  ['apps-rios-litoral', 'app apps area preservacao permanente rios litoral faixa protegida'],
  ['nascentes', 'app nascente raio protecao area preservacao permanente'],
  ['zoneamento-plano-manejo', 'zona protecao amortecimento zoneamento plano manejo uc apa area protegida'],
  ['ucs-estaduais', 'uc unidade conservacao area protegida zona amortecimento protecao estadual'],
  ['ucs-federais', 'uc unidade conservacao area protegida zona amortecimento protecao federal'],
  ['pacuera', 'zona protecao reservatorio entorno app pacuera uso conservacao'],
  ['reserva-mata-atlantica', 'corredor area protegida mata atlantica conectividade'],
]);

function origemDaCamada(camada) {
  return {
    id: String(camada?.id || ''),
    titulo: String(camada?.titulo || ''),
    fonte: camada?.fonte == null ? null : String(camada.fonte),
    paraQue: String(camada?.paraQue || ''),
    caminho: String(camada?.caminho || ''),
  };
}

function achadoSeguro(camada, nomeDaSubcamada, atributos) {
  const [achado] = atributosLegiveis({
    results: [{ layerName: nomeDaSubcamada || camada?.titulo || '', attributes: atributos || {} }],
  }, 12, camada);
  return achado ? { ...achado, origem: origemDaCamada(camada) } : null;
}

function resultadoMunicipio(nome, pontos = [], areaKm2 = null, achado = null) {
  const normalizado = normalizarBuscaMapa(nome);
  const camada = camadaPorId('municipios');
  const quantidade = pontos.length;
  const partes = [];
  if (Number.isFinite(areaKm2)) partes.push(`${areaKm2.toLocaleString('pt-BR')} km²`);
  if (quantidade) partes.push(`${quantidade} ${quantidade === 1 ? 'empreendimento' : 'empreendimentos'} no registro ANEEL`);
  if (!partes.length) partes.push('limite municipal publicado no GeoPR');
  return {
    id: `municipio:${normalizado}`,
    tipo: 'municipio',
    categoria: 'Município',
    titulo: nome,
    resumo: partes.join(' · '),
    alvo: `${nome} municipio cidade ${partes.join(' ')}`,
    pontos,
    centro: centroDosPontos(pontos),
    camada,
    localizador: camada ? { camada, camadaId: '0', campo: 'nome', valor: nome } : null,
    achado,
  };
}

/** Resultados que funcionam integralmente offline. */
export function resultadosLocaisMapa({ dados, termo, camadas = CAMADAS_GEOPR, limite = LIMITE_RESULTADOS_MAPA }) {
  const consulta = normalizarBuscaMapa(termo);
  if (consulta.length < 2) return [];
  const resultados = [];
  const usinas = Array.isArray(dados?.usinas) ? dados.usinas : [];

  usinas.forEach((usina, indice) => {
    const peloNome = pontuar(usina.nome, consulta);
    const peloMunicipio = pontuar(usina.mun, consulta);
    const pelaBacia = pontuar(`${usina.baciaPR || ''} ${usina.bacia || ''}`, consulta);
    const candidatos = [
      peloNome,
      peloMunicipio == null ? null : peloMunicipio + 4,
      pelaBacia == null ? null : pelaBacia + 6,
    ].filter(Number.isFinite);
    if (!candidatos.length) return;
    resultados.push({
      id: `aneel:${indice}`,
      tipo: 'empreendimento',
      categoria: 'Empreendimento',
      titulo: usina.nome,
      resumo: [usina.tipo, usina.mw != null ? `${usina.mw.toLocaleString('pt-BR')} MW` : null, usina.mun]
        .filter(Boolean).join(' · '),
      alvo: `${usina.nome} ${usina.mun || ''} ${usina.bacia || ''} ${usina.baciaPR || ''}`,
      ordem: Math.min(...candidatos),
      registro: usina,
      indice,
    });
  });

  const municipios = new Map();
  usinas.forEach((usina) => nomesDeMunicipios(usina.mun).forEach((nome) => {
    const chave = normalizarBuscaMapa(nome);
    const atual = municipios.get(chave) || { nome, pontos: [] };
    atual.pontos.push(usina);
    municipios.set(chave, atual);
  }));
  municipios.forEach(({ nome, pontos }) => {
    const ordem = pontuar(nome, consulta);
    if (ordem == null) return;
    resultados.push({ ...resultadoMunicipio(nome, pontos), ordem });
  });

  (dados?.bacias || []).forEach((bacia) => {
    const ordem = pontuar(`${bacia.nome} bacia hidrografica`, consulta);
    if (ordem == null) return;
    const pontos = usinas.filter((usina) => usina.baciaPR === bacia.nome);
    resultados.push({
      id: `bacia:${normalizarBuscaMapa(bacia.nome)}`,
      tipo: 'bacia',
      categoria: 'Bacia hidrográfica',
      titulo: bacia.nome,
      resumo: [
        Number.isFinite(bacia.area) ? `${bacia.area.toLocaleString('pt-BR')} km²` : null,
        `${bacia.usinas ?? pontos.length} ${(bacia.usinas ?? pontos.length) === 1 ? 'usina' : 'usinas'}`,
      ].filter(Boolean).join(' · '),
      alvo: `${bacia.nome} bacia hidrografica`,
      ordem,
      registro: bacia,
      pontos,
      centro: centroDosPontos(pontos),
    });
  });

  (camadas || []).forEach((camada) => {
    const alvo = `${camada.titulo} ${camada.paraQue || ''} ${ALIASES_CAMADAS.get(camada.id) || ''}`;
    const ordem = pontuar(alvo, consulta);
    if (ordem == null) return;
    resultados.push({
      id: `camada:${camada.id}`,
      tipo: 'camada',
      categoria: 'Camada GeoPR',
      titulo: camada.titulo,
      resumo: camada.paraQue || 'Camada oficial publicada no GeoPR.',
      alvo,
      ordem: ordem + 2,
      camada,
    });
  });

  return resultados.sort(compararResultados).slice(0, Math.max(1, limite));
}

function caminhoCodificado(caminho) {
  return String(caminho || '').split('/').map(encodeURIComponent).join('/');
}

function urlConsultaFixa(
  camada,
  outFields,
  { geometria = false, deslocamento = 0, tamanho = TAMANHO_PAGINA_INDICE } = {},
) {
  const parametros = new URLSearchParams({
    f: 'json',
    where: '1=1',
    outFields: outFields.join(','),
    returnGeometry: geometria ? 'true' : 'false',
    orderByFields: 'objectid ASC',
    resultOffset: String(deslocamento),
    resultRecordCount: String(tamanho),
  });
  if (geometria) parametros.set('outSR', '3857');
  return `${GEOPR_BASE}/rest/services/${caminhoCodificado(camada.caminho)}/MapServer/0/query?${parametros}`;
}

async function buscarJsonFixo(url, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch indisponível');
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), PRAZO_INDICE_MS);
  try {
    const resposta = await fetchImpl(url, {
      credentials: 'omit',
      mode: 'cors',
      signal: controle.signal,
    });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const corpo = await resposta.json();
    if (corpo?.error) throw new Error('resposta de erro');
    return corpo;
  } finally {
    clearTimeout(relogio);
  }
}

function urlDoServico(camada) {
  return `${GEOPR_BASE}/rest/services/${caminhoCodificado(camada.caminho)}/MapServer?f=json`;
}

let indiceOficialEmMemoria = null;
let promessaIndiceOficial = null;
let indiceOficialAtualizadoEm = 0;

function indiceVazio() {
  return { municipios: [], empreendimentos: [], areas: [], zonas: [], acervo: [], parcial: true };
}

function listaDe(resposta) {
  return Array.isArray(resposta?.features) ? resposta.features : [];
}

/**
 * O ArcGIS limita a quantidade devolvida por consulta. Paginar evita que uma
 * camada pare silenciosamente no milésimo registro. A URL continua fixa:
 * nenhum fragmento do que a pessoa digitou participa desta chamada.
 */
async function buscarIndiceFixo(camada, outFields, { geometria = false } = {}, fetchImpl = globalThis.fetch) {
  const features = [];
  let respostaFinal = null;
  let completo = false;
  let assinaturaAnterior = null;

  for (let pagina = 0; pagina < MAXIMO_PAGINAS_INDICE; pagina += 1) {
    let resposta;
    try {
      resposta = await buscarJsonFixo(urlConsultaFixa(camada, outFields, {
        geometria,
        deslocamento: features.length,
      }), fetchImpl);
    } catch (erro) {
      if (!features.length) throw erro;
      return { ...(respostaFinal || {}), features, indiceParcial: true };
    }

    respostaFinal = resposta;
    const lote = listaDe(resposta);
    if (!lote.length) {
      completo = true;
      break;
    }

    // Alguns ArcGIS antigos ignoram resultOffset. Parar uma pagina repetida e
    // declarar o indice parcial e mais seguro do que duplicar dados em loop.
    const assinatura = JSON.stringify([lote[0], lote[lote.length - 1], lote.length]);
    if (assinaturaAnterior && assinatura === assinaturaAnterior) break;
    assinaturaAnterior = assinatura;
    features.push(...lote);

    if (resposta?.exceededTransferLimit !== true && lote.length < TAMANHO_PAGINA_INDICE) {
      completo = true;
      break;
    }
  }

  return {
    ...(respostaFinal || {}),
    features,
    indiceParcial: !completo,
  };
}

/**
 * Baixa somente indices publicos por URLs fixas. O texto da pessoa nao entra
 * em URL, corpo, storage ou cache; o filtro acontece depois, neste modulo.
 */
export async function carregarIndiceOficialMapa({ fetchImpl = globalThis.fetch } = {}) {
  if (indiceOficialEmMemoria) {
    const cacheValido = !indiceOficialEmMemoria.parcial
      || Date.now() - indiceOficialAtualizadoEm < TTL_INDICE_PARCIAL_MS;
    if (cacheValido) return indiceOficialEmMemoria;
    indiceOficialEmMemoria = null;
  }
  if (promessaIndiceOficial) return promessaIndiceOficial;

  const municipios = camadaPorId('municipios');
  const geradoras = camadaPorId('geradoras');
  const estaduais = camadaPorId('ucs-estaduais');
  const federais = camadaPorId('ucs-federais');
  const zoneamento = camadaPorId('zoneamento-plano-manejo');
  const pacuera = camadaPorId('pacuera');

  const tarefas = [
    municipios && buscarIndiceFixo(municipios, ['nome', 'area_km2'], {}, fetchImpl),
    geradoras && buscarIndiceFixo(geradoras, [
      'nome', 'tipo', 'situação', 'município', 'rio', 'bacia', 'pot_solic', 'tipos_de_l',
    ], { geometria: true }, fetchImpl),
    estaduais && buscarIndiceFixo(estaduais, [
      'nome_uc', 'municipio', 'tipo', 'categoria', 'situação', 'ano', 'area_decre', 'za',
    ], {}, fetchImpl),
    federais && buscarIndiceFixo(federais, [
      'nome_uc', 'municipio', 'esfera', 'grupo', 'categoria', 'situacao', 'area_ha', 'pl_manejo',
    ], {}, fetchImpl),
    zoneamento && buscarJsonFixo(urlDoServico(zoneamento), fetchImpl),
    pacuera && buscarJsonFixo(urlDoServico(pacuera), fetchImpl),
    carregarAcervo({ fetchImpl }),
  ].map((tarefa) => tarefa || Promise.resolve(null));

  promessaIndiceOficial = Promise.allSettled(tarefas).then((respostas) => {
    const valor = (indice) => respostas[indice]?.status === 'fulfilled' ? respostas[indice].value : null;
    const indice = indiceVazio();
    let fontesProntas = 0;

    listaDe(valor(0)).forEach((feicao) => {
      const nome = String(feicao?.attributes?.nome || '').trim();
      if (!nome) return;
      const area = Number(feicao.attributes.area_km2);
      const achado = achadoSeguro(municipios, municipios.titulo, feicao.attributes);
      indice.municipios.push(resultadoMunicipio(nome, [], Number.isFinite(area) ? area : null, achado));
    });
    if (valor(0)) fontesProntas += 1;

    listaDe(valor(1)).forEach((feicao, posicao) => {
      const atributos = feicao?.attributes || {};
      const nome = String(atributos.nome || '').trim();
      const x = Number(feicao?.geometry?.x);
      const y = Number(feicao?.geometry?.y);
      if (!nome || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const resumo = [atributos.tipo, atributos.situação, atributos.município].filter(Boolean).join(' · ');
      indice.empreendimentos.push({
        id: `geopr:geradora:${normalizarBuscaMapa(nome)}:${posicao}`,
        tipo: 'empreendimento-geopr',
        categoria: 'Empreendimento GeoPR',
        titulo: nome,
        resumo: resumo || 'Registro da camada de geradoras do IAT.',
        alvo: [
          atributos.nome, atributos.tipo, atributos.situação, atributos.município,
          atributos.rio, atributos.bacia,
        ].filter(Boolean).join(' '),
        camada: geradoras,
        pontoMercator: { x, y },
        achado: achadoSeguro(geradoras, geradoras.titulo, atributos),
      });
    });
    if (valor(1)) fontesProntas += 1;

    [
      [valor(2), estaduais],
      [valor(3), federais],
    ].forEach(([resposta, camada]) => {
      listaDe(resposta).forEach((feicao) => {
        const atributos = feicao?.attributes || {};
        const nome = String(atributos.nome_uc || '').trim();
        if (!nome) return;
        indice.areas.push({
          id: `area:${camada.id}:${normalizarBuscaMapa(nome)}`,
          tipo: 'area-protegida',
          categoria: 'Área protegida',
          titulo: nome,
          resumo: [atributos.categoria || atributos.tipo || atributos.grupo, atributos.municipio]
            .filter(Boolean).join(' · ') || camada.titulo,
          alvo: [
            atributos.nome_uc, atributos.municipio, atributos.tipo, atributos.categoria,
            atributos.grupo, atributos.esfera, atributos.situação, atributos.situacao,
          ].filter(Boolean).join(' '),
          camada,
          localizador: { camada, camadaId: '0', campo: 'nome_uc', valor: nome },
          achado: achadoSeguro(camada, camada.titulo, atributos),
        });
      });
      if (resposta) fontesProntas += 1;
    });

    [
      [valor(4), zoneamento, 'Zoneamento/Plano'],
      [valor(5), pacuera, 'PACUERA'],
    ].forEach(([resposta, pai, categoria]) => {
      (resposta?.layers || []).forEach((subcamada) => {
        if (!Number.isInteger(subcamada?.id) || !String(subcamada?.name || '').trim()) return;
        const camada = {
          ...pai,
          id: `${pai.id}:${subcamada.id}`,
          titulo: String(subcamada.name).trim(),
          camadas: String(subcamada.id),
        };
        indice.zonas.push({
          id: `zona:${camada.id}`,
          tipo: 'zoneamento',
          categoria: `${categoria} GeoPR`,
          titulo: camada.titulo,
          resumo: pai.titulo,
          alvo: `${camada.titulo} ${pai.titulo} plano zoneamento protecao`,
          camada,
          localizador: { camada, camadaId: String(subcamada.id), where: '1=1' },
        });
      });
      if (resposta) fontesProntas += 1;
    });

    const itensAcervo = Array.isArray(valor(6)) ? valor(6) : [];
    indice.acervo = itensAcervo;
    if (itensAcervo.length) fontesProntas += 1;
    indice.parcial = fontesProntas < tarefas.length
      || respostas.some(({ status, value }) => status === 'fulfilled' && value?.indiceParcial);

    if (fontesProntas) {
      indiceOficialEmMemoria = indice;
      indiceOficialAtualizadoEm = Date.now();
    }
    promessaIndiceOficial = null;
    return indice;
  }).catch(() => {
    promessaIndiceOficial = null;
    return indiceVazio();
  });

  return promessaIndiceOficial;
}

function filtrarIndice(lista, consulta, acrescimo = 0, limite = 10) {
  return (lista || [])
    .map((resultado) => ({
      ...resultado,
      ordem: pontuar(`${resultado.titulo} ${resultado.alvo || ''} ${resultado.resumo || ''}`, consulta),
    }))
    .filter((resultado) => resultado.ordem != null)
    .map((resultado) => ({ ...resultado, ordem: resultado.ordem + acrescimo }))
    .sort(compararResultados)
    .slice(0, limite);
}

function resultadoDoAcervo(item, consulta) {
  const camada = camadaDoAcervo(item);
  if (!camada) return null;
  return {
    id: `camada:${camada.id}`,
    tipo: 'camada',
    categoria: 'Camada GeoPR',
    titulo: camada.titulo,
    resumo: `Serviço do acervo: ${item.pasta || 'GeoPR'}`,
    alvo: `${item.nome || ''} ${item.pasta || ''}`,
    ordem: (pontuar(`${item.nome || ''} ${item.pasta || ''}`, consulta) ?? 8) + 6,
    camada,
  };
}

function unirResultados(locais, oficiais) {
  const porId = new Map();
  [...(locais || []), ...(oficiais || [])].forEach((resultado) => {
    const anterior = porId.get(resultado.id);
    if (!anterior) {
      porId.set(resultado.id, resultado);
      return;
    }
    // Municipio local ganha o centro dos empreendimentos; o indice oficial
    // acrescenta area, atributos e localizador da poligonal.
    porId.set(resultado.id, {
      ...anterior,
      ...resultado,
      pontos: anterior.pontos?.length ? anterior.pontos : resultado.pontos,
      centro: anterior.centro || resultado.centro,
      resumo: [anterior.resumo, resultado.resumo]
        .filter(Boolean)
        .filter((valor, indice, todos) => todos.indexOf(valor) === indice)
        .join(' · '),
      ordem: Math.min(anterior.ordem ?? 99, resultado.ordem ?? 99),
    });
  });
  return [...porId.values()].sort(compararResultados);
}

/** Pesquisa local imediata e, opcionalmente, amplia com indices oficiais. */
export async function pesquisarMapa({
  dados,
  termo,
  incluirOficiais = false,
  limite = LIMITE_RESULTADOS_MAPA,
  fetchImpl = globalThis.fetch,
} = {}) {
  const classificacao = classificarEntradaMapa(termo);
  if (classificacao.tipo !== 'texto') {
    return {
      classificacao, resultados: [], total: 0, limitado: false, oficial: 'nao-consultado',
    };
  }
  const locais = resultadosLocaisMapa({ dados, termo, limite: Number.MAX_SAFE_INTEGER });
  if (!incluirOficiais) {
    return {
      classificacao,
      resultados: locais.slice(0, limite),
      total: locais.length,
      limitado: locais.length > limite,
      oficial: 'nao-consultado',
    };
  }

  const indice = await carregarIndiceOficialMapa({ fetchImpl });
  const consulta = classificacao.normalizada;
  const oficiais = [
    ...filtrarIndice(indice.municipios, consulta, 0, Number.MAX_SAFE_INTEGER),
    ...filtrarIndice(indice.empreendimentos, consulta, 1, Number.MAX_SAFE_INTEGER),
    ...filtrarIndice(indice.areas, consulta, 2, Number.MAX_SAFE_INTEGER),
    ...filtrarIndice(indice.zonas, consulta, 3, Number.MAX_SAFE_INTEGER),
  ];

  filtrarAcervo(indice.acervo, termo, Number.MAX_SAFE_INTEGER).forEach((item) => {
    const resultado = resultadoDoAcervo(item, consulta);
    if (resultado) oficiais.push(resultado);
  });

  const unidos = unirResultados(locais, oficiais);
  return {
    classificacao,
    resultados: unidos.slice(0, limite),
    total: unidos.length,
    limitado: unidos.length > limite,
    oficial: indice.parcial ? 'parcial' : 'pronto',
  };
}

function whereDoLocalizador(localizador) {
  if (localizador?.where) return localizador.where;
  const campo = String(localizador?.campo || '');
  if (!/^[\p{L}_][\p{L}\p{N}_]*$/u.test(campo)) return null;
  const valor = String(localizador?.valor || '').trim();
  if (!valor) return null;
  const seguro = valor.replace(/'/g, "''").toLocaleUpperCase('pt-BR');
  return `UPPER(${campo})='${seguro}'`;
}

/** Resolve o centro/extensao somente depois que uma opcao oficial foi escolhida. */
export async function localizarResultadoMapa(resultado, { fetchImpl = globalThis.fetch } = {}) {
  if (resultado?.pontoMercator
    && Number.isFinite(resultado.pontoMercator.x)
    && Number.isFinite(resultado.pontoMercator.y)) {
    return { pontoMercator: resultado.pontoMercator, caixaMercator: null };
  }
  const localizador = resultado?.localizador;
  const camada = localizador?.camada || resultado?.camada;
  const where = whereDoLocalizador(localizador);
  if (!camada?.caminho || !where) return null;
  const parametros = new URLSearchParams({
    f: 'json',
    where,
    returnExtentOnly: 'true',
    outSR: '3857',
  });
  const id = String(localizador.camadaId ?? camada.camadas ?? '0').split(',')[0];
  const url = `${GEOPR_BASE}/rest/services/${caminhoCodificado(camada.caminho)}/MapServer/${encodeURIComponent(id)}/query?${parametros}`;
  try {
    const resposta = await buscarJsonFixo(url, fetchImpl);
    const caixa = resposta?.extent;
    const referencia = caixa?.spatialReference || resposta?.spatialReference;
    const wkid = Number(referencia?.latestWkid ?? referencia?.wkid);
    if (Number.isFinite(wkid) && ![3857, 102100, 102113].includes(wkid)) return null;
    const numeros = [caixa?.xmin, caixa?.ymin, caixa?.xmax, caixa?.ymax].map(Number);
    if (!numeros.every(Number.isFinite)) return null;
    const [minX, minY, maxX, maxY] = numeros;
    if (!(maxX > minX) || !(maxY > minY)) return null;
    if (numeros.some((valor) => Math.abs(valor) > 21000000)) return null;
    return {
      caixaMercator: { minX, minY, maxX, maxY },
      pontoMercator: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    };
  } catch {
    return null;
  }
}

/** Usado somente pelos testes para impedir que um mock atravesse outro caso. */
export function limparCachePesquisaMapaParaTestes() {
  indiceOficialEmMemoria = null;
  promessaIndiceOficial = null;
  indiceOficialAtualizadoEm = 0;
  limparCacheAcervoParaTestes();
}
