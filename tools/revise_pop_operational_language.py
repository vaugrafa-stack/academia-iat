from __future__ import annotations

import argparse
import copy
import difflib
import hashlib
import io
import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path

from lxml import etree
from PIL import Image, ImageDraw, ImageFont

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
WP_NS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
NS = {"w": W_NS, "r": R_NS, "a": A_NS, "wp": WP_NS}
P_TAG = f"{{{W_NS}}}p"
TEXT_TAGS = {
    f"{{{W_NS}}}t",
    f"{{{W_NS}}}delText",
    f"{{{W_NS}}}instrText",
}

SOURCE = Path.home() / "Downloads" / "POP_DLE_HID_001_v1.9_Sem_Classificacao_de_Gravidade.docx"
OUTPUT = Path.home() / "Downloads" / "POP_DLE_HID_001_v1.9_Linguagem_Operacional_Revisada.docx"
EXPECTED_SOURCE_SHA256 = "f7056462b84de383c8e2dbb1e22d3bb732d90fbd876a933e0596642caf5b4871"

# Full-paragraph transformations deliberately encode the decision effect, the
# timing of remediation, the required action, and/or the expected evidence.
# Exact source matching prevents a broad lexical rewrite from altering proper
# names, legal concepts, or unrelated technical prose.
PARAGRAPH_REVISIONS: tuple[tuple[str, str], ...] = (
    (
        "A análise deve partir da norma vigente aplicável ao caso concreto e da data do protocolo. Para processos antigos, deve ser verificada a regra de transição, sem aplicação retroativa automática de exigências novas, salvo quando houver previsão normativa, fato novo, alteração do empreendimento, inconsistência crítica ou ausência que impeça a decisão segura.",
        "A análise deve partir da norma vigente aplicável ao caso concreto e da data do protocolo. Para processos antigos, deve ser verificada a regra de transição, sem aplicação retroativa automática de exigências novas, salvo quando houver previsão normativa, fato novo, alteração do empreendimento, inconsistência ou ausência que impeça a decisão segura.",
    ),
    (
        "Estudos e autorizações de fauna, supressão, árvores isoladas, compensação de Mata Atlântica, APP de reservatórios, PACUERA, linhas, distribuição, subestações e baixo risco.",
        "Estudos e autorizações de fauna, supressão, árvores isoladas, compensação de Mata Atlântica, APP de reservatórios, PACUERA, linhas, distribuição, subestações e procedimentos abrangidos pela IN IAT nº 11/2026.",
    ),
    (
        "Pendência crítica inviabiliza ou impede decisão segura e não é sanável no estado do processo.",
        "Pendência que inviabilize ou impeça a decisão segura e não seja sanável no estado do processo.",
    ),
    (
        "Mudança de titularidade sem ato administrativo formal, anuência, assunção de condicionantes e compatibilidade com outorga e ANEEL deve ser tratada como pendência crítica.",
        "Mudança de titularidade sem ato administrativo formal, anuência, assunção de condicionantes e compatibilidade com outorga e ANEEL deve ser registrada como impeditiva à decisão, com indicação do saneamento necessário.",
    ),
    (
        "Licença Ambiental por Adesão e Compromisso, quando o caso se enquadra como baixo potencial e com compromisso do empreendedor.",
        "Licença Ambiental por Adesão e Compromisso, quando presentes os requisitos normativos dessa modalidade e o compromisso do empreendedor.",
    ),
    (
        "Observações críticas",
        "Observações para decisão",
    ),
    (
        "UHE exige EIA e RIMA. PCH exige EIA e RIMA quando acima de 10 MW ou com alagamento superior a 100 ha, além das hipóteses de significância reconhecida pelo IAT. Nas hipóteses submetidas a EIA/RIMA, o estudo deve incorporar o Diagnóstico Climático previsto na Portaria IAT nº 42/2022.",
        "O art. 10 da IN IAT nº 09/2025 enquadra na Resolução CONAMA nº 01/1986, como passíveis de apresentação de EIA/RIMA e de realização de audiência pública, as UHEs, as PCHs com potência instalada acima de 10 MW ou alagamento superior a 100 ha e os empreendimentos inicialmente simplificados que o IAT considere potencialmente impactantes. A definição do estudo e do rito aplicável deve ser confirmada no enquadramento do caso, no Termo de Referência vigente e nos atos do processo. Nos processos efetivamente submetidos a EIA/RIMA, o estudo deve incorporar o Diagnóstico Climático previsto na Portaria IAT nº 42/2022.",
    ),
    (
        "Lacuna crítica de cartografia",
        "Cartografia insuficiente para decisão",
    ),
    (
        "2. Verificar inexistência de supressão, intervenção complexa, impacto relevante, APP crítica, impedimento setorial ou fato que afaste a dispensa.",
        "2. Verificar inexistência de supressão, intervenção complexa, impacto relevante, restrição material em APP, impedimento setorial ou fato que afaste a dispensa.",
    ),
    (
        "A LP deve analisar viabilidade ambiental, alternativas locacionais e tecnológicas, áreas de influência, impactos, medidas mitigadoras e compatibilidade com ordenamento territorial, recursos hídricos, intervenientes e restrições ambientais. A exigência de EIA e RIMA aplica-se às UHEs, às PCHs com potência acima de 10 MW ou alagamento superior a 100 ha e aos empreendimentos inicialmente simplificados que o IAT considere potencialmente impactantes. Nos demais casos, o estudo decorre do art. 9º, do Quadro 1 e do Termo de Referência vigente. Quando houver UC ou APA, a LP deve tratar expressamente a compatibilidade locacional com o ato de criação, o Plano de Manejo e a zona incidente, evitando transferir para a LI questão que possa inviabilizar a localização ou a concepção. Nos processos sujeitos a EIA/RIMA, deve ser verificada a inclusão do Diagnóstico Climático previsto na Portaria IAT nº 42/2022, sem estender automaticamente essa exigência aos estudos simplificados.",
        "A LP deve analisar viabilidade ambiental, alternativas locacionais e tecnológicas, áreas de influência, impactos, medidas mitigadoras e compatibilidade com ordenamento territorial, recursos hídricos, intervenientes e restrições ambientais. O art. 10 da IN IAT nº 09/2025 enquadra na Resolução CONAMA nº 01/1986, como passíveis de apresentação de EIA/RIMA e de realização de audiência pública, as UHEs, as PCHs com potência instalada acima de 10 MW ou alagamento superior a 100 ha e os empreendimentos inicialmente simplificados que o IAT considere potencialmente impactantes. A definição do estudo e do rito aplicável deve ser confirmada no enquadramento do caso, no Termo de Referência vigente e nos atos do processo. Quando houver UC ou APA, a LP deve tratar expressamente a compatibilidade locacional com o ato de criação, o Plano de Manejo e a zona incidente, evitando transferir para a LI questão que possa inviabilizar a localização ou a concepção. Nos processos efetivamente submetidos a EIA/RIMA, deve ser verificada a inclusão do Diagnóstico Climático previsto na Portaria IAT nº 42/2022, sem estender automaticamente essa exigência aos estudos simplificados.",
    ),
    (
        "Não emitir LI com condicionante crítica da LP sem atendimento ou justificativa.",
        "Não emitir LI se condicionante da LP indispensável à decisão estiver sem atendimento ou justificativa.",
    ),
    (
        "Em RLO, RLAS, LASR, LOR, LIR, LOC ou licença corretiva amparada pelo regime aplicável, a análise deve focar a regularidade atual, a situação fática e a continuidade da operação, sem rediscutir integralmente a viabilidade locacional já apreciada, salvo fato novo, alteração, irregularidade, dano, inconsistência crítica, vencimento, mudança de titularidade ou ausência que impeça a decisão. A modalidade estadual e a LOC federal devem ser avaliadas separadamente e compatibilizadas de forma motivada. A incidência atual de UC ou Plano de Manejo deve ser verificada quanto a efeitos operacionais presentes, sem reabertura automática da viabilidade locacional. Reanálise focal é necessária quando houver fato novo, ampliação, repotenciação, alteração de arranjo, nova estrutura, mudança material de operação ou incompatibilidade territorial relevante.",
        "Em RLO, RLAS, LASR, LOR, LIR, LOC ou licença corretiva amparada pelo regime aplicável, a análise deve focar a regularidade atual, a situação fática e a continuidade da operação, sem rediscutir integralmente a viabilidade locacional já apreciada, salvo fato novo, alteração, irregularidade, dano, inconsistência ou ausência que impeça a decisão, vencimento ou mudança de titularidade. A modalidade estadual e a LOC federal devem ser avaliadas separadamente e compatibilizadas de forma motivada. A incidência atual de UC ou Plano de Manejo deve ser verificada quanto a efeitos operacionais presentes, sem reabertura automática da viabilidade locacional. Reanálise focal é necessária quando houver fato novo, ampliação, repotenciação, alteração de arranjo, nova estrutura, mudança material de operação ou incompatibilidade territorial relevante.",
    ),
    (
        "Classificar como crítico quando a lacuna impeça localizar impactos ou verificar o arranjo.",
        "Registrar a lacuna como impeditiva quando ela impossibilitar localizar impactos ou verificar o arranjo, indicando a evidência necessária ao saneamento.",
    ),
    (
        "Conclusão deve decorrer do conjunto do estudo e não ocultar lacunas críticas.",
        "A conclusão deve decorrer do conjunto do estudo e explicitar as lacunas que limitem ou impeçam a decisão.",
    ),
    (
        "Pontos críticos, caminhamentos, drenagem, taludes, margens, assoreamento, carreamento de sedimentos, evolução e medidas preventivas ou corretivas.",
        "Locais que exigem acompanhamento, caminhamentos, drenagem, taludes, margens, assoreamento, carreamento de sedimentos, evolução e medidas preventivas ou corretivas.",
    ),
    (
        "• Para processos erosivos e taludes, manter identificação individual dos pontos críticos, evolução, fotografia comparativa, drenagem e providência adotada até a estabilização.",
        "• Para processos erosivos e taludes, manter identificação individual dos pontos que exigem intervenção ou acompanhamento, evolução, fotografia comparativa, drenagem e providência adotada até a estabilização.",
    ),
    (
        "Recursos hídricos devem ser compatibilizados entre outorga, memorial, estudo ambiental, SGA e operação. Verificar corpo hídrico, domínio, coordenadas, vazões, vazão remanescente, TVR, usos múltiplos, reservatório, potência, prazos e titularidade. Ausência de outorga vigente ou equivalente pode ser pendência crítica para licença de instalação, operação e renovação, conforme o caso.",
        "Recursos hídricos devem ser compatibilizados entre outorga, memorial, estudo ambiental, SGA e operação. Verificar corpo hídrico, domínio, coordenadas, vazões, vazão remanescente, TVR, usos múltiplos, reservatório, potência, prazos e titularidade. A ausência de outorga vigente ou equivalente pode impedir a decisão sobre licença de instalação, operação ou renovação, conforme o caso, até a apresentação do ato hídrico aplicável.",
    ),
    (
        "Atividades de baixo risco",
        "Atividades abrangidas pela IN IAT nº 11/2026",
    ),
    (
        "Classificação de baixo risco dos atos ambientais, sem afastar os critérios da IN IAT nº 09/2025 para geração hidrelétrica.",
        "Critérios e procedimentos da IN IAT nº 11/2026 para os atos ambientais, sem afastar os critérios da IN IAT nº 09/2025 para geração hidrelétrica.",
    ),
    (
        "Captura de tela é útil como registro de consulta, mas não substitui arquivo geoespacial reproduzível. Para análise crítica, manter no processo ou na Informação Técnica a identificação da camada, data da consulta e, quando necessário, coordenadas ou arquivo que permita reproduzir a sobreposição.",
        "Captura de tela é útil como registro de consulta, mas não substitui arquivo geoespacial reproduzível. Para avaliação fundamentada, manter no processo ou na Informação Técnica a identificação da camada, a data da consulta e, quando necessário, as coordenadas ou o arquivo que permita reproduzir a sobreposição.",
    ),
    (
        "A vistoria deve ser planejada com base nos pontos críticos do processo. A equipe deve levar mapa, coordenadas, memorial, condicionantes, pendências, fotos históricas, licenças anteriores e roteiro de verificação. O relatório de vistoria deve registrar fatos observados, não substituir estudo técnico nem concluir além do observado.",
        "A vistoria deve ser planejada com base nos aspectos do processo que exigem verificação em campo. A equipe deve levar mapa, coordenadas, memorial, condicionantes, pendências, fotos históricas, licenças anteriores e roteiro de verificação. O relatório de vistoria deve registrar os fatos observados e as respectivas evidências, sem substituir estudo técnico nem concluir além do observado.",
    ),
    (
        "A modalidade requerida mostra-se, em tese, compatível com a situação fática apresentada, considerando [indicar fundamento]. Contudo, a documentação apresentada ainda não é suficiente para deferimento, pois [indicar pendências críticas ou médias], o que impede concluir com segurança sobre [tema]. Recomenda-se a realização de diligência para complementação dos itens indicados.",
        "A modalidade requerida mostra-se, em tese, compatível com a situação fática apresentada, considerando [indicar fundamento]. Contudo, a documentação apresentada ainda não é suficiente para deferimento, pois [indicar as pendências, seus efeitos na decisão, o saneamento necessário e a evidência esperada], o que impede concluir com segurança sobre [tema]. Recomenda-se a realização de diligência para complementação dos itens indicados.",
    ),
    (
        "Condicionante que tenta sanar pendência crítica que deveria ser resolvida antes do deferimento.",
        "Condicionante que tenta sanar pendência que deve ser resolvida antes do deferimento.",
    ),
    (
        "Há inconsistência crítica, ausência impeditiva, inadequação de modalidade, risco não controlado, incompatibilidade de outorga, titularidade, ANEEL, APP, supressão, restrição material de Unidade de Conservação ou Plano de Manejo, ou outra incompatibilidade que impeça decisão favorável.",
        "Há inconsistência ou ausência que impeça a decisão, inadequação de modalidade, risco não controlado, incompatibilidade de outorga, titularidade, ANEEL, APP, supressão, restrição material de Unidade de Conservação ou Plano de Manejo, ou outra incompatibilidade que inviabilize decisão favorável.",
    ),
    (
        "Este modelo deve ser copiado e adaptado ao processo concreto. Os campos “A conferir” e “A definir” identificam modelo em branco e não representam resultado de auditoria. Itens não aplicáveis devem ser marcados como não se aplica, com justificativa quando necessário. Itens críticos não devem ser convertidos em condicionantes se impedirem decisão segura.",
        "Este modelo deve ser copiado e adaptado ao processo concreto. Os campos “A conferir” e “A definir” identificam modelo em branco e não representam resultado de auditoria. Itens não aplicáveis devem ser marcados como não se aplica, com justificativa quando necessário. Itens que impeçam a decisão segura devem ser saneados antes do deferimento e não convertidos em condicionantes.",
    ),
    (
        "Quando classificar como crítico",
        "Quando o item impede a decisão",
    ),
    (
        "Apresentar relatório consolidado de execução dos programas ambientais, com metodologia, pontos de monitoramento, resultados, indicadores, registro fotográfico, mapas quando aplicável, análise crítica, ART e cronograma de ações corretivas.",
        "Apresentar relatório consolidado de execução dos programas ambientais, com metodologia, pontos de monitoramento, resultados, indicadores, registro fotográfico, mapas quando aplicável, avaliação fundamentada, ART e cronograma de ações corretivas.",
    ),
    (
        "Executar monitoramento de qualidade da água nos pontos a montante, reservatório, TVR e jusante, com parâmetros compatíveis com a classe do corpo hídrico, análise crítica dos resultados e medidas corretivas quando houver desconformidade.",
        "Executar monitoramento de qualidade da água nos pontos a montante, reservatório, TVR e jusante, com parâmetros compatíveis com a classe do corpo hídrico, avaliação fundamentada dos resultados e medidas corretivas quando houver desconformidade.",
    ),
    (
        "Não confundir com a audiência do EIA e do RIMA; registrar o rito específico do PACUERA.",
        "Não confundir com a audiência pública do processo submetido a EIA/RIMA; registrar o rito específico do PACUERA.",
    ),
    (
        "Distinguir o rito do PACUERA da audiência do EIA e do RIMA e registrar a motivação do instrumento adotado.",
        "Distinguir o rito do PACUERA da audiência pública do processo submetido a EIA/RIMA e registrar a motivação do instrumento adotado.",
    ),
    (
        "INSTITUTO ÁGUA E TERRA. Instrução Normativa IAT nº 64/2025. Intervenções de baixo impacto em APP de reservatórios e elaboração de PACUERA.",
        "INSTITUTO ÁGUA E TERRA. Instrução Normativa IAT nº 64/2025. Ementa resumida: regras para intervenções em APP de reservatórios e elaboração de PACUERA.",
    ),
    (
        "INSTITUTO ÁGUA E TERRA. Instrução Normativa IAT nº 11/2026. Classificação de atividades econômicas consideradas de baixo risco associada aos atos administrativos de licenciamento ambiental.",
        "INSTITUTO ÁGUA E TERRA. Instrução Normativa IAT nº 11/2026. Ementa resumida: critérios aplicáveis aos atos administrativos de licenciamento ambiental de atividades econômicas.",
    ),
)

DIAGRAM_REVISIONS: dict[str, dict[str, object]] = {
    "word/media/image9.png": {
        "sha256": "bafe78712e1810e74ae6ad83b26659f2a1cc582b288a611cf3563d289ce895e3",
        "size": (2421, 1456),
        "fill": (244, 244, 244),
        "interior": (1047, 1335, 1989, 1435),
        "lines": (
            "6. Registrar na IT/checklist: fonte, data, UC/zona,",
            "norma, consequência, evidência e encaminhamento",
        ),
        "max_font": 40,
    },
    "word/media/image11.png": {
        "sha256": "1cef96ecb34ee11ec40a527dbd2be59c79dfa3aab0f84e113e21ea0f74bbcc42",
        "size": (1069, 941),
        "fill": (244, 244, 244),
        "interior": (143, 20, 925, 120),
        "lines": (
            "1. Definir objetivo, aspectos a verificar, equipe, roteiro,",
            "segurança e documentos de referência",
        ),
        "max_font": 37,
    },
    "word/media/image12.png": {
        "sha256": "822304343e5357906ac9b203328a4af150e2201de5627064bf7917cbf1eecf68",
        "size": (1118, 1041),
        "fill": (244, 244, 244),
        "interior": (178, 630, 940, 715),
        "lines": (
            "5. Registrar o efeito de cada lacuna na decisão,",
            "o saneamento necessário e a evidência esperada",
        ),
        "max_font": 32,
    },
    "word/media/image13.png": {
        "sha256": "058d956dfbc24fc8d8660dcef0f583630e0a8e3122758ee9b4bb045f08808da6",
        "size": (2206, 1231),
        "fill": (244, 244, 244),
        "interior": (1440, 948, 2035, 1047),
        "lines": (
            "5. Definir finalidade, prazo, evidência e",
            "forma de acompanhamento de cada condicionante",
        ),
        "max_font": 39,
    },
    "word/media/image14.png": {
        "sha256": "c5399249ea37fd879d4376daec039191e85843e79c6b783c00a170c76412ecf2",
        "size": (1089, 1086),
        "fill": (232, 241, 237),
        "interior": (65, 645, 1022, 745),
        "lines": (
            "5. Confirmar separação entre modalidade e suficiência,",
            "além de consequência, saneamento, evidência e encaminhamento",
        ),
        "max_font": 34,
    },
}

FORBIDDEN_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("gravidade", re.compile(r"\bgravidad(?:e|es)\b", re.I)),
    ("severidade", re.compile(r"\bseveridad(?:e|es)\b", re.I)),
    ("criticidade", re.compile(r"\bcriticidad(?:e|es)\b", re.I)),
    ("crítico/crítica", re.compile(r"\bcr[ií]tic[oa]s?\b", re.I)),
    ("baixo risco", re.compile(r"\bbaix[oa]s?\s+risc[oa]s?\b", re.I)),
    ("baixo impacto", re.compile(r"\bbaix[oa]s?\s+impact[oa]s?\b", re.I)),
    ("baixo potencial", re.compile(r"\bbaix[oa]s?\s+potencia(?:l|is)\b", re.I)),
    (
        "classificação médio/alto/baixo",
        re.compile(
            r"\b(?:classifica(?:r|ção|do|da|dos|das)|nível|grau|faixa|status|situação|pendência|item|prioridade)"
            r"(?:\s+\w+){0,5}\s+(?:m[eé]di[oa]s?|alt[oa]s?|baix[oa]s?)\b",
            re.I,
        ),
    ),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def resolve_diagram_font() -> Path:
    candidates = (
        Path(r"C:\Windows\Fonts\arial.ttf"),
        Path(r"C:\Windows\Fonts\Arial.ttf"),
        Path("/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    )
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("Arial/Liberation Sans/DejaVu Sans font not found for deterministic diagram repair")


def revise_diagram(name: str, data: bytes) -> tuple[bytes, dict[str, object]]:
    spec = DIAGRAM_REVISIONS[name]
    actual_hash = sha256_bytes(data)
    if actual_hash != spec["sha256"]:
        raise RuntimeError(f"unexpected source hash for {name}: {actual_hash}")
    image = Image.open(io.BytesIO(data)).convert("RGB")
    if image.size != spec["size"]:
        raise RuntimeError(f"unexpected source dimensions for {name}: {image.size}")

    x0, y0, x1, y1 = spec["interior"]
    fill = spec["fill"]
    draw = ImageDraw.Draw(image)
    inset = 7
    text_box = (x0 + inset, y0 + inset, x1 - inset, y1 - inset)
    draw.rectangle(text_box, fill=fill)
    text = "\n".join(spec["lines"])
    font_path = resolve_diagram_font()
    font_size = int(spec["max_font"])
    spacing = 2
    available_width = text_box[2] - text_box[0] - 12
    available_height = text_box[3] - text_box[1] - 4
    while font_size >= 18:
        font = ImageFont.truetype(str(font_path), font_size)
        bounds = draw.multiline_textbbox((0, 0), text, font=font, spacing=spacing, align="center")
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        if width <= available_width and height <= available_height:
            break
        font_size -= 1
    else:
        raise RuntimeError(f"replacement text does not fit diagram box for {name}")
    center = ((text_box[0] + text_box[2]) / 2, (text_box[1] + text_box[3]) / 2)
    draw.multiline_text(center, text, font=font, fill=(0, 0, 0), anchor="mm", spacing=spacing, align="center")

    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    revised = buffer.getvalue()
    check = Image.open(io.BytesIO(revised))
    if check.size != spec["size"]:
        raise AssertionError(f"diagram dimensions changed for {name}")
    return revised, {
        "part": name,
        "before_sha256": actual_hash,
        "after_sha256": sha256_bytes(revised),
        "bytes": len(revised),
        "dimensions": list(check.size),
        "replacement_lines": list(spec["lines"]),
        "font": str(font_path),
        "font_size": font_size,
    }


def text_nodes(paragraph: etree._Element) -> list[etree._Element]:
    return [node for node in paragraph.iter() if node.tag in TEXT_TAGS]


def paragraph_text(paragraph: etree._Element) -> str:
    return "".join(node.text or "" for node in text_nodes(paragraph))


def replace_range(nodes: list[etree._Element], start: int, end: int, replacement: str) -> None:
    if start > end:
        raise ValueError("invalid replacement range")
    offsets: list[tuple[int, int, etree._Element]] = []
    cursor = 0
    for node in nodes:
        value = node.text or ""
        offsets.append((cursor, cursor + len(value), node))
        cursor += len(value)

    if start == end:
        # Prefer the node immediately before the insertion point so inserted
        # prose inherits the surrounding run's formatting.
        for lo, hi, node in reversed(offsets):
            if lo <= start <= hi:
                local = start - lo
                value = node.text or ""
                node.text = value[:local] + replacement + value[local:]
                return
        raise ValueError(f"insertion offset {start} is outside paragraph text")

    touched = [(lo, hi, node) for lo, hi, node in offsets if lo < end and hi > start]
    if not touched:
        raise ValueError(f"replacement range {start}:{end} has no text node")
    first_lo, _, first = touched[0]
    last_lo, _, last = touched[-1]
    first_value = first.text or ""
    last_value = last.text or ""
    prefix = first_value[: start - first_lo]
    suffix = last_value[end - last_lo :]
    if first is last:
        first.text = prefix + replacement + suffix
    else:
        first.text = prefix + replacement
        for _, _, node in touched[1:-1]:
            node.text = ""
        last.text = suffix


def transform_paragraph(paragraph: etree._Element, old: str, new: str) -> None:
    current = paragraph_text(paragraph)
    if current != old:
        raise ValueError("paragraph changed before its planned transformation")
    nodes = text_nodes(paragraph)
    matcher = difflib.SequenceMatcher(a=old, b=new, autojunk=False)
    for tag, a0, a1, b0, b1 in reversed(matcher.get_opcodes()):
        if tag == "equal":
            continue
        replace_range(nodes, a0, a1, new[b0:b1])
    actual = paragraph_text(paragraph)
    if actual != new:
        raise AssertionError(f"paragraph transformation mismatch:\nexpected={new!r}\nactual={actual!r}")
    for node in nodes:
        value = node.text or ""
        key = f"{{{XML_NS}}}space"
        if value[:1].isspace() or value[-1:].isspace():
            node.set(key, "preserve")


def add_page_break_before(root: etree._Element, caption: str) -> dict[str, object]:
    matches = [paragraph for paragraph in root.xpath(".//w:p", namespaces=NS) if paragraph_text(paragraph) == caption]
    if len(matches) != 1:
        raise RuntimeError(f"expected exactly one layout anchor, found {len(matches)}: {caption}")
    paragraph = matches[0]
    ppr = paragraph.find(f"{{{W_NS}}}pPr")
    if ppr is None:
        ppr = etree.Element(f"{{{W_NS}}}pPr")
        paragraph.insert(0, ppr)
    existing = ppr.findall(f"{{{W_NS}}}pageBreakBefore")
    if existing:
        raise RuntimeError(f"layout anchor already has pageBreakBefore: {caption}")
    ppr.append(etree.Element(f"{{{W_NS}}}pageBreakBefore"))
    paragraphs = root.xpath(".//w:p", namespaces=NS)
    return {
        "operation": "page_break_before",
        "paragraph": paragraphs.index(paragraph) + 1,
        "anchor": caption,
    }


def resize_image_drawing(
    root: etree._Element,
    relationships: etree._Element,
    media_part: str,
    *,
    numerator: int,
    denominator: int,
) -> dict[str, object]:
    if numerator <= 0 or denominator <= 0 or numerator >= denominator:
        raise ValueError("drawing scale must be between zero and one")
    target = media_part.removeprefix("word/")
    relationship_ids = [
        relationship.get("Id")
        for relationship in relationships
        if relationship.get("Target", "").replace("\\", "/") == target
    ]
    if len(relationship_ids) != 1:
        raise RuntimeError(f"expected exactly one relationship for {media_part}, found {len(relationship_ids)}")
    blips = root.xpath(".//a:blip[@r:embed=$rid]", namespaces=NS, rid=relationship_ids[0])
    if len(blips) != 1:
        raise RuntimeError(f"expected exactly one drawing for {media_part}, found {len(blips)}")
    drawings = blips[0].xpath("ancestor::w:drawing[1]", namespaces=NS)
    if len(drawings) != 1:
        raise RuntimeError(f"drawing ancestor missing for {media_part}")
    drawing = drawings[0]
    extents = drawing.xpath(".//wp:extent | .//a:xfrm/a:ext", namespaces=NS)
    if len(extents) != 2:
        raise RuntimeError(f"expected two synchronized extents for {media_part}, found {len(extents)}")
    before: list[dict[str, int]] = []
    after: list[dict[str, int]] = []
    for extent in extents:
        cx = int(extent.get("cx"))
        cy = int(extent.get("cy"))
        revised_cx = (cx * numerator + denominator // 2) // denominator
        revised_cy = (cy * numerator + denominator // 2) // denominator
        before.append({"cx": cx, "cy": cy})
        after.append({"cx": revised_cx, "cy": revised_cy})
        extent.set("cx", str(revised_cx))
        extent.set("cy", str(revised_cy))
    if len({(item["cx"], item["cy"]) for item in before}) != 1:
        raise RuntimeError(f"drawing extents were not synchronized before resize: {media_part}")
    return {
        "operation": "resize_drawing",
        "part": media_part,
        "relationship_id": relationship_ids[0],
        "scale": f"{numerator}/{denominator}",
        "before": before,
        "after": after,
    }


def all_xml_values(root: etree._Element) -> list[str]:
    values: list[str] = []
    for element in root.iter():
        # Audit the full OOXML payload, not only Word's currently visible runs:
        # properties, alternate text, deleted/hidden content and relationship
        # metadata must not retain the retired institutional vocabulary either.
        if element.text:
            values.append(element.text)
        if element.tail:
            values.append(element.tail)
        for value in element.attrib.values():
            if value:
                values.append(value)
    return values


def forbidden_hits(package: Path) -> list[dict[str, str]]:
    hits: list[dict[str, str]] = []
    with zipfile.ZipFile(package) as zf:
        for name in zf.namelist():
            if not name.endswith((".xml", ".rels")):
                continue
            try:
                root = etree.fromstring(zf.read(name))
            except etree.XMLSyntaxError:
                continue
            haystack = " ".join(all_xml_values(root))
            for label, pattern in FORBIDDEN_PATTERNS:
                for match in pattern.finditer(haystack):
                    hits.append(
                        {
                            "part": name,
                            "rule": label,
                            "match": match.group(0),
                            "context": haystack[max(0, match.start() - 80) : match.end() + 80],
                        }
                    )
    return hits


def structure_snapshot(package: Path) -> dict[str, object]:
    tags = Counter()
    rel_ids: list[str] = []
    bookmark_starts: list[tuple[str, str]] = []
    bookmark_ends: list[str] = []
    comments_parts: list[str] = []
    xml_parts: list[str] = []
    with zipfile.ZipFile(package) as zf:
        names = zf.namelist()
        bad_entry = zf.testzip()
        for name in names:
            if "comment" in name.casefold() or name.endswith("people.xml"):
                comments_parts.append(name)
            if not name.endswith((".xml", ".rels")):
                continue
            xml_parts.append(name)
            root = etree.fromstring(zf.read(name))
            for element in root.iter():
                local = etree.QName(element).localname
                tags[local] += 1
                if local == "Relationship":
                    rel_ids.append(element.get("Id", ""))
                elif local == "bookmarkStart":
                    bookmark_starts.append(
                        (
                            element.get(f"{{{W_NS}}}id", ""),
                            element.get(f"{{{W_NS}}}name", ""),
                        )
                    )
                elif local == "bookmarkEnd":
                    bookmark_ends.append(element.get(f"{{{W_NS}}}id", ""))
    tracked = {
        "insertions": tags["ins"],
        "deletions": tags["del"],
        "move_from": tags["moveFrom"],
        "move_to": tags["moveTo"],
    }
    selected_tags = {
        key: tags[key]
        for key in (
            "p",
            "r",
            "t",
            "tbl",
            "tr",
            "tc",
            "sectPr",
            "drawing",
            "hyperlink",
            "fldChar",
            "instrText",
            "lastRenderedPageBreak",
            "bookmarkStart",
            "bookmarkEnd",
            "Relationship",
        )
    }
    return {
        "zip_entry_count": len(names),
        "zip_entries": names,
        "zip_test": bad_entry,
        "xml_part_count": len(xml_parts),
        "xml_parts": xml_parts,
        "selected_tag_counts": selected_tags,
        "relationship_ids": sorted(rel_ids),
        "bookmark_starts": sorted(bookmark_starts),
        "bookmark_ends": sorted(bookmark_ends),
        "tracked_changes": tracked,
        "comment_related_parts": sorted(comments_parts),
    }


def revise(source: Path, output: Path, *, replace_existing: bool = False) -> dict[str, object]:
    if source.resolve() == output.resolve():
        raise ValueError("output must be a new path; refusing to overwrite source")
    if not source.is_file():
        raise FileNotFoundError(source)
    if output.exists() and not replace_existing:
        raise FileExistsError(f"output already exists: {output}")

    source_hash_before = sha256(source)
    if source_hash_before != EXPECTED_SOURCE_SHA256:
        raise RuntimeError(
            f"unexpected baseline SHA-256: {source_hash_before}; expected {EXPECTED_SOURCE_SHA256}"
        )
    before = structure_snapshot(source)
    temporary = output.with_name(f".{output.name}.tmp")
    if temporary.exists():
        temporary.unlink()
    with zipfile.ZipFile(source) as source_zip:
        raw_document = source_zip.read("word/document.xml")
        parser = etree.XMLParser(remove_blank_text=False, resolve_entities=False)
        root = etree.fromstring(raw_document, parser=parser)
        relationships = etree.fromstring(source_zip.read("word/_rels/document.xml.rels"), parser=parser)
        paragraphs = root.xpath(".//w:p", namespaces=NS)
        by_text: dict[str, list[etree._Element]] = {}
        for paragraph in paragraphs:
            by_text.setdefault(paragraph_text(paragraph), []).append(paragraph)

        applied: list[dict[str, object]] = []
        for old, new in PARAGRAPH_REVISIONS:
            matches = by_text.get(old, [])
            if len(matches) != 1:
                raise RuntimeError(f"expected exactly one paragraph for revision, found {len(matches)}: {old}")
            paragraph = matches[0]
            index = paragraphs.index(paragraph) + 1
            transform_paragraph(paragraph, old, new)
            applied.append({"paragraph": index, "before": old, "after": new})

        layout_changes = [
            add_page_break_before(root, "Quadro 39 - Padrão de qualidade das condicionantes"),
            resize_image_drawing(
                root,
                relationships,
                "word/media/image14.png",
                numerator=94,
                denominator=100,
            ),
        ]

        revised_document = etree.tostring(
            root,
            encoding="UTF-8",
            xml_declaration=True,
            standalone=True,
        )

        revised_diagrams: dict[str, bytes] = {}
        diagram_report: list[dict[str, object]] = []
        for name in DIAGRAM_REVISIONS:
            revised, record = revise_diagram(name, source_zip.read(name))
            revised_diagrams[name] = revised
            diagram_report.append(record)

        output.parent.mkdir(parents=True, exist_ok=True)
        # Store every entry without DEFLATE. Python versions can bundle different
        # zlib releases and therefore emit different DOCX bytes for an identical
        # OOXML package. ZIP_STORED is larger but makes the artifact byte-for-byte
        # reproducible while preserving every ZipInfo timestamp and attribute.
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_STORED) as output_zip:
            for info in source_zip.infolist():
                if info.filename == "word/document.xml":
                    data = revised_document
                elif info.filename in revised_diagrams:
                    data = revised_diagrams[info.filename]
                else:
                    data = source_zip.read(info.filename)
                deterministic_info = copy.copy(info)
                deterministic_info.compress_type = zipfile.ZIP_STORED
                deterministic_info._compresslevel = None
                output_zip.writestr(deterministic_info, data, compress_type=zipfile.ZIP_STORED)

    if sha256(source) != source_hash_before:
        raise RuntimeError("source file changed during revision")

    after = structure_snapshot(temporary)
    structural_keys = (
        "zip_entry_count",
        "zip_entries",
        "xml_part_count",
        "xml_parts",
        "selected_tag_counts",
        "relationship_ids",
        "bookmark_starts",
        "bookmark_ends",
        "tracked_changes",
        "comment_related_parts",
    )
    differences = {key: {"before": before[key], "after": after[key]} for key in structural_keys if before[key] != after[key]}
    hits = forbidden_hits(temporary)
    if after["zip_test"] is not None:
        raise RuntimeError(f"ZIP integrity failed at {after['zip_test']}")
    if differences:
        raise RuntimeError(f"structural invariants changed: {json.dumps(differences, ensure_ascii=False)}")
    if hits:
        raise RuntimeError(f"forbidden institutional language remains: {json.dumps(hits, ensure_ascii=False)}")

    with zipfile.ZipFile(source) as z1, zipfile.ZipFile(temporary) as z2:
        changed_parts = [name for name in z1.namelist() if z1.read(name) != z2.read(name)]
    expected_changed = {"word/document.xml", *DIAGRAM_REVISIONS.keys()}
    if set(changed_parts) != expected_changed:
        raise RuntimeError(f"unexpected changed package parts: {changed_parts}")

    temporary.replace(output)

    return {
        "source": str(source),
        "source_bytes": source.stat().st_size,
        "source_sha256": source_hash_before,
        "output": str(output),
        "output_bytes": output.stat().st_size,
        "output_sha256": sha256(output),
        "applied_revision_count": len(applied),
        "applied_revisions": applied,
        "layout_changes": layout_changes,
        "revised_diagrams": diagram_report,
        "changed_package_parts": changed_parts,
        "forbidden_hits": hits,
        "structure_before": before,
        "structure_after": after,
        "structural_differences": differences,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Revisão contextual da linguagem operacional do POP DLE-HID-001 v1.9")
    parser.add_argument("--source", type=Path, default=SOURCE)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--audit-only", action="store_true")
    parser.add_argument("--replace-existing", action="store_true")
    args = parser.parse_args()

    if args.audit_only:
        result = {
            "file": str(args.source),
            "bytes": args.source.stat().st_size,
            "sha256": sha256(args.source),
            "forbidden_hits": forbidden_hits(args.source),
            "structure": structure_snapshot(args.source),
        }
    else:
        result = revise(args.source, args.output, replace_existing=args.replace_existing)

    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    if result.get("forbidden_hits"):
        sys.exit(2)


if __name__ == "__main__":
    main()
