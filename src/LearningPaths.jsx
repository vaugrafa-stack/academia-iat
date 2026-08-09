import React from "react";
import {
  ArrowRight,
  Binoculars,
  ClipboardCheck,
  GraduationCap,
  MapPinned,
} from "lucide-react";

export const LEARNING_PATHS = Object.freeze([
  {
    id: "primeira-semana",
    title: "Primeira semana",
    summary: "Entenda o papel do POP, receba o processo e faça o primeiro enquadramento.",
    outcome: "Produto: cartão inicial do caso e rota de análise.",
    trackIds: ["m00", "m01", "m02", "m03"],
    icon: GraduationCap,
  },
  {
    id: "analise-processo",
    title: "Analisar um processo",
    summary: "Passe da triagem à modalidade, aos estudos, às pendências e à conclusão.",
    outcome: "Produto: matriz de suficiência e encaminhamento motivado.",
    trackIds: ["m02", "m03", "m04", "m05", "m06", "m08", "m12", "m13"],
    icon: ClipboardCheck,
  },
  {
    id: "campo-territorio",
    title: "Território e fiscalização",
    summary: "Conecte barragens, cartografia, recursos naturais, intervenientes e vistoria.",
    outcome: "Produto: roteiro de campo e confronto de evidências.",
    trackIds: ["m07", "m10", "m11", "m15", "m12"],
    icon: MapPinned,
  },
  {
    id: "estudos-consultoria",
    title: "Elaborar e revisar estudos",
    summary: "Aprofunde memorial, estudos, PACUERA, qualidade documental e integração final.",
    outcome: "Produto: estudo rastreável e pronto para revisão crítica.",
    trackIds: ["m01", "m08", "m09", "m10", "m11", "m13", "m14"],
    icon: Binoculars,
  },
]);

export function learningPathMetrics(path, trackLessons, completed = []) {
  const lessons = path.trackIds.flatMap((id) => trackLessons.get(id) || []);
  const done = lessons.filter((lesson) => completed.includes(lesson.id)).length;
  const minutes = lessons.reduce((total, lesson) => total + (lesson.minutes || 0), 0);
  const next = lessons.find((lesson) => !completed.includes(lesson.id)) || lessons[0] || null;
  return {
    lessons,
    done,
    minutes,
    next,
    percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
  };
}
export default function LearningPaths({ tracks, trackLessons, state, openLesson }) {
  const trackById = new Map(tracks.map((track) => [track.id, track]));
  return (
    <section className="learning-paths" aria-labelledby="learning-paths-title">
      <header>
        <div>
          <h2 id="learning-paths-title">Escolha uma rota de entrada</h2>
          <p>
            As rotas orientam o começo conforme a tarefa. Elas não dispensam os
            módulos críticos nem substituem a sequência completa de M00 a M16.
          </p>
        </div>
        <span>4 percursos orientados</span>
      </header>
      <div className="learning-path-grid">
        {LEARNING_PATHS.map((path) => {
          const metrics = learningPathMetrics(path, trackLessons, state.completed);
          const Icon = path.icon;
          const codes = path.trackIds
            .map((id) => trackById.get(id)?.code)
            .filter(Boolean)
            .join(" · ");
          return (
            <article key={path.id}>
              <span className="learning-path-icon"><Icon aria-hidden="true" /></span>
              <div className="learning-path-copy">
                <small>{codes}</small>
                <h3>{path.title}</h3>
                <p>{path.summary}</p>
                <strong>{path.outcome}</strong>
              </div>
              <div className="learning-path-progress">
                <span>
                  {metrics.done}/{metrics.lessons.length} tópicos · {metrics.minutes} min
                </span>
                <i aria-hidden="true"><em style={{ width: `${metrics.percent}%` }} /></i>
              </div>
              <button
                type="button"
                disabled={!metrics.next}
                onClick={() => metrics.next && openLesson(metrics.next.id)}
              >
                {metrics.done ? "Retomar rota" : "Começar rota"} <ArrowRight aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
      <p className="learning-path-note">
        “Concluído” registra atividade de autoestudo neste dispositivo; não é
        certificação de competência profissional nem validação institucional.
      </p>
    </section>
  );
}
