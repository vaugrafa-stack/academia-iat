import { assertStorageAdapter } from "./contentContracts.js";

export const LOCAL_STATE_SCHEMA_VERSION = 1;
const EARLIEST_MIGRATION_DATE = "1970-01-01T00:00:00.000Z";

export class StorageContractError extends Error {
  constructor(code, message, cause) {
    super(message, { cause });
    this.name = "StorageContractError";
    this.code = code;
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validIsoDate(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function cloneEnvelope(envelope) {
  return {
    schemaVersion: envelope.schemaVersion,
    revision: envelope.revision,
    updatedAt: envelope.updatedAt,
    data: envelope.data,
  };
}

export function isStorageEnvelope(value) {
  return isRecord(value)
    && Object.hasOwn(value, "schemaVersion")
    && Object.hasOwn(value, "revision")
    && Object.hasOwn(value, "updatedAt")
    && Object.hasOwn(value, "data");
}

export function createStorageEnvelope(
  data,
  {
    revision = 1,
    updatedAt = new Date().toISOString(),
    schemaVersion = LOCAL_STATE_SCHEMA_VERSION,
  } = {},
) {
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new StorageContractError("STORAGE_SCHEMA_INVALID", "A versão do registro local é inválida.");
  }
  if (schemaVersion > LOCAL_STATE_SCHEMA_VERSION) {
    throw new StorageContractError("STORAGE_SCHEMA_FUTURE", "O registro local foi criado por uma versão mais nova da plataforma.");
  }
  if (!Number.isInteger(revision) || revision < 0) {
    throw new StorageContractError("STORAGE_REVISION_INVALID", "A revisão do registro local é inválida.");
  }
  if (!validIsoDate(updatedAt)) {
    throw new StorageContractError("STORAGE_DATE_INVALID", "A data do registro local é inválida.");
  }
  return { schemaVersion, revision, updatedAt, data };
}

export function validateStorageEnvelope(value, validateData = (data) => data) {
  if (!isStorageEnvelope(value)) {
    throw new StorageContractError("STORAGE_ENVELOPE_INVALID", "O registro local não possui o envelope esperado.");
  }
  const envelope = createStorageEnvelope(value.data, {
    schemaVersion: value.schemaVersion,
    revision: value.revision,
    updatedAt: value.updatedAt,
  });
  let data;
  try {
    data = validateData(envelope.data);
  } catch (error) {
    throw new StorageContractError("STORAGE_DATA_INVALID", error?.message || "Os dados do registro local são inválidos.", error);
  }
  if (data === null || data === undefined) {
    throw new StorageContractError("STORAGE_DATA_INVALID", "O registro local não contém dados utilizáveis.");
  }
  return { ...cloneEnvelope(envelope), data };
}

export function decodeStorageValue(raw, validateData = (data) => data) {
  if (typeof raw !== "string") {
    throw new StorageContractError("STORAGE_JSON_INVALID", "O registro local não é texto JSON.");
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new StorageContractError("STORAGE_JSON_INVALID", "O registro local não contém JSON válido.", error);
  }
  if (isStorageEnvelope(parsed)) {
    return {
      envelope: validateStorageEnvelope(parsed, validateData),
      migrated: false,
    };
  }

  // Formato anterior: o objeto de progresso era salvo diretamente. Ele é
  // aceito como revisão zero, mas o valor original não é alterado na leitura.
  let data;
  try {
    data = validateData(parsed);
  } catch (error) {
    throw new StorageContractError("STORAGE_DATA_INVALID", error?.message || "Os dados legados são inválidos.", error);
  }
  if (data === null || data === undefined) {
    throw new StorageContractError("STORAGE_DATA_INVALID", "O registro legado não contém dados utilizáveis.");
  }
  return {
    envelope: createStorageEnvelope(data, {
      revision: 0,
      updatedAt: EARLIEST_MIGRATION_DATE,
    }),
    migrated: true,
  };
}

export class StorageAdapter {
  constructor(storage, eventTarget = globalThis.window) {
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function" || typeof storage.removeItem !== "function") {
      throw new StorageContractError("STORAGE_ADAPTER_INVALID", "O mecanismo de armazenamento não implementa a interface necessária.");
    }
    this.storage = storage;
    this.eventTarget = eventTarget;
  }

  getItem(key) {
    return this.storage.getItem(key);
  }

  setItem(key, value) {
    this.storage.setItem(key, value);
  }

  removeItem(key) {
    this.storage.removeItem(key);
  }

  subscribe(key, listener) {
    if (!this.eventTarget || typeof this.eventTarget.addEventListener !== "function") return () => {};
    const onStorage = (event) => {
      if (event?.key !== key) return;
      if (event.storageArea && event.storageArea !== this.storage) return;
      listener({
        key,
        oldValue: event.oldValue ?? null,
        newValue: event.newValue ?? null,
        url: event.url || "",
      });
    };
    this.eventTarget.addEventListener("storage", onStorage);
    return () => this.eventTarget.removeEventListener("storage", onStorage);
  }
}

export function createStorageAdapter(storage = globalThis.localStorage, eventTarget = globalThis.window) {
  if (storage instanceof StorageAdapter) return storage;
  return assertStorageAdapter(new StorageAdapter(storage, eventTarget));
}
