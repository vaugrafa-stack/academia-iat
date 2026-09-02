// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ArrangementSchematics,
  PRCasesSection,
  TurbineGallery,
} from './hydroCases.jsx';

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

async function mount(ui) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => root.render(ui));
  return { host, root };
}

function tabNamed(host, name) {
  return [...host.querySelectorAll('[role="tab"]')]
    .find((tab) => tab.textContent.includes(name));
}

async function setRangeValue(range, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    valueSetter.call(range, String(value));
    range.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('galeria animada de turbinas', () => {
  it('mantém fotos anotadas leves, legíveis e sem colisão de marcadores SVG', async () => {
    const { host } = await mount(<><TurbineGallery /><TurbineGallery /></>);
    const photos = [...host.querySelectorAll('.fa-palco img')];
    const markers = [...host.querySelectorAll('.fa-camada marker')];

    expect(photos).toHaveLength(2);
    expect(photos.every((image) => image.getAttribute('loading') === 'lazy')).toBe(true);
    expect(photos.every((image) => image.getAttribute('decoding') === 'async')).toBe(true);
    expect(photos.every((image) => image.width > 0 && image.height > 0)).toBe(true);
    expect(new Set(markers.map((marker) => marker.id)).size).toBe(2);
    expect(host.querySelectorAll('.fa-mobile-callouts li').length).toBeGreaterThan(0);

    for (const layer of host.querySelectorAll('.fa-camada')) {
      const markerId = layer.querySelector('marker').id;
      expect([...layer.querySelectorAll('[marker-end]')].every((node) => (
        node.getAttribute('marker-end') === `url(#${markerId})`
      ))).toBe(true);
    }
  });

  it('funciona sem props e oferece tabs acessíveis por teclado', async () => {
    const { host } = await mount(<TurbineGallery />);
    const tabs = [...host.querySelectorAll('[role="tab"]')];

    expect(tabs).toHaveLength(4);
    expect(tabs[0].textContent).toBe('Pelton');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(host.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);
    expect(host.querySelector('.hcm-current-state')?.textContent).toContain('turbina Pelton');

    await act(async () => tabs[0].focus());
    await act(async () => tabs[0].dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    })));

    expect(document.activeElement?.textContent).toBe('Francis');
    expect(tabNamed(host, 'Francis').getAttribute('aria-selected')).toBe('true');
    expect(host.querySelector('.hcm-current-state')?.textContent).toContain('turbina Francis');

    await act(async () => tabNamed(host, 'Francis').dispatchEvent(new KeyboardEvent('keydown', {
      key: 'End',
      bubbles: true,
    })));
    expect(document.activeElement?.textContent).toBe('Bulbo');
    expect(tabNamed(host, 'Bulbo').getAttribute('aria-selected')).toBe('true');
  });

  it('aceita seleção controlada sem perder o fallback de estado local', async () => {
    const onSelectType = vi.fn();
    const { host, root } = await mount(
      <TurbineGallery selectedType="Kaplan" onSelectType={onSelectType} />,
    );

    expect(tabNamed(host, 'Kaplan').getAttribute('aria-selected')).toBe('true');
    await act(async () => tabNamed(host, 'Bulbo').click());

    expect(onSelectType).toHaveBeenCalledWith('bulbo');
    expect(tabNamed(host, 'Kaplan').getAttribute('aria-selected')).toBe('true');

    await act(async () => root.render(
      <TurbineGallery selectedType="bulbo" onSelectType={onSelectType} />,
    ));
    expect(tabNamed(host, 'Bulbo').getAttribute('aria-selected')).toBe('true');
    expect(host.querySelector('[data-rotor="bulbo"]')).not.toBeNull();
  });

  it('mantém cada conjunto mecânico coerente e usa o período exato de cada tracejado', async () => {
    const { host } = await mount(<TurbineGallery />);

    expect(host.querySelector('[data-rotor="pelton"]')).not.toBeNull();
    expect(host.querySelector('.jet-anim')?.style.getPropertyValue('--hcm-dash-period')).toBe('18px');
    expect(host.querySelector('.pelton-deflete')?.style.getPropertyValue('--hcm-dash-period')).toBe('14px');

    await act(async () => tabNamed(host, 'Francis').click());
    expect(host.querySelector('.spin-slow')).not.toBeNull();
    expect(host.querySelector('.fr-radial')?.style.getPropertyValue('--hcm-dash-period')).toBe('32px');
    expect(host.querySelector('.fr-axial')?.style.getPropertyValue('--hcm-dash-period')).toBe('22px');

    await act(async () => tabNamed(host, 'Kaplan').click());
    expect(host.querySelector('.kp-passo--left')).not.toBeNull();
    expect(host.querySelector('.kp-passo--right')).not.toBeNull();
    expect(host.querySelector('.kp-fluxo')?.style.getPropertyValue('--hcm-dash-period')).toBe('22px');
    expect(host.querySelector('.hcm-kaplan-rotation')?.style.getPropertyValue('--hcm-dash-period')).toBe('12px');

    await act(async () => tabNamed(host, 'Bulbo').click());
    expect(host.querySelector('[data-rotor="bulbo"]')).not.toBeNull();
    expect(host.querySelector('.bl-fluxo')?.style.getPropertyValue('--hcm-dash-period')).toBe('26px');
  });

  it('pausa a cena e altera todas as durações pelo controle de velocidade', async () => {
    const { host } = await mount(<TurbineGallery />);
    const surface = host.querySelector('.hcm-turbine-motion');
    const play = host.querySelector('.hcm-play');
    const range = host.querySelector('input[type="range"]');
    const before = surface.style.getPropertyValue('--hcm-d7');

    expect(surface.dataset.motionState).toBe('running');
    await act(async () => play.click());
    expect(surface.dataset.motionState).toBe('paused');
    expect(play.textContent).toContain('Reproduzir');

    await setRangeValue(range, 150);
    expect(range.getAttribute('aria-valuetext')).toBe('150% da velocidade visual');
    expect(surface.style.getPropertyValue('--hcm-d7')).not.toBe(before);
  });

  it('suspende o movimento fora da área visível sem perder a intenção de reprodução', async () => {
    let reportVisibility;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { reportVisibility = callback; }

      observe() {}

      disconnect() {}
    });
    const { host } = await mount(<TurbineGallery />);
    const surface = host.querySelector('.hcm-turbine-motion');

    await act(async () => reportVisibility([{ isIntersecting: false }]));
    expect(surface.dataset.motionState).toBe('paused');
    expect(surface.dataset.playing).toBe('true');

    await act(async () => reportVisibility([{ isIntersecting: true }]));
    expect(surface.dataset.motionState).toBe('running');
  });
});

describe('arranjos e usina reversível', () => {
  it('mostra um diagrama grande por vez com texto HTML completo', async () => {
    const { host } = await mount(<ArrangementSchematics />);

    expect(host.querySelectorAll('[role="tab"]')).toHaveLength(3);
    expect(host.querySelectorAll('.hcm-arrangement-stage .arr-svg')).toHaveLength(1);
    expect(host.querySelector('.hcm-arrangement-canvas')).not.toBeNull();
    expect(host.querySelectorAll('.hcm-arrangement-stage .hcm-svg-label').length).toBeGreaterThan(0);
    expect(host.querySelector('.hcm-mobile-scroll-hint')?.textContent).toContain('Deslize');
    expect(host.querySelectorAll('.hcm-equipment-key li')).toHaveLength(4);
    expect(host.querySelector('.hcm-current-state')?.textContent).toContain('Pé de barragem');

    await act(async () => tabNamed(host, 'Derivação').click());
    expect(host.querySelectorAll('.hcm-arrangement-stage .arr-svg')).toHaveLength(1);
    expect(host.querySelector('.hcm-current-state')?.textContent).toContain('Derivação');
    expect(host.querySelector('.arr-fluxo-tvr')?.style.getPropertyValue('--hcm-dash-period')).toBe('25px');
    expect(host.textContent).toContain('Chaminé de equilíbrio');
  });

  it('oferece pausa e velocidade também para os arranjos', async () => {
    const { host } = await mount(<ArrangementSchematics />);
    const surface = host.querySelector('.hcm-arrangements');
    const play = host.querySelector('.hcm-play');
    const range = host.querySelector('input[type="range"]');

    await act(async () => play.click());
    expect(surface.dataset.motionState).toBe('paused');
    expect(play.getAttribute('aria-pressed')).toBe('false');

    await setRangeValue(range, 50);
    expect(surface.style.getPropertyValue('--hcm-d115')).toBe('2.300s');
  });

  it('permite escolher os dois regimes da reversível e explica os equipamentos', async () => {
    const { host } = await mount(<PRCasesSection />);
    const surface = host.querySelector('.hcm-reversible-motion');
    const pump = [...surface.querySelectorAll('.hcm-phase-selector button')]
      .find((button) => button.textContent === 'Bombeamento');

    expect(surface.dataset.reversibleMode).toBe('generate');
    expect(surface.querySelector('[data-rotor="reversible"]')).not.toBeNull();
    expect(surface.querySelectorAll('.hcm-equipment-key li')).toHaveLength(4);

    await act(async () => pump.click());
    expect(surface.dataset.reversibleMode).toBe('pump');
    expect(surface.dataset.automaticPhase).toBe('false');
    expect(pump.getAttribute('aria-pressed')).toBe('true');
    expect(surface.querySelector('.hcm-current-state')?.textContent).toContain('Modo em destaque: Bombeamento');
  });

  it('desativa os controles automáticos quando o sistema solicita menos movimento', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    const { host } = await mount(<ArrangementSchematics />);

    expect(host.querySelector('.hcm-arrangements')?.dataset.motionState).toBe('paused');
    expect(host.querySelector('.hcm-play')?.disabled).toBe(true);
    expect(host.querySelector('input[type="range"]')?.disabled).toBe(true);
    expect(host.querySelector('.hcm-motion-status')?.textContent).toContain('Movimento reduzido ativo');
  });

  it('mantém alvos de toque de 44 px e a equação de loop contínuo no CSS isolado', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/hydroCasesMotion.css'), 'utf8');

    expect(css).toMatch(/\.hcm-play,[\s\S]*?min-height:\s*44px/);
    expect(css).toContain('stroke-dashoffset: calc(0px - var(--hcm-dash-period))');
    expect(css).toContain("[data-motion-state='paused']");
  });
});
