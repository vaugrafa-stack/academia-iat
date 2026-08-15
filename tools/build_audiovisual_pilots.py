# -*- coding: utf-8 -*-
"""Gera as seis microaulas do piloto audiovisual da Academia IAT.

O arquivo de roteiros é a fonte editorial. Cada cena precisa citar uma seção,
tabela ou fonte oficial declarada. A voz padrão é o modelo local Faber do
Piper; o provedor fica isolado para permitir comparação futura sem alterar os
roteiros ou o contrato MediaAsset.

Saídas por aula: MP4 com fast start, pôster, WebVTT, transcrição e linha do
tempo de 12 visemas. O professor é renderizado pela interface e não é gravado
no vídeo, mantendo mapas, quadros e legendas livres de sobreposição.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import wave

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from legendas import dividir_fala, escrever_vtt  # noqa: E402
# Motor de visemas compartilhado com visemas_das_aulas.py, que aplica o mesmo
# mapeamento as 159 videoaulas a partir das legendas.
from visemas import (  # noqa: E402
    SCENE_GAP,
    SKIP_PHONEMES,
    VIS_NAMES,
    phoneme_weight,
    viseme_for,
    viseme_timeline,
)

SCRIPTS_PATH = ROOT / "src" / "data" / "audiovisual-pilot-scripts.json"
POP_PATH = ROOT / "src" / "data" / "pop-public-content.json"
DEFAULT_OUTPUT = ROOT / "public" / "media" / "piloto"
SOURCE_MANIFEST = ROOT / "src" / "data" / "audiovisual-pilot-media.json"
ATLAS = ROOT / "public" / "media" / "learning-stage" / "thematic-atlas.webp"
SPRITE_PNG = ROOT / "public" / "media" / "learning-stage" / "professor-visemes-v2.png"
SPRITE_WEBP = ROOT / "public" / "media" / "learning-stage" / "professor-visemes-v2.webp"
TTS = ROOT / "tools" / "tts"
PIPER = TTS / "piper" / "piper.exe"
MODEL = TTS / "pt_BR-faber-medium.onnx"

W, H, FPS = 960, 540, 12
TARGET_WPM = 140.0
MIN_WPM, MAX_WPM = 130.0, 150.0
TRANSITION_SECONDS = 0.24
GENERATOR_VERSION = 1
EXPECTED_IDS = {
    "pop-section-018",
    "pop-section-059",
    "pop-section-069",
    "pop-section-094",
    "pop-section-108",
    "pop-section-134",
}

FONT_REGULAR = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\segoeuib.ttf")
INK = "#f5fffb"
MUTED = "#c7ded6"
GREEN = "#56d5ae"
GOLD = "#f2c763"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def pilot_script_sha256(pilot: dict) -> str:
    """Vincula cada conjunto audiovisual ao roteiro editorial exato."""
    canonical = json.dumps(
        pilot,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def asset(path: Path, public_root: Path) -> dict:
    return {
        "path": "/" + path.relative_to(public_root).as_posix(),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
    }


def generated_at() -> str:
    epoch = os.environ.get("SOURCE_DATE_EPOCH")
    instant = (
        datetime.fromtimestamp(int(epoch), tz=timezone.utc)
        if epoch
        else datetime.now(timezone.utc)
    )
    return instant.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def validate_sources(collection: dict, pop: dict) -> None:
    pilots = collection.get("pilots") or []
    actual = {pilot.get("lessonId") for pilot in pilots}
    if actual != EXPECTED_IDS or len(pilots) != 6:
        raise ValueError("a seleção audiovisual deve conter exatamente os seis IDs aprovados")

    section_ids = {item["id"] for item in pop.get("sections", [])}
    paragraph_sections = {
        block.get("paragraph", {}).get("id"): block.get("sectionId")
        for block in pop.get("blocks", [])
        if block.get("paragraph")
    }
    table_sections = {
        block.get("tableId"): block.get("sectionId")
        for block in pop.get("blocks", [])
        if block.get("tableId")
    }
    official_ids = {item["id"] for item in collection.get("officialSources", [])}
    source_sha = collection.get("sourceDocument", {}).get("sha256")
    if source_sha != pop.get("source", {}).get("sha256"):
        raise ValueError("o hash do POP no roteiro diverge da extração pública")

    for pilot in pilots:
        refs = {ref["id"]: ref for ref in pilot.get("sourceRefs", [])}
        for ref in refs.values():
            if ref.get("kind") == "pop":
                if not ref.get("locator"):
                    raise ValueError(f"{pilot['id']}/{ref['id']}: localizador público ausente")
                if ref.get("sectionId") not in section_ids:
                    raise ValueError(f"{pilot['id']}: seção inexistente {ref.get('sectionId')}")
                missing_paragraphs = set(ref.get("paragraphIds", [])) - set(paragraph_sections)
                missing_tables = set(ref.get("tableIds", [])) - set(table_sections)
                if missing_paragraphs or missing_tables:
                    raise ValueError(
                        f"{pilot['id']}: referências inexistentes "
                        f"{sorted(missing_paragraphs | missing_tables)}"
                    )
                foreign_paragraphs = {
                    item
                    for item in ref.get("paragraphIds", [])
                    if paragraph_sections.get(item) != ref.get("sectionId")
                }
                foreign_tables = {
                    item
                    for item in ref.get("tableIds", [])
                    if table_sections.get(item) != ref.get("sectionId")
                }
                if foreign_paragraphs or foreign_tables:
                    raise ValueError(
                        f"{pilot['id']}/{ref['id']}: a seção {ref.get('sectionId')} "
                        "não contém "
                        f"{sorted(foreign_paragraphs | foreign_tables)}"
                    )
            elif ref.get("kind") == "official":
                if not ref.get("locator"):
                    raise ValueError(f"{pilot['id']}/{ref['id']}: localizador público ausente")
                if ref.get("officialSourceId") not in official_ids:
                    raise ValueError(
                        f"{pilot['id']}: fonte oficial inexistente "
                        f"{ref.get('officialSourceId')}"
                    )
            else:
                raise ValueError(f"{pilot['id']}: tipo de fonte inválido")
        for scene in pilot.get("scenes", []):
            citations = scene.get("citations") or []
            if not citations:
                raise ValueError(f"{pilot['id']}/{scene.get('id')}: fala sem fonte")
            unknown = set(citations) - set(refs)
            if unknown:
                raise ValueError(
                    f"{pilot['id']}/{scene.get('id')}: citação desconhecida {sorted(unknown)}"
                )


def replace_pronunciations(text: str, dictionary: dict[str, str]) -> str:
    result = text
    for source in sorted(dictionary, key=len, reverse=True):
        result = re.sub(
            rf"(?<![\wÀ-ÿ]){re.escape(source)}(?![\wÀ-ÿ])",
            dictionary[source],
            result,
        )
    return result


def word_count(text: str) -> int:
    return len(re.findall(r"[A-Za-zÀ-ÿ0-9]+(?:[-'’][A-Za-zÀ-ÿ0-9]+)*", text))


def wav_info(path: Path) -> tuple[int, int, int, int, float]:
    with wave.open(str(path), "rb") as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        rate = wav.getframerate()
        frames = wav.getnframes()
    return channels, sample_width, rate, frames, frames / rate


def parse_phonemes(log: str) -> str:
    match = re.search(
        r"Converting\s+\d+\s+phoneme\(s\)\s+to ids:\s*(.*?)\r?\n\[",
        log,
        flags=re.DOTALL,
    )
    if not match:
        return ""
    return re.sub(r"\s*\r?\n\s*", "", match.group(1)).strip()


@dataclass
class Synthesized:
    wav: Path
    phonemes: str
    duration: float


class VoiceProvider:
    """Interface mínima para manter roteiros independentes do sintetizador."""

    id = "abstract"

    def synthesize(self, text: str, output: Path, length_scale: float) -> Synthesized:
        raise NotImplementedError


class PiperVoiceProvider(VoiceProvider):
    id = "piper-faber"

    def __init__(self, executable: Path, model: Path):
        self.executable = executable
        self.model = model

    def synthesize(self, text: str, output: Path, length_scale: float) -> Synthesized:
        command = [
            str(self.executable),
            "--model",
            str(self.model),
            "--output_file",
            str(output),
            "--length_scale",
            f"{length_scale:.4f}",
            "--sentence_silence",
            "0.28",
            "--debug",
        ]
        process = subprocess.run(
            command,
            input=(text.strip() + "\n").encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        log = process.stderr.decode("utf-8", errors="replace")
        if process.returncode or not output.is_file():
            raise RuntimeError(f"Piper falhou: {log[-1200:]}")
        *_, duration = wav_info(output)
        return Synthesized(output, parse_phonemes(log), duration)


def resolve_ffmpeg(explicit: str | None) -> str:
    candidates = [explicit, os.environ.get("ACADEMIA_IAT_FFMPEG"), shutil.which("ffmpeg")]
    candidates.extend(
        str(path)
        for path in (ROOT / ".video_tools" / "imageio_ffmpeg" / "binaries").glob("ffmpeg*.exe")
    )
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(Path(candidate).resolve())
    try:
        import imageio_ffmpeg  # type: ignore

        candidate = imageio_ffmpeg.get_ffmpeg_exe()
        if candidate and Path(candidate).is_file():
            return str(Path(candidate).resolve())
    except (ImportError, AttributeError):
        pass
    raise RuntimeError("FFmpeg não localizado; informe --ffmpeg ou ACADEMIA_IAT_FFMPEG")


def synthesize_scenes(
    pilot: dict,
    dictionary: dict[str, str],
    provider: VoiceProvider,
    temp: Path,
    initial_scale: float,
) -> tuple[list[dict], float]:
    scale = initial_scale
    scenes: list[dict] = []
    for attempt in range(3):
        scenes = []
        for index, scene in enumerate(pilot["scenes"]):
            wav = temp / f"{pilot['lessonId']}-{index:02d}.wav"
            spoken = replace_pronunciations(scene["speech"], dictionary)
            result = provider.synthesize(spoken, wav, scale)
            scenes.append({
                **scene,
                "spoken": spoken,
                "wav": wav,
                "phonemes": result.phonemes,
                "audioDuration": result.duration,
            })
        duration = sum(scene["audioDuration"] + SCENE_GAP for scene in scenes)
        words = sum(word_count(scene["spoken"]) for scene in scenes)
        wpm = words / duration * 60
        if MIN_WPM <= wpm <= MAX_WPM:
            return scenes, wpm
        scale = min(1.65, max(0.85, scale * wpm / TARGET_WPM))
    return scenes, wpm


def combine_wavs(scenes: list[dict], output: Path) -> list[dict]:
    first = wav_info(scenes[0]["wav"])
    channels, sample_width, rate = first[:3]
    timeline = []
    frame_cursor = 0
    silence_frames = round(SCENE_GAP * rate)
    with wave.open(str(output), "wb") as target:
        target.setnchannels(channels)
        target.setsampwidth(sample_width)
        target.setframerate(rate)
        for scene in scenes:
            with wave.open(str(scene["wav"]), "rb") as source:
                if (
                    source.getnchannels(),
                    source.getsampwidth(),
                    source.getframerate(),
                ) != (channels, sample_width, rate):
                    raise ValueError("formatos WAV incompatíveis entre cenas")
                frames = source.readframes(source.getnframes())
                count = source.getnframes()
                target.writeframes(frames)
            start = frame_cursor / rate
            frame_cursor += count
            end = frame_cursor / rate
            timeline.append({**scene, "start": start, "end": end})
            target.writeframes(b"\0" * silence_frames * channels * sample_width)
            frame_cursor += silence_frames
    return timeline


def make_captions(timeline: list[dict]) -> str:
    blocks = []
    for scene in timeline:
        # Mantém a última legenda por mais 180 ms depois da fala. Esse pequeno
        # trecho da pausa entre cenas evita que o arredondamento do WebVTT
        # ultrapasse o teto de leitura sem deslocar o início da próxima cena.
        caption_duration = scene["end"] - scene["start"] + min(0.18, SCENE_GAP - 0.04)
        blocks.extend(
            dividir_fala(
                scene["speech"],
                scene["start"],
                caption_duration,
            )
        )
    return escrever_vtt(blocks)


def presenter_windows(timeline: list[dict], duration: float, target: float = 0.35):
    candidates = [
        (scene["start"], scene["end"])
        for scene in timeline
        if scene.get("presenter")
    ]
    available = sum(end - start for start, end in candidates)
    desired = duration * target
    if not candidates or available <= 0:
        return [], 0.0
    factor = min(1.0, desired / available)
    windows = []
    for start, end in candidates:
        span = (end - start) * factor
        windows.append([round(start, 3), round(start + span, 3)])
    coverage = sum(end - start for start, end in windows) / duration
    return windows, round(coverage, 4)


def font(size: int, bold: bool = False):
    path = FONT_BOLD if bold else FONT_REGULAR
    return ImageFont.truetype(str(path), size)


FONTS = {
    "small": font(15),
    "label": font(14, True),
    "title": font(34, True),
    "bullet": font(22),
    "counter": font(16, True),
}


def wrap_pixels(draw: ImageDraw.ImageDraw, text: str, face, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and draw.textbbox((0, 0), candidate, font=face)[2] > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def atlas_quadrant(atlas: Image.Image, theme: str) -> Image.Image:
    positions = {"dam": (0, 0), "map": (1, 0), "field": (0, 1), "office": (1, 1)}
    col, row = positions.get(theme, positions["office"])
    width, height = atlas.size[0] // 2, atlas.size[1] // 2
    return atlas.crop((col * width, row * height, (col + 1) * width, (row + 1) * height))


def citation_locators(pilot: dict, citations: list[str]) -> list[str]:
    refs = {ref["id"]: ref for ref in pilot.get("sourceRefs", [])}
    return [refs.get(citation, {}).get("locator", citation) for citation in citations]


def scene_card(background: Image.Image, pilot: dict, scene: dict, index: int, count: int) -> Image.Image:
    canvas = ImageOps.fit(background, (W, H), method=Image.Resampling.LANCZOS)
    canvas = ImageEnhance.Color(canvas).enhance(0.82).convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (3, 27, 23, 172))
    canvas = Image.alpha_composite(canvas, overlay)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((52, 52, 908, 476), radius=22, fill=(3, 31, 26, 218), outline=(156, 221, 201, 70), width=2)
    draw.text((82, 78), f"{pilot['trackId'].upper()} · MICROAULA PILOTO", font=FONTS["label"], fill=GREEN)
    draw.text((808, 78), f"{index + 1}/{count}", font=FONTS["counter"], fill=MUTED)
    y = 126
    for line in wrap_pixels(draw, scene["visualTitle"], FONTS["title"], 720)[:2]:
        draw.text((82, y), line, font=FONTS["title"], fill=INK)
        y += 43
    y += 18
    for bullet in scene.get("visualBullets", [])[:4]:
        lines = wrap_pixels(draw, bullet, FONTS["bullet"], 680)
        draw.ellipse((86, y + 10, 96, y + 20), fill=GOLD)
        for line_index, line in enumerate(lines[:2]):
            draw.text((112, y + line_index * 28), line, font=FONTS["bullet"], fill=INK)
        y += max(42, len(lines[:2]) * 28 + 8)
    source = " · ".join(citation_locators(pilot, scene.get("citations", [])))
    source_lines = wrap_pixels(draw, f"Fonte: {source}", FONTS["small"], 770)[:2]
    source_y = 438 - max(0, len(source_lines) - 1) * 18
    for line_index, line in enumerate(source_lines):
        draw.text((82, source_y + line_index * 18), line, font=FONTS["small"], fill=MUTED)
    progress = (index + 1) / count
    draw.rounded_rectangle((52, 508, 908, 516), radius=4, fill=(188, 221, 210, 38))
    draw.rounded_rectangle((52, 508, 52 + int(856 * progress), 516), radius=4, fill=GREEN)
    return canvas.convert("RGB")


def render_video(
    ffmpeg: str,
    pilot: dict,
    timeline: list[dict],
    audio_path: Path,
    output: Path,
    poster: Path,
) -> None:
    atlas = Image.open(ATLAS).convert("RGB")
    background = atlas_quadrant(atlas, pilot.get("theme", "office"))
    cards = [
        scene_card(background, pilot, scene, index, len(timeline))
        for index, scene in enumerate(timeline)
    ]
    cards[0].save(poster, "JPEG", quality=91, optimize=True, progressive=True)
    duration = timeline[-1]["end"] + SCENE_GAP
    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{W}x{H}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-i",
        str(audio_path),
        "-map_metadata",
        "-1",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "24",
        "-g",
        str(FPS * 2),
        "-keyint_min",
        str(FPS * 2),
        "-sc_threshold",
        "0",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        "-shortest",
        str(output),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    scene_index = 0
    for frame_index in range(math.ceil(duration * FPS)):
        t = frame_index / FPS
        while scene_index + 1 < len(timeline) and t >= timeline[scene_index + 1]["start"]:
            scene_index += 1
        frame = cards[scene_index]
        local = t - timeline[scene_index]["start"]
        if scene_index and 0 <= local < TRANSITION_SECONDS:
            alpha = local / TRANSITION_SECONDS
            frame = Image.blend(cards[scene_index - 1], frame, alpha)
        process.stdin.write(frame.tobytes())
    process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError(f"FFmpeg falhou ao renderizar {pilot['lessonId']}")


def transcript_text(pilot: dict, timeline: list[dict]) -> str:
    lines = [
        pilot["title"],
        "",
        f"Objetivo: {pilot['objective']}",
        f"Pré-requisito: {pilot['prerequisite']}",
        "",
    ]
    for scene in timeline:
        lines.extend([
            f"[{scene['start']:.1f}s] {scene['visualTitle']}",
            scene["speech"],
            "Fonte: " + "; ".join(citation_locators(pilot, scene["citations"])),
            "",
        ])
    return "\n".join(lines).rstrip() + "\n"


def write_text_lf(path: Path, value: str) -> None:
    """Grava texto UTF-8 de forma idêntica no Windows e no Linux."""
    normalized = value.replace("\r\n", "\n").replace("\r", "\n")
    path.write_bytes(normalized.encode("utf-8"))


def write_json(path: Path, value) -> None:
    write_text_lf(
        path,
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
    )


def provenance_from_manifest(manifest: dict) -> dict:
    return {
        "schemaVersion": "1.0.0",
        "voice": manifest["voice"],
        "background": manifest["background"],
        "presenterSprite": manifest["presenterSprite"],
        "sourceDocument": manifest["sourceDocument"],
    }


def refresh_existing_metadata(output: Path, collection: dict) -> None:
    """Normaliza textos e recalcula metadados sem sintetizar os vídeos."""
    manifest_path = output / "manifest.json"
    manifest = load_json(manifest_path)
    items = manifest.get("items") or []
    if {item.get("lessonId") for item in items} != EXPECTED_IDS:
        raise ValueError("o manifesto existente não contém os seis pilotos aprovados")

    pilots_by_lesson = {pilot["lessonId"]: pilot for pilot in collection["pilots"]}

    for item in items:
        expected_script_sha = pilot_script_sha256(pilots_by_lesson[item["lessonId"]])
        if item.get("scriptSha256") != expected_script_sha:
            raise ValueError(
                f"{item['lessonId']}: roteiro mudou; regenere a mídia em vez de "
                "atualizar apenas os metadados"
            )
        for name, metadata in item["assets"].items():
            path = ROOT / "public" / metadata["path"].lstrip("/")
            if name in {"captions", "transcript", "visemes"}:
                write_text_lf(path, path.read_text(encoding="utf-8"))
            item["assets"][name] = asset(path, ROOT / "public")

    manifest["sourceDocument"] = collection["sourceDocument"]
    manifest["background"].update(asset(ATLAS, ROOT / "public"))
    manifest["presenterSprite"]["source"].update(asset(SPRITE_PNG, ROOT / "public"))
    manifest["presenterSprite"]["optimized"].update(asset(SPRITE_WEBP, ROOT / "public"))
    write_json(manifest_path, manifest)
    write_json(SOURCE_MANIFEST, manifest)
    write_json(output / "provenance.json", provenance_from_manifest(manifest))
    print("OK: textos normalizados e hashes dos seis pilotos atualizados.")


def ffmpeg_version(ffmpeg: str) -> str:
    process = subprocess.run([ffmpeg, "-version"], capture_output=True, text=True, check=False)
    return (process.stdout.splitlines() or ["ffmpeg"])[0]


def build_one(
    pilot: dict,
    collection: dict,
    provider: VoiceProvider,
    output: Path,
    temp: Path,
    ffmpeg: str,
    length_scale: float,
) -> dict:
    print(f"sintetizando {pilot['lessonId']} · {pilot['title']}")
    scenes, wpm = synthesize_scenes(
        pilot,
        collection["pronunciationDictionary"],
        provider,
        temp,
        length_scale,
    )
    audio_path = temp / f"{pilot['lessonId']}.wav"
    timeline = combine_wavs(scenes, audio_path)
    duration = timeline[-1]["end"] + SCENE_GAP
    if duration < 90:
        raise ValueError(f"{pilot['lessonId']}: duração {duration:.1f}s menor que 90s")
    if not MIN_WPM <= wpm <= MAX_WPM:
        raise ValueError(f"{pilot['lessonId']}: ritmo {wpm:.1f} ppm fora de 130–150")

    stem = output / pilot["lessonId"]
    video = stem.with_suffix(".mp4")
    poster = stem.with_suffix(".jpg")
    captions = stem.with_suffix(".vtt")
    transcript = stem.with_suffix(".txt")
    visemes = output / f"{pilot['lessonId']}.visemes.json"
    write_text_lf(captions, make_captions(timeline))
    write_text_lf(transcript, transcript_text(pilot, timeline))
    write_json(visemes, viseme_timeline(timeline, duration, pilot["lessonId"]))
    render_video(ffmpeg, pilot, timeline, audio_path, video, poster)
    windows, coverage = presenter_windows(timeline, duration)

    return {
        "id": pilot["id"],
        "lessonId": pilot["lessonId"],
        "trackId": pilot["trackId"],
        "title": pilot["title"],
        "classification": pilot["classification"],
        "objective": pilot["objective"],
        "durationSeconds": round(duration, 3),
        "wordsPerMinute": round(wpm, 2),
        "sceneCount": len(timeline),
        "captionContract": {"maxLineCharacters": 42, "maxCueSeconds": 6},
        "transitionSeconds": TRANSITION_SECONDS,
        "presenterWindows": windows,
        "presenterCoverage": coverage,
        "sourceRefs": pilot["sourceRefs"],
        "scriptSha256": pilot_script_sha256(pilot),
        "assets": {
            "video": asset(video, ROOT / "public"),
            "poster": asset(poster, ROOT / "public"),
            "captions": asset(captions, ROOT / "public"),
            "transcript": asset(transcript, ROOT / "public"),
            "visemes": asset(visemes, ROOT / "public"),
        },
    }


def optimize_sprite() -> dict:
    if not SPRITE_PNG.is_file():
        raise FileNotFoundError(f"sprite de 12 visemas ausente: {SPRITE_PNG}")
    with Image.open(SPRITE_PNG) as source:
        image = source.convert("RGBA")
    # Regrava apenas pixels. Assim, nenhum metadado da ferramenta de criação
    # é copiado para um ativo servido publicamente pela plataforma.
    image.save(SPRITE_PNG, "PNG", optimize=True)
    image.save(SPRITE_WEBP, "WEBP", quality=88, method=6)
    return {
        "source": asset(SPRITE_PNG, ROOT / "public"),
        "optimized": asset(SPRITE_WEBP, ROOT / "public"),
        "grid": {"columns": 3, "rows": 4, "frames": 12},
        "order": ["rest", "MBP", "IE", "A", "O", "U", "FV", "L", "CHJ", "E_OPEN", "SCHWA", "rest_alt"],
        "rightsBasis": "ativo visual fictício criado para uso na plataforma",
    }


def arguments():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ids", nargs="*", help="IDs de aula; sem valor gera os seis")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--provider", choices=["piper"], default="piper")
    parser.add_argument("--piper", type=Path, default=PIPER)
    parser.add_argument("--voice-model", type=Path, default=MODEL)
    parser.add_argument("--ffmpeg")
    parser.add_argument("--length-scale", type=float, default=1.15)
    parser.add_argument(
        "--refresh-metadata",
        action="store_true",
        help="normaliza textos e hashes existentes sem sintetizar áudio ou vídeo",
    )
    return parser.parse_args()


def main() -> int:
    args = arguments()
    collection = load_json(SCRIPTS_PATH)
    pop = load_json(POP_PATH)
    validate_sources(collection, pop)
    pilots = collection["pilots"]
    if args.ids:
        unknown = set(args.ids) - EXPECTED_IDS
        if unknown:
            raise SystemExit("IDs desconhecidos: " + ", ".join(sorted(unknown)))
        pilots = [pilot for pilot in pilots if pilot["lessonId"] in set(args.ids)]
    if args.dry_run:
        for pilot in pilots:
            words = sum(word_count(scene["speech"]) for scene in pilot["scenes"])
            print(f"{pilot['lessonId']}: {len(pilot['scenes'])} cenas · {words} palavras")
        print("OK: seleção, referências e falas rastreadas.")
        return 0

    if args.refresh_metadata:
        if args.ids:
            raise SystemExit("--refresh-metadata não aceita uma seleção parcial")
        refresh_existing_metadata(args.output.resolve(), collection)
        return 0

    if not args.piper.is_file() or not args.voice_model.is_file():
        raise SystemExit("Piper/Faber local não localizado em tools/tts")
    ffmpeg = resolve_ffmpeg(args.ffmpeg)
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    temp = output / ".tmp"
    if temp.exists():
        shutil.rmtree(temp)
    temp.mkdir(parents=True)
    provider = PiperVoiceProvider(args.piper.resolve(), args.voice_model.resolve())
    sprite = optimize_sprite()
    items = []
    try:
        for pilot in pilots:
            item_temp = temp / pilot["lessonId"]
            item_temp.mkdir()
            item = build_one(
                pilot,
                collection,
                provider,
                output,
                item_temp,
                ffmpeg,
                args.length_scale,
            )
            items.append(item)
            print(
                f"OK {pilot['lessonId']}: {item['durationSeconds']:.1f}s · "
                f"{item['wordsPerMinute']:.1f} ppm · "
                f"{item['assets']['video']['bytes'] / 1_000_000:.1f} MB"
            )
    finally:
        if temp.exists():
            shutil.rmtree(temp)

    manifest = {
        "schemaVersion": "1.0.0",
        "kind": "MediaAssetCollection",
        "generatedAt": generated_at(),
        "generatorVersion": GENERATOR_VERSION,
        "selection": sorted(item["lessonId"] for item in items),
        "sourceDocument": collection["sourceDocument"],
        "voice": {
            **collection["voice"],
            "provider": provider.id,
            "modelSha256": sha256(args.voice_model),
            "configSha256": sha256(Path(str(args.voice_model) + ".json")),
        },
        "runtime": {"ffmpeg": ffmpeg_version(ffmpeg)},
        "background": {
            **asset(ATLAS, ROOT / "public"),
            "rightsBasis": "ativo temático já aprovado e incorporado à plataforma",
        },
        "presenterSprite": sprite,
        "items": sorted(items, key=lambda item: item["lessonId"]),
    }
    manifest_path = output / "manifest.json"
    write_json(manifest_path, manifest)
    if {item["lessonId"] for item in items} == EXPECTED_IDS:
        write_json(SOURCE_MANIFEST, manifest)
        write_json(output / "provenance.json", provenance_from_manifest(manifest))
    else:
        print("AVISO: lote parcial; o manifesto de origem não foi atualizado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
