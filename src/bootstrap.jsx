import React from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AppErrorBoundary } from './AppErrorBoundary.jsx';
import { describeAppDataError } from './appData.js';

function reloadCurrentPage() {
  window.location.reload();
}

export function StartupFailure({ error, onRetry = reloadCurrentPage }) {
  const issue = describeAppDataError(error);
  return (
    <main
      role="alert"
      aria-labelledby="startup-error-title"
      aria-describedby="startup-error-message"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        color: '#ecfff7',
        background: '#061f18',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <section style={{ maxWidth: 620, border: '1px solid #315b4d', padding: 32, borderRadius: 12 }}>
        <AlertTriangle size={36} color="#f5bd58" aria-hidden="true" />
        <small style={{ display: 'block', marginTop: 16, color: '#9ecaba' }}>
          FALHA RECUPERÁVEL · {issue.code}
        </small>
        <h1 id="startup-error-title">{issue.title}</h1>
        <p id="startup-error-message">{issue.message}</p>
        <button
          type="button"
          onClick={onRetry}
          style={{
            minHeight: 44,
            display: 'inline-flex',
            gap: 8,
            alignItems: 'center',
            border: 0,
            borderRadius: 8,
            padding: '0 18px',
            background: '#79e5c4',
            color: '#06251c',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={18} aria-hidden="true" /> Tentar novamente
        </button>
        <p style={{ color: '#9ecaba', fontSize: 13, marginTop: 24 }}>
          Seu progresso permanece neste navegador. Minuta técnica · validação institucional pendente.
        </p>
      </section>
    </main>
  );
}

export function reportStartupError(error, logger = console) {
  const issue = describeAppDataError(error);
  logger.error('[Academia IAT] falha de inicialização', { code: issue.code });
}

export async function bootstrapApplication({
  rootElement,
  createRootImpl = createRoot,
  loadApplication = () => import('./main.jsx'),
  onReload = reloadCurrentPage,
  reportError = reportStartupError,
} = {}) {
  if (!rootElement) {
    const error = new Error('Contêiner principal ausente.');
    reportError(error);
    return {
      status: 'failed',
      issue: describeAppDataError(error),
      root: null,
    };
  }

  const root = createRootImpl(rootElement);

  try {
    const applicationModule = await loadApplication();
    const App = applicationModule?.default;
    if (!App) {
      throw new Error('Módulo principal sem exportação padrão.');
    }
    root.render(
      <AppErrorBoundary onReload={onReload}>
        <App />
      </AppErrorBoundary>,
    );
    return { status: 'mounted', root };
  } catch (error) {
    reportError(error);
    root.render(<StartupFailure error={error} onRetry={onReload} />);
    return {
      status: 'failed',
      issue: describeAppDataError(error),
      root,
    };
  }
}

const rootElement = document.getElementById('root');
export const startupPromise = rootElement
  ? bootstrapApplication({ rootElement })
  : Promise.resolve({ status: 'skipped', root: null });

// Mantém o contrato da entrada: quem carrega este módulo só prossegue depois
// que o App ou a tela de recuperação substituiu o splash inicial.
await startupPromise;
