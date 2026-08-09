// @vitest-environment jsdom
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import Assessments from "./avaliacoes.jsx";

const TRACK = {
  id: "m-teste",
  code: "MT",
  title: "Módulo teste",
  color: "#13795b",
};

const QUESTIONS = [
  {
    id: "q-1",
    track: TRACK.id,
    question: "Qual documento deve ser conferido primeiro?",
    options: ["Documento A", "Documento B"],
    answer: 0,
    explanation: "A conferência começa pelo documento apresentado.",
  },
  {
    id: "q-2",
    track: TRACK.id,
    question: "O resultado do quiz comprova competência profissional?",
    options: ["Sim", "Não"],
    answer: 1,
    explanation: "O resultado serve apenas ao autoacompanhamento.",
  },
];

const DADOS = Object.freeze({
  firstLesson: () => null,
  lessonMap: new Map(),
  lessons: [{ id: "aula-1" }],
  questionBank: QUESTIONS,
  tracks: [TRACK],
});

const INITIAL_STATE = {
  completed: [],
  diagnostico: {},
  quizScores: {},
  revisao: {},
};

const mountedRoots = [];

function Harness() {
  const [state, setState] = useState(INITIAL_STATE);
  return (
    <Assessments
      state={state}
      setState={setState}
      openLesson={() => {}}
      dados={DADOS}
    />
  );
}

function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mountedRoots.push(root);
  act(() => root.render(<Harness />));
  return host;
}

function buttonByText(host, text) {
  return [...host.querySelectorAll("button")].find((button) =>
    button.textContent.includes(text),
  );
}

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
});

describe("interação acessível das autoavaliações", () => {
  it("leva o foco ao enunciado ao iniciar e ao avançar pelo teclado", async () => {
    const host = mount();
    const start = buttonByText(host, TRACK.title);

    expect(start?.tagName).toBe("BUTTON");
    expect(start?.type).toBe("button");
    start.focus();
    expect(document.activeElement).toBe(start);

    await act(async () => start.click());
    const firstHeading = host.querySelector(".quiz-question h2");
    expect(firstHeading?.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(firstHeading);

    const firstOption = host.querySelector(".quiz-options button");
    firstOption.focus();
    expect(document.activeElement).toBe(firstOption);
    await act(async () => firstOption.click());
    expect(firstOption.getAttribute("aria-pressed")).toBe("true");

    await act(async () => buttonByText(host, "Confirmar resposta").click());
    const next = buttonByText(host, "Próxima questão");
    next.focus();
    expect(document.activeElement).toBe(next);
    const previousQuestion = firstHeading.textContent;
    await act(async () => next.click());

    const secondHeading = host.querySelector(".quiz-question h2");
    expect(secondHeading.textContent).not.toBe(previousQuestion);
    expect(document.activeElement).toBe(secondHeading);
    expect(host.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow"))
      .toBe("2");
  });

  it("leva o foco ao resumo quando a tentativa termina", async () => {
    const host = mount();
    await act(async () => buttonByText(host, TRACK.title).click());

    for (let index = 0; index < QUESTIONS.length; index += 1) {
      const option = host.querySelector(".quiz-options button");
      await act(async () => option.click());
      await act(async () => buttonByText(host, "Confirmar resposta").click());
      await act(async () =>
        buttonByText(
          host,
          index === QUESTIONS.length - 1 ? "Ver resultado" : "Próxima questão",
        ).click(),
      );
    }

    const resultHeading = host.querySelector(".quiz-result h2");
    expect(resultHeading).toBeTruthy();
    expect(document.activeElement).toBe(resultHeading);
    expect(host.textContent).toContain("Este resultado não comprova domínio");
  });
});
