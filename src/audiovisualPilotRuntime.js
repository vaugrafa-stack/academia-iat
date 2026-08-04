import media from "./data/audiovisual-pilot-media.json";

export const audiovisualPilotMedia = media;

export function pilotAssetForLesson(lessonOrId, collection = media) {
  const lessonId = typeof lessonOrId === "string" ? lessonOrId : lessonOrId?.id;
  return (collection?.items || []).find((item) => item.lessonId === lessonId) || null;
}

function publicUrl(path, base) {
  if (!path) return null;
  const prefix = (base || "/").replace(/\/?$/, "/");
  return `${prefix}${String(path).replace(/^\//, "")}`;
}

/** Resolve os seis pilotos e preserva a mídia anterior nas demais aulas. */
export function resolveAudiovisualPilot(
  lesson,
  fallbackMedia,
  base = import.meta.env.BASE_URL || "/",
  collection = media,
) {
  const item = pilotAssetForLesson(lesson, collection);
  if (!item) return fallbackMedia;
  return {
    ...fallbackMedia,
    src: publicUrl(item.assets.video.path, base),
    poster: publicUrl(item.assets.poster.path, base),
    captions: publicUrl(item.assets.captions.path, base),
    transcript: publicUrl(item.assets.transcript.path, base),
    visemes: publicUrl(item.assets.visemes.path, base),
    presenterWindows: item.presenterWindows,
    title: item.title,
    propria: true,
    classification: "microaula-piloto",
    durationSeconds: item.durationSeconds,
  };
}
