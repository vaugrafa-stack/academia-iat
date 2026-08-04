// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CaseAnswerSheet from './CaseAnswerSheet.jsx';
import CaseCombobox from './CaseCombobox.jsx';
import RedatorIT from './redator.jsx';
import answerReasons from './data/lab-answer-reasons.json';
import { GRUPOS_LAB, scenarios } from './scenarios.js';

const answerSheetsCss = readFileSync(
  'src/answerSheets.css',
  'utf8',
);

let root;
let host;
let originalScrollIntoView;
let scrollIntoView;

beforeEach(() => {
  originalScrollIntoView = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'scrollIntoView',
  );
  scrollIntoView = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    writable: true,
    value: scrollIntoView,
  });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };
});

afterEach(async () => {
  if (root) {
    await act(async () => root.unmount());
    root = null;
  }
  document.querySelector('.answer-sheet-portal')?.remove();
  document.body.className = '';
  document.body.innerHTML = '';
  if (originalScrollIntoView) {
    Object.defineProperty(
      Element.prototype,
      'scrollIntoView',
      originalScrollIntoView,
    );
  } else {
    delete Element.prototype.scrollIntoView;
  }
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  vi.restoreAllMocks();
});

function click(element) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('painel compartilhado de folha-resposta', () => {
  it('dimensiona o corpo pelo espaço real do painel também no celular', () => {
    expect(answerSheetsCss).toMatch(
      /\.answer-sheet-panel\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s,
    );
    expect(answerSheetsCss).toMatch(
      /\.answer-sheet-body\s*\{[^}]*min-height:\s*0;[^}]*flex:\s*1 1 auto;/s,
    );
    expect(answerSheetsCss).not.toMatch(/height:\s*calc\(100%\s*-/);
  });

  it('abre como diálogo, mantém o modelo recolhido e fecha com Escape', async () => {
    await act(async () => {
      root.render(
        <CaseAnswerSheet
          caseData={scenarios.find((scenario) => scenario.id === 'cp')}
          groups={GRUPOS_LAB}
          answerReasons={answerReasons}
        />,
      );
    });
    const launcher = host.querySelector('.answer-sheet-launcher');

    await act(async () => {
      launcher.focus();
      click(launcher);
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.textContent).toContain('5 decisões esperadas');
    expect(dialog.textContent).toContain('4 pontos que a resposta precisa enfrentar');
    expect(dialog.textContent).toContain('Glossário do caso');
    expect(dialog.textContent).toContain('Natureza da fonte: Minuta técnica');
    expect(dialog.querySelectorAll('.answer-sheet-decisions > li')).toHaveLength(5);
    expect(dialog.querySelector('.answer-sheet-model').open).toBe(false);
    expect(dialog.textContent).not.toMatch(/intelig[eê]ncia artificial|\bIA\b/i);

    const routeBeforeSectionJump = window.location.hash;
    const glossaryButton = [...dialog.querySelectorAll('nav button')]
      .find((button) => button.textContent === 'Glossário');
    await act(async () => click(glossaryButton));
    expect(window.location.hash).toBe(routeBeforeSectionJump);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    expect(document.activeElement).toBe(dialog.querySelector('#folha-glossario'));

    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const printButton = [...dialog.querySelectorAll('button')]
      .find((button) => button.textContent.includes('Imprimir'));
    await act(async () => click(printButton));
    expect(print).toHaveBeenCalledOnce();
    expect(dialog.querySelector('.answer-sheet-model').open).toBe(false);
    expect(document.body.classList.contains('answer-sheet-printing')).toBe(false);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }));
    });

    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(launcher);
  });

  it('deriva as contagens da folha em vez de fixar cinco decisões e quatro critérios', async () => {
    const base = scenarios.find((scenario) => scenario.id === 'cp');
    const shortened = {
      ...base,
      questions: base.questions.slice(0, 3),
      elementos: base.elementos.slice(0, 2),
    };
    await act(async () => {
      root.render(
        <CaseAnswerSheet
          caseData={shortened}
          groups={GRUPOS_LAB}
          answerReasons={answerReasons}
        />,
      );
    });
    await act(async () => click(host.querySelector('.answer-sheet-launcher')));

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog.textContent).toContain('3 decisões esperadas');
    expect(dialog.textContent).toContain('2 pontos que a resposta precisa enfrentar');
    expect(dialog.querySelectorAll('.answer-sheet-decisions > li')).toHaveLength(3);
  });

  it('mantém o foco no diálogo sem considerar links de classificações recolhidas', async () => {
    await act(async () => {
      root.render(
        <CaseAnswerSheet
          caseData={scenarios.find((scenario) => scenario.id === 'escopo')}
          groups={GRUPOS_LAB}
          answerReasons={answerReasons}
        />,
      );
    });
    const launcher = host.querySelector('.answer-sheet-launcher');
    await act(async () => click(launcher));

    const dialog = document.querySelector('[role="dialog"]');
    const closeButton = dialog.querySelector('[data-close-sheet]');
    const classification = dialog.querySelector('.answer-sheet-evidence details');
    const hiddenSourceLink = classification.querySelector('a[href]');
    expect(classification.open).toBe(false);

    closeButton.focus();
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }));
    });

    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(hiddenSourceLink);
    expect(document.activeElement.matches('summary')).toBe(true);
  });
});

describe('seleção pesquisável do caso', () => {
  it('mantém a opção ativa visível enquanto as setas percorrem a lista', async () => {
    const firstScenarioId = GRUPOS_LAB[0].ids[0];
    await act(async () => {
      root.render(
        <CaseCombobox
          id="case-scroll-test"
          scenarios={scenarios}
          groups={GRUPOS_LAB}
          value={firstScenarioId}
          onChange={vi.fn()}
        />,
      );
    });
    const input = host.querySelector('[role="combobox"]');

    await act(async () => {
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });
    scrollIntoView.mockClear();

    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
      }));
    });

    const activeId = input.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'nearest',
      inline: 'nearest',
    });
    expect(scrollIntoView.mock.contexts.at(-1)?.id).toBe(activeId);
  });

  it('filtra por assunto e seleciona a opção pelo teclado', async () => {
    const onChange = vi.fn();
    await act(async () => {
      root.render(
        <CaseCombobox
          id="case-test"
          scenarios={scenarios}
          groups={GRUPOS_LAB}
          value="cp"
          onChange={onChange}
        />,
      );
    });
    const input = host.querySelector('[role="combobox"]');

    await act(async () => {
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      valueSetter.call(input, 'resíduos');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const options = host.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain('Resíduos');

    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      }));
    });

    expect(onChange).toHaveBeenCalledWith('prog-residuos');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('confirma a opção no ponteiro antes que o fechamento global remova a lista', async () => {
    const onChange = vi.fn();
    await act(async () => {
      root.render(
        <CaseCombobox
          id="case-pointer-test"
          scenarios={scenarios}
          groups={GRUPOS_LAB}
          value="cp"
          onChange={onChange}
        />,
      );
    });
    const input = host.querySelector('[role="combobox"]');

    await act(async () => {
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      valueSetter.call(input, 'resíduos');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const option = host.querySelector('[role="option"]');
    const pointerDown = new Event('pointerdown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pointerDown, 'pointerType', { value: 'mouse' });
    await act(async () => option.dispatchEvent(pointerDown));

    expect(onChange).toHaveBeenCalledWith('prog-residuos');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('preserva a opção durante o toque e confirma no clique resultante', async () => {
    const onChange = vi.fn();
    await act(async () => {
      root.render(
        <CaseCombobox
          id="case-touch-test"
          scenarios={scenarios}
          groups={GRUPOS_LAB}
          value="cp"
          onChange={onChange}
        />,
      );
    });
    const input = host.querySelector('[role="combobox"]');

    await act(async () => {
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      valueSetter.call(input, 'cronologia');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const option = host.querySelector('[role="option"]');
    const pointerDown = new Event('pointerdown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pointerDown, 'pointerType', { value: 'touch' });
    await act(async () => option.dispatchEvent(pointerDown));
    expect(input.getAttribute('aria-expanded')).toBe('true');

    await act(async () => click(option));
    expect(onChange).toHaveBeenCalledWith('prog-compensacao');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('redator de Informação Técnica', () => {
  it('destaca o rótulo solicitado e não usa mais o seletor nativo gigante', async () => {
    await act(async () => {
      root.render(
        <RedatorIT
          scenarios={scenarios}
          grupos={GRUPOS_LAB}
          state={{ its: {} }}
          setState={vi.fn()}
          go={vi.fn()}
        />,
      );
    });

    const label = host.querySelector('label[for="rd-sel"]');
    expect(label.textContent.trim()).toBe('Escolha seu caso de base');
    expect(label.querySelector('strong')).not.toBeNull();
    expect(host.querySelector('.rd-caso select')).toBeNull();
    expect(host.querySelector('#rd-sel[role="combobox"]')).not.toBeNull();
    expect(host.querySelector('.answer-sheet-launcher').textContent)
      .toContain('Consultar folha-resposta');
  });
});
