const REQUIRED_POP_ARRAYS = ['blocks', 'sections', 'tables', 'figures'];
const REQUIRED_FLOW_ARRAYS = ['flowcharts'];
const PATH_KEYS = new Set(['publicPath', 'src', 'poster', 'captions']);

export class AppDataError extends Error {
  constructor(message, { code = 'APP_DATA_ERROR', cause, details = [] } = {}) {
    super(message, { cause });
    this.name = 'AppDataError';
    this.code = code;
    this.details = details;
  }
}

function isJsonResponse(response) {
  const type = response.headers?.get?.('content-type') || '';
  return !type || type.includes('application/json') || type.includes('+json');
}

export async function fetchJson(url, label, { fetchImpl = fetch, optional = false } = {}) {
  try {
    const response = await fetchImpl(url, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new AppDataError(`${label} respondeu HTTP ${response.status}.`, {
        code: 'HTTP_ERROR',
        details: [{ label, url: String(url), status: response.status }],
      });
    }
    if (!isJsonResponse(response)) {
      throw new AppDataError(`${label} não retornou JSON.`, {
        code: 'CONTENT_TYPE_ERROR',
        details: [{ label, url: String(url), contentType: response.headers?.get?.('content-type') || '' }],
      });
    }
    return await response.json();
  } catch (error) {
    if (optional) return {};
    if (error instanceof AppDataError) throw error;
    throw new AppDataError(`Não foi possível carregar ${label}.`, {
      code: 'NETWORK_ERROR',
      cause: error,
      details: [{ label, url: String(url) }],
    });
  }
}

function assertRecord(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppDataError(`${label} está vazio ou em formato inválido.`, {
      code: 'SCHEMA_ERROR',
      details: [{ label, expected: 'object' }],
    });
  }
}

function assertArrays(value, keys, label) {
  const missing = keys.filter((key) => !Array.isArray(value[key]));
  if (missing.length) {
    throw new AppDataError(`${label} não contém todas as coleções obrigatórias.`, {
      code: 'SCHEMA_ERROR',
      details: missing.map((key) => ({ label, field: key, expected: 'array' })),
    });
  }
}

export function validateAppData({ popData, flowData, aulaMedia }) {
  assertRecord(popData, 'conteúdo do POP');
  assertRecord(flowData, 'fluxogramas');
  assertRecord(aulaMedia, 'índice de videoaulas');
  assertArrays(popData, REQUIRED_POP_ARRAYS, 'conteúdo do POP');
  assertArrays(flowData, REQUIRED_FLOW_ARRAYS, 'fluxogramas');

  if (!popData.sections.length || !popData.blocks.length) {
    throw new AppDataError('O conteúdo do POP foi carregado, mas não contém seções utilizáveis.', {
      code: 'EMPTY_CONTENT',
      details: [{ sections: popData.sections.length, blocks: popData.blocks.length }],
    });
  }

  const sectionIds = new Set(popData.sections.map((section) => section.id));
  const duplicateSectionIds = popData.sections
    .map((section) => section.id)
    .filter((id, index, all) => !id || all.indexOf(id) !== index);
  if (duplicateSectionIds.length || sectionIds.size !== popData.sections.length) {
    throw new AppDataError('O índice do POP contém identificadores de seção ausentes ou repetidos.', {
      code: 'DUPLICATE_SECTION_ID',
      details: duplicateSectionIds.slice(0, 10).map((id) => ({ id })),
    });
  }

  return { popData, flowData, aulaMedia };
}

export function applyBasePath(value, base = '') {
  const normalizedBase = String(base || '').replace(/\/$/, '');
  if (!normalizedBase || !value || typeof value !== 'object') return value;
  const seen = new WeakSet();
  const walk = (node) => {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    for (const key of Object.keys(node)) {
      if (PATH_KEYS.has(key) && typeof node[key] === 'string' && node[key].startsWith('/')) {
        node[key] = normalizedBase + node[key];
      } else {
        walk(node[key]);
      }
    }
  };
  walk(value);
  return value;
}

export async function loadAppData({
  popDataUrl,
  flowDataUrl,
  aulaMediaUrl,
  base = '',
  featuredMedia,
  fetchImpl = fetch,
}) {
  const [popData, flowData, aulaMedia] = await Promise.all([
    fetchJson(popDataUrl, 'o conteúdo do POP', { fetchImpl }),
    fetchJson(flowDataUrl, 'os fluxogramas', { fetchImpl }),
    fetchJson(aulaMediaUrl, 'o índice de videoaulas', { fetchImpl, optional: true }),
  ]);
  const validated = validateAppData({ popData, flowData, aulaMedia });
  applyBasePath(validated.popData, base);
  applyBasePath(validated.flowData, base);
  applyBasePath(validated.aulaMedia, base);
  applyBasePath(featuredMedia, base);
  return validated;
}

export function describeAppDataError(error) {
  if (error instanceof AppDataError) {
    return {
      title: 'A Academia não conseguiu abrir o conteúdo',
      message: error.message,
      code: error.code,
      details: error.details || [],
    };
  }
  return {
    title: 'A Academia encontrou um erro inesperado',
    message: 'Recarregue a página. Se o problema continuar, envie o código abaixo ao suporte.',
    code: 'UNEXPECTED_ERROR',
    details: [],
  };
}
