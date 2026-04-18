"""Rebuild helper for workflows, approvals, and run-ledger verification."""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from legacy.logs.run_ledger import verify_run_record

WORKFLOWS_ROOT = PROJECT_ROOT / "legacy" / "workflows"
RUNS_ROOT = PROJECT_ROOT / "legacy" / "logs" / "runs"
APPROVALS_ROOT = PROJECT_ROOT / "legacy" / "logs" / "approvals"


def _latest_snapshots() -> dict[str, Path]:
    latest: dict[str, Path] = {}
    if not WORKFLOWS_ROOT.exists():
        return latest
    for workflow_dir in sorted(path for path in WORKFLOWS_ROOT.iterdir() if path.is_dir()):
        snapshots = sorted(workflow_dir.glob("*.json"))
        if snapshots:
            latest[workflow_dir.name] = snapshots[-1]
    return latest


def _verify_runs() -> tuple[int, int, list[Path]]:
    if not RUNS_ROOT.exists():
        return (0, 0, [])

    total = 0
    valid = 0
    invalid: list[Path] = []
    for file_path in sorted(RUNS_ROOT.rglob("*.json")):
        total += 1
        if verify_run_record(file_path):
            valid += 1
        else:
            invalid.append(file_path)
    return (total, valid, invalid)


def _count_approvals() -> int:
    if not APPROVALS_ROOT.exists():
        return 0
    count = 0
    for file_path in APPROVALS_ROOT.rglob("approvals.jsonl"):
        with file_path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    count += 1
    return count


def main() -> int:
    latest = _latest_snapshots()
    total_runs, valid_runs, invalid_runs = _verify_runs()
    approval_count = _count_approvals()

    print("=== LEGACY REBUILD SUMMARY ===")
    print(f"Workflows with snapshots: {len(latest)}")
    for workflow, path in latest.items():
        print(f"- {workflow}: {path}")
        try:
            payload = json.loads(path.read_text(encoding='utf-8'))
            print(f"  version_tag: {payload.get('version_tag')}")
        except Exception:
            print("  version_tag: unreadable")

    print(f"Run logs found: {total_runs}")
    print(f"Run logs hash-valid: {valid_runs}")
    print(f"Run logs hash-invalid: {len(invalid_runs)}")
    for bad in invalid_runs:
        print(f"- INVALID: {bad}")

    print(f"Approval decisions logged: {approval_count}")
    print("\n=== RESTORE INSTRUCTIONS ===")
    print("1) Restore latest workflow snapshots into active runtime config.")
    print("2) Re-run workflows in dry-run mode, then compare outputs to run ledger summaries.")
    print("3) Investigate and re-run any hash-invalid run logs before production cutover.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
