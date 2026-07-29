// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { normalizedVttByteLength } from '../tools/build-offline-packages.mjs';

describe('catálogo offline multiplataforma', () => {
  it('mede legendas com o mesmo tamanho em Windows e Linux', () => {
    const linux = 'WEBVTT\n\n00:00.000 --> 00:01.000\nOlá, Paraná.\n';
    const windows = linux.replaceAll('\n', '\r\n');

    expect(normalizedVttByteLength(windows)).toBe(normalizedVttByteLength(linux));
    expect(normalizedVttByteLength(windows)).toBe(Buffer.byteLength(linux, 'utf8'));
  });

  it('normaliza também quebras CR antigas', () => {
    expect(normalizedVttByteLength('WEBVTT\r\rTexto\r')).toBe(
      Buffer.byteLength('WEBVTT\n\nTexto\n', 'utf8'),
    );
  });
});
