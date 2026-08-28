// @vitest-environment jsdom
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import Assessments from "./avaliacoes.jsx";
import generatedQuestionBank from "./data/question-bank.json";

const TRACK = {
  id: "m-teste",
  code: "MT",
  title: "Módulo teste",
  color: "#13795b",
};

function pedagogy(objective, distractor) {
  return {
    schemaVersion: 1,
    derivation: "regras-editoriais-automaticas-v1",
    reviewStatus: "revisao-humana-pendente",
    objective,
    cognitiveLevel: "aplicar",
    difficulty: "intermediaria",
    difficultySignals: ["ação cognitiva: aplicar"],
    remediationPriority: "alta",
    distractors: [
      {
        option: distractor,
        feedback: "Esta alternativa não é sustentada pelo trecho citado.",
      },
    ],
  };
}

const QUESTIONS = [
  {
    id: "q-1",
    track: TRACK.id,
    question: "Qual documento deve ser conferido primeiro?",
    options: ["Documento A", "Documento B"],
    answer: 0,
    explanation: "A conferência começa pelo documento apresentado.",
    pedagogy: pedagogy(
      "Aplicar a ordem de conferência e justificar a escolha.",
      "Documento B",
    ),
  },
  {
    id: "q-2",
    track: TRACK.id,
    question: "O resultado do quiz comprova competência profissional?",
    options: ["Sim", "Não"],
    answer: 1,
    explanation: "O resultado serve apenas ao autoacompanhamento.",
    pedagogy: pedagogy(
      "Distinguir autoacompanhamento de validação profissional.",
      "Sim",
    ),
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
  it("preserva confiança e remediação sem expor metadados de autoria", async () => {
    const host = mount();

    expect(host.textContent).toContain("Resultado para orientar a revisão");
    expect(host.textContent).not.toContain("Autoacompanhamento não validado");
    await act(async () => buttonByText(host, TRACK.title).click());

    expect(host.querySelector(".question-pedagogy")).toBeNull();
    expect(host.querySelector(".pedagogy-method-note")).toBeNull();
    expect(host.textContent).not.toContain("Nível cognitivo");
    expect(host.textContent).not.toContain("Dificuldade estrutural estimada");
    expect(host.textContent).not.toContain("Prioridade se errar");

    const question = host.querySelector(".quiz-question h2").textContent;
    const distractor = question.includes("documento") ? "Documento B" : "Sim";
    await act(async () => buttonByText(host, distractor).click());
    await act(async () => buttonByText(host, "Alta").click());
    await act(async () => buttonByText(host, "Confirmar resposta").click());

    expect(host.textContent).toContain("Confiança declarada: alta");
    expect(host.querySelector(".distractor-explanation")?.textContent)
      .toContain("Esta alternativa não é sustentada pelo trecho citado");
  });

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

    const confidence = buttonByText(host, "Alta");
    expect(buttonByText(host, "Confirmar resposta").disabled).toBe(true);
    await act(async () => confidence.click());
    expect(confidence.getAttribute("aria-pressed")).toBe("true");

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

  it("rola o enunciado abaixo da barra fixa antes de movê-lo para o foco", async () => {
    const previousScrollIntoView = HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      const host = mount();
      await act(async () => buttonByText(host, "Fazer a primeira aplicação").click());

      const heading = host.querySelector(".quiz-question h2");
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
      expect(document.activeElement).toBe(heading);
    } finally {
      if (previousScrollIntoView) {
        Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
          configurable: true,
          value: previousScrollIntoView,
        });
      } else {
        delete HTMLElement.prototype.scrollIntoView;
      }
    }
  });

  it("leva o foco ao resumo quando a tentativa termina", async () => {
    const host = mount();
    await act(async () => buttonByText(host, TRACK.title).click());

    for (let index = 0; index < QUESTIONS.length; index += 1) {
      const option = host.querySelector(".quiz-options button");
      await act(async () => option.click());
      await act(async () => buttonByText(host, "Alta").click());
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
    expect(host.textContent).toContain("Confiança alta");
  });

  it("oferece diagnóstico rápido e completo antes da primeira aplicação", async () => {
    const host = mount();
    const quick = buttonByText(host, "Rápida");
    const full = buttonByText(host, "Completa");

    expect(quick.getAttribute("aria-pressed")).toBe("true");
    expect(full.getAttribute("aria-pressed")).toBe("false");
    await act(async () => full.click());
    expect(full.getAttribute("aria-pressed")).toBe("true");
    expect(host.textContent).toContain("2 questões");
  });

  it("mantém o feedback do diagnóstico visível antes de avançar", async () => {
    const host = mount();
    await act(async () =>
      buttonByText(host, "Fazer a primeira aplicação").click(),
    );

    const headingBefore = host.querySelector(".quiz-question h2").textContent;
    const wrongOption = [...host.querySelectorAll(".quiz-options button")]
      .find((button) => !button.textContent.includes("Documento A"));
    await act(async () => wrongOption.click());
    await act(async () => buttonByText(host, "Alta").click());
    await act(async () => buttonByText(host, "Confirmar resposta").click());

    expect(host.querySelector(".quiz-question h2").textContent).toBe(headingBefore);
    expect(host.querySelector(".answer-feedback")).toBeTruthy();
    expect(host.textContent).toContain("Ponto de revisão");
    expect(buttonByText(host, "Próxima questão") || buttonByText(host, "Ver resultado"))
      .toBeTruthy();
  });

  it("mantém a nota baseada apenas nos acertos, independentemente da confiança", async () => {
    const host = mount();
    await act(async () => buttonByText(host, TRACK.title).click());

    for (let index = 0; index < QUESTIONS.length; index += 1) {
      const currentText = host.querySelector(".quiz-question h2").textContent;
      const currentQuestion = QUESTIONS.find(
        (question) => question.question === currentText,
      );
      const correctOption = currentQuestion.options[currentQuestion.answer];

      await act(async () => buttonByText(host, correctOption).click());
      await act(async () =>
        buttonByText(host, index === 0 ? "Baixa" : "Alta").click(),
      );
      await act(async () => buttonByText(host, "Confirmar resposta").click());
      await act(async () =>
        buttonByText(
          host,
          index === QUESTIONS.length - 1 ? "Ver resultado" : "Próxima questão",
        ).click(),
      );
    }

    expect(host.querySelector(".score-ring").textContent.replace(/\s/g, ""))
      .toContain("2/2");
  });
});

describe("metadados pedagógicos do banco gerado", () => {
  it("mantém as 224 questões rastreáveis e com revisão especializada pendente", () => {
    const cognitiveLevels = new Set();
    const difficulties = new Set();
    const priorities = new Set();

    expect(generatedQuestionBank).toHaveLength(224);
    for (const question of generatedQuestionBank) {
      const metadata = question.pedagogy;
      expect(metadata?.schemaVersion).toBe(1);
      expect(metadata?.derivation).toBe("regras-editoriais-automaticas-v1");
      expect(metadata?.reviewStatus).toBe("revisao-humana-pendente");
      expect(metadata?.objective.length).toBeGreaterThan(30);
      expect(metadata?.difficultySignals.length).toBeGreaterThan(0);
      expect(metadata?.distractors).toHaveLength(question.options.length - 1);
      expect(metadata.distractors.every((item) => (
        question.options.includes(item.option)
        && item.option !== question.options[question.answer]
        && item.feedback.length > 40
      ))).toBe(true);
      cognitiveLevels.add(metadata.cognitiveLevel);
      difficulties.add(metadata.difficulty);
      priorities.add(metadata.remediationPriority);
    }

    expect(cognitiveLevels.size).toBeGreaterThanOrEqual(3);
    expect(difficulties.size).toBeGreaterThanOrEqual(2);
    expect(priorities.size).toBeGreaterThanOrEqual(2);
  });

  it("classifica corretamente os itens factuais e os que exigem aplicação", () => {
    const byId = new Map(generatedQuestionBank.map((question) => [question.id, question]));

    expect(byId.get("q012")?.pedagogy.cognitiveLevel).toBe("aplicar");
    for (const id of ["q040", "q097", "q098", "q101", "q110", "q111", "q118"]) {
      expect(byId.get(id)?.pedagogy.cognitiveLevel, id).toBe("recordar");
    }
    for (const id of ["q026", "q039"]) {
      expect(byId.get(id)?.pedagogy.cognitiveLevel, id).toBe("compreender");
    }
  });

  it("explica especificamente distratores com regras absolutas", () => {
    const byId = new Map(generatedQuestionBank.map((question) => [question.id, question]));

    for (const id of ["q025", "q030"]) {
      const distractor = byId.get(id)?.pedagogy.distractors.find(({ option }) =>
        /exclusivamente|automática/i.test(option),
      );
      expect(distractor, id).toBeTruthy();
      expect(distractor.feedback, id).toMatch(/regra absoluta/i);
    }
  });
});
