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

from tools import audit_pop_candidate, build_mapa, validate_claude_workflow


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


def _carregar_normalizacao_de_fala():
    """Importa tools/fala.py sem passar por build_lesson_videos.

    O modulo de video importa PIL e imageio_ffmpeg para desenhar quadro, e o
    runner do CI nao tem PIL: o portao de tooling falhava com
    ModuleNotFoundError sem nada a ver com o que ele testa. A normalizacao de
    fala virou modulo proprio, que so usa a biblioteca padrao.
    """
    import importlib.util

    caminho = Path(__file__).resolve().parent / "fala.py"
    spec = importlib.util.spec_from_file_location("_fala_para_teste", caminho)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
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
        cls.blv = _carregar_normalizacao_de_fala()

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


WORKFLOW_POLICY = {
    "defaults": {
        "minimumAgents": 1,
        "successfulStates": ["done", "completed", "success"],
        "requireNonEmptyResult": True,
        "requireExecutionEvidence": True,
    },
    "workflows": {
        "auditoria-pre-publicacao": {
            "expectedAgents": 2,
            "requiredResultPaths": [
                {"path": "porLente", "minimumItems": 2, "uniqueBy": "lente"}
            ],
            "releaseFlagPath": "liberado",
        }
    },
}


def workflow_report(*, states=("done", "done"), result=None):
    rows = [
        {
            "type": "workflow_agent",
            "label": f"lente:{index}",
            "state": state,
            "tokens": 100,
            "toolCalls": 2,
        }
        for index, state in enumerate(states, start=1)
    ]
    return {
        "workflowName": "auditoria-pre-publicacao",
        "runId": "wf_test",
        "status": "completed",
        "agentCount": len(rows),
        "workflowProgress": rows,
        "totalTokens": 200,
        "totalToolCalls": 4,
        "result": result
        if result is not None
        else {
            "porLente": [{"lente": "a"}, {"lente": "b"}],
            "liberado": True,
        },
    }


class ClaudeWorkflowFailClosedTests(unittest.TestCase):
    def codes(self, data, *, require_release_approved=False):
        return {
            violation.code
            for violation in validate_claude_workflow.validate_workflow(
                data,
                WORKFLOW_POLICY,
                require_release_approved=require_release_approved,
            )
        }

    def test_accepts_complete_audit_with_coverage_and_evidence(self):
        self.assertEqual(
            self.codes(workflow_report(), require_release_approved=True),
            set(),
        )

    def test_agent_error_blocks_even_when_aggregator_says_release(self):
        codes = self.codes(workflow_report(states=("error", "error")))
        self.assertIn("AGENT_FAILED", codes)
        self.assertIn("FALSE_GREEN_RELEASE", codes)

    def test_completed_row_with_terminal_error_still_blocks(self):
        data = workflow_report()
        data["workflowProgress"][0]["error"] = "limite de gasto mensal"
        codes = self.codes(data)
        self.assertIn("AGENT_REPORTED_ERROR", codes)
        self.assertIn("FALSE_GREEN_RELEASE", codes)

    def test_duplicate_agents_and_lenses_do_not_fake_coverage(self):
        data = workflow_report()
        data["workflowProgress"][1]["label"] = data["workflowProgress"][0]["label"]
        data["result"]["porLente"] = [{"lente": "ux"}, {"lente": "ux"}]
        codes = self.codes(data)
        self.assertIn("AGENT_IDENTITY_DUPLICATE", codes)
        self.assertIn("RESULT_EVIDENCE_NOT_UNIQUE", codes)

    def test_aggregate_totals_must_equal_agent_evidence(self):
        data = workflow_report()
        data["totalTokens"] = 1
        data["totalToolCalls"] = 1
        codes = self.codes(data)
        self.assertIn("TOTAL_TOKEN_EVIDENCE_MISMATCH", codes)
        self.assertIn("TOTAL_TOOL_EVIDENCE_MISMATCH", codes)

    def test_empty_result_blocks(self):
        codes = self.codes(workflow_report(result={}))
        self.assertIn("RESULT_EMPTY", codes)
        self.assertIn("RESULT_EVIDENCE_MISSING", codes)

    def test_missing_lens_evidence_blocks(self):
        data = workflow_report(
            result={"porLente": [{"lente": "a"}], "liberado": True}
        )
        codes = self.codes(data)
        self.assertIn("RESULT_EVIDENCE_INCOMPLETE", codes)
        self.assertIn("FALSE_GREEN_RELEASE", codes)

    def test_zero_agents_blocks(self):
        codes = self.codes(workflow_report(states=()))
        self.assertIn("AGENT_COUNT_INVALID", codes)
        self.assertIn("AGENT_COVERAGE_MISMATCH", codes)

    def test_missing_execution_evidence_blocks(self):
        data = workflow_report()
        data["workflowProgress"][0]["toolCalls"] = 0
        data["totalTokens"] = 0
        codes = self.codes(data)
        self.assertIn("AGENT_TOOL_EVIDENCE_MISSING", codes)
        self.assertIn("TOTAL_TOKEN_EVIDENCE_MISSING", codes)

    def test_release_false_only_blocks_release_gate(self):
        data = workflow_report()
        data["result"]["liberado"] = False
        self.assertEqual(self.codes(data), set())
        self.assertIn(
            "RELEASE_NOT_APPROVED",
            self.codes(data, require_release_approved=True),
        )


if __name__ == "__main__":
    unittest.main()
