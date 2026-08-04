# -*- coding: utf-8 -*-
"""Gera a linha do tempo de visemas das 159 videoaulas a partir das legendas.

Por que da para fazer isso sem recodificar nada. O motor de visemas ja existe
em build_audiovisual_pilots.py e recebe cenas no formato
`{start, end, spoken}`. Cada bloco de um `.vtt` e exatamente isso: texto falado
com inicio e fim medidos do WAV na geracao. Entao a linha do tempo pode ser
derivada do que ja esta gravado, em segundos, contra as horas que custaria
reprocessar 159 MP4.

E a mesma ideia que ja tinha funcionado em refazer_legendas.py: o tempo certo
ja estava no acervo; faltava a derivacao.

O que isso corrige. Ate 04/08/2026 a boca do professor era uma senoide,
`Math.sin(currentTime * 12.7)`, porque visema real so existia nos seis videos
do piloto. As 159 aulas tinham zero, entao quase todo mundo via uma boca
abrindo e fechando duas vezes por segundo sem relacao com a fala. Com este
arquivo, as 159 passam a ter sincronia labial derivada dos fonemas do proprio
texto, igual a dos pilotos.

Limite honesto, e ele fica declarado no proprio artefato: a distribuicao dos
fonemas dentro do bloco e PROPORCIONAL, com peso por tipo de fonema, e nao
alinhamento acustico real. `alignmentStatus` sai como
"estimated-from-captions" para ninguem confundir isso com forced alignment.

Uso:
    python tools/visemas_das_aulas.py                 # todas
    python tools/visemas_das_aulas.py --conferir      # so relata
    python tools/visemas_das_aulas.py pop-section-057
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "tools"))

# Motor compartilhado com o gerador dos pilotos. Importar em vez de copiar e o
# que impede as duas bocas de divergirem com o tempo.
from visemas import SCENE_GAP, VIS_NAMES, viseme_timeline  # noqa: E402

MEDIA = RAIZ / "public" / "media" / "aula"
TEMPO = re.compile(
    r"(?:(\d+):)?(\d+):(\d{2}(?:[.,]\d+)?)\s*-->\s*(?:(\d+):)?(\d+):(\d{2}(?:[.,]\d+)?)"
)


def segundos(hora, minuto, resto) -> float:
    return int(hora or 0) * 3600 + int(minuto) * 60 + float(resto.replace(",", "."))


def cenas_do_vtt(texto: str):
    """Cada bloco da legenda vira uma cena falada, com o texto ja limpo."""
    cenas = []
    linhas = texto.splitlines()
    i = 0
    while i < len(linhas):
        m = TEMPO.search(linhas[i])
        if not m:
            i += 1
            continue
        inicio = segundos(m.group(1), m.group(2), m.group(3))
        fim = segundos(m.group(4), m.group(5), m.group(6))
        corpo = []
        i += 1
        while i < len(linhas) and linhas[i].strip():
            corpo.append(linhas[i].strip())
            i += 1
        falado = " ".join(corpo).strip()
        if falado and fim > inicio:
            cenas.append({"start": inicio, "end": fim, "spoken": falado.lower()})
    return cenas


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ids", nargs="*", help="IDs especificos; sem IDs, todas")
    parser.add_argument("--conferir", action="store_true",
                        help="relata sem gravar nada")
    args = parser.parse_args()

    alvos = args.ids or sorted(p.stem for p in MEDIA.glob("*.vtt"))
    gerados, ignorados, total_entradas = 0, [], 0

    for id_aula in alvos:
        vtt = MEDIA / f"{id_aula}.vtt"
        if not vtt.exists():
            ignorados.append(id_aula)
            continue
        cenas = cenas_do_vtt(vtt.read_text(encoding="utf-8"))
        if not cenas:
            ignorados.append(id_aula)
            continue

        duracao = max(c["end"] for c in cenas) + SCENE_GAP
        linha = viseme_timeline(cenas, duracao, id_aula)
        # A procedencia tem que ficar no artefato: derivado de legenda, com
        # distribuicao proporcional, nao alinhamento acustico.
        linha["alignmentMethod"] = "phoneme-sequence-weighted-to-caption-cue"
        linha["alignmentStatus"] = "estimated-from-captions"
        linha["visemeOrder"] = VIS_NAMES
        total_entradas += len(linha["entries"])

        if not args.conferir:
            destino = MEDIA / f"{id_aula}.visemes.json"
            destino.write_text(
                json.dumps(linha, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
                newline="\n",
            )
        gerados += 1

    print(f"aulas com legenda: {gerados}"
          + (f" (sem legenda: {len(ignorados)})" if ignorados else ""))
    if gerados:
        print(f"entradas de visema: {total_entradas} "
              f"(media de {total_entradas // gerados} por aula)")
    print("--conferir: nada gravado." if args.conferir
          else f"gravados {gerados} arquivos .visemes.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
