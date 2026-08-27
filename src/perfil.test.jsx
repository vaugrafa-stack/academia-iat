// @vitest-environment jsdom
import React, { Suspense, act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./OfflineManager.jsx', () => ({ default: () => null }));
vi.mock('./ContaRemotaCard.jsx', () => ({ default: () => null }));
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

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root;

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

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
