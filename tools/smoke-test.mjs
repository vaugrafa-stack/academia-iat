import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://academia-iat.local/',
  pretendToBeVisual: true,
});

for (const key of ['window','document','navigator','localStorage','HTMLElement','Element','Node','MutationObserver','Event','MouseEvent','InputEvent','KeyboardEvent','getComputedStyle']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
}
globalThis.self = dom.window;
globalThis.scrollTo = () => {};
dom.window.scrollTo = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = clearTimeout;

const nativeFetch = globalThis.fetch;
globalThis.fetch = async input => {
  const url = String(input);
  let file = null;
  if (url.includes('pop-public-content')) file = 'src/data/pop-public-content.json';
  else if (url.includes('pop-content')) {
    throw new Error('A aplicação tentou carregar o conteúdo-fonte bruto.');
  }
  else if (url.includes('flowcharts-content')) file = 'src/data/flowcharts-content.json';
  else if (url.includes('mapa-parana')) file = 'src/data/mapa-parana.json';
  // O corpo dos casos saiu do pacote e virou arquivo buscado, para nao pesar
  // no orcamento de JS de quem nunca abre o Laboratorio. Sem este ramo, as
  // duas telas que dependem dele ficam presas no estado de carregamento.
  else if (url.includes('lab-index')) file = 'src/data/lab-index.json';
  else if (url.includes('lab-corpos')) file = 'src/data/lab-corpos.json';
  else if (url.includes('question-bank')) file = 'src/data/question-bank.json';
  if (file) {
    const body = await readFile(resolve(root, file));
    return new Response(body, { headers: { 'content-type': 'application/json' } });
  }
  return nativeFetch(input);
};

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  // A montagem passou para bootstrap.jsx; main.jsx so exporta o App. Carregar
  // main.jsx aqui nao renderiza nada e o teste falha no primeiro assert.
  await vite.ssrLoadModule('/src/bootstrap.jsx');
  await new Promise(r => setTimeout(r, 220));

  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
    console.log('PASS', message);
  };
  const click = async element => {
    if (!element) throw new Error('elemento esperado não foi encontrado antes do clique');
    element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 35));
  };
  const waitFor = async (condition, message, timeoutMs = 3000) => {
    const startedAt = Date.now();
    while (!condition()) {
      if (Date.now() - startedAt >= timeoutMs) throw new Error(message);
      await new Promise(r => setTimeout(r, 25));
    }
  };

  assert(packageJson.scripts.dev.includes('--open'), 'iniciador abre o navegador quando o servidor fica pronto');

  assert(document.querySelectorAll('.sidebar-v2 nav button').length === 11, 'onze áreas principais disponíveis (inclui Mapa e Informação Técnica)');
  assert(document.querySelector('.dashboard-page h1')?.textContent.includes('Comece por aqui'), 'primeiro acesso oferece início, e não uma continuidade inexistente');
  assert(document.querySelectorAll('.dashboard-phases > li').length === 4, 'início resume o percurso em quatro fases');
  assert(
    document.querySelector('.dashboard-phases-section')?.textContent.includes('M00 a M16'),
    'início preserva a sequência única M00–M16',
  );

  const navButtons = [...document.querySelectorAll('.sidebar-v2 nav button')];
  await click(navButtons.find(x => x.textContent.includes('Formação pelo POP')));
  await waitFor(
    () => document.querySelectorAll('.track-row').length === 17,
    'a rota lazy da formação não terminou de carregar os dezessete módulos',
  );
  assert(document.querySelectorAll('.track-row').length === 17, 'percurso formativo com dezessete módulos');
  assert(!document.querySelector('.learning-path-selector'), 'formação apresenta uma sequência única, sem divisão por trilhas');
  // o M00 ja abre expandido, para o iniciante ver por onde comecar
  assert(Boolean(document.querySelector('.track-row.expanded .lesson-list button')), 'primeiro módulo já vem aberto para quem chega');
  const outro = [...document.querySelectorAll('.track-row:not(.expanded) .track-summary')][0];
  await click(outro);
  const lessonButton = document.querySelector('.track-row.expanded .lesson-list button');
  assert(Boolean(lessonButton), 'lista de aulas expande por módulo');
  await click(lessonButton);
  await waitFor(
    () => Boolean(document.querySelector('.video-lesson video[src$=".mp4"]')),
    'a rota lazy da aula não terminou de carregar o vídeo',
  );
  assert(Boolean(document.querySelector('.video-lesson video[src$=".mp4"]')), 'aula usa vídeo MP4 real');
  assert(document.querySelectorAll('.lesson-tabs button').length === 4, 'abas de aula, fonte, materiais e notas');
  assert(Boolean(document.querySelector('.lesson-knowledge-check')), 'aula inclui checagem comentada');
  assert(Boolean(document.querySelector('.lesson-active-practice textarea')), 'aula exige recuperação ativa escrita');
  await waitFor(
    () => document.querySelector('.exemplo-processo'),
    'o exemplo do processo nao apareceu depois do carregamento do indice do laboratorio',
  );
  assert(Boolean(document.querySelector('.exemplo-processo')), 'aula conecta o critério a um caso do módulo');

  await click(navButtons.find(x => x.textContent.includes('Fluxogramas')));
  await waitFor(
    () => document.querySelectorAll('.flow-menu button').length === 7,
    'fluxogramas não terminaram de carregar após a navegação',
  );
  assert(Boolean(document.querySelector('.flow-source-warning')), 'fluxos declaram que o documento-fonte é uma proposta');
  assert(document.querySelectorAll('.flow-menu button').length === 7, 'sete fluxogramas interativos');
  assert(document.querySelectorAll('.interactive-flow > button').length >= 6, 'nós interativos do fluxo renderizados');
  assert(document.querySelectorAll('.flow-guidance div').length === 3, 'etapa do fluxo expõe evidência, risco e fonte');
  const montarTab = [...document.querySelectorAll('.flow-mode-tabs button')].find(x => x.textContent.includes('Montar'));
  await click(montarTab);
  assert(document.querySelectorAll('.fb-slots li').length === 6, 'atividade de montar o fluxo com seis etapas');
  assert(document.querySelectorAll('.fb-pool button').length === 6, 'etapas embaralhadas disponíveis para montar');
  while (document.querySelector('.fb-pool button')) {
    await click(document.querySelector('.fb-pool button'));
  }
  assert(document.querySelectorAll('.flow-decision-options button').length === 3, 'fluxo concluído libera decisão ramificada comentada');
  await click(document.querySelector('.flow-decision-options button'));
  assert(Boolean(document.querySelector('.flow-decision-feedback')), 'decisão do fluxo devolve feedback técnico');

  await click(navButtons.find(x => x.textContent.includes('Laboratório')));
  await waitFor(
    () => document.querySelectorAll('.lab-case-catalog [data-lab-case]').length === 26,
    'laboratório não terminou de carregar os vinte e seis cenários',
  );
  assert(document.querySelectorAll('.lab-case-catalog [data-lab-case]').length === 26, 'vinte e seis cenários práticos disponíveis');
  assert(Boolean(document.querySelector('#lab-case-search')), 'catálogo permite pesquisar casos');
  assert(document.querySelectorAll('#lab-category-filter option').length === 6, 'catálogo filtra pelas cinco categorias');
  assert(document.querySelectorAll('.lab-mode-options button').length === 2, 'laboratório oferece os modos Guiado e Desafio');
  assert(Boolean(document.querySelector('.lab-help-ladder')), 'caso oferece ajuda progressiva sem antecipar o debriefing');
  assert(document.querySelector('.lab-serie table') || [...document.querySelectorAll('.lab-case-catalog [data-lab-case]')].some(b => /Programas semestrais/.test(b.textContent)), 'caso longitudinal com série histórica disponível');
  const challengeMode = [...document.querySelectorAll('.lab-mode-options button')].find(x => /Desafio/.test(x.textContent));
  await click(challengeMode);
  assert(document.querySelectorAll('.question-stack fieldset.locked').length === 0, 'modo Desafio libera todas as decisões');
  const guidedMode = [...document.querySelectorAll('.lab-mode-options button')].find(x => /Guiado/.test(x.textContent));
  await click(guidedMode);
  const answerButton = document.querySelector('.question-stack fieldset:not(.locked) button');
  await click(answerButton);
  await waitFor(
    () => document.querySelectorAll('.question-stack fieldset:not(.locked)').length >= 2,
    'a decisão do laboratório não liberou a etapa seguinte',
  );
  assert(document.querySelectorAll('.question-stack fieldset:not(.locked)').length >= 2, 'decisão libera a etapa seguinte');

  await click(navButtons.find(x => x.textContent.includes('Avaliações')));
  await waitFor(
    () => document.querySelectorAll('.module-tests button').length >= 10,
    'avaliações não terminaram de carregar os módulos',
  );
  assert(document.querySelectorAll('.module-tests button').length >= 10, 'avaliações por módulo disponíveis');

  // A avaliação do módulo abre com pelo menos oito questões e o feedback mostra
  // o trecho do POP: sem essa tela, citação errada no banco não aparece para ninguém.
  await click(document.querySelectorAll('.module-tests button')[0]);
  const questionTotal = Number(document.body.textContent.match(/Questão 1 de (\d+)/)?.[1] || 0);
  assert(questionTotal >= 8, 'avaliação do módulo abre com ao menos oito questões');
  await click(document.querySelector('.quiz-options button'));
  await click([...document.querySelectorAll('.answer-confidence button')].find(x => /Alta/.test(x.textContent)));
  await click([...document.querySelectorAll('button')].find(x => /Confirmar/.test(x.textContent)));
  const fonte = document.querySelector('.quiz-fonte blockquote');
  assert(fonte && fonte.textContent.trim().length > 20, 'feedback exibe o trecho do POP que sustenta a questão');

  await click(navButtons.find(x => x.textContent.includes('Redator de IT')));
  await waitFor(
    () => document.querySelectorAll('.rd-trilha button').length === 12,
    'redator não terminou de carregar os doze elementos do item 23.1',
  );
  assert(document.querySelectorAll('.rd-trilha button').length === 12, 'redator abre os doze elementos do item 23.1');
  assert(Boolean(document.querySelector('.rd-divergencia')), 'redator mantém visível a diferença entre o item 23.1 e o Anexo B');
  assert(/O que o POP exige/i.test(document.querySelector('.rd-exige')?.textContent || ''), 'cada seção mostra o que o POP exige');
  const casePicker = document.querySelector('#rd-sel[role="combobox"]');
  assert(Boolean(casePicker), 'redator usa seleção pesquisável de casos');
  assert(
    document.querySelector('label[for="rd-sel"] strong')?.textContent.trim()
      === 'Escolha seu caso de base',
    'redator destaca o rótulo solicitado para seleção do caso',
  );
  await click(casePicker);
  assert(
    document.querySelectorAll('.case-combobox-option[role="option"]').length >= 26,
    'redator oferece todos os casos como base sem dropdown nativo gigante',
  );

  await click(navButtons.find(x => x.textContent.includes('Mapa GeoPR')));
  await waitFor(
    () => document.querySelectorAll('.mp-camadas button').length === 4,
    'mapa não terminou de carregar as camadas',
  );
  assert(document.querySelectorAll('.mp-camadas button').length === 4, 'mapa oferece as quatro camadas');
  assert(document.querySelectorAll('.mp-ex-opcoes button').length === 5, 'exercício de enquadramento com as cinco tipologias');
  assert(document.querySelectorAll('.mp-bacias path').length >= 15, 'mapa desenha as bacias hidrográficas do Paraná');
  assert(document.querySelectorAll('.mp-usinas circle').length >= 100, 'mapa plota as usinas do registro público');
  await click(document.querySelector('.mp-item'));
  assert(document.querySelector('.mp-detalhe dl'), 'clique na lista abre o detalhe da usina');

  await click(navButtons.find(x => x.textContent.includes('Biblioteca')));
  await waitFor(
    () => Boolean(document.querySelector('.library-search')),
    'biblioteca operacional não terminou de carregar',
  );
  assert(document.querySelector('.library-search'), 'biblioteca operacional renderizada');

  const avatar = document.querySelector('button.profile');
  assert(Boolean(avatar), 'avatar do topo é um botão');
  await click(avatar);
  await waitFor(
    () => Boolean(document.querySelector('.profile-page')),
    'perfil não terminou de carregar após o clique no avatar',
  );
  assert(document.querySelector('.profile-page'), 'avatar do topo abre o perfil');

  // Desmonta a tela que consulta o Service Worker antes de fechar o JSDOM.
  // Sem isso, um setState já enfileirado pode tentar ler window.location
  // depois de dom.window.close() e produzir um erro assíncrono enganoso.
  await click(navButtons.find(x => x.textContent.includes('Início')));
  await waitFor(
    () => Boolean(document.querySelector('.dashboard-page')),
    'painel inicial não reapareceu ao encerrar o smoke test',
  );

  console.log('SMOKE_OK');
} finally {
  await vite.close();
  dom.window.close();
}
