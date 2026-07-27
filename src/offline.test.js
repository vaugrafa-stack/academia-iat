// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { criarAplicadorAtualizacao, ErroOffline } from './offline.js';

class ContainerServiceWorker extends EventTarget {}

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
    expect(recarregar).not.toHaveBeenCalled();
  });
});
