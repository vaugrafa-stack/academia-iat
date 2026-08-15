"""Regressão do transformador institucional do POP DLE-HID-001 v1.9.

O teste usa a baseline preservada indicada por ``IAT_POP_SOURCE`` ou, quando
disponível, o arquivo padrão em Downloads. Ele é ignorado fora do ambiente que
detém essa fonte interna; nenhum documento real é incorporado ao repositório.
"""

from __future__ import annotations

import os
import tempfile
import unittest
import zipfile
from pathlib import Path

from lxml import etree

from tools import revise_pop_operational_language as subject


EXPECTED_WINDOWS_OUTPUT_SHA256 = "d66151bd6f171357ae1bd20f256d417abd1719151f115ac2325397c1962d83d4"
EXPECTED_WINDOWS_IMAGE_SHA256 = {
    "word/media/image9.png": "4da2c6c282fe2211391c7fe7f39567c7efcd5cf7e0eae2001a0d341b14ee1e13",
    "word/media/image11.png": "4997c4ae857395ccfbaa0f2c2654ba6710d81c2c59b0c9303cf9216f9e58c07b",
    "word/media/image12.png": "aa326dca8ffec405a3fccf711a365fff02626a39cd0a64f6798478aa1e910635",
    "word/media/image13.png": "0e6dabfeee080dbf1d31a12cbbb286ee680b4ab279f30246cd917d9471187aba",
    "word/media/image14.png": "9448e5de03bf4907538c0d6a24e5819325122136d15591c1280a5644566620da",
}
EXPECTED_COUNTS = {
    "p": 3446,
    "r": 5623,
    "t": 5534,
    "tbl": 69,
    "tr": 818,
    "tc": 2594,
    "sectPr": 9,
    "drawing": 14,
    "hyperlink": 1276,
    "bookmarkStart": 225,
    "bookmarkEnd": 225,
    "Relationship": 240,
}


class PopOperationalLanguageRevisionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = Path(os.environ.get("IAT_POP_SOURCE", subject.SOURCE))
        if not cls.source.is_file():
            raise unittest.SkipTest(
                "baseline interna ausente; defina IAT_POP_SOURCE para executar a regressão integral"
            )

    def test_known_baseline_and_ooxml_postconditions(self) -> None:
        source_hash_before = subject.sha256(self.source)
        self.assertEqual(source_hash_before, subject.EXPECTED_SOURCE_SHA256)

        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "POP_operacional_revisado.docx"
            result = subject.revise(self.source, output)

            self.assertEqual(subject.sha256(self.source), source_hash_before)
            self.assertEqual(result["source_sha256"], subject.EXPECTED_SOURCE_SHA256)
            self.assertEqual(result["applied_revision_count"], 32)
            self.assertEqual(result["forbidden_hits"], [])
            self.assertEqual(result["structural_differences"], {})
            self.assertIsNone(result["structure_after"]["zip_test"])
            self.assertEqual(result["structure_before"], result["structure_after"])
            self.assertEqual(
                set(result["changed_package_parts"]),
                {"word/document.xml", *subject.DIAGRAM_REVISIONS},
            )

            counts = result["structure_after"]["selected_tag_counts"]
            for name, expected in EXPECTED_COUNTS.items():
                self.assertEqual(counts[name], expected, name)
            self.assertEqual(
                result["structure_after"]["tracked_changes"],
                {"insertions": 0, "deletions": 0, "move_from": 0, "move_to": 0},
            )
            self.assertEqual(result["structure_after"]["comment_related_parts"], [])

            with zipfile.ZipFile(self.source) as baseline, zipfile.ZipFile(output) as package:
                self.assertIsNone(package.testzip())
                root = etree.fromstring(package.read("word/document.xml"))
                captions = [
                    paragraph
                    for paragraph in root.xpath(".//w:p", namespaces=subject.NS)
                    if subject.paragraph_text(paragraph)
                    == "Quadro 39 - Padrão de qualidade das condicionantes"
                ]
                self.assertEqual(len(captions), 1)
                self.assertEqual(
                    len(captions[0].xpath("./w:pPr/w:pageBreakBefore", namespaces=subject.NS)),
                    1,
                )
                extents = root.xpath(
                    ".//a:blip[@r:embed='rId174']/ancestor::w:drawing[1]"
                    "//wp:extent | "
                    ".//a:blip[@r:embed='rId174']/ancestor::w:drawing[1]"
                    "//a:xfrm/a:ext",
                    namespaces=subject.NS,
                )
                self.assertEqual(
                    [(int(item.get("cx")), int(item.get("cy"))) for item in extents],
                    [(5329123, 5314442), (5329123, 5314442)],
                )

                for part, spec in subject.DIAGRAM_REVISIONS.items():
                    self.assertEqual(subject.sha256_bytes(baseline.read(part)), spec["sha256"])
                    revised = package.read(part)
                    self.assertNotEqual(subject.sha256_bytes(revised), spec["sha256"])

                font = Path(result["revised_diagrams"][0]["font"])
                if os.name == "nt" and font.name.casefold() == "arial.ttf":
                    self.assertEqual(result["output_sha256"], EXPECTED_WINDOWS_OUTPUT_SHA256)
                    for part, expected_hash in EXPECTED_WINDOWS_IMAGE_SHA256.items():
                        self.assertEqual(subject.sha256_bytes(package.read(part)), expected_hash, part)


if __name__ == "__main__":
    unittest.main()
