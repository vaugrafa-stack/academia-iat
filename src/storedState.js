import { useEffect, useMemo, useRef, useState } from "react";
import { progressKey, validateProgress } from "./profile.js";

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
    return {
      state: initial,
      raw: null,
      blocked: false,
      issue: null,
    };
  }

  try {
    const clean = validateProgress(JSON.parse(raw));
    if (clean === null) {
      throw new Error("O registro salvo não contém um estado de progresso.");
    }
    return {
      state: { ...initial, ...clean },
      raw: null,
      blocked: false,
      issue: null,
    };
  } catch (error) {
    return {
      state: initial,
      raw,
      blocked: true,
      issue: {
        code: "STORAGE_CORRUPT",
        message:
          "O progresso salvo está incompatível ou corrompido. O valor original foi preservado e não será sobrescrito sem sua decisão.",
        detail: errorDetail(error, "Formato inválido."),
        recoveryAvailable: true,
      },
    };
  }
}

export function persistStoredState(storage, key, state) {
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

  try {
    storage.setItem(key, JSON.stringify(clean));
    return { ok: true, state: clean };
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
    writeDelay = 180,
  } = options;
  const storageTarget = useMemo(() => {
    try {
      return {
        storage: injectedStorage ?? globalThis.localStorage,
        issue: null,
      };
    } catch (error) {
      return { storage: null, issue: unavailableIssue(error, "read") };
    }
  }, [injectedStorage]);
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
        }
      : loadStoredState(
          storageTarget.storage,
          keyTarget.key,
          initialRef.current,
        );
  }

  const persistenceBlocked = useRef(loadRef.current.blocked);
  const invalidRaw = useRef(loadRef.current.raw);
  const [state, setState] = useState(loadRef.current.state);
  const [storageStatus, setStorageStatus] = useState(loadRef.current.issue);

  useEffect(() => {
    if (persistenceBlocked.current) return undefined;
    const timer = setTimeout(() => {
      const result = persistStoredState(
        storageTarget.storage,
        keyTarget.key,
        state,
      );
      setStorageStatus(result.ok ? null : result.issue);
    }, writeDelay);
    return () => clearTimeout(timer);
  }, [keyTarget.key, state, storageTarget.storage, writeDelay]);

  function resolveCorruptStorage(action) {
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
    );
    if (!result.ok) {
      setStorageStatus({ ...result.issue, recoveryAvailable: true });
      return;
    }
    persistenceBlocked.current = false;
    invalidRaw.current = null;
    setStorageStatus(null);
    setState(fresh);
  }

  return [state, setState, storageStatus, resolveCorruptStorage];
}
