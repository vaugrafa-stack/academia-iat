# -*- coding: utf-8 -*-
"""Gera e audita o mapa do Paraná: bacias e usinas hidrelétricas.

Duas fontes, ambas publicas:
  - bacias: divisão hidrográfica oficial do Paraná (16 bacias nomeadas);
  - usinas: SIGA, o registro aberto de empreendimentos de geracao da ANEEL,
    filtrado para hidreletricas do Parana com coordenada valida.

NAO usa a base de processos do IAT. O mapa mostra o que a ANEEL publica sobre
empreendimentos existentes, nao o andamento de processo de ninguem.

O SVG proprio continua sendo o nucleo offline do mapa. A geometria vem junto,
simplificada, e permanece utilizavel sem rede. A projecao visual usa Web
Mercator para que, quando houver conexao, uma camada remota opcional de imagens
possa ser alinhada sem alterar as bacias e os pontos embarcados.

Uso:
  python tools/build_mapa.py
  python tools/build_mapa.py --check
  python tools/build_mapa.py --data-dir C:\\caminho\\para\\Dashboard\\data

O registro ``tools/mapa-fontes.json`` fixa metadados e SHA-256 dos arquivos de
entrada. Uma troca de fonte não atualiza o artefato silenciosamente: primeiro é
necessário revisar e atualizar o registro de proveniência.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import re
import sys
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
SAIDA = RAIZ / "src" / "data" / "mapa-parana.json"
REGISTRO_FONTES = RAIZ / "tools" / "mapa-fontes.json"

# As fontes integrais ficam fora deste repositório. O caminho pode ser
# informado sem gravar diretório pessoal no código ou no artefato publicado.
BASE_DADOS_PADRAO = Path.home() / "Downloads" / "IAT" / "Dashboard" / "data"

LARGURA, ALTURA = 1000, 620
MARGEM = 14
TOLERANCIA = 0.004        # graus; simplificacao das bacias
TIPOS = ("CGH", "PCH", "UHE")


def argumentos(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path(os.environ.get("IAT_DASHBOARD_DATA_DIR", BASE_DADOS_PADRAO)),
        help="Diretório que contém bacias_parana.geojson e external/siga_aneel.csv.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Valida fontes, regenera em memória e falha se o JSON versionado divergir.",
    )
    return parser.parse_args(argv)


def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as arquivo:
        for bloco in iter(lambda: arquivo.read(1024 * 1024), b""):
            h.update(bloco)
    return h.hexdigest()


def carregar_registro():
    registro = json.loads(REGISTRO_FONTES.read_text(encoding="utf-8"))
    if registro.get("schemaVersion") != 1:
        raise RuntimeError("Versão desconhecida em tools/mapa-fontes.json.")
    fontes = registro.get("sources")
    if (
        not isinstance(fontes, list)
        or len(fontes) != 2
        or {f.get("layer") for f in fontes} != {"bacias", "usinas"}
    ):
        raise RuntimeError("O registro deve conter exatamente as camadas bacias e usinas.")
    return registro


def caminhos_fontes(data_dir):
    return {
        "bacias": data_dir / "bacias_parana.geojson",
        "usinas": data_dir / "external" / "siga_aneel.csv",
    }


def validar_fontes(registro, caminhos):
    for fonte in registro["sources"]:
        camada = fonte["layer"]
        path = caminhos[camada]
        if not path.is_file():
            raise FileNotFoundError(
                f"Fonte da camada {camada!r} não localizada. Informe --data-dir ou "
                "IAT_DASHBOARD_DATA_DIR."
            )
        esperado = fonte.get("sha256", "").lower()
        if not re.fullmatch(r"[0-9a-f]{64}", esperado):
            raise RuntimeError(f"SHA-256 inválido no registro da camada {camada!r}.")
        observado = sha256(path)
        if observado != esperado:
            raise RuntimeError(
                f"A fonte local da camada {camada!r} mudou.\n"
                f"  esperado: {esperado}\n"
                f"  observado: {observado}\n"
                "Não atualize o hash automaticamente: confira origem, data, licença, "
                "transformação e impacto antes de revisar tools/mapa-fontes.json."
            )


def num(v):
    """Aceita 1.234,56 e 1234.56, devolvendo float ou None."""
    s = str(v or "").strip()
    if not s:
        return None
    s = s.replace(" ", "")
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")
    else:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def web_mercator_normalizado(lon, lat):
    """Converte WGS 84 para a grade Web Mercator normalizada entre 0 e 1."""
    limite = 85.05112878
    latitude = max(-limite, min(limite, lat))
    phi = math.radians(latitude)
    return (
        (lon + 180.0) / 360.0,
        (1.0 - math.asinh(math.tan(phi)) / math.pi) / 2.0,
    )


def perpendicular(p, a, b):
    (px, py), (ax, ay), (bx, by) = p, a, b
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def simplificar(pontos, tol):
    """Douglas-Peucker. As bacias somam 305 kB brutas; sem reduzir, o mapa
    pesaria mais que todo o restante do pacote."""
    if len(pontos) < 3:
        return pontos
    dmax, idx = 0.0, 0
    for i in range(1, len(pontos) - 1):
        d = perpendicular(pontos[i], pontos[0], pontos[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax <= tol:
        return [pontos[0], pontos[-1]]
    return simplificar(pontos[: idx + 1], tol)[:-1] + simplificar(pontos[idx:], tol)


def aneis(geom):
    t = geom.get("type")
    if t == "Polygon":
        return list(geom["coordinates"])
    if t == "MultiPolygon":
        return [anel for poly in geom["coordinates"] for anel in poly]
    return []


def dentro(px, py, anel):
    """Ponto em poligono por cruzamento de raio."""
    dentro_ = False
    n = len(anel)
    j = n - 1
    for i in range(n):
        xi, yi = anel[i]
        xj, yj = anel[j]
        if (yi > py) != (yj > py):
            xint = (xj - xi) * (py - yi) / (yj - yi) + xi
            if px < xint:
                dentro_ = not dentro_
        j = i
    return dentro_


def bacia_do_ponto(lon, lat, bacias):
    """Qual bacia contem a usina. Sem isto a bacia so tem nome e area, e o
    mapa nao responde a pergunta que interessa: quantas usinas ha nela."""
    for b in bacias:
        for anel in b["partes"]:
            if dentro(lon, lat, anel):
                return b["nome"]
    return None


def carregar_bacias(path):
    dados = json.loads(path.read_text(encoding="utf-8"))
    out = []
    for f in dados.get("features", []):
        nome = (f.get("properties", {}).get("NOME") or "").strip()
        if not nome or nome == "None":
            continue                      # feicoes sem nome no arquivo de origem
        area = num(f.get("properties", {}).get("AREA_KM2"))
        partes = []
        for anel in aneis(f.get("geometry", {})):
            pts = [(p[0], p[1]) for p in anel if len(p) >= 2]
            if len(pts) >= 4:
                partes.append(simplificar(pts, TOLERANCIA))
        if partes:
            out.append({"nome": nome, "area": round(area) if area else None, "partes": partes})
    return out


def carregar_usinas(path):
    out = []
    # O SIGA vem em cp1252, nao em UTF-8: lido como UTF-8 com errors=replace,
    # "Foz do Jordao" e "Candoi" chegavam com losango no lugar do acento.
    with path.open(encoding="cp1252", newline="") as f:
        for row in csv.DictReader(f, delimiter=";"):
            if (row.get("SigUFPrincipal") or "").strip() != "PR":
                continue
            tipo = (row.get("SigTipoGeracao") or "").strip()
            if tipo not in TIPOS:
                continue
            lat = num(row.get("NumCoordNEmpreendimento"))
            lon = num(row.get("NumCoordEEmpreendimento"))
            if lat is None or lon is None:
                continue
            if not (-27 < lat < -22 and -55 < lon < -48):   # fora do Parana
                continue
            kw = num(row.get("MdaPotenciaFiscalizadaKw")) or num(row.get("MdaPotenciaOutorgadaKw"))
            nome = re.sub(r"\s+", " ", (row.get("NomEmpreendimento") or "").strip())
            out.append({
                "nome": nome,
                "tipo": tipo,
                "mw": round(kw / 1000, 2) if kw else None,
                "fase": (row.get("DscFaseUsina") or "").strip(),
                "mun": re.sub(r"\s+", " ", (row.get("DscMuninicpios") or "").strip())[:70],
                "bacia": (row.get("DscSubBacia") or "").strip(),
                "lat": lat, "lon": lon,
            })
    out.sort(key=lambda u: (u["tipo"], -(u["mw"] or 0)))
    return out


def gerar_documento(caminhos):
    bacias = carregar_bacias(caminhos["bacias"])
    usinas = carregar_usinas(caminhos["usinas"])

    if not bacias:
        raise RuntimeError("A fonte de bacias não produziu nenhuma geometria nomeada.")
    if not usinas:
        raise RuntimeError("A fonte SIGA não produziu nenhuma usina válida para o Paraná.")

    pontos_geo = (
        [p for b in bacias for parte in b["partes"] for p in parte]
        + [(u["lon"], u["lat"]) for u in usinas]
    )
    pontos_projetados = [web_mercator_normalizado(lon, lat) for lon, lat in pontos_geo]
    xs = [p[0] for p in pontos_projetados]
    ys = [p[1] for p in pontos_projetados]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)

    # A mesma projecao dos mosaicos cartograficos online permite sobrepor a
    # imagem opcional sem sacrificar o SVG proprio quando nao houver conexao.
    larg_geo, alt_geo = x1 - x0, y1 - y0
    escala = min((LARGURA - 2 * MARGEM) / larg_geo, (ALTURA - 2 * MARGEM) / alt_geo)
    dx = (LARGURA - larg_geo * escala) / 2
    dy = (ALTURA - alt_geo * escala) / 2

    def proj(lon, lat):
        x, y = web_mercator_normalizado(lon, lat)
        return (round((x - x0) * escala + dx, 1),
                round((y - y0) * escala + dy, 1))

    # Atribuicao da bacia a cada usina. Precisa vir antes do laco abaixo, que
    # descarta a geometria: sem a contagem, a bacia so teria nome e area e o
    # mapa nao responderia quantas usinas ha nela.
    for u in usinas:
        u["baciaPR"] = bacia_do_ponto(u["lon"], u["lat"], bacias)
    contagem = Counter(u["baciaPR"] for u in usinas if u["baciaPR"])
    for b in bacias:
        b["usinas"] = contagem.get(b["nome"], 0)

    for b in bacias:
        caminhos = []
        for parte in b["partes"]:
            d = "M" + " L".join(f"{x} {y}" for x, y in (proj(lo, la) for lo, la in parte)) + "Z"
            caminhos.append(d)
        b["d"] = " ".join(caminhos)
        del b["partes"]

    for u in usinas:
        u["x"], u["y"] = proj(u["lon"], u["lat"])
        del u["lon"], u["lat"]

    return {
        "largura": LARGURA, "altura": ALTURA,
        "tileProjection": {
            "type": "web-mercator",
            "normalizedExtent": {
                "xMin": round(x0 - dx / escala, 12),
                "yMin": round(y0 - dy / escala, 12),
                "xMax": round(x0 + (LARGURA - dx) / escala, 12),
                "yMax": round(y0 + (ALTURA - dy) / escala, 12),
            },
        },
        "bacias": sorted(bacias, key=lambda b: b["nome"]),
        "usinas": usinas,
        "fontes": [
            "Divisão hidrográfica do Estado do Paraná, 18 bacias.",
            "SIGA, Sistema de Informações de Geração da ANEEL, registro público de empreendimentos.",
        ],
    }


def serializar_documento(documento):
    return json.dumps(documento, ensure_ascii=False, separators=(",", ":"))


def main(argv=None):
    args = argumentos(argv)
    try:
        registro = carregar_registro()
        caminhos = caminhos_fontes(args.data_dir.expanduser().resolve())
        validar_fontes(registro, caminhos)
        documento = gerar_documento(caminhos)
        serializado = serializar_documento(documento)
    except (OSError, RuntimeError, ValueError) as erro:
        print(f"FALHA: {erro}", file=sys.stderr)
        return 1

    if args.check:
        if not SAIDA.is_file():
            print(f"FALHA: artefato versionado não localizado: {SAIDA}", file=sys.stderr)
            return 1
        if SAIDA.read_text(encoding="utf-8") != serializado:
            print(
                "FALHA: src/data/mapa-parana.json está desatualizado. "
                "Revise as fontes e execute: python tools/build_mapa.py",
                file=sys.stderr,
            )
            return 1
        acao = "Validado"
    else:
        SAIDA.write_text(serializado, encoding="utf-8")
        acao = "Atualizado"

    kb = len(serializado.encode("utf-8")) / 1024
    print(
        f"{acao}: {len(documento['bacias'])} bacias e "
        f"{len(documento['usinas'])} usinas | {kb:.0f} kB"
    )
    print("por tipo:", dict(Counter(u["tipo"] for u in documento["usinas"])))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
