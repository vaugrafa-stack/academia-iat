import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const launcher = await readFile(resolve(root, '..', '..', 'Abrir Academia IAT.cmd'), 'utf8');
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
  if (url.includes('pop-content') || url.includes('flowcharts-content')) {
    const file = url.includes('pop-content') ? 'src/data/pop-content.json' : 'src/data/flowcharts-content.json';
    const body = await readFile(resolve(root, file));
    return new Response(body, { headers: { 'content-type': 'application/json' } });
  }
  return nativeFetch(input);
};

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  await vite.ssrLoadModule('/src/main.jsx');
  await new Promise(r => setTimeout(r, 80));

  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
    console.log('PASS', message);
  };
  const click = async element => {
    element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 35));
  };

  assert(packageJson.scripts.dev.includes('--open'), 'iniciador abre o navegador quando o servidor fica pronto');
  assert(launcher.includes('A plataforma ja esta ativa') && launcher.includes(':server_error'), 'iniciador trata instancia existente e mantem erros visiveis');

  assert(document.querySelectorAll('.sidebar-v2 nav button').length === 7, 'sete áreas principais disponíveis (inclui Meu perfil)');
  assert(document.querySelector('.dashboard-page h1')?.textContent.includes('Aprenda o procedimento'), 'painel inicial renderizado');
  assert(document.querySelectorAll('.journey-track button').length === 15, 'quinze módulos no percurso');

  const navButtons = [...document.querySelectorAll('.sidebar-v2 nav button')];
  await click(navButtons.find(x => x.textContent.includes('Formação')));
  assert(document.querySelectorAll('.track-row').length === 15, 'formação completa com quinze módulos');
  const m00 = [...document.querySelectorAll('.track-summary')].find(x => x.textContent.includes('Orientação'));
  await click(m00);
  const lessonButton = document.querySelector('.track-row.expanded .lesson-list button');
  assert(Boolean(lessonButton), 'lista de aulas expande por módulo');
  await click(lessonButton);
  assert(Boolean(document.querySelector('.video-lesson video source[src$=".mp4"]')), 'aula usa vídeo MP4 real');
  assert(document.querySelectorAll('.lesson-tabs button').length === 4, 'abas de aula, fonte, materiais e notas');

  await click(navButtons.find(x => x.textContent.includes('Fluxogramas')));
  assert(document.querySelectorAll('.flow-menu button').length === 7, 'sete fluxogramas interativos');
  assert(document.querySelectorAll('.interactive-flow > button').length >= 6, 'nós interativos do fluxo renderizados');

  await click(navButtons.find(x => x.textContent.includes('Laboratório')));
  assert(document.querySelectorAll('.scenario-tabs button').length === 7, 'sete cenários práticos');
  const answerButton = document.querySelector('.question-stack fieldset:not(.locked) button');
  await click(answerButton);
  assert(document.querySelectorAll('.question-stack fieldset:not(.locked)').length >= 2, 'decisão libera a etapa seguinte');

  await click(navButtons.find(x => x.textContent.includes('Avaliações')));
  assert(document.querySelectorAll('.module-tests button').length >= 10, 'avaliações por módulo disponíveis');

  await click(navButtons.find(x => x.textContent.includes('Biblioteca')));
  assert(document.querySelector('.library-search'), 'biblioteca integral renderizada');

  const avatar = document.querySelector('button.profile');
  assert(Boolean(avatar), 'avatar do topo é um botão');
  await click(avatar);
  assert(document.querySelector('.profile-page'), 'avatar do topo abre o perfil');

  console.log('SMOKE_OK');
} finally {
  await vite.close();
  dom.window.close();
}
