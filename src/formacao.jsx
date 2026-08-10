import React, { useState } from "react";
import {
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  Search,
} from "lucide-react";
import LearningPaths from "./LearningPaths.jsx";
import { norm } from "./derivados.js";
import { PageHeader } from "./ui.jsx";

export default function Formation({ state, openLesson, dados }) {
  const {
    lessons,
    trackGroups,
    trackIcons,
    trackLessons,
    trackProgress,
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
    <div className="page">
      <PageHeader
        title="Formação guiada pelo POP"
        subtitle={`${tracks.length} módulos conectam cada seção do POP a objetivos, conteúdo-fonte, prática e avaliação.`}
        icon={GraduationCap}
      />
      <LearningPaths
        tracks={tracks}
        trackLessons={trackLessons}
        state={state}
        openLesson={openLesson}
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
            : `${lessons.length} tópicos · ${tracks.reduce(
              (total, track) => total + (
                trackLessons.get(track.id)?.reduce(
                  (minutes, lesson) => minutes + lesson.minutes,
                  0,
                ) || 0
              ),
              0,
            )} min estimados`}
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
              const progress = trackProgress(id, state);
              const Icon = trackIcons[track.icon] || BookOpen;
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
                    <span className="track-icon" style={{ "--track": track.color }}>
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="track-copy">
                      <small>{track.code}</small>
                      <strong>{track.title}</strong>
                      <em>{track.summary}</em>
                    </span>
                    <span className="track-metrics">
                      <b>{progress}%</b>
                      <i aria-hidden="true">
                        <em style={{ width: `${progress}%` }} />
                      </i>
                      <small>
                        {state.completed.filter((lessonId) =>
                          full.some((lesson) => lesson.id === lessonId),
                        ).length}
                        /{full.length} tópicos
                      </small>
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
                              {lesson.minutes} min estimados · Fonte vinculada ao POP
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
