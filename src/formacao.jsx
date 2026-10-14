import React, { useState } from "react";
import {
  BookmarkCheck,
  Check,
  ChevronRight,
  GraduationCap,
  Search,
} from "lucide-react";
import LearningPaths from "./LearningPaths.jsx";
import { norm } from "./derivados.js";
import { PageHeader } from "./ui.jsx";

export default function Formation({ state, openLesson, dados, go }) {
  const {
    lessons,
    trackGroups,
    trackLessons,
    tracks,
  } = dados;
  const [openTrack, setOpenTrack] = useState("m00");
  const [filter, setFilter] = useState("");
  const filterNormalized = norm(filter);
  const filteredGroups = trackGroups
    .map((group) => ({
      ...group,
      rows: group.ids.flatMap((id) => {
        const track = tracks.find((item) => item.id === id);
        const full = trackLessons.get(id) || [];
        const matchingLessons = full.filter((lesson) =>
          norm(`${lesson.title} ${lesson.number || ""}`).includes(filterNormalized),
        );
        const trackMatches = norm(`${track.title} ${track.code}`).includes(
          filterNormalized,
        );
        if (filterNormalized && !trackMatches && !matchingLessons.length) return [];
        return [{
          id,
          track,
          full,
          lessons: filterNormalized && trackMatches && !matchingLessons.length
            ? full
            : matchingLessons,
        }];
      }),
    }))
    .filter((group) => group.rows.length > 0);
  const visibleTopics = filteredGroups.reduce(
    (total, group) => total + group.rows.reduce(
      (groupTotal, row) => groupTotal + row.lessons.length,
      0,
    ),
    0,
  );

  return (
    <div className="page formation-page">
      <PageHeader
        title="Formação guiada pelo POP"
        subtitle="Escolha uma tarefa ou percorra os módulos em sequência."
        icon={GraduationCap}
      />
      <LearningPaths
        tracks={tracks}
        trackLessons={trackLessons}
        state={state}
        openLesson={openLesson}
        onOpenFoundations={() => go("hidreletricas")}
      />
      <div className="formation-toolbar">
        <div role="search">
          <Search aria-hidden="true" />
          <input
            aria-label="Filtrar módulos ou aulas"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filtrar módulos ou aulas"
          />
        </div>
        <span role="status" aria-live="polite">
          {filterNormalized
            ? `${visibleTopics} ${visibleTopics === 1 ? "tópico encontrado" : "tópicos encontrados"}`
            : `${tracks.length} módulos · ${lessons.length} tópicos`}
        </span>
      </div>
      <div className="curriculum">
        {filteredGroups.length ? filteredGroups.map((group) => (
          <section key={group.title}>
            <div className="group-title">
              <span>{group.title}</span>
              <i />
            </div>
            {group.rows.map(({ id, track, full, lessons: visibleLessons }) => {
              const completed = state.completed.filter((lessonId) =>
                full.some((lesson) => lesson.id === lessonId),
              ).length;
              const expanded = openTrack === id || (
                Boolean(filterNormalized) && visibleLessons.length > 0
              );
              return (
                <article
                  className={`track-row ${expanded ? "expanded" : ""}`}
                  key={id}
                >
                  <button
                    type="button"
                    className="track-summary"
                    aria-expanded={expanded}
                    onClick={() => setOpenTrack(openTrack === id ? "" : id)}
                  >
                    <span className="track-code">{track.code}</span>
                    <span className="track-copy">
                      <strong>{track.title}</strong>
                      <em>{track.summary}</em>
                    </span>
                    <span className="track-metrics">
                      <small>{completed}/{full.length} aulas</small>
                    </span>
                    <ChevronRight aria-hidden="true" />
                  </button>
                  {expanded && (
                    <div className="lesson-list">
                      {visibleLessons.map((lesson) => (
                        <button
                          type="button"
                          key={lesson.id}
                          onClick={() => openLesson(lesson.id)}
                        >
                          <span
                            className={
                              state.completed.includes(lesson.id) ? "complete" : ""
                            }
                          >
                            {state.completed.includes(lesson.id)
                              ? <Check aria-hidden="true" />
                              : full.indexOf(lesson) + 1}
                          </span>
                          <span>
                            <strong>
                              {lesson.number ? `${lesson.number} ` : ""}
                              {lesson.title}
                            </strong>
                            <small>
                              {lesson.minutes} min estimados
                            </small>
                          </span>
                          {state.bookmarks.includes(lesson.id) && (
                            <BookmarkCheck className="saved" aria-label="Aula favorita" />
                          )}
                          <ChevronRight aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )) : (
          <section className="formation-empty" role="status">
            <Search aria-hidden="true" />
            <h2>Nenhum tópico encontrado</h2>
            <p>
              Não encontramos módulo ou aula para <strong>“{filter.trim()}”</strong>.
              Tente um termo como licença, barragem, fauna ou outorga.
            </p>
            <button type="button" onClick={() => setFilter("")}>
              Limpar filtro
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
