import { getLearningDesign } from "./learningDesign.js";
import { objetivoObservavel } from "./objetivoObservavel.js";

// Fonte única do objetivo exibido no Início e dentro da aula. Este módulo é
// pequeno e puro para não puxar toda a tela de lição para o carregamento inicial.
export function objetivoDaAula(lesson, blocks, tableMap) {
  const derivado = objetivoObservavel(lesson, blocks, tableMap);
  if (derivado) return derivado;
  return {
    objetivo: getLearningDesign(lesson, blocks).objective,
    comoSeVe: "",
    origem: "perfil",
    referencia: null,
  };
}
