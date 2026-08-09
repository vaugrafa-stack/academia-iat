import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Lightbulb,
  MessageSquareText,
  RefreshCw,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { ComparaDiagnostico } from "./painelAluno.jsx";
import { PageHeader } from "./ui.jsx";
import {
  questoesParaRevisar,
  registrarRodada,
  resumoDaRevisao,
} from "./revisaoEspacada.js";
import {
  newAssessmentSeed,
  prepareAssessment,
  selectDiagnosticAnchors,
} from "./assessmentDesign.js";
import "./avaliacoes.css";

// Duas aplicações dos mesmos itens-âncora. A comparação é descritiva: mesmo
// com itens iguais, efeito de memória e familiaridade impedem atribuir a
// variação causalmente ao estudo.
const DIAG_RAPIDO_POR_MODULO = 1;
const DIAG_COMPLETO_POR_MODULO = 3;
const CONFIDENCE_LEVELS = Object.freeze([
  ["baixa", "Baixa", "Ainda estou em dúvida"],
  ["media", "Média", "Tenho alguma segurança"],
  ["alta", "Alta", "Estou convicto desta resposta"],
]);

// O que a pessoa errou volta, e volta cada vez mais tarde. Só aparece quando
// há questão vencida, para a retomada útil não virar ruído em toda visita.
function RevisaoPendente({ state, openLesson, questionBank }) {
  const fila = useMemo(
    () => questoesParaRevisar(state.revisao, questionBank),
    [state.revisao, questionBank],
  );
  const resumo = useMemo(
    () => resumoDaRevisao(state.revisao, questionBank),
    [state.revisao, questionBank],
  );
  if (!fila.length) return null;
  return (
    <section className="revisao-pendente">
      <header>
        <RefreshCw size={16} aria-hidden="true" />
        <div>
          <small>RETOMADA DO QUE ESCAPOU</small>
          <h2>
            {fila.length} {fila.length === 1 ? "questão" : "questões"} para
            revisar
          </h2>
          <p>
            Você acompanha {resumo.acompanhadas}{" "}
            {resumo.acompanhadas === 1 ? "questão" : "questões"}, e{" "}
            {resumo.comErro} já {resumo.comErro === 1 ? "escapou" : "escaparam"}{" "}
            ao menos uma vez. O intervalo cresce a cada acerto e volta ao início
            a cada erro.
          </p>
        </div>
      </header>
      <ul>
        {fila.map(({ questao, registro, atrasoEmDias }) => (
          <li key={questao.id}>
            <button
              type="button"
              onClick={() => questao.source?.sec && openLesson(questao.source.sec)}
            >
              <span>{questao.question}</span>
              <small>
                {registro.erros > 0
                  ? `${registro.erros}× errada`
                  : "em acompanhamento"}
                {atrasoEmDias > 0 ? ` · vencida há ${atrasoEmDias} d` : " · vence hoje"}
              </small>
            </button>
          </li>
        ))}
      </ul>
      <small className="revisao-nota">
        Isto reapresenta o que você errou no momento em que esquecer é provável.
        Continua sendo autoestudo, e não medida validada de competência.
      </small>
    </section>
  );
}

export default function Assessments({ state, setState, openLesson, dados }) {
  const { firstLesson, lessonMap, lessons, questionBank, tracks } = dados;
  const [track, setTrack] = useState("geral"),
    [started, setStarted] = useState(false),
    [index, setIndex] = useState(0),
    [answers, setAnswers] = useState({}),
    [confidence, setConfidence] = useState({}),
    [revealed, setRevealed] = useState(false),
    [done, setDone] = useState(false),
    [attemptSeed, setAttemptSeed] = useState(() => newAssessmentSeed()),
    [diagnosticForm, setDiagnosticForm] = useState(() =>
      state.diagnostico?.entrada ? "B" : "A",
    ),
    [diagnosticSize, setDiagnosticSize] = useState(() =>
      state.diagnostico?.entrada?.amostraPorModulo || DIAG_RAPIDO_POR_MODULO,
    );
  const stageHeadingRef = useRef(null);

  // Diagnóstico geral: a pessoa escolhe uma amostra rápida ou completa na
  // entrada. A reaplicação reutiliza o mesmo tamanho e os mesmos itens-âncora;
  // só ordem e posição das alternativas mudam.
  const questions = useMemo(() => {
    let base;
    if (track !== "geral") base = questionBank.filter((q) => q.track === track);
    else base = selectDiagnosticAnchors(questionBank, tracks, diagnosticSize);
    return prepareAssessment(base, attemptSeed);
  }, [track, attemptSeed, diagnosticForm, diagnosticSize, questionBank, tracks]);
  const diagnosticQuestionCount = selectDiagnosticAnchors(
    questionBank,
    tracks,
    diagnosticSize,
  ).length;
  const q = questions[index];
  const score = questions.filter((x, i) => answers[i] === x.answer).length;

  useLayoutEffect(() => {
    if (track === "geral" && revealed) {
      setRevealed(false);
      next();
    }
  }, [track, revealed]);

  // Ao iniciar, avançar ou concluir, o foco acompanha o conteúdo que mudou.
  // Isso preserva a posição de quem usa teclado ou leitor de tela sem rolar a
  // página nem criar uma segunda fonte de estado.
  useLayoutEffect(() => {
    if (started) stageHeadingRef.current?.focus({ preventScroll: true });
  }, [started, index, done]);

  function reset(id = track) {
    setTrack(id);
    setAttemptSeed(newAssessmentSeed());
    setDiagnosticForm(state.diagnostico?.entrada ? "B" : "A");
    setDiagnosticSize(
      state.diagnostico?.entrada?.amostraPorModulo || diagnosticSize,
    );
    setStarted(false);
    setIndex(0);
    setAnswers({});
    setConfidence({});
    setRevealed(false);
    setDone(false);
  }

  function next() {
    if (index === questions.length - 1) {
      setDone(true);
      setState((s) => {
        const resultados = {};
        questions.forEach((x, i) => {
          if (answers[i] !== undefined) resultados[x.id] = answers[i] === x.answer;
        });
        const base = {
          ...s,
          revisao: registrarRodada(s.revisao, resultados),
          quizScores: {
            ...s.quizScores,
            [track]: {
              score,
              total: questions.length,
              date: new Date().toISOString(),
              errosAltaConfianca: questions.filter(
                (question, i) =>
                  answers[i] !== question.answer && confidence[i] === "alta",
              ).length,
            },
          },
        };
        if (track !== "geral") return base;
        const porQuestao = {};
        questions.forEach((x, i) => {
          porQuestao[x.id] = {
            track: x.track,
            ok: answers[i] === x.answer,
            confianca: confidence[i],
          };
        });
        const registro = {
          data: new Date().toISOString(),
          acertos: score,
          total: questions.length,
          forma: diagnosticForm,
          modo: diagnosticSize === DIAG_COMPLETO_POR_MODULO ? "completo" : "rapido",
          amostraPorModulo: diagnosticSize,
          leitura: Math.round((s.completed.length / lessons.length) * 100),
          porQuestao,
        };
        const d = s.diagnostico || {};
        return {
          ...base,
          diagnostico: d.entrada
            ? { ...d, saida: registro }
            : { ...d, entrada: registro },
        };
      });
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Autoavaliações e revisão"
        subtitle="Questões comentadas transformam erro em revisão direcionada, sem confundir resultado de quiz com competência profissional."
        icon={ClipboardCheck}
      />
      {!started ? (
        <div className="assessment-select">
          <RevisaoPendente
            state={state}
            openLesson={openLesson}
            questionBank={questionBank}
          />
          {state.diagnostico?.entrada ? (
            <ComparaDiagnostico d={state.diagnostico} />
          ) : null}
          <section className="diagnostic">
            <div>
              <Award />
              <span>
                <small>AVALIAÇÃO INTEGRADORA</small>
                <h2>Amostra diagnóstica do POP</h2>
                <p>
                  Escolha uma leitura rápida ou completa, dos fundamentos à
                  conclusão técnica. A reaplicação conserva a mesma amostra em
                  outra ordem e descreve os resultados sem atribuir a variação
                  ao curso.
                </p>
              </span>
            </div>
            <fieldset className="diagnostic-depth">
              <legend>Profundidade desta aplicação</legend>
              {[
                [DIAG_RAPIDO_POR_MODULO, "Rápida", "1 item por módulo · orienta por onde começar"],
                [DIAG_COMPLETO_POR_MODULO, "Completa", "3 itens por módulo · compara mais pontos do POP"],
              ].map(([value, label, help]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={diagnosticSize === value}
                  className={diagnosticSize === value ? "selected" : ""}
                  disabled={Boolean(state.diagnostico?.entrada)}
                  onClick={() => setDiagnosticSize(value)}
                >
                  <strong>{label}</strong>
                  <small>{help}</small>
                </button>
              ))}
              {state.diagnostico?.entrada ? (
                <small>
                  A reaplicação mantém a mesma amostra da primeira tentativa
                  para permitir comparação item a item.
                </small>
              ) : null}
            </fieldset>
            <div className="assessment-meta">
              <span>
                <Clock /> {diagnosticQuestionCount} questões · cerca de{" "}
                {Math.max(5, Math.round(diagnosticQuestionCount * 0.75))} min
              </span>
              <span>
                <MessageSquareText /> Feedback imediato
              </span>
              <span>
                <Trophy /> Autoacompanhamento não validado
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                reset("geral");
                setStarted(true);
              }}
            >
              {state.diagnostico?.entrada
                ? "Reaplicar os itens-âncora"
                : "Fazer a primeira aplicação"}{" "}
              <ArrowRight />
            </button>
            {state.quizScores.geral ? (
              <small>
                Último resultado: {state.quizScores.geral.score}/
                {state.quizScores.geral.total}
              </small>
            ) : null}
          </section>
          <h2>Avaliações por módulo</h2>
          <div className="module-tests">
            {tracks
              .filter((t) => questionBank.some((question) => question.track === t.id))
              .map((t) => {
                const qs = questionBank.filter((question) => question.track === t.id);
                const last = state.quizScores[t.id];
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => {
                      reset(t.id);
                      setStarted(true);
                    }}
                  >
                    <span style={{ background: t.color, "--tc": t.color }}>
                      {t.code}
                    </span>
                    <div>
                      <strong>{t.title}</strong>
                      <small>{qs.length} questões · feedback comentado</small>
                    </div>
                    {last ? (
                      <b>
                        {last.score}/{last.total}
                      </b>
                    ) : (
                      <ChevronRight />
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ) : (
        <section className="quiz-stage">
          {done ? (
            <div className="quiz-result">
              <div
                className="score-ring"
                style={{ "--score": `${(score / questions.length) * 100}%` }}
              >
                <span>
                  <strong>{score}</strong>/{questions.length}
                </span>
              </div>
              <h2 ref={stageHeadingRef} tabIndex={-1}>
                {score / questions.length >= 0.8
                  ? "Bom desempenho nesta tentativa"
                  : "Há pontos para revisar"}
              </h2>
              <p>
                Você acertou {Math.round((score / questions.length) * 100)}%.
                Use o feedback abaixo para voltar aos módulos relacionados. Este
                resultado não comprova domínio nem competência profissional.
              </p>
              {(() => {
                const erradas = questions
                  .map((question, questionIndex) => ({
                    q: question,
                    i: questionIndex,
                    confianca: confidence[questionIndex],
                  }))
                  .filter(({ q: question, i }) => answers[i] !== question.answer);
                const errosAltaConfianca = erradas.filter(
                  ({ confianca }) => confianca === "alta",
                ).length;
                return erradas.length ? (
                  <div className="revisao-erros">
                    <h3>
                      <AlertTriangle size={16} /> Volte ao conteúdo destas{" "}
                      {erradas.length === 1
                        ? "questão"
                        : `${erradas.length} questões`}
                    </h3>
                    {errosAltaConfianca ? (
                      <p className="confidence-priority" role="status">
                        <AlertTriangle size={15} /> {errosAltaConfianca}{" "}
                        {errosAltaConfianca === 1
                          ? "erro foi respondido"
                          : "erros foram respondidos"}{" "}
                        com alta confiança. Revise esse bloco primeiro.
                      </p>
                    ) : null}
                    <ul>
                      {erradas.map(({ q: question, i, confianca }) => {
                        const t = tracks.find((item) => item.id === question.track);
                        const exata = question.source?.sec
                          ? lessonMap.get(question.source.sec)
                          : null;
                        const aula = exata || firstLesson(question.track);
                        const rot = exata
                          ? `${exata.number ? `${exata.number} ` : ""}${exata.title}`.slice(
                              0,
                              42,
                            )
                          : t?.code || "módulo";
                        return (
                          <li key={question.id || i}>
                            <span className="re-mod">{t?.code || ""}</span>
                            <span className="re-q">
                              {question.question}
                              <small className={`confidence-tag ${confianca || "sem"}`}>
                                Confiança {confianca || "não registrada"}
                              </small>
                            </span>
                            {aula ? (
                              <button
                                type="button"
                                className="re-ir"
                                onClick={() => openLesson?.(aula.id)}
                              >
                                Rever {rot} <ArrowRight size={14} />
                              </button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="revisao-ok">
                    <CheckCircle2 /> Você acertou todas. Pode seguir para o
                    próximo módulo.
                  </div>
                );
              })()}
              <div className="result-actions">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setStarted(true);
                  }}
                >
                  <RotateCcw /> Refazer
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => setStarted(false)}
                >
                  Escolher outra avaliação
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="quiz-top">
                <button type="button" onClick={() => setStarted(false)}>
                  <ChevronLeft /> Sair
                </button>
                <span>
                  Questão {index + 1} de {questions.length}
                </span>
                <i
                  role="progressbar"
                  aria-label="Progresso da autoavaliação"
                  aria-valuemin="1"
                  aria-valuemax={questions.length}
                  aria-valuenow={index + 1}
                >
                  <em
                    style={{
                      width: `${((index + 1) / questions.length) * 100}%`,
                    }}
                  />
                </i>
              </div>
              <div className="quiz-question">
                <small>
                  {tracks.find((t) => t.id === q.track)?.code} · AUTOAVALIAÇÃO
                  COMENTADA
                </small>
                <h2 ref={stageHeadingRef} tabIndex={-1}>
                  {q.question}
                </h2>
                <div className="quiz-options" aria-label="Alternativas">
                  {q.options.map((option, optionIndex) => (
                    <button
                      type="button"
                      disabled={revealed}
                      aria-pressed={answers[index] === optionIndex}
                      className={
                        (answers[index] === optionIndex ? "selected " : "") +
                        (revealed && optionIndex === q.answer ? "correct " : "") +
                        (revealed &&
                        answers[index] === optionIndex &&
                        optionIndex !== q.answer
                          ? "wrong"
                          : "")
                      }
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [index]: optionIndex,
                        }))
                      }
                      key={option}
                    >
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      {option}
                      {revealed && optionIndex === q.answer ? <Check /> : null}
                    </button>
                  ))}
                </div>
                {!revealed ? (
                  <fieldset className="answer-confidence">
                    <legend>Quanto você confia na resposta escolhida?</legend>
                    <div>
                      {CONFIDENCE_LEVELS.map(([value, label, help]) => (
                        <button
                          type="button"
                          key={value}
                          aria-pressed={confidence[index] === value}
                          className={confidence[index] === value ? "selected" : ""}
                          onClick={() =>
                            setConfidence((current) => ({
                              ...current,
                              [index]: value,
                            }))
                          }
                        >
                          <strong>{label}</strong>
                          <small>{help}</small>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <p className="confidence-recorded">
                    Confiança declarada: <strong>{confidence[index]}</strong>
                  </p>
                )}
                {revealed ? (
                  <div
                    className={
                      answers[index] === q.answer
                        ? "answer-feedback correct"
                        : "answer-feedback"
                    }
                  >
                    <Lightbulb />
                    <div>
                      <strong>
                        {answers[index] === q.answer
                          ? "Resposta correta"
                          : "Ponto de revisão"}
                      </strong>
                      <p>{q.explanation}</p>
                      {q.source
                        ? (() => {
                            const sec = lessonMap.get(q.source.sec);
                            return (
                              <figure className="quiz-fonte">
                                <blockquote>{q.source.quote}</blockquote>
                                <figcaption>
                                  POP
                                  {sec
                                    ? `, ${sec.number ? `${sec.number} ` : ""}${sec.title}`
                                    : ""}
                                  {sec && openLesson ? (
                                    <button
                                      type="button"
                                      onClick={() => openLesson(sec.id)}
                                    >
                                      abrir a aula <ArrowRight size={13} />
                                    </button>
                                  ) : null}
                                </figcaption>
                              </figure>
                            );
                          })()
                        : null}
                    </div>
                  </div>
                ) : null}
                <div className="quiz-actions">
                  {!revealed ? (
                    <button
                      type="button"
                      className="primary"
                      disabled={
                        answers[index] === undefined || !confidence[index]
                      }
                      onClick={() => setRevealed(true)}
                    >
                      Confirmar resposta
                    </button>
                  ) : (
                    <button type="button" className="primary" onClick={next}>
                      {index === questions.length - 1
                        ? "Ver resultado"
                        : "Próxima questão"}
                      <ArrowRight />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
