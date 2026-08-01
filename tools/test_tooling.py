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
        self.assertEqual(document["tileProjection"]["type"], "web-mercator")
        extent = document["tileProjection"]["normalizedExtent"]
        self.assertLess(extent["xMin"], extent["xMax"])
        self.assertLess(extent["yMin"], extent["yMax"])

    def test_registered_hash_change_blocks_generation(self):
        self.siga.write_text(
            self.siga.read_text(encoding="cp1252") + "\n",
            encoding="cp1252",
        )
        self.output.write_text("unchanged", encoding="utf-8")
        self.assertEqual(self.run_main(), 1)
        self.assertEqual(self.output.read_text(encoding="utf-8"), "unchanged")


def _carregar_gerador_de_aulas():
    """Importa build_lesson_videos sem executar o main nem exigir Piper.

    O modulo le argumentos e monta caminhos de ferramenta ao ser carregado, e
    nenhuma das duas coisas interessa para testar a normalizacao de fala.
    """
    import importlib.util
    import sys

    caminho = Path(__file__).resolve().parent / "build_lesson_videos.py"
    spec = importlib.util.spec_from_file_location("_blv_para_teste", caminho)
    modulo = importlib.util.module_from_spec(spec)
    argv = sys.argv
    sys.argv = [str(caminho), "--dry-run"]
    try:
        with contextlib.suppress(SystemExit):
            spec.loader.exec_module(modulo)
    finally:
        sys.argv = argv
    return modulo


class TextoFaladoTests(unittest.TestCase):
    """Normalizacao da entrada do sintetizador.

    Piper nao tem SSML: toda a prosodia vem de como o texto chega a ele. Estes
    casos saem de uma varredura do acervo real de 159 legendas, que encontrou
    54 numeros de ato com separador de milhar, 25 ordinais, 13 siglas com barra
    e 4 paragrafos. A legenda continua fiel ao POP; so a fala e adaptada.
    """

    @classmethod
    def setUpClass(cls):
        cls.blv = _carregar_gerador_de_aulas()

    def falado(self, texto):
        return self.blv.texto_falado(texto)

    def test_numero_de_ato_perde_o_ponto_e_ganha_de(self):
        # Padrao mais frequente do acervo. Escrito como esta, o sintetizador
        # decide sozinho o que fazer com o ponto de milhar e com a barra, e
        # nenhuma das leituras possiveis e a certa.
        self.assertIn("15190, de 2025", self.falado("Lei Federal nº 15.190/2025"))
        self.assertIn("7150, de 2024", self.falado("Decreto nº 7.150/2024"))

    def test_numero_de_ato_sem_milhar_tambem_perde_a_barra(self):
        self.assertIn("9, de 2025", self.falado("IN IAT nº 09/2025"))

    def test_ordinal_juridico_ate_o_nono(self):
        # Convencao brasileira: ordinal ate o nono, cardinal do decimo em diante.
        self.assertIn("artigo quinto", self.falado("art. 5º"))
        self.assertIn("parágrafo segundo", self.falado("§ 2º"))
        self.assertIn("artigos terceiro e quarto", self.falado("arts. 3º e 4º"))

    def test_ordinal_do_decimo_em_diante_fica_cardinal(self):
        self.assertIn("artigo 12", self.falado("artigo 12º"))
        self.assertNotIn("décimo", self.falado("artigo 12º"))

    def test_ordinal_feminino(self):
        self.assertIn("primeira etapa", self.falado("a 1ª etapa"))
        self.assertIn("segunda campanha", self.falado("a 2ª campanha"))

    def test_inciso_romano_vira_ordinal(self):
        self.assertIn("inciso terceiro", self.falado("inciso III"))

    def test_sigla_com_barra_ganha_conjuncao(self):
        self.assertIn(" e ", self.falado("processo no SEI/IBAMA"))
        self.assertNotIn("/", self.falado("processo no SEI/IBAMA"))

    def test_a_fala_nunca_termina_sem_pontuacao(self):
        # Sem ponto final o sintetizador nao fecha a entonacao e a frase soa
        # cortada na emenda com a cena seguinte.
        self.assertTrue(self.falado("texto sem ponto").endswith("."))


if __name__ == "__main__":
    unittest.main()
