import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const mainUrl = new URL('./main.jsx', import.meta.url);
// A tela do perfil saiu de main.jsx em 04/08/2026. O contrato de acessibilidade
// dela continua valendo: mudou o arquivo, nao a exigencia.
const perfilUrl = new URL('./perfil.jsx', import.meta.url);
const cssUrl = new URL('./nota10.css', import.meta.url);
const baseCssUrl = new URL('./styles.css', import.meta.url);

describe('contratos de acessibilidade das superfícies principais', () => {
  it('mantém metadados legíveis e empilha a recuperação local no celular', async () => {
    const css = await readFile(cssUrl, 'utf8');

    expect(css).not.toContain('font-size:max(12px,1em)');
    expect(css).toMatch(
      /:root\[data-theme="light"\]\s+\.source-lock small,[\s\S]*?color:var\(--ink2\)/,
    );
    expect(css).toMatch(
      /@media\(max-width:720px\)[\s\S]*?\.storage-error-bar\{[^}]*flex-wrap:wrap/,
    );
    expect(css).toContain('.storage-error-bar>span{min-width:0');
  });

  it('anuncia mensagens e resultados que também são comunicados visualmente', async () => {
    const main = await readFile(mainUrl, 'utf8');
    const perfil = await readFile(perfilUrl, 'utf8');

    expect(main).toContain(
      'className="toast" role="status" aria-live="polite" aria-atomic="true"',
    );
    expect(perfil).toContain('aria-label={`Excluir perfil ${u.name}`}');
    expect(main).toContain('"Resposta correta."');
    expect(main).toContain('"Sua resposta, incorreta."');
  });

  it('mantém todas as abas vinculadas ao painel realmente renderizado', async () => {
    const main = await readFile(mainUrl, 'utf8');

    expect(main).toContain('aria-controls={`painel-aula-${lesson.id}`}');
    expect(main).toContain('id={`painel-aula-${lesson.id}`}');
    expect(main).not.toContain('painel-aula-${lesson.id}-${ids[index]}');
  });

  it('mantém o campo de anotações vinculado ao seu rótulo visível', async () => {
    const main = await readFile(mainUrl, 'utf8');

    expect(main).toMatch(
      /<label htmlFor="lesson-notes">[\s\S]*?Seu caderno[\s\S]*?<\/label>/,
    );
    expect(main).toMatch(/<textarea[\s\S]*?id="lesson-notes"[\s\S]*?value=\{value\}/);
  });

  it('trata o menu movel como dialogo, isola o fundo e devolve o foco por todas as saidas', async () => {
    const [main, baseCss] = await Promise.all([
      readFile(mainUrl, 'utf8'),
      readFile(baseCssUrl, 'utf8'),
    ]);

    expect(main).toContain('role={mobile && open ? "dialog" : undefined}');
    expect(main).toContain('aria-modal={mobile && open ? "true" : undefined}');
    expect(main).toMatch(
      /<Topbar[\s\S]*?inert=\{searchOpen \|\| \(mobileNav && menuOpen\)\}/,
    );
    expect(main).toMatch(
      /<main[\s\S]*?inert=\{searchOpen \|\| \(mobileNav && menuOpen\)\}/,
    );
    expect(main).toContain('document.addEventListener("keydown", containFocus)');
    expect(main).toContain('const restoreMenuFocusOnClose = useRef(false)');
    expect(main).toContain('const restoreFocusId = setTimeout(');
    expect(main).toContain('mobileMenuButton.current?.focus({ preventScroll: true })');
    expect(main).toMatch(
      /if \(event.key === "Escape"\) \{[\s\S]*?closeMobileMenu\(\);[\s\S]*?return;/,
    );
    expect(main).toMatch(
      /className="nav-scrim"[\s\S]*?onPointerDown=\{\(event\) => event\.preventDefault\(\)\}[\s\S]*?onClick=\{closeMobileMenu\}/,
    );
    expect(main).toContain('onClose={closeMobileMenu}');
    expect(main).toMatch(
      /className="sidebar-mobile-close"[\s\S]*?aria-label="Fechar menu"[\s\S]*?onClick=\{onClose\}/,
    );
    expect(baseCss).toMatch(
      /@media\(max-width:980px\)\{\s*\.sidebar-mobile-close\{[^}]*width:44px;[^}]*height:44px;[^}]*display:grid/,
    );
  });

  it('mantém Suporte alcançável por rolagem e identifica o GeoPR como destino externo', async () => {
    const [main, css] = await Promise.all([
      readFile(mainUrl, 'utf8'),
      readFile(cssUrl, 'utf8'),
    ]);

    const mapa = main.indexOf('["mapa", "Mapa do Paraná", MapIcon]');
    const geopr = main.indexOf('"https://geopr.iat.pr.gov.br/portal/home/gallery.html?sortField=title&sortOrder=asc"');
    const biblioteca = main.indexOf('["biblioteca", "Biblioteca", Library]');
    expect(mapa).toBeGreaterThan(-1);
    expect(geopr).toBeGreaterThan(mapa);
    expect(biblioteca).toBeGreaterThan(geopr);
    expect(main).toContain('target="_blank"');
    expect(main).toContain('rel="noopener noreferrer"');
    expect(main).toContain('aria-label={`Abrir ${label} em nova aba (site externo)`}');
    expect(css).toMatch(/\.sidebar-v2 nav\{[^}]*flex:1 1 auto;[^}]*min-height:0;[^}]*overflow-y:auto/);
    expect(css).toContain('.sidebar-v2{overflow:clip}');
    expect(css).toContain('.sidebar-v2>.sidebar-help{margin-top:12px}');
  });

  it('reposiciona o foco no historico e mantem contraste forte no link de salto', async () => {
    const [main, baseCss] = await Promise.all([
      readFile(mainUrl, 'utf8'),
      readFile(baseCssUrl, 'utf8'),
    ]);

    expect(main).toMatch(
      /const onNav = \(\) => \{[\s\S]*?scrollRouteToTop\(\);[\s\S]*?announceRoute\(\);/,
    );
    expect(baseCss).toMatch(
      /\.skip-link\{[^}]*background:#07583b;[^}]*color:#fff/,
    );
  });
});
