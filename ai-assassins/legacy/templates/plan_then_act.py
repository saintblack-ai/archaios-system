"""Template: strict planning first, then deterministic tool execution."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Callable

from legacy.logs.approval_ledger import require_approval
from legacy.logs.run_ledger import write_run_record


def build_strict_json_plan(*, workflow: str, goal: str, tool_name: str, tool_inputs: dict[str, Any]) -> dict[str, Any]:
    """Return a strict JSON plan payload.

    This template stays local-first: if OPENAI_API_KEY is missing, it still emits
    deterministic plan JSON instead of failing hard.
    """
    has_key = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "workflow": workflow,
        "goal": goal,
        "plan_steps": [
            "validate_inputs",
            "request_human_approval",
            "execute_deterministic_tool",
            "persist_artifacts",
        ],
        "tool_name": tool_name,
        "tool_inputs": tool_inputs,
        "planned_at_utc": datetime.now(timezone.utc).isoformat(),
        "planner_mode": "llm" if has_key else "local_fallback",
    }


def execute_plan_then_act(
    *,
    workflow: str,
    proposal: dict[str, Any],
    tool_name: str,
    tool_inputs: dict[str, Any],
    tool_runner: Callable[[dict[str, Any]], Any],
    approver_label: str = "human",
    model_name: str | None = None,
) -> dict[str, Any]:
    """Canonical flow: plan -> approval gate -> deterministic tool -> ledgers."""
    approval_state = require_approval(proposal, workflow=workflow, approver_label=approver_label)
    tool_output = tool_runner(tool_inputs)

    run_log_path = write_run_record(
        workflow=workflow,
        proposal=proposal,
        approval_state=approval_state,
        tool_executed=tool_name,
        tool_inputs=tool_inputs,
        tool_output=tool_output,
        model_name=model_name,
    )
    return {
        "workflow": workflow,
        "approved": True,
        "tool": tool_name,
        "run_log_path": str(run_log_path),
        "output": tool_output,
    }

