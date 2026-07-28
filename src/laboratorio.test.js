import { describe, expect, it } from 'vitest';
import { calcularIndicadoresLaboratorio } from './laboratorio.jsx';

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
});
