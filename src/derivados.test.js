// Testes da camada de dado derivado do POP.
//
// Ate aqui o nucleo nao tinha teste de unidade: quebra so aparecia no smoke,
// que renderiza a aplicacao inteira e diz "algo falhou", sem dizer o que. Com
// `criarDerivados` isolado, da para afirmar propriedade por propriedade.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { criarDerivados, norm } from './derivados.js';
import { tracks } from './courseData.js';

const pop = JSON.parse(readFileSync(resolve(import.meta.dirname, 'data/pop-content.json'), 'utf8'));
const d = criarDerivados(pop, tracks);

describe('norm', () => {
  it('remove acento e caixa, preservando o resto', () => {
    expect(norm('Ação Técnica')).toBe('acao tecnica');
    expect(norm('PACUERA')).toBe('pacuera');
    expect(norm('')).toBe('');
  });
});

describe('criarDerivados: mapas do POP', () => {
  it('indexa todo bloco, tabela e seção', () => {
    expect(d.blockMap.size).toBe(pop.blocks.length);
    expect(d.tableMap.size).toBe(pop.tables.length);
    expect(d.sectionMap.size).toBe(pop.sections.length);
  });

  it('deriva aulas de todas as seções substantivas', () => {
    // O POP v1.7 possui 161 títulos não navegacionais, mas dois deles são
    // cabeçalhos-contêiner sem bloco próprio. Uma aula precisa ensinar algo.
    expect(d.lessons.length).toBeGreaterThan(150);
    expect(new Set(d.lessons.map((l) => l.id)).size).toBe(d.lessons.length);
    for (const l of d.lessons) {
      expect(l.title).toBeTruthy();
      expect(l.blockIds.length).toBeGreaterThan(0);
      expect(tracks.some((t) => t.id === l.trackId)).toBe(true);
    }
  });

  it('não transforma cabeçalho estrutural vazio em aula', () => {
    const emptyStructuralIds = pop.sections
      .filter((section) => !section.navigationOnly && section.blockIds.length === 0)
      .map((section) => section.id);
    expect(emptyStructuralIds).toEqual(['pop-section-044', 'pop-section-077']);
    expect(d.lessons.some((lesson) => emptyStructuralIds.includes(lesson.id))).toBe(false);
  });

  it('não deixa módulo sem aula', () => {
    for (const t of tracks) {
      expect(d.trackLessons.get(t.id)?.length, `módulo ${t.code} sem aula`).toBeGreaterThan(0);
    }
  });

  it('lessonMap encontra a mesma aula que a lista', () => {
    for (const l of d.lessons.slice(0, 20)) expect(d.lessonMap.get(l.id)).toBe(l);
  });
});

describe('criarDerivados: roteamento por prefixo mais específico', () => {
  const trilhaDe = (numero) => d.lessons.find((l) => l.number === numero)?.trackId;

  it('manda 20.2.x para unidades de conservação, não para intervenientes', () => {
    // A regra do prefixo mais especifico existe por causa deste par: "20.2"
    // pertence a um modulo e "20" a outro.
    const uc = tracks.find((t) => (t.sections || []).includes('20.2'));
    const interv = tracks.find((t) => (t.sections || []).includes('20'));
    expect(uc && interv && uc.id !== interv.id).toBe(true);
    expect(trilhaDe('20.2.1')).toBe(uc.id);
    expect(trilhaDe('20.1')).toBe(interv.id);
  });

  it('mantém a seção 26.3 como aula, não como navegação', () => {
    // O titulo dela e "Titulos, numeracao, sumario e navegacao": uma regra de
    // navegacao ampla demais ja a excluiu do curso uma vez.
    expect(trilhaDe('26.3')).toBeTruthy();
  });

  it('limita PACUERA a 18.10 e mantém 18.11 a 18.13 em estudos ambientais', () => {
    const pacuera = tracks.find((track) => track.id === 'm09');
    const estudos = tracks.find((track) => track.id === 'm08');

    expect(pacuera.sections).toEqual(['18.10']);
    expect(trilhaDe('18.10.1')).toBe(pacuera.id);
    expect(trilhaDe('18.10.5')).toBe(pacuera.id);
    expect(trilhaDe('18.11')).toBe(estudos.id);
    expect(trilhaDe('18.12')).toBe(estudos.id);
    expect(trilhaDe('18.13')).toBe(estudos.id);
  });
});

describe('criarDerivados: glossário e índice de busca', () => {
  it('extrai siglas do anexo com nome e descrição', () => {
    expect(d.GLOSSARIO.size).toBeGreaterThan(50);
    expect(d.GLOSSARIO.get('PACUERA')?.nome).toMatch(/Plano Ambiental/i);
  });

  it('indexa aula, quadro e sigla no mesmo índice', () => {
    const idx = d.INDICE.get();
    const tipos = new Set(idx.map((x) => x.type));
    expect(tipos).toEqual(new Set(['seção', 'quadro', 'sigla']));
    expect(idx.length).toBeGreaterThan(d.lessons.length);
  });

  it('a busca encontra pelo texto da seção, não só pelo título', () => {
    // O termo procurado tambem passa por norm: comparar texto sem acento com
    // agulha acentuada nunca casa, e foi assim que este teste falhou primeiro.
    const idx = d.INDICE.get();
    const achado = idx.filter((x) => norm(x.text).includes(norm('vazão remanescente')));
    expect(achado.length).toBeGreaterThan(0);
    expect(achado.every((x) => norm(x.title).includes(norm('vazão remanescente')))).toBe(false);
  });

  it('devolve sempre o mesmo índice, sem remontar', () => {
    expect(d.INDICE.get()).toBe(d.INDICE.get());
  });
});

describe('criarDerivados: texto e siglas da aula', () => {
  it('sectionText junta os blocos da seção', () => {
    const comTexto = d.lessons.find((l) => (l.blockIds || []).length > 3);
    expect(d.sectionText(comTexto).length).toBeGreaterThan(80);
  });

  it('siglasDaAula só devolve sigla presente no texto', () => {
    const achadas = d.siglasDaAula('A análise do PACUERA considerou a ADA declarada.');
    const siglas = achadas.map((a) => a.sig);
    expect(siglas).toContain('PACUERA');
    expect(siglas).not.toContain('RTAA');
  });

  it('firstLesson prefere aula numerada à folha de controle', () => {
    for (const t of tracks) {
      const primeira = d.firstLesson(t.id);
      const temNumerada = (d.trackLessons.get(t.id) || []).some((l) => (l.number || '').trim());
      if (temNumerada) expect((primeira.number || '').trim()).toBeTruthy();
    }
  });
});

describe('vínculo aula ↔ caso (exemplo trabalhado)', () => {
  it('todo caso aponta para um módulo que existe e tem aula de abertura', async () => {
    // O bloco "Como isso aparece num processo" so aparece na primeira aula do
    // modulo. Se um caso apontar para modulo sem aula, o bloco some em silencio.
    const { scenarios } = await import('./courseData.js');
    for (const c of scenarios) {
      const t = tracks.find((x) => x.id === c.track);
      expect(t, `caso ${c.id} aponta para módulo inexistente ${c.track}`).toBeTruthy();
      expect(d.firstLesson(t.id), `módulo ${t.code} sem aula de abertura`).toBeTruthy();
    }
  });

  it('todo caso tem o que o bloco precisa mostrar', () => {
    return import('./courseData.js').then(({ scenarios }) => {
      for (const c of scenarios) {
        expect(c.title, `${c.id} sem título`).toBeTruthy();
        expect((c.facts || []).length, `${c.id} com menos de 3 fatos`).toBeGreaterThanOrEqual(3);
        expect((c.questions || [])[0]?.[0], `${c.id} sem primeira pergunta`).toBeTruthy();
      }
    });
  });
});
