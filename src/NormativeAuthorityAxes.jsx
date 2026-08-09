import React from 'react';
import { ExternalLink, Landmark, Scale, Waves } from 'lucide-react';
import { HYDRO_AUTHORITY_AXES } from './officialSources.js';
import './normativeTraceability.css';

const ICONS = {
  'iat-ambiental': Landmark,
  'aneel-setorial': Scale,
  'gestao-hidrica': Waves,
};

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
}

export default function NormativeAuthorityAxes({ compact = false }) {
  return (
    <section
      className={`normative-axes${compact ? ' compact' : ''}`}
      aria-labelledby="normative-axes-title"
    >
      <header>
        <div>
          <span className="eyebrow">Rastreabilidade por competência</span>
          <h2 id="normative-axes-title">Três eixos, três decisões diferentes</h2>
          <p>
            Licença ambiental, ato do setor elétrico e direito de uso da água
            precisam ser conferidos separadamente e permanecer compatíveis.
          </p>
        </div>
        <span className="normative-review-badge">Revisão institucional pendente</span>
      </header>

      <div className="normative-axis-grid">
        {HYDRO_AUTHORITY_AXES.map((axis) => {
          const Icon = ICONS[axis.id] || Scale;
          return (
            <article className={`normative-axis ${axis.id}`} key={axis.id}>
              <div className="normative-axis-heading">
                <span className="normative-axis-icon"><Icon aria-hidden="true" /></span>
                <div>
                  <small>{axis.shortLabel}</small>
                  <h3>{axis.title}</h3>
                </div>
              </div>
              <p>{axis.scope}</p>
              {!compact && (
                <ul>
                  {axis.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
                </ul>
              )}
              <div className="normative-axis-meta">
                <span><strong>Referência localizada:</strong> {axis.act}</span>
                <span><strong>Consulta:</strong> {formatDate(axis.checkedAt)}</span>
                <span><strong>Estado:</strong> {axis.epistemicStatus}</span>
                <span><strong>Revisão:</strong> institucional pendente</span>
              </div>
              <p className="normative-axis-limit">{axis.limitation}</p>
              <div className="normative-axis-links">
                <a href={axis.officialUrl} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" /> Fonte principal
                </a>
                <a href={axis.supportingUrl} target="_blank" rel="noreferrer">
                  Fonte complementar
                </a>
              </div>
            </article>
          );
        })}
      </div>
      <p className="normative-axes-warning">
        Fonte primária localizada não equivale a conteúdo validado, vigência
        confirmada ou aplicação automática. Antes de uma decisão real, confirme
        vigência, transição, domínio do
        corpo hídrico, fase, tipologia e atos do processo.
      </p>
    </section>
  );
}
