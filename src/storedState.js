import { useEffect, useMemo, useRef, useState } from "react";
import { progressKey, validateProgress } from "./profile.js";
import {
  createStorageAdapter,
  createStorageEnvelope,
  decodeStorageValue,
} from "./storageContracts.js";

export const LEGACY_PROGRESS_KEY = "academia-iat-progress-v2";

export function createDefaultProgressState() {
  return {
    completed: [],
    bookmarks: [],
    notes: {},
    quizScores: {},
    labs: {},
    flows: {},
    checks: {},
    lastLesson: null,
    videoSeen: [],
    streak: 1,
    doneAt: {},
    lessonEvidence: {},
    lastVisit: null,
    its: {},
    itCasoAtual: null,
    diagnostico: {},
    // Historico por questao da revisao espacada: degrau, acertos, erros e a
    // data da proxima retomada. Precisa nascer aqui, e nao so quando a
    // primeira rodada grava, senao o campo fica indefinido e o seletor da
    // fila nunca encontra nada para reapresentar.
    revisao: {},
    autoaval: {},
    enquadra: { acertos: 0, total: 0 },
  };
}

function errorDetail(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function isQuotaError(error) {
  return (
    error?.name === "QuotaExceededError" ||
    error?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error?.code === 22 ||
    error?.code === 1014
  );
}

function unavailableIssue(error, operation) {
  if (isQuotaError(error)) {
    return {
      code: "STORAGE_QUOTA",
      message:
        "O navegador ficou sem espaço. As mudanças mais recentes podem não ter sido salvas.",
      detail: errorDetail(error, "Limite de armazenamento atingido."),
    };
  }
  return {
    code: "STORAGE_UNAVAILABLE",
    message:
      operation === "read"
        ? "O navegador não permitiu ler o progresso local. Nenhum dado existente será sobrescrito nesta sessão."
        : "O navegador não permitiu salvar o progresso desta sessão.",
    detail: errorDetail(error, "Armazenamento local indisponível."),
  };
}

function corruptIssue(error, raw) {
  return {
    code: "STORAGE_CORRUPT",
    message:
      "O progresso salvo está incompatível ou corrompido. O valor original foi preservado e não será sobrescrito sem sua decisão.",
    detail: errorDetail(error, "Formato inválido."),
    recoveryAvailable: true,
    raw,
  };
}

function conflictIssue(detail = "Outra aba alterou este mesmo progresso.") {
  return {
    code: "STORAGE_CONFLICT",
    message:
      "Há duas versões do progresso abertas. Nenhuma delas será sobrescrita automaticamente.",
    detail,
    conflictAvailable: true,
  };
}

function sameState(left, right) {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

export function loadStoredState(
  storage,
  key,
  initial = createDefaultProgressState(),
) {
  let raw = null;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    return {
      state: initial,
      raw: null,
      blocked: true,
      issue: unavailableIssue(error, "read"),
    };
  }

  if (raw === null) {
    const envelope = createStorageEnvelope(initial, {
      revision: 0,
      updatedAt: "1970-01-01T00:00:00.000Z",
    });
    return {
      state: initial,
      raw: null,
      blocked: false,
      issue: null,
      envelope,
      needsMigration: false,
    };
  }

  try {
    const decoded = decodeStorageValue(raw, validateProgress);
    const state = { ...initial, ...decoded.envelope.data };
    return {
      state,
      raw: null,
      blocked: false,
      issue: null,
      envelope: { ...decoded.envelope, data: state },
      needsMigration:
        decoded.migrated || !sameState(state, decoded.envelope.data),
    };
  } catch (error) {
    return {
      state: initial,
      raw,
      blocked: true,
      issue: corruptIssue(error, raw),
      envelope: null,
      needsMigration: false,
    };
  }
}

export function persistStoredState(
  storage,
  key,
  state,
  {
    expectedRevision,
    now = () => new Date().toISOString(),
    allowCorruptOverwrite = false,
  } = {},
) {
  let clean;
  try {
    clean = validateProgress(state);
    if (clean === null) {
      throw new Error("O estado atual não contém um registro de progresso.");
    }
  } catch (error) {
    return {
      ok: false,
      issue: {
        code: "STORAGE_STATE_INVALID",
        message:
          "O estado atual não passou pela validação e não foi gravado. O progresso salvo anteriormente foi preservado.",
        detail: errorDetail(error, "Estado de progresso inválido."),
      },
    };
  }

  let raw = null;
  let currentRevision = 0;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    return { ok: false, issue: unavailableIssue(error, "read") };
  }
  if (raw !== null) {
    try {
      currentRevision = decodeStorageValue(raw, validateProgress).envelope.revision;
    } catch (error) {
      if (!allowCorruptOverwrite) {
        return { ok: false, raw, issue: corruptIssue(error, raw) };
      }
    }
  }
  if (
    expectedRevision !== undefined &&
    expectedRevision !== null &&
    currentRevision !== expectedRevision
  ) {
    return {
      ok: false,
      raw,
      issue: conflictIssue(
        `A versão aberta era a revisão ${expectedRevision}, mas a revisão ${currentRevision} já está salva.`,
      ),
    };
  }

  let envelope;
  try {
    envelope = createStorageEnvelope(clean, {
      revision: currentRevision + 1,
      updatedAt: now(),
    });
    storage.setItem(key, JSON.stringify(envelope));
    return { ok: true, state: clean, envelope };
  } catch (error) {
    return { ok: false, issue: unavailableIssue(error, "write") };
  }
}

export function resolveProgressStorageKey(resolveKey = progressKey) {
  try {
    const key = resolveKey();
    if (typeof key !== "string" || !key) {
      throw new Error("A chave de progresso não foi identificada.");
    }
    return { key, issue: null };
  } catch (error) {
    return {
      key: null,
      issue: {
        code: "STORAGE_UNAVAILABLE",
        message:
          "Não foi possível identificar com segurança o registro de progresso deste perfil. Nenhum dado existente será sobrescrito nesta sessão.",
        detail: errorDetail(error, "Chave de progresso indisponível."),
      },
    };
  }
}

export function useStoredState(options = {}) {
  const {
    key: explicitKey,
    resolveKey = progressKey,
    storage: injectedStorage,
    eventTarget: injectedEventTarget,
    writeDelay = 180,
  } = options;
  const storageTarget = useMemo(() => {
    try {
      return {
        storage: createStorageAdapter(
          injectedStorage ?? globalThis.localStorage,
          injectedEventTarget ?? globalThis.window,
        ),
        issue: null,
      };
    } catch (error) {
      return { storage: null, issue: unavailableIssue(error, "read") };
    }
  }, [injectedEventTarget, injectedStorage]);
  const keyTarget = useMemo(
    () =>
      explicitKey
        ? { key: explicitKey, issue: null }
        : resolveProgressStorageKey(resolveKey),
    [explicitKey, resolveKey],
  );
  const initialRef = useRef(null);
  if (!initialRef.current) initialRef.current = createDefaultProgressState();
  const loadRef = useRef(null);
  if (!loadRef.current) {
    const bootIssue = storageTarget.issue || keyTarget.issue;
    loadRef.current = bootIssue
      ? {
          state: initialRef.current,
          raw: null,
          blocked: true,
          issue: bootIssue,
          envelope: null,
          needsMigration: false,
        }
      : loadStoredState(
          storageTarget.storage,
          keyTarget.key,
          initialRef.current,
        );
  }

  const persistenceBlocked = useRef(loadRef.current.blocked);
  const invalidRaw = useRef(loadRef.current.raw);
  const remoteRaw = useRef(null);
  const revision = useRef(loadRef.current.envelope?.revision ?? 0);
  const persistedState = useRef(loadRef.current.state);
  const migrationPending = useRef(loadRef.current.needsMigration);
  const [state, setState] = useState(loadRef.current.state);
  const [storageStatus, setStorageStatus] = useState(loadRef.current.issue);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (persistenceBlocked.current) return undefined;
    if (!migrationPending.current && sameState(state, persistedState.current)) {
      return undefined;
    }
    const timer = setTimeout(() => {
      const result = persistStoredState(
        storageTarget.storage,
        keyTarget.key,
        state,
        { expectedRevision: revision.current },
      );
      if (result.ok) {
        revision.current = result.envelope.revision;
        persistedState.current = result.state;
        migrationPending.current = false;
        setStorageStatus(null);
        return;
      }
      if (result.issue?.code === "STORAGE_CONFLICT") {
        persistenceBlocked.current = true;
        remoteRaw.current = result.raw;
      }
      setStorageStatus(result.issue);
    }, writeDelay);
    return () => clearTimeout(timer);
  }, [keyTarget.key, state, storageTarget.storage, writeDelay]);

  useEffect(() => {
    if (!storageTarget.storage || !keyTarget.key) return undefined;
    return storageTarget.storage.subscribe(keyTarget.key, ({ newValue }) => {
      if (newValue === null) {
        persistenceBlocked.current = true;
        remoteRaw.current = null;
        setStorageStatus(conflictIssue("O registro foi removido em outra aba."));
        return;
      }
      let incoming;
      try {
        incoming = decodeStorageValue(newValue, validateProgress).envelope;
      } catch (error) {
        persistenceBlocked.current = true;
        invalidRaw.current = newValue;
        remoteRaw.current = newValue;
        setStorageStatus({
          ...conflictIssue("A outra aba gravou um registro incompatível."),
          detail: errorDetail(error, "Formato inválido."),
        });
        return;
      }
      const incomingState = {
        ...initialRef.current,
        ...incoming.data,
      };
      if (incoming.revision < revision.current) return;
      if (
        incoming.revision === revision.current &&
        sameState(incomingState, persistedState.current)
      ) {
        return;
      }
      if (sameState(incomingState, stateRef.current)) {
        revision.current = incoming.revision;
        persistedState.current = incomingState;
        migrationPending.current = false;
        persistenceBlocked.current = false;
        remoteRaw.current = null;
        setStorageStatus(null);
        return;
      }
      const localDirty = !sameState(stateRef.current, persistedState.current);
      if (localDirty || incoming.revision === revision.current) {
        persistenceBlocked.current = true;
        remoteRaw.current = newValue;
        setStorageStatus(conflictIssue());
        return;
      }
      revision.current = incoming.revision;
      persistedState.current = incomingState;
      migrationPending.current = false;
      setState(incomingState);
      setStorageStatus(null);
    });
  }, [keyTarget.key, storageTarget.storage]);

  function resolveCorruptStorage(action) {
    if (action === "use-remote") {
      try {
        const incoming = remoteRaw.current === null
          ? createStorageEnvelope(createDefaultProgressState(), {
              revision: 0,
              updatedAt: "1970-01-01T00:00:00.000Z",
            })
          : decodeStorageValue(remoteRaw.current, validateProgress).envelope;
        const incomingState = {
          ...initialRef.current,
          ...incoming.data,
        };
        revision.current = incoming.revision;
        persistedState.current = incomingState;
        migrationPending.current = false;
        persistenceBlocked.current = false;
        invalidRaw.current = null;
        remoteRaw.current = null;
        setState(incomingState);
        setStorageStatus(null);
      } catch (error) {
        setStorageStatus(corruptIssue(error, remoteRaw.current));
      }
      return;
    }
    if (action === "keep-local") {
      let expectedRevision = 0;
      try {
        const latestRaw = storageTarget.storage.getItem(keyTarget.key);
        expectedRevision = latestRaw === null
          ? 0
          : decodeStorageValue(latestRaw, validateProgress).envelope.revision;
      } catch (error) {
        setStorageStatus(corruptIssue(error, remoteRaw.current));
        return;
      }
      const result = persistStoredState(
        storageTarget.storage,
        keyTarget.key,
        stateRef.current,
        { expectedRevision },
      );
      if (!result.ok) {
        setStorageStatus(result.issue);
        return;
      }
      revision.current = result.envelope.revision;
      persistedState.current = result.state;
      migrationPending.current = false;
      persistenceBlocked.current = false;
      remoteRaw.current = null;
      setStorageStatus(null);
      return;
    }
    if (action === "download") {
      try {
        const blob = new Blob([invalidRaw.current || ""], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "academia-iat-progresso-recuperacao.json";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        setStorageStatus({
          ...unavailableIssue(error, "read"),
          message:
            "Não foi possível baixar a cópia de recuperação. O valor original continua preservado no navegador.",
          recoveryAvailable: true,
        });
      }
      return;
    }
    if (action !== "reset") return;
    if (
      !window.confirm(
        "Descartar o progresso incompatível e começar um registro local novo?",
      )
    )
      return;
    const fresh = createDefaultProgressState();
    const result = persistStoredState(
      storageTarget.storage,
      keyTarget.key,
      fresh,
      { allowCorruptOverwrite: true },
    );
    if (!result.ok) {
      setStorageStatus({ ...result.issue, recoveryAvailable: true });
      return;
    }
    persistenceBlocked.current = false;
    invalidRaw.current = null;
    remoteRaw.current = null;
    revision.current = result.envelope.revision;
    persistedState.current = result.state;
    migrationPending.current = false;
    setStorageStatus(null);
    setState(fresh);
  }

  return [state, setState, storageStatus, resolveCorruptStorage];
}
