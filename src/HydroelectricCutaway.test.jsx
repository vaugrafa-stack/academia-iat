// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HydroelectricCutaway, { CUTAWAY_STAGES } from './HydroelectricCutaway.jsx';

const roots = [];

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function mount() {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => root.render(<HydroelectricCutaway />));
  return host;
}

describe('corte animado da usina hidrelétrica', () => {
  it('descreve o processo e mantém rótulos fora da imagem', () => {
    const html = renderToStaticMarkup(<HydroelectricCutaway />);

    expect(CUTAWAY_STAGES).toHaveLength(8);
    expect(html).toContain('/hidro/usina-corte-realista.webp');
    expect(html).toContain('Corte de uma usina: a água sai do reservatório');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<text');
    for (const stage of CUTAWAY_STAGES) expect(html).toContain(stage.component);
  });

  it('permite selecionar uma etapa e pausa o percurso guiado', async () => {
    const host = await mount();
    const target = [...host.querySelectorAll('[role="tab"]')]
      .find((button) => button.textContent.includes('Transformação'));

    await act(async () => target.click());

    expect(target.getAttribute('aria-selected')).toBe('true');
    expect(host.querySelector('.hec-stage-panel strong')?.textContent).toBe('Transformador');
    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('false');
    expect(host.querySelector('.hec-play')?.textContent).toContain('Reproduzir');
  });

  it('pausa e retoma o movimento pelo controle principal', async () => {
    const host = await mount();
    const play = host.querySelector('.hec-play');

    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('true');
    await act(async () => play.click());
    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('false');
    expect(play.textContent).toContain('Reproduzir');
    await act(async () => play.click());
    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('true');
    expect(play.textContent).toContain('Pausar');
  });

  it('move seleção e foco com setas, Home e End no tablist', async () => {
    const host = await mount();
    const tabs = [...host.querySelectorAll('[role="tab"]')];
    tabs[0].focus();

    await act(async () => tabs[0].dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    })));
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');

    await act(async () => tabs[1].dispatchEvent(new KeyboardEvent('keydown', {
      key: 'End',
      bubbles: true,
    })));
    expect(document.activeElement).toBe(tabs.at(-1));
    expect(tabs.at(-1).getAttribute('aria-selected')).toBe('true');

    await act(async () => tabs.at(-1).dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Home',
      bubbles: true,
    })));
    expect(document.activeElement).toBe(tabs[0]);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('desativa reprodução automática quando o sistema solicita menos movimento', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    const host = await mount();

    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('false');
    expect(host.querySelector('.hec-play')?.disabled).toBe(true);
  });
});
