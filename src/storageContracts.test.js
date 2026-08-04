import { describe, expect, it, vi } from "vitest";
import {
  LOCAL_STATE_SCHEMA_VERSION,
  StorageAdapter,
  StorageContractError,
  createStorageEnvelope,
  decodeStorageValue,
  validateStorageEnvelope,
} from "./storageContracts.js";

const validate = (value) => {
  if (!value || !Array.isArray(value.completed)) throw new Error("completed inválido");
  return { ...value, completed: [...value.completed] };
};

describe("envelope local versionado", () => {
  it("valida {schemaVersion, revision, updatedAt, data}", () => {
    const envelope = createStorageEnvelope({ completed: [] }, {
      revision: 3,
      updatedAt: "2026-08-04T12:00:00.000Z",
    });
    expect(validateStorageEnvelope(envelope, validate)).toEqual({
      schemaVersion: LOCAL_STATE_SCHEMA_VERSION,
      revision: 3,
      updatedAt: "2026-08-04T12:00:00.000Z",
      data: { completed: [] },
    });
  });

  it("lê o formato legado como revisão zero sem reescrever o valor", () => {
    const raw = JSON.stringify({ completed: ["aula-1"] });
    const decoded = decodeStorageValue(raw, validate);
    expect(decoded).toMatchObject({ migrated: true, envelope: { revision: 0, data: { completed: ["aula-1"] } } });
    expect(raw).toBe('{"completed":["aula-1"]}');
  });

  it("recusa versão futura e JSON corrompido", () => {
    const future = JSON.stringify({
      schemaVersion: LOCAL_STATE_SCHEMA_VERSION + 1,
      revision: 1,
      updatedAt: "2026-08-04T12:00:00.000Z",
      data: { completed: [] },
    });
    expect(() => decodeStorageValue(future, validate)).toThrowError(StorageContractError);
    expect(() => decodeStorageValue(future, validate)).toThrow(/versão mais nova/);
    expect(() => decodeStorageValue('{"completed":', validate)).toThrow(/JSON válido/);
  });
});

describe("StorageAdapter", () => {
  it("encaminha operações e filtra eventos pela chave", () => {
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key),
    };
    const events = new EventTarget();
    const adapter = new StorageAdapter(storage, events);
    const listener = vi.fn();
    const unsubscribe = adapter.subscribe("progresso", listener);
    adapter.setItem("progresso", "valor");
    expect(adapter.getItem("progresso")).toBe("valor");

    const ignored = new Event("storage");
    Object.defineProperties(ignored, { key: { value: "outra" }, newValue: { value: "x" } });
    events.dispatchEvent(ignored);
    const accepted = new Event("storage");
    Object.defineProperties(accepted, {
      key: { value: "progresso" },
      oldValue: { value: "anterior" },
      newValue: { value: "novo" },
    });
    events.dispatchEvent(accepted);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ key: "progresso", newValue: "novo" }));
    unsubscribe();
  });
});
