// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary.jsx';
import {
  bootstrapApplication,
  loadMainApplication,
  reportStartupError,
  StartupFailure,
} from './bootstrap.jsx';

const mountedRoots = [];

function mount() {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  mountedRoots.push(root);
  return { host, root };
}

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
  });
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('recuperação no ponto de entrada', () => {
  it('inicia os dados antes de importar o chunk principal', async () => {
    const order = [];
    const application = { default: () => null };

    const result = await loadMainApplication({
      preloadData: () => order.push('dados'),
      importApplication: async () => {
        order.push('aplicação');
        return application;
      },
    });

    expect(order).toEqual(['dados', 'aplicação']);
    expect(result).toBe(application);
  });

  it('mantém o caminho normal e monta o App dentro do limite de erro', async () => {
    const host = document.createElement('div');
    document.body.append(host);

    function TestApp() {
      return <h1>Conteúdo principal carregado</h1>;
    }

    let result;
    await act(async () => {
      result = await bootstrapApplication({
        rootElement: host,
        loadApplication: async () => ({ default: TestApp }),
        onReload: vi.fn(),
        reportError: vi.fn(),
      });
    });
    mountedRoots.push(result.root);

    expect(result.status).toBe('mounted');
    expect(host.textContent).toContain('Conteúdo principal carregado');
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });

  it('substitui o splash por diagnóstico seguro quando o App não carrega', async () => {
    const host = document.createElement('div');
    host.innerHTML = '<div id="boot-splash">Carregando indefinidamente</div>';
    document.body.append(host);
    const onReload = vi.fn();
    const reportError = vi.fn();
    const privateDetail = 'C:\\pasta-pessoal\\segredo-interno.txt';

    let result;
    await act(async () => {
      result = await bootstrapApplication({
        rootElement: host,
        loadApplication: async () => {
          throw new Error(privateDetail);
        },
        onReload,
        reportError,
      });
    });
    mountedRoots.push(result.root);

    const alert = host.querySelector('[role="alert"]');
    const retry = [...host.querySelectorAll('button')]
      .find((button) => button.textContent.includes('Tentar novamente'));

    expect(result.status).toBe('failed');
    expect(alert?.getAttribute('aria-labelledby')).toBe('startup-error-title');
    expect(alert?.textContent).toContain('UNEXPECTED_ERROR');
    expect(alert?.textContent).not.toContain(privateDetail);
    expect(host.textContent).not.toContain('Carregando indefinidamente');
    expect(retry).toBeTruthy();

    await act(async () => retry.click());
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledTimes(1);
  });

  it('registra somente o código público da falha de inicialização', () => {
    const logger = { error: vi.fn() };
    const privateDetail = 'token=nao-deve-aparecer';

    reportStartupError(new Error(privateDetail), logger);

    expect(logger.error).toHaveBeenCalledWith(
      '[Academia IAT] falha de inicialização',
      { code: 'UNEXPECTED_ERROR' },
    );
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(privateDetail);
  });

  it('oferece recuperação acessível para erro durante a renderização', async () => {
    const onReload = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { host, root } = mount();

    function BrokenView() {
      throw new Error('detalhe privado da renderização');
    }

    await act(async () => {
      root.render(
        <AppErrorBoundary onReload={onReload}>
          <BrokenView />
        </AppErrorBoundary>,
      );
    });

    const alert = host.querySelector('[role="alert"]');
    const retry = [...host.querySelectorAll('button')]
      .find((button) => button.textContent.includes('Tentar novamente'));

    expect(alert?.getAttribute('aria-labelledby')).toBe('app-error-title');
    expect(alert?.getAttribute('aria-describedby')).toBe('app-error-message');
    expect(alert?.textContent).toContain('UNEXPECTED_ERROR');
    expect(alert?.textContent).not.toContain('detalhe privado da renderização');
    expect(retry).toBeTruthy();

    await act(async () => retry.click());
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();
  });

  it('permite testar a tela de falha sem depender de location.reload', async () => {
    const onRetry = vi.fn();
    const { host, root } = mount();

    await act(async () => {
      root.render(<StartupFailure error={new Error('interno')} onRetry={onRetry} />);
    });

    const button = host.querySelector('button');
    expect(button?.textContent).toContain('Tentar novamente');
    await act(async () => button.click());
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
