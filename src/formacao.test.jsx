// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import Formation from "./formacao.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const lesson = {
  id: "aula-1",
  number: "1.1",
  title: "Licença e enquadramento",
  minutes: 8,
};
const track = {
  id: "m00",
  code: "M00",
  title: "Primeiros passos",
  summary: "Receba e enquadre o processo.",
  icon: "inexistente",
  color: "#13795b",
};
const dados = {
  lessons: [lesson],
  trackGroups: [{ title: "Fundamentos", ids: [track.id] }],
  trackIcons: {},
  trackLessons: new Map([[track.id, [lesson]]]),
  trackProgress: () => 0,
  tracks: [track],
};
const state = { completed: [], bookmarks: [] };
const roots = [];

function mount(openLesson = vi.fn()) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  act(() => root.render(
    <Formation state={state} openLesson={openLesson} dados={dados} />,
  ));
  return { host, openLesson };
}

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
});

describe("formação por rota", () => {
  it("filtra, explica o estado vazio e restaura o currículo", async () => {
    const { host } = mount();
    const filter = host.querySelector('input[aria-label="Filtrar módulos ou aulas"]');

    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setValue.call(filter, "termo inexistente");
      filter.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(host.querySelector('.formation-empty[role="status"]')?.textContent)
      .toContain("termo inexistente");

    await act(async () => host.querySelector(".formation-empty button").click());
    expect(filter.value).toBe("");
    expect(host.querySelector(".formation-empty")).toBeNull();
    expect(host.textContent).toContain("Licença e enquadramento");
  });

  it("abre a aula escolhida e explicita a expansão do módulo", async () => {
    const { host, openLesson } = mount();
    const summary = host.querySelector(".track-summary");
    expect(summary.getAttribute("aria-expanded")).toBe("true");

    await act(async () => host.querySelector(".lesson-list button").click());
    expect(openLesson).toHaveBeenCalledWith(lesson.id);
  });
});
