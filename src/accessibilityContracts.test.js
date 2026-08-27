import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const mainUrl = new URL('./main.jsx', import.meta.url);
// A tela do perfil saiu de main.jsx em 04/08/2026, e a tela de aula em
// 05/08/2026. Os contratos de acessibilidade delas continuam valendo: mudou o
// arquivo, nao a exigencia. Repontar e obrigatorio; afrouxar seria transformar
// uma extracao em perda de garantia.
const perfilUrl = new URL('./perfil.jsx', import.meta.url);
const licaoUrl = new URL('./licao.jsx', import.meta.url);
const cssUrl = new URL('./nota10.css', import.meta.url);
const baseCssUrl = new URL('./styles.css', import.meta.url);

describe('contratos de acessibilidade das superfícies principais', () => {
  it('mantém metadados legíveis e empilha a recuperação local no celular', async () => {
    const css = await readFile(cssUrl, 'utf8');

    expect(css).not.toContain('font-size:max(12px,1em)');
    // O selo .source-lock saiu da barra lateral em 04/08/2026: a mesma
    // proveniencia ja aparecia no painel inicial e em cada aula, e o build
    // continua no diagnostico do Suporte. O contrato que sobrevive e o do
    // bloco que REALMENTE mostra a fonte hoje.
    expect(css).toMatch(
      /\.source-assurance[\s\S]*?color:var\(--(?:muted|green|ink2)\)/,
    );
    expect(css).toMatch(
      /@media\(max-width:720px\)[\s\S]*?\.storage-error-bar\{[^}]*flex-wrap:wrap/,
    );
    expect(css).toContain('.storage-error-bar>span{min-width:0');
  });

  it('anuncia mensagens e resultados que também são comunicados visualmente', async () => {
    const [main, perfil, licao] = await Promise.all([
      readFile(mainUrl, 'utf8'),
      readFile(perfilUrl, 'utf8'),
      readFile(licaoUrl, 'utf8'),
    ]);

    expect(main).toContain(
      'className="toast" role="status" aria-live="polite" aria-atomic="true"',
    );
    expect(perfil).toContain('aria-label={`Excluir perfil ${u.name}`}');
    expect(perfil).toContain('aria-label={`Baixar registro do módulo ${t.code} · ${t.title}`}');
    expect(perfil).toContain('onChange={restaurarBackup}');
    expect(perfil).toContain('input.value = ""');
    expect(licao).toContain('"Resposta correta."');
    expect(licao).toContain('"Sua resposta, incorreta."');
  });

  it('mantém todas as abas vinculadas ao painel realmente renderizado', async () => {
    const licao = await readFile(licaoUrl, 'utf8');

    expect(licao).toContain('aria-controls={`painel-aula-${lesson.id}`}');
    expect(licao).toContain('id={`painel-aula-${lesson.id}`}');
    expect(licao).not.toContain('painel-aula-${lesson.id}-${ids[index]}');
  });

  it('mantém o campo de anotações vinculado ao seu rótulo visível', async () => {
    const licao = await readFile(licaoUrl, 'utf8');

    expect(licao).toMatch(
      /<label htmlFor="lesson-notes">[\s\S]*?Seu caderno[\s\S]*?<\/label>/,
    );
    expect(licao).toMatch(/<textarea[\s\S]*?id="lesson-notes"[\s\S]*?value=\{value\}/);
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

  it('nenhum destino da navegação inferior encolhe abaixo do alvo de toque', async () => {
    // Em 10/08/2026 esta regra foi de `min-height:54px` para
    // `min-height:28px;max-height:28px` e atravessou build, suíte e CI sem que
    // nada acusasse: nenhum portão media o alvo de toque da barra inferior, que
    // é justamente o controle mais usado no celular.
    //
    // A altura é lida do CSS, e não do navegador, porque este é um contrato de
    // fonte: o e2e mede o retângulo renderizado, e é bom que meça, mas ele só
    // roda no artefato construído. Aqui o defeito morre antes de virar build.
    const folhaBase = await readFile(baseCssUrl, 'utf8');
    const regra = folhaBase.match(/\.mobile-bottom-nav button\{([^}]*)\}/);
    expect(regra, '.mobile-bottom-nav button precisa existir').toBeTruthy();

    const altura = Number(regra[1].match(/min-height:\s*(\d+)px/)?.[1] ?? 0);
    expect(altura, `min-height declarado: ${altura}px`).toBeGreaterThanOrEqual(44);

    // `max-height` menor que o mínimo transforma o alvo em faixa fina sem que o
    // `min-height` pareça errado. Foi assim que o defeito passou despercebido.
    const teto = regra[1].match(/max-height:\s*(\d+)px/)?.[1];
    if (teto !== undefined) {
      expect(Number(teto), `max-height declarado: ${teto}px`).toBeGreaterThanOrEqual(44);
    }
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
    // O contrato MEDE o contraste, em vez de prender um hex.
    //
    // Antes ele exigia `background:#07583b`, o que é proxy: reprova quando a
    // paleta muda, mesmo que o contraste melhore, e passaria se alguém trocasse
    // por outro valor escuro ruim. O nome do teste sempre prometeu contraste;
    // agora ele confere contraste.
    const regra = baseCss.match(/\.skip-link\{([^}]*)\}/)?.[1] || '';
    const fundo = regra.match(/background:(#[0-9a-f]{3,8})/i)?.[1];
    const frente = regra.match(/(?:^|;)color:(#[0-9a-f]{3,8})/i)?.[1];
    expect(fundo, 'link de salto precisa declarar fundo próprio').toBeTruthy();
    expect(frente, 'link de salto precisa declarar cor de texto').toBeTruthy();
    expect(contraste(frente, fundo)).toBeGreaterThanOrEqual(7);
  });

  it('mantem texto contrastante nos botoes primarios do tema escuro', async () => {
    const baseCss = await readFile(baseCssUrl, 'utf8');

    // A regra base de `.primary` usa texto branco com `!important`. Sem um
    // sentinela temático igualmente importante, o gradiente verde claro
    // renderizado cai a 2,25:1 no primeiro stop.
    expect(baseCss).toMatch(
      /:root:not\(\[data-theme="light"\]\) button\.primary\{color:var\(--sobre-acento\)!important\}/,
    );
  });
});

/** Razão de contraste WCAG entre duas cores em hexadecimal. */
function contraste(a, b) {
  const canais = (h) => {
    const s = h.replace('#', '');
    const cheio = s.length === 3 ? [...s].map((c) => c + c).join('') : s;
    return [0, 2, 4].map((i) => parseInt(cheio.slice(i, i + 2), 16));
  };
  const lum = (cor) => {
    const [r, g, b] = canais(cor).map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [alto, baixo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (alto + 0.05) / (baixo + 0.05);
}
