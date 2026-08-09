#!/usr/bin/env python3
"""Valida relatórios agregados de workflows Claude de forma fail-closed.

O status ``completed`` do orquestrador não prova que os agentes concluíram o
trabalho. Este utilitário valida o relatório persistido antes que ele seja
usado como evidência de auditoria ou como autorização de publicação.

Saídas:
    0: relatório válido (e aprovado, quando --require-release-approved é usado)
    1: relatório bloqueado por uma ou mais violações da política
    2: entrada, política ou execução inválida; também bloqueia
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping


DEFAULT_POLICY_PATH = Path(__file__).with_name("claude_workflow_policy.json")


@dataclass(frozen=True)
class Violation:
    code: str
    message: str

    def as_dict(self) -> dict[str, str]:
        return {"code": self.code, "message": self.message}


def _non_empty(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, tuple, dict, set)):
        return bool(value)
    return True


def _resolve_path(document: Any, dotted_path: str) -> tuple[bool, Any]:
    current = document
    for part in dotted_path.split("."):
        if isinstance(current, Mapping) and part in current:
            current = current[part]
            continue
        if isinstance(current, list) and part.isdigit():
            index = int(part)
            if 0 <= index < len(current):
                current = current[index]
                continue
        return False, None
    return True, current


def _positive_integer(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


def _merged_policy(policy_document: Mapping[str, Any], workflow_name: str) -> dict[str, Any]:
    defaults = policy_document.get("defaults")
    workflows = policy_document.get("workflows")
    if not isinstance(defaults, Mapping) or not isinstance(workflows, Mapping):
        raise ValueError("a política precisa conter objetos 'defaults' e 'workflows'")

    selected = dict(defaults)
    override = workflows.get(workflow_name, {})
    if not isinstance(override, Mapping):
        raise ValueError(f"a política do workflow {workflow_name!r} não é um objeto")
    selected.update(override)
    return selected


def validate_workflow(
    report: Mapping[str, Any],
    policy_document: Mapping[str, Any],
    *,
    require_release_approved: bool = False,
) -> list[Violation]:
    """Retorna todas as violações encontradas sem liberar por exceção."""

    violations: list[Violation] = []
    workflow_name = report.get("workflowName")
    if not isinstance(workflow_name, str) or not workflow_name.strip():
        return [Violation("WORKFLOW_NAME_MISSING", "workflowName ausente ou vazio")]

    policy = _merged_policy(policy_document, workflow_name)
    if report.get("status") != "completed":
        violations.append(
            Violation(
                "WORKFLOW_NOT_COMPLETED",
                f"status recebido: {report.get('status')!r}; esperado: 'completed'",
            )
        )

    configured_minimum = policy.get("minimumAgents", 1)
    expected_agents = policy.get("expectedAgents")
    if not _positive_integer(configured_minimum):
        raise ValueError("minimumAgents precisa ser um inteiro positivo")
    if expected_agents is not None and not _positive_integer(expected_agents):
        raise ValueError("expectedAgents precisa ser um inteiro positivo")

    agent_count = report.get("agentCount")
    if not _positive_integer(agent_count):
        violations.append(
            Violation("AGENT_COUNT_INVALID", "agentCount ausente, zero ou inválido")
        )
        agent_count = 0
    elif agent_count < configured_minimum:
        violations.append(
            Violation(
                "AGENT_COVERAGE_BELOW_MINIMUM",
                f"agentCount={agent_count}; mínimo exigido={configured_minimum}",
            )
        )
    if expected_agents is not None and agent_count != expected_agents:
        violations.append(
            Violation(
                "AGENT_COVERAGE_MISMATCH",
                f"agentCount={agent_count}; cobertura esperada={expected_agents}",
            )
        )

    progress = report.get("workflowProgress")
    agent_rows = []
    if isinstance(progress, list):
        agent_rows = [row for row in progress if isinstance(row, Mapping) and row.get("type") == "workflow_agent"]
    else:
        violations.append(
            Violation("PROGRESS_MISSING", "workflowProgress ausente ou inválido")
        )

    if len(agent_rows) != agent_count:
        violations.append(
            Violation(
                "AGENT_PROGRESS_MISMATCH",
                f"agentCount={agent_count}; registros de agente={len(agent_rows)}",
            )
        )

    successful_states = policy.get("successfulStates")
    if not isinstance(successful_states, list) or not successful_states:
        raise ValueError("successfulStates precisa ser uma lista não vazia")
    success_set = {str(state).strip().lower() for state in successful_states}

    agent_labels: list[str] = []
    observed_tokens = 0
    observed_tool_calls = 0
    execution_rows_complete = True
    for index, row in enumerate(agent_rows, start=1):
        label = row.get("label") or f"agente {index}"
        normalized_label = str(label).strip().casefold()
        agent_labels.append(normalized_label)
        state = str(row.get("state", "")).strip().lower()
        if state not in success_set:
            detail = row.get("error")
            suffix = f": {detail}" if _non_empty(detail) else ""
            violations.append(
                Violation(
                    "AGENT_FAILED",
                    f"{label!r} terminou em {state or 'estado ausente'!r}{suffix}",
                )
            )

        # Alguns agregadores gravam state=completed mesmo quando a linha ainda
        # carrega o erro terminal do agente. Estado verde não apaga erro.
        if _non_empty(row.get("error")):
            violations.append(
                Violation(
                    "AGENT_REPORTED_ERROR",
                    f"{label!r} registra erro terminal: {row.get('error')}",
                )
            )

        if policy.get("requireExecutionEvidence", True):
            row_tokens = row.get("tokens")
            row_tool_calls = row.get("toolCalls")
            if not _positive_integer(row_tokens):
                execution_rows_complete = False
                violations.append(
                    Violation(
                        "AGENT_TOKEN_EVIDENCE_MISSING",
                        f"{label!r} não registra tokens positivos",
                    )
                )
            else:
                observed_tokens += row_tokens
            if not _positive_integer(row_tool_calls):
                execution_rows_complete = False
                violations.append(
                    Violation(
                        "AGENT_TOOL_EVIDENCE_MISSING",
                        f"{label!r} não registra chamadas de ferramenta positivas",
                    )
                )
            else:
                observed_tool_calls += row_tool_calls

    duplicate_labels = sorted(
        {label for label in agent_labels if agent_labels.count(label) > 1}
    )
    if duplicate_labels:
        violations.append(
            Violation(
                "AGENT_IDENTITY_DUPLICATE",
                "rótulos de agente repetidos: " + ", ".join(duplicate_labels),
            )
        )

    if policy.get("requireExecutionEvidence", True):
        total_tokens = report.get("totalTokens")
        total_tool_calls = report.get("totalToolCalls")
        if not _positive_integer(total_tokens):
            violations.append(
                Violation("TOTAL_TOKEN_EVIDENCE_MISSING", "totalTokens ausente ou não positivo")
            )
        if not _positive_integer(total_tool_calls):
            violations.append(
                Violation("TOTAL_TOOL_EVIDENCE_MISSING", "totalToolCalls ausente ou não positivo")
            )
        if execution_rows_complete and _positive_integer(total_tokens) and total_tokens != observed_tokens:
            violations.append(
                Violation(
                    "TOTAL_TOKEN_EVIDENCE_MISMATCH",
                    f"totalTokens={total_tokens}; soma das linhas={observed_tokens}",
                )
            )
        if (
            execution_rows_complete
            and _positive_integer(total_tool_calls)
            and total_tool_calls != observed_tool_calls
        ):
            violations.append(
                Violation(
                    "TOTAL_TOOL_EVIDENCE_MISMATCH",
                    f"totalToolCalls={total_tool_calls}; soma das linhas={observed_tool_calls}",
                )
            )

    result = report.get("result")
    if policy.get("requireNonEmptyResult", True) and not _non_empty(result):
        violations.append(
            Violation("RESULT_EMPTY", "result ausente ou vazio")
        )

    required_paths = policy.get("requiredResultPaths", [])
    if not isinstance(required_paths, list):
        raise ValueError("requiredResultPaths precisa ser uma lista")
    for requirement in required_paths:
        if isinstance(requirement, str):
            path = requirement
            minimum_items = None
        elif isinstance(requirement, Mapping):
            path = requirement.get("path")
            minimum_items = requirement.get("minimumItems")
            unique_by = requirement.get("uniqueBy")
        else:
            raise ValueError("cada item de requiredResultPaths precisa ser string ou objeto")
        if isinstance(requirement, str):
            unique_by = None
        if not isinstance(path, str) or not path.strip():
            raise ValueError("requiredResultPaths contém caminho inválido")

        found, value = _resolve_path(result, path)
        if not found or not _non_empty(value):
            violations.append(
                Violation(
                    "RESULT_EVIDENCE_MISSING",
                    f"evidência obrigatória ausente ou vazia em result.{path}",
                )
            )
            continue
        if minimum_items is not None:
            if not _positive_integer(minimum_items):
                raise ValueError("minimumItems precisa ser um inteiro positivo")
            if not hasattr(value, "__len__") or len(value) < minimum_items:
                actual = len(value) if hasattr(value, "__len__") else "não colecionável"
                violations.append(
                    Violation(
                        "RESULT_EVIDENCE_INCOMPLETE",
                        f"result.{path} contém {actual} item(ns); mínimo={minimum_items}",
                    )
                )
        if unique_by is not None:
            if not isinstance(unique_by, str) or not unique_by.strip():
                raise ValueError("uniqueBy precisa ser uma string não vazia")
            if not isinstance(value, list):
                violations.append(
                    Violation(
                        "RESULT_EVIDENCE_NOT_UNIQUE",
                        f"result.{path} precisa ser uma lista para validar uniqueBy={unique_by}",
                    )
                )
                continue
            identities = []
            invalid_identity = False
            for item in value:
                if not isinstance(item, Mapping) or not _non_empty(item.get(unique_by)):
                    invalid_identity = True
                    continue
                identities.append(str(item[unique_by]).strip().casefold())
            if invalid_identity or len(set(identities)) != len(value):
                violations.append(
                    Violation(
                        "RESULT_EVIDENCE_NOT_UNIQUE",
                        f"result.{path} não possui {unique_by} preenchido e único em cada item",
                    )
                )

    release_path = policy.get("releaseFlagPath")
    release_found = False
    release_value = None
    if release_path is not None:
        if not isinstance(release_path, str) or not release_path.strip():
            raise ValueError("releaseFlagPath precisa ser uma string não vazia")
        release_found, release_value = _resolve_path(result, release_path)
        if not release_found or not isinstance(release_value, bool):
            violations.append(
                Violation(
                    "RELEASE_FLAG_INVALID",
                    f"result.{release_path} ausente ou não booleano",
                )
            )

    if violations and release_found and release_value is True:
        violations.append(
            Violation(
                "FALSE_GREEN_RELEASE",
                "o relatório declara liberação apesar de falhas ou evidência insuficiente",
            )
        )

    if require_release_approved:
        if release_path is None:
            violations.append(
                Violation(
                    "RELEASE_POLICY_MISSING",
                    "a política deste workflow não define releaseFlagPath",
                )
            )
        elif release_found and release_value is not True:
            violations.append(
                Violation(
                    "RELEASE_NOT_APPROVED",
                    f"result.{release_path} não aprovou a liberação",
                )
            )

    return violations


def _load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def _render_text(report_path: Path, report: Mapping[str, Any], violations: Iterable[Violation]) -> str:
    items = list(violations)
    if not items:
        return (
            f"APROVADO: {report.get('workflowName')} ({report.get('runId', report_path.name)}) "
            "possui cobertura, execução e evidência compatíveis com a política."
        )
    lines = [
        f"BLOQUEADO: {report.get('workflowName', report_path.name)} contém {len(items)} violação(ões):"
    ]
    lines.extend(f"- [{item.code}] {item.message}" for item in items)
    return "\n".join(lines)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bloqueia relatórios Claude incompletos, vazios ou com agentes falhos.",
    )
    parser.add_argument("report", type=Path, help="arquivo wf_*.json a validar")
    parser.add_argument(
        "--policy",
        type=Path,
        default=DEFAULT_POLICY_PATH,
        help=f"política JSON (padrão: {DEFAULT_POLICY_PATH})",
    )
    parser.add_argument(
        "--require-release-approved",
        action="store_true",
        help="também exige que a flag de liberação definida na política seja true",
    )
    parser.add_argument("--json", action="store_true", help="emite o veredito como JSON")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if callable(reconfigure):
            reconfigure(encoding="utf-8", errors="replace")
    args = parse_args(argv)
    try:
        report = _load_json(args.report)
        policy = _load_json(args.policy)
        if not isinstance(report, Mapping):
            raise ValueError("o relatório precisa ser um objeto JSON")
        if not isinstance(policy, Mapping):
            raise ValueError("a política precisa ser um objeto JSON")
        violations = validate_workflow(
            report,
            policy,
            require_release_approved=args.require_release_approved,
        )
    except (OSError, json.JSONDecodeError, ValueError, TypeError) as exc:
        if args.json:
            print(
                json.dumps(
                    {
                        "valid": False,
                        "blocked": True,
                        "inputError": str(exc),
                        "report": str(args.report),
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
        else:
            print(f"BLOQUEADO: não foi possível validar o relatório: {exc}", file=sys.stderr)
        return 2

    if args.json:
        print(
            json.dumps(
                {
                    "valid": not violations,
                    "blocked": bool(violations),
                    "workflowName": report.get("workflowName"),
                    "runId": report.get("runId"),
                    "report": str(args.report),
                    "violations": [item.as_dict() for item in violations],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        output = _render_text(args.report, report, violations)
        print(output, file=sys.stderr if violations else sys.stdout)
    return 1 if violations else 0


if __name__ == "__main__":
    raise SystemExit(main())
