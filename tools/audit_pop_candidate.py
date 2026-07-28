"""Compare a candidate POP DOCX with the currently published extraction.

This command is intentionally read-only. It bypasses the release identity gate
so a newly supplied file can be inspected before anyone changes the pinned
source hash in ``extract_pop.py``.
"""

from __future__ import annotations

import hashlib
import io
import json
import sys
import zipfile
from difflib import unified_diff
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLISHED_JSON = PROJECT_ROOT / "src" / "data" / "pop-content.json"
PUBLISHED_ASSETS = PROJECT_ROOT / "public" / "source-assets"
MAX_SOURCE_BYTES = 128 * 1024 * 1024
MAX_EXPANDED_BYTES = 512 * 1024 * 1024
MAX_ARCHIVE_ENTRIES = 10_000
REQUIRED_DOCX_PARTS = {
    "[Content_Types].xml",
    "_rels/.rels",
    "word/document.xml",
}


class CandidatePackageError(ValueError):
    """DOCX candidato ausente, ambíguo, corrompido ou excessivamente grande."""


def validate_docx_package(source: Path, source_bytes: bytes) -> None:
    """Valida a camada ZIP/OPC antes de entregá-la ao extrator do POP."""
    if source.suffix.lower() != ".docx":
        raise CandidatePackageError("o arquivo candidato deve usar a extensão .docx")
    if not source_bytes:
        raise CandidatePackageError("o arquivo candidato está vazio")
    if len(source_bytes) > MAX_SOURCE_BYTES:
        raise CandidatePackageError(
            f"o arquivo candidato excede o limite de {MAX_SOURCE_BYTES // 1024 // 1024} MiB"
        )

    try:
        with zipfile.ZipFile(io.BytesIO(source_bytes)) as archive:
            entries = archive.infolist()
            names = [entry.filename for entry in entries]
            if len(entries) > MAX_ARCHIVE_ENTRIES:
                raise CandidatePackageError(
                    f"o pacote contém mais de {MAX_ARCHIVE_ENTRIES} entradas"
                )
            if len(names) != len(set(names)):
                raise CandidatePackageError("o pacote contém nomes de partes duplicados")
            if any(entry.flag_bits & 0x1 for entry in entries):
                raise CandidatePackageError("o pacote contém partes criptografadas")

            expanded_bytes = sum(entry.file_size for entry in entries)
            if expanded_bytes > MAX_EXPANDED_BYTES:
                raise CandidatePackageError(
                    "o conteúdo expandido do pacote excede o limite de segurança"
                )

            missing = sorted(REQUIRED_DOCX_PARTS.difference(names))
            if missing:
                raise CandidatePackageError(
                    "o pacote não contém as partes DOCX obrigatórias: "
                    + ", ".join(missing)
                )

            damaged = archive.testzip()
            if damaged is not None:
                raise CandidatePackageError(
                    f"a parte {Path(damaged).name!r} falhou na verificação de integridade"
                )
    except (zipfile.BadZipFile, zipfile.LargeZipFile) as error:
        raise CandidatePackageError("o arquivo não é um pacote DOCX/ZIP íntegro") from error


def clean_text(value: object) -> str:
    return " ".join(str(value or "").split())


def table_projection(table: dict) -> dict:
    return {
        "caption": clean_text(table.get("caption")),
        "labelType": table.get("labelType"),
        "labelNumber": table.get("labelNumber"),
        "rows": [
            [
                [
                    clean_text(paragraph.get("text"))
                    for paragraph in cell.get("paragraphs", [])
                ]
                for cell in row.get("cells", [])
            ]
            for row in table.get("rows", [])
        ],
    }


def section_projection(pop: dict) -> list[dict]:
    blocks = {block["id"]: block for block in pop.get("blocks", [])}
    tables = {table["id"]: table for table in pop.get("tables", [])}
    projected: list[dict] = []

    for section in pop.get("sections", []):
        content: list[dict] = []
        for block_id in section.get("blockIds", []):
            block = blocks[block_id]
            if block["type"] == "paragraph":
                paragraph = block.get("paragraph", {})
                content.append(
                    {
                        "type": "paragraph",
                        "text": clean_text(paragraph.get("text")),
                        "images": [
                            image.get("assetId")
                            for image in paragraph.get("images", [])
                        ],
                    }
                )
            elif block["type"] == "table":
                content.append(
                    {
                        "type": "table",
                        **table_projection(tables[block["tableId"]]),
                    }
                )

        projected.append(
            {
                "id": section.get("id"),
                "number": clean_text(section.get("number")),
                "title": clean_text(section.get("title")),
                "navigationOnly": bool(section.get("navigationOnly")),
                "content": content,
            }
        )
    return projected


def asset_projection(pop: dict, payloads: dict[str, bytes]) -> list[dict]:
    projected = []
    for asset in pop.get("assets", []):
        payload = payloads.get(asset["fileName"])
        published_path = PUBLISHED_ASSETS / asset["fileName"]
        published_exists = published_path.is_file()
        published_payload = published_path.read_bytes() if published_exists else None
        projected.append(
            {
                "id": asset.get("id"),
                "fileName": asset.get("fileName"),
                "candidateSha256": (
                    hashlib.sha256(payload).hexdigest()
                    if payload is not None
                    else None
                ),
                "publishedSha256": (
                    hashlib.sha256(published_payload).hexdigest()
                    if published_payload is not None
                    else None
                ),
                "samePublishedBytes": (
                    payload is not None
                    and published_payload is not None
                    and payload == published_payload
                ),
            }
        )
    return projected


def first_difference(before: list[dict], after: list[dict]) -> dict | None:
    for index, (old, new) in enumerate(zip(before, after, strict=False)):
        if old != new:
            return {"index": index, "published": old, "candidate": new}
    if len(before) != len(after):
        return {
            "index": min(len(before), len(after)),
            "published": before[min(len(before), len(after)) :] or None,
            "candidate": after[min(len(before), len(after)) :] or None,
        }
    return None


def content_lines(section: dict) -> list[str]:
    lines: list[str] = []
    for block in section.get("content", []):
        if block["type"] == "paragraph":
            lines.append(f"P | {block['text']}")
            continue
        lines.append(f"T | {block.get('caption', '')}")
        for row in block.get("rows", []):
            lines.append(
                "R | "
                + " || ".join(
                    " / ".join(paragraph for paragraph in cell if paragraph)
                    for cell in row
                )
            )
    return lines


def section_diff(old: dict, new: dict) -> list[str]:
    return list(
        unified_diff(
            content_lines(old),
            content_lines(new),
            fromfile="published",
            tofile="candidate",
            lineterm="",
            n=2,
        )
    )


def main() -> int:
    if len(sys.argv) != 2:
        print("Uso: audit_pop_candidate.py <arquivo.docx>", file=sys.stderr)
        return 2

    source = Path(sys.argv[1]).expanduser().resolve()
    if not source.is_file():
        print(f"Fonte não localizada: {source.name}", file=sys.stderr)
        return 2

    published = json.loads(PUBLISHED_JSON.read_text(encoding="utf-8"))
    try:
        source_bytes = source.read_bytes()
        validate_docx_package(source, source_bytes)
    except (OSError, CandidatePackageError) as error:
        print(f"FALHA: candidato DOCX inválido: {error}", file=sys.stderr)
        return 1

    try:
        import extract_pop as pipeline

        candidate, payloads, diagnostics = pipeline.extract_pop(
            source, source_bytes, published
        )
    except ModuleNotFoundError as error:
        print(
            f"FALHA: dependência Python ausente para extrair o DOCX: {error.name}",
            file=sys.stderr,
        )
        return 1
    except Exception as error:
        print(
            "FALHA: o pacote passou pela validação ZIP, mas a extração DOCX falhou "
            f"({type(error).__name__}).",
            file=sys.stderr,
        )
        return 1

    published_sections = section_projection(published)
    candidate_sections = section_projection(candidate)
    assets = asset_projection(candidate, payloads)
    changed_sections = []
    for index in range(max(len(published_sections), len(candidate_sections))):
        old = published_sections[index] if index < len(published_sections) else None
        new = candidate_sections[index] if index < len(candidate_sections) else None
        if old == new:
            continue
        changed_sections.append(
            {
            "index": index,
            "changeType": "added" if old is None else "removed" if new is None else "changed",
            "id": (new or old).get("id"),
            "numberBefore": old.get("number") if old else None,
            "numberAfter": new.get("number") if new else None,
            "titleBefore": old.get("title") if old else None,
            "titleAfter": new.get("title") if new else None,
            "contentDiff": section_diff(
                old or {"content": []},
                new or {"content": []},
            ),
        }
        )

    report = {
        "candidateSource": candidate.get("source"),
        "publishedSource": published.get("source"),
        "candidateOperational": candidate.get("metadata", {}).get("operational"),
        "publishedOperational": published.get("metadata", {}).get("operational"),
        "candidateStats": candidate.get("stats"),
        "publishedStats": published.get("stats"),
        "semanticContentIdentical": published_sections == candidate_sections,
        "firstSectionDifference": first_difference(
            published_sections,
            candidate_sections,
        ),
        "changedSectionCount": len(changed_sections),
        "changedSections": changed_sections,
        "candidateAssetCount": len(assets),
        "changedAssetCount": sum(
            not asset["samePublishedBytes"] for asset in assets
        ),
        "changedAssets": [
            asset for asset in assets if not asset["samePublishedBytes"]
        ],
        "idDiagnostics": diagnostics,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
