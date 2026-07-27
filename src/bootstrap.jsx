import React from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AppErrorBoundary } from './AppErrorBoundary.jsx';
import { describeAppDataError } from './appData.js';

const root = createRoot(document.getElementById('root'));

function StartupFailure({ error }) {
  const issue = describeAppDataError(error);
  return (
    <main
      role="alert"
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
        <h1>{issue.title}</h1>
        <p>{issue.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
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

try {
  const { default: App } = await import('./main.jsx');
  root.render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>,
  );
} catch (error) {
  console.error('[Academia IAT] falha de inicialização', error);
  root.render(<StartupFailure error={error} />);
}
