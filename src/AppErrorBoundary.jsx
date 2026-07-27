import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { describeAppDataError } from './appData';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Academia IAT] erro de renderização', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const issue = describeAppDataError(this.state.error);
    return (
      <main className="fatal-screen" role="alert">
        <section>
          <AlertTriangle aria-hidden="true" />
          <small>FALHA RECUPERÁVEL · {issue.code}</small>
          <h1>{issue.title}</h1>
          <p>{issue.message}</p>
          <button type="button" onClick={() => window.location.reload()}>
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
