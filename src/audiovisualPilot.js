import scripts from "./data/audiovisual-pilot-scripts.json";
import { audiovisualPilotMedia as media } from "./audiovisualPilotRuntime.js";
export {
  audiovisualPilotMedia,
  pilotAssetForLesson,
  resolveAudiovisualPilot,
} from "./audiovisualPilotRuntime.js";

export const EXPECTED_PILOT_LESSON_IDS = Object.freeze([
  "pop-section-018",
  "pop-section-059",
  "pop-section-069",
  "pop-section-094",
  "pop-section-108",
  "pop-section-134",
]);

const REQUIRED_SCENE_ROLES = Object.freeze([
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

export const audiovisualPilotScripts = scripts;

function unique(values) {
  return new Set(values).size === values.length;
}

function isSha256(value) {
  return /^[a-f0-9]{64}$/i.test(value || "");
}

/**
 * Valida o contrato LessonScript sem interpretar o mérito técnico. O gate
 * comprova estrutura, rastreabilidade e seleção; a revisão do conteúdo segue
 * sendo uma atividade editorial e técnica separada.
 */
export function validateLessonScriptCollection(collection = scripts, pop = null) {
  const errors = [];
  const pilots = Array.isArray(collection?.pilots) ? collection.pilots : [];
  const expected = [...EXPECTED_PILOT_LESSON_IDS].sort();
  const actual = pilots.map((pilot) => pilot.lessonId).sort();

  if (collection?.kind !== "LessonScriptCollection") {
    errors.push("kind deve ser LessonScriptCollection");
  }
  if (!isSha256(collection?.sourceDocument?.sha256)) {
    errors.push("a fonte principal precisa de SHA-256 válido");
  }
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`a seleção deve conter exatamente: ${expected.join(", ")}`);
  }
  if (!unique(pilots.map((pilot) => pilot.id))) {
    errors.push("IDs de roteiro duplicados");
  }
  if (!unique(pilots.map((pilot) => pilot.lessonId))) {
    errors.push("uma aula recebeu mais de um roteiro piloto");
  }

  const officialIds = new Set(
    (collection?.officialSources || []).map((source) => source.id),
  );
  const sectionIds = new Set((pop?.sections || []).map((section) => section.id));
  const paragraphSections = new Map(
    (pop?.blocks || [])
      .filter((block) => block.paragraph?.id)
      .map((block) => [block.paragraph.id, block.sectionId]),
  );
  const tableSections = new Map(
    (pop?.blocks || [])
      .filter((block) => block.tableId)
      .map((block) => [block.tableId, block.sectionId]),
  );
  for (const source of collection?.officialSources || []) {
    if (!/^https:\/\//.test(source.url || "")) {
      errors.push(`${source.id}: URL oficial inválida`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt || "")) {
      errors.push(`${source.id}: data de consulta ausente ou inválida`);
    }
    if (
      source.validUntil !== undefined
      && !/^\d{4}-\d{2}-\d{2}$/.test(source.validUntil || "")
    ) {
      errors.push(`${source.id}: validade da fonte ausente ou inválida`);
    }
    if (
      source.validUntil
      && new Date(`${source.validUntil}T23:59:59-03:00`).getTime() < Date.now()
    ) {
      errors.push(`${source.id}: fonte oficial vencida; confirme e atualize antes de publicar`);
    }
  }

  for (const pilot of pilots) {
    const refs = new Map((pilot.sourceRefs || []).map((ref) => [ref.id, ref]));
    const scenes = Array.isArray(pilot.scenes) ? pilot.scenes : [];
    const roles = new Set(scenes.map((scene) => scene.role));
    if (!pilot.objective || !pilot.prerequisite) {
      errors.push(`${pilot.id}: objetivo e pré-requisito são obrigatórios`);
    }
    if (!unique(scenes.map((scene) => scene.id))) {
      errors.push(`${pilot.id}: IDs de cena duplicados`);
    }
    for (const role of REQUIRED_SCENE_ROLES) {
      if (!roles.has(role)) errors.push(`${pilot.id}: cena ${role} ausente`);
    }
    for (const ref of refs.values()) {
      if (!ref.locator) {
        errors.push(`${pilot.id}/${ref.id}: localizador público ausente`);
      }
      if (ref.kind === "official" && !officialIds.has(ref.officialSourceId)) {
        errors.push(`${pilot.id}: fonte oficial ${ref.officialSourceId} não existe`);
      }
      if (ref.kind === "pop" && !ref.sectionId) {
        errors.push(`${pilot.id}: referência ao POP sem seção`);
      }
      if (ref.kind === "pop" && pop) {
        if (!sectionIds.has(ref.sectionId)) {
          errors.push(`${pilot.id}/${ref.id}: seção inexistente ${ref.sectionId}`);
        }
        for (const paragraphId of ref.paragraphIds || []) {
          if (paragraphSections.get(paragraphId) !== ref.sectionId) {
            errors.push(
              `${pilot.id}/${ref.id}: ${ref.sectionId} não contém ${paragraphId}`,
            );
          }
        }
        for (const tableId of ref.tableIds || []) {
          if (tableSections.get(tableId) !== ref.sectionId) {
            errors.push(`${pilot.id}/${ref.id}: ${ref.sectionId} não contém ${tableId}`);
          }
        }
      }
    }
    for (const scene of scenes) {
      if (!scene.speech || !scene.visualTitle || !scene.claimClass) {
        errors.push(`${pilot.id}/${scene.id}: fala, quadro e classe são obrigatórios`);
      }
      if (!Array.isArray(scene.citations) || scene.citations.length === 0) {
        errors.push(`${pilot.id}/${scene.id}: fala técnica sem fonte`);
      }
      for (const citation of scene.citations || []) {
        if (!refs.has(citation)) {
          errors.push(`${pilot.id}/${scene.id}: citação desconhecida ${citation}`);
        }
      }
    }
  }
  return errors;
}

export function validateMediaAssetCollection(collection = media) {
  const errors = [];
  const items = Array.isArray(collection?.items) ? collection.items : [];
  if (collection?.kind !== "MediaAssetCollection") {
    errors.push("kind deve ser MediaAssetCollection");
  }
  if (items.length && items.length !== EXPECTED_PILOT_LESSON_IDS.length) {
    errors.push("o manifesto gerado deve conter os seis pilotos");
  }
  for (const item of items) {
    if (!EXPECTED_PILOT_LESSON_IDS.includes(item.lessonId)) {
      errors.push(`${item.id}: aula fora da seleção piloto`);
    }
    if (!Number.isFinite(item.durationSeconds) || item.durationSeconds < 90) {
      errors.push(`${item.id}: duração menor que 90 segundos`);
    }
    if (item.wordsPerMinute < 130 || item.wordsPerMinute > 150) {
      errors.push(`${item.id}: ritmo fora de 130–150 palavras por minuto`);
    }
    for (const name of ["video", "poster", "captions", "transcript", "visemes"]) {
      const asset = item.assets?.[name];
      if (!asset?.path || !isSha256(asset.sha256) || asset.bytes <= 0) {
        errors.push(`${item.id}: ativo ${name} inválido`);
      }
    }
    if (!Array.isArray(item.presenterWindows) || item.presenterCoverage < 0.3 || item.presenterCoverage > 0.4) {
      errors.push(`${item.id}: presença do professor deve ficar entre 30% e 40%`);
    }
  }
  return errors;
}
