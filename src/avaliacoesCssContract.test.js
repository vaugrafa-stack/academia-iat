import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./avaliacoes.css', import.meta.url), 'utf8');
const mobileNavigationCss = readFileSync(new URL('./mobileNavigation.css', import.meta.url), 'utf8');
const hydroNavigationCss = readFileSync(new URL('./hydroNavigation.css', import.meta.url), 'utf8');
const experienceCss = readFileSync(new URL('./experience.css', import.meta.url), 'utf8');

function rgb(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
}

function luminance(hex) {
  const channels = rgb(hex).map((channel) => (
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('contrato visual das autoavaliações', () => {
  it('preserva contraste AA no tema escuro para azul, âmbar e texto secundário', () => {
    expect(contrast('#7dd3fc', '#14252b')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#cbd5e1', '#14252b')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#f1f5f9', '#14252b')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#fbbf24', '#2c281d')).toBeGreaterThanOrEqual(4.5);
  });

  it('mantém o selo de alta confiança legível e delimitado no tema escuro', () => {
    expect(css).toMatch(/:root:not\(\[data-theme="light"\]\) \.re-q \.confidence-tag\.alta\s*\{[^}]*border:\s*1px solid #fbbf24;[^}]*color:\s*#fff7e6;[^}]*background:\s*#5a3508;/s);
    expect(contrast('#fff7e6', '#5a3508')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#fbbf24', '#14252c')).toBeGreaterThanOrEqual(3);
  });

  it('eleva os microtextos essenciais da avaliação no móvel', () => {
    // O contrato nasceu apontando para o literal `13px`. Depois que os 785
    // tamanhos migraram para a escala em token, um literal aqui passaria a
    // cobrar justamente o que o projeto deixou de fazer. O que importa é a
    // intenção: estes três microtextos sobem para um degrau de leitura no
    // móvel, e o degrau não pode encolher abaixo do que era antes.
    expect(css).toMatch(/@media \(max-width: 720px\)[\s\S]*\.confidence-recorded,[\s\S]*\.confidence-priority,[\s\S]*\.re-q \.confidence-tag\s*\{\s*font-size:\s*var\(--texto-3\);/s);
    const escala = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
    const degrau = Number(escala.match(/--texto-3:\s*(\d+)px/)?.[1]);
    expect(degrau).toBeGreaterThanOrEqual(13);
  });
});

describe('contrato visual dos estados ativos e ações', () => {
  it('mantém o destino atual do menu móvel legível, delimitado e com toque mínimo', () => {
    expect(mobileNavigationCss).toMatch(/\.mobile-nav-panel__item\s*\{[^}]*min-height:\s*56px;/s);
    expect(mobileNavigationCss).toMatch(/:root:not\(\[data-theme="light"\]\) \.mobile-nav-panel__item\.current\s*\{[^}]*border-color:\s*#65d19e;[^}]*color:\s*#f1f5f9;[^}]*background:\s*#173d34;/s);
    expect(contrast('#f1f5f9', '#173d34')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#d8e7e2', '#173d34')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#65d19e', '#14252c')).toBeGreaterThanOrEqual(3);
  });

  it('mantém a seção hidrelétrica atual legível, delimitada e com toque mínimo', () => {
    expect(hydroNavigationCss).toMatch(/\.hydro-guide-nav__links button\s*\{[^}]*min-height:\s*44px;/s);
    expect(hydroNavigationCss).toMatch(/:root:not\(\[data-theme="light"\]\) \.hydro-guide-nav__links button\[aria-current='location'\]\s*\{[^}]*color:\s*#f1f5f9;[^}]*background:\s*#173d34;[^}]*box-shadow:\s*inset 0 0 0 1px #65d19e;/s);
    expect(contrast('#f1f5f9', '#173d34')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#65d19e', '#14252c')).toBeGreaterThanOrEqual(3);
  });

  it('usa tinta adequada ao verde de ação nos dois temas', () => {
    expect(experienceCss).toMatch(/\.learning-path-grid article > button:hover\s*\{[^}]*color:\s*var\(--sobre-acento\);[^}]*background:\s*var\(--green\);/s);
    expect(experienceCss).toMatch(/:root\[data-theme="light"\] \.formation-empty button\s*\{\s*color:\s*#fff;/s);
    expect(contrast('#08231b', '#3e9d74')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#ffffff', '#16563c')).toBeGreaterThanOrEqual(4.5);
  });
});
