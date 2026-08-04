import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudDownload,
  Database,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import offlinePackagesUrl from './data/offline-packages.json?url';
import {
  baixarMidiaOffline,
  capacidadeOffline,
  limparTodaMidiaOffline,
  obterEstadoOffline,
  removerMidiaOffline,
} from './offline.js';

let packagesCache = null;
let packagesPromise = null;

export function validateOfflinePackages(catalog) {
  if (!catalog || !Array.isArray(catalog.packages) || !catalog.packages.length) {
    throw new Error('offline-packages.json: lista de pacotes ausente');
  }
  if (!Number.isFinite(catalog.totalBytes)) {
    throw new Error('offline-packages.json: tamanho total inválido');
  }
  for (const item of catalog.packages) {
    if (!item?.id || !Array.isArray(item.items) || !item.items.length) {
      throw new Error('offline-packages.json: pacote inválido');
    }
    if (item.items.some((media) => typeof media?.path !== 'string' || !media.path)) {
      throw new Error(`offline-packages.json: mídia inválida em ${item.id}`);
    }
  }
  return catalog;
}

/** Catálogo de downloads. O componente é adiado e a promessa é compartilhada. */
export function loadOfflinePackages({ reload = false } = {}) {
  if (reload) {
    packagesCache = null;
    packagesPromise = null;
  }
  if (packagesCache) return Promise.resolve(packagesCache);
  if (!packagesPromise) {
    packagesPromise = fetch(offlinePackagesUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`offline-packages.json: HTTP ${response.status}`);
        return response.json();
      })
      .then(validateOfflinePackages)
      .then((catalog) => {
        packagesCache = catalog;
        return catalog;
      })
      .catch((error) => {
        packagesPromise = null;
        throw error;
      });
  }
  return packagesPromise;
}

function formatBytes(value) {
  if (!Number.isFinite(value)) return 'não informado';
  const units = ['B', 'KB', 'MB', 'GB'];
  let amount = value;
  let index = 0;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${amount.toLocaleString('pt-BR', {
    maximumFractionDigits: index > 1 ? 1 : 0,
  })} ${units[index]}`;
}

function mediaUrl(path) {
  const base = `${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/`;
  return new URL(`${base}${path.replace(/^\/+/, '')}`, window.location.origin).href;
}

export default function OfflineManager() {
  const [catalog, setCatalog] = useState(() => packagesCache);
  const [status, setStatus] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [cached, setCached] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const allUrls = useMemo(
    () => (catalog?.packages || []).flatMap((item) => item.items.map((media) => mediaUrl(media.path))),
    [catalog],
  );

  const refresh = useCallback(async ({ signal } = {}) => {
    if (!catalog) return;
    setError('');
    setLoading(true);
    try {
      const [statusResult, capacityResult] = await Promise.allSettled([
        obterEstadoOffline({ urls: allUrls, signal }),
        capacidadeOffline(),
      ]);
      if (signal?.aborted) return;

      const issues = [];
      if (statusResult.status === 'fulfilled') {
        setStatus(statusResult.value);
        setCached(statusResult.value?.midia?.urlsGuardadas || {});
      } else {
        setStatus(null);
        setCached(null);
        issues.push(statusResult.reason?.message || 'Não foi possível consultar o conteúdo offline.');
      }
      if (capacityResult.status === 'fulfilled') {
        setCapacity(capacityResult.value);
      } else {
        setCapacity(null);
        issues.push(capacityResult.reason?.message || 'Não foi possível consultar o espaço disponível.');
      }
      setError(issues.join(' '));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [allUrls, catalog]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadOfflinePackages()
      .then((loadedCatalog) => {
        if (active) setCatalog(loadedCatalog);
      })
      .catch((issue) => {
        if (!active) return;
        setCatalog(null);
        setLoading(false);
        setError(issue?.message || 'Não foi possível carregar o catálogo de conteúdo offline.');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!catalog) return undefined;
    if (import.meta.env.DEV) {
      setLoading(false);
      setError('A gestão offline é validada no build de produção; o Service Worker fica desativado durante o desenvolvimento.');
      return undefined;
    }
    const controller = new AbortController();
    refresh({ signal: controller.signal });
    return () => controller.abort();
  }, [catalog, refresh]);

  function retryCatalog() {
    setLoading(true);
    setError('');
    loadOfflinePackages({ reload: true })
      .then(setCatalog)
      .catch((issue) => {
        setCatalog(null);
        setLoading(false);
        setError(issue?.message || 'Não foi possível carregar o catálogo de conteúdo offline.');
      });
  }

  function packageState(item) {
    const urls = item.items.map((media) => mediaUrl(media.path));
    const verified = cached !== null;
    const count = verified ? urls.filter((url) => cached[url]).length : null;
    return {
      urls,
      count,
      verified,
      complete: verified && count === urls.length && urls.length > 0,
    };
  }

  async function download(item) {
    const current = packageState(item);
    setBusy(item.id);
    setError('');
    setProgress({ current: current.count ?? 0, total: current.urls.length });
    try {
      const result = await baixarMidiaOffline(current.urls, {
        onProgresso: (event) => setProgress({
          current: event.atual,
          total: event.total,
          failed: event.resultado?.ok === false,
        }),
      });
      if (!result.ok) {
        setError(`${result.falhas.length} arquivo(s) não puderam ser guardados. Verifique espaço e conexão.`);
      }
      await refresh();
    } catch (issue) {
      setError(issue?.message || 'Falha ao baixar o pacote.');
    } finally {
      setBusy('');
      setProgress(null);
    }
  }

  async function remove(item) {
    const current = packageState(item);
    if (!window.confirm(`Remover do dispositivo o pacote ${item.code} · ${item.title}?`)) return;
    setBusy(item.id);
    setError('');
    try {
      await removerMidiaOffline(current.urls);
      await refresh();
    } catch (issue) {
      setError(issue?.message || 'Falha ao remover o pacote.');
    } finally {
      setBusy('');
    }
  }

  async function clearAll() {
    if (!window.confirm('Remover todos os resumos em vídeo baixados para uso offline neste dispositivo?')) return;
    setBusy('all');
    setError('');
    try {
      await limparTodaMidiaOffline({ confirmar: true });
      await refresh();
    } catch (issue) {
      setError(issue?.message || 'Falha ao limpar o conteúdo offline.');
    } finally {
      setBusy('');
    }
  }

  async function requestPersistence() {
    try {
      setCapacity(await capacidadeOffline({ solicitarPersistencia: true }));
    } catch (issue) {
      setError(issue?.message || 'O navegador não respondeu ao pedido de armazenamento persistente.');
    }
  }

  return (
    <section className="offline-manager" aria-labelledby="offline-title">
      <header>
        <div>
          <small>USO EM CAMPO</small>
          <h2 id="offline-title">Conteúdo offline sob seu controle</h2>
          <p>O núcleo do POP abre offline. Baixe somente os módulos cujos resumos em vídeo você quer levar sem conexão.</p>
        </div>
        <button
          type="button"
          onClick={() => (catalog ? refresh() : retryCatalog())}
          disabled={Boolean(busy) || loading}
        >
          <RefreshCw aria-hidden="true" /> {loading ? 'Consultando…' : catalog ? 'Atualizar estado' : 'Tentar novamente'}
        </button>
      </header>

      <div className="offline-summary">
        <article>
          {loading
            ? <RefreshCw aria-hidden="true" />
            : status?.nucleoPronto
              ? <CheckCircle2 aria-hidden="true" />
              : <AlertTriangle aria-hidden="true" />}
          <span>
            <strong>Núcleo da aplicação</strong>
            <small>
              {loading
                ? 'Verificando disponibilidade…'
                : status?.nucleoPronto
                  ? 'Pronto para abrir sem rede'
                  : status
                    ? 'Abra a plataforma online uma vez para concluir'
                    : 'Estado ainda não verificado'}
            </small>
          </span>
        </article>
        <article>
          <Database aria-hidden="true" />
          <span>
            <strong>
              {status ? `${status.midia?.itens || 0} arquivos de mídia` : 'Mídias ainda não verificadas'}
            </strong>
            <small>
              {status
                ? `${formatBytes(status.midia?.bytesConhecidos || 0)} identificados no cache`
                : 'Consulte o Service Worker para confirmar'}
            </small>
          </span>
        </article>
        <article>
          <HardDrive aria-hidden="true" />
          <span>
            <strong>
              {!capacity
                ? 'Persistência ainda não verificada'
                : !capacity.suportado
                  ? 'Estimativa não suportada'
                  : capacity.persistente
                    ? 'Armazenamento persistente'
                    : 'Armazenamento sujeito à limpeza'}
            </strong>
            <small>
              {capacity?.suportado
                ? `${formatBytes(capacity.uso)} usados de ${formatBytes(capacity.quota)}`
                : 'Uso e quota não informados'}
            </small>
          </span>
        </article>
      </div>

      {!capacity?.persistente && capacity?.suportado && (
        <button type="button" className="offline-persist" onClick={requestPersistence}>
          <ShieldCheck aria-hidden="true" /> Pedir ao navegador para preservar os downloads
        </button>
      )}

      {error && <p className="offline-error" role="alert"><AlertTriangle aria-hidden="true" /> {error}</p>}
      {progress && (
        <div className="offline-progress" role="status" aria-live="polite">
          <span>Baixando e verificando {progress.current} de {progress.total}</span>
          <i><em style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }} /></i>
        </div>
      )}

      <div className="offline-packages">
        {(catalog?.packages || []).map((item) => {
          const current = packageState(item);
          return (
            <article key={item.id} className={current.complete ? 'complete' : ''}>
              <span className="offline-code">{item.code}</span>
              <div>
                <strong>{item.title}</strong>
                <small>
                  {item.lessonCount} tópicos · {item.itemCount} arquivos · {formatBytes(item.bytes)}
                </small>
                <span>
                  {current.verified
                    ? `${current.count} de ${current.urls.length} arquivos guardados`
                    : 'Estado deste pacote ainda não verificado'}
                </span>
              </div>
              <div className="offline-actions">
                <button type="button" onClick={() => download(item)} disabled={Boolean(busy) || loading}>
                  <CloudDownload aria-hidden="true" /> {current.complete ? 'Verificar novamente' : 'Baixar'}
                </button>
                {current.verified && current.count > 0 && (
                  <button type="button" className="remove" onClick={() => remove(item)} disabled={Boolean(busy)}>
                    <Trash2 aria-hidden="true" /> Remover
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <footer>
        <p>Estimativa total dos 17 pacotes: <strong>{catalog ? formatBytes(catalog.totalBytes) : 'a confirmar'}</strong>. O tamanho efetivamente ocupado pode variar conforme o navegador.</p>
        <button type="button" onClick={clearAll} disabled={Boolean(busy) || loading || !status?.midia?.itens}>
          <Trash2 aria-hidden="true" /> Remover todas as mídias offline
        </button>
      </footer>
    </section>
  );
}
