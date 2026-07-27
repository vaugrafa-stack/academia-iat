# -*- coding: utf-8 -*-
"""Gera o mapa do Parana: bacias hidrograficas e usinas hidreletricas.

Duas fontes, ambas publicas:
  - bacias: divisao hidrografica oficial do Parana (18 bacias);
  - usinas: SIGA, o registro aberto de empreendimentos de geracao da ANEEL,
    filtrado para hidreletricas do Parana com coordenada valida.

NAO usa a base de processos do IAT. O mapa mostra o que a ANEEL publica sobre
empreendimentos existentes, nao o andamento de processo de ninguem.

Por que um SVG proprio em vez de mapa de tiles: a aplicacao roda sob CSP
restrita (`default-src 'self'`) e precisa funcionar sem rede. Tile externo
seria bloqueado pela politica e sumiria offline. Aqui a geometria vem junto,
simplificada, e o mapa continua inteiro em campo.

Uso:  python tools/build_mapa.py
"""
from __future__ import annotations

import csv
import json
import math
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
SAIDA = RAIZ / "src" / "data" / "mapa-parana.json"

# As fontes ficam fora deste repositorio, no projeto de dados do Dashboard.
BASE_DADOS = Path(r"C:\Users\rafae\Downloads\IAT\Dashboard\data")
BACIAS = BASE_DADOS / "bacias_parana.geojson"
SIGA = BASE_DADOS / "external" / "siga_aneel.csv"

LARGURA, ALTURA = 1000, 620
MARGEM = 14
TOLERANCIA = 0.004        # graus; simplificacao das bacias
TIPOS = ("CGH", "PCH", "UHE")


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


def carregar_bacias():
    dados = json.loads(BACIAS.read_text(encoding="utf-8"))
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


def carregar_usinas():
    out = []
    # O SIGA vem em cp1252, nao em UTF-8: lido como UTF-8 com errors=replace,
    # "Foz do Jordao" e "Candoi" chegavam com losango no lugar do acento.
    with open(SIGA, encoding="cp1252", newline="") as f:
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


def main():
    bacias = carregar_bacias()
    usinas = carregar_usinas()

    xs = [p[0] for b in bacias for parte in b["partes"] for p in parte] + [u["lon"] for u in usinas]
    ys = [p[1] for b in bacias for parte in b["partes"] for p in parte] + [u["lat"] for u in usinas]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)

    # Equirretangular com correcao de latitude: sem ela o Parana sai esticado.
    k = math.cos(math.radians((y0 + y1) / 2))
    larg_geo, alt_geo = (x1 - x0) * k, (y1 - y0)
    escala = min((LARGURA - 2 * MARGEM) / larg_geo, (ALTURA - 2 * MARGEM) / alt_geo)
    dx = (LARGURA - larg_geo * escala) / 2
    dy = (ALTURA - alt_geo * escala) / 2

    def proj(lon, lat):
        return (round((lon - x0) * k * escala + dx, 1),
                round((y1 - lat) * escala + dy, 1))

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

    doc = {
        "largura": LARGURA, "altura": ALTURA,
        "bacias": sorted(bacias, key=lambda b: b["nome"]),
        "usinas": usinas,
        "fontes": [
            "Divisão hidrográfica do Estado do Paraná, 18 bacias.",
            "SIGA, Sistema de Informações de Geração da ANEEL, registro público de empreendimentos.",
        ],
    }
    SAIDA.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    kb = SAIDA.stat().st_size / 1024
    print(f"{len(bacias)} bacias e {len(usinas)} usinas | {kb:.0f} kB")
    from collections import Counter
    print("por tipo:", dict(Counter(u["tipo"] for u in usinas)))


if __name__ == "__main__":
    main()
