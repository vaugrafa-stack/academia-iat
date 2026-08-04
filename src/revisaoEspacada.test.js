import { describe, expect, it } from 'vitest';
import {
  DEGRAUS_EM_DIAS,
  proximoDegrau,
  questoesParaRevisar,
  registrarRodada,
  resumoDaRevisao,
} from './revisaoEspacada.js';

const banco = [
  { id: 'q001', track: 'm00', question: 'Primeira' },
  { id: 'q002', track: 'm01', question: 'Segunda' },
  { id: 'q003', track: 'm02', question: 'Terceira' },
];

describe('degraus da revisão espaçada', () => {
  it('sobe um degrau a cada acerto e nunca passa do último', () => {
    expect(proximoDegrau(undefined, true)).toBe(0);
    expect(proximoDegrau(0, true)).toBe(1);
    expect(proximoDegrau(3, true)).toBe(4);
    expect(proximoDegrau(4, true)).toBe(DEGRAUS_EM_DIAS.length - 1);
  });

  it('volta ao começo no erro, por mais alto que estivesse', () => {
    // Item que escapou precisa voltar antes de escapar de novo. Reduzir
    // apenas um degrau deixaria uma questao errada no fim da fila.
    expect(proximoDegrau(4, false)).toBe(0);
    expect(proximoDegrau(0, false)).toBe(0);
  });
});

describe('registro de uma rodada', () => {
  const agora = '2026-08-04T12:00:00.000Z';

  it('acumula acertos e erros sem mutar o registro anterior', () => {
    const antes = Object.freeze({});
    const depois = registrarRodada(antes, { q001: false, q002: true }, agora);
    expect(antes).toEqual({});
    expect(depois.q001).toMatchObject({ erros: 1, acertos: 0, degrau: 0 });
    expect(depois.q002).toMatchObject({ erros: 0, acertos: 1, degrau: 0 });
  });

  it('adia a proxima revisao conforme o degrau alcancado', () => {
    let r = registrarRodada({}, { q001: true }, agora);
    expect(r.q001.proximaEm).toBe('2026-08-05T12:00:00.000Z'); // 1 dia
    r = registrarRodada(r, { q001: true }, agora);
    expect(r.q001.proximaEm).toBe('2026-08-07T12:00:00.000Z'); // 3 dias
    r = registrarRodada(r, { q001: false }, agora);
    expect(r.q001.proximaEm).toBe('2026-08-05T12:00:00.000Z'); // erro volta a 1
    expect(r.q001.erros).toBe(1);
    expect(r.q001.acertos).toBe(2);
  });

  it('ignora valor que nao seja acerto ou erro', () => {
    const r = registrarRodada({}, { q001: null, q002: 'sim', q003: true }, agora);
    expect(Object.keys(r)).toEqual(['q003']);
  });
});

describe('fila de revisão', () => {
  const agora = '2026-08-20T12:00:00.000Z';
  const revisao = {
    q001: { degrau: 0, erros: 3, acertos: 0, proximaEm: '2026-08-10T12:00:00.000Z' },
    q002: { degrau: 0, erros: 1, acertos: 1, proximaEm: '2026-08-10T12:00:00.000Z' },
    q003: { degrau: 2, erros: 0, acertos: 3, proximaEm: '2026-09-01T12:00:00.000Z' },
  };

  it('devolve so as vencidas, mais atrasadas primeiro', () => {
    const fila = questoesParaRevisar(revisao, banco, agora);
    expect(fila.map((x) => x.questao.id)).toEqual(['q001', 'q002']);
    expect(fila[0].atrasoEmDias).toBe(10);
  });

  it('entre igualmente atrasadas, a mais errada vem antes', () => {
    const fila = questoesParaRevisar(revisao, banco, agora);
    expect(fila[0].registro.erros).toBeGreaterThan(fila[1].registro.erros);
  });

  it('questao que saiu do banco nao volta na fila', () => {
    // O banco muda entre versoes. Sem este filtro a fila apontaria para uma
    // questao inexistente e a tela quebraria ao renderizar o enunciado.
    const fila = questoesParaRevisar({ ...revisao, qZZZ: revisao.q001 }, banco, agora);
    expect(fila.some((x) => !x.questao)).toBe(false);
  });

  it('nunca inclui questao nunca respondida', () => {
    // Revisao e retomada, nao descoberta. Misturar as duas esconde as duas.
    expect(questoesParaRevisar({}, banco, agora)).toEqual([]);
  });
});

describe('resumo da revisão', () => {
  it('separa vencidas, em dia e as que ja tiveram erro', () => {
    const r = resumoDaRevisao(
      {
        q001: { erros: 2, proximaEm: '2026-08-01T00:00:00.000Z' },
        q002: { erros: 0, proximaEm: '2026-09-01T00:00:00.000Z' },
      },
      banco,
      '2026-08-20T12:00:00.000Z',
    );
    expect(r).toEqual({ vencidas: 1, emDia: 1, comErro: 1, acompanhadas: 2 });
  });
});
