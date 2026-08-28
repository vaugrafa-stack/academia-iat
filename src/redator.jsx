// Redator de Informacao Tecnica.
//
// A plataforma ensinava a reconhecer: julgar sim ou nao, apontar o defeito,
// escolher o encaminhamento. Mas o produto que o analista assina e a
// Informacao Tecnica, e ate aqui ninguem escrevia uma. Aqui ele escreve, secao
// por secao, com o que o POP exige em cada uma ao lado e o caso da pratica
// como materia-prima.
//
// O que este redator NAO faz: corrigir o texto. Ele nao tem como julgar
// redacao, e fingir que tem seria pior do que nao avaliar. Ele guarda o
// rascunho, mostra o que falta, confronta com o desfecho do caso e permite
// levar o texto para avaliacao tecnica.
import React, { useMemo, useState } from 'react';
import { FileText, ChevronRight, ChevronLeft, Download, Check, Circle, Lightbulb, AlertTriangle, Eye } from 'lucide-react';
import { ESTRUTURA_IT, MINIMO_SECAO, progressoIT, montarIT } from './redatorIT.js';
import CaseAnswerSheet from './CaseAnswerSheet.jsx';
import CaseCombobox from './CaseCombobox.jsx';

export default function RedatorIT({ scenarios, grupos, state, setState, go }) {
  const [casoId, setCasoId] = useState(() => state.itCasoAtual || scenarios[0]?.id);
  const [passo, setPasso] = useState(0);
  const [verTexto, setVerTexto] = useState(false);

  const caso = scenarios.find((c) => c.id === casoId) || scenarios[0];
  const rascunho = (state.its && state.its[caso.id]) || {};
  const prog = useMemo(() => progressoIT(rascunho), [rascunho]);
  const secao = ESTRUTURA_IT[passo];
  const texto = rascunho[secao.id] || '';

  const escrever = (v) => setState((s) => ({
    ...s,
    itCasoAtual: caso.id,
    its: { ...(s.its || {}), [caso.id]: { ...((s.its || {})[caso.id] || {}), [secao.id]: v } },
  }));

  const trocarCaso = (id) => {
    setCasoId(id);
    setPasso(0);
    setVerTexto(false);
    setState((s) => ({ ...s, itCasoAtual: id }));
  };

  const baixar = () => {
    const blob = new Blob([montarIT(caso, rascunho)], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `IT-exercicio-${caso.id}.txt`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <div className="page redator-page">
      <header className="page-header">
        <span><FileText /></span>
        <div>
          <small className="ph-kicker">PRODUTO TÉCNICO</small>
          <h1>Redator de Informação Técnica</h1>
          <p>Construa a IT por partes com o caso da prática como matéria-prima. O rascunho fica salvo somente neste navegador.</p>
        </div>
      </header>

      <details className="rd-divergencia">
        <summary>
          <AlertTriangle size={17} aria-hidden="true" />
          <strong>Por que o exercício possui 12 elementos?</strong>
        </summary>
        <div>
          <p>
            O item 23.1 enumera 12 elementos, enquanto o modelo do Anexo B os
            consolida em 10 seções. Este exercício adota os 12 para não omitir a
            identificação técnica nem o controle de qualidade. Antes de usar
            qualquer estrutura em processo real, confirme o modelo vigente com
            a revisão responsável.
          </p>
        </div>
      </details>

      <div className="rd-caso">
        <label className="case-combobox-label" htmlFor="rd-sel">
          <strong>Escolha seu caso de base</strong>
        </label>
        <CaseCombobox
          id="rd-sel"
          scenarios={scenarios}
          groups={grupos}
          value={caso.id}
          onChange={trocarCaso}
        />
        <CaseAnswerSheet caseData={caso} groups={grupos} />
        <span className="rd-prog">{prog.feitas} de {prog.total} itens prontos para revisão</span>
      </div>

      <div className="rd-step-mobile">
        <label htmlFor="rd-step-select">
          <span>Etapa {passo + 1} de {ESTRUTURA_IT.length}</span>
          <select
            id="rd-step-select"
            value={passo}
            onChange={(event) => {
              setPasso(Number(event.target.value));
              setVerTexto(false);
            }}
          >
            {ESTRUTURA_IT.map((item, index) => (
              <option value={index} key={item.id}>
                {item.n}. {item.titulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rd-trilha" role="tablist" aria-label="Elementos da Informação Técnica">
        {ESTRUTURA_IT.map((s, i) => {
          const feita = prog.ids.includes(s.id);
          return (
            <button key={s.id} role="tab" aria-selected={i === passo}
                    className={(i === passo ? 'atual ' : '') + (feita ? 'feita' : '')}
                    onClick={() => { setPasso(i); setVerTexto(false); }}>
              <i>{feita ? <Check size={12} /> : s.n}</i>
              <span>{s.titulo}</span>
            </button>
          );
        })}
      </div>

      {verTexto ? (
        <section className="rd-preview">
          <div className="rd-preview-cab">
            <strong><Eye size={16} /> Sua Informação Técnica</strong>
            <div>
              <button onClick={baixar}><Download size={15} /> Baixar como texto</button>
              <button className="primary" onClick={() => setVerTexto(false)}>Voltar a escrever</button>
            </div>
          </div>
          <pre>{montarIT(caso, rascunho)}</pre>
          <article className="rd-confronto">
            <strong><Lightbulb size={15} /> Confronte com o desfecho do caso</strong>
            <p>{caso.outcome}</p>
            {caso.modelo && (
              <details>
                <summary>Ver a fundamentação modelo deste caso</summary>
                <p>{caso.modelo}</p>
              </details>
            )}
            <small>A comparação é sua. Este exercício não corrige redação: ele guarda o que você escreveu, mostra o que o POP exige em cada seção e permite levar o texto para avaliação de quem orienta.</small>
          </article>
        </section>
      ) : (
        <section className="rd-editor">
          <div className="rd-guia">
            <h2>{secao.n}. {secao.titulo}</h2>
            <div className="rd-exige">
              <strong>O que o POP exige aqui</strong>
              <p>{secao.exige}</p>
            </div>
            <div className="rd-armadilha">
              <AlertTriangle size={15} />
              <div><strong>Erro recorrente</strong><p>{secao.armadilha}</p></div>
            </div>
            <div className="rd-dica">
              <Lightbulb size={15} />
              <p>{secao.dica(caso)}</p>
            </div>
            <details className="rd-materia">
              <summary>Matéria-prima do caso</summary>
              <ul>{(caso.facts || []).map((f) => <li key={f}>{f}</li>)}</ul>
              {caso.serie && (
                <table>
                  <thead><tr>{caso.serie.colunas.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>{caso.serie.linhas.map((l, i) => <tr key={i}>{l.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
                </table>
              )}
            </details>
          </div>

          <div className="rd-campo">
            <textarea value={texto} onChange={(e) => escrever(e.target.value)}
                      placeholder={`Escreva a seção "${secao.titulo}"...`}
                      aria-label={`Texto da seção ${secao.titulo}`} />
            <div className="rd-medidor">
              <span aria-live="polite">
                {texto.trim().length >= MINIMO_SECAO
                  ? 'Registro suficiente para avançar e revisar'
                  : texto.trim().length > 0
              ? 'Rascunho em andamento: desenvolva o raciocínio técnico'
                    : 'Comece pelo achado principal e pela evidência que o sustenta'}
              </span>
            </div>
            <div className="rd-nav">
              <button disabled={passo === 0} onClick={() => setPasso((p) => p - 1)}>
                <ChevronLeft size={16} /> Anterior
              </button>
              {passo < ESTRUTURA_IT.length - 1 ? (
                <button className="primary" onClick={() => setPasso((p) => p + 1)}>
                  Próxima seção <ChevronRight size={16} />
                </button>
              ) : (
                <button className="primary" onClick={() => setVerTexto(true)}>
                  Ver a IT completa <Eye size={16} />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="rd-aviso">
        <Circle size={13} />
        <p>Exercício didático. O status indica apenas a presença de um rascunho, não suficiência nem qualidade. O texto não é peça processual, não tem validade, depende de conferência técnica e não representa manifestação do IAT.</p>
      </footer>
    </div>
  );
}
