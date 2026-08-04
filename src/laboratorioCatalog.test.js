import { describe, expect, it, vi } from 'vitest';
import { GRUPOS_LAB, scenarios } from './scenarios.js';
import {
  conteudoAjudaLaboratorio,
  criarCatalogoLaboratorio,
  filtrarCatalogoLaboratorio,
  normalizarRascunhoLaboratorio,
  perguntaBloqueadaLaboratorio,
  resolverCasoInicialLaboratorio,
  registrarConclusaoLaboratorio,
  registrarRascunhoLaboratorio,
  scrollLaboratorio,
} from './laboratorio.jsx';

describe('catálogo pesquisável do laboratório', () => {
  const catalog = criarCatalogoLaboratorio(scenarios, GRUPOS_LAB);

  it('preserva os 26 casos, sem duplicidade e na ordem didática dos grupos', () => {
    expect(catalog).toHaveLength(26);
    expect(new Set(catalog.map(({ scenario }) => scenario.id)).size).toBe(26);
    expect(catalog[0].scenario.id).toBe('escopo');
    expect(catalog.at(-1).scenario.id).toBe('prog-app');
  });

  it('combina busca sem acento, categoria e complexidade', () => {
    const bySearch = filtrarCatalogoLaboratorio(catalog, { query: 'transicao' });
    expect(bySearch.map(({ scenario }) => scenario.id)).toEqual(['transicao']);

    const byCategory = filtrarCatalogoLaboratorio(catalog, { categoria: 'programas' });
    expect(byCategory).toHaveLength(4);
    expect(byCategory.every(({ group }) => group.id === 'programas')).toBe(true);

    // A complexidade filtra pelo nivel MEDIDO no caso, e nao pelo rotulo que o
    // grupo anuncia. Ate 01/08/2026 era 'Aplicação', rotulo do grupo, que 15
    // dos 26 casos carregavam sem pedir nada diferente uns dos outros.
    const combined = filtrarCatalogoLaboratorio(catalog, {
      categoria: 'fases',
      complexidade: 'reconhecer',
      query: 'licenca',
    });
    expect(combined.length).toBeGreaterThan(0);
    expect(combined.every(({ group }) => group.id === 'fases')).toBe(true);
  });

  it('filtrar por "decidir" devolve os casos cujo maior desafio e decidir com ausencia', () => {
    const decidir = filtrarCatalogoLaboratorio(catalog, { complexidade: 'decidir' });
    expect(decidir.map(({ scenario }) => scenario.id)).toEqual(['rlo-vencida', 'barragem']);
    for (const { scenario } of decidir) {
      expect(scenario.ausentes?.length || 0).toBeGreaterThan(0);
    }
    // `integrador` tambem tem ausencia, mas sua tarefa aberta e um degrau mais
    // alto e, por isso, nao deve aparecer simultaneamente em "decidir".
    const integrador = catalog.find(({ scenario }) => scenario.id === 'integrador');
    expect(integrador.scenario.ausentes.length).toBeGreaterThan(0);
    expect(integrador.nivel.id).toBe('fundamentar');
  });

  it('mede os cinco degraus pela tarefa e preserva os casos promovidos', () => {
    const distribuicao = Object.fromEntries(
      ['reconhecer', 'aplicar', 'decidir', 'integrar', 'fundamentar']
        .map((nivel) => [
          nivel,
          filtrarCatalogoLaboratorio(catalog, { complexidade: nivel })
            .map(({ scenario }) => scenario.id),
        ]),
    );

    expect(Object.values(distribuicao).map((casos) => casos.length)).toEqual([10, 5, 2, 5, 4]);
    expect(new Set(distribuicao.aplicar)).toEqual(
      new Set(['escopo', 'las', 'cp-antiga', 'triagem', 'intervenientes']),
    );
    expect(new Set(distribuicao.fundamentar)).toEqual(
      new Set(['condicionantes', 'revisao', 'integrador', 'delegado']),
    );
  });
});

describe('retomada do laboratório', () => {
  it('prioriza o caso explícito da rota', () => {
    expect(resolverCasoInicialLaboratorio({
      scenarios,
      grupos: GRUPOS_LAB,
      labs: {
        revisao: { date: '2026-07-29T10:00:00.000Z' },
      },
      initialScenarioId: 'cp',
    })).toBe('cp');
  });

  it('retoma a tentativa válida mais recente e ignora ids removidos', () => {
    expect(resolverCasoInicialLaboratorio({
      scenarios,
      grupos: GRUPOS_LAB,
      labs: {
        inexistente: { date: '2030-01-01T00:00:00.000Z' },
        cp: { date: '2026-07-20T10:00:00.000Z' },
        integrador: { date: '2026-07-29T10:00:00.000Z' },
      },
    })).toBe('integrador');
  });

  it('começa pelo caso introdutório quando não existe tentativa salva', () => {
    expect(resolverCasoInicialLaboratorio({
      scenarios,
      grupos: GRUPOS_LAB,
      labs: {},
    })).toBe('escopo');
  });

  it('prioriza a atualização do rascunho sem alterar a data da conclusão preservada', () => {
    expect(resolverCasoInicialLaboratorio({
      scenarios,
      grupos: GRUPOS_LAB,
      labs: {
        cp: {
          versao: 3,
          status: 'concluido',
          date: '2026-07-29T09:00:00.000Z',
          rascunho: {
            versao: 1,
            atualizadoEm: '2026-07-29T12:00:00.000Z',
            respostas: {},
          },
        },
        integrador: {
          versao: 3,
          status: 'concluido',
          date: '2026-07-29T11:00:00.000Z',
        },
      },
    })).toBe('cp');
  });
});

describe('ajuda progressiva e modos de resolução', () => {
  const scenario = scenarios.find((candidate) => candidate.id === 'integrador');

  it('revela somente fontes e critérios já existentes, em três níveis', () => {
    const closed = conteudoAjudaLaboratorio(scenario, 0);
    const observation = conteudoAjudaLaboratorio(scenario, 1);
    const questions = conteudoAjudaLaboratorio(scenario, 2);
    const criteria = conteudoAjudaLaboratorio(scenario, 3);

    expect(closed).toEqual({
      level: 0,
      facts: [],
      evidence: [],
      ausentes: [],
      questions: [],
      criteria: [],
    });
    expect(observation.facts).toEqual(scenario.facts);
    expect(observation.evidence).toEqual(scenario.evidence);
    expect(observation.ausentes).toEqual(scenario.ausentes || []);
    expect(observation.questions).toEqual([]);
    expect(questions.questions).toEqual(scenario.questions.map(([prompt]) => prompt));
    expect(questions.criteria).toEqual([]);
    expect(criteria.criteria).toEqual(scenario.openTask.criteria.map(({ label }) => label));
    expect(JSON.stringify(criteria)).not.toContain(scenario.modelo);
    expect(JSON.stringify(criteria)).not.toContain(scenario.outcome);
  });

  it('mantém sequência no modo Guiado e libera tudo no modo Desafio', () => {
    expect(perguntaBloqueadaLaboratorio('guiado', 0, {})).toBe(false);
    expect(perguntaBloqueadaLaboratorio('guiado', 1, {})).toBe(true);
    expect(perguntaBloqueadaLaboratorio('guiado', 1, { 0: 'sim' })).toBe(false);
    expect(perguntaBloqueadaLaboratorio('guiado', 1, { 4: 'nao' })).toBe(true);
    expect(perguntaBloqueadaLaboratorio('guiado', 2, { 0: 'sim', 2: 'nao' })).toBe(true);
    expect(perguntaBloqueadaLaboratorio('desafio', 4, {})).toBe(false);
  });
});

describe('rascunho versionado do laboratório', () => {
  const scenario = scenarios.find((candidate) => candidate.id === 'cp');

  it('restaura apenas respostas e evidências pertencentes ao caso', () => {
    const draft = normalizarRascunhoLaboratorio({
      rascunho: {
        versao: 1,
        atualizadoEm: '2026-07-29T12:00:00.000Z',
        respostas: { 0: 'sim', 1: 'talvez', 99: 'nao' },
        texto: 'Fundamentação em elaboração.',
        evidenciasConsultadas: [scenario.evidence[0], 'Peça de outro caso'],
        evidenciasAnotadas: {
          [scenario.evidence[0]]: 'Análise válida do documento.',
          'Peça de outro caso': 'Não pode ser restaurada.',
        },
        modo: 'desafio',
        nivelAjuda: 99,
      },
    }, scenario);

    expect(draft).toMatchObject({
      versao: 2,
      respostas: { 0: 'sim' },
      texto: 'Fundamentação em elaboração.',
      evidenciasConsultadas: [scenario.evidence[0]],
      evidenciasAnotadas: {
        [scenario.evidence[0]]: 'Análise válida do documento.',
      },
      modo: 'desafio',
      nivelAjuda: 3,
    });
    expect(draft.respostas).not.toHaveProperty('99');
    expect(draft.evidenciasAnotadas).not.toHaveProperty('Peça de outro caso');
  });

  it('restaura apenas classificações previstas pela tarefa do caso', () => {
    const scenarioWithTask = scenarios.find((candidate) => candidate.id === 'escopo');
    const validTitle = scenarioWithTask.evidence[0];
    const draft = normalizarRascunhoLaboratorio({
      rascunho: {
        versao: 2,
        classificacoesEvidencias: {
          [validTitle]: 'metodologica',
          [scenarioWithTask.evidence[1]]: 'classificacao-inexistente',
          'Peça de outro caso': 'direta',
        },
      },
    }, scenarioWithTask);

    expect(draft.classificacoesEvidencias).toEqual({
      [validTitle]: 'metodologica',
    });
  });

  it('mantém a conclusão durante a nova tentativa e a arquiva no próximo finish', () => {
    const previous = {
      versao: 3,
      status: 'concluido',
      date: '2026-07-28T10:00:00.000Z',
      score: 4,
      texto: 'Conclusão anterior.',
    };
    const draft = {
      versao: 1,
      atualizadoEm: '2026-07-29T12:00:00.000Z',
      respostas: {},
      texto: '',
      evidenciasConsultadas: [],
      evidenciasAnotadas: {},
      modo: 'guiado',
      nivelAjuda: 0,
    };
    const duringRetry = registrarRascunhoLaboratorio(previous, draft);

    expect(duringRetry).toMatchObject(previous);
    expect(duringRetry.rascunho).toEqual(draft);

    const nextCompletion = {
      versao: 3,
      status: 'concluido',
      date: '2026-07-29T13:00:00.000Z',
      score: 5,
      texto: 'Nova conclusão.',
    };
    const finished = registrarConclusaoLaboratorio(duringRetry, nextCompletion);

    expect(finished).toMatchObject(nextCompletion);
    expect(finished).not.toHaveProperty('rascunho');
    expect(finished.historicoConclusoes).toHaveLength(1);
    expect(finished.historicoConclusoes[0]).toMatchObject(previous);
    expect(finished.historicoConclusoes[0]).not.toHaveProperty('rascunho');
  });
});

describe('rolagem acessível do laboratório', () => {
  it('troca a animação por rolagem imediata quando o usuário reduz movimento', () => {
    const originalMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = vi.fn(() => ({ matches: true }));
    const target = { scrollIntoView: vi.fn() };

    try {
      scrollLaboratorio(target, 'center');
      expect(target.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'center',
      });
    } finally {
      globalThis.matchMedia = originalMatchMedia;
    }
  });

  it('mostra o documento ausente junto das pecas, e nao escondido num fato', () => {
    // O caso 'barragem' afirma nos fatos que PSB e PAE nao constam do processo,
    // mas a lista de evidencias nao os mencionava: quem estudava via quatro
    // documentos, todos presentes, e precisava deduzir a falta. Perceber o que
    // falta e parte da decisao, entao a falta tem que estar visivel na lista.
    const comAusencia = scenarios.find((caso) => caso.id === 'barragem');
    expect(comAusencia).toBeTruthy();
    expect(comAusencia.ausentes.length).toBeGreaterThan(0);

    const ajuda = conteudoAjudaLaboratorio(comAusencia, 1);
    expect(ajuda.ausentes).toEqual(comAusencia.ausentes);
    // O documento ausente nao pode aparecer como evidencia disponivel.
    for (const faltante of comAusencia.ausentes) {
      expect(ajuda.evidence).not.toContain(faltante);
    }
  });
});
