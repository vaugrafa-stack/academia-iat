import React, { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import "./videoLearningStage.css";

const PUBLIC_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
const PROFESSOR_SPRITE =
  `${PUBLIC_BASE}media/learning-stage/professor-visemes-v2.webp`;
const PROFESSOR_SPRITE_FALLBACK =
  `${PUBLIC_BASE}media/learning-stage/professor-sprite.webp`;
const THEMATIC_ATLAS =
  `${PUBLIC_BASE}media/learning-stage/thematic-atlas.webp`;
const PROFESSOR_PREFERENCE = "academia-iat-video-professor";
const VISUAL_VISEME_RATE = 12;
const VISUAL_VISEME_STEP = 1 / VISUAL_VISEME_RATE;
const VISEME_BLEND_SECONDS = 0.065;
const MEANINGFUL_NEUTRAL_SECONDS = 0.14;

// A grade é uma aproximação editorial. No palco, formas muito próximas são
// agrupadas para evitar uma sucessão exagerada de poses.
const RESTRAINED_VISEMES = [0, 1, 2, 3, 4, 4, 6, 7, 10, 9, 10, 0];
const SPRITE_FRAME_POSITIONS = [
  ["0%", "0%"],
  ["50%", "0%"],
  ["100%", "0%"],
  ["0%", "33.333%"],
  ["50%", "33.333%"],
  ["100%", "33.333%"],
  ["0%", "66.667%"],
  ["50%", "66.667%"],
  ["100%", "66.667%"],
  ["0%", "100%"],
  ["50%", "100%"],
  ["100%", "100%"],
];
const FALLBACK_FRAME_POSITIONS = [
  "0%", "0%", "33.333%", "100%", "66.667%", "66.667%",
  "33.333%", "33.333%", "66.667%", "66.667%", "33.333%", "0%",
];
const PAUSE_MARKS = /[.,;:!?\-]/;

const TRACK_THEMES = {
  m00: "office",
  m01: "office",
  m02: "office",
  m03: "dam",
  m04: "dam",
  m05: "dam",
  m06: "dam",
  m07: "dam",
  m08: "field",
  m09: "map",
  m10: "field",
  m11: "field",
  m12: "office",
  m13: "office",
  m14: "office",
  m15: "map",
  m16: "office",
};

const audioGraphs = new WeakMap();

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Converte uma janela PCM de Web Audio (0..255, centro 128) em intensidade
 * normalizada. A função é pura para que a sincronização possa ser testada sem
 * depender de um dispositivo de áudio.
 */
export function computeNarrationLevel(samples) {
  if (!samples?.length) return 0;
  let energy = 0;
  for (const sample of samples) {
    const centered = (sample - 128) / 128;
    energy += centered * centered;
  }
  const rms = Math.sqrt(energy / samples.length);
  return clamp((rms - 0.012) * 8.5);
}

/**
 * Movimento discreto usado somente quando Web Audio não está disponível.
 * Não acessa microfone nem infere conteúdo: acompanha o relógio do próprio
 * vídeo para que a figura não fique congelada durante a narração.
 */
export function fallbackNarrationLevel(currentTime) {
  if (!Number.isFinite(currentTime)) return 0;
  const wave = Math.sin(currentTime * 12.7) * 0.5 + 0.5;
  return wave > 0.33 ? clamp((wave - 0.24) * 1.25) : 0;
}

export function mouthFrameForLevel(level) {
  if (level < 0.08) return 0;
  if (level < 0.34) return 1;
  if (level < 0.67) return 2;
  return 3;
}

function visemeEntryAtTime(entries, currentTime) {
  if (!Array.isArray(entries) || !entries.length || !Number.isFinite(currentTime)) {
    return null;
  }
  let low = 0;
  let high = entries.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const entry = entries[middle];
    if (currentTime < entry.start) high = middle - 1;
    else if (currentTime >= entry.end) low = middle + 1;
    else return { entry, index: middle };
  }
  return null;
}

/** Retorna o quadro de boca vigente no relógio do próprio vídeo. */
export function visemeAtTime(entries, currentTime) {
  const match = visemeEntryAtTime(entries, currentTime);
  return Number.isInteger(match?.entry?.viseme)
    ? clamp(match.entry.viseme, 0, 11)
    : 0;
}

function restrainedVisemeForEntry(entries, match) {
  if (!match) return 0;
  const { entry, index } = match;
  const raw = Number.isInteger(entry.viseme) ? clamp(entry.viseme, 0, 11) : 0;
  const restrained = RESTRAINED_VISEMES[raw] ?? 0;
  if (restrained !== 0) return restrained;

  const duration = Math.max(0, Number(entry.end) - Number(entry.start));
  const phonemes = typeof entry.phonemes === "string" ? entry.phonemes : "";
  const isRealPause = raw === 11
    || duration >= MEANINGFUL_NEUTRAL_SECONDS
    || PAUSE_MARKS.test(phonemes);
  if (isRealPause) return 0;

  // Um espaço muito curto entre palavras não deve fechar completamente a boca.
  // Mantemos a articulação anterior até a próxima amostra visual.
  for (let cursor = index - 1; cursor >= Math.max(0, index - 3); cursor -= 1) {
    const previousRaw = Number.isInteger(entries[cursor]?.viseme)
      ? clamp(entries[cursor].viseme, 0, 11)
      : 0;
    const previous = RESTRAINED_VISEMES[previousRaw] ?? 0;
    if (previous) return previous;
  }
  return 0;
}

/**
 * Limita a cadência visual da boca a 12 amostras por segundo.
 * A fonte temporal continua sendo currentTime; não se trata de alinhamento
 * fonético medido.
 */
export function naturalVisemeAtTime(entries, currentTime) {
  if (!Number.isFinite(currentTime) || currentTime < 0) return 0;
  const sampleTime = Math.floor(currentTime * VISUAL_VISEME_RATE) / VISUAL_VISEME_RATE;
  return restrainedVisemeForEntry(entries, visemeEntryAtTime(entries, sampleTime));
}

/** Retorna dois quadros e uma mistura curta, sempre derivada do relógio do vídeo. */
export function naturalVisemePoseAtTime(entries, currentTime) {
  if (!Number.isFinite(currentTime) || currentTime < 0) {
    return { current: 0, previous: 0, blend: 1 };
  }
  const bucket = Math.floor(currentTime * VISUAL_VISEME_RATE);
  const bucketStart = bucket * VISUAL_VISEME_STEP;
  const current = naturalVisemeAtTime(entries, bucketStart);
  const previous = bucket > 0
    ? naturalVisemeAtTime(entries, (bucket - 1) * VISUAL_VISEME_STEP)
    : current;
  if (current === previous) return { current, previous, blend: 1 };
  const linear = clamp((currentTime - bucketStart) / VISEME_BLEND_SECONDS);
  const blend = linear * linear * (3 - 2 * linear);
  return { current, previous, blend };
}

export function mouthVisibilityForLevel(level) {
  const linear = clamp((Number(level) - 0.045) / 0.5);
  return (linear * linear * (3 - 2 * linear)) * 0.92;
}

/** Limita a presença visual do professor às janelas editoriais do roteiro. */
export function presenterActiveAtTime(windows, currentTime) {
  if (!Array.isArray(windows) || windows.length === 0) return true;
  if (!Number.isFinite(currentTime)) return false;
  return windows.some(
    (window) =>
      Array.isArray(window) &&
      window.length === 2 &&
      currentTime >= window[0] &&
      currentTime < window[1],
  );
}

export function learningStageTheme(track, lesson) {
  const id = typeof track === "string" ? track : track?.id;
  const searchable = `${lesson?.number || ""} ${lesson?.title || ""}`.toLocaleLowerCase(
    "pt-BR",
  );

  if (/\b(pacuera|apa|cartograf|geoespacial|mapa|territ[oó]rio|zoneamento)/.test(searchable)) {
    return "map";
  }
  if (/\b(vistoria|campo|monitoramento|fauna|flora|qualidade da [aá]gua)\b/.test(searchable)) {
    return "field";
  }
  if (/\b(barragem|reservat[oó]rio|casa de for[cç]a|enchimento)\b/.test(searchable)) {
    return "dam";
  }
  return TRACK_THEMES[id] || "office";
}

function readProfessorPreference() {
  try {
    return localStorage.getItem(PROFESSOR_PREFERENCE) !== "hidden";
  } catch {
    return true;
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    if (query.addEventListener) query.addEventListener("change", update);
    else query.addListener?.(update);
    return () => {
      if (query.removeEventListener) query.removeEventListener("change", update);
      else query.removeListener?.(update);
    };
  }, []);

  return reduced;
}

function useVisemeTimeline(url) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries([]);
    if (!url || typeof fetch !== "function") return undefined;
    const controller = new AbortController();
    let active = true;
    void fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Falha ao carregar visemas: ${response.status}`);
        return response.json();
      })
      .then((timeline) => {
        if (active && Array.isArray(timeline?.entries)) setEntries(timeline.entries);
      })
      .catch((error) => {
        if (error?.name !== "AbortError" && active) setEntries([]);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [url]);

  return entries;
}

function usePlaybackClock(videoRef, playing, mediaSource) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setCurrentTime(0);
  }, [mediaSource]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    let animationFrame = 0;
    let lastPublishedAt = -1;
    const publish = () => {
      const next = Number.isFinite(video.currentTime) ? video.currentTime : 0;
      if (Math.abs(next - lastPublishedAt) >= 0.025 || next === 0) {
        lastPublishedAt = next;
        setCurrentTime(next);
      }
    };
    const animate = () => {
      publish();
      animationFrame = requestAnimationFrame(animate);
    };
    video.addEventListener("loadedmetadata", publish);
    video.addEventListener("seeked", publish);
    video.addEventListener("timeupdate", publish);
    if (playing && typeof requestAnimationFrame === "function") animate();
    else publish();
    return () => {
      cancelAnimationFrame(animationFrame);
      video.removeEventListener("loadedmetadata", publish);
      video.removeEventListener("seeked", publish);
      video.removeEventListener("timeupdate", publish);
    };
  }, [mediaSource, playing, videoRef]);

  return currentTime;
}

async function audioGraphFor(video) {
  if (audioGraphs.has(video)) {
    const existing = audioGraphs.get(video);
    try {
      await existing.context.resume?.();
    } catch {
      // A leitura visual pode cair no fallback; o vídeo continua controlável.
    }
    return existing;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  try {
    // Só redireciona o áudio do elemento depois que o contexto aceitou a
    // ativação. Se a política do navegador bloquear, o vídeo conserva a saída
    // de áudio nativa e a animação usa o fallback visual.
    await context.resume?.();
    if (context.state && context.state !== "running") {
      void context.close?.();
      return null;
    }
    const source = context.createMediaElementSource(video);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    analyser.connect(context.destination);
    const graph = {
      analyser,
      context,
      samples: new Uint8Array(analyser.fftSize),
    };
    audioGraphs.set(video, graph);
    return graph;
  } catch {
    void context.close?.();
    return null;
  }
}

function useNarrationLevel(videoRef, active, reducedMotion) {
  const [level, setLevel] = useState(0);
  const graphRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const entry = graphRef.current;
      if (!entry) return;
      audioGraphs.delete(entry.video);
      void entry.graph.context.close?.();
      graphRef.current = null;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active || reducedMotion) {
      setLevel(0);
      return undefined;
    }

    let cancelled = false;
    let animationFrame = 0;
    let smoothed = 0;
    let lastSampleAt = 0;
    let lastPublishedLevel = 0;

    const publishIfChanged = (nextLevel) => {
      const normalized = clamp(nextLevel);
      if (
        Math.abs(normalized - lastPublishedLevel) < 0.045 &&
        !(normalized === 0 && lastPublishedLevel !== 0)
      ) return;
      lastPublishedLevel = normalized;
      setLevel(normalized);
    };

    const updateFallback = (timestamp = 0) => {
      if (cancelled) return;
      if (timestamp - lastSampleAt >= 66) {
        lastSampleAt = timestamp;
        smoothed = fallbackNarrationLevel(video.currentTime);
        publishIfChanged(smoothed);
      }
      animationFrame = requestAnimationFrame(updateFallback);
    };

    const start = async () => {
      let graph = null;
      try {
        graph = await audioGraphFor(video);
      } catch {
        graph = null;
      }
      if (graph && !mountedRef.current) {
        if (audioGraphs.get(video) === graph) {
          audioGraphs.delete(video);
          void graph.context.close?.();
        }
        return;
      }
      if (graph) graphRef.current = { graph, video };
      if (cancelled) return;
      if (!graph) {
        updateFallback();
        return;
      }

      const updateFromAudio = (timestamp = 0) => {
        if (cancelled) return;
        if (timestamp - lastSampleAt >= 66) {
          lastSampleAt = timestamp;
          graph.analyser.getByteTimeDomainData(graph.samples);
          const measured = computeNarrationLevel(graph.samples);
          smoothed = smoothed * 0.58 + measured * 0.42;
          publishIfChanged(smoothed);
        }
        animationFrame = requestAnimationFrame(updateFromAudio);
      };
      updateFromAudio();
    };

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    };
  }, [active, reducedMotion, videoRef]);

  return level;
}

/**
 * Palco reutilizável para todas as videoaulas. O vídeo permanece o elemento
 * principal e conserva controles e uma faixa WebVTT opcional. O texto aberto
 * do quadro evita duplicação; quem preferir pode ligar a faixa nos controles.
 * O fundo e o professor
 * são camadas progressivas: se Web Audio, animação ou as imagens falharem, a
 * reprodução continua normalmente.
 */
export default function VideoLearningStage({
  media,
  track,
  lesson,
  videoRef: externalVideoRef,
  compact = false,
  captionsDefault = false,
  onPlay,
  onPause,
  onEnded,
}) {
  const internalVideoRef = useRef(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const stageRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [professorVisible, setProfessorVisible] = useState(readProfessorPreference);
  const [fullscreen, setFullscreen] = useState(false);
  const reducedMotion = useReducedMotion();
  const visemeEntries = useVisemeTimeline(media?.visemes);
  const currentTime = usePlaybackClock(videoRef, playing, media?.src);
  const narrationLevel = useNarrationLevel(
    videoRef,
    playing && professorVisible,
    reducedMotion,
  );
  const mouthFrame = mouthFrameForLevel(narrationLevel);
  const fallbackVisemes = [0, 10, 9, 3];
  const scheduledPose = visemeEntries.length
    ? naturalVisemePoseAtTime(visemeEntries, currentTime)
    : {
        current: fallbackVisemes[mouthFrame],
        previous: fallbackVisemes[mouthFrame],
        blend: 1,
      };
  const mouthVisibility = playing && !reducedMotion
    ? mouthVisibilityForLevel(narrationLevel)
    : 0;
  const pose = mouthVisibility > 0
    ? scheduledPose
    : { current: 0, previous: 0, blend: 1 };
  const presenterActive = presenterActiveAtTime(
    media?.presenterWindows,
    currentTime,
  );
  const theme = useMemo(
    () => learningStageTheme(track, lesson),
    [lesson, track],
  );

  useEffect(() => {
    // Alterar o atributo src do próprio elemento dispara a seleção de recurso
    // do HTMLMediaElement. O estado visual também volta ao repouso ao navegar
    // entre duas aulas sem desmontar todo o layout.
    setPlaying(false);
  }, [media?.src]);

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const style = {
    "--vls-professor-sprite": `url("${PROFESSOR_SPRITE}")`,
    "--vls-professor-fallback": `url("${PROFESSOR_SPRITE_FALLBACK}")`,
    "--vls-thematic-atlas": `url("${THEMATIC_ATLAS}")`,
    "--vls-mouth-level": narrationLevel.toFixed(3),
  };

  const mouthLayerStyle = (viseme, opacity) => {
    const safeViseme = Number.isInteger(viseme) ? clamp(viseme, 0, 11) : 0;
    const [x, y] = SPRITE_FRAME_POSITIONS[safeViseme];
    return {
      "--vls-mouth-sprite-position": `${x} ${y}`,
      "--vls-mouth-fallback-position": `${FALLBACK_FRAME_POSITIONS[safeViseme]} 0%`,
      "--vls-mouth-opacity": clamp(opacity).toFixed(3),
    };
  };

  const updatePreference = () => {
    setProfessorVisible((visible) => {
      const next = !visible;
      try {
        localStorage.setItem(
          PROFESSOR_PREFERENCE,
          next ? "visible" : "hidden",
        );
      } catch {
        // Preferência não é essencial para a reprodução.
      }
      return next;
    });
  };

  const handlePlay = (event) => {
    setPlaying(true);
    onPlay?.(event);
  };
  const handlePause = (event) => {
    setPlaying(false);
    onPause?.(event);
  };
  const handleEnded = (event) => {
    setPlaying(false);
    onEnded?.(event);
  };
  const play = () => {
    const result = videoRef.current?.play?.();
    result?.catch?.(() => {});
  };
  const fullscreenSupported =
    typeof document !== "undefined" && Boolean(document.fullscreenEnabled);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === stageRef.current) {
        await document.exitFullscreen?.();
      } else {
        await stageRef.current?.requestFullscreen?.();
      }
    } catch {
      // A política do navegador pode negar tela cheia; o player permanece útil.
    }
  };

  return (
    <div
      ref={stageRef}
      className={[
        "vls-stage",
        `vls-theme-${theme}`,
        compact ? "vls-compact" : "",
        playing ? "vls-playing" : "",
        professorVisible ? "vls-professor-visible" : "vls-professor-hidden",
        presenterActive ? "vls-presenter-active" : "vls-presenter-away",
        reducedMotion ? "vls-reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-learning-stage-theme={theme}
      style={style}
    >
      <div className="vls-atlas" aria-hidden="true" />
      <div className="vls-screen">
        <video
          ref={videoRef}
          className="vls-video"
          src={media?.src || undefined}
          aria-label={
            media?.title ? `Videoaula: ${media.title}` : "Videoaula"
          }
          controls
          preload="metadata"
          poster={media?.poster}
          playsInline
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        >
          {media?.captions && (
            <track
              kind="captions"
              src={media.captions}
              srcLang="pt-BR"
              label="Português"
              default={captionsDefault}
            />
          )}
          Seu navegador não suporta vídeo HTML5.
        </video>
        {!playing && (
          <button
            type="button"
            className="vls-play"
            aria-label={`Reproduzir ${media?.title || "videoaula"}`}
            onClick={play}
          >
            <span aria-hidden="true">▶</span>
          </button>
        )}
      </div>

      <div
        className="vls-professor-rail"
        aria-hidden={!professorVisible || !presenterActive}
      >
        <div
          className="vls-professor"
          data-mouth-frame={mouthFrame}
          data-viseme={pose.current}
          data-previous-viseme={pose.previous}
          data-mouth-active={mouthVisibility > 0.02 ? "true" : "false"}
          aria-hidden="true"
        >
          <span
            className="vls-professor-mouth vls-professor-mouth-previous"
            style={mouthLayerStyle(
              pose.previous,
              mouthVisibility * (1 - pose.blend),
            )}
          />
          <span
            className="vls-professor-mouth vls-professor-mouth-current"
            style={mouthLayerStyle(
              pose.current,
              mouthVisibility * pose.blend,
            )}
          />
        </div>
        <span className="vls-professor-label">Professor</span>
      </div>

      <div className="vls-stage-actions">
        {fullscreenSupported && (
          <button
            type="button"
            className="vls-fullscreen-toggle"
            aria-label={fullscreen ? "Sair da tela cheia" : "Exibir palco em tela cheia"}
            onClick={toggleFullscreen}
          >
            {fullscreen
              ? <Minimize2 size={14} aria-hidden="true" />
              : <Maximize2 size={14} aria-hidden="true" />}
            <span>{fullscreen ? "Sair" : "Tela cheia"}</span>
          </button>
        )}
        <button
          type="button"
          className="vls-professor-toggle"
          aria-label={
            professorVisible
              ? "Ocultar professor do palco da videoaula"
              : "Mostrar professor no palco da videoaula"
          }
          aria-pressed={professorVisible}
          onClick={updatePreference}
        >
          {professorVisible ? "Ocultar professor" : "Mostrar professor"}
        </button>
      </div>
    </div>
  );
}
