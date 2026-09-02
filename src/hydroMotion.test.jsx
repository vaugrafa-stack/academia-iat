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
  it('consolida funcionamento e anatomia no corte realista de dezessete equipamentos', async () => {
    const host = await mountGuide();

    expect(host.querySelector('#hydro-anatomia')).toBeNull();
    expect(host.querySelectorAll('.hec-callout')).toHaveLength(17);
    expect(host.querySelectorAll('.hec-equipment-key button')).toHaveLength(17);
    expect(host.querySelector('.hec-heading')?.textContent)
      .toContain('Funcionamento e anatomia de uma usina hidrelétrica');
  });

  it('seleciona equipamento, pausa e altera a velocidade no corte consolidado', async () => {
    const host = await mountGuide();
    const shell = host.querySelector('.hec-shell');
    const vertedouro = [...host.querySelectorAll('.hec-equipment-key button')]
      .find((button) => button.textContent.includes('Vertedouro'));

    expect(shell?.dataset.playing).toBe('true');
    await act(async () => vertedouro.click());

    expect(shell?.dataset.playing).toBe('false');
    expect(host.querySelector('.hec-stage-panel > div > strong')?.textContent).toContain('Vertedouro');
    expect(host.querySelector('[id$="-equipment-description"]')?.textContent)
      .toContain('excedente');

    const speed = host.querySelector('.hec-flow-control input');
    await act(async () => setRangeValue(speed, 80));

    expect(speed.getAttribute('aria-valuetext')).toBe('80% da velocidade visual');
    expect(shell.style.getPropertyValue('--hec-flow-duration')).toBeTruthy();
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
