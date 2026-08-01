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

export async function fetchJson(
  url,
  label,
  { fetchImpl = fetch, optional = false, timeoutMs = 15_000 } = {},
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      credentials: 'same-origin',
      signal: controller.signal,
    });
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
    const normalized = error instanceof AppDataError
      ? error
      : new AppDataError(
        error?.name === 'AbortError'
          ? `O carregamento de ${label} excedeu ${Math.round(timeoutMs / 1000)} segundos.`
          : `Não foi possível carregar ${label}.`,
        {
          code: error?.name === 'AbortError' ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
          cause: error,
          details: [{ label, url: String(url), timeoutMs }],
        },
      );
    if (optional) {
      return {
        __loadWarning: {
          code: normalized.code,
          message: normalized.message,
          label,
        },
      };
    }
    throw normalized;
  } finally {
    clearTimeout(timer);
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
  assertRecord(aulaMedia, 'índice de resumos em vídeo');
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
  if (!value || typeof value !== 'object') return value;
  const seen = new WeakMap();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return node;
    if (seen.has(node)) return seen.get(node);
    if (Array.isArray(node)) {
      const clone = [];
      seen.set(node, clone);
      clone.push(...node.map(walk));
      return clone;
    }
    const clone = {};
    seen.set(node, clone);
    for (const [key, child] of Object.entries(node)) {
      if (
        normalizedBase
        && PATH_KEYS.has(key)
        && typeof child === 'string'
        && child.startsWith('/')
        && !child.startsWith(`${normalizedBase}/`)
      ) {
        clone[key] = normalizedBase + child;
      } else {
        clone[key] = walk(child);
      }
    }
    return clone;
  };
  return walk(value);
}

export async function loadAppData({
  popDataUrl,
  flowDataUrl,
  aulaMediaUrl,
  // O banco de questoes deixou de ser modulo JavaScript e virou arquivo
  // buscado, para sair do orcamento de JS. Entra aqui, e nao sob demanda,
  // porque a tela de aula usa uma questao comentada em cada topico: adiar so
  // trocaria o custo de lugar. Vai no mesmo Promise.all, entao nao acrescenta
  // uma ida a rede em serie.
  questionBankUrl,
  base = '',
  featuredMedia,
  fetchImpl = fetch,
}) {
  const [popData, flowData, loadedAulaMedia, loadedQuestionBank] = await Promise.all([
    fetchJson(popDataUrl, 'o conteúdo do POP', { fetchImpl }),
    fetchJson(flowDataUrl, 'os fluxogramas', { fetchImpl }),
    fetchJson(aulaMediaUrl, 'o índice de resumos em vídeo', { fetchImpl, optional: true }),
    questionBankUrl
      ? fetchJson(questionBankUrl, 'o banco de questões', { fetchImpl })
      : Promise.resolve([]),
  ]);
  const warnings = loadedAulaMedia.__loadWarning
    ? [loadedAulaMedia.__loadWarning]
    : [];
  const aulaMedia = { ...loadedAulaMedia };
  delete aulaMedia.__loadWarning;
  const validated = validateAppData({ popData, flowData, aulaMedia });
  if (questionBankUrl && !Array.isArray(loadedQuestionBank)) {
    throw new AppDataError('O banco de questões não veio como lista.', {
      code: 'SCHEMA_ERROR',
      details: [{ label: 'o banco de questões', expected: 'array' }],
    });
  }
  return {
    popData: applyBasePath(validated.popData, base),
    flowData: applyBasePath(validated.flowData, base),
    aulaMedia: applyBasePath(validated.aulaMedia, base),
    featuredMedia: applyBasePath(featuredMedia, base),
    questionBank: loadedQuestionBank,
    warnings,
  };
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
