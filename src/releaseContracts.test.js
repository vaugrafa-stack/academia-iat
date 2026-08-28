import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const qualityPath = resolve(root, '.github/workflows/quality.yml');
const legacyDeployPath = resolve(root, '.github/workflows/deploy-pages.yml');
const quality = readFileSync(qualityPath, 'utf8');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const viteConfig = readFileSync(resolve(root, 'vite.config.mjs'), 'utf8');
const mainSource = readFileSync(resolve(root, 'src/main.jsx'), 'utf8');
const supportSource = readFileSync(resolve(root, 'src/painelAluno.jsx'), 'utf8');

describe('contrato de release imutável', () => {
  it('audita semanalmente sem transformar o agendamento em publicação', () => {
    expect(quality).toContain('schedule:');
    expect(quality).toContain('cron: "17 7 * * 1"');
    expect(quality).toContain(
      "github.event_name == 'schedule' && github.run_id || github.ref",
    );
    const publisher = quality.slice(quality.indexOf('\n  publicar:'));
    expect(publisher).toContain("github.event_name == 'push'");
    expect(publisher).toContain("github.event_name == 'workflow_dispatch'");
    expect(publisher).not.toContain("github.event_name == 'schedule'");
  });

  it('mantém qualidade e publicação no mesmo workflow', () => {
    expect(existsSync(legacyDeployPath)).toBe(false);
    expect(quality).toMatch(/publicar:\s*\n[\s\S]*needs: build-and-test/);
    expect(quality).toContain('actions/download-artifact@');
    expect(quality).toContain('name: academia-iat-${{ github.sha }}');
    expect(quality).toContain('include-hidden-files: true');
    expect(quality).toContain(
      'aquasecurity/trivy-action@ed142fd0673e97e23eac54620cfb913e5ce36c25',
    );
    expect(quality).toContain('version: v0.74.0');
    expect(quality).toContain('format: cyclonedx');
    expect(quality).toContain('sbom-academia-iat-${{ github.sha }}');
  });

  it('aceita o marcador vazio exigido pelo GitHub Pages sem afrouxar os demais arquivos', () => {
    expect(quality).toContain('const requiredNonEmpty = [');
    expect(quality).toContain('const noJekyll = await stat(join(dist, ".nojekyll"));');
    expect(quality).toContain('if (!noJekyll.isFile())');
    const requiredBlock = quality.slice(
      quality.indexOf('const requiredNonEmpty = ['),
      quality.indexOf('for (const file of requiredNonEmpty)'),
    );
    expect(requiredBlock).not.toContain('".nojekyll"');
  });

  it('não recompila dentro do job que publica', () => {
    const publisher = quality.slice(quality.indexOf('\n  publicar:'));
    expect(publisher).not.toContain('pnpm build');
    expect(publisher).toContain('Publicar a branch gh-pages sem recompilar');
    expect(publisher).toContain('grep -R --include=\'*.js\' --fixed-strings "$APPROVED_SHA"');
  });

  it('publica somente a lista explícita de itens produzidos pelo build', () => {
    const publisher = quality.slice(quality.indexOf('\n  publicar:'));
    expect(publisher).not.toContain('git add -- .');
    expect(publisher).toMatch(
      /git add -- \\\s+\.nojekyll \\\s+index\.html \\\s+manifest\.webmanifest \\\s+sw\.js \\\s+icone-192\.png \\\s+icone-512\.png \\\s+assets \\\s+fonts \\\s+hidro \\\s+media \\\s+source-assets/,
    );
  });

  it('bloqueia o deploy até o Playwright validar o artefato', () => {
    expect(quality).toContain('pnpm test:e2e:artifact');
    expect(quality.indexOf('pnpm test:e2e:artifact')).toBeLessThan(
      quality.indexOf('Armazenar dist validado'),
    );
    expect(packageJson.scripts['test:e2e:artifact']).toContain('artifact-320');
    expect(packageJson.scripts['test:e2e:artifact']).toContain('artifact-430');
    expect(readFileSync(resolve(root, 'playwright.config.mjs'), 'utf8')).toContain(
      'testMatch: /artifact\\.pw\\.js/',
    );
    expect(existsSync(resolve(root, 'tests/e2e/artifact.spec.js'))).toBe(false);
  });

  it('incorpora o SHA do CI e o expõe na área de versão', () => {
    expect(viteConfig).toContain('process.env.GITHUB_SHA');
    expect(viteConfig).not.toContain("new Date().toISOString().slice(0, 10)");
    // O selo de proveniência saiu da barra lateral em 04/08/2026: repetia em
    // toda tela um dado que não muda, e a mesma informação já estava no painel
    // inicial e em cada aula. O contrato NÃO mudou de exigência, mudou de
    // lugar: o identificador do build continua obrigatório, agora no
    // diagnóstico da Central de Suporte, que é onde alguém procura ao relatar
    // um problema.
    expect(supportSource).toContain('__BUILD_STAMP__');
    expect(supportSource).toMatch(/build\s*=\s*BUILD_STAMP/);
  });
});
