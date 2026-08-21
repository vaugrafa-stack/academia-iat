import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpenCheck,
  CheckCircle2,
  Download,
  FileQuestion,
  Printer,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  buildCaseAnswerSheet,
  serializeCaseAnswerSheet,
} from './caseAnswerSheets.js';
import { loadLabAnswerReasons } from './labAnswerReasons.js';
import './routeStyles.css';

function downloadText(sheet) {
  const blob = new Blob([serializeCaseAnswerSheet(sheet)], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `folha-resposta-${sheet.caseId}.txt`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function focusableElements(container) {
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), details > summary, [tabindex]:not([tabindex="-1"])',
  )].filter((element) => {
    if (element.hidden) return false;
    const closedDetails = element.closest('details:not([open])');
    if (!closedDetails) return true;
    return element.matches('summary') && element.parentElement === closedDetails;
  });
}

export function AnswerSheetDrawer({ sheet, open, onClose }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => panelRef.current?.querySelector('[data-close-sheet]')?.focus());

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = focusableElements(panelRef.current);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose, open]);

  useEffect(() => {
    const clearPrintMode = () => document.body.classList.remove('answer-sheet-printing');
    window.addEventListener('afterprint', clearPrintMode);
    return () => {
      window.removeEventListener('afterprint', clearPrintMode);
      clearPrintMode();
    };
  }, []);

  if (!open || !sheet || typeof document === 'undefined') return null;

  const printSheet = () => {
    const details = [...(panelRef.current?.querySelectorAll('details') || [])];
    const previouslyOpen = details.map((element) => element.open);
    details.forEach((element) => { element.open = true; });
    document.body.classList.add('answer-sheet-printing');
    try {
      window.print();
    } finally {
      document.body.classList.remove('answer-sheet-printing');
      details.forEach((element, index) => { element.open = previouslyOpen[index]; });
    }
  };

  const scrollToSection = (sectionId) => {
    const section = panelRef.current?.querySelector(`#${sectionId}`);
    if (!section) return;
    section.scrollIntoView({ block: 'start' });
    section.focus({ preventScroll: true });
  };

  return createPortal(
    <div
      className="answer-sheet-portal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={panelRef}
        className="answer-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="answer-sheet-header">
          <div className="answer-sheet-heading">
            <span aria-hidden="true"><BookOpenCheck size={22} /></span>
            <div>
              <small>CONSULTA ORIENTADA</small>
              <h2 id={titleId}>{sheet.title}</h2>
              <p id={descriptionId}>
                Use depois da sua tentativa para conferir o raciocínio mínimo,
                localizar lacunas e voltar ao exercício.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="answer-sheet-close"
            aria-label="Fechar folha-resposta"
            data-close-sheet
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="answer-sheet-toolbar">
          <nav aria-label="Seções da folha-resposta">
            <button type="button" aria-controls="folha-fatos" onClick={() => scrollToSection('folha-fatos')}>
              Fatos
            </button>
            <button type="button" aria-controls="folha-decisoes" onClick={() => scrollToSection('folha-decisoes')}>
              Decisões
            </button>
            <button type="button" aria-controls="folha-minimo" onClick={() => scrollToSection('folha-minimo')}>
              Conteúdo mínimo
            </button>
            <button type="button" aria-controls="folha-lacunas" onClick={() => scrollToSection('folha-lacunas')}>
              A confirmar
            </button>
            {sheet.glossary?.length > 0 && (
              <button type="button" aria-controls="folha-glossario" onClick={() => scrollToSection('folha-glossario')}>
                Glossário
              </button>
            )}
          </nav>
          <div>
            <button type="button" onClick={() => downloadText(sheet)}>
              <Download size={16} aria-hidden="true" /> Exportar TXT
            </button>
            <button type="button" onClick={printSheet}>
              <Printer size={16} aria-hidden="true" /> Imprimir
            </button>
          </div>
        </div>

        <div className="answer-sheet-body">
          <article className="answer-sheet-case">
            <div>
              <small>
                {sheet.group?.title || 'Caso prático'} · {sheet.complexity.title}
              </small>
              <h3>{sheet.caseLabel} · {sheet.caseTitle}</h3>
              <p>{sheet.group?.summary}</p>
            </div>
            <span>{sheet.type}</span>
          </article>

          <aside className="answer-sheet-use-note" role="note">
            <FileQuestion size={18} aria-hidden="true" />
            <p>
              Esta folha não entrega dados que o caso não fornece. “A confirmar”
              faz parte da resposta correta sempre que não houver comprovação.
            </p>
          </aside>

          <section id="folha-fatos" className="answer-sheet-section" tabIndex="-1">
            <header>
              <span>1</span>
              <div><h3>Fatos disponíveis</h3><p>O que pode ser afirmado sem extrapolar o cenário.</p></div>
            </header>
            <ul className="answer-sheet-facts">
              {sheet.facts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
            {sheet.series && (
              <div className="answer-sheet-table-wrap">
                <table>
                  <caption>{sheet.series.title || 'Série apresentada no cenário'}</caption>
                  <thead><tr>{sheet.series.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                  <tbody>
                    {sheet.series.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sheet.series.note && <small>Nota: {sheet.series.note}</small>}
              </div>
            )}
          </section>

          <section className="answer-sheet-section">
            <header>
              <span>2</span>
              <div><h3>Evidências a confrontar</h3><p>Presença na lista não significa suficiência.</p></div>
            </header>
            {sheet.evidenceTask && (
              <aside className="answer-sheet-task-note">
                <strong>Tarefa de classificação</strong>
                <p>{sheet.evidenceTask.prompt}</p>
              </aside>
            )}
            <ol className="answer-sheet-evidence">
              {sheet.evidence.map((evidence) => (
                <li key={evidence.id}>
                  <span>{evidence.text}</span>
                  {evidence.classification && (
                    <details>
                      <summary>Uso esperado: {evidence.classification.expectedLabel}</summary>
                      <p>{evidence.classification.rationale}</p>
                      <ul>
                        {evidence.classification.sources.map((source) => (
                          <li key={source.id}>
                            <a href={`#/aula/${encodeURIComponent(source.sectionId)}`}>{source.label}</a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              ))}
            </ol>
            {sheet.missingEvidence.length > 0 && (
              <div className="answer-sheet-missing" role="note">
                <strong>Evidências não apresentadas</strong>
                <ul>
                  {sheet.missingEvidence.map((evidence) => (
                    <li key={evidence.id}>{evidence.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section id="folha-decisoes" className="answer-sheet-section" tabIndex="-1">
            <header>
              <span>3</span>
              <div>
                <h3>{sheet.decisions.length} decisões esperadas</h3>
                <p>Resposta, fundamento e ligação com as evidências.</p>
              </div>
            </header>
            <ol className="answer-sheet-decisions">
              {sheet.decisions.map((decision) => (
                <li key={decision.id}>
                  <div className="answer-sheet-decision-title">
                    <p>{decision.prompt}</p>
                    <strong className={decision.expectedKey === 'sim' ? 'yes' : 'no'}>
                      {decision.expectedAnswer}
                    </strong>
                  </div>
                  <p className="answer-sheet-why">
                    <b>Por quê:</b> {decision.justification}
                  </p>
                  {decision.evidence.length > 0 && (
                    <p className="answer-sheet-related">
                      <b>Confronte:</b> {decision.evidence.map((item) => item.text).join('; ')}.
                    </p>
                  )}
                  {decision.sources.length > 0 && (
                    <details>
                      <summary>{decision.sources.length} fonte{decision.sources.length > 1 ? 's' : ''} de apoio no POP</summary>
                      <ul>
                        {decision.sources.map((source) => (
                          <li key={source.id}>
                            <strong>{source.label}</strong>
                            <blockquote>{source.quote}</blockquote>
                          </li>
                        ))}
                      </ul>
                      <small>{decision.supportLabel}</small>
                      {decision.supportCaveat && (
                        <p><b>Ressalva de aplicação:</b> {decision.supportCaveat}</p>
                      )}
                    </details>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section id="folha-minimo" className="answer-sheet-section" tabIndex="-1">
            <header>
              <span>4</span>
              <div>
                <h3>Conteúdo mínimo da fundamentação</h3>
                <p>{sheet.minimumElements.length} pontos que a resposta precisa enfrentar.</p>
              </div>
            </header>
            {sheet.openTask && (
              <aside className="answer-sheet-task-note">
                <strong>Tarefa aberta</strong>
                <p>{sheet.openTask.prompt}</p>
                <small>Registro mínimo: {sheet.openTask.minCharacters} caracteres.</small>
              </aside>
            )}
            <ul className="answer-sheet-minimum">
              {sheet.minimumElements.map((element) => (
                <li key={element.id}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>
                    {element.label}
                    {element.sources?.length > 0 && (
                      <small>
                        {element.sources.map((source, index) => (
                          <React.Fragment key={source.id}>
                            {index > 0 ? ' · ' : ''}
                            <a href={`#/aula/${encodeURIComponent(source.sectionId)}`}>{source.label}</a>
                          </React.Fragment>
                        ))}
                      </small>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="answer-sheet-section">
            <header>
              <span>5</span>
              <div><h3>Desfecho esperado</h3><p>A saída técnica coerente com os fatos apresentados.</p></div>
            </header>
            <div className="answer-sheet-outcome">{sheet.expectedOutcome}</div>
          </section>

          <section className="answer-sheet-section">
            <header>
              <span>6</span>
              <div><h3>Modelo comentado</h3><p>Abra somente quando precisar comparar a estrutura da argumentação.</p></div>
            </header>
            <details className="answer-sheet-model">
              <summary>Mostrar modelo comentado</summary>
              <p>{sheet.commentedModel}</p>
            </details>
          </section>

          <section id="folha-lacunas" className="answer-sheet-section" tabIndex="-1">
            <header>
              <span>7</span>
              <div><h3>Lacunas e dados a confirmar</h3><p>Limites que não podem ser preenchidos por suposição.</p></div>
            </header>
            <ul className="answer-sheet-gaps">
              {sheet.gaps.map((gap) => (
                <li key={gap.id}>
                  <ShieldAlert size={18} aria-hidden="true" />
                  <div><strong>{gap.title}</strong><p>{gap.text}</p></div>
                </li>
              ))}
            </ul>
          </section>

          {sheet.glossary?.length > 0 && (
            <section id="folha-glossario" className="answer-sheet-section" tabIndex="-1">
              <header>
                <span>8</span>
                <div>
                  <h3>Glossário do caso</h3>
                  <p>Siglas usadas nesta folha, expandidas para consulta rápida.</p>
                </div>
              </header>
              <ul className="answer-sheet-evidence">
                {sheet.glossary.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.acronym}</strong>: {entry.definition}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="answer-sheet-source">
            <strong>Fonte editorial do exercício</strong>
            <span>{sheet.source.title} · {sheet.source.version}</span>
            <span>Natureza da fonte: {sheet.source.institutionalStatusLabel}</span>
            {sheet.source.primarySectionLabel && <span>Aula principal: {sheet.source.primarySectionLabel}</span>}
            <details>
              <summary>Detalhes de rastreabilidade</summary>
              <span>Arquivo de origem: {sheet.source.document}</span>
              <code>SHA-256: {sheet.source.sha256}</code>
            </details>
          </footer>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default function CaseAnswerSheet({
  caseData,
  groups,
  lessonMap,
  answerReasons: providedAnswerReasons = null,
  buttonLabel = 'Consultar folha-resposta',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [answerReasons, setAnswerReasons] = useState(providedAnswerReasons);
  const [loadError, setLoadError] = useState(null);
  const loadErrorId = useId();
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (providedAnswerReasons) {
      setAnswerReasons(providedAnswerReasons);
      setLoadError(null);
      return undefined;
    }

    let active = true;
    loadLabAnswerReasons()
      .then((catalog) => {
        if (active) setAnswerReasons(catalog);
      })
      .catch(() => {
        if (active) setLoadError('Não foi possível carregar esta folha-resposta.');
      });
    return () => {
      active = false;
    };
  }, [providedAnswerReasons]);
  const sheet = useMemo(
    () => caseData && answerReasons
      ? buildCaseAnswerSheet(caseData, groups, { lessonMap, answerReasons })
      : null,
    [answerReasons, caseData, groups, lessonMap],
  );

  return (
    <>
      <button
        type="button"
        className={`answer-sheet-launcher ${className}`.trim()}
        onClick={() => setOpen(true)}
        disabled={!sheet || Boolean(loadError)}
        title={loadError || undefined}
        aria-describedby={loadError ? loadErrorId : undefined}
      >
        <BookOpenCheck size={17} aria-hidden="true" />
        {buttonLabel}
      </button>
      {loadError && (
        <span id={loadErrorId} className="answer-sheet-load-error" role="alert">
          {loadError}
        </span>
      )}
      <AnswerSheetDrawer sheet={sheet} open={open} onClose={close} />
    </>
  );
}
