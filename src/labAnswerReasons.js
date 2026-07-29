import answerReasonUrl from './data/lab-answer-reasons.json?url';

let catalogPromise = null;

export const LAB_ANSWER_REASON_URL = answerReasonUrl;

export function validateLabAnswerReasons(catalog) {
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) {
    throw new Error('Catálogo de explicações das folhas-resposta inválido.');
  }

  const entries = Object.entries(catalog);
  const reasons = entries.flatMap(([, scenarioReasons]) => scenarioReasons);
  if (entries.length !== 26 || reasons.length !== 130) {
    throw new Error('O catálogo deve conter 26 casos e 130 explicações.');
  }
  if (entries.some(([, scenarioReasons]) => (
    !Array.isArray(scenarioReasons)
    || scenarioReasons.length !== 5
    || scenarioReasons.some((reason) => (
      typeof reason !== 'string'
      || !/^(Sim|Não)\./.test(reason)
      || reason.length < 35
    ))
  ))) {
    throw new Error('Há explicação ausente ou incompleta no catálogo das folhas-resposta.');
  }

  return catalog;
}

export function loadLabAnswerReasons() {
  if (!catalogPromise) {
    catalogPromise = fetch(LAB_ANSWER_REASON_URL, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Falha ao carregar as explicações (${response.status}).`);
        }
        return response.json();
      })
      .then(validateLabAnswerReasons)
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }
  return catalogPromise;
}
