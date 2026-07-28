// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LEGACY_PROGRESS_KEY,
  createDefaultProgressState,
  loadStoredState,
  persistStoredState,
  useStoredState,
} from "./storedState.js";

class ControlledStorage {
  constructor() {
    this.values = new Map();
    this.readError = null;
    this.writeError = null;
    this.writeCount = 0;
  }

  getItem(key) {
    if (this.readError) throw this.readError;
    return this.values.get(String(key)) ?? null;
  }

  setItem(key, value) {
    this.writeCount += 1;
    if (this.writeError) throw this.writeError;
    this.values.set(String(key), String(value));
  }

  removeItem(key) {
    this.values.delete(String(key));
  }
}

function quotaError() {
  const error = new Error("quota");
  error.name = "QuotaExceededError";
  return error;
}

function StatusHarness({ storage, explicitKey, resolveKey }) {
  const [state, setState, status, resolveCorruptStorage] = useStoredState({
    storage,
    key: explicitKey,
    resolveKey,
    writeDelay: 0,
  });
  return (
    <div>
      <button
        type="button"
        data-state
        data-status={status?.code || "OK"}
        data-recovery={status?.recoveryAvailable ? "yes" : "no"}
        onClick={() =>
          setState((current) => ({
            ...current,
            completed: [...current.completed, "pop-section-001"],
          }))
        }
      >
        {state.completed.length}
      </button>
      <button
        type="button"
        data-reset
        onClick={() => resolveCorruptStorage("reset")}
      >
        reset
      </button>
    </div>
  );
}

let root;

afterEach(async () => {
  if (root) {
    await act(async () => root.unmount());
    root = null;
  }
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("leitura segura do progresso local", () => {
  it("preserva o payload inválido e bloqueia qualquer sobrescrita automática", async () => {
    vi.useFakeTimers();
    const storage = new ControlledStorage();
    const raw = '{"completed":';
    storage.values.set("progresso", raw);
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    await act(async () => {
      root.render(
        <StatusHarness storage={storage} explicitKey="progresso" />,
      );
    });
    await act(async () => vi.runAllTimers());

    expect(host.querySelector("[data-state]")?.dataset.status).toBe(
      "STORAGE_CORRUPT",
    );
    expect(storage.values.get("progresso")).toBe(raw);
    expect(storage.writeCount).toBe(0);
  });

  it("trata o valor JSON null como corrupção, não como progresso vazio", () => {
    const storage = new ControlledStorage();
    storage.values.set("progresso", "null");

    const result = loadStoredState(storage, "progresso");

    expect(result).toMatchObject({
      raw: "null",
      blocked: true,
      issue: { code: "STORAGE_CORRUPT" },
    });
    expect(storage.values.get("progresso")).toBe("null");
  });

  it("bloqueia JSON válido com tipos incompatíveis antes de chegar às telas", () => {
    const storage = new ControlledStorage();
    const raw = '{"completed":[],"enquadra":"placar inválido"}';
    storage.values.set("progresso", raw);

    const result = loadStoredState(storage, "progresso");

    expect(result).toMatchObject({
      raw,
      blocked: true,
      issue: { code: "STORAGE_CORRUPT" },
    });
    expect(storage.values.get("progresso")).toBe(raw);
  });

  it("torna a leitura indisponível observável e bloqueia escrita defensivamente", () => {
    const storage = new ControlledStorage();
    storage.readError = Object.assign(new Error("acesso negado"), {
      name: "SecurityError",
    });

    const result = loadStoredState(storage, "progresso");

    expect(result).toMatchObject({
      blocked: true,
      issue: { code: "STORAGE_UNAVAILABLE" },
    });
    expect(result.issue.message).toContain("Nenhum dado existente será sobrescrito");
    expect(storage.writeCount).toBe(0);
  });

  it("não usa a chave legada quando o perfil ativo não pode ser resolvido", async () => {
    vi.useFakeTimers();
    const storage = new ControlledStorage();
    storage.values.set(LEGACY_PROGRESS_KEY, '{"completed":["preservar"]}');
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    await act(async () => {
      root.render(
        <StatusHarness
          storage={storage}
          resolveKey={() => {
            throw new Error("registro de perfis inválido");
          }}
        />,
      );
    });
    await act(async () => vi.runAllTimers());

    expect(host.querySelector("[data-state]")?.dataset.status).toBe(
      "STORAGE_UNAVAILABLE",
    );
    expect(storage.values.get(LEGACY_PROGRESS_KEY)).toBe(
      '{"completed":["preservar"]}',
    );
    expect(storage.writeCount).toBe(0);
  });
});

describe("gravação observável do progresso local", () => {
  it("classifica quota sem alterar o último valor persistido", () => {
    const storage = new ControlledStorage();
    const previous = '{"completed":["anterior"]}';
    storage.values.set("progresso", previous);
    storage.writeError = quotaError();

    const result = persistStoredState(
      storage,
      "progresso",
      createDefaultProgressState(),
    );

    expect(result).toMatchObject({
      ok: false,
      issue: { code: "STORAGE_QUOTA" },
    });
    expect(storage.values.get("progresso")).toBe(previous);
  });

  it("expõe quota no hook para que a interface alerte a pessoa", async () => {
    vi.useFakeTimers();
    const storage = new ControlledStorage();
    storage.values.set("progresso", '{"completed":[]}');
    storage.writeError = quotaError();
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    await act(async () => {
      root.render(
        <StatusHarness storage={storage} explicitKey="progresso" />,
      );
    });
    await act(async () => vi.runAllTimers());

    expect(host.querySelector("[data-state]")?.dataset.status).toBe("STORAGE_QUOTA");
  });

  it("mantém a recuperação disponível quando a redefinição falha por quota", async () => {
    const storage = new ControlledStorage();
    const raw = '{"completed":';
    storage.values.set("progresso", raw);
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    await act(async () => {
      root.render(
        <StatusHarness storage={storage} explicitKey="progresso" />,
      );
    });
    storage.writeError = quotaError();
    await act(async () => {
      host.querySelector("[data-reset]").click();
    });

    const stateButton = host.querySelector("[data-state]");
    expect(stateButton?.dataset.status).toBe("STORAGE_QUOTA");
    expect(stateButton?.dataset.recovery).toBe("yes");
    expect(storage.values.get("progresso")).toBe(raw);
  });

  it("rejeita estado interno inválido antes de chamar o storage", () => {
    const storage = new ControlledStorage();
    const previous = '{"completed":[]}';
    storage.values.set("progresso", previous);

    const result = persistStoredState(storage, "progresso", {
      completed: "não é uma lista",
    });

    expect(result).toMatchObject({
      ok: false,
      issue: { code: "STORAGE_STATE_INVALID" },
    });
    expect(storage.values.get("progresso")).toBe(previous);
    expect(storage.writeCount).toBe(0);
  });
});
