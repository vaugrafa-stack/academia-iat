import React, { useEffect, useMemo, useState } from 'react';
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
import offlinePackages from './data/offline-packages.json';
import {
  baixarMidiaOffline,
  capacidadeOffline,
  limparTodaMidiaOffline,
  obterEstadoOffline,
  removerMidiaOffline,
} from './offline.js';

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
  const [status, setStatus] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [cached, setCached] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const allUrls = useMemo(
    () => offlinePackages.packages.flatMap((item) => item.items.map((media) => mediaUrl(media.path))),
    [],
  );

  async function refresh({ signal } = {}) {
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
  }

  useEffect(() => {
    if (import.meta.env.DEV) {
      setLoading(false);
      setError('A gestão offline é validada no build de produção; o Service Worker fica desativado durante o desenvolvimento.');
      return;
    }
    const controller = new AbortController();
    refresh({ signal: controller.signal });
    return () => controller.abort();
  }, []);

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
        <button type="button" onClick={() => refresh()} disabled={Boolean(busy) || loading}>
          <RefreshCw aria-hidden="true" /> {loading ? 'Consultando…' : 'Atualizar estado'}
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
        {offlinePackages.packages.map((item) => {
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
        <p>Estimativa total dos 17 pacotes: <strong>{formatBytes(offlinePackages.totalBytes)}</strong>. O tamanho efetivamente ocupado pode variar conforme o navegador.</p>
        <button type="button" onClick={clearAll} disabled={Boolean(busy) || loading || !status?.midia?.itens}>
          <Trash2 aria-hidden="true" /> Remover todas as mídias offline
        </button>
      </footer>
    </section>
  );
}
