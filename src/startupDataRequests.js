import popDataUrl from './data/pop-public-content.json?url';
import flowDataUrl from './data/flowcharts-content.json?url';
import aulaMediaUrl from './data/aula-media.json?url';
import questionBankUrl from './data/question-bank.json?url';
import { startAppDataRequests } from './appData.js';

export const startupDataUrls = Object.freeze({
  popDataUrl,
  flowDataUrl,
  aulaMediaUrl,
  questionBankUrl,
});

export function createStartupDataPreloader({ fetchImpl = fetch } = {}) {
  let requests;
  return function preloadStartupData() {
    requests ??= startAppDataRequests({
      ...startupDataUrls,
      fetchImpl,
    });
    return requests;
  };
}

export const preloadStartupData = createStartupDataPreloader();
