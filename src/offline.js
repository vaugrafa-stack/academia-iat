// Registro do service worker e estado de conexao.
//
// Para que serve: analista em vistoria costuma ficar sem sinal. Com o nucleo
// precarregado, o POP inteiro, os quadros, os fluxogramas, o laboratorio e as
// avaliacoes continuam funcionando offline. Video e imagem ficam guardados
// quando abertos, porque 127 MB de midia nao cabem em precache.
//
// O que este modulo NAO faz: decidir sozinho recarregar a pagina. Uma versao
// nova entra quando a pessoa manda, para nao perder o que esta escrevendo no
// laboratorio ou nas anotacoes.

const BASE = (import.meta.env.BASE_URL || '/');

export function registrarOffline({ onAtualizacao, onConexao } = {}) {
  if (typeof navigator === 'undefined') return;

  if (onConexao) {
    const avisa = () => onConexao(navigator.onLine);
    window.addEventListener('online', avisa);
    window.addEventListener('offline', avisa);
    avisa();
  }

  // Em desenvolvimento o service worker atrapalha mais do que ajuda: ele
  // serviria o build anterior enquanto o Vite recarrega o modulo.
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  // Nao esperar o evento 'load': main.jsx tem await no topo para buscar o POP,
  // entao quando este modulo executa o load ja disparou e o ouvinte nunca
  // seria chamado. Se a pagina ainda estiver carregando, espera; senao, segue.
  const quandoPronto = (fn) => {
    if (document.readyState === 'complete') fn();
    else window.addEventListener('load', fn, { once: true });
  };

  quandoPronto(async () => {
    try {
      const reg = await navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE });

      const observar = (sw) => {
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          // 'installed' com controller ja existente significa versao nova
          // esperando; sem controller e a primeira instalacao.
          if (sw.state === 'installed' && navigator.serviceWorker.controller && onAtualizacao) {
            onAtualizacao(() => {
              sw.postMessage('atualizar-agora');
              sw.addEventListener('statechange', () => {
                if (sw.state === 'activated') window.location.reload();
              });
            });
          }
        });
      };

      if (reg.waiting && onAtualizacao) {
        onAtualizacao(() => {
          reg.waiting.postMessage('atualizar-agora');
          navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
        });
      }
      observar(reg.installing);
      reg.addEventListener('updatefound', () => observar(reg.installing));
    } catch {
      // Sem service worker o app segue funcionando, so nao guarda offline.
    }
  });
}

// Quanto de midia ja esta guardado, para a interface poder dizer o que
// funciona sem rede em vez de prometer offline no vazio.
export async function midiaGuardada() {
  if (!('caches' in window)) return null;
  try {
    const nomes = await caches.keys();
    const midia = nomes.find((n) => n.endsWith('-midia'));
    if (!midia) return { itens: 0 };
    const c = await caches.open(midia);
    return { itens: (await c.keys()).length };
  } catch {
    return null;
  }
}
