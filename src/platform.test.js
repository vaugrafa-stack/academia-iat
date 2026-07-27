import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const cssUrl = new URL('./styles.css', import.meta.url);
const indexUrl = new URL('../index.html', import.meta.url);
const latinUrl = new URL('../public/fonts/manrope-latin.woff2', import.meta.url);
const latinExtUrl = new URL('../public/fonts/manrope-latin-ext.woff2', import.meta.url);

async function sha256(url) {
  const content = await readFile(url);
  return createHash('sha256').update(content).digest('hex').toUpperCase();
}

describe('contratos estáticos da plataforma', () => {
  it('serve Manrope localmente com arquivos íntegros', async () => {
    const css = await readFile(cssUrl, 'utf8');
    expect(css).not.toContain('fonts.googleapis.com');
    expect(css).toContain("url('/fonts/manrope-latin.woff2')");
    expect(css).toContain("url('/fonts/manrope-latin-ext.woff2')");
    expect(await sha256(latinUrl)).toBe('A30DDCD349703AFF7464C34BEF3FFFDFF405EE50C113440D7C8693C02D210972');
    expect(await sha256(latinExtUrl)).toBe('3911B66D9F2E005A4B989223405D0E5032619C668597BA467CC76A23C8FFFCFB');
  });

  it('preserva o recuo do cabeçalho nas aulas e alvos móveis de 44 px', async () => {
    const css = await readFile(cssUrl, 'utf8');
    expect(css).toMatch(/\.main\.lesson-main\s*\{\s*padding-top:var\(--top\)\s*\}/);
    expect(css).toMatch(/@media\(max-width:720px\)[\s\S]*?button\s*\{\s*min-height:44px\s*\}/);
    expect(css).toContain('.quiz-options button.wrong::after');
    expect(css).toContain('.question-stack fieldset button.selected::after');
  });

  it('aplica política de referência e CSP compatível com o site estático', async () => {
    const html = await readFile(indexUrl, 'utf8');
    expect(html).toContain('<meta name="referrer" content="no-referrer"/>');
    expect(html).toContain('Content-Security-Policy');
    expect(html).toContain("object-src 'none'");
    expect(html).toContain("font-src 'self'");
  });
});
