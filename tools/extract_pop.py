# -*- coding: utf-8 -*-
"""Extrai o POP (DOCX) para o JSON que alimenta a plataforma.

Preserva os ids das secoes que ja existem (casadas por numero + titulo), para
nao invalidar progresso salvo, favoritos e as questoes que citam a fonte.
Secoes novas recebem ids seguintes ao maior ja usado.

Uso:  python tools/extract_pop.py "<caminho do .docx>"
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import docx
from docx.document import Document as DocxDocument
from docx.oxml.ns import qn
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "src" / "data" / "pop-content.json"
ASSET_DIR = ROOT / "public" / "source-assets"


def norm(t: str) -> str:
    t = unicodedata.normalize("NFD", t or "")
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", t.lower()).strip()


def iter_blocks(parent):
    """Percorre paragrafos e tabelas na ordem real do documento."""
    if isinstance(parent, DocxDocument):
        parent_elm = parent.element.body
    elif isinstance(parent, _Cell):
        parent_elm = parent._tc
    else:
        raise ValueError("parent inesperado")
    for child in parent_elm.iterchildren():
        if child.tag == qn("w:p"):
            yield Paragraph(child, parent)
        elif child.tag == qn("w:tbl"):
            yield Table(child, parent)


def heading_level(p: Paragraph):
    st = p.style.name or ""
    m = re.match(r"^(?:Heading|T[ií]tulo)\s*(\d+)", st)
    if m:
        return int(m.group(1))
    return None


def is_list(p: Paragraph) -> bool:
    return p._p.find(qn("w:pPr")) is not None and p._p.find(qn("w:pPr")).find(qn("w:numPr")) is not None


def para_payload(p: Paragraph, pid: str):
    lvl = heading_level(p)
    lst = is_list(p)
    return {
        "id": pid,
        "semanticType": "heading" if lvl else ("list-item" if lst else "paragraph"),
        "text": (p.text or "").strip(),
        "styleId": None,
        "styleName": p.style.name,
        "headingLevel": lvl,
        "list": {"numbering": True} if lst else None,
        "alignment": None,
        "indentation": None,
        "spacing": None,
    }


def main(src: Path):
    doc = docx.Document(str(src))
    antigo = json.loads(OUT_JSON.read_text(encoding="utf-8")) if OUT_JSON.exists() else {"sections": []}

    # --- mapa de ids antigos: (numero, titulo), titulo e numero -> id
    por_num_tit, por_tit, por_num = {}, {}, {}
    max_sec = 0
    for s in antigo.get("sections", []):
        key = (s.get("number") or "", norm(s.get("title")))
        por_num_tit[key] = s["id"]
        por_tit.setdefault(norm(s.get("title")), s["id"])
        if s.get("number"):
            por_num.setdefault(s["number"], s["id"])
        m = re.search(r"(\d+)$", s["id"])
        if m:
            max_sec = max(max_sec, int(m.group(1)))
    usados = set()

    # --- imagens do documento
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    assets, by_rid = [], {}
    for rel_id, rel in doc.part.rels.items():
        if "image" not in rel.reltype:
            continue
        blob = rel.target_part.blob
        ext = Path(rel.target_part.partname).suffix or ".png"
        n = len(assets) + 1
        fname = f"pop-image-{n:03d}{ext}"
        (ASSET_DIR / fname).write_bytes(blob)
        a = {
            "id": f"pop-asset-{n:03d}", "documentId": "pop",
            "originalPart": str(rel.target_part.partname), "fileName": fname,
            "publicPath": f"/source-assets/{fname}", "bytes": len(blob),
            "sha256": hashlib.sha256(blob).hexdigest(),
        }
        assets.append(a)
        by_rid[rel_id] = a

    blocks, sections, tables, figures = [], [], [], []
    cur_section = None
    nav_section, nav_level = False, 0   # dentro de sumario/indice
    stats = {"headingCount": 0, "listItemCount": 0, "tableParagraphCount": 0}

    def new_section_id(number, title):
        nonlocal max_sec
        # 1) numero + titulo  2) titulo (secao renumerada)  3) numero (titulo ajustado)
        for sid in (por_num_tit.get((number, norm(title))),
                    por_tit.get(norm(title)),
                    por_num.get(number) if number else None):
            if sid and sid not in usados:
                usados.add(sid)
                return sid, False
        max_sec += 1
        return f"pop-section-{max_sec:03d}", True

    novas_secoes = []
    for item in iter_blocks(doc):
        if isinstance(item, Paragraph):
            txt = (item.text or "").strip()
            lvl = heading_level(item)
            bid = f"pop-block-{len(blocks)+1:04d}"
            if lvl:
                stats["headingCount"] += 1
                m = re.match(r"^((?:\d+\.)*\d+)\s+(.*)$", txt)
                if m:
                    number, title = m.group(1), m.group(2).strip()
                else:
                    ma = re.match(r"^(Anexo\s+[A-Z])\s*[-–]?\s*(.*)$", txt)
                    # subitem de anexo: "F.1 Ficha de identificacao"
                    mf = re.match(r"^([A-Z]\.\d+(?:\.\d+)*)\s+(.*)$", txt)
                    if ma:
                        number, title = ma.group(1), ma.group(2).strip()
                    elif mf:
                        number, title = mf.group(1), mf.group(2).strip()
                    else:
                        number, title = "", txt
                sid, is_new = new_section_id(number, title)
                if is_new:
                    novas_secoes.append(f"{number} {title}")
                # indices e sumarios (e o que estiver sob eles) sao navegacao, nao aula
                if re.search(r"sum[aá]rio|[ií]ndice", title, re.I):
                    nav_section, nav_level = True, lvl
                elif nav_section and lvl <= nav_level:
                    nav_section = False
                # pai = ultima secao de nivel menor
                pai = None
                for prev in reversed(sections):
                    if prev["level"] < lvl:
                        pai = prev["id"]
                        break
                cur_section = {
                    "id": sid, "level": lvl, "number": number, "title": title,
                    "fullTitle": txt, "headingBlockId": bid, "parentId": pai,
                    "navigationOnly": nav_section, "blockIds": [],
                }
                sections.append(cur_section)
            if not txt and not item._p.findall(".//" + qn("w:drawing")):
                continue
            blk = {
                "id": bid, "sourceIndex": len(blocks) + 1, "type": "paragraph",
                "navigationOnly": nav_section, "sectionId": cur_section["id"] if cur_section else None,
                "paragraph": para_payload(item, f"pop-paragraph-{len(blocks)+1:04d}"),
            }
            if blk["paragraph"]["semanticType"] == "list-item":
                stats["listItemCount"] += 1
            blocks.append(blk)
            if cur_section and bid != cur_section["headingBlockId"]:
                cur_section["blockIds"].append(bid)
            # imagem embutida neste paragrafo
            for dr in item._p.findall(".//" + qn("a:blip")):
                rid = dr.get(qn("r:embed"))
                a = by_rid.get(rid)
                if not a:
                    continue
                n = len(figures) + 1
                figures.append({
                    "id": f"pop-figure-{n:03d}", "number": n, "title": txt or f"Figura {n}",
                    "caption": txt or f"Figura {n}", "blockId": bid, "assetId": a["id"],
                    "publicPath": a["publicPath"], "altText": txt or f"Figura {n} do POP",
                })
        else:  # Table
            n = len(tables) + 1
            tid = f"pop-table-{n:03d}"
            rows = []
            for ri, row in enumerate(item.rows, 1):
                cells = []
                for ci, c in enumerate(row.cells, 1):
                    stats["tableParagraphCount"] += len(c.paragraphs)
                    cells.append({"index": ci, "gridSpan": 1, "text": (c.text or "").strip(),
                                  "paragraphs": [{"id": f"{tid}-r{ri:03d}-c{ci:02d}-p{k+1:02d}",
                                                  "semanticType": "paragraph", "text": (pp.text or "").strip()}
                                                 for k, pp in enumerate(c.paragraphs)]})
                rows.append({"index": ri, "isHeader": ri == 1, "cells": cells})
            # legenda: paragrafo anterior no formato "Quadro N - titulo"
            cap = ""
            for b in reversed(blocks[-4:]):
                t = b.get("paragraph", {}).get("text", "")
                if re.match(r"^(Quadro|Tabela)\s+\d+", t):
                    cap = t
                    break
            mc = re.match(r"^(Quadro|Tabela)\s+(\d+)\s*[-–]\s*(.*)$", cap)
            tables.append({
                "id": tid, "sourceTableIndex": n, "caption": cap or f"Quadro {n}",
                "labelType": mc.group(1) if mc else "Quadro",
                "labelNumber": int(mc.group(2)) if mc else n,
                "title": mc.group(3).strip() if mc else (cap or f"Quadro {n}"),
                "navigationOnly": nav_section,
                "rowCount": len(rows), "columnCount": len(rows[0]["cells"]) if rows else 0,
                "rows": rows,
            })
            bid = f"pop-block-{len(blocks)+1:04d}"
            blocks.append({"id": bid, "sourceIndex": len(blocks) + 1, "type": "table",
                           "navigationOnly": nav_section,
                           "sectionId": cur_section["id"] if cur_section else None,
                           "tableId": tid, "caption": cap})
            if cur_section:
                cur_section["blockIds"].append(bid)

    body_par = [b for b in blocks if b["type"] == "paragraph"]
    out = {
        "schemaVersion": antigo.get("schemaVersion", 1),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "id": "pop", "kind": "pop",
        "title": antigo.get("title", "POP Licenciamento de Hidrelétricas IAT"),
        "source": {"fileName": src.name, "bytes": src.stat().st_size},
        "metadata": antigo.get("metadata", {}),
        "assets": assets, "blocks": blocks, "sections": sections,
        "tables": tables, "figures": figures,
        "flowcharts": antigo.get("flowcharts", []),
        "learningContent": {
            "includedBlockIds": [b["id"] for b in blocks if not b["navigationOnly"]],
            "excludedNavigationBlockIds": [b["id"] for b in blocks if b["navigationOnly"]],
        },
        "stats": {
            "bodyBlockCount": len(blocks), "bodyParagraphCount": len(body_par),
            "tableParagraphCount": stats["tableParagraphCount"],
            "allDocumentParagraphNodes": len(body_par) + stats["tableParagraphCount"],
            "tableCount": len(tables), "imageAssetCount": len(assets),
            "figureCount": len(figures), "headingCount": stats["headingCount"],
            "listItemCount": stats["listItemCount"],
        },
    }
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print("secoes:", len(sections), "| blocos:", len(blocks), "| tabelas:", len(tables),
          "| figuras:", len(figures), "| imagens:", len(assets))
    print("ids preservados:", len(usados), "| secoes novas:", len(novas_secoes))
    for s in novas_secoes:
        print("   +", s[:72])


if __name__ == "__main__":
    main(Path(sys.argv[1]))
