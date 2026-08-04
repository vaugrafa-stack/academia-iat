# -*- coding: utf-8 -*-
"""Motor de visemas: fonema para forma de boca, e a linha do tempo da cena.

Saiu de build_audiovisual_pilots.py em 04/08/2026 para ser compartilhado com
visemas_das_aulas.py, que gera a mesma linha do tempo para as 159 videoaulas a
partir das legendas ja existentes.

Importar em vez de copiar e o que impede as duas bocas de divergirem: qualquer
ajuste no mapeamento de fonema vale para o piloto e para o acervo de uma vez.

`viseme_timeline` recebe cenas no formato `{start, end, spoken}` e, opcional,
`phonemes`. Distribui os fonemas dentro da janela da cena em proporcao ao peso
de cada um: vogal aberta ocupa mais tempo de boca que consoante oclusiva. Nao e
alinhamento acustico, e quem chama declara isso em `alignmentStatus`.
"""
from __future__ import annotations

SCENE_GAP = 0.22

VIS_NAMES = [
    "rest", "MBP", "IE", "A", "O", "U", "FV", "L", "CHJ", "E_OPEN", "SCHWA", "rest_alt"
]
SKIP_PHONEMES = {"ˈ", "ˌ", "ː", "ˑ", "͡", "͜", "̃", "̩", "̯", "̪", "ʰ"}


def viseme_for(phoneme: str) -> int:
    if not phoneme or phoneme.isspace() or phoneme in ".,;:!?-()":
        return 0
    if phoneme in "mbp":
        return 1
    if phoneme in "iɪjyɨ":
        return 2
    if phoneme in "aɐɑæɒ":
        return 3
    if phoneme in "oɔø":
        return 4
    if phoneme in "uʊw":
        return 5
    if phoneme in "fv":
        return 6
    if phoneme in "lɫ":
        return 7
    if phoneme in "ʃʒɕçʝx":
        return 8
    if phoneme in "eɛɜœ":
        return 9
    return 10


def phoneme_weight(phoneme: str, viseme: int) -> float:
    if phoneme.isspace():
        return 0.8
    if phoneme in ".,;:!?-":
        return 1.25
    if viseme in {2, 3, 4, 5, 9}:
        return 1.45
    if viseme in {1, 6, 7, 8}:
        return 0.85
    return 0.68


def viseme_timeline(timeline: list[dict], duration: float, lesson_id: str) -> dict:
    entries = []
    for scene in timeline:
        phonemes = [char for char in scene.get("phonemes", "") if char not in SKIP_PHONEMES]
        if not phonemes:
            phonemes = list(scene["spoken"])
        parts = [(char, viseme_for(char)) for char in phonemes]
        weights = [phoneme_weight(char, viseme) for char, viseme in parts]
        total_weight = sum(weights) or 1
        cursor = scene["start"]
        scene_duration = scene["end"] - scene["start"]
        for (phoneme, viseme), weight in zip(parts, weights):
            end = cursor + scene_duration * weight / total_weight
            if entries and entries[-1]["viseme"] == viseme and abs(entries[-1]["end"] - cursor) < 0.002:
                entries[-1]["end"] = end
                entries[-1]["phonemes"] += phoneme
            else:
                entries.append({
                    "start": cursor,
                    "end": end,
                    "viseme": viseme,
                    "name": VIS_NAMES[viseme],
                    "phonemes": phoneme,
                })
            cursor = end
        if scene["end"] < duration:
            entries.append({
                "start": scene["end"],
                "end": min(duration, scene["end"] + SCENE_GAP),
                "viseme": 11,
                "name": "rest_alt",
                "phonemes": "",
            })
    for entry in entries:
        entry["start"] = round(entry["start"], 3)
        entry["end"] = round(entry["end"], 3)
    return {
        "schemaVersion": "1.0.0",
        "lessonId": lesson_id,
        "spriteGrid": {"columns": 3, "rows": 4},
        "visemeOrder": VIS_NAMES,
        "alignmentMethod": "phoneme-sequence-weighted-to-scene-audio",
        "alignmentStatus": "estimated-pilot",
        "entries": entries,
    }
