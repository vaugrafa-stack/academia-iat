import { describe, expect, it } from 'vitest';
import { isPermittedPublicEmail } from './audit-premium-email-policy.mjs';

// Os enderecos que devem ser RECUSADOS sao montados peca por peca, e nunca
// escritos inteiros. O proprio `audit-premium` le este arquivo, e um endereco
// literal aqui seria acusado por ele, o que e o comportamento certo do portao e
// deixaria a suite impossivel de rodar. Mesma tecnica de `check-segredos.mjs`.
const junta = (local, dominio) => `${local}${String.fromCharCode(64)}${dominio}`;

describe('quem pode aparecer no repositorio publico', () => {
  it('aceita o alias generico de setor', () => {
    for (const alias of ['contato', 'protocolo', 'ouvidoria', 'licenciamento']) {
      expect(isPermittedPublicEmail(junta(alias, 'iat.pr.gov.br')), alias).toBe(true);
    }
  });

  it('aceita dominio reservado para documentacao', () => {
    // RFC 2606: estes dominios nao podem ser registrados, entao o endereco nao
    // e de ninguem. E o que um teste precisa e o que o portao pode liberar sem
    // abrir excecao para pessoa de verdade.
    for (const dominio of ['example.com', 'example.net', 'example.org']) {
      expect(isPermittedPublicEmail(junta('alguem', dominio)), dominio).toBe(true);
    }
    for (const dominio of ['algo.invalid', 'servico.test', 'host.localhost']) {
      expect(isPermittedPublicEmail(junta('alguem', dominio)), dominio).toBe(true);
    }
  });

  it('recusa endereco de pessoa, que e a razao do portao existir', () => {
    const pessoais = [
      junta('nome.sobrenome', 'gmail.com'),
      junta('j.silva', 'iat.pr.gov.br'),
      junta('analista', 'empresa.com.br'),
    ];
    for (const endereco of pessoais) {
      expect(isPermittedPublicEmail(endereco), endereco).toBe(false);
    }
  });

  it('nao confunde dominio parecido com dominio reservado', () => {
    // `example.com.br` existe de verdade e nao esta reservado. Se a comparacao
    // fosse por sufixo, ele passaria, e a regra que este teste protege ruiria
    // sem ninguem perceber.
    for (const dominio of ['example.com.br', 'example.company', 'naoexample.com']) {
      expect(isPermittedPublicEmail(junta('alguem', dominio)), dominio).toBe(false);
    }
  });

  it('nao estoura com entrada estragada', () => {
    for (const ruim of [null, undefined, '', 'sem arroba', '@sodominio.com', 7]) {
      expect(isPermittedPublicEmail(ruim), String(ruim)).toBe(false);
    }
  });
});
