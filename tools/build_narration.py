# -*- coding: utf-8 -*-
"""Gera narracao em pt-BR (Piper TTS, offline) sincronizada com as legendas e
embute o audio em cada MP4 (modulos m00-m14 e o tour da usina).

Requer tools/tts/ com piper (piper.exe) e o modelo pt_BR-faber-medium.onnx,
baixados do projeto oficial. ffmpeg vem do imageio_ffmpeg em .video_tools.
"""
from __future__ import annotations

import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".video_tools"))
import imageio_ffmpeg  # noqa: E402

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TTS = ROOT / "tools" / "tts"
PIPER = TTS / "piper" / "piper.exe"
MODEL = TTS / "pt_BR-faber-medium.onnx"
MEDIA = ROOT / "public" / "media"
TMP = TTS / "_tmp"
TMP.mkdir(exist_ok=True)

from build_module_videos import SPECS  # noqa: E402
from build_tour_video import SCENES, SCENE, DURATION as TOUR_DUR  # noqa: E402

MODULE_DUR = 30.0


def synth(text: str, out: Path):
    """Sintetiza uma frase para WAV mono 16-bit via Piper (stdin -> arquivo)."""
    p = subprocess.run(
        [str(PIPER), "--model", str(MODEL), "--output_file", str(out)],
        input=text.encode("utf-8"),
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    if p.returncode != 0 or not out.exists():
        raise RuntimeError("piper falhou para: " + text[:40])


def read_wav(path: Path):
    with wave.open(str(path), "rb") as w:
        return w.getframerate(), w.getsampwidth(), w.getnchannels(), w.readframes(w.getnframes())


def build_track(lines, total_dur, out_wav: Path):
    """lines = [(start_seconds, texto)]. Coloca cada fala no seu tempo, sem
    sobreposicao (empurra a proxima se a anterior estourar)."""
    sr = sw = ch = None
    clips = []
    for i, (start, text) in enumerate(lines):
        w = TMP / f"line_{i}.wav"
        synth(text, w)
        fr, s, c, data = read_wav(w)
        sr, sw, ch = fr, s, c
        clips.append([start, data])
    total_samples = int(total_dur * sr)
    buf = bytearray(total_samples * sw * ch)
    cursor = 0  # amostra final da fala anterior
    for start, data in clips:
        off = max(int(start * sr), cursor)
        byte_off = off * sw * ch
        end = byte_off + len(data)
        if end > len(buf):
            data = data[: len(buf) - byte_off]
            end = len(buf)
        buf[byte_off:end] = data
        cursor = end // (sw * ch) + int(0.18 * sr)  # 180 ms de respiro
    with wave.open(str(out_wav), "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(sw)
        w.setframerate(sr)
        w.writeframes(bytes(buf))


def mux(video: Path, narration: Path):
    out = video.with_suffix(".muxed.mp4")
    subprocess.run(
        [FFMPEG, "-y", "-i", str(video), "-i", str(narration),
         "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac",
         "-b:a", "128k", "-shortest", str(out)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True,
    )
    out.replace(video)


def do_modules():
    seg = (MODULE_DUR - 5.0) / 6  # janela de cada legenda de conteudo
    for code, (title, subtitle, steps, captions) in SPECS.items():
        lines = [(0.8, subtitle)]
        for i, cap in enumerate(captions):
            lines.append((2.6 + i * seg, cap))
        wav = TMP / f"{code}.wav"
        build_track(lines, MODULE_DUR, wav)
        mux(MEDIA / f"{code}.mp4", wav)
        print("narrado", code)


def do_tour():
    lines = []
    for i, (nome, cap, _foco) in enumerate(SCENES):
        lines.append((i * SCENE + 0.5, cap))
    wav = TMP / "tour.wav"
    build_track(lines, TOUR_DUR, wav)
    mux(MEDIA / "tour-usina.mp4", wav)
    print("narrado tour-usina")


if __name__ == "__main__":
    do_modules()
    do_tour()
    print("OK narracao embutida em 16 videos")
