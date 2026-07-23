# -*- coding: utf-8 -*-
"""Tour didatico por uma usina hidreletrica de grande porte: corte completo,
cada cena destaca um componente com legenda sincronizada. Gera MP4 + VTT + poster."""
from __future__ import annotations

import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".video_tools"))

from PIL import Image, ImageDraw, ImageFont  # noqa: E402
import imageio_ffmpeg  # noqa: E402

W, H, FPS = 1280, 720, 15
SCENE = 7.0
OUT = ROOT / "public" / "media"

INK = "#071f1d"; DEEP = "#063b31"; GREEN = "#0a7755"; MINT = "#57d8bf"
BLUE = "#34a9e1"; SKYW = "#8fd0ff"; AMBER = "#f3bd4f"; WHITE = "#ffffff"
MUTED = "#b9d0ca"; CONC = "#b9c3bd"; DARK = "#2c3e46"


def font(size, bold=False):
    return ImageFont.truetype(r"C:\\Windows\\Fonts\\segoeui" + ("b" if bold else "") + ".ttf", size)


F = {"mega": font(54, True), "title": font(34, True), "cap": font(26, True),
     "small": font(18), "tag": font(20, True), "kick": font(19, True)}

# (rotulo, legenda, foco cx, cy, rx, ry)
SCENES = [
    ("abertura", "Tour por uma usina hidrelétrica: do rio à energia na rede.", None),
    ("Curso d'água e reservatório", "O rio é represado e forma o reservatório: energia potencial acumulada e usos múltiplos da água.", (170, 330, 190, 90)),
    ("APP do entorno", "Faixa de vegetação protegida ao redor do reservatório: a APP filtra sedimentos e protege as margens.", (150, 240, 200, 60)),
    ("PACUERA", "O uso do entorno é ordenado pelo PACUERA: zoneamento que diz o que pode e o que não pode em cada trecho.", (300, 250, 240, 80)),
    ("Barragem", "A barragem sustenta o desnível entre montante e jusante — a queda que move a usina.", (455, 400, 90, 130)),
    ("Vertedouro", "Nas cheias, o excedente passa pelo vertedouro com energia dissipada, protegendo a estrutura.", (520, 380, 70, 120)),
    ("Captação: tomada d'água", "A tomada d'água capta o fluxo com grades e comportas — início do circuito de geração.", (420, 480, 70, 50)),
    ("Conduto forçado", "A água desce sob pressão pelo conduto forçado, convertendo altura em velocidade.", (610, 520, 170, 70)),
    ("Casa de força: geração", "Na casa de força, a turbina gira com a água e o gerador converte rotação em eletricidade.", (800, 540, 110, 80)),
    ("Subestação e linha de transmissão", "O transformador eleva a tensão e a linha de transmissão leva a energia ao sistema interligado.", (1010, 330, 150, 120)),
    ("Canal de fuga", "A água turbinada retorna ao rio pelo canal de fuga, a jusante, mantendo a vazão do curso d'água.", (1090, 560, 150, 50)),
    ("encerramento", "Cada componente aparece no licenciamento: aprenda o procedimento completo na Formação.", None),
]
DURATION = int(len(SCENES) * SCENE)


def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def draw_plant(d, t, foco=None):
    # ceu e fundo
    d.rectangle((0, 0, W, H), fill="#eaf6ff")
    d.rectangle((0, 300, W, H), fill="#e7efe9")
    # morros com APP (vegetacao)
    d.polygon([(0, 300), (240, 170), (520, 300)], fill="#cfe4d4")
    d.polygon([(700, 300), (1000, 150), (1280, 300)], fill="#cfe4d4")
    for hx, hy in [(60, 265), (140, 235), (220, 205), (300, 235), (380, 265), (820, 255), (900, 215), (980, 185), (1060, 215), (1140, 250)]:
        d.ellipse((hx - 22, hy - 16, hx + 22, hy + 16), fill="#77b58f")
        d.ellipse((hx - 14, hy - 24, hx + 14, hy), fill="#5da879")
    # reservatorio (montante, esquerda) com ondulacao
    d.rectangle((0, 300, 455, 460), fill="#4aa3e8")
    for row in range(4):
        pts = [(x, 316 + row * 34 + math.sin(x / 60 + t * 1.4 + row) * 4) for x in range(0, 456, 12)]
        d.line(pts, fill="#7fc4f4", width=3)
    # barragem (gravidade)
    d.polygon([(455, 300), (455, 610), (545, 610), (505, 300)], fill=CONC, outline="#5b6672")
    for yy in range(330, 600, 42):
        d.line((458, yy, 520 + (yy - 330) // 8, yy), fill="#9aa8a0", width=2)
    # vertedouro: agua caindo animada
    if int(t * 2) % 2 == 0 or True:
        off = (t * 60) % 24
        for k in range(6):
            y0 = 305 + k * 50 + off
            if y0 < 600:
                d.line((512 + (y0 - 300) * 0.16, y0, 516 + (y0 - 300) * 0.16, y0 + 26), fill=SKYW, width=7)
    # tomada d'agua
    d.rectangle((398, 452, 442, 505), fill="#0a4a38", outline=DEEP, width=3)
    for gx in range(404, 440, 8):
        d.line((gx, 456, gx, 500), fill=MINT, width=2)
    # conduto forcado com fluxo animado
    d.line((442, 480, 760, 565), fill=DARK, width=22)
    dashoff = (t * 90) % 36
    for k in range(12):
        s = k * 36 + dashoff
        x0 = 442 + (760 - 442) * (s / 400)
        y0 = 480 + (565 - 480) * (s / 400)
        if x0 < 755:
            d.ellipse((x0 - 5, y0 - 5, x0 + 5, y0 + 5), fill=MINT)
    # casa de forca
    d.rectangle((735, 505, 880, 610), fill=WHITE, outline=DEEP, width=3)
    d.polygon([(735, 505), (807, 465), (880, 505)], fill="#0a4a38")
    ang = t * 4
    cx, cy = 800, 566
    d.ellipse((cx - 26, cy - 26, cx + 26, cy + 26), outline=DEEP, width=4)
    for k in range(4):
        a = ang + k * math.pi / 2
        d.line((cx, cy, cx + 20 * math.cos(a), cy + 20 * math.sin(a)), fill=BLUE, width=5)
    # canal de fuga (jusante)
    d.rectangle((880, 575, 1280, 615), fill="#4aa3e8")
    for row in range(2):
        pts = [(x, 585 + row * 16 + math.sin(x / 50 - t * 2) * 3) for x in range(880, 1281, 10)]
        d.line(pts, fill="#7fc4f4", width=3)
    # subestacao + LT
    d.rectangle((950, 430, 1030, 470), fill="#dfe9e2", outline="#5b6672", width=2)
    d.line((965, 430, 965, 400), fill=DARK, width=3)
    d.line((1015, 430, 1015, 400), fill=DARK, width=3)
    for px, ph in [(1060, 300), (1170, 260)]:
        d.line((px, ph + 130, px, ph), fill="#3a4750", width=4)
        d.line((px - 26, ph + 34, px + 26, ph + 34), fill="#3a4750", width=3)
        d.line((px - 20, ph + 14, px + 20, ph + 14), fill="#3a4750", width=3)
    d.line((1030, 445, 1060, 340), fill="#3a4750", width=2)
    d.arc((1055, 288, 1180, 320), 20, 160, fill="#3a4750", width=2)
    d.arc((1165, 268, 1285, 300), 20, 160, fill="#3a4750", width=2)
    # rotulo de montante/jusante
    d.text((16, 306), "MONTANTE", font=F["small"], fill="#0b3b5e")
    d.text((1160, 620), "JUSANTE", font=F["small"], fill="#0b3b5e")
    # foco da cena
    if foco:
        fx, fy, rx, ry = foco
        pulse = 6 + math.sin(t * 5) * 3
        d.ellipse((fx - rx - pulse, fy - ry - pulse, fx + rx + pulse, fy + ry + pulse), outline=AMBER, width=6)


def make_frame(fn):
    t = fn / FPS
    idx = min(len(SCENES) - 1, int(t // SCENE))
    ts = t - idx * SCENE
    nome, cap, foco = SCENES[idx]
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    if idx == 0:
        d.rectangle((0, 0, W, H), fill=INK)
        k = ease(ts / 1.2)
        d.rounded_rectangle((70, 250, 70 + int(k * 300), 258), radius=4, fill=MINT)
        d.text((70, 286), "TOUR GUIADO · GRANDE PORTE", font=F["kick"], fill="#73ead8")
        d.text((70, 322), "Anatomia de uma usina", font=F["mega"], fill=WHITE)
        d.text((70, 392), "hidrelétrica em operação", font=F["mega"], fill=WHITE)
        sub = ease((ts - .8) / 1.0)
        if sub > 0:
            d.text((70, 470), cap, font=F["small"], fill=(int(199 * sub), int(228 * sub), int(222 * sub)))
        return im
    if idx == len(SCENES) - 1:
        d.rectangle((0, 0, W, H), fill=INK)
        d.text((70, 300), "Do rio à rede — tudo isso passa pelo licenciamento.", font=F["title"], fill=WHITE)
        d.text((70, 360), cap, font=F["small"], fill="#c7e4de")
        d.rounded_rectangle((70, 430, 330, 478), 24, GREEN)
        d.text((100, 442), "Abrir a Formação", font=F["tag"], fill=WHITE)
        return im
    draw_plant(d, t, foco)
    # faixa de titulo da cena
    d.rounded_rectangle((40, 34, 40 + 24 + int(d.textlength(nome, font=F["title"])) + 30, 92), 12, "#071f1dd0")
    d.rectangle((40, 34, 47, 92), fill=AMBER)
    d.text((64, 48), nome, font=F["title"], fill=WHITE)
    # legenda inferior
    d.rounded_rectangle((40, 636, 1240, 706), 10, "#071f1de6")
    d.rectangle((40, 636, 47, 706), fill=MINT)
    fade = min(1.0, ts * 4)
    cf = int(255 * fade)
    d.text((64, 656), cap, font=F["cap"], fill=(cf, cf, cf))
    # progresso
    d.rounded_rectangle((40, 622, 1240, 628), radius=3, fill="#224d49")
    d.rounded_rectangle((40, 622, 40 + int(1200 * t / DURATION), 628), radius=3, fill=AMBER)
    return im


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "tour-usina.mp4"
    wr = imageio_ffmpeg.write_frames(str(path), (W, H), fps=FPS, quality=7, codec="libx264",
                                     macro_block_size=1, output_params=["-movflags", "+faststart"])
    wr.send(None)
    for fn in range(FPS * DURATION):
        wr.send(make_frame(fn).tobytes())
    wr.close()
    lines = ["WEBVTT", ""]
    for i, (nome, cap, _) in enumerate(SCENES):
        a, b = i * SCENE, (i + 1) * SCENE
        fmt = lambda s: f"00:{int(s//60):02d}:{s%60:06.3f}"
        lines += [f"{fmt(a)} --> {fmt(b)}", cap, ""]
    (OUT / "tour-usina.vtt").write_text("\n".join(lines), encoding="utf-8")
    make_frame(int(4.5 * SCENE * FPS)).save(OUT / "tour-usina-poster.png")
    print("tour-usina.mp4", path.stat().st_size, f"{DURATION}s")


if __name__ == "__main__":
    main()
