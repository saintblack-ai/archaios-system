"""0700 briefing runner using plan-then-act with approval and immutable ledgers."""

from __future__ import annotations

import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from legacy.templates.plan_then_act import build_strict_json_plan, execute_plan_then_act


def _deterministic_write_briefing(tool_inputs: dict[str, Any]) -> dict[str, str]:
    briefings_dir = PROJECT_ROOT / "briefings"
    briefings_dir.mkdir(parents=True, exist_ok=True)

    execution_timestamp = str(tool_inputs["execution_timestamp"])
    execution_day = str(tool_inputs["execution_day"])
    output_text = str(tool_inputs["output_text"])

    output_file = briefings_dir / f"{execution_day}.txt"
    payload = f"Execution Timestamp: {execution_timestamp}\n{output_text}\n"
    output_file.write_text(payload, encoding="utf-8")
    return {"output_file": str(output_file), "message": output_text}


def run() -> None:
    execution_time = datetime.now().astimezone()
    execution_timestamp = execution_time.isoformat()
    execution_day = execution_time.date().isoformat()
    output_text = "Ai-Assassins 0700 briefing executed"

    if not os.getenv("OPENAI_API_KEY"):
        print("OPENAI_API_KEY is not set. Running local deterministic fallback mode.")

    tool_inputs = {
        "execution_timestamp": execution_timestamp,
        "execution_day": execution_day,
        "output_text": output_text,
    }
    proposal = build_strict_json_plan(
        workflow="ai_assassins_daily_briefing",
        goal="Generate 0700 daily briefing output",
        tool_name="file_system.write_text",
        tool_inputs=tool_inputs,
    )

    result = execute_plan_then_act(
        workflow="ai_assassins_daily_briefing",
        proposal=proposal,
        tool_name="file_system.write_text",
        tool_inputs=tool_inputs,
        tool_runner=_deterministic_write_briefing,
        approver_label="human",
        model_name=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    )

    print(f"Execution Timestamp: {execution_timestamp}")
    print(output_text)
    print(f"Run ledger: {result['run_log_path']}")
