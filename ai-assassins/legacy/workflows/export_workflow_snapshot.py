"""Export versioned workflow snapshots for legacy compatibility."""

from __future__ import annotations

import argparse
import ast
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT_ROOT = PROJECT_ROOT / "legacy" / "workflows"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _safe_name(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "_", value.strip().lower())
    return cleaned.strip("_") or "workflow"


def _find_candidate_file(workflow_name: str) -> Path | None:
    direct = PROJECT_ROOT / workflow_name
    if direct.exists() and direct.is_file():
        return direct

    candidates = [
        PROJECT_ROOT / "src" / "ai_assassins_local" / f"{workflow_name}.py",
        PROJECT_ROOT / "src" / "ai_assassins_local" / "briefing.py",
        PROJECT_ROOT / "backend" / "app.py",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def _infer_snapshot_from_python(path: Path) -> dict[str, Any]:
    source = path.read_text(encoding="utf-8")
    tree = ast.parse(source)

    steps: list[str] = []
    prompt_templates: list[str] = []
    tool_list: list[str] = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            if node.name.startswith("_"):
                continue
            steps.append(node.name)
        elif isinstance(node, ast.Call):
            func = node.func
            if isinstance(func, ast.Attribute):
                name = func.attr
            elif isinstance(func, ast.Name):
                name = func.id
            else:
                name = ""
            if name in {"write_text", "mkdir", "create", "responses", "run", "post"}:
                tool_list.append(name)
        elif isinstance(node, ast.Constant) and isinstance(node.value, str):
            text = node.value.strip()
            if "prompt" in text.lower() and len(text) <= 400:
                prompt_templates.append(text)

    if not steps:
        steps = ["load_context", "plan", "execute_tool", "persist_output"]
    if not tool_list:
        tool_list = ["file_system.write_text"]

    return {
        "steps": sorted(set(steps)),
        "prompt_templates": sorted(set(prompt_templates)),
        "tool_list": sorted(set(tool_list)),
    }


def export_workflow_snapshot(workflow_name: str) -> Path:
    safe_workflow = _safe_name(workflow_name)
    now = _utc_now()
    version_tag = now.strftime("%Y%m%dT%H%M%SZ")
    candidate = _find_candidate_file(workflow_name)

    snapshot: dict[str, Any] = {
        "workflow_name": safe_workflow,
        "created_at_utc": now.isoformat(),
        "version_tag": version_tag,
        "steps": [],
        "prompt_templates": [],
        "tool_list": [],
        "source_file": str(candidate.relative_to(PROJECT_ROOT)) if candidate else None,
    }

    if candidate and candidate.suffix == ".py":
        inferred = _infer_snapshot_from_python(candidate)
        snapshot.update(inferred)
    else:
        snapshot.update(
            {
                "steps": ["load_context", "plan", "act", "record"],
                "prompt_templates": [],
                "tool_list": ["unknown"],
            }
        )

    target_dir = SNAPSHOT_ROOT / safe_workflow
    target_dir.mkdir(parents=True, exist_ok=True)
    out_path = target_dir / f"{version_tag}.json"
    out_path.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
    return out_path


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Export a versioned workflow snapshot.")
    parser.add_argument("workflow", help="Workflow name or file path hint.")
    return parser


def main() -> int:
    args = _build_parser().parse_args()
    out_path = export_workflow_snapshot(args.workflow)
    print(f"Snapshot exported: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

