import { describe, expect, it } from 'vitest';
import { applyBasePath, fetchJson } from './appData.js';

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
