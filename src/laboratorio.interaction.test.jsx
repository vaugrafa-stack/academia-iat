// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GRUPOS_LAB, scenarios } from './scenarios.js';
import Laboratorio from './laboratorio.jsx';

let host;
let root;

function click(element) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function renderLaboratorio(state, setState, key = 'lab') {
  root.render(
    <Laboratorio
      key={key}
      state={state}
      setState={setState}
      scenarios={scenarios}
      grupos={GRUPOS_LAB}
      lessonMap={new Map()}
      initialScenarioId="escopo"
    />,
  );
}

function completionFor(scenario) {
  return {
    versao: 3,
    status: 'concluido',
    date: '2026-07-28T10:00:00.000Z',
    score: scenario.questions.length,
    total: scenario.questions.length,
    respostas: Object.fromEntries(
      scenario.questions.map((question, index) => [index, question[1]]),
    ),
    texto: `${scenario.modelo} ${scenario.modelo}`,
    evidenciasConsultadas: [...scenario.evidence],
    evidenciasAnotadas: Object.fromEntries(
      scenario.evidence.map((title) => [
        title,
        'Registro anterior com mais de quarenta caracteres para conferência.',
      ]),
    ),
    rubrica: { decisions: 100, evidence: 100, reasoning: 100 },
    rubricaTotal: 100,
    nivelAjuda: 0,
    modo: 'guiado',
  };
}

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.querySelector('.answer-sheet-portal')?.remove();
  document.body.innerHTML = '';
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  vi.restoreAllMocks();
});

describe('persistência da tentativa no Laboratório', () => {
  it('abre o catálogo como diálogo móvel e devolve o foco ao acionador', async () => {
    globalThis.matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const initialState = { labs: {}, autoaval: {} };
    await act(async () => renderLaboratorio(initialState, vi.fn()));

    const trigger = host.querySelector('.lab-catalog-open');
    const catalog = host.querySelector('#lab-case-catalog-drawer');
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(catalog.getAttribute('aria-hidden')).toBe('true');
    expect(catalog.getAttribute('role')).toBe('dialog');

    await act(async () => {
      click(trigger);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(catalog.getAttribute('aria-hidden')).toBe('false');
    expect(document.activeElement).toBe(catalog.querySelector('#lab-case-search'));

    const closeButton = catalog.querySelector('.lab-catalog-close');
    await act(async () => {
      click(closeButton);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('expõe e fecha uma evidência com estado, foco e retorno ao acionador', async () => {
    const initialState = { labs: {}, autoaval: {} };
    await act(async () => renderLaboratorio(initialState, vi.fn()));

    const evidenceTrigger = host.querySelector('.lab-evidence > div > button');
    expect(evidenceTrigger).toBeTruthy();
    expect(evidenceTrigger.getAttribute('aria-expanded')).toBe('false');

    await act(async () => {
      click(evidenceTrigger);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    const panelId = evidenceTrigger.getAttribute('aria-controls');
    const panel = host.querySelector(`#${panelId}`);
    expect(evidenceTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel).toBeTruthy();
    expect(document.activeElement).toBe(panel);

    const closeButton = panel.querySelector('header button');
    await act(async () => {
      click(closeButton);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(host.querySelector(`#${panelId}`)).toBeNull();
    expect(evidenceTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(evidenceTrigger);
  });

  it('mostra os quatro fatos e restaura uma resposta salva como Em andamento', async () => {
    const initialState = { labs: {}, autoaval: {} };
    const persist = vi.fn();

    await act(async () => renderLaboratorio(initialState, persist));

    const selectedScenario = scenarios.find((scenario) => scenario.id === 'escopo');
    expect(host.querySelectorAll('.case-facts span')).toHaveLength(
      selectedScenario.facts.length,
    );
    expect(selectedScenario.facts).toHaveLength(4);

    const firstYes = host.querySelector('#lab-question-0 button');
    await act(async () => click(firstYes));

    const updater = persist.mock.calls.at(-1)[0];
    const stateWithDraft = updater(initialState);
    expect(stateWithDraft.labs.escopo).toMatchObject({
      status: 'em_andamento',
      rascunho: {
        versao: 1,
        respostas: { 0: 'sim' },
      },
    });

    const restorePersist = vi.fn();
    await act(async () => renderLaboratorio(stateWithDraft, restorePersist, 'restored'));

    expect(host.querySelector('.lab-case-status.in-progress')?.textContent)
      .toContain('Em andamento');
    expect(host.querySelector('#lab-question-0 button')?.getAttribute('aria-pressed'))
      .toBe('true');
  });

  it('inicia de fato uma tentativa vazia sem apagar a conclusão anterior', async () => {
    const scenario = scenarios.find((candidate) => candidate.id === 'escopo');
    const previousCompletion = completionFor(scenario);
    const initialState = {
      labs: { escopo: previousCompletion },
      autoaval: {},
    };
    const persist = vi.fn();

    await act(async () => renderLaboratorio(initialState, persist));
    const restart = [...host.querySelectorAll('button')].find(
      (button) => button.textContent.includes('Revisar e iniciar nova tentativa'),
    );
    expect(restart).toBeTruthy();

    await act(async () => click(restart));

    expect(host.querySelector('#lab-reason')?.value).toBe('');
    expect(host.querySelector('#lab-question-0 button')?.getAttribute('aria-pressed'))
      .toBe('false');
    expect(host.textContent).not.toContain('DEBRIEFING · RUBRICA V3');

    const updater = persist.mock.calls.at(-1)[0];
    const stateDuringRetry = updater(initialState);
    expect(stateDuringRetry.labs.escopo).toMatchObject(previousCompletion);
    expect(stateDuringRetry.labs.escopo.rascunho).toMatchObject({
      versao: 1,
      respostas: {},
      texto: '',
      evidenciasConsultadas: [],
      evidenciasAnotadas: {},
      modo: 'guiado',
      nivelAjuda: 0,
    });
  });
});
