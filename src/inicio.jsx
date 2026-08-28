import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Database,
  FlaskConical,
  Layers3,
  Play,
  Target,
} from "lucide-react";
import SourceAssurance from "./sourceAssurance.jsx";
import VideoDataLoading from "./VideoDataLoading.jsx";
import VideoLearningStage from "./VideoLearningStage.jsx";
import { hasStartedJourney } from "./learningJourney.js";
import { objetivoDaAula } from "./lessonObjective.js";

/**
 * Tela inicial da Academia.
 *
 * Os dados derivados do POP chegam por um contrato explícito. Isso mantém o
 * módulo testável sem repetir a extração nem acoplar a tela ao bootstrap da
 * aplicação, que é o único lugar que conhece a fonte carregada no arranque.
 */
export default function Inicio({
  state,
  progress,
  go,
  openLesson,
  labIndexStatus,
  pilotMediaStatus,
  dados,
}) {
  const {
    firstLesson,
    lessonMap,
    lessons,
    mediaForLesson,
    trackLessons,
    tracks,
    wb,
  } = dados;
  const continueLesson =
    lessonMap.get(state.lastLesson) || firstLesson("m00") || lessons[0];
  const continueTrack =
    tracks.find((track) => track.id === continueLesson.trackId) || tracks[0];
  const feat = pilotMediaStatus.loading
    ? null
    : mediaForLesson(continueLesson, pilotMediaStatus.collection);
  const startedJourney = hasStartedJourney(state);

  return (
    <div className="page dashboard-page">
      <section className="dashboard-intro">
        <h1>
          {startedJourney
            ? "Onde você parou, e o que decidir a seguir."
            : "Comece por aqui."}
        </h1>
      </section>
      <section className="dashboard-feature">
        <div className="feature-media">
          {pilotMediaStatus.loading ? (
            <VideoDataLoading />
          ) : (
            <VideoLearningStage
              key={feat?.src}
              media={{
                ...feat,
                poster: feat?.poster || wb("/media/analista-licenciamento.png"),
              }}
              track={continueTrack}
              lesson={continueLesson}
              compact
            />
          )}
          <span>Resumo em vídeo desta aula</span>
          <span className="fm-chip">
            <Clock /> Conteúdo vinculado ao tópico
          </span>
        </div>
        <div className="feature-copy">
          <small>
            {continueTrack.code} · {startedJourney ? "CONTINUE DE ONDE PAROU" : "PRIMEIRO PASSO"}
          </small>
          <h2>{continueLesson.fullTitle || continueLesson.title}</h2>
          <p>{continueTrack.summary}</p>
          <div className="feature-meta">
            <span>
              <Clock /> {continueLesson.minutes} min
            </span>
            <span>
              <Layers3 /> {trackLessons.get(continueTrack.id).length} tópicos
            </span>
          </div>
          <div
            className="feature-progress"
            role="progressbar"
            aria-label="Progresso geral"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
          >
            <span>
              Seu progresso <b>{progress}%</b>
            </span>
            <i>
              <em style={{ width: `${progress}%` }} />
            </i>
            <small>
              {state.completed.length} de {lessons.length} tópicos concluídos
            </small>
          </div>
          <button
            className="primary"
            onClick={() => openLesson(continueLesson.id)}
          >
            {startedJourney ? "Continuar aula" : "Iniciar orientação"} <Play />
          </button>
          <button
            className="text-action"
            onClick={() => go(startedJourney ? "formacao" : "hidreletricas")}
          >
            {startedJourney
              ? "Ver todas as aulas"
              : "Novo em hidrelétricas? Veja os fundamentos"}{" "}
            <ArrowRight />
          </button>
        </div>
        <CurrentObjectiveCard lesson={continueLesson} dados={dados} />
      </section>
      <section className="dashboard-bottom">
        <NextPracticeCard
          state={state}
          currentTrackId={continueTrack.id}
          go={go}
          scenarios={labIndexStatus.casos}
          loading={labIndexStatus.carregando}
          error={labIndexStatus.erro}
        />
        <ReviewErrorsCard
          state={state}
          go={go}
          openLesson={openLesson}
          dados={dados}
        />
      </section>
      <DashboardPhases
        state={state}
        currentTrackId={continueTrack.id}
        openLesson={openLesson}
        go={go}
        dados={dados}
      />
      <DashboardSourceDetails go={go} dados={dados} />
    </div>
  );
}

function CurrentObjectiveCard({ lesson, dados }) {
  const { blockMap, tableMap } = dados;
  const blocks = (lesson.blockIds || [])
    .map((id) => blockMap.get(id))
    .filter((block) => block && !block.navigationOnly);
  const alvo = objetivoDaAula(lesson, blocks, tableMap);

  return (
    <aside className="current-objective-card">
      <span>
        <Target aria-hidden="true" /> Objetivo atual
      </span>
      <h2>O que você deve conseguir fazer</h2>
      <p>{alvo.objetivo}</p>
      {alvo.comoSeVe && (
        <p className="objetivo-como-se-ve">
          <strong>Como você sabe que consegue.</strong> {alvo.comoSeVe}
        </p>
      )}
      <small>
        Ao concluir, registre a recuperação ativa e confira os critérios da
        própria aula.
      </small>
    </aside>
  );
}

function NextPracticeCard({
  state,
  currentTrackId,
  go,
  scenarios: availableScenarios,
  loading,
  error,
}) {
  const labs = state.labs || {};
  const inProgress = availableScenarios.find(
    (scenario) => labs[scenario.id]?.status === "em_andamento",
  );
  const nextPractice =
    inProgress ||
    availableScenarios.find(
      (scenario) => scenario.track === currentTrackId && !labs[scenario.id],
    ) ||
    availableScenarios.find((scenario) => !labs[scenario.id]) ||
    availableScenarios[0];

  if (!nextPractice) {
    return (
      <article className="dashboard-action-card practice" aria-busy={loading || undefined}>
        <header>
          <FlaskConical aria-hidden="true" />
          <span>Próxima prática</span>
        </header>
        <h2>{error ? "Práticas temporariamente indisponíveis" : "Preparando os casos"}</h2>
        <p>
          {error
            ? "Não foi possível carregar o catálogo de casos. Confira a conexão e abra o Laboratório para tentar novamente."
            : "O catálogo de casos está sendo carregado para indicar a prática mais adequada."}
        </p>
        {error && (
          <button type="button" onClick={() => go("laboratorio")}>
            Abrir Laboratório <ArrowRight />
          </button>
        )}
      </article>
    );
  }
  const continuing = labs[nextPractice.id]?.status === "em_andamento";

  return (
    <article className="dashboard-action-card practice">
      <header>
        <FlaskConical aria-hidden="true" />
        <span>Próxima prática</span>
      </header>
      <small>{nextPractice.label}</small>
      <h2>{nextPractice.title}</h2>
      <p>
        {continuing
          ? "Retome as evidências e decisões que ficaram salvas neste dispositivo."
          : "Aplique o que estudou a um caso sintético e fundamente a decisão."}
      </p>
      <button type="button" onClick={() => go("laboratorio", nextPractice.id)}>
        {continuing ? "Continuar caso" : "Praticar este caso"} <ArrowRight />
      </button>
    </article>
  );
}

function ReviewErrorsCard({ state, go, openLesson, dados }) {
  const { firstLesson, lessonMap, tracks } = dados;
  const diagnostic = state.diagnostico?.saida || state.diagnostico?.entrada;
  const errors = Object.values(diagnostic?.porQuestao || {}).filter(
    (record) => record?.ok === false,
  );
  const firstErrorTrack = errors.find((record) => record.track)?.track;
  const reviewTrack = tracks.find((track) => track.id === firstErrorTrack);
  const reviewLesson = reviewTrack
    ? lessonMap.get(reviewTrack.remediationLessonId) || firstLesson(reviewTrack.id)
    : null;

  return (
    <article className="dashboard-action-card review">
      <header>
        <AlertTriangle aria-hidden="true" />
        <span>Erros para revisar</span>
      </header>
      {!diagnostic ? (
        <>
          <h2>Nenhum erro registrado ainda</h2>
          <p>Faça a autoavaliação para receber pontos de revisão direcionados.</p>
          <button type="button" onClick={() => go("avaliacoes")}>
            Fazer autoavaliação <ArrowRight />
          </button>
        </>
      ) : errors.length === 0 ? (
        <>
          <h2>Nenhum erro na última aplicação</h2>
          <p>Continue o percurso e reaplique os itens no momento de revisão.</p>
          <button type="button" onClick={() => go("avaliacoes")}>
            Abrir avaliações <ArrowRight />
          </button>
        </>
      ) : (
        <>
          <strong className="dashboard-error-count">{errors.length}</strong>
          <h2>{errors.length === 1 ? "ponto pede revisão" : "pontos pedem revisão"}</h2>
          <p>
            {reviewTrack
              ? `Comece por ${reviewTrack.code} · ${reviewTrack.title}.`
              : "Abra a avaliação para revisar o feedback comentado."}
          </p>
          <button
            type="button"
            onClick={() =>
              reviewLesson ? openLesson(reviewLesson.id) : go("avaliacoes")
            }
          >
            Revisar agora <ArrowRight />
          </button>
        </>
      )}
    </article>
  );
}

function DashboardPhases({ state, currentTrackId, openLesson, go, dados }) {
  const { trackGroups, trackLessons, tracks } = dados;
  return (
    <section className="dashboard-phases-section" aria-labelledby="dashboard-phases-title">
      <div className="dashboard-section-heading">
        <div>
          <h2 id="dashboard-phases-title">Quatro fases do percurso</h2>
          <p>A sequência permanece única, de M00 a M16.</p>
        </div>
        <button type="button" onClick={() => go("formacao")}>
          Ver formação completa <ArrowRight />
        </button>
      </div>
      <ol className="dashboard-phases">
        {trackGroups.map((group, index) => {
          const phaseTracks = group.ids
            .map((id) => tracks.find((track) => track.id === id))
            .filter(Boolean);
          const phaseLessons = group.ids.flatMap(
            (id) => trackLessons.get(id) || [],
          );
          const completed = phaseLessons.filter((lesson) =>
            state.completed.includes(lesson.id),
          ).length;
          const percent = phaseLessons.length
            ? Math.round((completed / phaseLessons.length) * 100)
            : 0;
          const destination =
            phaseLessons.find((lesson) => !state.completed.includes(lesson.id)) ||
            phaseLessons[0];
          const current = group.ids.includes(currentTrackId);
          return (
            <li key={group.title} className={current ? "current" : ""}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => destination && openLesson(destination.id)}
              >
                <span className="dashboard-phase-number">
                  {percent === 100 ? <Check aria-hidden="true" /> : index + 1}
                </span>
                <span className="dashboard-phase-copy">
                  <small>
                    Fase {index + 1} · {phaseTracks[0]?.code}–
                    {phaseTracks.at(-1)?.code}
                  </small>
                  <strong>{group.title}</strong>
                </span>
                <span className="dashboard-phase-progress">
                  <b>{percent}%</b>
                  <i>
                    <em style={{ width: `${percent}%` }} />
                  </i>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DashboardSourceDetails({ go, dados }) {
  const { flowData, lessons, popData } = dados;
  return (
    <details className="dashboard-source-details">
      <summary>
        <Database aria-hidden="true" />
        <span>
          <strong>Sobre a fonte</strong>
          <small>Versão, integridade e cobertura documental</small>
        </span>
        <ChevronRight aria-hidden="true" />
      </summary>
      <div>
        <SourceAssurance popData={popData} lessonCount={lessons.length} />
        <dl className="dashboard-source-metrics">
          <div>
            <dt>Tópicos didáticos</dt>
            <dd>{lessons.length}</dd>
          </div>
          <div>
            <dt>Quadros e tabelas</dt>
            <dd>{popData.tables.filter((table) => !table.navigationOnly).length}</dd>
          </div>
          <div>
            <dt>Figuras e fluxos</dt>
            <dd>
              {popData.figures.length +
                new Set(flowData.flowcharts.map((flow) => flow.number)).size}
            </dd>
          </div>
          <div>
            <dt>Trechos pesquisáveis</dt>
            <dd>
              {(popData.stats?.allDocumentParagraphNodes || 0).toLocaleString(
                "pt-BR",
              )}
            </dd>
          </div>
        </dl>
        <button type="button" onClick={() => go("biblioteca")}>
          Abrir biblioteca <ArrowRight />
        </button>
      </div>
    </details>
  );
}
