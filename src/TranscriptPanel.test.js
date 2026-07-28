import { describe, expect, it } from "vitest";
import { parseWebVtt } from "./TranscriptPanel.jsx";

describe("parseWebVtt", () => {
  it("converte tempos e remove marcação sem perder o texto", () => {
    const cues = parseWebVtt(`WEBVTT

00:00:01.250 --> 00:00:04.000
Confirme <b>potência</b> e área.

2
00:01:05.000 --> 00:01:08.000 align:start
Registre a decisão.
`);
    expect(cues).toEqual([
      {
        id: "00:00:01.250-0",
        start: 1.25,
        end: 4,
        text: "Confirme potência e área.",
      },
      {
        id: "00:01:05.000-1",
        start: 65,
        end: 68,
        text: "Registre a decisão.",
      },
    ]);
  });

  it("ignora cabeçalho, notas e blocos sem tempo", () => {
    expect(parseWebVtt("WEBVTT\n\nNOTE interno\n\ntexto solto")).toEqual([]);
  });
});
