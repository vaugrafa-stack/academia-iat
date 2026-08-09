import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LearningPaths, { LEARNING_PATHS, learningPathMetrics } from "./LearningPaths.jsx";

const tracks = [
  { id: "m00", code: "M00" },
  { id: "m01", code: "M01" },
  { id: "m02", code: "M02" },
  { id: "m03", code: "M03" },
  { id: "m04", code: "M04" },
  { id: "m05", code: "M05" },
  { id: "m06", code: "M06" },
  { id: "m07", code: "M07" },
  { id: "m08", code: "M08" },
  { id: "m09", code: "M09" },
  { id: "m10", code: "M10" },
  { id: "m11", code: "M11" },
  { id: "m12", code: "M14" },
  { id: "m13", code: "M15" },
  { id: "m14", code: "M16" },
  { id: "m15", code: "M12" },
];
const trackLessons = new Map(tracks.map((track) => [track.id, [
  { id: `${track.id}-1`, minutes: 10 },
  { id: `${track.id}-2`, minutes: 15 },
]]));

describe("rotas de entrada da formação", () => {
  it("cobre necessidades diferentes sem fingir que substitui o percurso", () => {
    expect(LEARNING_PATHS).toHaveLength(4);
    const html = renderToStaticMarkup(
      <LearningPaths
        tracks={tracks}
        trackLessons={trackLessons}
        state={{ completed: [] }}
        openLesson={() => {}}
      />,
    );
    expect(html).toContain("Primeira semana");
    expect(html).toContain("Analisar um processo");
    expect(html).toContain("não dispensam os módulos críticos");
    expect(html).toContain("não é certificação de competência profissional");
  });

  it("abre a primeira aula ainda não registrada e calcula tempo e progresso", () => {
    const metrics = learningPathMetrics(
      LEARNING_PATHS[0],
      trackLessons,
      ["m00-1"],
    );
    expect(metrics.done).toBe(1);
    expect(metrics.minutes).toBe(100);
    expect(metrics.next?.id).toBe("m00-2");
    expect(metrics.percent).toBe(13);
  });
});
