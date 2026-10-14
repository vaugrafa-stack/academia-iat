import React from "react";
import {
  ArrowRight,
  Binoculars,
  ClipboardCheck,
  Droplets,
  GraduationCap,
  MapPinned,
} from "lucide-react";
import "./routeStyles.css";

export const LEARNING_PATHS = Object.freeze([
  {
    id: "primeira-semana",
    title: "Primeira semana",
    summary: "Conheça o método, monte o cartão inicial do caso e siga o POP com uma sequência guiada.",
    trackIds: ["m00", "m01", "m02", "m03"],
    icon: GraduationCap,
  },
  {
    id: "analise-processo",
    title: "Analisar um processo",
    summary: "Passe da triagem à modalidade, aos estudos, às pendências e à conclusão.",
    trackIds: ["m02", "m03", "m04", "m05", "m06", "m08", "m12", "m13"],
    icon: ClipboardCheck,
  },
  {
    id: "campo-territorio",
    title: "Território e fiscalização",
    summary: "Conecte barragens, cartografia, recursos naturais, intervenientes e vistoria.",
    trackIds: ["m07", "m10", "m11", "m15", "m12"],
    icon: MapPinned,
  },
  {
    id: "estudos-consultoria",
    title: "Elaborar e revisar estudos",
    summary: "Aprofunde memorial, estudos, PACUERA, qualidade documental e integração final.",
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

export default function LearningPaths({
  trackLessons,
  state,
  openLesson,
  onOpenFoundations,
}) {
  return (
    <section className="learning-paths" aria-labelledby="learning-paths-title">
      <header>
        <h2 id="learning-paths-title">Comece pela sua tarefa</h2>
        <p>Quatro entradas para a mesma formação de M00 a M16; não são currículos alternativos.</p>
      </header>
      <div className="learning-path-list">
        {LEARNING_PATHS.map((path) => {
          const metrics = learningPathMetrics(path, trackLessons, state.completed);
          const Icon = path.icon;
          return (
            <div key={path.id}>
              <button
                type="button"
                disabled={!metrics.next}
                onClick={() => {
                  if (metrics.next) openLesson(metrics.next.id);
                }}
              >
                <Icon className="learning-path-symbol" aria-hidden="true" />
                <span className="learning-path-copy">
                  <strong>{path.title}</strong>
                  <span>{path.summary}</span>
                </span>
                <span className="learning-path-action">
                  {metrics.done ? "Retomar rota" : "Começar rota"}
                  <ArrowRight aria-hidden="true" />
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <aside className="foundation-gateway" aria-label="Fundamentos de hidrelétricas">
        <Droplets aria-hidden="true" />
        <span>Novo em hidrelétricas?</span>
        {onOpenFoundations ? (
          <button type="button" className="foundation-gateway-action" onClick={onOpenFoundations}>
            Ver fundamentos <ArrowRight aria-hidden="true" />
          </button>
        ) : null}
      </aside>
      <p className="learning-path-note">
        O progresso registra autoestudo neste dispositivo; não é certificação de competência profissional.
      </p>
    </section>
  );
}
