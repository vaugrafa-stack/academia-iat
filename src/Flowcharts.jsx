import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  GitBranch,
  Info,
  Maximize2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Route,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { flowSpecs } from "./courseData.js";
import { PageHeader } from "./ui.jsx";
import { useMediaQuery } from "./useMediaQuery.js";

function shuffleIdx(n) {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function FlowDecisionGate({ flow, record }) {
  const [choice, setChoice] = useState(null);
  const decision = flow.decision;
  if (!decision) return null;
  const answered = choice !== null;
  const correct = choice === decision.answer;

  function answer(index) {
    if (answered) return;
    setChoice(index);
    record?.(`${flow.id}:decisao`, index === decision.answer ? 1 : 0, 1);
  }

  return (
    <section className="flow-decision-gate" aria-labelledby={`fd-${flow.id}`}>
      <small>DECISÃO RAMIFICADA · CASO DIDÁTICO</small>
      <h3 id={`fd-${flow.id}`}>{decision.prompt}</h3>
      <div className="flow-decision-options">
        {decision.options.map((option, index) => (
          <button
            type="button"
            key={option}
            disabled={answered}
            aria-pressed={choice === index}
            aria-label={
              answered
                ? `${String.fromCharCode(65 + index)}. ${option}. ${
                    index === decision.answer
                      ? "Resposta correta."
                      : index === choice
                        ? "Sua resposta, incorreta."
                        : "Alternativa não selecionada."
                  }`
                : undefined
            }
            className={
              answered
                ? index === decision.answer
                  ? "correct"
                  : index === choice
                    ? "wrong"
                    : ""
                : ""
            }
            onClick={() => answer(index)}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            {option}
          </button>
        ))}
      </div>
      {answered && (
        <div
          className={`flow-decision-feedback ${correct ? "correct" : "wrong"}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {correct ? (
            <CheckCircle2 aria-hidden="true" />
          ) : (
            <AlertTriangle aria-hidden="true" />
          )}
          <div>
            <strong>{correct ? "Decisão alinhada" : "Decisão a revisar"}</strong>
            <p>{decision.feedback}</p>
            <small>Fonte didática: {decision.source}</small>
            <button type="button" onClick={() => setChoice(null)}>
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function FlowBuilder({ flow, record }) {
  const N = flow.nodes.length;
  const [pool, setPool] = useState(() => shuffleIdx(N));
  const [built, setBuilt] = useState([]);
  useEffect(() => {
    setPool(shuffleIdx(N));
    setBuilt([]);
  }, [flow.id]);
  const done = built.length === N;
  const score = built.filter((idx, k) => idx === k).length;
  useEffect(() => {
    if (done) record && record(flow.id, score, N);
  }, [done]);
  function place(idx) {
    setBuilt((b) => [...b, idx]);
    setPool((p) => p.filter((x) => x !== idx));
  }
  function undo() {
    if (!built.length) return;
    const last = built[built.length - 1];
    setBuilt((b) => b.slice(0, -1));
    setPool((p) => [...p, last]);
  }
  function reset() {
    setPool(shuffleIdx(N));
    setBuilt([]);
  }
  return (
    <div className="flow-builder">
      <div className="fb-head">
        <h3>Monte a sequência correta</h3>
        <p>
          Escolha as etapas na ordem do fluxo. Cada posição informa “correta” ou
          “incorreta” também em texto.
        </p>
      </div>
      <ol className="fb-slots" aria-label="Sequência montada">
        {Array.from({ length: N }).map((_, k) => {
          const idx = built[k];
          const filled = idx !== undefined;
          const ok = filled && idx === k;
          return (
            <li key={k} className={filled ? (ok ? "ok" : "bad") : "open"}>
              <span>{k + 1}</span>
              {filled ? (
                <>
                  <strong>{flow.nodes[idx]}</strong>
                  <em className="fb-status">
                    {ok ? "Posição correta" : "Posição incorreta"}
                  </em>
                  {ok ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
                </>
              ) : (
                <em>Escolha a etapa {k + 1}</em>
              )}
            </li>
          );
        })}
      </ol>
      <div className="fb-pool" aria-label="Etapas disponíveis">
        {pool.length ? (
          pool.map((idx) => (
            <button
              key={idx}
              onClick={() => place(idx)}
              aria-label={`Colocar “${flow.nodes[idx]}” na posição ${built.length + 1}`}
            >
              {flow.nodes[idx]}
            </button>
          ))
        ) : (
          <span className="fb-empty">Todas as etapas foram posicionadas.</span>
        )}
      </div>
      <div className="fb-actions">
        <button className="text-action" onClick={undo} disabled={!built.length}>
          <RotateCcw size={15} /> Desfazer
        </button>
        <button className="text-action" onClick={reset}>
          <RefreshCw size={15} /> Recomeçar
        </button>
      </div>
      <div aria-live="polite">
        {done && (
          <div className={"fb-result " + (score === N ? "perfect" : "")}>
            {score === N ? <CheckCircle2 /> : <AlertTriangle />}
            <div>
              <strong>
                {score} de {N} etapas na posição correta
              </strong>
              <p>
                {score === N
                  ? "Sequência correta. Explique agora por que cada transição existe."
                  : "Há posições incorretas. Use os rótulos textuais, revise o fluxo-fonte e tente novamente."}
              </p>
            </div>
          </div>
        )}
      </div>
      {done && <FlowDecisionGate flow={flow} record={record} />}
    </div>
  );
}

export default function Flowcharts({ state, setState, flowData }) {
  const [selected, setSelected] = useState(flowSpecs[0].id),
    [variant, setVariant] = useState("simplificado"),
    [active, setActive] = useState(0),
    [playing, setPlaying] = useState(true),
    [zoom, setZoom] = useState(1),
    [mode, setMode] = useState("explorar"),
    [fit, setFit] = useState(true);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const flow = flowSpecs.find((f) => f.id === selected);
  useEffect(() => {
    setActive(0);
    setZoom(1);
  }, [selected]);
  useEffect(() => {
    if (reduceMotion) {
      setPlaying(false);
      return undefined;
    }
    if (!playing || mode !== "explorar") return undefined;
    const id = setInterval(
      () => setActive((a) => (a + 1) % flow.nodes.length),
      1600,
    );
    return () => clearInterval(id);
  }, [playing, flow, mode, reduceMotion]);
  const source = flowData.flowcharts.find(
    (f) => f.number === flow.imageNumber && f.variant === variant,
  );
  const guidance = flow.guidance?.[active];
  const record = (id, score, total) =>
    setState &&
    setState((s) => ({
      ...s,
      flows: {
        ...(s.flows || {}),
        [id]: { score, total, date: new Date().toISOString() },
      },
    }));
  const best = state && state.flows && state.flows[selected];
  return (
    <div className="page">
      <PageHeader
        title="Fluxos: proposta e atividade"
        subtitle="Compare as sete propostas em versão original, simplificada e completa e pratique a ordem de suas etapas."
        icon={Route}
      />
      <aside className="flow-source-warning" role="note">
        <AlertTriangle aria-hidden="true" />
        <p>
          <strong>Material de proposta.</strong> Os diagramas vêm do documento
          separado “Proposta de Fluxogramas” e não representam, por si, fluxo
          institucional aprovado. A atividade interativa simplifica a sequência:
          confirme decisões, retornos e fundamentos no POP vigente.
        </p>
      </aside>
      <div className="flow-workspace">
        <aside className="flow-menu">
          {flowSpecs.map((f, i) => (
            <button
              className={selected === f.id ? "active" : ""}
              aria-pressed={selected === f.id}
              key={f.id}
              onClick={() => setSelected(f.id)}
            >
              <span>{i + 1}</span>
              <div>
                <strong>{f.title}</strong>
                <small>
                  {state && state.flows && state.flows[f.id]
                    ? `Montado ${state.flows[f.id].score}/${state.flows[f.id].total}`
                    : "Explorar e montar"}
                </small>
              </div>
              <ChevronRight />
            </button>
          ))}
        </aside>
        <section className="flow-canvas">
          <div className="flow-mode-tabs">
            <button
              className={mode === "explorar" ? "active" : ""}
              aria-pressed={mode === "explorar"}
              onClick={() => setMode("explorar")}
            >
              <Eye /> Explorar
            </button>
            <button
              className={mode === "montar" ? "active" : ""}
              aria-pressed={mode === "montar"}
              onClick={() => setMode("montar")}
            >
              <GitBranch /> Montar o fluxo
            </button>
            {best && (
              <span className="fb-badge">
                <CheckCircle2 /> {best.score}/{best.total}
              </span>
            )}
          </div>
          {mode === "explorar" ? (
            <>
              <div className="flow-toolbar">
                <span className="flow-toolbar-label">
                  Percurso didático em {flow.nodes.length} etapas
                </span>
                <div>
                  <button
                    aria-label={
                      playing
                        ? "Pausar animação do fluxo"
                        : "Reproduzir animação do fluxo"
                    }
                    aria-pressed={playing}
                    onClick={() => setPlaying((v) => !v)}
                  >
                    {playing ? <Pause /> : <Play />}
                  </button>
                  <button
                    aria-label="Reduzir zoom do fluxo"
                    onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
                  >
                    <ZoomOut />
                  </button>
                  <span role="status" aria-live="polite">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    aria-label="Aumentar zoom do fluxo"
                    onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                  >
                    <ZoomIn />
                  </button>
                </div>
              </div>
              <div
                className="interactive-flow"
                style={{ transform: `scale(${zoom})` }}
              >
                {flow.nodes.map((n, i) => (
                  <React.Fragment key={n}>
                    <button
                      className={
                        (i === active ? "active " : "") +
                        (i < active ? "visited " : "") +
                        (n.includes("?") ? "decision" : "")
                      }
                      aria-current={i === active ? "step" : undefined}
                      onClick={() => {
                        setActive(i);
                        setPlaying(false);
                      }}
                    >
                      <span>{i + 1}</span>
                      <strong>{n}</strong>
                      <small>
                        {i === active
                          ? "Etapa em foco"
                          : i < active
                            ? "Percorrida"
                            : "A seguir"}
                      </small>
                    </button>
                    {i < flow.nodes.length - 1 && (
                      <div className={i < active ? "lit" : ""}>
                        <ArrowRight />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flow-insight">
                <Info />
                <div>
                  <small>ETAPA {active + 1}</small>
                  <h3>{flow.nodes[active]}</h3>
                  {guidance ? (
                    <>
                      <p>
                        <strong>Pergunta de controle:</strong> {guidance.question}
                      </p>
                      <dl className="flow-guidance">
                        <div>
                          <dt>Evidência necessária</dt>
                          <dd>{guidance.evidence}</dd>
                        </div>
                        <div>
                          <dt>Risco se ignorar</dt>
                          <dd>{guidance.risk}</dd>
                        </div>
                        <div>
                          <dt>Onde conferir</dt>
                          <dd>{guidance.source}</dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <p>
                      Esta é uma sequência didática resumida. Confira a proposta
                      completa abaixo e registre a motivação antes de avançar.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <FlowBuilder key={flow.id} flow={flow} record={record} />
          )}
          <section className="source-flow-panel">
            <div className="sfp-head">
              <span className="sfp-title">
                <Eye /> Proposta de fluxograma vinculada
              </span>
              <div className="variant-tabs">
                {[
                  ["original", "Original"],
                  ["simplificado", "Simplificado"],
                  ["completo", "Completo"],
                ].map(([v, l]) => (
                  <button
                    className={variant === v ? "active" : ""}
                    aria-pressed={variant === v}
                    onClick={() => setVariant(v)}
                    key={v}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button
                className="sfp-fit"
                aria-pressed={!fit}
                onClick={() => setFit((f) => !f)}
              >
                {fit ? "Ver em tamanho real" : "Ajustar à largura"}
              </button>
              {source && (
                <a
                  className="sfp-open"
                  href={source.publicPath}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Maximize2 /> Nova aba
                </a>
              )}
            </div>
            {source ? (
              <div className={"sfp-scroll " + (fit ? "fit" : "real")}>
                <img
                  key={source.publicPath}
                  src={source.publicPath}
                  alt={`${flow.title}, versão ${variant}`}
                />
              </div>
            ) : (
              <p className="sfp-missing">
                Imagem não encontrada para esta versão.
              </p>
            )}
            {source && (
              <small className="sfp-meta">
                Versão {variant} · {source.widthPx}×{source.heightPx}px · imagem
                vinculada ao documento de fluxogramas
              </small>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}
