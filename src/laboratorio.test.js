import { describe, expect, it } from 'vitest';
import popData from './data/pop-content.json';
import { scenarios } from './scenarios.js';
import { tracks } from './courseData.js';
import { derivarAulas } from './lessons.js';
import {
  calcularIndicadoresLaboratorio,
  conferirElementos,
  resolverProvenienciaDecisao,
  resolverRemediacaoModulo,
} from './laboratorioLogica.js';

describe('indicadores honestos do laboratório', () => {
  it('mede registros observáveis sem premiar tamanho de texto', () => {
    const resultado = calcularIndicadoresLaboratorio({
      decisoesAlinhadas: 2,
      totalDecisoes: 4,
      evidenciasRegistradas: 2,
      minimoEvidencias: 2,
      elementosDetectados: 3,
      totalElementos: 6,
    });

    expect(resultado.rubrica).toEqual({
      decisions: 50,
      evidence: 100,
      reasoning: 50,
    });
    expect(resultado.indiceCompletude).toBe(60);
  });

  it('limita evidências excedentes a cem por cento', () => {
    const resultado = calcularIndicadoresLaboratorio({
      decisoesAlinhadas: 1,
      totalDecisoes: 1,
      evidenciasRegistradas: 5,
      minimoEvidencias: 2,
      elementosDetectados: 1,
      totalElementos: 1,
    });

    expect(resultado.rubrica.evidence).toBe(100);
    expect(resultado.indiceCompletude).toBe(100);
  });

  it('não compensa classificação ou tarefa aberta ausente com decisões binárias corretas', () => {
    const resultado = calcularIndicadoresLaboratorio({
      decisoesAlinhadas: 5,
      totalDecisoes: 5,
      evidenciasRegistradas: 4,
      minimoEvidencias: 4,
      elementosDetectados: 0,
      totalElementos: 5,
      classificacoesAlinhadas: 0,
      totalClassificacoes: 4,
      tarefaAberta: true,
    });

    expect(resultado.rubrica.classification).toBe(0);
    expect(resultado.componentesObjetivo).toEqual({
      decisions: 100,
      classification: 0,
      openTask: 0,
    });
    expect(resultado.objetivoPercentual).toBe(33);
    expect(resultado.indiceCompletude).toBe(50);
  });
});

describe('rubricas das tarefas abertas', () => {
  const openIds = ['condicionantes', 'revisao', 'integrador', 'delegado'];

  it('faz cada redacao-modelo cobrir todos os criterios especificos do proprio caso', () => {
    for (const id of openIds) {
      const scenario = scenarios.find((candidate) => candidate.id === id);
      const conference = conferirElementos(scenario, scenario.modelo);
      expect(conference.total, id).toBe(5);
      expect(conference.tocados, id).toBe(conference.total);
    }
  });

  it('nao pontua texto generico nem aceita integralmente o modelo de outro caso', () => {
    const generic = 'Analisei o processo, esta tudo certo e encaminho para as providencias cabiveis.';
    for (const id of openIds) {
      const target = scenarios.find((candidate) => candidate.id === id);
      expect(conferirElementos(target, generic).tocados, id).toBe(0);
      for (const source of scenarios.filter((candidate) => candidate.id !== id)) {
        const result = conferirElementos(target, source.modelo);
        expect(result.tocados, `${source.id} nao pode resolver ${id}`).toBeLessThan(result.total);
      }
    }
  });
});

describe('remediação canônica do laboratório', () => {
  const { lessonMap, trackLessons } = derivarAulas(popData, tracks);

  it('resolve os 26 cenários para o código exibido e uma aula existente do módulo', () => {
    expect(scenarios).toHaveLength(26);

    for (const scenario of scenarios) {
      const canonicalTrack = tracks.find((track) => track.id === scenario.track);
      const remediation = resolverRemediacaoModulo(scenario);
      const lesson = remediation && lessonMap.get(remediation.lessonId);

      expect(remediation, scenario.id).toMatchObject({
        trackId: canonicalTrack.id,
        code: canonicalTrack.code,
        title: canonicalTrack.title,
        lessonId: canonicalTrack.remediationLessonId,
        href: `#/aula/${encodeURIComponent(canonicalTrack.remediationLessonId)}`,
      });
      expect(lesson?.trackId, scenario.id).toBe(canonicalTrack.id);
      expect(remediation.lessonId, scenario.id).toBe(trackLessons.get(canonicalTrack.id)[0].id);
    }
  });

  it.each([
    ['uc-apa', 'M12'],
    ['delegado', 'M13'],
    ['condicionantes', 'M14'],
    ['prog-compensacao', 'M08'],
    ['prog-app', 'M08'],
    ['condic-triagem', 'M14'],
    ['revisao', 'M15'],
    ['integrador', 'M16'],
  ])('evita regressão de rótulo no cenário %s: remedia em %s', (scenarioId, expectedCode) => {
    const scenario = scenarios.find((candidate) => candidate.id === scenarioId);
    expect(resolverRemediacaoModulo(scenario)?.code).toBe(expectedCode);
  });

  it('falha de modo seguro quando o cenário não pertence ao registro canônico', () => {
    expect(resolverRemediacaoModulo({ track: 'inexistente' })).toBeNull();
    expect(resolverRemediacaoModulo(null)).toBeNull();
  });
});

describe('limites das decisões sintéticas do laboratório', () => {
  it.each([
    ['cp', 0, 'nao', /simples presença.+sem conferir/i],
    ['cp', 2, 'nao', /assegura prioridade.+confere domínio/i],
    ['las', 0, 'nao', /potência de 3 MW, isoladamente/i],
    ['rlo', 0, 'nao', /sem conferir datas e regime aplicável/i],
    ['rlo-vencida', 0, 'nao', /sem conferir a licença e o comprovante/i],
    ['rlo-vencida', 4, 'nao', /sem confirmar tempestividade.+é seguro concluir/i],
    ['prog-semestral', 1, 'nao', /por si só, demonstra abandono ou continuidade/i],
    ['prog-residuos', 4, 'nao', /sem demonstrar a adequação.+resolve a lacuna/i],
    ['prog-compensacao', 2, 'nao', /sem confronto com o projeto.+basta para validá-la/i],
    ['prog-app', 3, 'nao', /sem confrontar projeto.+é possível concluir/i],
  ])('mantém %s Q%d condicionada à evidência disponível', (scenarioId, questionIndex, answer, text) => {
    const scenario = scenarios.find((candidate) => candidate.id === scenarioId);

    expect(scenario.questions[questionIndex][1]).toBe(answer);
    expect(scenario.questions[questionIndex][0]).toMatch(text);
  });

  it('alinha os casos de acompanhamento ao módulo de relatórios', () => {
    const cases = Object.fromEntries(
      scenarios
        .filter((scenario) => ['prog-compensacao', 'prog-app'].includes(scenario.id))
        .map((scenario) => [scenario.id, scenario]),
    );

    expect(cases['prog-compensacao']).toMatchObject({
      track: 'm08',
      label: 'Cronologia e comprovação',
    });
    expect(cases['prog-app']).toMatchObject({
      track: 'm08',
      label: 'Programa de APP e cartografia',
    });
  });

  it('não introduz referências editoriais proibidas no conteúdo alterado', () => {
    const ids = new Set([
      'cp',
      'las',
      'rlo',
      'rlo-vencida',
      'prog-semestral',
      'prog-residuos',
      'prog-compensacao',
      'prog-app',
    ]);
    const content = JSON.stringify(scenarios.filter((scenario) => ids.has(scenario.id)));

    expect(content).not.toMatch(/\bIA\b|inteligência artificial|revisão humana|validação humana/i);
  });
});

describe('proveniência por decisão do laboratório', () => {
  it('resolve as 130 decisões para trechos do POP e referências de evidência semanticamente opcionais', () => {
    const decisions = scenarios.flatMap((scenario) =>
      scenario.questions.map((_, index) => ({
        scenario,
        provenance: resolverProvenienciaDecisao(scenario, index),
      })),
    );

    expect(decisions).toHaveLength(130);
    for (const { scenario, provenance } of decisions) {
      expect(provenance, scenario.id).not.toBeNull();
      expect(provenance.popSources.length, provenance.id).toBeGreaterThan(0);
      expect(Array.isArray(provenance.evidenceTitles), provenance.id).toBe(true);
      for (const title of provenance.evidenceTitles) {
        expect(scenario.evidence, `${provenance.id}: ${title}`).toContain(title);
      }
    }
  });

  it('usa a evidência 1 quando ela é pertinente e nenhuma quando a decisão é normativa', () => {
    const scenario = scenarios.find((candidate) => candidate.id === 'rlo-vencida');
    const provenance = resolverProvenienciaDecisao(scenario, 4);

    expect(provenance.evidenceTitles).toEqual([
      'Licença anterior e comprovante de protocolo',
      'Relatório de cumprimento de condicionantes',
      'Automonitoramento dos últimos 2 anos',
      'Notificações anteriores',
    ]);
    expect(provenance.reviewStatus).toBe('needs-technical-review');

    const cp = scenarios.find((candidate) => candidate.id === 'cp');
    expect(resolverProvenienciaDecisao(cp, 4).evidenceTitles).toEqual([]);
  });
});
