# -*- coding: utf-8 -*-
"""Normalizacao da entrada do sintetizador de voz.

Saiu de build_lesson_videos.py em 04/08/2026 por um motivo concreto: o teste
desta normalizacao importava aquele modulo, que importa PIL e imageio_ffmpeg
para desenhar quadro de video. O runner do CI nao tem PIL, entao o portao de
tooling falhava com ModuleNotFoundError sem nada a ver com o que ele testa.

Alem de destravar o CI, a separacao esta certa: adaptar texto para leitura em
voz nao tem relacao nenhuma com desenhar imagem. Este modulo nao importa nada
alem da biblioteca padrao.

Piper nao tem SSML: toda a prosodia vem de como o texto chega a ele. A legenda
continua fiel ao POP; so a entrada do sintetizador recebe expansao de
abreviacao, unidade, ordinal e numero de ato.
"""
from __future__ import annotations

import re

_SIGLAS_FALADAS = {
    "IAT": "I A T",
    "IN": "Instrução Normativa",
    "APP": "A P P",
    "APA": "A P A",
    "ADA": "A D A",
    "ANEEL": "Aneel",
    "ACT": "A C T",
    "UC": "U C",
    "IBAMA": "Ibama",
    "PACUERA": "Pacuera",
    "TR": "T R",
    "TVR": "T V R",
    "PCH": "P C H",
    "CGH": "C G H",
    "UHE": "U H E",
    "MCH": "M C H",
    "MGH": "M G H",
    "RTAA": "R T A A",
    "SGA": "S G A",
    "CNPJ": "C N P J",
    "IPHAN": "Ifan",
    "IDA": "I D A",
    "PSB": "P S B",
    "PAE": "P A E",
    "ZAS": "Z A S",
    "ZSS": "Z S S",
    "RPPN": "R P P N",
    "EIA": "E I A",
    "RIMA": "R I M A",
    "PBA": "P B A",
    "RDPA": "R D P A",
    "PCA": "P C A",
    "RAS": "R A S",
    "LP": "L P",
    "LI": "L I",
    "LO": "L O",
    "RLO": "R L O",
    "LAS": "L A S",
    "LAC": "L A C",
    "DLAM": "D L A M",
    "KMZ": "K M Z",
    "KML": "K M L",
    "ART": "A R T",
}


# Leitura de ordinal juridico em pt-BR. A convencao brasileira le artigo,
# paragrafo e inciso como ORDINAL ate o nono ("artigo quinto") e como CARDINAL
# do decimo em diante ("artigo dez"), e nao "artigo decimo". Por isso a tabela
# para no nove: acima disso o numero fica como esta e o sintetizador le cardinal.
_ORDINAIS_M = {
    1: "primeiro", 2: "segundo", 3: "terceiro", 4: "quarto", 5: "quinto",
    6: "sexto", 7: "sétimo", 8: "oitavo", 9: "nono",
}
_ORDINAIS_F = {
    1: "primeira", 2: "segunda", 3: "terceira", 4: "quarta", 5: "quinta",
    6: "sexta", 7: "sétima", 8: "oitava", 9: "nona",
}
_ROMANOS = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
            "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10}


def ordinal_falado(match) -> str:
    numero = int(match.group(1))
    tabela = _ORDINAIS_F if match.group(2) in "ªa" else _ORDINAIS_M
    return tabela.get(numero, str(numero))


def numero_de_ato(match) -> str:
    """`15.190/2025` vira `15190, de 2025`.

    E o padrao mais frequente do acervo: 54 ocorrencias, quase todas numero de
    lei ou de instrucao normativa. Escrito como esta, o sintetizador precisa
    decidir sozinho o que fazer com o ponto de milhar e com a barra, e nenhuma
    das duas leituras possiveis e a certa. Sem o ponto, ele le o inteiro
    corretamente; `de` no lugar da barra e como a citacao e falada.
    """
    numero = int(match.group(1).replace(".", ""))
    return f"{numero}, de {match.group(2)}"


def inciso_romano(match) -> str:
    valor = _ROMANOS.get(match.group(2).upper())
    if not valor:
        return match.group(0)
    return f"{match.group(1)} {_ORDINAIS_M.get(valor, str(valor))}"


def unidade_falada(match, singular: str, plural: str) -> str:
    valor = match.group(1)
    try:
        singulariza = float(valor.replace(",", ".")) == 1
    except ValueError:
        singulariza = False
    return f"{valor} {singular if singulariza else plural}"


def texto_falado(texto: str) -> str:
    """Adapta a escrita técnica para uma leitura mais natural em pt-BR.

    A legenda continua fiel ao POP. Somente a entrada do sintetizador recebe
    expansão de abreviações, unidades e pontuação de pausa.
    """
    texto = re.sub(r"\s+", " ", texto or "").strip()
    texto = re.sub(r"\barts?\.\s*", lambda m: "artigos " if m.group(0).lower().startswith("arts") else "artigo ",
                   texto, flags=re.IGNORECASE)
    texto = re.sub(r"\bincs?\.\s*", lambda m: "incisos " if m.group(0).lower().startswith("incs") else "inciso ",
                   texto, flags=re.IGNORECASE)
    texto = re.sub(r"\bn[º°]\s*", "número ", texto, flags=re.IGNORECASE)
    # Numero de ato antes do ordinal: "15.190/2025" tem que virar
    # "15190, de 2025" enquanto ainda esta inteiro. Depois da expansao de
    # ordinais a barra e o ponto ja teriam sido tratados isoladamente.
    texto = re.sub(r"\b(\d{1,3}(?:\.\d{3})+|\d{1,5})/(\d{4})\b", numero_de_ato, texto)
    texto = re.sub(r"\b(\d{1,3}(?:\.\d{3})+)\b", lambda m: m.group(1).replace(".", ""), texto)
    texto = re.sub(r"(\d+)([ºª°])", ordinal_falado, texto)
    texto = re.sub(r"§§\s*", "parágrafos ", texto)
    texto = re.sub(r"§\s*", "parágrafo ", texto)
    texto = re.sub(r"\b(incisos?)\s+([IVX]{1,4})\b", inciso_romano, texto, flags=re.IGNORECASE)
    texto = re.sub(
        r"(\d+(?:[.,]\d+)?)\s*km²\b",
        lambda match: unidade_falada(
            match,
            "quilômetro quadrado",
            "quilômetros quadrados",
        ),
        texto,
        flags=re.IGNORECASE,
    )
    texto = re.sub(
        r"(\d+(?:[.,]\d+)?)\s*km\b",
        lambda match: unidade_falada(match, "quilômetro", "quilômetros"),
        texto,
        flags=re.IGNORECASE,
    )
    texto = re.sub(
        r"(\d+(?:[.,]\d+)?)\s*MW\b",
        lambda match: unidade_falada(match, "megawatt", "megawatts"),
        texto,
    )
    texto = re.sub(
        r"(\d+(?:[.,]\d+)?)\s*ha\b",
        lambda match: unidade_falada(match, "hectare", "hectares"),
        texto,
        flags=re.IGNORECASE,
    )
    texto = re.sub(r"(\d+(?:[.,]\d+)?)\s*%", r"\1 por cento", texto)
    texto = texto.replace("EIA/RIMA", "EIA e RIMA")
    # Sigla com barra, como SEI/IBAMA. Sem isto o sintetizador precisa decidir
    # o que fazer com a barra no meio de duas sequencias de maiusculas, e o
    # resultado varia. Mesma escolha ja feita para EIA/RIMA.
    texto = re.sub(r"\b([A-Z]{2,})/([A-Z]{2,})\b", r"\1 e \2", texto)
    for sigla, leitura in _SIGLAS_FALADAS.items():
        texto = re.sub(rf"\b{re.escape(sigla)}\b", leitura, texto)
    texto = re.sub(r"\s*[–—]\s*", ", ", texto)
    texto = re.sub(r"\s*;\s*", ". ", texto)
    texto = re.sub(r"\s*:\s*", ": ", texto)
    texto = re.sub(r"\s+([,.!?])", r"\1", texto)
    texto = re.sub(r"([,.!?])(?=\S)", r"\1 ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    if texto and texto[-1] not in ".!?":
        texto += "."
    return texto
