# -*- coding: utf-8 -*-
"""Gera uma videoaula de 30 s por modulo (m00 a m16, 17 modulos), com abertura, etapas
animadas, capitulos de legenda, encerramento, VTT e poster proprios."""
from __future__ import annotations

import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".video_tools"))

from PIL import Image, ImageDraw, ImageFont  # noqa: E402
import imageio_ffmpeg  # noqa: E402

WIDTH, HEIGHT, FPS, DURATION = 1280, 720, 15, 30
OUT = ROOT / "public" / "media"

P = {
    "ink": "#071f1d", "deep": "#063b31", "green": "#0a7755", "mint": "#57d8bf",
    "blue": "#34a9e1", "amber": "#f3bd4f", "coral": "#f07e68", "white": "#ffffff",
    "muted": "#b9d0ca",
}
ACCENTS = ["#57d8bf", "#34a9e1", "#f3bd4f", "#7ec8a9", "#9fb7ff"]


def font(size: int, bold: bool = False):
    path = Path(r"C:\\Windows\\Fonts\\segoeui" + ("b" if bold else "") + ".ttf")
    return ImageFont.truetype(str(path), size=size)


F = {
    "kicker": font(19, True), "mega": font(58, True), "title": font(42, True),
    "subtitle": font(23), "node": font(23, True), "small": font(18),
    "caption": font(24, True), "code": font(30, True),
}

# titulo curto do video, subtitulo, 5 etapas (num, verbo, detalhe), 6 legendas
SPECS = {
    "m00": ("Orientação e escopo", "O POP organiza o método; não cria exigência nova.",
        [("1", "Situar", "Para que serve o POP"), ("2", "Delimitar", "O que ele não substitui"), ("3", "Controlar", "Versão e vigência"), ("4", "Registrar", "Limitações explícitas"), ("5", "Aplicar", "Método no caso concreto")],
        ["O POP orienta recém-ingressos e uniformiza equipes experientes.", "Ele não substitui outorga, ANEEL, IPHAN nem manifestação jurídica.", "Confirme sempre a versão vigente do procedimento.", "Sem elemento suficiente, registre a limitação com clareza.", "A exigência precisa de fundamento aplicável, não do POP em si.", "Método claro protege a decisão e quem decide."]),
    "m01": ("Papéis, normas e método", "Ordem de consulta e sequência rastreável de decisão.",
        [("1", "Papéis", "Competência de cada ator"), ("2", "Fontes", "Ordem de consulta"), ("3", "Transição", "Regime aplicável"), ("4", "Conceitos", "Definições operacionais"), ("5", "Método", "Sequência obrigatória")],
        ["Cada órgão decide no seu limite; o IAT verifica compatibilidade.", "Lei e regulamento prevalecem sobre TR e orientação interna.", "Em transição normativa, registre datas, estágio e justificativa.", "Definições precisas evitam enquadramentos improvisados.", "A sequência de decisão deve ser rastreável de ponta a ponta.", "Método obrigatório é proteção, não burocracia."]),
    "m02": ("Fluxo geral e triagem", "A conclusão é resultado, nunca o ponto de partida.",
        [("1", "Receber", "Identificar o objeto"), ("2", "Ordenar", "Leitura cronológica"), ("3", "Conferir", "Suficiência inicial"), ("4", "Decidir", "Saídas da triagem"), ("5", "Registrar", "Motivação da saída")],
        ["Comece pelo objeto do pedido e pelo histórico do processo.", "Leitura cronológica e temática antes de qualquer juízo.", "Sem documento exigível: diligência documental.", "Estudo com lacuna técnica: diligência técnica fundamentada.", "Delimitação espacial exige poligonais e arquivos geoespaciais.", "A conclusão resulta da compatibilização documental e técnica."]),
    "m03": ("Enquadramento e Consulta Prévia", "A modalidade não se define por um único número.",
        [("1", "Caracterizar", "Potência e alagamento"), ("2", "Restringir", "Critério mais rigoroso"), ("3", "Avaliar", "IDA e sensibilidade"), ("4", "Consultar", "Cenários da CP"), ("5", "Motivar", "Modalidade e estudo")],
        ["Potência e área de alagamento abrem o enquadramento.", "Entre critérios, prevalece o mais restritivo.", "IDA e sensibilidade ambiental refinam a decisão.", "A Consulta Prévia orienta, mas não aprova viabilidade.", "Manifestação da CP vale 24 meses e não gera prioridade.", "Enquadramento motivado sustenta todo o resto do processo."]),
    "m04": ("DLAM, LAC e LAS", "Simplificação tem limites definidos.",
        [("1", "DLAM", "Quando dispensa cabe"), ("2", "LAC", "Adesão e compromisso"), ("3", "LAS", "Rito simplificado"), ("4", "Limites", "O que não cabe"), ("5", "Verificar", "Condições declaradas")],
        ["Dispensa não significa ausência de controle ambiental.", "Na adesão, o declarado vincula o empreendedor.", "O simplificado exige enquadramento estrito.", "Fora dos limites, o rito comum se impõe.", "Declarações são verificáveis e geram responsabilidade.", "Simplificar o rito não simplifica o dever técnico."]),
    "m05": ("LP, LI e LO em sequência", "Cada fase tem finalidade e produto próprios.",
        [("1", "LP", "Viabilidade e locação"), ("2", "LI", "Projeto e instalação"), ("3", "LO", "Operação e condições"), ("4", "Mérito", "Análise por fase"), ("5", "Produto", "Ato fundamentado")],
        ["A LP julga viabilidade e concepção, não obra.", "A LI autoriza instalar conforme projeto aprovado.", "A LO verifica se o instalado corresponde ao licenciado.", "Documento de fase anterior não supre exigência da atual.", "Condicionantes acompanham a fase e o impacto real.", "Três fases, três decisões, uma cadeia rastreável."]),
    "m06": ("Situações especiais", "Sem misturar objetos, títulos ou fases.",
        [("1", "AA", "Autorização ambiental"), ("2", "Renovar", "Prazo e continuidade"), ("3", "Regularizar", "Passivo declarado"), ("4", "Transferir", "Titularidade"), ("5", "Alterar", "Mudanças no objeto")],
        ["Autorização ambiental tem objeto próprio e delimitado.", "Renovação tempestiva prorroga a licença até decisão.", "Regularização não apaga o histórico do empreendimento.", "Transferência exige compatibilidade documental e setorial.", "Alteração relevante reabre análise proporcional.", "Cada situação especial tem rito e limite próprios."]),
    "m07": ("Sistemas associados e barragens", "Interfaces e segurança caminham juntas.",
        [("1", "Mapear", "Linhas, acessos, apoio"), ("2", "Titular", "Compatibilidade setorial"), ("3", "PNSB", "Classificação e planos"), ("4", "PAE", "ZAS e emergência"), ("5", "Integrar", "Licença e segurança")],
        ["Sistemas associados também têm impacto e licenciamento.", "Linha, subestação e acesso pedem coerência de titularidade.", "A PNSB classifica por risco e dano potencial.", "PSB e PAE são exigíveis conforme a classificação.", "ZAS exige atenção especial de comunicação e resposta.", "Segurança de barragem dialoga com o licenciamento, sem substituí-lo."]),
    "m08": ("Memorial e estudos", "Critérios de suficiência antes do mérito.",
        [("1", "Memorial", "Coerência interna"), ("2", "Estudo", "Tipo pela modalidade"), ("3", "Suficiência", "Conteúdo mínimo"), ("4", "Lacunas", "Complementação"), ("5", "Mérito", "Análise integrada")],
        ["O memorial descreve o empreendimento com coerência técnica.", "PCA, RAS, RDPA, EIA: o estudo segue a modalidade.", "Suficiência se afere por critério, não por volume.", "Lacuna técnica gera pedido fundamentado de complementação.", "Estudo suficiente habilita a análise de mérito.", "Sem suficiência, o mérito espera."]),
    "m09": ("PACUERA integral", "Território, participação e governança.",
        [("1", "Exigir", "Fase e TR"), ("2", "Diagnosticar", "Fragilidades e usos"), ("3", "Zonear", "UTHs no território"), ("4", "Participar", "Sociedade no processo"), ("5", "Implementar", "Indicadores e revisão")],
        ["Confirme exigibilidade, fase e Termo de Referência.", "O diagnóstico integrado sustenta o zoneamento.", "UTHs organizam o entorno do reservatório.", "Participação social é etapa, não formalidade.", "Aprovar inclui implementação, indicadores e revisão.", "PACUERA é gestão contínua do território, não anexo."]),
    "m10": ("Base espacial e meio ambiente", "A análise começa no mapa.",
        [("1", "Cartografia", "Poligonais e datum"), ("2", "APP", "Faixas e restrições"), ("3", "Flora", "Supressão e bioma"), ("4", "Fauna", "Manejo e resgate"), ("5", "Água", "Outorga e usos")],
        ["Sem base espacial confiável, não há análise segura.", "Verifique datum, fuso e coerência das poligonais.", "APP e restrições espaciais delimitam o possível.", "Supressão exige autorização e compensação corretas.", "Fauna e ictiofauna pedem manejo fundamentado.", "Recursos hídricos fecham a verificação integrada."]),
    "m11": ("Intervenientes e vistoria", "Verificar sem invadir competência.",
        [("1", "ANEEL", "Ato setorial"), ("2", "IPHAN", "Patrimônio"), ("3", "Outros", "Manifestações"), ("4", "Vistoriar", "Evidência de campo"), ("5", "Registrar", "Achados e relação")],
        ["O IAT verifica existência e compatibilidade dos atos externos.", "Não se substitui a decisão do órgão competente.", "Manifestação de interveniente integra o processo.", "A vistoria produz evidência localizada e datada.", "Achados de campo se relacionam ao objeto do processo.", "Rastreabilidade de campo é parte do produto técnico."]),
    "m12": ("Da suficiência à conclusão", "Linguagem proporcional e verificável.",
        [("1", "Matriz", "Suficiência documental"), ("2", "Pendência", "Lacuna e fundamento"), ("3", "Condicionar", "Clareza e proporção"), ("4", "Concluir", "Manifestação técnica"), ("5", "Comunicar", "Encaminhamento")],
        ["A matriz documental mostra o que sustenta a decisão.", "Pendência boa indica lacuna, fundamento e providência.", "Condicionante clara é verificável e ligada ao impacto.", "A conclusão deriva da análise, nunca a precede.", "Impacto não mitigável aciona a compensação do Decreto Estadual nº 7.150/2024.", "Escrever bem é decidir bem."]),
    "m13": ("Qualidade e rastreabilidade", "Padrão documental protege a decisão.",
        [("1", "Formatar", "Padrão institucional"), ("2", "Revisar", "Coerência interna"), ("3", "Evidenciar", "Fontes citadas"), ("4", "Conferir", "Consistência final"), ("5", "Assinar", "Responsabilidade")],
        ["Formato padronizado facilita leitura e controle.", "Análise, conclusão e condicionantes devem conversar.", "Cada afirmação técnica tem evidência localizável.", "A revisão final captura inconsistências internas.", "Assinatura pressupõe conferência completa.", "Qualidade documental é qualidade de decisão."]),
    "m14": ("Anexos e referências", "Modelos apoiam; a análise decide.",
        [("1", "Modelos", "Base adaptável"), ("2", "Siglas", "Glossário do POP"), ("3", "Referências", "Fontes do método"), ("4", "Integrar", "Caso completo"), ("5", "Consolidar", "Percurso fechado")],
        ["Anexos trazem modelos reutilizáveis, não fôrmas fixas.", "Adapte o modelo ao caso concreto, sempre.", "O glossário evita ambiguidade de sigla e termo.", "Referências ancoram o método nas fontes.", "Os anexos A a E fecham o percurso com modelos, siglas e referências.", "Fim do percurso: método aplicado com autonomia."]),
    "m15": ("Unidades de conservação e APAs", "UC no entorno muda a análise, e APA tem cuidado próprio.",
        [("1", "Triar", "UC, APA e zona"), ("2", "Localizar", "GeoPR e GeoParaná"), ("3", "Consultar", "Órgão gestor"), ("4", "Aplicar", "Plano de Manejo"), ("5", "Registrar", "Efeito por fase")],
        ["Toda triagem verifica unidade de conservação, APA e zona de amortecimento.", "A base espacial oficial sustenta a análise: GeoPR e GeoParaná.", "Em UC, verifique categoria, Plano de Manejo e zona incidente antes de concluir.", "APA admite uso, mas o zoneamento do Plano de Manejo condiciona a decisão.", "Plano de Manejo alterado depois da licença exige análise da situação nova.", "O efeito muda conforme a fase e a modalidade do licenciamento."]),
    "m16": ("Licenciamento federal delegado", "Competência da União executada pelo IAT, com ACT e relatório anual.",
        [("1", "Competência", "Origem e delegação"), ("2", "ACT", "Ler e controlar"), ("3", "Obrigações", "Papel de delegatário"), ("4", "RTAA", "Relatório anual"), ("5", "Prestar", "Contas e retomada")],
        ["Primeiro identifique se a competência é originária da União e foi delegada.", "O Acordo de Cooperação Técnica define o que o IAT pode e deve fazer.", "Como delegatário, o IAT assume obrigações próprias e prazos definidos.", "O RTAA é o Relatório Técnico Anual de Atividades, enviado uma vez por ano.", "Em RLO de UHE com 300 MW ou mais, a análise começa pela competência.", "A compensação permanece com o Ibama, salvo cláusula expressa do ACT."]),
}


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def wrap(d, text, fnt, maxw):
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = (line + " " + w).strip()
        if d.textlength(trial, font=fnt) > maxw:
            lines.append(line)
            line = w
        else:
            line = trial
    if line:
        lines.append(line)
    return lines


def backdrop(d, t):
    for row in range(6):
        pts = []
        for x in range(-50, WIDTH + 60, 18):
            y = 570 + row * 18 + math.sin((x / 155) + t * .55 + row * .7) * (18 + row * 2)
            pts.append((x, y))
        d.line(pts, fill=(19, 91 + row * 5, 84 + row * 6), width=2)
    orb_x = 1110 + math.sin(t * .35) * 22
    d.ellipse((orb_x - 165, -110, orb_x + 165, 220), fill="#0b333a")


def make_frame(code, spec, frame_no: int):
    title, subtitle, steps, captions = spec
    t = frame_no / FPS
    im = Image.new("RGB", (WIDTH, HEIGHT), P["ink"])
    d = ImageDraw.Draw(im)
    backdrop(d, t)
    accent = ACCENTS[int(code[1:]) % len(ACCENTS)]

    if t < 2.6:  # cartao de abertura
        k = ease(t / 1.1)
        d.rounded_rectangle((70, 250, 70 + int(k * 240), 258), radius=4, fill=accent)
        d.text((70, 280), code.upper(), font=F["code"], fill=accent)
        lines = wrap(d, title, F["mega"], 1100)
        for i, ln in enumerate(lines[:2]):
            d.text((70, 330 + i * 66), ln, font=F["mega"], fill=P["white"])
        sub_k = ease((t - .7) / 1.0)
        if sub_k > 0:
            d.text((70, 340 + len(lines[:2]) * 66 + 10), subtitle, font=F["subtitle"],
                   fill=(int(199 * sub_k), int(228 * sub_k), int(222 * sub_k)))
        d.text((70, 630), "VIDEOAULA · 30 S · ACADEMIA IAT", font=F["kicker"], fill="#73ead8")
        return im

    if t > DURATION - 2.4:  # cartao de encerramento
        k = ease((t - (DURATION - 2.4)) / .9)
        d.text((70, 300), "Continue na aula completa", font=F["title"],
               fill=(int(255 * k), int(255 * k), int(255 * k)))
        d.text((70, 366), f"Módulo {code.upper()} · leitura integral do POP, quadros e prática",
               font=F["subtitle"], fill="#c7e4de")
        d.rounded_rectangle((70, 430, 340, 478), 24, P["green"])
        d.text((100, 442), "Abrir o módulo", font=F["node"], fill="white")
        return im

    tc = t - 2.6  # tempo da fase de conteudo
    intro = ease(tc / 0.8)
    dx = int((1 - intro) * -70)
    d.rounded_rectangle((70 + dx, 48, 330 + dx, 82), 18, "#10584e", outline="#2a8a78", width=1)
    d.text((88 + dx, 54), f"VIDEOAULA · {code.upper()}", font=F["kicker"], fill="#73ead8")
    d.text((70 + dx, 105), title, font=F["title"], fill=P["white"])
    d.text((70 + dx, 163), subtitle, font=F["subtitle"], fill="#c7e4de")

    span = (DURATION - 5.0 - 2.0) / 5  # janela ativa por etapa
    active = min(4, max(0, int(tc // span)))
    start_x, gap, box_w, box_h = 70, 28, 212, 168
    for i, (num, verb, detail) in enumerate(steps):
        local = ease((tc - (0.2 + i * .34)) / .8)
        x = start_x + i * (box_w + gap)
        y = 250 + int((1 - local) * 35)
        fill = P["deep"] if i != active else "#0d584b"
        border = accent if i == active else "#28786b"
        w = 4 if i == active else 2
        d.rounded_rectangle((x, y, x + box_w, y + box_h), 20, fill, outline=border, width=w)
        pulse = 4 + int((math.sin(t * 5) + 1) * 2) if i == active else 0
        d.ellipse((x + 18 - pulse, y + 18 - pulse, x + 60 + pulse, y + 60 + pulse),
                  fill=P["blue"] if i in (2, 3) else P["green"])
        d.text((x + 33, y + 25), num, anchor="mm", font=F["node"], fill="white")
        d.text((x + 20, y + 78), verb.upper(), font=F["small"], fill="#79cdbc")
        for li, txt in enumerate(wrap(d, detail, F["node"], box_w - 34)[:2]):
            d.text((x + 20, y + 108 + li * 28), txt, font=F["node"], fill=P["white"])
        if i < 4:
            ax = x + box_w + 4
            d.line((ax, y + 84, ax + gap - 8, y + 84), fill=accent, width=4)
            d.polygon([(ax + gap - 8, y + 77), (ax + gap - 8, y + 91), (ax + gap, y + 84)], fill=accent)

    # legenda em capitulos com fade curto
    seg = (DURATION - 5.0) / 6
    ci = min(5, int(tc // seg))
    cseg = (tc - ci * seg) / seg
    fade = min(1.0, cseg * 6)
    cap_y = 480
    d.rounded_rectangle((70, cap_y, 1210, cap_y + 74), 10, "#092e2c", outline="#26685f", width=1)
    bar = [P["mint"], P["blue"], P["amber"], P["coral"], "#7ec8a9", "#9fb7ff"][ci]
    d.rectangle((70, cap_y, 77, cap_y + 74), fill=bar)
    cf = int(255 * fade)
    d.text((95, cap_y + 22), captions[ci], font=F["caption"], fill=(cf, cf, cf))

    d.text((70, 665), f"Videoaula didática do módulo {code.upper()} · confirme norma e orientação vigentes.",
           font=F["small"], fill=P["muted"])
    d.rounded_rectangle((70, 627, 1210, 635), radius=4, fill="#224d49")
    d.rounded_rectangle((70, 627, 70 + int(1140 * t / DURATION), 635), radius=4, fill=accent)
    d.text((1150, 594), f"00:{min(DURATION - 1, int(t)):02d}", font=F["small"], fill="#d5e8e4")
    return im


def write_vtt(code, spec):
    captions = spec[3]
    seg = (DURATION - 5.0) / 6
    lines = ["WEBVTT", ""]
    for i, cap in enumerate(captions):
        a = 2.6 + i * seg
        b = 2.6 + (i + 1) * seg
        lines += [f"00:00:{a:06.3f} --> 00:00:{b:06.3f}".replace(".", ",", 0), cap, ""]
    # formato VTT usa ponto decimal
    text = "\n".join(lines)
    (OUT / f"{code}.vtt").write_text(text, encoding="utf-8")


def build(code, spec):
    path = OUT / f"{code}.mp4"
    writer = imageio_ffmpeg.write_frames(
        str(path), (WIDTH, HEIGHT), fps=FPS, quality=7, codec="libx264",
        macro_block_size=1, output_params=["-movflags", "+faststart"],
    )
    writer.send(None)
    for frame_no in range(FPS * DURATION):
        writer.send(make_frame(code, spec, frame_no).tobytes())
    writer.close()
    write_vtt(code, spec)
    make_frame(code, spec, int(4.2 * FPS)).save(OUT / f"{code}-poster.png")
    print(path.name, path.stat().st_size)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for code, spec in SPECS.items():
        build(code, spec)
    print("OK", len(SPECS), "videoaulas")
