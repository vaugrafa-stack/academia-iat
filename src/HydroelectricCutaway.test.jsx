// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HydroelectricCutaway, {
  CUTAWAY_EQUIPMENT,
  CUTAWAY_STAGES,
} from './HydroelectricCutaway.jsx';

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

async function mount() {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => root.render(<HydroelectricCutaway />));
  return host;
}

describe('corte animado da usina hidrelétrica', () => {
  it('separa a base estática das camadas animadas e mantém os textos fora da imagem', () => {
    const html = renderToStaticMarkup(<HydroelectricCutaway />);

    expect(CUTAWAY_STAGES).toHaveLength(8);
    expect(CUTAWAY_EQUIPMENT).toHaveLength(16);
    expect(html).toContain('/hidro/usina-corte-realista.webp');
    expect(html).toContain('data-visual-layer="base-estatica"');
    expect(html).toContain('Base ilustrada estática');
    expect(html).toContain('Água, turbina, eixo, gerador e energia animados');
    expect(html).toContain('data-motion-layer="agua"');
    expect(html).toContain('data-motion-layer="turbina"');
    expect(html).toContain('data-motion-layer="eixo"');
    expect(html).toContain('data-motion-layer="gerador"');
    expect(html).toContain('data-motion-layer="energia"');
    expect(html).toContain('Corte de uma usina: a água sai do reservatório');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<text');
    for (const equipment of CUTAWAY_EQUIPMENT) expect(html).toContain(equipment.name);
  });

  it('expõe dezesseis chamadas com linhas-guia e uma legenda móvel completa', async () => {
    const host = await mount();

    expect(host.querySelectorAll('.hec-callout')).toHaveLength(16);
    expect(host.querySelectorAll('.hec-leader')).toHaveLength(16);
    expect(host.querySelectorAll('.hec-equipment-key button')).toHaveLength(16);
    expect([...host.querySelectorAll('.hec-equipment-key button')].map((button) => button.textContent))
      .toEqual(expect.arrayContaining([
        expect.stringContaining('Reservatório a montante'),
        expect.stringContaining('Barragem'),
        expect.stringContaining('Grade de proteção'),
        expect.stringContaining('Comporta'),
        expect.stringContaining('Tomada d’água'),
        expect.stringContaining('Ponte rolante'),
        expect.stringContaining('Tubo de sucção'),
        expect.stringContaining('Linhas de transmissão'),
      ]));
  });

  it('permite localizar um equipamento e pausa o percurso guiado', async () => {
    const host = await mount();
    const target = [...host.querySelectorAll('.hec-callout')]
      .find((button) => button.textContent.includes('Transformador'));

    await act(async () => target.click());

    expect(target.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('.hec-stage-panel strong')?.textContent).toBe('Transformador');
    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('false');
    expect(host.querySelector('.hec-play')?.textContent).toContain('Reproduzir');
  });

  it('pausa e retoma todas as camadas pelo controle principal', async () => {
    const host = await mount();
    const play = host.querySelector('.hec-play');

    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('true');
    await act(async () => play.click());
    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('false');
    expect(play.textContent).toContain('Reproduzir');
    await act(async () => play.click());
    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('true');
    expect(host.querySelector('.hec-shell')?.dataset.tourActive).toBe('true');
    expect(play.textContent).toContain('Pausar');
  });

  it('associa cada etapa ao equipamento que ela descreve', async () => {
    const host = await mount();
    const tabs = [...host.querySelectorAll('[role="tab"]')];
    const generation = tabs.find((button) => button.textContent.includes('Geração'));
    const restitution = tabs.find((button) => button.textContent.includes('Restituição'));

    await act(async () => generation.click());
    expect(host.querySelector('.hec-stage-focus')?.dataset.focusEquipment).toBe('gerador');

    await act(async () => restitution.click());
    expect(host.querySelector('.hec-stage-focus')?.dataset.focusEquipment).toBe('canal-fuga');
  });

  it('suspende o movimento quando a cena sai da área visível', async () => {
    let reportVisibility;
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { reportVisibility = callback; }

      observe() {}

      disconnect() { disconnect(); }
    });
    const host = await mount();

    await act(async () => reportVisibility([{ isIntersecting: false }]));

    expect(host.querySelector('.hec-shell')?.dataset.playing).toBe('false');
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('altera de modo acessível a velocidade das camadas visuais', async () => {
    const host = await mount();
    const range = host.querySelector('input[type="range"]');
    const shell = host.querySelector('.hec-shell');
    const before = shell.style.getPropertyValue('--hec-flow-duration');
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

    await act(async () => {
      valueSetter.call(range, '95');
      range.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(range.getAttribute('aria-valuetext')).toBe('95% da velocidade visual');
    expect(host.querySelector('.hec-flow-control strong')?.textContent).toBe('95%');
    expect(shell.style.getPropertyValue('--hec-flow-duration')).not.toBe(before);
  });

  it('move seleção e foco com setas, Home e End no tablist', async () => {
    const host = await mount();
    const tabs = [...host.querySelectorAll('[role="tab"]')];
    await act(async () => tabs[0].focus());

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
    expect(host.querySelector('.hec-shell')?.dataset.motionPreference).toBe('reduced');
    expect(host.querySelector('.hec-play')?.disabled).toBe(true);
    expect(host.querySelector('.hec-playback-status')?.textContent).toContain('Movimento reduzido ativo');
  });
});
