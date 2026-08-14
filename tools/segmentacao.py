# -*- coding: utf-8 -*-
"""Quebra de texto do POP em frases utilizaveis como fala.

Saiu de build_lesson_videos.py em 11/08/2026 pelo mesmo motivo que levou
fala.py a sair antes: o teste desta quebra importava aquele modulo, que importa
PIL e imageio_ffmpeg para desenhar quadro de video. O passo de tooling do CI
roda com a biblioteca padrao e nada mais, entao o portao falhava com
ModuleNotFoundError por causa de dependencia que o teste nao usa.

A separacao tambem esta certa por si: decidir onde uma frase termina e problema
de texto, nao de video. Este modulo nao importa nada alem da biblioteca padrao.
"""

from __future__ import annotations

import re

# Abreviacoes que NAO encerram frase. O olhar-para-tras e avaliado DEPOIS do
# ponto, entao cada entrada precisa incluir o proprio ponto: sem isso "O art. 15
# da Instrucao Normativa" virava duas falas e a segunda comecava em "15 da
# Instrucao". A forma plural conta separado, porque "arts. 43 e 44" e tao comum
# no POP quanto "art. 15".
_SIGLAS = ["art", "arts", "inc", "incs", "fig", "figs", "par", "pars", "cap",
           "caps", "proc", "procs", "dr", "dra", "sr", "sra", "esp", "cf",
           "ex", "pp", "p", "n", "nº", "n°", "no", "sec", "séc", "aprox"]
_ABREV = "".join(r"(?<!" + re.escape(s) + r"\.)" for s in
                 sorted({v for s in _SIGLAS for v in (s, s.capitalize(), s.upper())}))

# O marcador de lista tambem encerra frase. Sem esta alternativa, uma secao
# feita so de bullets virava uma unica string: cada item termina em ponto, mas o
# proximo comeca em "•", que nao e maiuscula nem digito, entao a quebra nunca
# acontecia e o resultado estourava o teto de 900 caracteres e era descartado
# inteiro. A 18.12.9 do POP v1.9, dez itens de erro recorrente, foi a primeira
# secao assim, e ficou sem videoaula nenhuma.
_MARCADOR = r"[••‣◦⁃∙]"
_FIM = re.compile(
    _ABREV + r"(?<=[.;])\s+(?=[A-ZÀ-ÚÁÉÍÓÚÂÊÔÃÕ0-9])"
    + r"|\s*(?=" + _MARCADOR + r"\s)"
)

MINIMO_CARACTERES = 35
MAXIMO_CARACTERES = 900


def frases(texto: str) -> list[str]:
    """Quebra em frases utilizaveis como fala."""
    out = []
    for f in _FIM.split(texto or ""):
        f = re.sub(r"\s+", " ", f).strip()
        # O marcador nao se fala. Ele delimitou a frase e sai antes da narracao.
        f = re.sub(r"^" + _MARCADOR + r"\s*", "", f).strip()
        # O teto existe para descartar lixo de extracao, nao prosa longa: a
        # secao 11.2 e uma unica frase de 471 caracteres e ficava sem roteiro
        # nenhum, caindo no video do modulo sem ninguem perceber. Quem apara o
        # tamanho e encurtar(), depois.
        if len(f) < MINIMO_CARACTERES or len(f) > MAXIMO_CARACTERES:
            continue
        if re.match(r"^(Quadro|Tabela|Figura)\s+\d", f):
            continue
        out.append(f.rstrip(";").rstrip("."))
    return out


__all__ = ["frases", "MINIMO_CARACTERES", "MAXIMO_CARACTERES"]
