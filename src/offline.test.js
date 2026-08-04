// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  criarAgendadorAtualizacao,
  criarAplicadorAtualizacao,
  ErroOffline,
  obterEstadoOffline,
} from './offline.js';

class ContainerServiceWorker extends EventTarget {}

describe('agendamento de consulta de atualizacao', () => {
  it('consulta na reconexao e limita eventos repetidos', async () => {
    let instante = 1_000;
    let online = true;
    const update = vi.fn().mockResolvedValue(undefined);
    const agendador = criarAgendadorAtualizacao({
      registro: { update },
      agora: () => instante,
      estaOnline: () => online,
      intervaloMs: 100,
    });

    expect(agendador.verificarSeDevido()).toBe(false);
    instante += 99;
    expect(agendador.verificarSeDevido()).toBe(false);
    instante += 1;
    expect(agendador.verificarSeDevido()).toBe(true);
    expect(agendador.verificarSeDevido()).toBe(false);
    await Promise.resolve();
    expect(update).toHaveBeenCalledTimes(1);

    online = false;
    agendador.marcarOffline();
    expect(agendador.verificarSeDevido()).toBe(false);
    online = true;
    expect(agendador.verificarSeDevido()).toBe(true);
    await Promise.resolve();
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('absorve falha oportunista sem rejeicao nao tratada', async () => {
    const update = vi.fn().mockRejectedValue(new Error('rede indisponivel'));
    const agendador = criarAgendadorAtualizacao({
      registro: { update },
      agora: () => 10,
      estaOnline: () => true,
      intervaloMs: 0,
    });
    expect(agendador.verificarSeDevido()).toBe(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(update).toHaveBeenCalledTimes(1);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('atualização controlada do PWA', () => {
  it('só recarrega depois de controllerchange e não duplica a ativação', async () => {
    const container = new ContainerServiceWorker();
    const recarregar = vi.fn();
    const postMessage = vi.fn((_mensagem, portas) => {
      portas[0].postMessage({ tipo: 'IAT_UPDATE_ACCEPTED', ok: true });
    });
    const aplicar = criarAplicadorAtualizacao({
      worker: { postMessage },
      serviceWorkerContainer: container,
      recarregar,
      timeoutMs: 1_000,
    });

    const primeira = aplicar();
    const segunda = aplicar();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(recarregar).not.toHaveBeenCalled();

    container.dispatchEvent(new Event('controllerchange'));
    await expect(primeira).resolves.toEqual({ atualizado: true });
    await expect(segunda).resolves.toEqual({ atualizado: true });
    expect(recarregar).toHaveBeenCalledTimes(1);

    container.dispatchEvent(new Event('controllerchange'));
    expect(recarregar).toHaveBeenCalledTimes(1);
  });

  it('expõe falha de ativação sem recarregar a página', async () => {
    const container = new ContainerServiceWorker();
    const recarregar = vi.fn();
    const onErro = vi.fn();
    const aplicar = criarAplicadorAtualizacao({
      worker: {
        postMessage() {
          throw new Error('worker redundante');
        },
      },
      serviceWorkerContainer: container,
      recarregar,
      onErro,
      timeoutMs: 50,
    });

    await expect(aplicar()).rejects.toBeInstanceOf(ErroOffline);
    expect(onErro).toHaveBeenCalledTimes(1);
    container.dispatchEvent(new Event('controllerchange'));
    expect(recarregar).not.toHaveBeenCalled();
  });

  it('libera uma nova tentativa depois que a ativação falha', async () => {
    const container = new ContainerServiceWorker();
    const onErro = vi.fn();
    const postMessage = vi.fn(() => {
      throw new Error('worker redundante');
    });
    const aplicar = criarAplicadorAtualizacao({
      worker: { postMessage },
      serviceWorkerContainer: container,
      onErro,
      timeoutMs: 50,
    });

    const primeira = aplicar();
    await expect(primeira).rejects.toMatchObject({ codigo: 'UPDATE_FAILED' });

    const segunda = aplicar();
    expect(segunda).not.toBe(primeira);
    await expect(segunda).rejects.toMatchObject({ codigo: 'UPDATE_FAILED' });

    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(onErro).toHaveBeenCalledTimes(2);
  });
});

describe('prontidão do Service Worker', () => {
  it('encerra a espera por navigator.serviceWorker.ready no prazo configurado', async () => {
    vi.useFakeTimers();
    let resolverProntidao;
    const postMessage = vi.fn();
    vi.stubGlobal('navigator', {
      serviceWorker: {
        controller: null,
        ready: new Promise((resolve) => {
          resolverProntidao = resolve;
        }),
      },
    });

    const consulta = obterEstadoOffline({ readyTimeoutMs: 25 });
    const expectativa = expect(consulta).rejects.toMatchObject({
      codigo: 'PWA_READY_TIMEOUT',
    });
    await vi.advanceTimersByTimeAsync(25);
    await expectativa;

    resolverProntidao({ active: { postMessage } });
    await Promise.resolve();
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('cancela também enquanto aguarda a prontidão do Service Worker', async () => {
    const controller = new AbortController();
    vi.stubGlobal('navigator', {
      serviceWorker: {
        controller: null,
        ready: new Promise(() => {}),
      },
    });

    const consulta = obterEstadoOffline({
      signal: controller.signal,
      readyTimeoutMs: 1_000,
    });
    controller.abort();

    await expect(consulta).rejects.toMatchObject({ codigo: 'PWA_ABORTED' });
  });
});
