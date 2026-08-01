# -*- coding: utf-8 -*-
"""Recorta as legendas do acervo ja gerado, sem sintetizar nem recodificar.

Por que da para fazer isso. O tempo nas VTT existentes esta CERTO: ele vem da
duracao real de cada WAV medida na geracao. O que esta errado e so a
segmentacao, porque o gerador escrevia uma cue por cena com a fala inteira
numa linha. Entao basta reler cada arquivo, reaproveitar os intervalos e
reparticionar o texto dentro deles.

Custo: segundos, contra horas de recodificacao dos 159 MP4. E o que a etapa
G1 do PLANO_QUALIDADE pede, aplicado ao caso que mais importa.

A cue de TITULO nunca e dividida: o portao check-videoaulas compara o texto
dela com o titulo da aula, juntando as linhas com espaco. Quebrar em duas
linhas mantem a comparacao valida; dividir em duas cues nao.

Uso:
    python tools/refazer_legendas.py                 # todas, e atualiza o manifesto
    python tools/refazer_legendas.py --conferir      # so relata, nao grava
    python tools/refazer_legendas.py pop-section-057
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from legendas import (  # noqa: E402
    DUR_MAX,
    LIMITE_LINHA,
    LINHAS_POR_BLOCO,
    dividir_fala,
    envolver,
    escrever_vtt,
)

RAIZ = Path(__file__).resolve().parents[1]
MEDIA = RAIZ / "public" / "media" / "aula"
# Dois manifestos com o mesmo conteudo: um consumido pela aplicacao, outro
# servido junto da midia. O portao compara os dois, entao os dois mudam juntos.
MANIFESTOS = (
    RAIZ / "src" / "data" / "aula-media.json",
    RAIZ / "public" / "media" / "aula" / "manifest.json",
)

TEMPO = re.compile(
    r"(?:(\d+):)?(\d+):(\d{2}(?:[.,]\d+)?)\s*-->\s*(?:(\d+):)?(\d+):(\d{2}(?:[.,]\d+)?)"
)


def segundos(hora, minuto, resto) -> float:
    return int(hora or 0) * 3600 + int(minuto) * 60 + float(resto.replace(",", "."))


def ler_cues(texto: str):
    """Devolve [(inicio, fim, texto_juntado)] na ordem do arquivo."""
    cues = []
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
        cues.append((inicio, fim, " ".join(corpo).strip()))
    return cues


def refazer(cues):
    """Primeira cue e o titulo: so envolve. As demais podem virar varias."""
    blocos = []
    for indice, (inicio, fim, texto) in enumerate(cues):
        if not texto:
            continue
        if indice == 0:
            # Titulo: no maximo tres linhas, porque alguns titulos de secao do
            # POP passam de 84 caracteres e dividir quebraria o portao.
            blocos.append((inicio, fim, envolver(texto, LIMITE_LINHA, 3)))
            continue
        blocos.extend(dividir_fala(texto, inicio, max(fim - inicio, 0.2)))
    return blocos


def medir(blocos):
    linhas_longas = sum(
        1 for _, _, linhas in blocos for linha in linhas if len(linha) > LIMITE_LINHA
    )
    excesso_linhas = sum(1 for _, _, linhas in blocos if len(linhas) > LINHAS_POR_BLOCO)
    longos = sum(1 for a, b, _ in blocos if (b - a) > DUR_MAX + 0.01)
    return linhas_longas, excesso_linhas, longos


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ids", nargs="*", help="IDs especificos; sem IDs, todas")
    parser.add_argument("--conferir", action="store_true",
                        help="relata o que mudaria sem gravar nada")
    args = parser.parse_args()

    manifesto = json.loads(MANIFESTOS[0].read_text(encoding="utf-8"))
    alvos = args.ids or sorted(p.stem for p in MEDIA.glob("*.vtt"))

    antes = {"linhas": 0, "excesso": 0, "longos": 0, "blocos": 0}
    depois = {"linhas": 0, "excesso": 0, "longos": 0, "blocos": 0}
    tocados, ignorados = 0, []

    for id_secao in alvos:
        caminho = MEDIA / f"{id_secao}.vtt"
        if not caminho.exists():
            ignorados.append(id_secao)
            continue
        cues = ler_cues(caminho.read_text(encoding="utf-8"))
        if not cues:
            ignorados.append(id_secao)
            continue

        originais = [(a, b, envolver(t, LIMITE_LINHA, 1)) for a, b, t in cues]
        la, ea, ga = medir(originais)
        antes["linhas"] += la
        antes["excesso"] += ea
        antes["longos"] += ga
        antes["blocos"] += len(originais)

        blocos = refazer(cues)
        ld, ed, gd = medir(blocos)
        depois["linhas"] += ld
        depois["excesso"] += ed
        depois["longos"] += gd
        depois["blocos"] += len(blocos)

        if not args.conferir:
            caminho.write_text(escrever_vtt(blocos), encoding="utf-8", newline="\n")
            if id_secao in manifesto:
                manifesto[id_secao]["cues"] = len(blocos)
                # maxCps declarado tem que refletir a segmentacao nova, senao o
                # manifesto passa a mentir sobre a legenda que ele descreve.
                pico = max(
                    (len(" ".join(l)) / (b - a) for a, b, l in blocos if b > a),
                    default=0.0,
                )
                manifesto[id_secao]["maxCps"] = round(pico, 3)
            tocados += 1

    if not args.conferir and tocados:
        # Formato compacto e sem quebra final, igual ao que o gerador escreve.
        texto = json.dumps(manifesto, ensure_ascii=False, separators=(",", ":"))
        for destino in MANIFESTOS:
            destino.write_text(texto, encoding="utf-8", newline="\n")

    print(f"arquivos: {len(alvos) - len(ignorados)}"
          + (f" (ignorados: {len(ignorados)})" if ignorados else ""))
    print(f"blocos            {antes['blocos']:5d}  ->  {depois['blocos']:5d}")
    print(f"linhas acima de {LIMITE_LINHA}  {antes['linhas']:5d}  ->  {depois['linhas']:5d}")
    print(f"blocos acima de {DUR_MAX:g}s  {antes['longos']:5d}  ->  {depois['longos']:5d}")
    print(f"blocos com mais de {LINHAS_POR_BLOCO} linhas  {antes['excesso']:5d}  ->  {depois['excesso']:5d}")
    if args.conferir:
        print("\n--conferir: nada foi gravado.")
    else:
        print(f"\ngravados {tocados} arquivos e o manifesto atualizado.")


if __name__ == "__main__":
    main()
