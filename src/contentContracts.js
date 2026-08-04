const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const SCENE_KINDS = new Set([
  "problem",
  "objective",
  "vocabulary",
  "explanation",
  "example",
  "common-error",
  "decision-pause",
  "feedback",
  "summary",
  "next-step",
]);
const MEDIA_KINDS = new Set([
  "audio",
  "video",
  "poster",
  "captions",
  "transcript",
  "image",
  "animation",
]);
const EVIDENCE_STATES = new Set([
  "seen",
  "practiced",
  "objective-met",
  "reviewed",
  "externally-assessed",
]);
const REVIEW_STATES = new Set(["pending", "approved", "changes-requested", "not-applicable"]);

export class ContractValidationError extends Error {
  constructor(contract, field, message) {
    super(`${contract}.${field}: ${message}`);
    this.name = "ContractValidationError";
    this.contract = contract;
    this.field = field;
  }
}

function fail(contract, field, message) {
  throw new ContractValidationError(contract, field, message);
}

function record(value, contract, field = "value") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(contract, field, "deve ser um objeto.");
  }
  return value;
}

function text(value, contract, field, { optional = false, max = 20_000 } = {}) {
  if (value === undefined || value === null) {
    if (optional) return "";
    fail(contract, field, "é obrigatório.");
  }
  if (typeof value !== "string") fail(contract, field, "deve ser texto.");
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (!clean && !optional) fail(contract, field, "não pode ficar vazio.");
  if (clean.length > max) fail(contract, field, `excede ${max} caracteres.`);
  return clean;
}

function integer(value, contract, field, { min = 0, optional = false } = {}) {
  if (value === undefined && optional) return undefined;
  if (!Number.isInteger(value) || value < min) {
    fail(contract, field, `deve ser um inteiro maior ou igual a ${min}.`);
  }
  return value;
}

function boolean(value, contract, field, optional = false) {
  if (value === undefined && optional) return undefined;
  if (typeof value !== "boolean") fail(contract, field, "deve ser verdadeiro ou falso.");
  return value;
}

function stringList(value, contract, field, { min = 0, max = 500 } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    fail(contract, field, `deve ser uma lista com ${min} a ${max} itens.`);
  }
  return value.map((item, index) => text(item, contract, `${field}[${index}]`, { max: 1_000 }));
}

function isoDate(value, contract, field) {
  const clean = text(value, contract, field, { max: 64 });
  if (!Number.isFinite(Date.parse(clean))) fail(contract, field, "deve ser uma data ISO válida.");
  return clean;
}

function url(value, contract, field) {
  const clean = text(value, contract, field, { max: 2_048 });
  if (!/^(?:https?:\/\/|\/|\.\/|\.\.\/)/.test(clean)) {
    fail(contract, field, "deve ser uma URL HTTP(S) ou um caminho relativo/absoluto do site.");
  }
  return clean;
}

function cloneJson(value, contract, field = "value", depth = 0) {
  if (depth > 20) fail(contract, field, "possui níveis demais.");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(contract, field, "contém número inválido.");
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 5_000) fail(contract, field, "possui itens demais.");
    return value.map((item, index) => cloneJson(item, contract, `${field}[${index}]`, depth + 1));
  }
  record(value, contract, field);
  const entries = Object.entries(value);
  if (entries.length > 5_000) fail(contract, field, "possui campos demais.");
  const output = {};
  for (const [key, item] of entries) {
    if (BLOCKED_KEYS.has(key)) continue;
    output[key] = cloneJson(item, contract, `${field}.${key}`, depth + 1);
  }
  return output;
}

function validateReference(value, contract, field) {
  record(value, contract, field);
  const classification = text(value.classification, contract, `${field}.classification`, { max: 48 });
  const allowed = new Set(["pop", "official-source", "didactic-explanation", "synthetic-case", "unvalidated-inference"]);
  if (!allowed.has(classification)) fail(contract, `${field}.classification`, "possui classificação desconhecida.");
  return {
    id: text(value.id, contract, `${field}.id`, { max: 180 }),
    classification,
    locator: text(value.locator, contract, `${field}.locator`, { max: 500 }),
    title: text(value.title, contract, `${field}.title`, { optional: true, max: 500 }),
  };
}

function validateTerms(value, contract) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) {
    fail(contract, "termsPronunciations", "deve conter entre 1 e 100 termos.");
  }
  return value.map((item, index) => {
    const field = `termsPronunciations[${index}]`;
    record(item, contract, field);
    return {
      term: text(item.term, contract, `${field}.term`, { max: 240 }),
      pronunciation: text(item.pronunciation, contract, `${field}.pronunciation`, { optional: true, max: 500 }),
      meaning: text(item.meaning, contract, `${field}.meaning`, { optional: true, max: 1_000 }),
    };
  });
}

function validateRelations(value, contract) {
  record(value, contract, "relations");
  return {
    cases: stringList(value.cases || [], contract, "relations.cases"),
    flows: stringList(value.flows || [], contract, "relations.flows"),
    maps: stringList(value.maps || [], contract, "relations.maps"),
    tools: stringList(value.tools || [], contract, "relations.tools"),
  };
}

function validateReviewStatus(value, contract) {
  record(value, contract, "reviewStatus");
  const result = {};
  for (const field of ["editorial", "technical", "normative"]) {
    const status = text(value[field], contract, `reviewStatus.${field}`, { max: 40 });
    if (!REVIEW_STATES.has(status)) fail(contract, `reviewStatus.${field}`, "possui estado de revisão desconhecido.");
    result[field] = status;
  }
  result.reviewedAt = value.reviewedAt
    ? isoDate(value.reviewedAt, contract, "reviewStatus.reviewedAt")
    : "";
  return result;
}

export function validateLessonPackage(value) {
  const contract = "LessonPackage";
  record(value, contract);
  const references = Array.isArray(value.references)
    ? value.references.map((item, index) => validateReference(item, contract, `references[${index}]`))
    : fail(contract, "references", "deve ser uma lista.");
  const mediaAssetIds = stringList(value.mediaAssetIds || [], contract, "mediaAssetIds");
  return {
    schemaVersion: integer(value.schemaVersion, contract, "schemaVersion", { min: 1 }),
    id: text(value.id, contract, "id", { max: 180 }),
    moduleId: text(value.moduleId, contract, "moduleId", { max: 80 }),
    title: text(value.title, contract, "title", { max: 500 }),
    objective: text(value.objective, contract, "objective", { max: 2_000 }),
    prerequisites: stringList(value.prerequisites || [], contract, "prerequisites"),
    references,
    essentials: stringList(value.essentials, contract, "essentials", { min: 3, max: 12 }),
    boundaries: stringList(value.boundaries, contract, "boundaries", { min: 1, max: 20 }),
    commonErrors: stringList(value.commonErrors, contract, "commonErrors", { min: 1, max: 20 }),
    example: cloneJson(record(value.example, contract, "example"), contract, "example"),
    activeRecall: cloneJson(record(value.activeRecall, contract, "activeRecall"), contract, "activeRecall"),
    practice: cloneJson(record(value.practice, contract, "practice"), contract, "practice"),
    transferPractice: cloneJson(record(value.transferPractice, contract, "transferPractice"), contract, "transferPractice"),
    assessment: cloneJson(record(value.assessment, contract, "assessment"), contract, "assessment"),
    termsPronunciations: validateTerms(value.termsPronunciations, contract),
    relations: validateRelations(value.relations, contract),
    reviewStatus: validateReviewStatus(value.reviewStatus, contract),
    scriptId: text(value.scriptId, contract, "scriptId", { optional: true, max: 180 }),
    mediaAssetIds,
  };
}

export function validateLessonScript(value) {
  const contract = "LessonScript";
  record(value, contract);
  if (!Array.isArray(value.scenes) || value.scenes.length < 1 || value.scenes.length > 100) {
    fail(contract, "scenes", "deve conter entre 1 e 100 cenas.");
  }
  const scenes = value.scenes.map((scene, index) => {
    const field = `scenes[${index}]`;
    record(scene, contract, field);
    const kind = text(scene.kind, contract, `${field}.kind`, { max: 40 });
    if (!SCENE_KINDS.has(kind)) fail(contract, `${field}.kind`, "possui tipo desconhecido.");
    const sourceRefs = stringList(scene.sourceRefs || [], contract, `${field}.sourceRefs`);
    const technicalClaim = boolean(scene.technicalClaim, contract, `${field}.technicalClaim`, true) || false;
    if (technicalClaim && sourceRefs.length === 0) {
      fail(contract, `${field}.sourceRefs`, "é obrigatório em fala técnica.");
    }
    return {
      id: text(scene.id, contract, `${field}.id`, { max: 180 }),
      kind,
      narration: text(scene.narration, contract, `${field}.narration`, { max: 8_000 }),
      technicalClaim,
      sourceRefs,
      visualNotes: text(scene.visualNotes, contract, `${field}.visualNotes`, { optional: true, max: 4_000 }),
      durationMs: integer(scene.durationMs, contract, `${field}.durationMs`, { min: 0, optional: true }),
    };
  });
  const sceneIds = scenes.map((scene) => scene.id);
  if (new Set(sceneIds).size !== sceneIds.length) fail(contract, "scenes", "contém identificadores repetidos.");
  return {
    schemaVersion: integer(value.schemaVersion, contract, "schemaVersion", { min: 1 }),
    id: text(value.id, contract, "id", { max: 180 }),
    lessonId: text(value.lessonId, contract, "lessonId", { max: 180 }),
    locale: text(value.locale, contract, "locale", { max: 20 }),
    voiceProfile: text(value.voiceProfile, contract, "voiceProfile", { optional: true, max: 180 }),
    scenes,
  };
}

export function validateMediaAsset(value) {
  const contract = "MediaAsset";
  record(value, contract);
  const kind = text(value.kind, contract, "kind", { max: 40 });
  if (!MEDIA_KINDS.has(kind)) fail(contract, "kind", "possui tipo desconhecido.");
  const assetUrl = url(value.url, contract, "url");
  const sourceUrl = value.sourceUrl
    ? url(value.sourceUrl, contract, "sourceUrl")
    : "";
  const sha256 = text(value.sha256, contract, "sha256", { optional: true, max: 64 });
  if (sha256 && !/^[a-f0-9]{64}$/i.test(sha256)) {
    fail(contract, "sha256", "deve conter exatamente 64 caracteres hexadecimais.");
  }
  const license = text(value.license, contract, "license", { optional: true, max: 500 });
  const provenance = text(value.provenance, contract, "provenance", { max: 1_000 });
  if (/^https?:\/\//.test(assetUrl) && (!sourceUrl || !license)) {
    fail(contract, "provenance", "mídia externa exige sourceUrl e licença explícita.");
  }
  return {
    schemaVersion: integer(value.schemaVersion, contract, "schemaVersion", { min: 1 }),
    id: text(value.id, contract, "id", { max: 180 }),
    kind,
    url: assetUrl,
    sourceUrl,
    provenance,
    mimeType: text(value.mimeType, contract, "mimeType", { max: 120 }),
    locale: text(value.locale, contract, "locale", { optional: true, max: 20 }),
    durationMs: integer(value.durationMs, contract, "durationMs", { min: 0, optional: true }),
    sha256: sha256.toLowerCase(),
    license,
  };
}

export function validateEvidenceRecord(value, { lessonId = "", allowPartial = true } = {}) {
  const contract = "EvidenceRecord";
  record(value, contract);
  const cleanLessonId = text(value.lessonId ?? lessonId, contract, "lessonId", {
    optional: allowPartial,
    max: 180,
  });
  const state = value.state === undefined && allowPartial
    ? ""
    : text(value.state, contract, "state", { max: 40 });
  if (state && !EVIDENCE_STATES.has(state)) fail(contract, "state", "possui estado de aprendizagem desconhecido.");
  if (value.response !== undefined && typeof value.response !== "string") fail(contract, "response", "deve ser texto.");
  const criteria = value.criteria === undefined
    ? []
    : Array.isArray(value.criteria) && value.criteria.every((item) => Number.isInteger(item) && item >= 0)
      ? [...new Set(value.criteria)]
      : fail(contract, "criteria", "deve ser uma lista de inteiros não negativos.");
  const objectiveSelected = value.objectiveSelected;
  if (objectiveSelected !== undefined && objectiveSelected !== null && (!Number.isInteger(objectiveSelected) || objectiveSelected < 0)) {
    fail(contract, "objectiveSelected", "deve ser nulo ou um inteiro não negativo.");
  }
  return {
    ...cloneJson(value, contract),
    ...(cleanLessonId ? { lessonId: cleanLessonId } : {}),
    ...(state ? { state } : {}),
    ...(value.response !== undefined ? { response: value.response } : {}),
    ...(value.criteria !== undefined ? { criteria } : {}),
    ...(value.objectiveCorrect !== undefined
      ? { objectiveCorrect: boolean(value.objectiveCorrect, contract, "objectiveCorrect") }
      : {}),
    ...(value.objectiveAttempts !== undefined
      ? { objectiveAttempts: integer(value.objectiveAttempts, contract, "objectiveAttempts", { min: 0 }) }
      : {}),
  };
}

export function validateContentManifest(value) {
  const contract = "ContentManifest";
  record(value, contract);
  const lessonPackages = (Array.isArray(value.lessonPackages) ? value.lessonPackages : fail(contract, "lessonPackages", "deve ser uma lista."))
    .map(validateLessonPackage);
  const lessonScripts = (Array.isArray(value.lessonScripts) ? value.lessonScripts : fail(contract, "lessonScripts", "deve ser uma lista."))
    .map(validateLessonScript);
  const mediaAssets = (Array.isArray(value.mediaAssets) ? value.mediaAssets : fail(contract, "mediaAssets", "deve ser uma lista."))
    .map(validateMediaAsset);
  for (const [field, items] of [["lessonPackages", lessonPackages], ["lessonScripts", lessonScripts], ["mediaAssets", mediaAssets]]) {
    const ids = items.map((item) => item.id);
    if (new Set(ids).size !== ids.length) fail(contract, field, "contém identificadores repetidos.");
  }
  const scriptIds = new Set(lessonScripts.map((script) => script.id));
  const assetIds = new Set(mediaAssets.map((asset) => asset.id));
  const packagesById = new Map(lessonPackages.map((lesson) => [lesson.id, lesson]));
  const scriptsById = new Map(lessonScripts.map((script) => [script.id, script]));
  for (const lesson of lessonPackages) {
    if (lesson.scriptId && !scriptIds.has(lesson.scriptId)) fail(contract, `lessonPackages.${lesson.id}.scriptId`, "não existe no manifesto.");
    if (lesson.scriptId && scriptsById.get(lesson.scriptId)?.lessonId !== lesson.id) {
      fail(contract, `lessonPackages.${lesson.id}.scriptId`, "aponta para roteiro de outra aula.");
    }
    for (const assetId of lesson.mediaAssetIds) {
      if (!assetIds.has(assetId)) fail(contract, `lessonPackages.${lesson.id}.mediaAssetIds`, `referencia o ativo inexistente ${assetId}.`);
    }
  }
  for (const script of lessonScripts) {
    const lesson = packagesById.get(script.lessonId);
    if (!lesson) fail(contract, `lessonScripts.${script.id}.lessonId`, "não existe entre os pacotes de aula.");
    const referenceIds = new Set(lesson.references.map((reference) => reference.id));
    for (const scene of script.scenes) {
      for (const sourceRef of scene.sourceRefs) {
        if (!referenceIds.has(sourceRef)) {
          fail(contract, `lessonScripts.${script.id}.scenes.${scene.id}.sourceRefs`, `referencia a fonte inexistente ${sourceRef}.`);
        }
      }
    }
  }
  return {
    schemaVersion: integer(value.schemaVersion, contract, "schemaVersion", { min: 1 }),
    revision: integer(value.revision, contract, "revision", { min: 1 }),
    generatedAt: isoDate(value.generatedAt, contract, "generatedAt"),
    sourceId: text(value.sourceId, contract, "sourceId", { max: 180 }),
    lessonPackages,
    lessonScripts,
    mediaAssets,
  };
}

export function assertStorageAdapter(value) {
  const contract = "StorageAdapter";
  record(value, contract);
  for (const method of ["getItem", "setItem", "removeItem", "subscribe"]) {
    if (typeof value[method] !== "function") fail(contract, method, "deve ser uma função.");
  }
  return value;
}
