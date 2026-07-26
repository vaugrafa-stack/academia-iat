"""Build three captioned, animated training microvideos from the POP content."""
from __future__ import annotations

import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".video_tools"))

from PIL import Image, ImageDraw, ImageFont  # noqa: E402
import imageio_ffmpeg  # noqa: E402

WIDTH, HEIGHT, FPS, DURATION = 1280, 720, 15, 20
OUT = ROOT / "public" / "media"

PALETTE = {
    "ink": "#071f1d",
    "deep": "#063b31",
    "green": "#0a7755",
    "mint": "#57d8bf",
    "blue": "#34a9e1",
    "amber": "#f3bd4f",
    "coral": "#f07e68",
    "white": "#ffffff",
    "muted": "#b9d0ca",
}


def font(size: int, bold: bool = False):
    path = Path(r"C:\Windows\Fonts\segoeui" + ("b" if bold else "") + ".ttf")
    return ImageFont.truetype(str(path), size=size)


FONTS = {
    "kicker": font(19, True),
    "title": font(45, True),
    "subtitle": font(24),
    "node": font(24, True),
    "small": font(18),
    "caption": font(25, True),
}


VIDEOS = {
    "fluxo-geral": {
        "title": "Fluxo geral da análise",
        "subtitle": "A conclusão é resultado, nunca o ponto de partida.",
        "source": "POP §§ 6, 6.1 e 7",
        "steps": [
            ("1", "Receber", "Identificar o objeto"),
            ("2", "Conferir", "Histórico e suficiência"),
            ("3", "Enquadrar", "Tipologia, ato e estudo"),
            ("4", "Analisar", "Mérito e compatibilidade"),
            ("5", "Registrar", "Saída fundamentada"),
        ],
        "captions": [
            "Comece pelo objeto e pelo histórico do processo.",
            "Confirme a suficiência antes de avançar ao mérito.",
            "Compatibilize tipologia, modalidade e estudo ambiental.",
            "Registre a motivação e o encaminhamento proporcional.",
        ],
    },
    "enquadramento": {
        "title": "Enquadramento sem atalhos",
        "subtitle": "A modalidade não se define por um único número.",
        "source": "POP § 8 · IN IAT nº 09/2025",
        "steps": [
            ("1", "Caracterizar", "Potência e alagamento"),
            ("2", "Restringir", "Aplicar o critério mais rigoroso"),
            ("3", "Calcular", "IDA e sensibilidade"),
            ("4", "Verificar", "Supressão e Consulta Prévia"),
            ("5", "Motivar", "Modalidade e estudo"),
        ],
        "captions": [
            "Confirme potência, área de alagamento e características técnicas.",
            "Entre potência e área, prevalece o critério mais restritivo.",
            "Depois avalie IDA, supressão e sensibilidade ambiental.",
            "A decisão final deve registrar critérios e limitações.",
        ],
    },
    "pacuera": {
        "title": "PACUERA: território em foco",
        "subtitle": "Zoneamento exige diagnóstico, participação e governança.",
        "source": "POP § 18.10 · Quadros 30 a 32",
        "steps": [
            ("1", "Exigibilidade", "Fase e TR aplicável"),
            ("2", "Diagnóstico", "Fragilidades e potencialidades"),
            ("3", "Organizar", "UTHs e zoneamento"),
            ("4", "Participar", "Comunicação e contribuições"),
            ("5", "Implementar", "Indicadores e revisão"),
        ],
        "captions": [
            "Primeiro confirme exigibilidade, fase e Termo de Referência.",
            "O diagnóstico integrado sustenta as unidades territoriais.",
            "O zoneamento deve respeitar competências e participação social.",
            "A aprovação precisa prever implementação, indicadores e revisão.",
        ],
    },
}


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def rounded(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def make_frame(spec, frame_no: int):
    t = frame_no / FPS
    im = Image.new("RGB", (WIDTH, HEIGHT), PALETTE["ink"])
    d = ImageDraw.Draw(im)

    # Moving contour/rivers: subtle, deterministic visual motion.
    for row in range(6):
        pts = []
        for x in range(-50, WIDTH + 60, 18):
            y = 570 + row * 18 + math.sin((x / 155) + t * .55 + row * .7) * (18 + row * 2)
            pts.append((x, y))
        d.line(pts, fill=(19, 91 + row * 5, 84 + row * 6), width=2)
    orb_x = 1110 + math.sin(t * .35) * 22
    d.ellipse((orb_x - 165, -110, orb_x + 165, 220), fill="#0b333a")

    # Header enters during first second.
    intro = ease(t / 1.0)
    dx = int((1 - intro) * -70)
    rounded(d, (70 + dx, 48, 310 + dx, 82), 18, "#10584e", "#2a8a78", 1)
    d.text((88 + dx, 54), "MICROAULA • 20 S", font=FONTS["kicker"], fill="#73ead8")
    d.text((70 + dx, 105), spec["title"], font=FONTS["title"], fill=PALETTE["white"])
    d.text((70 + dx, 166), spec["subtitle"], font=FONTS["subtitle"], fill="#c7e4de")

    # Five stages appear sequentially and pulse when active.
    active = min(4, max(0, int((t - 2) // 3)))
    start_x, gap, box_w, box_h = 70, 28, 212, 168
    for i, (num, verb, detail) in enumerate(spec["steps"]):
        local = ease((t - (1.4 + i * .38)) / .8)
        x = start_x + i * (box_w + gap)
        y = 250 + int((1 - local) * 35)
        alpha_color = PALETTE["deep"] if i != active else "#0d584b"
        border = PALETTE["mint"] if i == active else "#28786b"
        width = 4 if i == active else 2
        rounded(d, (x, y, x + box_w, y + box_h), 20, alpha_color, border, width)
        pulse = 4 + int((math.sin(t * 5) + 1) * 2) if i == active else 0
        d.ellipse((x + 18 - pulse, y + 18 - pulse, x + 60 + pulse, y + 60 + pulse), fill=PALETTE["blue"] if i in (2, 3) else PALETTE["green"])
        d.text((x + 33, y + 25), num, anchor="mm", font=FONTS["node"], fill="white")
        d.text((x + 20, y + 78), verb.upper(), font=FONTS["small"], fill="#79cdbc")
        # two-line wrap is sufficient for curated text
        words, lines, line = detail.split(), [], ""
        for word in words:
            trial = (line + " " + word).strip()
            if d.textlength(trial, font=FONTS["node"]) > box_w - 34:
                lines.append(line); line = word
            else: line = trial
        if line: lines.append(line)
        for li, txt in enumerate(lines[:2]):
            d.text((x + 20, y + 108 + li * 28), txt, font=FONTS["node"], fill=PALETTE["white"])
        if i < 4:
            ax = x + box_w + 4
            d.line((ax, y + 84, ax + gap - 8, y + 84), fill=PALETTE["mint"], width=4)
            d.polygon([(ax + gap - 8, y + 77), (ax + gap - 8, y + 91), (ax + gap, y + 84)], fill=PALETTE["mint"])

    # Caption chapters and timeline.
    ci = min(3, int(t // 5))
    cap_y = 480
    rounded(d, (70, cap_y, 1210, cap_y + 74), 10, "#092e2c", "#26685f", 1)
    d.rectangle((70, cap_y, 77, cap_y + 74), fill=[PALETTE["mint"], PALETTE["blue"], PALETTE["amber"], PALETTE["coral"]][ci])
    d.text((95, cap_y + 20), spec["captions"][ci], font=FONTS["caption"], fill="white")
    d.text((70, 665), f"Fonte didática: {spec['source']} · Confirmar norma e orientação institucional vigentes.", font=FONTS["small"], fill=PALETTE["muted"])
    d.rounded_rectangle((70, 627, 1210, 635), radius=4, fill="#224d49")
    d.rounded_rectangle((70, 627, 70 + int(1140 * t / DURATION), 635), radius=4, fill=PALETTE["blue"])
    d.text((1163, 594), f"00:{min(19, int(t)):02d}", font=FONTS["small"], fill="#d5e8e4")
    return im


def write_vtt(slug: str, spec):
    lines = ["WEBVTT", ""]
    for i, caption in enumerate(spec["captions"]):
        lines += [f"00:00:{i*5:02d}.000 --> 00:00:{(i+1)*5:02d}.000", caption, ""]
    (OUT / f"{slug}.vtt").write_text("\n".join(lines), encoding="utf-8")


def build(slug: str, spec):
    path = OUT / f"{slug}.mp4"
    writer = imageio_ffmpeg.write_frames(
        str(path), (WIDTH, HEIGHT), fps=FPS, quality=7, codec="libx264",
        macro_block_size=1, output_params=["-movflags", "+faststart"],
    )
    writer.send(None)
    for frame_no in range(FPS * DURATION):
        writer.send(make_frame(spec, frame_no).tobytes())
    writer.close()
    write_vtt(slug, spec)
    print(path.name, path.stat().st_size)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, spec in VIDEOS.items():
        build(slug, spec)
