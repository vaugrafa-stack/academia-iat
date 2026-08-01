# -*- coding: utf-8 -*-
"""Segmentacao de legenda: uma fala vira um ou mais blocos legiveis.

Por que este modulo existe. A medicao de 31/07/2026 sobre os 159 arquivos
encontrou 905 blocos, dos quais 88 por cento tinham uma linha acima de 42
caracteres, a maior com 220, e 64 por cento ficavam mais de 6 segundos na
tela. Nenhum bloco tinha mais de uma linha: cada fala inteira virava uma
linha so. Numa peca de 960 pixels de largura, uma linha de 220 caracteres
ou transborda ou encolhe ate deixar de ser legivel.

A causa era simples: o gerador escrevia uma cue por cena, com o texto da
fala sem nenhum tratamento. O tempo estava certo, porque vem da duracao
real do WAV; so a segmentacao estava errada.

Regras aplicadas, na ordem em que importam:

  1. no maximo 2 linhas por bloco e 42 caracteres por linha;
  2. bloco entre 1,0 e 6,0 segundos;
  3. quebra por unidade sintatica, nunca por largura: nao separar artigo de
     substantivo, preposicao de complemento, numero de unidade nem sigla da
     expansao;
  4. intervalo minimo entre blocos, para a troca ser perceptivel;
  5. o tempo sai da MESMA linha do tempo que gerou os quadros e a trilha.
     Legenda calculada em paralelo diverge.

Usado por build_lesson_videos.py (geracao nova) e por refazer_legendas.py
(recorte do acervo ja gerado, sem sintetizar nem recodificar nada).
"""
from __future__ import annotations

import math
import re

LIMITE_LINHA = 42
LINHAS_POR_BLOCO = 2
# Teto do bloco com folga proposital. Dois por 42 daria 84, mas um bloco de
# exatamente 84 so cabe se existir fronteira de palavra exatamente no meio, e
# em portugues tecnico quase nunca existe: uma das duas linhas estoura. A
# folga de 8 caracteres derrubou as ultimas 55 linhas longas de 3.400.
LIMITE_BLOCO = LIMITE_LINHA * LINHAS_POR_BLOCO - 8
DUR_MIN = 1.0
DUR_MAX = 6.0
INTERVALO = 0.08
# Teto de leitura, o mesmo que o portao check-videoaulas cobra.
MAX_CPS = 17.0

# Palavras que nao podem ficar no fim de linha nem de bloco: o olho precisa
# levar o complemento junto, senao le duas vezes. Artigo, preposicao,
# conjuncao, pronome relativo e numeral solto.
PROIBIDO_FIM = {
    "o", "a", "os", "as", "um", "uma", "uns", "umas",
    "de", "do", "da", "dos", "das", "dum", "duma",
    "em", "no", "na", "nos", "nas", "num", "numa",
    "por", "pelo", "pela", "pelos", "pelas",
    "para", "pra", "com", "sem", "sob", "sobre", "ate", "até",
    "entre", "ao", "aos", "à", "às", "a", "e", "ou", "que", "se",
    "como", "quando", "onde", "cujo", "cuja", "cujos", "cujas",
    "seu", "sua", "seus", "suas", "este", "esta", "esse", "essa",
    "aquele", "aquela", "qual", "quais", "cada", "todo", "toda",
    "nº", "n", "art", "arts", "inc", "incs", "§", "item", "itens",
    "lei", "decreto", "resolucao", "resolução", "portaria", "quadro",
    "anexo", "tabela", "figura", "capitulo", "capítulo", "secao", "seção",
}
# Atencao ao comparar: _proibido_no_fim tira a pontuacao do token antes de
# olhar o conjunto, entao as entradas ficam SEM ponto. Guardar "art." aqui nao
# funciona, e foi por isso que um bloco chegou a comecar em "32 da IN IAT
# nº 09/2025": o corte caiu entre "art." e o numero.

# Token que e so numero ou numero com virgula: nunca separar da unidade.
NUMERO = re.compile(r"^[0-9]+([.,][0-9]+)*$")
# Fim de sintagma: virgula, ponto e virgula, dois pontos. Corte preferencial.
PONTUADO = re.compile(r"[,;:]$")


def _proibido_no_fim(token: str) -> bool:
    limpo = token.strip().lower()
    if PONTUADO.search(limpo):
        return False
    limpo = limpo.strip(".,;:!?()")
    return limpo in PROIBIDO_FIM or bool(NUMERO.match(limpo))


def _custo(tokens, k: int, cumulativo, alvo: float) -> float:
    """Custo de cortar antes do token k. Menor e melhor."""
    distancia = abs(cumulativo[k] - alvo)
    anterior = tokens[k - 1]
    if _proibido_no_fim(anterior):
        return distancia + 10_000.0
    if PONTUADO.search(anterior):
        return distancia - 14.0
    return distancia


def _dividir_em(texto: str, n: int):
    """Divide o texto em n pedacos, cortando nas melhores fronteiras."""
    if n <= 1:
        return [texto]
    tokens = texto.split()
    if len(tokens) <= n:
        return [texto]
    # cumulativo[k] = caracteres antes do token k
    cumulativo = [0]
    for t in tokens:
        cumulativo.append(cumulativo[-1] + len(t) + 1)
    total = cumulativo[-1]
    cortes = []
    inicio = 1
    for i in range(1, n):
        alvo = total * i / n
        restantes = n - i
        limite = len(tokens) - restantes + 1
        melhor, melhor_custo = None, None
        for k in range(inicio, limite):
            c = _custo(tokens, k, cumulativo, alvo)
            if melhor_custo is None or c < melhor_custo:
                melhor, melhor_custo = k, c
        if melhor is None:
            break
        cortes.append(melhor)
        inicio = melhor + 1
    pedacos, anterior = [], 0
    for k in cortes:
        pedacos.append(" ".join(tokens[anterior:k]))
        anterior = k
    pedacos.append(" ".join(tokens[anterior:]))
    return [p for p in pedacos if p]


def _refinar(pedacos, limite: int):
    """Redivide o que continuou acima do limite depois do primeiro corte.

    O corte pela melhor fronteira sintatica nao garante pedacos iguais: um
    deles pode passar do limite enquanto o vizinho fica curto. Sem esta
    passada, sobravam 120 linhas acima de 42 caracteres nos 159 arquivos.
    """
    saida = []
    for pedaco in pedacos:
        if len(pedaco) <= limite:
            saida.append(pedaco)
            continue
        filhos = _dividir_em(pedaco, math.ceil(len(pedaco) / limite))
        if len(filhos) <= 1:
            saida.append(pedaco)          # nao ha onde cortar; aceita
            continue
        saida.extend(_refinar(filhos, limite))
    return saida


def envolver(texto: str, limite: int = LIMITE_LINHA, max_linhas: int = LINHAS_POR_BLOCO):
    """Quebra o texto em ate max_linhas de no maximo `limite` caracteres.

    Quebra pelo ponto mais proximo do meio que nao deixe palavra proibida no
    fim da linha. Se nem assim couber, aceita a quebra mais equilibrada
    possivel: melhor uma linha um pouco longa do que uma palavra partida.
    """
    texto = " ".join(texto.split())
    if len(texto) <= limite or max_linhas <= 1:
        return [texto]
    tokens = texto.split()
    if len(tokens) == 1:
        return [texto]
    cumulativo = [0]
    for t in tokens:
        cumulativo.append(cumulativo[-1] + len(t) + 1)
    alvo = len(texto) / 2
    melhor, melhor_custo = None, None
    for k in range(1, len(tokens)):
        esquerda = cumulativo[k] - 1
        direita = len(texto) - cumulativo[k]
        custo = abs(esquerda - alvo)
        # Comprimento e restricao dura; palavra proibida no fim e preferencia
        # forte. Se os pesos ficarem na ordem inversa, o segmentador aceita
        # linha estourada para nao terminar em preposicao, que e o contrario
        # do que se quer.
        if esquerda > limite or direita > limite * (max_linhas - 1):
            custo += 100_000.0
        if _proibido_no_fim(tokens[k - 1]):
            custo += 1_000.0
        elif PONTUADO.search(tokens[k - 1]):
            custo -= 10.0
        if melhor_custo is None or custo < melhor_custo:
            melhor, melhor_custo = k, custo
    cabeca = " ".join(tokens[:melhor])
    cauda = " ".join(tokens[melhor:])
    if max_linhas > 2 and len(cauda) > limite:
        return [cabeca] + envolver(cauda, limite, max_linhas - 1)
    return [cabeca, cauda]


def dividir_fala(texto: str, inicio: float, dur: float,
                 limite_bloco: int = LIMITE_BLOCO, dur_max: float = DUR_MAX):
    """Uma fala vira uma lista de (inicio, fim, [linhas]).

    O numero de blocos vem do que estourar primeiro, comprimento ou duracao.
    A duracao e repartida em proporcao aos caracteres de cada pedaco, para a
    legenda continuar acompanhando a voz.
    """
    texto = " ".join(texto.split())
    if not texto:
        return []
    n = max(1,
            math.ceil(len(texto) / limite_bloco),
            math.ceil((dur - 1e-6) / dur_max))
    pedacos = _refinar(_dividir_em(texto, n), limite_bloco)

    # Segunda passada, pela DURACAO. Cortar pelo melhor ponto sintatico produz
    # pedacos de tamanhos diferentes, entao um deles pode continuar acima do
    # teto de tempo mesmo com o texto dentro do limite. Aqui cada pedaco que
    # ainda estoura e subdividido, e a duracao dele e reparticionada entre os
    # filhos, sem mexer nos vizinhos.
    total = sum(len(p) for p in pedacos) or 1
    finais = []
    for pedaco in pedacos:
        d = dur * len(pedaco) / total
        k = math.ceil((d - 1e-6) / dur_max)
        if k > 1:
            filhos = _refinar(_dividir_em(pedaco, k), limite_bloco)
            soma = sum(len(f) for f in filhos) or 1
            for filho in filhos:
                finais.append((filho, d * len(filho) / soma))
        else:
            finais.append((pedaco, d))

    finais = _equilibrar_por_cps(finais)

    saida, t = [], inicio
    for i, (pedaco, d) in enumerate(finais):
        fim = t + d
        visivel = fim
        # O intervalo entre blocos sai do tempo deste bloco, entao so pode ser
        # descontado se a leitura continuar dentro do teto depois do desconto.
        if i < len(finais) - 1 and d > 3 * INTERVALO:
            if len(pedaco) / max(d - INTERVALO, 0.01) <= MAX_CPS:
                visivel = fim - INTERVALO
        saida.append((t, visivel, envolver(pedaco)))
        t = fim
    return saida


def _equilibrar_por_cps(finais, max_cps: float = MAX_CPS):
    """Redistribui a duracao para nenhum bloco passar do teto de leitura.

    Repartir a duracao em proporcao aos caracteres parece justo, mas a
    narracao nao tem ritmo constante: um trecho lido rapido dentro de uma cena
    lenta vira um bloco acima do teto que a media da cena escondia. Foi o que
    apareceu ao dividir, em quatro secoes, entre 17,1 e 17,5 cps.

    Aqui cada bloco recebe pelo menos `caracteres / teto` segundos, e o deficit
    e coberto por quem tem folga, em proporcao a folga de cada um. A duracao
    total da cena nao muda, entao a legenda continua colada na voz.
    """
    total = sum(d for _, d in finais)
    minimos = [len(p) / max_cps for p, _ in finais]
    if sum(minimos) >= total:
        return finais            # a cena inteira ja esta no limite; nada a fazer
    deficits = [max(0.0, m - d) for m, (_, d) in zip(minimos, finais)]
    folgas = [max(0.0, d - m) for m, (_, d) in zip(minimos, finais)]
    soma_deficit, soma_folga = sum(deficits), sum(folgas)
    if soma_deficit <= 0 or soma_folga <= 0:
        return finais
    return [
        (p, d + deficits[i] - folgas[i] * soma_deficit / soma_folga)
        for i, (p, d) in enumerate(finais)
    ]


def carimbo(segundos: float) -> str:
    """MM:SS.mmm, o formato que o acervo ja usa."""
    return f"{int(segundos // 60):02d}:{segundos % 60:06.3f}"


def escrever_vtt(blocos) -> str:
    """blocos: lista de (inicio, fim, [linhas]). Devolve o arquivo inteiro."""
    saida = ["WEBVTT", ""]
    for inicio, fim, linhas in blocos:
        saida.append(f"{carimbo(inicio)} --> {carimbo(fim)}")
        saida.extend(linhas)
        saida.append("")
    return "\n".join(saida)
