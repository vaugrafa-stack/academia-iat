# -*- coding: utf-8 -*-
"""Uma videoaula propria para CADA secao do POP, narrada e legendada.

Por que existe. Ate aqui todas as subaulas de um modulo mostravam o mesmo
video: o video do modulo. Quem abria 18.3 e 18.10 via a mesma peca, o que
esvazia o recurso. Agora cada secao tem um video montado a partir do texto
dela mesma.

O roteiro NAO e inventado: as falas sao frases do proprio POP, recortadas e
encurtadas. A ordem de preferencia para os pontos e:
  1. passos numerados da secao ("1. Abrir o protocolo..."), que ja sao roteiro;
  2. frases da prosa da secao;
  3. primeira coluna do quadro, quando a secao e um quadro.

Formato enxuto de proposito: 960x540, 15 fps, cerca de 20 s. No formato dos
videos de modulo (1280x720, 30 s, 1,7 MB) as 160 aulas dariam 275 MB, peso
que inviabiliza o deploy estatico.

Uso:
    python tools/build_lesson_videos.py            # todas as aulas
    python tools/build_lesson_videos.py pop-section-057 pop-section-060
    python tools/build_lesson_videos.py --amostra 3
"""
from __future__ import annotations

import json
import math
import re
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".video_tools"))

from PIL import Image, ImageDraw, ImageFont  # noqa: E402
import imageio_ffmpeg  # noqa: E402

W, H, FPS = 960, 540, 15
OUT = ROOT / "public" / "media" / "aula"
POP = json.loads((ROOT / "src" / "data" / "pop-content.json").read_text(encoding="utf-8"))

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TTS = ROOT / "tools" / "tts"
PIPER = TTS / "piper" / "piper.exe"
MODEL = TTS / "pt_BR-faber-medium.onnx"
TMP = TTS / "_tmp_aula"
TMP.mkdir(parents=True, exist_ok=True)

INK = "#0b1f1b"; DEEP = "#0e3630"; WHITE = "#ffffff"; MUTED = "#a9c2ba"
ACCENTS = ["#57d8bf", "#4cc4f5", "#f3bd4f", "#7ec8a9", "#9fb7ff", "#f0917e"]

T_ABERTURA, T_ESSENCIA, T_PONTO, T_FECHO = 3.0, 3.8, 3.6, 2.6


def font(size, bold=False):
    return ImageFont.truetype(r"C:\Windows\Fonts\segoeui" + ("b" if bold else "") + ".ttf", size)


F = {"mega": font(38, True), "title": font(26, True), "cap": font(19, True),
     "small": font(14), "kick": font(13, True), "num": font(17, True), "corpo": font(17)}


# --------------------------------------------------------------- roteiro

# Abreviacoes que nao encerram frase; sem isto "art. 25" viraria duas falas.
_ABREV = r"(?<!\bart)(?<!\bn[ºo])(?<!\bnº)(?<!\bDr)(?<!\bSr)(?<!\bfig)(?<!\bp)(?<!\binc)"
_FIM = re.compile(_ABREV + r"(?<=[.;])\s+(?=[A-ZÀ-ÚÁÉÍÓÚÂÊÔÃÕ0-9])")


def frases(texto: str):
    """Quebra em frases utilizaveis como fala."""
    out = []
    for f in _FIM.split(texto or ""):
        f = re.sub(r"\s+", " ", f).strip()
        if len(f) < 35 or len(f) > 400:
            continue
        if re.match(r"^(Quadro|Tabela|Figura)\s+\d", f):
            continue
        out.append(f.rstrip(";").rstrip("."))
    return out


def encurtar(t: str, limite=175):
    """Encurta preservando limite de oracao. Corte no meio de sintagma faz a
    fala soar interrompida ("no ambito do Instituto Agua e"), entao a virgula e
    procurada com folga antes de recorrer ao espaco. Devolve (texto, cortado)
    para que a legenda possa sinalizar continuacao sem que a narracao leia o
    sinal."""
    t = re.sub(r"\s+", " ", t).strip().rstrip(".;,")
    if len(t) <= limite:
        return t, False
    corte = t.rfind(",", 60, limite + 45)
    if corte < 0:
        corte = t.rfind(";", 60, limite + 45)
    if corte < 0:
        corte = t.rfind(" ", 60, limite)
    return t[: corte if corte > 0 else limite].rstrip(",; "), True


def roteiro(sec, blocos, tabelas):
    """Monta o roteiro de uma secao a partir do conteudo dela."""
    paras = [blocos[b]["paragraph"]["text"].strip()
             for b in sec.get("blockIds", [])
             if blocos.get(b) and blocos[b].get("type") == "paragraph"
             and blocos[b].get("paragraph", {}).get("text", "").strip()]
    ehpasso = [bool(re.match(r"^\d+\.\s", p)) for p in paras]
    passos = [re.sub(r"^\d+\.\s*", "", p) for p, e in zip(paras, ehpasso) if e]
    # Prosa que vem DEPOIS da lista numerada e nota de rodape do procedimento,
    # nao abertura. Usar essa nota como frase de entrada colocava o passo final
    # antes do passo 1 no video.
    primeiro = ehpasso.index(True) if True in ehpasso else len(paras)
    def _limpa(seq):
        return " ".join(p for p, e in seq if not e
                        and not re.match(r"^(Quadro|Tabela|Figura)\s+\d", p))
    prosa = _limpa(list(zip(paras, ehpasso))[:primeiro]) if passos else _limpa(list(zip(paras, ehpasso)))
    quadros = [tabelas[b["tableId"]] for b in
               (blocos[i] for i in sec.get("blockIds", []) if blocos.get(i))
               if b.get("type") == "table" and tabelas.get(b.get("tableId"))]

    fs = frases(prosa)
    essencia = encurtar(fs[0]) if fs else None
    pontos = []

    if passos:
        # Sem abertura propria, o passo 1 vira a frase de entrada e os
        # seguintes viram os pontos, preservando a ordem do procedimento.
        if not essencia:
            essencia = encurtar(passos[0], 175)
            pontos = [encurtar(p, 145) for p in passos[1:5]]
        else:
            pontos = [encurtar(p, 145) for p in passos[:4]]
    if len(pontos) < 4 and len(fs) > 1:
        pontos += [encurtar(f, 145) for f in fs[1:1 + (4 - len(pontos))]]
    if not pontos and quadros:
        # secao que e um quadro: a primeira coluna ja e a lista de criterios
        col = []
        for q in quadros:
            for r in q["rows"][1:]:
                c = (r["cells"][0]["text"] or "").strip()
                if 3 < len(c) < 140:
                    col.append(c)
        pontos = [encurtar(c, 145) for c in col[:4]]
        if not essencia and quadros:
            essencia = encurtar(quadros[0].get("title") or quadros[0]["caption"])
    if not essencia and pontos:
        essencia, pontos = pontos[0], pontos[1:]
    return essencia, [p for p in pontos if p and p[0]][:4]


# --------------------------------------------------------------- desenho

def wrap(d, texto, fnt, maxw):
    linhas, linha = [], ""
    for w in (texto or "").split():
        t = (linha + " " + w).strip()
        if d.textlength(t, font=fnt) > maxw:
            linhas.append(linha)
            linha = w
        else:
            linha = t
    if linha:
        linhas.append(linha)
    return linhas


def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def fundo(d, t, accent):
    d.rectangle((0, 0, W, H), fill=INK)
    for row in range(5):
        pts = [(x, 430 + row * 16 + math.sin(x / 120 + t * .5 + row * .8) * (12 + row * 2))
               for x in range(-40, W + 50, 16)]
        d.line(pts, fill=(16, 70 + row * 5, 66 + row * 5), width=2)
    ox = W - 150 + math.sin(t * .3) * 18
    d.ellipse((ox - 130, -90, ox + 130, 170), fill="#0a2b30")
    d.rectangle((0, 0, 6, H), fill=accent)


def frame(spec, n):
    t = n / FPS
    accent = spec["accent"]
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    fundo(d, t, accent)

    cenas = spec["cenas"]
    # rodape comum
    d.rounded_rectangle((44, H - 44, W - 44, H - 38), 3, "#1d423c")
    d.rounded_rectangle((44, H - 44, 44 + int((W - 88) * min(1, t / spec["dur"])), H - 38), 3, accent)
    d.text((44, H - 30), spec["rodape"], font=F["small"], fill=MUTED)

    if t < T_ABERTURA:
        k = ease(t / 1.0)
        d.rounded_rectangle((44, 168, 44 + int(k * 190), 174), 3, accent)
        d.text((44, 196), spec["kicker"], font=F["kick"], fill=accent)
        for i, ln in enumerate(wrap(d, spec["titulo"], F["mega"], W - 110)[:3]):
            d.text((44, 224 + i * 46), ln, font=F["mega"], fill=WHITE)
        s = ease((t - .8) / 1.0)
        if s > 0:
            d.text((44, 400), "VIDEOAULA DA SEÇÃO · ACADEMIA IAT",
                   font=F["kick"], fill=(int(115 * s), int(234 * s), int(216 * s)))
        return im

    if t > spec["dur"] - T_FECHO:
        k = ease((t - (spec["dur"] - T_FECHO)) / .8)
        d.text((44, 190), "Agora leia a seção completa", font=F["title"],
               fill=(int(255 * k), int(255 * k), int(255 * k)))
        for i, ln in enumerate(wrap(d, spec["fecho"], F["corpo"], W - 110)[:3]):
            d.text((44, 240 + i * 26), ln, font=F["corpo"], fill="#c7e4de")
        d.rounded_rectangle((44, 340, 274, 382), 21, "#0a7755")
        d.text((66, 352), "Abrir o texto do POP", font=F["cap"], fill=WHITE)
        return im

    # ---- corpo: cena atual e a legenda dela
    tc = t - T_ABERTURA
    idx, acum = 0, 0.0
    for i, (dur, _leg, _fala) in enumerate(cenas):
        if tc < acum + dur:
            idx = i
            break
        acum += dur
    else:
        idx, acum = len(cenas) - 1, sum(c[0] for c in cenas[:-1])
    local = ease((tc - acum) / .7)

    d.rounded_rectangle((44, 34, 44 + 214, 64), 15, "#10453d", outline="#2a8a78", width=1)
    d.text((58, 41), spec["kicker"], font=F["kick"], fill="#79e3cf")
    for i, ln in enumerate(wrap(d, spec["titulo"], F["title"], W - 110)[:2]):
        d.text((44, 80 + i * 32), ln, font=F["title"], fill=WHITE)

    # trilha de cenas: um marcador por fala, o atual em destaque
    bx = 44
    for i in range(len(cenas)):
        ativo = i == idx
        cor = accent if i <= idx else "#27564f"
        r = 13 if ativo else 9
        cy = 168
        d.ellipse((bx, cy - r, bx + r * 2, cy + r), fill=cor if i <= idx else INK, outline=cor, width=2)
        if ativo:
            d.text((bx + r, cy), str(i + 1), anchor="mm", font=F["num"], fill=INK)
        if i < len(cenas) - 1:
            d.line((bx + r * 2 + 5, cy, bx + 62, cy), fill=cor, width=3)
        bx += 62 + 8

    # cartao da fala
    y0 = 214
    dy = int((1 - local) * 16)
    d.rounded_rectangle((44, y0 + dy, W - 44, y0 + 150 + dy), 14, DEEP, outline="#276b60", width=1)
    d.rectangle((44, y0 + dy, 50, y0 + 150 + dy), fill=accent)
    rot = cenas[idx][1]  # legenda da cena atual
    lines = wrap(d, rot, F["cap"], W - 130)[:5]
    for i, ln in enumerate(lines):
        c = int(255 * min(1.0, local * 1.4))
        d.text((70, y0 + 24 + dy + i * 26), ln, font=F["cap"], fill=(c, c, c))
    return im


# --------------------------------------------------------------- narracao

def synth(texto: str, out: Path):
    p = subprocess.run([str(PIPER), "--model", str(MODEL), "--output_file", str(out)],
                       input=texto.encode("utf-8"), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if p.returncode != 0 or not out.exists():
        raise RuntimeError("piper falhou: " + texto[:50])


def trilha(falas, dur, out_wav: Path):
    sr = sw = ch = None
    clips = []
    for i, (start, texto) in enumerate(falas):
        w = TMP / f"l{i}.wav"
        synth(texto, w)
        with wave.open(str(w), "rb") as wv:
            sr, sw, ch = wv.getframerate(), wv.getsampwidth(), wv.getnchannels()
            clips.append([start, wv.readframes(wv.getnframes())])
    buf = bytearray(int(dur * sr) * sw * ch)
    cursor = 0
    for start, data in clips:
        off = max(int(start * sr), cursor)
        b0 = off * sw * ch
        b1 = min(b0 + len(data), len(buf))
        buf[b0:b1] = data[: b1 - b0]
        cursor = b1 // (sw * ch) + int(0.16 * sr)
    with wave.open(str(out_wav), "wb") as wv:
        wv.setnchannels(ch); wv.setsampwidth(sw); wv.setframerate(sr)
        wv.writeframes(bytes(buf))


# --------------------------------------------------------------- montagem

def vtt(spec, path: Path):
    linhas = ["WEBVTT", ""]
    t = T_ABERTURA
    for dur, legenda, _fala in spec["cenas"]:
        linhas += [f"{t//60:02.0f}:{t%60:06.3f} --> {(t+dur)//60:02.0f}:{(t+dur)%60:06.3f}", legenda, ""]
        t += dur
    path.write_text("\n".join(linhas), encoding="utf-8")


def montar(spec):
    base = OUT / spec["id"]
    mudo = base.with_suffix(".mudo.mp4")
    writer = imageio_ffmpeg.write_frames(
        str(mudo), (W, H), fps=FPS, quality=6, codec="libx264",
        macro_block_size=1, output_params=["-movflags", "+faststart", "-preset", "slow"])
    writer.send(None)
    for n in range(int(spec["dur"] * FPS)):
        writer.send(frame(spec, n).tobytes())
    writer.close()

    falas = [(0.9, spec["titulo"])]
    t = T_ABERTURA
    for dur, _legenda, fala in spec["cenas"]:
        falas.append((t + 0.25, fala))
        t += dur
    wav = TMP / (spec["id"] + ".wav")
    trilha(falas, spec["dur"], wav)

    final = base.with_suffix(".mp4")
    subprocess.run([FFMPEG, "-y", "-i", str(mudo), "-i", str(wav),
                    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "56k", "-ac", "1", "-shortest", str(final)],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    mudo.unlink(missing_ok=True)
    vtt(spec, base.with_suffix(".vtt"))
    frame(spec, int((T_ABERTURA + 1.2) * FPS)).save(base.with_suffix(".jpg"), quality=72)
    return final.stat().st_size


def specs():
    blocos = {b["id"]: b for b in POP["blocks"]}
    tabelas = {t["id"]: t for t in POP["tables"]}
    import subprocess as sp
    trilhas = json.loads(sp.run(
        [_node(), "-e", _JS], capture_output=True, text=True, encoding="utf-8",
        cwd=str(ROOT)).stdout)
    fora = []
    for sec in POP["sections"]:
        if sec.get("navigationOnly") or not sec.get("title"):
            continue
        tr = trilhas.get(sec["id"])
        if not tr:
            continue
        essencia, pontos = roteiro(sec, blocos, tabelas)
        # a legenda sinaliza continuacao com reticencias; a narracao nao le o
        # sinal, entao fala e legenda sao guardadas separadas
        cenas = []
        if essencia and essencia[0]:
            cenas.append((T_ESSENCIA, essencia[0] + (" …" if essencia[1] else ""), essencia[0]))
        cenas += [(T_PONTO, p[0] + (" …" if p[1] else ""), p[0]) for p in pontos]
        if not cenas:
            fora.append(sec["id"])
            continue
        titulo = ((sec.get("number", "") + " ") if sec.get("number") else "") + sec["title"]
        yield {
            "id": sec["id"],
            "titulo": titulo.strip(),
            "kicker": f"{tr['code']} · SEÇÃO DO POP",
            "accent": ACCENTS[int(tr["code"][1:]) % len(ACCENTS)],
            "cenas": cenas,
            "dur": T_ABERTURA + sum(c[0] for c in cenas) + T_FECHO,
            "rodape": f"{tr['code']} {tr['title'][:52]} · confirme a norma vigente",
            "fecho": f"Esta é a seção {titulo[:70]} do POP. O texto integral, os quadros e a prática estão na aula.",
        }
    if fora:
        print("sem roteiro possivel:", len(fora), fora[:6])


def _node():
    return "node"


_JS = """
import('./src/courseData.js').then(async cd=>{
 const {derivarAulas}=await import('./src/lessons.js');
 const fs=await import('node:fs');
 const pop=JSON.parse(fs.readFileSync('src/data/pop-content.json','utf8'));
 const {lessons}=derivarAulas(pop,cd.tracks);
 const out={};
 for(const l of lessons){const t=cd.tracks.find(x=>x.id===l.trackId);out[l.id]={code:t.code,title:t.title}}
 process.stdout.write(JSON.stringify(out));
});
"""


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    args = [a for a in sys.argv[1:]]
    limite = None
    if "--amostra" in args:
        i = args.index("--amostra")
        limite = int(args[i + 1])
        args = args[:i] + args[i + 2:]
    alvo = set(args) or None

    todos = list(specs())
    if alvo:
        todos = [s for s in todos if s["id"] in alvo]
    if limite:
        todos = todos[:limite]

    total = 0
    manifesto = {}
    for i, s in enumerate(todos, 1):
        try:
            tam = montar(s)
        except Exception as e:  # noqa: BLE001
            print(f"[{i}/{len(todos)}] FALHOU {s['id']}: {e}")
            continue
        total += tam
        manifesto[s["id"]] = {"dur": round(s["dur"], 1), "cenas": len(s["cenas"])}
        print(f"[{i}/{len(todos)}] {s['id']} {s['titulo'][:44]} {tam/1000:.0f} kB")

    if not alvo and not limite:
        # O app le este manifesto para saber quais secoes tem video proprio; as
        # que faltarem caem no video do modulo.
        (OUT / "manifest.json").write_text(json.dumps(manifesto, ensure_ascii=False), encoding="utf-8")
        (ROOT / "src" / "data" / "aula-media.json").write_text(
            json.dumps(manifesto, ensure_ascii=False), encoding="utf-8")
    print(f"OK {len(manifesto)} videoaulas, {total/1e6:.1f} MB")
