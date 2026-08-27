import { describe, expect, it, vi } from 'vitest';
import {
  applyBasePath,
  fetchJson,
  loadAppData,
  startAppDataRequests,
} from './appData.js';

function pendingFetch(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    }, { once: true });
  });
}

describe('carregamento resiliente dos dados', () => {
  it('reutiliza as requisições antecipadas sem buscar os dados duas vezes', async () => {
    const payloads = new Map([
      ['/pop.json', {
        blocks: [{}],
        sections: [{ id: 'secao-1' }],
        tables: [],
        figures: [],
      }],
      ['/flows.json', { flowcharts: [] }],
      ['/media.json', {}],
      ['/questions.json', []],
    ]);
    const fetchImpl = vi.fn(async (url) => ({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => payloads.get(url),
    }));
    const urls = {
      popDataUrl: '/pop.json',
      flowDataUrl: '/flows.json',
      aulaMediaUrl: '/media.json',
      questionBankUrl: '/questions.json',
    };

    const preloaded = startAppDataRequests({ ...urls, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(4);

    const loaded = await loadAppData({
      ...urls,
      fetchImpl,
      featuredMedia: {},
      preloaded,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(loaded.popData.sections[0].id).toBe('secao-1');
  });

  it('interrompe uma fonte obrigatória que excede o prazo', async () => {
    await expect(
      fetchJson('/pop.json', 'o POP', { fetchImpl: pendingFetch, timeoutMs: 5 }),
    ).rejects.toMatchObject({ code: 'TIMEOUT_ERROR' });
  });

  it('torna a degradação de uma fonte opcional observável', async () => {
    const result = await fetchJson('/media.json', 'a mídia', {
      fetchImpl: pendingFetch,
      timeoutMs: 5,
      optional: true,
    });

    expect(result.__loadWarning).toMatchObject({
      code: 'TIMEOUT_ERROR',
      label: 'a mídia',
    });
  });

  it('aplica a base sem mutar a fonte e permanece idempotente', () => {
    const source = {
      src: '/media/a.mp4',
      nested: [{ poster: '/media/a.jpg' }],
    };

    const once = applyBasePath(source, '/academia-iat');
    const twice = applyBasePath(once, '/academia-iat');

    expect(source.src).toBe('/media/a.mp4');
    expect(once).not.toBe(source);
    expect(twice).toEqual(once);
    expect(twice.nested[0].poster).toBe('/academia-iat/media/a.jpg');
  });
});
