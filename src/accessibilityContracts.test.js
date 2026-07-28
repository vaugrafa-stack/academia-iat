import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const mainUrl = new URL('./main.jsx', import.meta.url);
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

    expect(main).toContain(
      'className="toast" role="status" aria-live="polite" aria-atomic="true"',
    );
    expect(main).toContain('aria-label={`Excluir perfil ${u.name}`}');
    expect(main).toContain('"Resposta correta."');
    expect(main).toContain('"Sua resposta, incorreta."');
  });

  it('mantém todas as abas vinculadas ao painel realmente renderizado', async () => {
    const main = await readFile(mainUrl, 'utf8');

    expect(main).toContain('aria-controls={`painel-aula-${lesson.id}`}');
    expect(main).toContain('id={`painel-aula-${lesson.id}`}');
    expect(main).not.toContain('painel-aula-${lesson.id}-${ids[index]}');
  });

  it('trata o menu movel como dialogo, contem o foco e devolve-o ao fechar', async () => {
    const main = await readFile(mainUrl, 'utf8');

    expect(main).toContain('role={mobile && open ? "dialog" : undefined}');
    expect(main).toContain('aria-modal={mobile && open ? "true" : undefined}');
    expect(main).toContain('inert={searchOpen || (mobileNav && menuOpen)}');
    expect(main).toContain('document.addEventListener("keydown", containFocus)');
    expect(main).toContain('document.querySelector(".mobile-menu")?.focus()');
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
