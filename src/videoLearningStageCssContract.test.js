import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./videoLearningStage.css', import.meta.url), 'utf8');

describe('contrato visual do palco de video', () => {
  // Os videos de aula tem o titulo e o texto queimados dentro do quadro. Em
  // 1440 px o cartao da abertura mede 447 x 374, ou seja 1,196, e o quadro e
  // 16/9, ou seja 1,778: com "cover", 32,7% da largura sumia e as duas pontas
  // do texto ficavam cortadas. Preencher o cartao nao vale o preco de esconder
  // o assunto da aula.
  it('nao corta a largura do quadro compacto para preencher o cartao', () => {
    const regra = css.match(/\.vls-compact \.vls-video\s*\{[^}]*\}/s)?.[0];
    expect(regra).toBeTruthy();
    expect(regra).toMatch(/object-fit:\s*contain/);
    expect(regra).not.toMatch(/object-fit:\s*cover/);
  });

  // Em tela cheia o quadro ja era preservado; a regra abaixo e a que garante
  // que os dois modos digam a mesma coisa.
  it('mantem o quadro inteiro tambem em tela cheia', () => {
    const regra = css.match(/\.vls-stage:fullscreen \.vls-video\s*\{[^}]*\}/s)?.[0];
    expect(regra).toMatch(/object-fit:\s*contain/);
  });
});
