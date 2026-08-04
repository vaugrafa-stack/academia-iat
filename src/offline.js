// Registro, atualização controlada e API de armazenamento offline.
//
// A interface existente usa registrarOffline(). As demais funções formam uma
// API para uma futura tela de "Conteúdo offline": download explícito, prova de
// que uma mídia foi guardada, estimativa de quota e remoção consciente.

const BASE = `${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/`;
const TEMPO_LIMITE_MENSAGEM = 30_000;
const TEMPO_LIMITE_PRONTIDAO = 10_000;
const INTERVALO_VERIFICACAO_ATUALIZACAO = 6 * 60 * 60_000;

export class ErroOffline extends Error {
  constructor(codigo, mensagem, detalhes) {
    super(mensagem);
    this.name = 'ErroOffline';
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}

export function criarAgendadorAtualizacao({
  registro,
  agora = () => Date.now(),
  estaOnline = () => typeof navigator !== 'undefined' && navigator.onLine,
  intervaloMs = INTERVALO_VERIFICACAO_ATUALIZACAO,
} = {}) {
  let ultimaVerificacao = estaOnline() ? agora() : null;
  return {
    marcarOffline() {
      ultimaVerificacao = null;
    },
    verificarSeDevido() {
      const instante = agora();
      if (!estaOnline() || (ultimaVerificacao !== null &&
          instante - ultimaVerificacao < intervaloMs)) return false;
      ultimaVerificacao = instante;
      Promise.resolve()
        .then(() => registro.update())
        .catch(() => {
          // Verificacao oportunista: a versao ativa continua integra se a rede falhar.
        });
      return true;
    },
  };
}

function erroNormalizado(erro, codigo = 'PWA_ERROR') {
  if (erro instanceof ErroOffline) return erro;
  return new ErroOffline(
    erro?.codigo || erro?.code || codigo,
    erro?.mensagem || erro?.message || String(erro || 'Erro desconhecido'),
    erro,
  );
}

function ambienteCompativel() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

function fecharPorta(porta) {
  try {
    porta?.close?.();
  } catch {
    // Uma porta transferida pode já ter perdido a propriedade no contexto atual.
  }
}

function idDaMensagem() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `iat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function aguardarProntidao(container, {
  signal,
  timeoutMs = TEMPO_LIMITE_PRONTIDAO,
} = {}) {
  return new Promise((resolve, reject) => {
    let encerrado = false;
    let timer;

    const terminar = (fn, valor) => {
      if (encerrado) return;
      encerrado = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancelar);
      fn(valor);
    };
    const cancelar = () => terminar(
      reject,
      new ErroOffline('PWA_ABORTED', 'Operação offline cancelada.'),
    );

    if (signal?.aborted) {
      cancelar();
      return;
    }
    signal?.addEventListener('abort', cancelar, { once: true });
    timer = setTimeout(() => terminar(
      reject,
      new ErroOffline(
        'PWA_READY_TIMEOUT',
        'O Service Worker não ficou pronto dentro do prazo. Recarregue a plataforma online e tente novamente.',
      ),
    ), timeoutMs);

    try {
      Promise.resolve(container.ready).then(
        (registro) => terminar(resolve, registro),
        (erro) => terminar(reject, erroNormalizado(erro, 'PWA_READY_FAILED')),
      );
    } catch (erro) {
      terminar(reject, erroNormalizado(erro, 'PWA_READY_FAILED'));
    }
  });
}

async function workerAtivo({
  signal,
  timeoutMs = TEMPO_LIMITE_PRONTIDAO,
} = {}) {
  if (!ambienteCompativel()) {
    throw new ErroOffline('PWA_UNSUPPORTED', 'Este navegador não oferece Service Worker.');
  }
  const container = navigator.serviceWorker;
  const registro = await aguardarProntidao(container, { signal, timeoutMs });
  const worker = container.controller || registro?.active;
  if (!worker) {
    throw new ErroOffline('PWA_NOT_READY', 'O conteúdo offline ainda está sendo preparado.');
  }
  return worker;
}

async function enviarMensagem(tipo, dados = {}, {
  onProgresso,
  signal,
  timeoutMs = TEMPO_LIMITE_MENSAGEM,
  readyTimeoutMs = Math.min(timeoutMs, TEMPO_LIMITE_PRONTIDAO),
} = {}) {
  const worker = await workerAtivo({ signal, timeoutMs: readyTimeoutMs });
  return new Promise((resolve, reject) => {
    const canal = new MessageChannel();
    let encerrado = false;
    let timer;

    const terminar = (fn, valor) => {
      if (encerrado) return;
      encerrado = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancelar);
      canal.port1.onmessage = null;
      fecharPorta(canal.port1);
      fecharPorta(canal.port2);
      fn(valor);
    };
    const cancelar = () => terminar(
      reject,
      new ErroOffline('PWA_ABORTED', 'Operação offline cancelada.'),
    );

    canal.port1.onmessage = (evento) => {
      const mensagem = evento.data || {};
      if (mensagem.tipo === 'IAT_MEDIA_PROGRESS') {
        onProgresso?.(mensagem);
        return;
      }
      if (mensagem.tipo !== 'IAT_RESPONSE') return;
      if (mensagem.ok) terminar(resolve, mensagem.resultado);
      else {
        terminar(reject, new ErroOffline(
          mensagem.erro?.codigo || 'PWA_REQUEST_FAILED',
          mensagem.erro?.mensagem || 'A operação offline falhou.',
          mensagem.erro,
        ));
      }
    };
    canal.port1.start?.();

    if (signal?.aborted) {
      cancelar();
      return;
    }
    signal?.addEventListener('abort', cancelar, { once: true });
    timer = setTimeout(() => terminar(
      reject,
      new ErroOffline('PWA_TIMEOUT', 'O Service Worker não respondeu dentro do prazo.'),
    ), timeoutMs);

    try {
      worker.postMessage({ tipo, requestId: idDaMensagem(), ...dados }, [canal.port2]);
    } catch (erro) {
      terminar(reject, erroNormalizado(erro, 'PWA_MESSAGE_FAILED'));
    }
  });
}

export function criarAplicadorAtualizacao({
  worker,
  serviceWorkerContainer = navigator.serviceWorker,
  recarregar = () => window.location.reload(),
  onErro,
  timeoutMs = 20_000,
}) {
  let emCurso = null;

  return function aplicarAtualizacao() {
    if (emCurso) return emCurso;
    const tentativa = new Promise((resolve, reject) => {
      let finalizado = false;
      const canal = new MessageChannel();
      let timer;

      const limpar = () => {
        clearTimeout(timer);
        canal.port1.onmessage = null;
        fecharPorta(canal.port1);
        fecharPorta(canal.port2);
        serviceWorkerContainer.removeEventListener('controllerchange', aoTrocarControle);
      };
      const falhar = (erro) => {
        if (finalizado) return;
        finalizado = true;
        limpar();
        const normalizado = erroNormalizado(erro, 'UPDATE_FAILED');
        reject(normalizado);
        onErro?.(normalizado);
      };
      const aoTrocarControle = () => {
        if (finalizado) return;
        finalizado = true;
        limpar();
        resolve({ atualizado: true });
        recarregar();
      };

      serviceWorkerContainer.addEventListener('controllerchange', aoTrocarControle);
      canal.port1.onmessage = (evento) => {
        const mensagem = evento.data || {};
        if (mensagem.tipo === 'IAT_UPDATE_ACCEPTED' && !mensagem.ok) {
          falhar(new ErroOffline('UPDATE_REJECTED', 'A nova versão não aceitou a ativação.'));
        }
      };
      canal.port1.start?.();
      timer = setTimeout(() => falhar(new ErroOffline(
        'UPDATE_TIMEOUT',
        'A nova versão não assumiu o controle dentro do prazo. Recarregue quando for seguro.',
      )), timeoutMs);

      try {
        worker.postMessage(
          { tipo: 'IAT_ACTIVATE_UPDATE', requestId: idDaMensagem() },
          [canal.port2],
        );
      } catch (erro) {
        falhar(erro);
      }
    });
    emCurso = tentativa;
    tentativa.catch(() => {
      if (emCurso === tentativa) emCurso = null;
    });
    return tentativa;
  };
}

export function registrarOffline({
  onAtualizacao,
  onConexao,
  onErro,
  onEvento,
} = {}) {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return () => {};

  const limpezas = [];
  let cancelado = false;
  const limparTudo = () => {
    cancelado = true;
    limpezas.splice(0).forEach((fn) => fn());
  };
  const adicionar = (alvo, evento, fn, opcoes) => {
    alvo.addEventListener(evento, fn, opcoes);
    limpezas.push(() => alvo.removeEventListener(evento, fn, opcoes));
  };

  if (onConexao) {
    const avisarConexao = () => onConexao(Boolean(navigator.onLine));
    adicionar(window, 'online', avisarConexao);
    adicionar(window, 'offline', avisarConexao);
    avisarConexao();
  }

  if (!ambienteCompativel() || import.meta.env.DEV) {
    return limparTudo;
  }

  const iniciar = async () => {
    try {
      const container = navigator.serviceWorker;
      let registro = await container.getRegistration(BASE);
      const reutilizouRegistro = Boolean(registro);
      if (!registro) {
        try {
          registro = await container.register(`${BASE}sw.js`, { scope: BASE });
        } catch (erroRegistro) {
          // Uma instalacao pode ter terminado entre as duas consultas. Sem um
          // registro existente, preserve a falha original.
          registro = await container.getRegistration(BASE);
          if (!registro) throw erroRegistro;
        }
      }
      if (cancelado) return;
      const agendadorAtualizacao = criarAgendadorAtualizacao({ registro });
      adicionar(window, 'offline', agendadorAtualizacao.marcarOffline);
      adicionar(window, 'online', agendadorAtualizacao.verificarSeDevido);
      adicionar(document, 'visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          agendadorAtualizacao.verificarSeDevido();
        }
      });
      const avisados = new WeakSet();
      const observados = new WeakSet();

      const anunciar = (worker) => {
        if (!worker || worker.state !== 'installed' || !container.controller ||
            avisados.has(worker) || !onAtualizacao) return;
        avisados.add(worker);
        const aplicar = criarAplicadorAtualizacao({
          worker,
          serviceWorkerContainer: container,
          onErro,
        });
        // A interface legada dispara a função no onClick sem aguardar a Promise.
        // Este invólucro impede rejeição não tratada e mantém o erro observável.
        const aplicarSeguro = () => aplicar().catch((erro) => {
          if (!onErro) console.error('[Academia IAT/PWA]', erro);
          return { atualizado: false, erro };
        });
        onAtualizacao(aplicarSeguro, { estado: worker.state });
      };
      const observar = (worker) => {
        if (!worker || observados.has(worker)) return;
        observados.add(worker);
        const mudou = () => {
          anunciar(worker);
          if (worker.state === 'redundant') {
            onErro?.(new ErroOffline(
              'UPDATE_REDUNDANT',
              'A preparação da nova versão foi interrompida; a versão atual continua ativa.',
            ));
          }
        };
        adicionar(worker, 'statechange', mudou);
        mudou();
      };

      anunciar(registro.waiting);
      observar(registro.installing);
      adicionar(registro, 'updatefound', () => observar(registro.installing));
      adicionar(container, 'message', (evento) => {
        const mensagem = evento.data || {};
        if (mensagem.origem !== 'academia-iat') return;
        onEvento?.(mensagem);
        if (mensagem.tipo === 'IAT_PWA_ERROR') {
          onErro?.(new ErroOffline(
            mensagem.codigo || 'PWA_RUNTIME_ERROR',
            mensagem.mensagem || 'Falha no armazenamento offline.',
            mensagem,
          ));
        }
      });

      // Em uma recarga servida pelo fallback offline, o Chromium pode criar o
      // novo documento com navigator.onLine=true. Consulte a navegacao
      // network-first que o proprio Service Worker acabou de observar para a
      // barra e o diagnostico de Suporte nao anunciarem uma conexao inexistente.
      if (onConexao) {
        try {
          const estado = await obterEstadoOffline({
            timeoutMs: 5_000,
            readyTimeoutMs: 5_000,
          });
          const observacaoEm = Number(estado?.conexaoDaUltimaNavegacaoEm);
          const observacaoRecente = Number.isFinite(observacaoEm) &&
            Math.abs(Date.now() - observacaoEm) <= 60_000;
          if (!cancelado && observacaoRecente &&
              estado?.conexaoDaUltimaNavegacao === 'offline') {
            agendadorAtualizacao.marcarOffline();
            onConexao(false);
          } else if (!cancelado && observacaoRecente &&
              estado?.conexaoDaUltimaNavegacao === 'online') {
            onConexao(true);
            if (reutilizouRegistro) {
              agendadorAtualizacao.marcarOffline();
              agendadorAtualizacao.verificarSeDevido();
            }
          }
        } catch {
          // O indicador inicial baseado no navegador continua sendo o fallback.
        }
      }
    } catch (erro) {
      if (!cancelado) onErro?.(erroNormalizado(erro, 'PWA_REGISTER_FAILED'));
    }
  };

  if (document.readyState === 'complete') {
    iniciar();
  } else {
    const carregou = () => iniciar();
    adicionar(window, 'load', carregou, { once: true });
  }

  return limparTudo;
}

export async function obterEstadoOffline({
  url,
  urls,
  signal,
  timeoutMs,
  readyTimeoutMs,
} = {}) {
  return enviarMensagem(
    'IAT_GET_STATUS',
    { url, urls },
    { signal, timeoutMs, readyTimeoutMs },
  );
}

export async function baixarMidiaOffline(urls, {
  forcarRede = false,
  onProgresso,
  signal,
  timeoutMs = 10 * 60_000,
} = {}) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new ErroOffline('MEDIA_LIST_EMPTY', 'Informe ao menos uma mídia para download.');
  }
  return enviarMensagem('IAT_CACHE_MEDIA', {
    urls,
    forcarRede,
  }, { onProgresso, signal, timeoutMs });
}

export async function removerMidiaOffline(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new ErroOffline('MEDIA_REMOVE_LIST_EMPTY', 'Informe ao menos uma mídia para remoção.');
  }
  return enviarMensagem('IAT_REMOVE_MEDIA', { urls });
}

export async function limparTodaMidiaOffline({ confirmar = false } = {}) {
  if (!confirmar) {
    throw new ErroOffline(
      'MEDIA_CLEAR_CONFIRMATION_REQUIRED',
      'Confirme explicitamente a limpeza de todo o conteúdo offline.',
    );
  }
  return enviarMensagem('IAT_REMOVE_MEDIA', { removerTodas: true });
}

export async function midiaEstaGuardada(url) {
  const estado = await obterEstadoOffline({ url });
  return Boolean(estado?.midia?.urlGuardada);
}

// Compatibilidade com a interface anterior.
export async function midiaGuardada() {
  if (typeof window === 'undefined' || !('caches' in window) || !ambienteCompativel()) {
    return null;
  }
  try {
    const estado = await obterEstadoOffline();
    return estado?.midia || { itens: 0 };
  } catch {
    return null;
  }
}

export async function capacidadeOffline({ solicitarPersistencia = false } = {}) {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return {
      suportado: false,
      persistente: false,
      uso: null,
      quota: null,
    };
  }
  let persistente = typeof navigator.storage.persisted === 'function'
    ? await navigator.storage.persisted()
    : false;
  if (solicitarPersistencia && !persistente && typeof navigator.storage.persist === 'function') {
    persistente = await navigator.storage.persist();
  }
  const estimativa = typeof navigator.storage.estimate === 'function'
    ? await navigator.storage.estimate()
    : {};
  return {
    suportado: true,
    persistente,
    uso: Number.isFinite(estimativa.usage) ? estimativa.usage : null,
    quota: Number.isFinite(estimativa.quota) ? estimativa.quota : null,
  };
}
