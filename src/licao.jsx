// A tela de aula: vídeo, guia, fonte do POP, materiais e anotações.
//
// Saiu de main.jsx em 05/08/2026, com 1.441 linhas. Era a maior concentração do
// orquestrador: toda mudança na aula obrigava a abrir o arquivo que também
// carrega roteamento, barra lateral, Início e Avaliações.
//
// A fronteira é o contrato `dados`, mesmo idioma de biblioteca.jsx e perfil.jsx:
// tudo que vem do POP derivado chega por uma propriedade só, em vez de ser lido
// do escopo do módulo. Dos quinze componentes daqui, onze não precisam de nada
// além das próprias propriedades; só `Lesson`, `LessonOverview`,
// `BlockRenderer` e `ErrosRecorrentesDaSecao` recebem dado derivado, e cada um
// recebe exatamente o que usa.
//
// O que NÃO mudou nesta extração: comportamento, marcação e classes de estilo.
// Uma extração que aproveita para redesenhar impede saber, quando algo quebra,
// se foi a mudança de lugar ou a mudança de conteúdo.
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleHelp,
  ClipboardCheck,
  Download,
  FileText,
  FlaskConical,
  GitBranch,
  Home,
  Info,
  Layers3,
  Lightbulb,
  ListChecks,
  Milestone,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Quote,
  RotateCcw,
  ShieldCheck,
  StickyNote,
  Table2,
  Target,
  Trophy,
  X,
} from "lucide-react";
import TranscriptPanel from "./TranscriptPanel.jsx";
import VideoLearningStage from "./VideoLearningStage.jsx";
import SourceAssurance from "./sourceAssurance.jsx";
import { Empty, TableRenderer } from "./ui.jsx";
import { elementoDaAula, precisaDeComplemento } from "./aulasAnexoB.js";
import { comoLerQuadro } from "./comoLerQuadro.js";
import { errosDaAula } from "./errosRecorrentes.js";
import { trackGroups, tracks } from "./courseData";
import { getLearningDesign } from "./learningDesign.js";
import { objetivoObservavel } from "./objetivoObservavel.js";
import {
  MIN_ACTIVE_RECALL_CHARS,
  lessonEvidenceStatus,
  lessonQuestionProvesObjective,
  selectLessonQuestion,
  selectLessonScenario,
} from "./lessonEvidence.js";

// O objetivo da aula, preferindo o que o POP diz ao que o perfil supõe.
//
// `getLearningDesign` escolhe por palavra-chave no título: são 11 perfis para
// 167 seções, então a mesma promessa aparecia em 41 aulas. `objetivoObservavel`
// deriva do conteúdo da própria seção e devolve também COMO se verifica. Quando
// a seção não tem base própria, o perfil continua valendo.
//
// Fica exportado porque o cartão de objetivo do Início mostra o mesmo texto, e
// duas telas que prometem coisas diferentes sobre a mesma aula seria pior do
// que qualquer duplicação de código.
export function objetivoDaAula(lesson, blocks, tableMap) {
  const derivado = objetivoObservavel(lesson, blocks, tableMap);
  if (derivado) return derivado;
  return {
    objetivo: getLearningDesign(lesson, blocks).objective,
    comoSeVe: "",
    origem: "perfil",
    referencia: null,
  };
}

export default function Lesson({
  lesson,
  availableScenarios = [],
  pilotMediaStatus,
  state,
  setState,
  openLesson,
  complete,
  bookmark,
  go,
  dados,
}) {
  const {
    popData,
    blockMap,
    tableMap,
    figureByBlock,
    lessons,
    questionBank,
    siglasDaAula,
    trackLessons,
    mediaForLesson,
    trackProgress,
    errosDoPop,
  } = dados;
  const [tab, setTab] = useState("aula"),
    [outlineOpen, setOutlineOpen] = useState(true);
  const [completionNotice, setCompletionNotice] = useState(false);
  const track = tracks.find((t) => t.id === lesson.trackId) || tracks[0];
  // Antes toda subaula de um modulo mostrava o mesmo video. Agora cada secao tem
  // o seu, montado a partir do texto dela; o video do modulo fica de reserva
  // para as poucas secoes sem conteudo proprio.
  const media = pilotMediaStatus.loading
    ? null
    : mediaForLesson(lesson, pilotMediaStatus.collection);
  const ls = trackLessons.get(track.id) || [];
  const index = ls.findIndex((l) => l.id === lesson.id);
  const ORDEM = trackGroups.flatMap((g) => g.ids);
  const proxTrack = ORDEM[ORDEM.indexOf(track.id) + 1];
  const next =
    ls[index + 1] ||
    (proxTrack ? (trackLessons.get(proxTrack) || [])[0] : null) ||
    lessons[lesson.order + 1];
  const blocks = (lesson.blockIds || [])
    .map((id) => blockMap.get(id))
    .filter((b) => b && !b.navigationOnly);
  const tables = blocks
    .filter((b) => b.type === "table")
    .map((b) => tableMap.get(b.tableId))
    .filter(Boolean);
  const figures = popData.figures.filter(
    (f) => f.blockId && lesson.blockIds?.includes(f.blockId),
  );
  const note = state.notes[lesson.id] || "";
  const design = getLearningDesign(lesson, blocks);
  const alvo = objetivoDaAula(lesson, blocks, tableMap);
  const evidence = state.lessonEvidence?.[lesson.id] || {};
  const questionSelection = selectLessonQuestion(questionBank, lesson, index);
  const question = questionSelection?.question || null;
  const hasObjectiveCheck = lessonQuestionProvesObjective(questionSelection);
  const scenarioSelection = selectLessonScenario(
    availableScenarios,
    track.id,
    index,
    lesson.id,
  );
  const objectiveCorrect =
    hasObjectiveCheck &&
    evidence.objectiveQuestionId === question.id &&
    evidence.objectiveCorrect === true;
  const evidenceStatus = lessonEvidenceStatus(
    { ...evidence, objectiveCorrect },
    {
      criterionCount: design.mastery.length,
      hasObjectiveCheck,
    },
  );
  useEffect(() => {
    scrollTo({ top: 0 });
    setCompletionNotice(false);
  }, [lesson.id]);
  useEffect(() => {
    const list = document.querySelector(".lesson-tabs");
    if (!list) return;
    const buttons = [...list.querySelectorAll('[role="tab"]')];
    const keyboard = (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const current = buttons.indexOf(document.activeElement);
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? buttons.length - 1
            : (current +
                (event.key === "ArrowRight" ? 1 : -1) +
                buttons.length) %
              buttons.length;
      buttons[next].click();
      buttons[next].focus();
    };
    list.addEventListener("keydown", keyboard);
    return () => list.removeEventListener("keydown", keyboard);
  }, [tab, lesson.id]);
  function setNote(v) {
    setState((s) => ({ ...s, notes: { ...s.notes, [lesson.id]: v } }));
  }
  function updateLessonEvidence(change) {
    setState((s) => {
      const current = s.lessonEvidence?.[lesson.id] || {};
      const next = typeof change === "function" ? change(current) : change;
      return {
        ...s,
        lessonEvidence: {
          ...(s.lessonEvidence || {}),
          [lesson.id]: next,
        },
      };
    });
  }
  function answerLessonQuestion(optionIndex) {
    if (!question) return;
    updateLessonEvidence((current) => ({
      ...current,
      objectiveQuestionId: question.id,
      objectiveSelected: optionIndex,
      objectiveCorrect: optionIndex === question.answer,
      objectiveAttempts: (Number(current.objectiveAttempts) || 0) + 1,
    }));
  }
  function retryLessonQuestion() {
    updateLessonEvidence((current) => ({
      ...current,
      objectiveQuestionId: question?.id || "",
      objectiveSelected: null,
      objectiveCorrect: false,
    }));
  }
  function toggleEvidenceCriterion(criterionIndex) {
    updateLessonEvidence((current) => {
      const criteria = Array.isArray(current.criteria)
        ? current.criteria.filter(Number.isInteger)
        : [];
      return {
        ...current,
        criteria: criteria.includes(criterionIndex)
          ? criteria.filter((item) => item !== criterionIndex)
          : [...criteria, criterionIndex],
      };
    });
  }
  function requestCompletion() {
    if (
      !state.completed.includes(lesson.id) &&
      !evidenceStatus.ready
    ) {
      setCompletionNotice(true);
      setTab("aula");
      setTimeout(() => {
        const target = document.getElementById(`pratica-ativa-${lesson.id}`);
        target?.scrollIntoView({
          behavior:
            typeof matchMedia !== "undefined" &&
            matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          block: "center",
        });
        target?.focus?.({ preventScroll: true });
      }, 0);
      return;
    }
    setCompletionNotice(false);
    complete(lesson.id);
  }
  return (
    <div
      className={"lesson-layout " + (!outlineOpen ? "outline-collapsed" : "")}
    >
      <aside className="lesson-outline">
        <button
          className="outline-toggle"
          aria-label={
            outlineOpen ? "Recolher sumário da aula" : "Abrir sumário da aula"
          }
          title={outlineOpen ? "Recolher sumário" : "Abrir sumário"}
          onClick={() => setOutlineOpen((v) => !v)}
        >
          {outlineOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </button>
        {outlineOpen && (
          <>
            <button className="back-course" onClick={() => go("formacao")}>
              <ChevronLeft /> Voltar à formação
            </button>
            <div className="outline-track">
              <span style={{ background: track.color, "--tc": track.color }}>
                {track.code}
              </span>
              <div>
                <strong>{track.title}</strong>
                <small>{trackProgress(track.id, state)}% concluído</small>
              </div>
            </div>
            <div className="outline-lessons">
              {ls.map((l, i) => (
                <button
                  className={l.id === lesson.id ? "active" : ""}
                  aria-current={l.id === lesson.id ? "page" : undefined}
                  key={l.id}
                  onClick={() => openLesson(l.id)}
                >
                  <span
                    className={state.completed.includes(l.id) ? "done" : ""}
                  >
                    {state.completed.includes(l.id) ? <Check /> : i + 1}
                  </span>
                  <span>
                    {l.number && <small>{l.number}</small>}
                    <strong>{l.title}</strong>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
      <div className="lesson-content">
        <div className="breadcrumbs">
          <button onClick={() => go("formacao")}>Formação</button>
          <ChevronRight />
          <span>{track.code}</span>
          <ChevronRight />
          <span>{lesson.number || "Introdução"}</span>
        </div>
        <header className="lesson-header">
          <div>
            <h1>
              {lesson.number && <span>{lesson.number}</span>} {lesson.title}
            </h1>
            <p>
              <Target /> {alvo.objetivo}
            </p>
            {alvo.comoSeVe && (
              <p className="objetivo-como-se-ve">
                <strong>Como você sabe que consegue.</strong> {alvo.comoSeVe}
              </p>
            )}
          </div>
          <button
            className="bookmark-btn"
            aria-label={
              state.bookmarks.includes(lesson.id)
                ? "Remover aula dos favoritos"
                : "Salvar aula nos favoritos"
            }
            aria-pressed={state.bookmarks.includes(lesson.id)}
            onClick={() => bookmark(lesson.id)}
          >
            {state.bookmarks.includes(lesson.id) ? (
              <BookmarkCheck />
            ) : (
              <Bookmark />
            )}
          </button>
        </header>
        {pilotMediaStatus.loading ? (
          <VideoDataLoading />
        ) : (
          <VideoLesson
            key={media?.src || lesson.id}
            media={media}
            track={track}
            lesson={lesson}
          />
        )}
        {/* Proveniencia e percurso de raciocinio ficam RECOLHIDOS na aula.
            Os dois blocos sao compromissos reais da plataforma: um declara de
            onde o conteudo vem, o outro declara o que se espera da pessoa. Mas
            eram identicos nas 159 aulas e ocupavam a tela inteira antes do
            conteudo, empurrando a aula para baixo da dobra em toda visita.
            Informacao que nao muda de aula para aula nao precisa ser parede:
            precisa estar a um clique, e verificavel quando alguem quiser. */}
        <details className="aula-meta">
          <summary>
            <ShieldCheck size={14} aria-hidden="true" />
            Fonte deste conteúdo e percurso de raciocínio
          </summary>
          <div className="aula-meta-corpo">
            <SourceAssurance compact popData={popData} lessonCount={lessons.length} />
            <LearningContract design={design} />
          </div>
        </details>
        <div
          className="lesson-tabs"
          role="tablist"
          aria-label="Recursos da aula"
        >
          {[
            ["aula", "Aula guiada", BookOpen],
            ["fonte", "Fonte do POP", FileText],
            ["materiais", "Quadros e figuras", Layers3],
            ["notas", "Anotações", StickyNote],
          ].map(([id, label, Icon]) => (
            <button
              role="tab"
              id={`aba-aula-${lesson.id}-${id}`}
              aria-controls={`painel-aula-${lesson.id}`}
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
              key={id}
            >
              <Icon />
              {label}
              {id === "materiais" && (
                <span>{tables.length + figures.length}</span>
              )}
            </button>
          ))}
        </div>
        <div
          className="tab-panel"
          id={`painel-aula-${lesson.id}`}
          role="tabpanel"
          aria-labelledby={`aba-aula-${lesson.id}-${tab}`}
          key={tab}
        >
          {tab === "aula" && (
            <LessonOverview
              lesson={lesson}
              design={design}
              blocks={blocks}
              lessons={lessons}
              tableMap={tableMap}
              errosDoPop={errosDoPop}
              setTab={setTab}
              openLesson={openLesson}
              caso={scenarioSelection?.scenario || null}
              casoPergunta={scenarioSelection?.questionIndex || 0}
              casoEscopo={scenarioSelection?.scope || "module"}
              go={go}
              evidence={evidence}
              evidenceStatus={evidenceStatus}
              updateEvidence={updateLessonEvidence}
              toggleEvidenceCriterion={toggleEvidenceCriterion}
              questionSelection={questionSelection}
              answerLessonQuestion={answerLessonQuestion}
              retryLessonQuestion={retryLessonQuestion}
              checked={state.checks?.[lesson.id] || []}
              toggleCheck={(i) =>
                setState((s) => {
                  const cur = s.checks?.[lesson.id] || [];
                  const nx = cur.includes(i)
                    ? cur.filter((x) => x !== i)
                    : [...cur, i];
                  return {
                    ...s,
                    checks: { ...(s.checks || {}), [lesson.id]: nx },
                  };
                })
              }
            />
          )}{" "}
          {tab === "fonte" && (
            <SourceContent
              blocks={blocks}
              tableMap={tableMap}
              figureByBlock={figureByBlock}
            />
          )}{" "}
          {tab === "materiais" && (
            <LessonMaterials tables={tables} figures={figures} />
          )}{" "}
          {tab === "notas" && <Notes value={note} setValue={setNote} />}
        </div>
        {index === ls.length - 1 && (
          <section className="modulo-fim">
            <div className="mf-head">
              <Trophy size={18} />
              <div>
                <small>FIM DO MÓDULO {track.code}</small>
                <h3>{track.title}</h3>
              </div>
              <b>{trackProgress(track.id, state)}%</b>
            </div>
            <p className="mf-resumo">{track.summary}</p>
            <div className="mf-acoes">
              {questionBank.some((q) => q.track === track.id) && (
                <button className="primary" onClick={() => go("avaliacoes")}>
                  <ClipboardCheck size={16} /> Testar o que aprendi em{" "}
                  {track.code}
                </button>
              )}
              {availableScenarios.some((c) => c.track === track.id) && (
                <button
                  className="text-action"
                  onClick={() => go("laboratorio")}
                >
                  <FlaskConical size={15} /> Praticar num caso
                </button>
              )}
              {trackProgress(track.id, state) < 100 && (
                <span className="mf-falta">
                  Faltam{" "}
                  {ls.filter((l) => !state.completed.includes(l.id)).length}{" "}
                  aulas para fechar o módulo.
                </span>
              )}
            </div>
          </section>
        )}
        <footer className="lesson-footer">
          {completionNotice && !evidenceStatus.ready && (
            <p
              className="lesson-completion-notice"
              id={`conclusao-aviso-${lesson.id}`}
              role="alert"
            >
              {hasObjectiveCheck
                ? "Registre a recuperação ativa, confira ao menos dois critérios e acerte a checagem da própria seção antes de concluir este tópico."
                : "Registre a recuperação ativa e confira ao menos dois critérios antes de concluir este tópico. A revisão contextual do módulo é opcional e não interfere nesta conclusão."}
            </p>
          )}
          {state.completed.includes(lesson.id) && !evidenceStatus.ready && (
            <p className="lesson-legacy-completion">
              Conclusão registrada anteriormente. A prática ativa abaixo é
              recomendada para criar evidência de aprendizagem.
            </p>
          )}
          <button
            className={
              state.completed.includes(lesson.id)
                ? "completed"
                : evidenceStatus.ready
                  ? "ready"
                  : "needs-evidence"
            }
            aria-describedby={
              completionNotice ? `conclusao-aviso-${lesson.id}` : undefined
            }
            onClick={requestCompletion}
          >
            {state.completed.includes(lesson.id) ? (
              <CheckCircle2 />
            ) : (
              <Circle />
            )}
            {state.completed.includes(lesson.id)
              ? "Aula concluída"
              : evidenceStatus.ready
                ? "Concluir aula"
                : "Fazer prática para concluir"}
          </button>
          {next && (
            <button className="next-lesson" onClick={() => openLesson(next.id)}>
              <span>
                <small>PRÓXIMO TÓPICO</small>
                <strong>
                  {next.number ? `${next.number} ` : ""}
                  {next.title}
                </strong>
              </span>
              <ArrowRight />
            </button>
          )}
        </footer>
      </div>
      <aside className="lesson-context">
        <div className="context-sticky">
          <h3>Nesta aula</h3>
          <div className="context-progress">
            <span>Progresso do módulo</span>
            <b>{trackProgress(track.id, state)}%</b>
            <i>
              <em style={{ width: `${trackProgress(track.id, state)}%` }} />
            </i>
          </div>
          <nav>
            <button
              className={tab === "aula" ? "active" : ""}
              onClick={() => setTab("aula")}
            >
              <Target />
              Aula guiada{tab === "aula" ? <CheckCircle2 /> : <Circle />}
            </button>
            <button
              className={tab === "fonte" ? "active" : ""}
              onClick={() => setTab("fonte")}
            >
              <FileText />
              Fonte da seção{tab === "fonte" ? <CheckCircle2 /> : <Circle />}
            </button>
            <button
              className={tab === "materiais" ? "active" : ""}
              onClick={() => setTab("materiais")}
            >
              <Layers3 />
              {tables.length} tabelas · {figures.length} figuras
              {tab === "materiais" ? <CheckCircle2 /> : <Circle />}
            </button>
            <button
              className={tab === "notas" ? "active" : ""}
              onClick={() => setTab("notas")}
            >
              <StickyNote />
              Caderno pessoal{tab === "notas" ? <CheckCircle2 /> : <Circle />}
            </button>
          </nav>
          <div className="quick-tip">
            <Lightbulb />
            <div>
              <strong>Regra de ouro</strong>
              <p>
                Identifique documento, fundamento, suficiência, consequência e
                encaminhamento. Não comece pela conclusão.
              </p>
            </div>
          </div>
          {(() => {
            const sg = siglasDaAula(
              blocks
                .map((b) => (b && b.paragraph && b.paragraph.text) || "")
                .join(" "),
            );
            return sg.length ? (
              <div className="siglas-aula">
                <strong>
                  <BookMarked size={15} /> Siglas desta aula
                </strong>
                <dl>
                  {sg.map((x) => (
                    <React.Fragment key={x.sig}>
                      <dt>{x.sig}</dt>
                      <dd>
                        {x.nome}
                        {x.desc ? <em>{x.desc}</em> : null}
                      </dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            ) : null;
          })()}
        </div>
      </aside>
    </div>
  );
}
function LearningContract({ design }) {
  return (
    <section
      className="learning-contract"
      aria-labelledby="learning-contract-title"
    >
      <header>
        <div>
          <small>PERCURSO DE RACIOCÍNIO</small>
          <h2 id="learning-contract-title">Da compreensão à auditoria</h2>
        </div>
        <span>{design.levels.length} etapas de raciocínio</span>
      </header>
      <div className="learning-levels">
        {design.levels.map((level, index) => (
            <article key={level.id}>
              <span>{index + 1}</span>
              <div>
                <small>{level.label}</small>
                <p>{level.description}</p>
              </div>
            </article>
          ))}
      </div>
      <div className="learning-challenge">
        <Lightbulb />
        <div>
          <strong>Desafio de transferência</strong>
          <p>{design.challenge}</p>
        </div>
        <span>Registre sua resposta na prática ativa desta aula.</span>
      </div>
      <details>
        <summary>Critérios para autoauditar o registro</summary>
        <ul>
          {design.mastery.map((item) => (
            <li key={item}>
              <CheckCircle2 />
              {item}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
// Exportado porque o cartão de continuidade do Início mostra o mesmo estado de
// espera. Duas telas que esperam a mesma coisa com aparências diferentes fazem
// a pessoa achar que são coisas diferentes.
export function VideoDataLoading() {
  return (
    <div className="route-loading video-data-loading" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <div>
        <strong>Preparando o resumo em vídeo</strong>
        <small>Conferindo a mídia vinculada a esta aula…</small>
      </div>
    </div>
  );
}
function VideoLesson({ media, track, lesson }) {
  const ref = useRef(null);
  const [rate, setRate] = useState(1);
  const setSpeed = (r) => {
    setRate(r);
    if (ref.current) ref.current.playbackRate = r;
  };
  return (
    <figure className="video-lesson vl2">
      <VideoLearningStage
        media={media}
        track={track}
        lesson={lesson}
        videoRef={ref}
      />
      <figcaption>
        <span>
          <Play />
          {media.title}
        </span>
        <span className="vl-tools">
          {/* Tres padroes de producao convivem, e ate 04/08/2026 a diferenca
              nao estava dita em lugar nenhum: quem abria a aula 18 e depois a
              57 via duas plataformas sem saber por que. O runtime ja marcava
              `classification`, so nao chegava a tela.

              Declarar e mais honesto que uniformizar por baixo: as seis
              microaulas-piloto tem roteiro editorial e atlas tematico, e
              apagar isso para "ficar tudo igual" seria esconder o padrao mais
              alto em vez de perseguir ele. */}
          <small>
            {media.classification === "microaula-piloto"
              ? "Microaula piloto, roteiro editorial"
              : media.propria
                ? "Resumo em vídeo desta seção"
                : "Resumo em vídeo do módulo"}{" "}
            ·{" "}
            {track.code}
          </small>
          {[1, 1.25, 1.5].map((r) => (
            <button
              key={r}
              className={rate === r ? "active" : ""}
              onClick={() => setSpeed(r)}
              title={"Velocidade " + r + "x"}
            >
              {r}x
            </button>
          ))}
        </span>
      </figcaption>
      <TranscriptPanel
        captions={media.captions}
        transcript={media.transcript}
        videoRef={ref}
        title={media.title}
      />
    </figure>
  );
}
// Como o criterio da aula aparece num processo.
//
// A aula apresenta o criterio do POP. Ela nao mostrava ninguem aplicando o
// criterio a um caso, e quem nunca analisou um processo le a regra e nao sabe
// o que fazer com ela. Este bloco abre o modulo com a situacao concreta que
// ele resolve.
//
// De proposito NAO mostra o desfecho: se mostrasse, o laboratorio viraria
// leitura. A aula enquadra o problema; a pratica resolve.
// A maioria dos quadros do POP nao e lista de referencia: e instrumento de
// decisao. A medicao dos 64 achou o mesmo esqueleto repetido, 17 com Status,
// 16 com Gravidade, 14 com "O que verificar" e 13 com "Encaminhamento padrao".
// O metodo do POP inteiro esta dentro das tabelas, e a tabela era renderizada
// crua: uma grade de celulas sem dizer para que serve.
//
// A leitura sai das colunas que o quadro REALMENTE tem, em tempo de execucao,
// entao nunca diverge do POP. Quadro sem esse esqueleto nao recebe nada.
function ComoLerEsteQuadro({ table }) {
  const guia = useMemo(() => comoLerQuadro(table), [table]);
  if (!guia) return null;
  return (
    <aside className="ler-quadro" aria-label="Como ler este quadro">
      <strong>
        <ListChecks size={15} aria-hidden="true" /> Como ler este quadro
      </strong>
      <p>
        Não é uma lista de referência: é um instrumento de decisão, com{" "}
        {guia.linhas} {guia.linhas === 1 ? "linha" : "linhas"}. Percorra as
        colunas na ordem.
      </p>
      <ol>
        {guia.colunas.map((c) => (
          <li key={c.nome} className={c.papel ? "" : "sem-papel"}>
            <b>{c.nome}</b>
            {c.papel ? <span>{c.papel}</span> : null}
          </li>
        ))}
      </ol>
      {guia.separaStatusDeGravidade && (
        <small>
          Status e gravidade são colunas diferentes de propósito. Um documento
          pode estar apresentado e ainda assim ser insuficiente, e a gravidade
          mede o efeito da lacuna sobre a decisão, não a falta formal do
          arquivo.
        </small>
      )}
    </aside>
  );
}

// As dez aulas do Anexo B sao rotulos de um modelo: no POP, "Conclusao" tem 74
// caracteres. Quem abria essas aulas via um titulo e quase nada, em dez das
// dezessete aulas do modulo de suficiencia, pendencias e conclusao, que e o
// mais importante do curso.
//
// O conteudo didatico delas ja existia dentro do Redator de IT: o que o POP
// exige em cada secao e o erro que mais aparece. Aqui as duas coisas se ligam.
// Nada inventado, e a pessoa sai da leitura para a pratica de escrever aquela
// secao no caso real.
// O erro frequente e o elemento que mais falta numa aula e o que mais rende:
// saber o engano que costuma acontecer vale mais que outro exemplo certo.
// Estes 35 nao foram escritos aqui, foram escritos pelo POP, e estavam presos
// dentro de dois quadros que so aparecem para quem abre aquela tabela.
//
// O vinculo e por mencao explicita do termo no texto da propria secao. Nao ha
// inferencia de assunto: se a aula nao cita o termo, nao recebe o erro dele.
function ErrosRecorrentesDaSecao({ lesson, blocks = [], errosDoPop = [] }) {
  const achados = useMemo(() => {
    const texto = [
      lesson?.title || "",
      ...blocks.map((b) => b?.paragraph?.text || ""),
    ].join(" ");
    return errosDaAula(errosDoPop, texto);
  }, [lesson, blocks]);
  if (!achados.length) return null;
  return (
    <section className="erros-secao">
      <strong>
        <AlertTriangle size={15} aria-hidden="true" /> Erros recorrentes nesta
        matéria
      </strong>
      <dl>
        {achados.map((e) => (
          <React.Fragment key={e.termo + e.quadro}>
            <dt>
              {e.termo}
              <small>{e.quadro}</small>
            </dt>
            <dd>
              {e.erro}
              {e.limite && (
                <span className="erro-limite">
                  <b>Limite do documento.</b> {e.limite}
                </span>
              )}
            </dd>
          </React.Fragment>
        ))}
      </dl>
      <small className="erros-fonte">
        Redação do próprio POP, na coluna de erro a evitar. Aparece aqui porque
        esta seção cita o termo.
      </small>
    </section>
  );
}

function ComoEscreverEstaSecao({ lesson, blocks = [], go }) {
  const texto = blocks
    .map((b) => b?.paragraph?.text || "")
    .join(" ");
  if (!precisaDeComplemento(texto, lesson)) return null;
  const elemento = elementoDaAula(lesson);
  if (!elemento) return null;
  return (
    <section className="anexo-b-guia">
      <header>
        <FileText size={16} aria-hidden="true" />
        <div>
          <small>ESTA SEÇÃO NA INFORMAÇÃO TÉCNICA</small>
          <h3>
            Elemento {elemento.n} do item 23.1: {elemento.titulo}
          </h3>
        </div>
      </header>
      <div className="abg-exige">
        <strong>O que o POP exige aqui</strong>
        <p>{elemento.exige}</p>
      </div>
      <div className="abg-armadilha">
        <AlertTriangle size={15} aria-hidden="true" />
        <div>
          <strong>Erro recorrente</strong>
          <p>{elemento.armadilha}</p>
        </div>
      </div>
      <button type="button" onClick={() => go && go("redator")}>
        <FileText size={15} aria-hidden="true" /> Escrever esta seção no Redator
        <ArrowRight size={14} aria-hidden="true" />
      </button>
      <small>
        O texto do POP nesta seção é curto porque ela é um rótulo do modelo do
        Anexo B. A orientação acima vem do item 23.1, que descreve o conteúdo
        exigido em cada elemento.
      </small>
    </section>
  );
}

function ExemploNoProcesso({
  caso,
  questionIndex = 0,
  scope = "module",
  go,
}) {
  if (!caso) return null;
  const question = (caso.questions || [])[questionIndex]?.[0];
  return (
    <section className="exemplo-processo">
      <header>
        <Milestone size={16} />
        <div>
          <small>
            {scope === "section"
              ? "CASO COM FUNDAMENTO DIRETO NESTA AULA"
              : "EXEMPLO RELACIONADO DO MÓDULO"}
          </small>
          <h3>{caso.title}</h3>
        </div>
      </header>
      <ul className="ep-fatos">
        {(caso.facts || []).slice(0, 3).map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p className="ep-pergunta">
        <CircleHelp size={15} /> {question}
      </p>
      <button onClick={() => go && go("laboratorio", caso.id)}>
        <FlaskConical size={15} /> Decidir este caso no laboratório{" "}
        <ArrowRight size={14} />
      </button>
      <small className="ep-nota">
        O desfecho fica no laboratório, de propósito: ler a resposta não treina
        a decisão.
      </small>
    </section>
  );
}

function LessonKnowledgeCheck({ selection, evidence, answer, retry }) {
  if (!selection?.question) return null;
  const question = selection.question;
  const sameQuestion = evidence.objectiveQuestionId === question.id;
  const selected = sameQuestion ? evidence.objectiveSelected : null;
  const answered = Number.isInteger(selected);
  const correct = answered && selected === question.answer;
  const provesObjective = lessonQuestionProvesObjective(selection);
  return (
    <section
      className="lesson-knowledge-check"
      aria-labelledby={`checagem-${question.id}`}
    >
      <header>
        <div>
          <small>
            {selection.scope === "section"
              ? "CHECAGEM DA PRÓPRIA SEÇÃO"
              : "REVISÃO CONTEXTUAL DO MÓDULO"}
          </small>
          <h3 id={`checagem-${question.id}`}>Checagem de compreensão</h3>
        </div>
        <span className={provesObjective && correct ? "done" : ""}>
          {provesObjective && correct ? <CheckCircle2 /> : <Circle />}
          {provesObjective
            ? correct
              ? "Objetivo demonstrado"
              : "Pendente"
            : "Opcional"}
        </span>
      </header>
      {selection.scope === "module" && (
        <p className="lesson-check-scope">
          Revisão opcional: esta seção ainda não possui questão exclusiva. A
          pergunta retoma um conceito relacionado do mesmo módulo, mas não
          comprova o objetivo e não interfere na conclusão desta aula.
        </p>
      )}
      <fieldset>
        <legend>{question.question}</legend>
        <div className="lesson-check-options">
          {question.options.map((option, index) => (
            <button
              type="button"
              key={option}
              disabled={answered}
              aria-pressed={selected === index}
              aria-label={
                answered
                  ? `${String.fromCharCode(65 + index)}. ${option}. ${
                      index === question.answer
                        ? "Resposta correta."
                        : index === selected
                          ? "Sua resposta, incorreta."
                          : "Alternativa não selecionada."
                    }`
                  : undefined
              }
              className={
                answered
                  ? index === question.answer
                    ? "correct"
                    : index === selected
                      ? "wrong"
                      : ""
                  : selected === index
                    ? "selected"
                    : ""
              }
              onClick={() => answer(index)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {option}
              {answered && index === question.answer && (
                <Check aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </fieldset>
      {answered && (
        <div
          className={`lesson-check-feedback ${correct ? "correct" : "wrong"}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {correct ? <CheckCircle2 /> : <AlertTriangle />}
          <div>
            <strong>{correct ? "Resposta alinhada" : "Resposta a revisar"}</strong>
            <p>{question.explanation}</p>
            {question.source?.quote && (
              <blockquote>
                “{question.source.quote}”
                <cite>POP · trecho vinculado à pergunta</cite>
              </blockquote>
            )}
            {!correct && (
              <button type="button" onClick={retry}>
                <RotateCcw /> Tentar novamente
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function LessonActivePractice({
  lesson,
  design,
  evidence,
  status,
  updateEvidence,
  toggleCriterion,
  hasObjectiveCheck,
}) {
  return (
    <section
      className={`lesson-active-practice ${status.ready ? "complete" : ""}`}
      id={`pratica-ativa-${lesson.id}`}
      tabIndex="-1"
      aria-labelledby={`pratica-ativa-titulo-${lesson.id}`}
    >
      <header>
        <div>
          <small>RECUPERAÇÃO ATIVA · REGISTRO LOCAL</small>
          <h3 id={`pratica-ativa-titulo-${lesson.id}`}>
            Demonstre o percurso, não apenas a leitura
          </h3>
        </div>
        <span className={status.ready ? "done" : ""}>
          {status.ready ? <CheckCircle2 /> : <Circle />}
          {status.ready ? "Registro mínimo completo" : "Em construção"}
        </span>
      </header>
      <div className="lesson-active-prompt">
        <Lightbulb aria-hidden="true" />
        <div>
          <strong>Desafio desta seção</strong>
          <p>{design.challenge}</p>
        </div>
      </div>
      <label className="lesson-active-response">
        <span>Sua análise em fato → evidência → fundamento → encaminhamento</span>
        <textarea
          value={evidence.response || ""}
          maxLength={2400}
          rows={6}
          onChange={(event) =>
            updateEvidence((current) => ({
              ...current,
              response: event.target.value,
            }))
          }
          placeholder="Escreva com suas palavras. Evite apenas copiar o POP: identifique o fato, a evidência necessária, o critério aplicável, a incerteza e o próximo passo."
        />
      </label>
      <div className="lesson-active-counter">
        <span className={status.responseRecorded ? "done" : ""}>
          {status.responseRecorded ? <Check /> : <Circle />}
          {status.responseLength}/{MIN_ACTIVE_RECALL_CHARS} caracteres
          significativos
        </span>
        <small>
          O limite mede somente existência de registro; não avalia qualidade.
        </small>
      </div>
      <fieldset className="lesson-active-rubric">
        <legend>Autoauditoria antes de concluir</legend>
        {design.mastery.map((criterion, index) => {
          const checked = status.criteria.includes(index);
          return (
            <label key={criterion} className={checked ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCriterion(index)}
              />
              <span className="lesson-active-criterion">{criterion}</span>
            </label>
          );
        })}
      </fieldset>
      <footer>
        <span className={status.selfAuditRecorded ? "done" : ""}>
          {status.selfAuditRecorded ? <CheckCircle2 /> : <Circle />}
          Ao menos 2 critérios conferidos
        </span>
        {hasObjectiveCheck && (
          <span className={status.objectiveMet ? "done" : ""}>
            {status.objectiveMet ? <CheckCircle2 /> : <Circle />}
            Checagem objetiva correta
          </span>
        )}
      </footer>
      <p className="lesson-active-limit">
        Este é um registro pessoal de autoestudo salvo neste navegador. A
        fundamentação escrita não foi corrigida nem aprovada por pessoa
        responsável; solicite conferência técnica quando houver efeito institucional.
      </p>
    </section>
  );
}

function LessonOverview({
  lesson,
  design,
  blocks,
  lessons = [],
  tableMap,
  errosDoPop = [],
  checked = [],
  toggleCheck,
  setTab,
  openLesson,
  caso,
  casoPergunta = 0,
  casoEscopo = "module",
  go,
  evidence,
  evidenceStatus,
  updateEvidence,
  toggleEvidenceCriterion,
  questionSelection,
  answerLessonQuestion,
  retryLessonQuestion,
}) {
  const allParas = blocks.filter(
    (b) =>
      b.type === "paragraph" && b.paragraph?.text && b.paragraph.text.trim(),
  );
  const steps = allParas.filter((b) => /^\d+\./.test(b.paragraph.text));
  const shown = steps.slice(0, 10);
  const doneN = shown.filter((_, i) => checked.includes(i)).length;
  const idxPasso = allParas.findIndex((b) => /^\d+\./.test(b.paragraph.text));
  const naoPasso = (b) =>
    !/^\d+\./.test(b.paragraph.text) && !b.paragraph.headingLevel;
  const prosa = (idxPasso < 0 ? allParas : allParas.slice(0, idxPasso)).filter(
    naoPasso,
  );
  const notas = idxPasso < 0 ? [] : allParas.slice(idxPasso).filter(naoPasso);
  const nTab = blocks.filter((b) => b.type === "table").length;
  const kids = lesson.number
    ? lessons.filter(
        (l) =>
          l.number &&
          l.number !== lesson.number &&
          l.number.startsWith(lesson.number + ".") &&
          l.number
            .slice(lesson.number.length + 1)
            .replace(/\.$/, "")
            .split(".").length === 1,
      )
    : [];
  const parent =
    lesson.number && lesson.number.includes(".")
      ? lesson.number.slice(0, lesson.number.lastIndexOf("."))
      : "";
  const irmaos = parent
    ? lessons.filter(
        (l) =>
          l.id !== lesson.id &&
          l.number &&
          l.number.startsWith(parent + ".") &&
          l.number
            .slice(parent.length + 1)
            .replace(/\.$/, "")
            .split(".").length === 1,
      )
    : [];
  const vazia = allParas.length === 0 && nTab === 0;
  return (
    <article className="lesson-article">
      <h2>
        {lesson.number ? lesson.number + " · " : ""}
        {lesson.title}
      </h2>
      <p className="lead">
        {vazia
          ? "Esta seção organiza o percurso; use os tópicos relacionados para demonstrar o objetivo."
          : kids.length
            ? "Esta seção reúne os tópicos abaixo. Estude cada um e volte ao desafio de transferência."
            : design.objective}
      </p>
      <blockquote className="learning-source-basis">
        <small>EVIDÊNCIA-BASE DA SEÇÃO</small>
        <p>{design.sourceBasis}</p>
        <button type="button" onClick={() => setTab && setTab("fonte")}>
          Conferir na fonte <ArrowRight />
        </button>
      </blockquote>
      {kids.length > 0 && (
        <nav className="lesson-children">
          <strong>
            <Layers3 size={15} /> Tópicos desta seção
          </strong>
          {kids.map((c) => (
            <button key={c.id} onClick={() => openLesson && openLesson(c.id)}>
              <span>{c.number}</span>
              <em>{c.title}</em>
              <ChevronRight size={15} />
            </button>
          ))}
        </nav>
      )}
      {nTab > 0 &&
        prosa.every((b) =>
          /^(Quadro|Tabela|Figura)\s*\d/i.test(b.paragraph.text),
        ) && (
          <div className="kp-quadro">
            <p className="kp-quadro-nota">
              <Table2 size={15} /> O conteúdo desta seção é um quadro do POP.
              Ele está abaixo, e também na aba Quadros e figuras.
            </p>
            {blocks
              .filter((b) => b.type === "table")
              .map((b) => {
                const t = tableMap.get(b.tableId);
                if (!t) return null;
                return (
                  <React.Fragment key={b.id}>
                    <ComoLerEsteQuadro table={t} />
                    <TableRenderer table={t} />
                  </React.Fragment>
                );
              })}
          </div>
        )}
      {prosa.length > 0 && (
        <div className="lesson-keypoints kp-fonte">
          {/* Estes paragrafos sao o texto do POP na redacao original, e nao
              parafrase da plataforma. Sem o rotulo, quem le nao tinha como
              distinguir a palavra da norma do comentario didatico, que neste
              dominio e a confusao mais grave possivel: transforma
              interpretacao em exigencia aos olhos de quem esta aprendendo. */}
          <strong className="kp-notas-tit">
            <Quote size={14} aria-hidden="true" /> Trechos do POP, na redação
            original
          </strong>
          {prosa.slice(0, 4).map((b) => (
            <p key={b.id}>{b.paragraph.text}</p>
          ))}
          {prosa.length > 4 && (
            <details className="lesson-more-prose">
              <summary>
                Continuar leitura guiada · {prosa.length - 4} trechos
              </summary>
              <div>
                {prosa.slice(4).map((block) => (
                  <p key={block.id}>{block.paragraph.text}</p>
                ))}
              </div>
            </details>
          )}
          <button
            className="kp-mais"
            onClick={() => setTab && setTab("fonte")}
          >
            <FileText size={15} /> Conferir a posição e a versão disponibilizada na
            fonte
          </button>
        </div>
      )}
      {steps.length >= 3 ? (
        <div className="lesson-checklist">
          <div className="lc-head">
            <strong>
              <ClipboardCheck size={16} /> Checklist da aula
            </strong>
            <span>
              {doneN}/{shown.length} verificados
            </span>
            <i>
              <em
                style={{
                  width: `${shown.length ? (doneN / shown.length) * 100 : 0}%`,
                }}
              />
            </i>
          </div>
          {shown.map((b, i) => {
            const on = checked.includes(i);
            return (
              <button
                type="button"
                key={b.id}
                className={on ? "lc-item done" : "lc-item"}
                aria-pressed={on}
                onClick={() => toggleCheck && toggleCheck(i)}
              >
                {on ? <CheckCircle2 /> : <Circle />}
                <span>{b.paragraph.text.replace(/^\d+\.\s*/, "")}</span>
              </button>
            );
          })}
          {doneN === shown.length && (
            <div className="lc-complete">
              <Check /> Checklist percorrido. Agora confronte os itens com a
              evidência do caso; marcar não prova suficiência.
            </div>
          )}
        </div>
      ) : null}
      {notas.length > 0 && (
        <div className="lesson-keypoints kp-notas">
          <strong className="kp-notas-tit">
            <Info size={15} /> Observações do procedimento
          </strong>
          {notas.slice(0, 3).map((b) => (
            <p key={b.id}>{b.paragraph.text}</p>
          ))}
          {notas.length > 3 && (
            <details className="lesson-more-prose">
              <summary>
                Ver as outras {notas.length - 3} observações
              </summary>
              <div>
                {notas.slice(3).map((block) => (
                  <p key={block.id}>{block.paragraph.text}</p>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
      <ErrosRecorrentesDaSecao
        lesson={lesson}
        blocks={blocks}
        errosDoPop={errosDoPop}
      />
      <ComoEscreverEstaSecao lesson={lesson} blocks={blocks} go={go} />
      <ExemploNoProcesso
        caso={caso}
        questionIndex={casoPergunta}
        scope={casoEscopo}
        go={go}
      />
      {vazia && irmaos.length > 0 && (
        <nav className="lesson-children lc-related">
          <strong>
            <GitBranch size={15} /> Tópicos relacionados nesta parte
          </strong>
          {irmaos.slice(0, 12).map((c) => (
            <button key={c.id} onClick={() => openLesson && openLesson(c.id)}>
              <span>{c.number}</span>
              <em>{c.title}</em>
              <ChevronRight size={15} />
            </button>
          ))}
        </nav>
      )}
      {!vazia && (
        <>
          <div className="analysis-alert">
            <AlertTriangle />
            <div>
              <strong>Limite de aplicação</strong>
              <p>
                Este conteúdo ensina a aplicar o POP. Antes de decidir em
                processo real, confirme norma vigente, regra de transição,
                competência e orientação institucional aplicável.
              </p>
            </div>
          </div>
          <div className="example-compare">
            <div className="bad">
              <X />
              <div>
                <strong>Atalho arriscado</strong>
                <p>
                  Assumir a conclusão e procurar documentos apenas para
                  confirmá-la.
                </p>
              </div>
            </div>
            <div className="good">
              <Check />
              <div>
                <strong>Análise rastreável</strong>
                <p>
                  Confrontar evidências, registrar limitações e deixar a
                  conclusão resultar do percurso.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      <LessonKnowledgeCheck
        selection={questionSelection}
        evidence={evidence}
        answer={answerLessonQuestion}
        retry={retryLessonQuestion}
      />
      <LessonActivePractice
        lesson={lesson}
        design={design}
        evidence={evidence}
        status={evidenceStatus}
        updateEvidence={updateEvidence}
        toggleCriterion={toggleEvidenceCriterion}
        hasObjectiveCheck={lessonQuestionProvesObjective(questionSelection)}
      />
      {(prosa.length > 0 || steps.length > 0 || nTab > 0) && (
        <button
          className="source-jump"
          onClick={() => setTab && setTab("fonte")}
        >
          <BookMarked /> Conferir o trecho na fonte da seção
        </button>
      )}
    </article>
  );
}
function SourceContent({ blocks, tableMap, figureByBlock }) {
  if (!blocks.length)
    return (
      <Empty text="Esta seção funciona como título de organização. O conteúdo substantivo está nos subtópicos vinculados; a ausência de texto aqui não deve ser interpretada como cobertura integral." />
    );
  return (
    <article className="source-content">
      <div className="source-notice">
        <ShieldCheck />
        <p>
          <strong>Trechos vinculados ao documento-fonte.</strong> Esta aba
          reproduz os blocos associados à seção e suas tabelas. Sumário e
          elementos de navegação podem estar fora desta visualização; confira o
          arquivo original antes de usar o conteúdo em decisão real.
        </p>
      </div>
      {blocks.map((b) => (
        <BlockRenderer
          block={b}
          key={b.id}
          tableMap={tableMap}
          figureByBlock={figureByBlock}
        />
      ))}
    </article>
  );
}
function BlockRenderer({ block, tableMap, figureByBlock }) {
  if (block.type === "table") {
    const table = tableMap.get(block.tableId);
    return table ? <TableRenderer table={table} /> : null;
  }
  const p = block.paragraph;
  if (!p?.text) return null;
  const figure = figureByBlock.get(block.id);
  let text = p.text;
  let cls = p.semanticType === "list-item" || p.list ? "source-list" : "";
  return (
    <React.Fragment>
      {p.headingLevel ? <h3>{text}</h3> : <p className={cls}>{text}</p>}
      {figure && (
        <figure className="source-figure">
          <img src={figure.publicPath} alt={figure.altText || figure.title} />
          <figcaption>{figure.caption}</figcaption>
        </figure>
      )}
    </React.Fragment>
  );
}
function LessonMaterials({ tables, figures }) {
  if (!tables.length && !figures.length)
    return (
      <Empty text="Este tópico não possui quadro ou figura próprio. Consulte o conteúdo disponibilizado na fonte." />
    );
  return (
    <div className="materials-view">
      {figures.map((f) => (
        <figure className="material-figure" key={f.id}>
          <img src={f.publicPath} alt={f.altText || f.title} />
          <figcaption>{f.caption}</figcaption>
          <a href={f.publicPath} download>
            <Download /> Baixar imagem
          </a>
        </figure>
      ))}
      {tables.map((t) => (
        <TableRenderer table={t} key={t.id} />
      ))}
    </div>
  );
}
function Notes({ value, setValue }) {
  return (
    <section className="notes-panel">
      <div>
        <StickyNote />
        <span>
          <label htmlFor="lesson-notes">
            <strong>Seu caderno</strong>
          </label>
          <small>Salvo automaticamente neste dispositivo</small>
        </span>
      </div>
      <textarea
        id="lesson-notes"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Registre dúvidas, exemplos do seu trabalho e pontos para revisar..."
      />
      <div className="note-prompts">
        <button
          onClick={() =>
            setValue(value + "\n• Evidência que preciso verificar: ")
          }
        >
          Evidência a verificar
        </button>
        <button onClick={() => setValue(value + "\n• Dúvida para validação: ")}>
          Dúvida para validação
        </button>
        <button
          onClick={() => setValue(value + "\n• Aplicação no meu processo: ")}
        >
          Aplicação prática
        </button>
      </div>
    </section>
  );
}
