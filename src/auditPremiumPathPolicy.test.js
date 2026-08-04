import { describe, expect, it } from 'vitest';
import { containsPersonalHomePath } from '../tools/audit-premium-path-policy.mjs';

describe('política de caminhos pessoais da auditoria premium', () => {
  it('detecta caminhos pessoais locais em Windows e sistemas Unix', () => {
    const windowsPath = ['C:', 'Users', 'pessoa', 'Downloads', 'fonte.docx'].join('\\');
    const unixPath = ['', 'home', 'pessoa', 'projeto', 'fonte.docx'].join('/');
    expect(containsPersonalHomePath(windowsPath)).toBe(true);
    expect(containsPersonalHomePath(unixPath)).toBe(true);
  });

  it('não confunde o segmento público /home/ de uma URL HTTPS com pasta pessoal', () => {
    expect(containsPersonalHomePath(
      'https://geopr.iat.pr.gov.br/portal/home/gallery.html?sortField=title&sortOrder=asc',
    )).toBe(false);
  });

  it('continua encontrando caminho local quando a linha também contém uma URL', () => {
    const localPath = ['', 'home', 'pessoa', 'segredo.txt'].join('/');
    expect(containsPersonalHomePath(
      `fonte=https://example.org/home/catalogo arquivo=${localPath}`,
    )).toBe(true);
  });
});
