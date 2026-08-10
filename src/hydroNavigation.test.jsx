// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HydroGuide, {
  HYDRO_SECTIONS,
  HydroLocalNav,
  calculateHydroReadingState,
} from './hydro.jsx';

const mountedRoots = [];

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
  });
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function createSectionTargets() {
  return HYDRO_SECTIONS.map((section, index) => {
    const element = document.createElement('section');
    element.id = section.id;
    element.tabIndex = -1;
    element.scrollIntoView = vi.fn();
    element.getBoundingClientRect = () => ({
      top: 100 + index * 700,
      bottom: 700 + index * 700,
      left: 0,
      right: 1000,
      width: 1000,
      height: 600,
      x: 0,
      y: 100 + index * 700,
      toJSON: () => ({}),
    });
    document.body.append(element);
    return element;
  });
}

describe('navegação local do guia de hidrelétricas', () => {
  it('calcula seção ativa e progresso limitado entre zero e cem', () => {
    const sections = [
      { id: 'a', top: 100, bottom: 600 },
      { id: 'b', top: 700, bottom: 1200 },
      { id: 'c', top: 1300, bottom: 2200 },
    ];

    expect(calculateHydroReadingState({
      sections,
      scrollY: 0,
      viewportHeight: 600,
      activationOffset: 100,
    })).toEqual({ activeId: 'a', progress: 0 });

    expect(calculateHydroReadingState({
      sections,
      scrollY: 650,
      viewportHeight: 600,
      activationOffset: 100,
    })).toEqual({ activeId: 'b', progress: 43 });

    expect(calculateHydroReadingState({
      sections,
      scrollY: 3000,
      viewportHeight: 600,
      activationOffset: 100,
    })).toEqual({ activeId: 'c', progress: 100 });
  });

  it('mantém um destino estável e focável para cada item do guia', () => {
    const html = renderToStaticMarkup(<HydroGuide go={() => {}} />);
    const ids = HYDRO_SECTIONS.map((section) => section.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(html).toContain('aria-label="Seções deste guia"');
    for (const id of ids) {
      expect(html).toContain(`data-hydro-nav-target="${id}"`);
      expect(html).toContain(`id="${id}" tabindex="-1"`);
    }
  });

  it('leva ao destino, transfere o foco e aceita setas, Home e End', async () => {
    const targets = createSectionTargets();
    const host = document.createElement('div');
    document.body.prepend(host);
    const root = createRoot(host);
    mountedRoots.push(root);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const pendingFrames = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      pendingFrames.push(callback);
      return pendingFrames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    await act(async () => root.render(<HydroLocalNav />));

    const buttons = [...host.querySelectorAll('[data-hydro-nav-target]')];
    expect(buttons).toHaveLength(HYDRO_SECTIONS.length);
    expect(host.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('1');

    await act(async () => buttons[4].click());
    await act(async () => {
      let guard = 0;
      while (pendingFrames.length && guard < 24) {
        pendingFrames.shift()(guard * 16);
        guard += 1;
      }
    });
    expect(targets[4].scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
      inline: 'nearest',
    });
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', top: 2816 });
    expect(targets.every((target) => target.style.contentVisibility === '')).toBe(true);
    expect(document.activeElement).toBe(targets[4]);
    expect(buttons[4].getAttribute('aria-current')).toBe('location');

    buttons[1].focus();
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttons[2]);
    buttons[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(buttons.at(-1));
    buttons.at(-1).dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);
  });
});
