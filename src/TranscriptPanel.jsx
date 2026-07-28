import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileText,
  Search,
} from "lucide-react";

function secondsFromTimestamp(value) {
  const parts = value.trim().split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export function parseWebVtt(source) {
  const normalized = String(source || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n");
  const blocks = normalized.split(/\n{2,}/);
  const cues = [];

  for (const rawBlock of blocks) {
    const lines = rawBlock
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length || lines[0] === "WEBVTT" || lines[0].startsWith("NOTE")) {
      continue;
    }
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex < 0) continue;
    const [startRaw, endRaw] = lines[timingIndex]
      .split("-->")
      .map((part) => part.trim().split(/\s+/)[0]);
    const text = lines
      .slice(timingIndex + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!text) continue;
    cues.push({
      id: `${startRaw}-${cues.length}`,
      start: secondsFromTimestamp(startRaw),
      end: secondsFromTimestamp(endRaw),
      text,
    });
  }
  return cues;
}

function minuteLabel(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

export default function TranscriptPanel({ captions, videoRef, title }) {
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState("idle");
  const [cues, setCues] = useState([]);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadTranscript() {
    if (status === "loading" || status === "ready") return;
    setStatus("loading");
    try {
      const response = await fetch(captions, { credentials: "same-origin" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = parseWebVtt(await response.text());
      if (!parsed.length) throw new Error("A faixa não contém trechos legíveis.");
      setCues(parsed);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return term
      ? cues.filter((cue) => cue.text.toLocaleLowerCase("pt-BR").includes(term))
      : cues;
  }, [cues, query]);

  async function copyTranscript() {
    const text = cues.map((cue) => cue.text).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function seek(seconds) {
    const video = videoRef?.current;
    if (!video) return;
    video.currentTime = seconds;
    video.play().catch(() => {});
  }

  return (
    <details
      className="transcript-panel"
      open={opened}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpened(next);
        if (next) loadTranscript();
      }}
    >
      <summary>
        <FileText aria-hidden="true" />
        <span>
          <strong>Transcrição acessível do resumo</strong>
          <small>Leia, pesquise ou navegue por tempo sem reproduzir o vídeo.</small>
        </span>
      </summary>
      <div className="transcript-body">
        {status === "loading" && (
          <p className="transcript-status" role="status">
            Carregando transcrição…
          </p>
        )}
        {status === "error" && (
          <p className="transcript-status error" role="alert">
            <AlertTriangle aria-hidden="true" />
            Não foi possível abrir a transcrição agora. A legenda continua
            disponível no reprodutor.
          </p>
        )}
        {status === "ready" && (
          <>
            <div className="transcript-tools">
              <label>
                <Search aria-hidden="true" />
                <span className="sr-only">Pesquisar nesta transcrição</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pesquisar nesta transcrição"
                />
              </label>
              <button type="button" onClick={copyTranscript}>
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                {copied ? "Copiada" : "Copiar texto"}
              </button>
              <a href={captions} download>
                <Download aria-hidden="true" />
                Baixar VTT
              </a>
            </div>
            <p className="transcript-context">
              Transcrição do resumo “{title}”. Para o procedimento integral,
              consulte a aula guiada e a aba Fonte do POP.
            </p>
            <ol className="transcript-cues">
              {filtered.map((cue) => (
                <li key={cue.id}>
                  <button
                    type="button"
                    onClick={() => seek(cue.start)}
                    aria-label={`Reproduzir a partir de ${minuteLabel(cue.start)}`}
                  >
                    {minuteLabel(cue.start)}
                  </button>
                  <p>{cue.text}</p>
                </li>
              ))}
            </ol>
            {!filtered.length && (
              <p className="transcript-status">
                Nenhum trecho corresponde à busca.
              </p>
            )}
          </>
        )}
      </div>
    </details>
  );
}
