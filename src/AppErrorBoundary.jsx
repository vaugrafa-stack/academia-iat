import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { describeAppDataError } from './appData';

function reloadCurrentPage() {
  window.location.reload();
}

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    const issue = describeAppDataError(error);
    console.error('[Academia IAT] erro de renderização', {
      code: issue.code,
      componentStackAvailable: Boolean(info?.componentStack),
    });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const issue = describeAppDataError(this.state.error);
    const onReload = this.props.onReload || reloadCurrentPage;
    return (
      <main
        className="fatal-screen"
        role="alert"
        aria-labelledby="app-error-title"
        aria-describedby="app-error-message"
      >
        <section>
          <AlertTriangle aria-hidden="true" />
          <small>FALHA RECUPERÁVEL · {issue.code}</small>
          <h1 id="app-error-title">{issue.title}</h1>
          <p id="app-error-message">{issue.message}</p>
          <button type="button" onClick={onReload}>
            <RefreshCw aria-hidden="true" /> Tentar novamente
          </button>
          <p className="fatal-note">
            Seu progresso permanece neste navegador. Esta plataforma é uma minuta técnica e não substitui validação institucional.
          </p>
        </section>
      </main>
    );
  }
}
