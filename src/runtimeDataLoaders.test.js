import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import labIndex from "./data/lab-index.json";
import pilotMedia from "./data/audiovisual-pilot-media.json";
import offlinePackages from "./data/offline-packages.json";

function responseFor(data) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  };
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("carregadores de dados sob demanda", () => {
  it("carrega, valida e compartilha o índice do Laboratório", async () => {
    const fetchMock = vi.fn().mockResolvedValue(responseFor(labIndex));
    vi.stubGlobal("fetch", fetchMock);
    const modulo = await import("./labData.js");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(() => modulo.validarIndiceLaboratorio({ grupos: [], casos: [] })).toThrow(
      /indice vazio/,
    );

    const [primeiro, segundo] = await Promise.all([
      modulo.carregarIndiceLaboratorio(),
      modulo.carregarIndiceLaboratorio(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(primeiro).toBe(segundo);
    expect(modulo.scenarios).toHaveLength(labIndex.casos.length);
    expect(modulo.GRUPOS_LAB).toHaveLength(labIndex.grupos.length);
  });

  it("recusa corpo parcial ou sem os campos necessarios para a pratica", async () => {
    const modulo = await import("./labData.js");
    expect(() => modulo.validarCorposLaboratorio({}, labIndex)).toThrow(
      /conjunto de casos diverge/,
    );
    const primeiroId = labIndex.casos[0].id;
    const parcial = Object.fromEntries(
      labIndex.casos.map((caso) => [caso.id, {
        id: caso.id,
        track: caso.track,
        title: caso.title,
        facts: ["fato"],
        evidence: ["evidencia"],
        steps: ["etapa"],
        questions: [["pergunta", "nao"]],
        outcome: "encaminhamento",
        elementos: [{ rot: "criterio", termos: ["termo"] }],
        modelo: "resposta comentada",
      }]),
    );
    delete parcial[primeiroId].evidence;
    expect(() => modulo.validarCorposLaboratorio(parcial, labIndex)).toThrow(
      new RegExp(`evidence ausente em ${primeiroId}`),
    );
  });

  it("carrega e reaproveita o manifesto audiovisual", async () => {
    const fetchMock = vi.fn().mockResolvedValue(responseFor(pilotMedia));
    vi.stubGlobal("fetch", fetchMock);
    const modulo = await import("./audiovisualPilotRuntime.js");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(() => modulo.validateRuntimeMediaCollection({ items: [] })).toThrow(
      /coleção inválida/,
    );

    const [primeiro, segundo] = await Promise.all([
      modulo.loadAudiovisualPilotMedia(),
      modulo.loadAudiovisualPilotMedia(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(primeiro).toBe(segundo);
    expect(modulo.audiovisualPilotMedia.items).toHaveLength(pilotMedia.items.length);
  });

  it("carrega e reaproveita o catálogo de pacotes offline", async () => {
    const fetchMock = vi.fn().mockResolvedValue(responseFor(offlinePackages));
    vi.stubGlobal("fetch", fetchMock);
    const modulo = await import("./OfflineManager.jsx");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(() => modulo.validateOfflinePackages({ packages: [] })).toThrow(
      /lista de pacotes ausente/,
    );

    const [primeiro, segundo] = await Promise.all([
      modulo.loadOfflinePackages(),
      modulo.loadOfflinePackages(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(primeiro).toBe(segundo);
    expect(primeiro.packages).toHaveLength(offlinePackages.packages.length);
  });
});
