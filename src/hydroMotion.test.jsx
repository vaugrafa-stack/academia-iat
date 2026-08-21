// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HydroGuide from './hydro.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const roots = [];

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function mountGuide() {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    disconnect() {}
  });
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => root.render(<HydroGuide go={() => {}} />));
  return host;
}

function setRangeValue(range, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(range, String(value));
  range.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('sistema de movimento da rota Hidrelétricas', () => {
  it('identifica os nove equipamentos da Anatomia no corte e na legenda móvel', async () => {
    const host = await mountGuide();

    expect(host.querySelectorAll('.cs-hot')).toHaveLength(9);
    expect(host.querySelectorAll('.cs-mobile-equipment button')).toHaveLength(9);
    expect(host.querySelector('.cross-wrap')?.dataset.selected).toBe('turbina');
    expect(host.querySelector('.cross-stage-label')?.textContent).toContain('Turbina + gerador');
    expect(host.querySelector('.cs-focus-ring')).not.toBeNull();
  });

  it('destaca a peça selecionada e só ativa o vertedouro no contexto de cheia', async () => {
    const host = await mountGuide();
    const vertedouro = [...host.querySelectorAll('.cs-mobile-equipment button')]
      .find((button) => button.textContent.includes('Vertedouro'));

    expect(host.querySelector('.cs-spill')?.classList.contains('is-active')).toBe(false);
    await act(async () => vertedouro.click());

    expect(host.querySelector('.cross-wrap')?.dataset.selected).toBe('vertedouro');
    expect(host.querySelector('.cs-spill')?.classList.contains('is-active')).toBe(true);
    expect(host.querySelector('#hydro-anatomia-detail h3')?.textContent).toBe('Vertedouro');
  });

  it('pausa e altera a velocidade de todas as camadas da Anatomia', async () => {
    const host = await mountGuide();
    const explorer = host.querySelector('.cross-explorer');
    const stage = explorer.querySelector('.cross-wrap');
    const toggle = explorer.querySelector('.hydro-motion-toggle');
    const speed = explorer.querySelector('.hydro-motion-speed input');

    expect(stage.dataset.playing).toBe('true');
    await act(async () => toggle.click());
    expect(stage.dataset.playing).toBe('false');

    await act(async () => setRangeValue(speed, 2));
    expect(stage.style.getPropertyValue('--hydro-motion-scale')).toBe('0.500');
    expect(speed.getAttribute('aria-valuetext')).toContain('2 vezes');
  });

  it('amplia um barramento por vez e oferece navegação de tabs por teclado', async () => {
    const host = await mountGuide();
    const explorer = host.querySelector('.dam-explorer');
    const tabs = [...explorer.querySelectorAll('[role="tab"]')];

    expect(tabs).toHaveLength(6);
    expect(explorer.querySelectorAll('.dam-stage .dam-mini')).toHaveLength(1);

    await act(async () => tabs[0].dispatchEvent(new KeyboardEvent('keydown', {
      key: 'End',
      bubbles: true,
    })));

    expect(document.activeElement).toBe(tabs.at(-1));
    expect(tabs.at(-1).getAttribute('aria-selected')).toBe('true');
    expect(explorer.querySelector('.dam-selected-panel')?.textContent).toContain('CCR');
  });

  it('mantém o seletor de queda e a galeria na mesma turbina', async () => {
    const host = await mountGuide();
    const kaplanBand = [...host.querySelectorAll('.tp-band')]
      .find((button) => button.textContent.includes('Kaplan'));

    await act(async () => kaplanBand.click());

    const kaplanTab = [...host.querySelectorAll('.tg-tabs [role="tab"]')]
      .find((button) => button.textContent.includes('Kaplan'));
    expect(kaplanBand.getAttribute('aria-pressed')).toBe('true');
    expect(kaplanTab.getAttribute('aria-selected')).toBe('true');
    expect(host.querySelector('.tg-body')?.textContent).toContain('Turbina Kaplan');
  });
});
