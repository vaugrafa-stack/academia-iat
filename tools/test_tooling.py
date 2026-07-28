"""Regressões autocontidas para os geradores e auditores de tooling."""

from __future__ import annotations

import contextlib
import hashlib
import io
import json
import tempfile
import unittest
import warnings
import zipfile
from pathlib import Path
from unittest import mock

from tools import audit_pop_candidate, build_mapa


class AuditPopCandidatePackageTests(unittest.TestCase):
    def package(self, names: list[str]) -> bytes:
        payload = io.BytesIO()
        with zipfile.ZipFile(payload, "w", zipfile.ZIP_DEFLATED) as archive:
            for name in names:
                archive.writestr(name, b"<xml />")
        return payload.getvalue()

    def test_accepts_integral_minimal_docx_package(self):
        payload = self.package(sorted(audit_pop_candidate.REQUIRED_DOCX_PARTS))
        audit_pop_candidate.validate_docx_package(Path("candidate.docx"), payload)

    def test_rejects_non_zip_without_traceback_contract(self):
        with self.assertRaisesRegex(
            audit_pop_candidate.CandidatePackageError,
            "pacote DOCX/ZIP",
        ):
            audit_pop_candidate.validate_docx_package(
                Path("candidate.docx"),
                b"not-a-zip",
            )

    def test_rejects_missing_required_parts(self):
        payload = self.package(["[Content_Types].xml"])
        with self.assertRaisesRegex(
            audit_pop_candidate.CandidatePackageError,
            "partes DOCX obrigatórias",
        ):
            audit_pop_candidate.validate_docx_package(Path("candidate.docx"), payload)

    def test_rejects_duplicate_part_names(self):
        payload = io.BytesIO()
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(payload, "w") as archive:
                for name in sorted(audit_pop_candidate.REQUIRED_DOCX_PARTS):
                    archive.writestr(name, b"<xml />")
                archive.writestr("word/document.xml", b"<duplicate />")
        with self.assertRaisesRegex(
            audit_pop_candidate.CandidatePackageError,
            "duplicados",
        ):
            audit_pop_candidate.validate_docx_package(
                Path("candidate.docx"),
                payload.getvalue(),
            )


class BuildMapaTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.data_dir = self.root / "data"
        (self.data_dir / "external").mkdir(parents=True)
        self.bacias = self.data_dir / "bacias_parana.geojson"
        self.siga = self.data_dir / "external" / "siga_aneel.csv"
        self.registry = self.root / "mapa-fontes.json"
        self.output = self.root / "mapa-parana.json"

        self.bacias.write_text(
            json.dumps(
                {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {"NOME": "Bacia Teste", "AREA_KM2": "1000"},
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                    [
                                        [-54, -26],
                                        [-53, -26],
                                        [-53, -25],
                                        [-54, -25],
                                        [-54, -26],
                                    ]
                                ],
                            },
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )
        self.siga.write_text(
            ";".join(
                [
                    "SigUFPrincipal",
                    "SigTipoGeracao",
                    "NumCoordNEmpreendimento",
                    "NumCoordEEmpreendimento",
                    "MdaPotenciaFiscalizadaKw",
                    "MdaPotenciaOutorgadaKw",
                    "NomEmpreendimento",
                    "DscFaseUsina",
                    "DscMuninicpios",
                    "DscSubBacia",
                ]
            )
            + "\n"
            + "PR;PCH;-25,5;-53,5;5000;;Usina Teste;Operação;Município Teste;Sub-bacia\n",
            encoding="cp1252",
        )
        self.registry.write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "sources": [
                        {
                            "layer": "bacias",
                            "sha256": self.sha256(self.bacias),
                        },
                        {
                            "layer": "usinas",
                            "sha256": self.sha256(self.siga),
                        },
                    ],
                }
            ),
            encoding="utf-8",
        )

    def tearDown(self):
        self.temporary.cleanup()

    @staticmethod
    def sha256(path: Path) -> str:
        return hashlib.sha256(path.read_bytes()).hexdigest()

    def run_main(self, *arguments: str) -> int:
        with (
            mock.patch.object(build_mapa, "REGISTRO_FONTES", self.registry),
            mock.patch.object(build_mapa, "SAIDA", self.output),
            contextlib.redirect_stdout(io.StringIO()),
            contextlib.redirect_stderr(io.StringIO()),
        ):
            return build_mapa.main(["--data-dir", str(self.data_dir), *arguments])

    def expected_payload(self) -> str:
        paths = build_mapa.caminhos_fontes(self.data_dir)
        document = build_mapa.gerar_documento(paths)
        return build_mapa.serializar_documento(document)

    def test_check_is_read_only_and_detects_stale_artifact(self):
        self.output.write_text("stale", encoding="utf-8")
        self.assertEqual(self.run_main("--check"), 1)
        self.assertEqual(self.output.read_text(encoding="utf-8"), "stale")

        self.output.write_text(self.expected_payload(), encoding="utf-8")
        self.assertEqual(self.run_main("--check"), 0)

    def test_write_mode_generates_expected_map(self):
        self.assertEqual(self.run_main(), 0)
        document = json.loads(self.output.read_text(encoding="utf-8"))
        self.assertEqual(len(document["bacias"]), 1)
        self.assertEqual(len(document["usinas"]), 1)
        self.assertEqual(document["usinas"][0]["baciaPR"], "Bacia Teste")
        self.assertNotIn("lat", document["usinas"][0])
        self.assertNotIn("lon", document["usinas"][0])

    def test_registered_hash_change_blocks_generation(self):
        self.siga.write_text(
            self.siga.read_text(encoding="cp1252") + "\n",
            encoding="cp1252",
        )
        self.output.write_text("unchanged", encoding="utf-8")
        self.assertEqual(self.run_main(), 1)
        self.assertEqual(self.output.read_text(encoding="utf-8"), "unchanged")


if __name__ == "__main__":
    unittest.main()
