import { describe, expect, it, vi } from 'vitest';
import { interpretarLinkConta, removerTokenDoEndereco } from './contaLinks.js';

describe('links de uso único da conta', () => {
  it('lê verificação e recuperação sem confundir outras rotas', () => {
    expect(interpretarLinkConta('#/verificar?token=abc%2F123')).toEqual({
      acao: 'verificar',
      token: 'abc/123',
    });
    expect(interpretarLinkConta('#/recuperar?token=xyz')).toEqual({
      acao: 'recuperar',
      token: 'xyz',
    });
    expect(interpretarLinkConta('#/perfil')).toBeNull();
  });

  it('preserva a tela explicativa quando o token está ausente', () => {
    expect(interpretarLinkConta('#/verificar')).toEqual({
      acao: 'verificar',
      token: '',
    });
  });

  it('remove o token da entrada corrente do histórico depois do uso', () => {
    const replaceState = vi.fn();
    removerTokenDoEndereco({
      history: { replaceState },
      location: { pathname: '/academia/', search: '?origem=mail' },
    });
    expect(replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/academia/?origem=mail#/conta-concluida',
    );
  });
});
