import { useEffect, useState } from "react";
import mediaUrl from "./data/audiovisual-pilot-media.json?url";

const EMPTY_MEDIA = Object.freeze({
  kind: "MediaAssetCollection",
  items: Object.freeze([]),
});

export let audiovisualPilotMedia = EMPTY_MEDIA;
let mediaCache = null;
let mediaPromise = null;

export function validateRuntimeMediaCollection(collection) {
  if (collection?.kind !== "MediaAssetCollection" || !Array.isArray(collection.items)) {
    throw new Error("audiovisual-pilot-media.json: coleção inválida");
  }
  const lessonIds = new Set();
  for (const item of collection.items) {
    if (!item?.lessonId || lessonIds.has(item.lessonId)) {
      throw new Error("audiovisual-pilot-media.json: aula ausente ou duplicada");
    }
    lessonIds.add(item.lessonId);
    for (const name of ["video", "poster", "captions", "transcript", "visemes"]) {
      if (typeof item.assets?.[name]?.path !== "string") {
        throw new Error(`audiovisual-pilot-media.json: ativo ${name} inválido`);
      }
    }
    if (!Array.isArray(item.presenterWindows) || !Number.isFinite(item.durationSeconds)) {
      throw new Error("audiovisual-pilot-media.json: tempo do piloto inválido");
    }
  }
  return collection;
}

/** Manifesto dos pilotos. Só é buscado quando uma tela exibe uma aula. */
export function loadAudiovisualPilotMedia({ reload = false } = {}) {
  if (reload) {
    mediaCache = null;
    mediaPromise = null;
  }
  if (mediaCache) return Promise.resolve(mediaCache);
  if (!mediaPromise) {
    mediaPromise = fetch(mediaUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`audiovisual-pilot-media.json: HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(validateRuntimeMediaCollection)
      .then((collection) => {
        mediaCache = collection;
        audiovisualPilotMedia = collection;
        return collection;
      })
      .catch((error) => {
        mediaPromise = null;
        throw error;
      });
  }
  return mediaPromise;
}

export function useAudiovisualPilotMedia(active) {
  const [state, setState] = useState(() => ({
    collection: mediaCache,
    error: null,
  }));
  useEffect(() => {
    if (!active || state.collection) return undefined;
    let alive = true;
    loadAudiovisualPilotMedia().then(
      (collection) => alive && setState({ collection, error: null }),
      (error) => alive && setState({ collection: null, error }),
    );
    return () => {
      alive = false;
    };
  }, [active, state.collection]);
  return {
    collection: state.collection || audiovisualPilotMedia,
    error: state.error,
    loading: Boolean(active && !state.collection && !state.error),
  };
}

export function pilotAssetForLesson(lessonOrId, collection = audiovisualPilotMedia) {
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
  collection = audiovisualPilotMedia,
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
