# -*- coding: utf-8 -*-
"""Uma videoaula propria para CADA secao do POP, narrada e legendada.

Por que existe. Ate aqui todas as subaulas de um modulo mostravam o mesmo
video: o video do modulo. Quem abria 18.3 e 18.10 via a mesma peca, o que
esvazia o recurso. Agora cada secao tem um video montado a partir do texto
dela mesma.

O roteiro NAO e inventado: as falas sao frases completas do proprio POP.
A ordem de preferencia para os pontos e:
  1. passos numerados da secao ("1. Abrir o protocolo..."), que ja sao roteiro;
  2. frases da prosa da secao;
  3. primeira coluna do quadro, quando a secao e um quadro.

Formato enxuto de proposito: 960x540, 15 fps. A duracao e derivada da fala
pt-BR real e garante no maximo 17 caracteres por segundo nas legendas.

Uso:
    python tools/build_lesson_videos.py            # todas as aulas
    python tools/build_lesson_videos.py pop-section-057 pop-section-060
    python tools/build_lesson_videos.py --amostra 3
    python tools/build_lesson_videos.py --dry-run --amostra 3
"""
from __future__ import annotations

import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
import hashlib
import json
import math
import os
import re
import shlex
import shutil
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".video_tools"))

from PIL import Image, ImageDraw, ImageFont  # noqa: E402
import imageio_ffmpeg  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fala import texto_falado  # noqa: E402
from segmentacao import frases  # noqa: E402
from legendas import (  # noqa: E402
    LIMITE_LINHA,
    dividir_fala,
    envolver,
    escrever_vtt,
)

W, H, FPS = 960, 540, 15
DEFAULT_OUT = ROOT / "public" / "media" / "aula"
OUT = DEFAULT_OUT
PUBLIC_POP = ROOT / "src" / "data" / "pop-public-content.json"
POP = json.loads(PUBLIC_POP.read_text(encoding="utf-8"))

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TTS = ROOT / "tools" / "tts"
PIPER = TTS / "piper" / "piper.exe"
MODEL = TTS / "pt_BR-faber-medium.onnx"
TMP = TTS / "_tmp_aula"
TMP.mkdir(parents=True, exist_ok=True)
PIPER_ARGS: list[str] = []

INK = "#0b1f1b"; DEEP = "#0e3630"; WHITE = "#ffffff"; MUTED = "#a9c2ba"
ACCENTS = ["#57d8bf", "#4cc4f5", "#f3bd4f", "#7ec8a9", "#9fb7ff", "#f0917e"]

T_ABERTURA, T_ESSENCIA, T_PONTO, T_FECHO = 3.0, 3.8, 3.6, 2.6
MAX_CPS = 17.0
MAX_SCENE_CHARS = 220
MAX_CARD_LINES = 4
GENERATOR_VERSION = 3


def font(size, bold=False):
    return ImageFont.truetype(r"C:\Windows\Fonts\segoeui" + ("b" if bold else "") + ".ttf", size)


F = {"mega": font(38, True), "title": font(26, True), "cap": font(19, True),
     "small": font(14), "kick": font(13, True), "num": font(17, True), "corpo": font(17)}


# --------------------------------------------------------------- roteiro

def encurtar(t: str, limite=175):
    """Normaliza sem truncar.

    O argumento ``limite`` permanece para compatibilidade com o montador de
    roteiros, mas não corta mais a fonte. A duração da cena agora é calculada a
    partir do áudio e do teto de caracteres por segundo; portanto uma frase
    longa recebe mais tempo em vez de terminar no meio.
    """
    t = re.sub(r"\s+", " ", t).strip().rstrip(".;,")
    return t, False


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
    # Quadro: completa quando a secao rende menos de tres falas, nao so quando
    # nao rende nenhuma. Varias secoes do POP sao uma frase curta seguida do
    # quadro, e o video ficava com uma cena so.
    if len(pontos) < 3 and quadros:
        pontos += _linhas_quadro(quadros, 145)[: 4 - len(pontos)]
        if not essencia:
            essencia = _abertura_quadro(quadros[0])

    # Secao magra: com uma ou duas falas sobra tempo, entao a frase pode ser
    # mais longa em vez de cortada no limite pensado para cinco cenas.
    if len(pontos) <= 1:
        if essencia:
            essencia = encurtar(essencia[0] if isinstance(essencia, tuple) else essencia, 260)
        pontos = [encurtar(p[0], 240) for p in pontos]

    if not essencia and pontos:
        essencia, pontos = pontos[0], pontos[1:]
    return essencia, [p for p in pontos if p and p[0]][:4]


def _linhas_quadro(quadros, limite):
    """Transforma linhas de quadro em falas.

    A primeira coluna costuma ser um rotulo de uma palavra ("Status",
    "Outorga"). Narrar rotulo solto nao ensina nada, entao ele so vira fala
    acompanhado da coluna que o explica: "Status: pendente de validacao...".
    """
    out = []
    for q in quadros:
        for r in q["rows"][1:]:
            celulas = [(c["text"] or "").strip() for c in r["cells"]]
            if not celulas or not celulas[0]:
                continue
            rot = celulas[0]
            desc = next((c for c in celulas[1:] if c), "")
            texto = f"{rot}: {desc}" if len(rot) < 45 and desc else rot
            if len(texto) < 30:
                continue
            out.append(encurtar(texto, limite))
    return out


def _abertura_quadro(q):
    """Frase de entrada de uma secao que e um quadro: diz o que ele relaciona,
    usando o titulo e os cabecalhos das colunas."""
    titulo = (q.get("title") or q.get("caption") or "").strip().rstrip(".")
    cab = [(c["text"] or "").strip() for c in q["rows"][0]["cells"]] if q.get("rows") else []
    cab = [c for c in cab if c]
    if titulo and len(cab) >= 2:
        return encurtar(f"{titulo}: o quadro do POP relaciona {', '.join(cab[:-1])} e {cab[-1]}", 240)
    return encurtar(titulo or "Quadro do POP", 240)


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


def cabe_no_cartao(
    texto: str,
    max_linhas: int = MAX_CARD_LINES,
    max_caracteres: int = MAX_SCENE_CHARS,
) -> bool:
    """Confere o limite visual com a mesma fonte e largura usadas no quadro."""
    medidor = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    return (
        len(texto) <= max_caracteres
        and len(wrap(medidor, texto, F["cap"], W - 130)) <= max_linhas
    )


def segmentar_para_cartao(
    texto: str,
    max_linhas: int = MAX_CARD_LINES,
    max_caracteres: int = MAX_SCENE_CHARS,
) -> list[str]:
    """Divide prosa longa somente em fronteiras semânticas.

    A legenda e a fala continuam contendo 100% do trecho selecionado. Pontos,
    ponto e vírgula, dois-pontos e vírgulas são preservados no fim do segmento,
    deixando explícito quando a próxima tela é continuação da mesma frase.
    """
    restante = re.sub(r"\s+", " ", texto or "").strip()
    segmentos = []
    while restante and not cabe_no_cartao(restante, max_linhas, max_caracteres):
        cortes = [
            match.end()
            for match in re.finditer(r"[.!?;:,](?=\s|$)", restante)
            if match.end() < len(restante)
        ]
        viaveis = [
            corte
            for corte in cortes
            if cabe_no_cartao(
                restante[:corte].rstrip(),
                max_linhas,
                max_caracteres,
            )
        ]
        if not viaveis:
            # Último recurso: fronteira de palavra. O checker reconhece a cue
            # seguinte como continuação porque a anterior não terminou em
            # pontuação final. Nenhuma palavra é cortada ou alterada.
            cortes_palavra = [match.start() for match in re.finditer(r"\s+", restante)]
            viaveis = [
                corte
                for corte in cortes_palavra
                if cabe_no_cartao(
                    restante[:corte].rstrip(),
                    max_linhas,
                    max_caracteres,
                )
            ]
            if not viaveis:
                raise ValueError(
                    "palavra isolada excede o limite visual do cartão: "
                    + restante[:90]
                )
            corte = max(viaveis)
            segmentos.append(restante[:corte].rstrip())
            restante = restante[corte:].lstrip()
            continue
        corte = max(viaveis)
        segmentos.append(restante[:corte].rstrip())
        restante = restante[corte:].lstrip()
    if restante:
        segmentos.append(restante)
    if (
        not segmentos
        or any(
            not cabe_no_cartao(item, max_linhas, max_caracteres)
            for item in segmentos
        )
        or " ".join(segmentos) != re.sub(r"\s+", " ", texto or "").strip()
    ):
        raise ValueError("segmentação não respeitou o limite visual do cartão")
    return segmentos


def bloco_ativo(spec, indice_cena, decorrido):
    """Texto do bloco de legenda visivel em `decorrido` segundos desta cena.

    A cena e sintetizada como uma fala so, mas a legenda dela e repartida em
    blocos legiveis por legendas.dividir_fala. O cartao do video precisa
    mostrar o mesmo bloco que a faixa .vtt mostra naquele instante, senao os
    dois textos divergem na tela.

    Cai no texto inteiro da cena quando a reparticao nao se aplica, para o
    gerador continuar funcionando com spec montado a mao em teste.
    """
    dur, legenda, _fala = spec["cenas"][indice_cena]
    blocos = dividir_fala(legenda, 0.0, max(dur, 0.2))
    if not blocos:
        return legenda
    for inicio, fim, linhas in blocos:
        if decorrido < fim or (inicio, fim, linhas) == blocos[-1]:
            return " ".join(linhas)
    return " ".join(blocos[-1][2])


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
    abertura = spec.get("t_abertura", T_ABERTURA)
    fecho = spec.get("t_fecho", T_FECHO)
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    fundo(d, t, accent)

    cenas = spec["cenas"]
    # rodape comum
    d.rounded_rectangle((44, H - 44, W - 44, H - 38), 3, "#1d423c")
    d.rounded_rectangle((44, H - 44, 44 + int((W - 88) * min(1, t / spec["dur"])), H - 38), 3, accent)
    d.text((44, H - 30), spec["rodape"], font=F["small"], fill=MUTED)

    if t < abertura:
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

    if t > spec["dur"] - fecho:
        k = ease((t - (spec["dur"] - fecho)) / .8)
        d.text((44, 190), "Agora leia a seção completa", font=F["title"],
               fill=(int(255 * k), int(255 * k), int(255 * k)))
        for i, ln in enumerate(wrap(d, spec["fecho"], F["corpo"], W - 110)[:3]):
            d.text((44, 240 + i * 26), ln, font=F["corpo"], fill="#c7e4de")
        d.rounded_rectangle((44, 340, 274, 382), 21, "#0a7755")
        d.text((66, 352), "Abrir o texto do POP", font=F["cap"], fill=WHITE)
        return im

    # ---- corpo: cena atual e a legenda dela
    tc = t - abertura
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
    # O cartao mostra o BLOCO DE LEGENDA ativo neste instante, nao a cena
    # inteira. Antes ele despejava a fala toda de uma vez, ficava parada por
    # ate 11 segundos e a pessoa lia adiantada em vez de acompanhar a narracao.
    #
    # Isto tambem conserta uma incoerencia: o .vtt reparte a fala em blocos, e
    # o cartao repartia nada. Quem ligasse a faixa de legenda via dois textos
    # diferentes ao mesmo tempo. Agora os dois saem da MESMA segmentacao.
    rot = bloco_ativo(spec, idx, tc - acum)
    lines = wrap(d, rot, F["cap"], W - 130)[:3]
    for i, ln in enumerate(lines):
        c = int(255 * min(1.0, local * 1.4))
        d.text((70, y0 + 24 + dy + i * 26), ln, font=F["cap"], fill=(c, c, c))
    return im


# --------------------------------------------------------------- narracao

def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as wav:
        return wav.getnframes() / wav.getframerate()


def synth(texto: str, out: Path):
    comando = [
        str(PIPER),
        "--model",
        str(MODEL),
        *PIPER_ARGS,
        "--output_file",
        str(out),
    ]
    p = subprocess.run(
        comando,
        input=texto_falado(texto).encode("utf-8"),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    if p.returncode != 0 or not out.exists():
        detalhe = p.stderr.decode("utf-8", errors="replace").strip().splitlines()
        raise RuntimeError("piper falhou: " + (detalhe[-1] if detalhe else texto[:50]))


def preparar_narracao(spec):
    """Sintetiza antes de desenhar e deriva os tempos do áudio real.

    Cada cue recebe tempo suficiente tanto para a fala quanto para leitura a
    ``MAX_CPS``. Assim não há aceleração artificial nem corte de frase.
    """
    titulo_wav = TMP / f"{spec['id']}-titulo.wav"
    synth(spec["titulo"], titulo_wav)
    titulo_dur = wav_duration(titulo_wav)
    titulo_inicio = 0.55
    titulo_legenda_dur = max(
        titulo_dur + 0.2,
        len(re.sub(r"\s+", " ", spec["titulo"]).strip()) / MAX_CPS + 0.18,
    )
    abertura = math.ceil(
        max(T_ABERTURA, titulo_inicio + titulo_legenda_dur + 0.45) * FPS
    ) / FPS
    titulo_fim = titulo_inicio + titulo_legenda_dur

    cenas = []
    audios = []
    for index, (_dur_antiga, legenda, fala) in enumerate(spec["cenas"]):
        arquivo = TMP / f"{spec['id']}-cena-{index:02d}.wav"
        synth(fala, arquivo)
        fala_dur = wav_duration(arquivo)
        texto_legenda = re.sub(r"\s+", " ", legenda).strip()
        leitura_dur = len(texto_legenda) / MAX_CPS + 0.18
        cena_dur = math.ceil(max(2.8, fala_dur + 0.62, leitura_dur) * FPS) / FPS
        cenas.append((cena_dur, texto_legenda, fala))
        audios.append(arquivo)

    duracao_total = (
        round(abertura * FPS)
        + sum(round(c[0] * FPS) for c in cenas)
        + round(T_FECHO * FPS)
    ) / FPS
    preparado = {
        **spec,
        "cenas": cenas,
        "t_abertura": abertura,
        "t_fecho": T_FECHO,
        "titulo_cue": (titulo_inicio, titulo_fim, spec["titulo"]),
        "dur": duracao_total,
    }
    clips = [(titulo_inicio, titulo_wav)]
    cursor = abertura
    for cena, arquivo in zip(cenas, audios):
        clips.append((cursor + 0.18, arquivo))
        cursor += cena[0]
    return preparado, clips


def trilha(clips, dur, out_wav: Path):
    sr = sw = ch = None
    dados = []
    for start, arquivo in clips:
        with wave.open(str(arquivo), "rb") as wv:
            formato = (wv.getframerate(), wv.getsampwidth(), wv.getnchannels())
            if sr is None:
                sr, sw, ch = formato
            elif formato != (sr, sw, ch):
                raise RuntimeError(f"formatos WAV divergentes em {arquivo.name}")
            dados.append([start, wv.readframes(wv.getnframes())])
    buf = bytearray(int(dur * sr) * sw * ch)
    cursor = 0
    for start, data in dados:
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
    """Escreve a legenda ja segmentada para leitura.

    Ate 31/07/2026 esta funcao escrevia uma cue por cena com a fala inteira
    numa linha so. A medicao dos 159 arquivos encontrou 88 por cento dos
    blocos com linha acima de 42 caracteres, a maior com 220, e 64 por cento
    acima de 6 segundos na tela. O tempo estava certo, porque vem da duracao
    real do WAV; a segmentacao e que faltava. Ela agora mora em legendas.py,
    compartilhada com refazer_legendas.py.

    A cue de titulo continua inteira: o portao check-videoaulas compara o
    texto dela com o titulo da aula. Quebrar em linhas mantem a comparacao
    valida, porque o portao junta as linhas com espaco; dividir em cues nao.
    """
    blocos = blocos_da_legenda(spec)
    # O ledger de mídia registra os bytes que serão publicados pelo Git.
    # `write_text` traduz `\n` para CRLF no Windows, embora .gitattributes
    # normalize VTT para LF no commit; isso fazia o CI Linux ver outro hash.
    texto = escrever_vtt(blocos).replace("\r\n", "\n").replace("\r", "\n")
    path.write_bytes(texto.encode("utf-8"))
    return len(blocos)


def blocos_da_legenda(preparado):
    """A segmentacao, num lugar so.

    O manifesto declara a quantidade de cues e o pico de caracteres por
    segundo, e o portao confere os dois contra o arquivo. Se a contagem for
    calculada aqui e a legenda escrita ali, os dois divergem no primeiro
    ajuste. Uma fonte, dois consumidores.
    """
    titulo_inicio, titulo_fim, titulo = preparado["titulo_cue"]
    blocos = [(titulo_inicio, titulo_fim, envolver(titulo, LIMITE_LINHA, 3))]
    t = preparado.get("t_abertura", T_ABERTURA)
    for dur, legenda, _fala in preparado["cenas"]:
        blocos.extend(dividir_fala(legenda, t, dur))
        t += dur
    return blocos


def montar(spec):
    spec, clips = preparar_narracao(spec)
    base = OUT / spec["id"]
    mudo = base.with_suffix(".mudo.mp4")
    writer = imageio_ffmpeg.write_frames(
        str(mudo), (W, H), fps=FPS, quality=6, codec="libx264",
        macro_block_size=1,
        output_params=[
            "-movflags", "+faststart",
            "-preset", "slow",
            "-threads", "1",
            "-map_metadata", "-1",
        ])
    writer.send(None)
    for n in range(int(spec["dur"] * FPS)):
        writer.send(frame(spec, n).tobytes())
    writer.close()

    wav = TMP / (spec["id"] + ".wav")
    trilha(clips, spec["dur"], wav)

    final = base.with_suffix(".mp4")
    subprocess.run([FFMPEG, "-y", "-i", str(mudo), "-i", str(wav),
                    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "56k", "-ac", "1",
                    "-map_metadata", "-1", "-metadata", "creation_time=1970-01-01T00:00:00Z",
                    "-shortest", str(final)],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    mudo.unlink(missing_ok=True)
    vtt(spec, base.with_suffix(".vtt"))
    frame(spec, int((spec["t_abertura"] + 1.2) * FPS)).save(
        base.with_suffix(".jpg"),
        quality=72,
        optimize=True,
    )
    return final.stat().st_size, spec


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
        # Fala e legenda ficam separadas porque somente a fala recebe expansão
        # fonética. Ambas preservam a frase completa da fonte.
        cenas_brutas = []
        if essencia and essencia[0]:
            cenas_brutas.append((T_ESSENCIA, essencia[0], essencia[0]))
        cenas_brutas += [(T_PONTO, p[0], p[0]) for p in pontos]
        cenas = []
        for duracao, legenda, _fala in cenas_brutas:
            for segmento in segmentar_para_cartao(legenda):
                cenas.append((duracao, segmento, segmento))
        if not cenas:
            fora.append(sec["id"])
            continue
        titulo = ((sec.get("number", "") + " ") if sec.get("number") else "") + sec["title"]
        yield {
            "id": sec["id"],
            "sourceSha256": section_source_sha256(sec, blocos, tabelas),
            "titulo": titulo.strip(),
            "kicker": f"{tr['code']} · SEÇÃO DO POP",
            "accent": ACCENTS[int(tr["code"][1:]) % len(ACCENTS)],
            "cenas": cenas,
            "dur": T_ABERTURA + sum(c[0] for c in cenas) + T_FECHO,
            "rodape": f"{tr['code']} {tr['title'][:52]} · confirme a norma vigente",
            "fecho": f"Esta é a seção {titulo[:70]} do POP. O conteúdo disponibilizado, os quadros e a prática estão na aula.",
        }
    if fora:
        print("sem roteiro possivel:", len(fora), fora[:6])


def _node():
    return "node"


def section_source_sha256(sec, blocos, tabelas):
    """Fingerprint canônico do conteúdo que pode originar a videoaula.

    O hash é por seção, não pelo DOCX inteiro: uma correção localizada
    invalida somente as mídias cujo roteiro realmente pode ter mudado.
    """
    source_blocks = []
    for block_id in sec.get("blockIds", []):
        block = blocos.get(block_id) or {}
        if block.get("type") == "paragraph":
            source_blocks.append({
                "type": "paragraph",
                "text": block.get("paragraph", {}).get("text", ""),
            })
        elif block.get("type") == "table":
            table = tabelas.get(block.get("tableId")) or {}
            source_blocks.append({
                "type": "table",
                "title": table.get("title") or table.get("caption") or "",
                "rows": [
                    [cell.get("text", "") for cell in row.get("cells", [])]
                    for row in table.get("rows", [])
                ],
            })
    payload = {
        "id": sec.get("id", ""),
        "number": sec.get("number", ""),
        "title": sec.get("title", ""),
        "blocks": source_blocks,
    }
    canonical = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


_JS = """
import('./src/courseData.js').then(async cd=>{
 const {derivarAulas}=await import('./src/lessons.js');
 const fs=await import('node:fs');
 const pop=JSON.parse(fs.readFileSync('src/data/pop-public-content.json','utf8'));
 const {lessons}=derivarAulas(pop,cd.tracks);
 const out={};
 for(const l of lessons){const t=cd.tracks.find(x=>x.id===l.trackId);out[l.id]={code:t.code,title:t.title}}
 process.stdout.write(JSON.stringify(out));
});
"""


def argumentos():
    parser = argparse.ArgumentParser(
        description="Gera videoaulas narradas e legendadas a partir das seções do POP.",
    )
    parser.add_argument("ids", nargs="*", help="IDs específicos; sem IDs, gera todas as aulas")
    parser.add_argument("--amostra", type=int, help="limita a quantidade sem atualizar manifestos")
    parser.add_argument("--dry-run", action="store_true",
                        help="valida roteiros e configuração sem sintetizar nem gravar mídia")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUT,
                        help="diretório de saída (padrão: public/media/aula)")
    parser.add_argument("--fps", type=int, default=FPS)
    parser.add_argument(
        "--workers",
        type=int,
        default=min(4, os.cpu_count() or 1),
        help="aulas renderizadas em paralelo (padrão: até 4)",
    )
    parser.add_argument("--max-cps", type=float, default=MAX_CPS,
                        help="teto de caracteres por segundo nas legendas (padrão: 17)")
    parser.add_argument("--piper", type=Path, default=PIPER)
    parser.add_argument("--voice-model", type=Path, default=MODEL)
    parser.add_argument("--ffmpeg", default=FFMPEG)
    parser.add_argument(
        "--piper-extra",
        default=os.environ.get("ACADEMIA_IAT_PIPER_ARGS", ""),
        help="argumentos extras reproduzíveis do Piper, por exemplo '--length_scale 1.05'",
    )
    return parser.parse_args()


def gravar_json_atomico(path: Path, data):
    temporario = path.with_suffix(path.suffix + ".tmp")
    temporario.write_text(
        json.dumps(
            data,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    temporario.replace(path)


def promover_diretorio_atomico(stage: Path, destino: Path):
    """Promove um lote completo sem expor uma coleção parcialmente gerada."""
    backup = destino.parent / f".{destino.name}.backup-{os.getpid()}"
    if backup.exists():
        shutil.rmtree(backup)
    moveu_anterior = False
    try:
        if destino.exists():
            destino.rename(backup)
            moveu_anterior = True
        stage.rename(destino)
    except Exception:
        if moveu_anterior and backup.exists() and not destino.exists():
            backup.rename(destino)
        raise
    if backup.exists():
        shutil.rmtree(backup)


def executavel_disponivel(valor) -> bool:
    return Path(str(valor)).is_file() or shutil.which(str(valor)) is not None


def metadados_da_narracao(preparado):
    # Medido sobre os BLOCOS que vao para o arquivo, nao sobre as cenas: desde
    # que uma cena pode virar varios blocos, contar cena subestima as cues e
    # mede o cps errado, e o portao acusa a divergencia.
    blocos = blocos_da_legenda(preparado)
    taxas_cps = [
        len(re.sub(r"\s+", " ", " ".join(linhas)).strip()) / (fim - inicio)
        for inicio, fim, linhas in blocos
        if fim > inicio
    ]
    return {
        "dur": round(preparado["dur"], 3),
        "cenas": len(preparado["cenas"]),
        "cues": len(blocos),
        "generatorVersion": GENERATOR_VERSION,
        "maxCps": round(max(taxas_cps), 3) if taxas_cps else 0.0,
        "sourceSha256": preparado["sourceSha256"],
    }


def configurar_worker(output, fps, max_cps, piper, model, ffmpeg, piper_args):
    global OUT, FPS, MAX_CPS, PIPER, MODEL, FFMPEG, PIPER_ARGS
    OUT = Path(output)
    FPS = fps
    MAX_CPS = max_cps
    PIPER = Path(piper)
    MODEL = Path(model)
    FFMPEG = ffmpeg
    PIPER_ARGS = list(piper_args)


def gerar_video(spec):
    try:
        tamanho, preparado = montar(spec)
        return {
            "id": spec["id"],
            "titulo": spec["titulo"],
            "tamanho": tamanho,
            "duracao": preparado["dur"],
            "meta": metadados_da_narracao(preparado),
            "erro": None,
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "id": spec["id"],
            "titulo": spec["titulo"],
            "tamanho": 0,
            "duracao": 0,
            "meta": None,
            "erro": str(exc),
        }


def main():
    global OUT, FPS, MAX_CPS, PIPER, MODEL, FFMPEG, PIPER_ARGS
    args = argumentos()
    if args.fps < 10 or args.fps > 60:
        raise SystemExit("--fps deve estar entre 10 e 60")
    if args.workers < 1 or args.workers > 8:
        raise SystemExit("--workers deve estar entre 1 e 8")
    if not 10 <= args.max_cps <= 20:
        raise SystemExit("--max-cps deve estar entre 10 e 20")
    if args.amostra is not None and args.amostra < 1:
        raise SystemExit("--amostra deve ser positiva")

    destino_final = args.output.resolve()
    OUT = destino_final
    FPS = args.fps
    MAX_CPS = args.max_cps
    PIPER = args.piper.resolve()
    MODEL = args.voice_model.resolve()
    FFMPEG = str(args.ffmpeg)
    PIPER_ARGS = shlex.split(args.piper_extra, posix=os.name != "nt")

    todos_disponiveis = list(specs())
    ids_disponiveis = {s["id"] for s in todos_disponiveis}
    desconhecidos = sorted(set(args.ids) - ids_disponiveis)
    if desconhecidos:
        raise SystemExit("IDs de aula desconhecidos: " + ", ".join(desconhecidos))
    alvo = set(args.ids) or None
    todos = [s for s in todos_disponiveis if not alvo or s["id"] in alvo]
    if args.amostra:
        todos = todos[:args.amostra]
    lote_completo = not alvo and not args.amostra
    stage = None
    if lote_completo:
        stage = destino_final.parent / f".{destino_final.name}.staging"
        if stage.exists():
            shutil.rmtree(stage)
        OUT = stage

    print(
        f"configuração: gerador={GENERATOR_VERSION} fps={FPS} "
        f"max_cps={MAX_CPS:g} voz={MODEL.name} aulas={len(todos)} "
        f"workers={args.workers}"
    )
    if args.dry_run:
        cenas = sum(len(s["cenas"]) for s in todos)
        maior = max(
            (len(c[1]), s["id"], c[1][:70]) for s in todos for c in s["cenas"]
        )
        print(
            f"OK dry-run: {len(todos)} roteiros, {cenas} cenas, "
            f"maior legenda={maior[0]} caracteres ({maior[1]})."
        )
        return 0

    faltando = []
    if not executavel_disponivel(PIPER):
        faltando.append(f"Piper: {PIPER}")
    if not MODEL.is_file():
        faltando.append(f"modelo pt-BR: {MODEL}")
    if not executavel_disponivel(FFMPEG):
        faltando.append(f"FFmpeg: {FFMPEG}")
    if faltando:
        raise SystemExit(
            "Dependências de mídia indisponíveis:\n- " + "\n- ".join(faltando)
        )

    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    manifesto = {}
    falhas = []

    def registrar(resultado, indice):
        nonlocal total
        if resultado["erro"]:
            falhas.append((resultado["id"], resultado["erro"]))
            print(
                f"[{indice}/{len(todos)}] FALHOU "
                f"{resultado['id']}: {resultado['erro']}"
            )
            return
        total += resultado["tamanho"]
        manifesto[resultado["id"]] = resultado["meta"]
        print(
            f"[{indice}/{len(todos)}] {resultado['id']} "
            f"{resultado['titulo'][:44]} "
            f"{resultado['tamanho']/1000:.0f} kB · "
            f"{resultado['duracao']:.1f} s"
        )

    if args.workers == 1:
        for indice, spec in enumerate(todos, 1):
            registrar(gerar_video(spec), indice)
    else:
        with ProcessPoolExecutor(
            max_workers=args.workers,
            initializer=configurar_worker,
            initargs=(
                str(OUT),
                FPS,
                MAX_CPS,
                str(PIPER),
                str(MODEL),
                FFMPEG,
                tuple(PIPER_ARGS),
            ),
        ) as executor:
            futuros = [executor.submit(gerar_video, spec) for spec in todos]
            for indice, futuro in enumerate(as_completed(futuros), 1):
                registrar(futuro.result(), indice)

    if falhas:
        if stage and stage.exists():
            shutil.rmtree(stage)
        print(f"FALHA: {len(falhas)} aula(s) não foram geradas; manifestos preservados.")
        return 1

    if lote_completo:
        # Atualização atômica: uma falha nunca publica manifesto parcial.
        gravar_json_atomico(OUT / "manifest.json", manifesto)
        promover_diretorio_atomico(OUT, destino_final)
        OUT = destino_final
        if destino_final == DEFAULT_OUT.resolve():
            gravar_json_atomico(ROOT / "src" / "data" / "aula-media.json", manifesto)
    else:
        # Build parcial grava os MP4, as legendas e as capas direto no destino,
        # mas antes não tocava no manifesto. O objetivo era não publicar um
        # manifesto que descrevesse só o subconjunto; o efeito era pior: a mídia
        # nova ficava no disco descrita pelos metadados da antiga, em silêncio,
        # e os portões conferiam contra uma ficha desatualizada.
        #
        # Mesclar preserva a garantia original, porque nenhuma aula sai do
        # manifesto, e mantém a ficha verdadeira para as que acabaram de ser
        # regeradas.
        publico = OUT / "manifest.json"
        atual = json.loads(publico.read_text(encoding="utf-8")) if publico.exists() else {}
        atual.update(manifesto)
        gravar_json_atomico(publico, atual)
        if OUT == DEFAULT_OUT.resolve():
            gravar_json_atomico(ROOT / "src" / "data" / "aula-media.json", atual)
        print(f"manifesto mesclado: {len(manifesto)} aula(s) atualizada(s) de {len(atual)}")
    print(f"OK {len(manifesto)} videoaulas, {total/1e6:.1f} MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
