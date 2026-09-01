import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./geopr.css', import.meta.url), 'utf8');

describe('contrato responsivo da coluna do mapa', () => {
  it('so fixa mapa e detalhes quando a janela tem altura util', () => {
    const bloco = css.match(
      /@media\s*\(min-width:\s*981px\)\s*and\s*\(min-height:\s*(\d+)px\)\s*\{[\s\S]*?\.mapa-layout>\.mp-coluna-mapa\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?\n\s*\}/,
    );

    expect(bloco, 'a coluna fixa precisa de um limite minimo de altura').toBeTruthy();
    expect(Number(bloco?.[1] || 0)).toBeGreaterThanOrEqual(800);
    expect(css).not.toMatch(/\.mp-coluna-mapa>\.gp-atributos\s*\{[^}]*overscroll-behavior:\s*contain/s);
  });
});
