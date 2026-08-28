// @vitest-environment jsdom
import React, { Suspense, act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./OfflineManager.jsx', () => ({ default: () => null }));
vi.mock('./profile', () => ({
  hasAccount: () => false,
  registerCertificate: vi.fn(),
  certificateSvg: vi.fn(),
  downloadSvg: vi.fn(),
  listUsers: () => [],
  switchUser: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  exportBackup: vi.fn(),
  importBackup: vi.fn(),
  exportProfileRegistryRecovery: vi.fn(),
  resetInvalidProfileRegistry: vi.fn(),
}));

import Profile from './perfil.jsx';
import ContaRemotaCard from './ContaRemotaCard.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root;

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null;
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function alterarCampo(campo, valor) {
  const setter = Object.getOwnPropertyDescriptor(
    globalThis.HTMLInputElement.prototype,
    'value',
  )?.set;
  setter.call(campo, valor);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
}

function campoDoRotulo(host, texto) {
  return [...host.querySelectorAll('label')]
    .find((label) => label.textContent.includes(texto))
    ?.querySelector('input');
}

function respostaJson(status, corpo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(corpo),
  };
}

describe('restauração do backup local', () => {
  it('informa falha de leitura, limpa a seleção e aceita o mesmo arquivo outra vez', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    const setProfileStatus = vi.fn();
    const arquivo = {
      name: 'backup.json',
      text: vi.fn().mockRejectedValue(new Error('falha privada do dispositivo')),
    };

    await act(async () => {
      root.render(
        <Suspense fallback={null}>
          <Profile
            state={{ completed: [], bookmarks: [], notes: {}, lessonEvidence: {} }}
            setState={vi.fn()}
            algoMaisNovo={vi.fn()}
            progress={0}
            profile={{}}
            setProfile={vi.fn()}
            profileStatus={null}
            setProfileStatus={setProfileStatus}
            go={vi.fn()}
            openLesson={vi.fn()}
            dados={{
              lessons: [],
              trackProgress: () => 0,
              requisitosAutoestudo: () => ({ catalogoPronto: false, pronto: false }),
            }}
          />
        </Suspense>,
      );
    });

    const input = host.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', { configurable: true, value: [arquivo] });
    Object.defineProperty(input, 'value', {
      configurable: true,
      writable: true,
      value: 'C:\\fakepath\\backup.json',
    });

    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(setProfileStatus).toHaveBeenLastCalledWith(expect.objectContaining({
      ok: false,
      code: 'BACKUP_READ',
      recoverable: true,
    }));
    expect(input.value).toBe('');

    Object.defineProperty(input, 'value', {
      configurable: true,
      writable: true,
      value: 'C:\\fakepath\\backup.json',
    });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(arquivo.text).toHaveBeenCalledTimes(2);
    expect(input.value).toBe('');
  });
});

describe('confirmação da conta remota', () => {
  it('refaz o cadastro completo após login de e-mail ainda não verificado', async () => {
    vi.stubGlobal('__CONTA_REMOTA__', true);
    const buscar = vi.fn(async (caminho) => {
      if (caminho === '/api/saude') return respostaJson(200, { ok: true });
      if (caminho === '/api/eu') return respostaJson(401, { codigo: 'sem_sessao' });
      if (caminho === '/api/sessao') {
        return respostaJson(403, {
          codigo: 'email_nao_verificado',
          mensagem: 'Confirme seu e-mail antes de entrar.',
        });
      }
      throw new Error(`Chamada inesperada: ${caminho}`);
    });
    vi.stubGlobal('fetch', buscar);

    const host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root.render(<ContaRemotaCard state={{}} setState={vi.fn()} />);
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });

    const email = campoDoRotulo(host, 'E-mail');
    const senhaDeLogin = campoDoRotulo(host, 'Senha');
    expect(email).toBeTruthy();
    expect(senhaDeLogin).toBeTruthy();

    await act(async () => {
      alterarCampo(email, ' pessoa@example.org ');
      alterarCampo(senhaDeLogin, 'frase segura de login');
      host.querySelector('form').dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });

    const gerarNovoLink = [...host.querySelectorAll('button')]
      .find((button) => button.textContent.includes('Gerar novo link de confirmação'));
    expect(gerarNovoLink).toBeTruthy();
    expect(buscar.mock.calls.map(([caminho]) => caminho)).toEqual([
      '/api/saude',
      '/api/eu',
      '/api/sessao',
    ]);

    await act(async () => gerarNovoLink.click());

    const nome = campoDoRotulo(host, 'Como quer ser chamado');
    const senhaNova = campoDoRotulo(host, 'Senha');
    expect(campoDoRotulo(host, 'E-mail').value).toBe('pessoa@example.org');
    expect(nome).toBeTruthy();
    expect(nome.required).toBe(true);
    expect(nome.value).toBe('');
    expect(senhaNova.required).toBe(true);
    expect(senhaNova.minLength).toBe(12);
    expect(senhaNova.autocomplete).toBe('new-password');
    expect(senhaNova.value).toBe('');
    expect(host.querySelector('button[type="submit"]').textContent).toContain('Criar conta');
  });
});
