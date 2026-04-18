"""Master index and metadata indexing helpers."""

from __future__ import annotations

import json
from pathlib import Path

INDEX_HEADER = "# ARCHAIOS Master Log\n\n| Date | Title | Version | Tier | Tags | Markdown | PDF | Metadata |\n|---|---|---|---|---|---|---|---|\n"


def ensure_index(index_path: Path) -> None:
    if not index_path.exists():
        index_path.write_text(INDEX_HEADER, encoding="utf-8")


def append_index_line(
    index_path: Path,
    *,
    date_text: str,
    title: str,
    version: str,
    tier: str,
    tags: list[str],
    md_path: Path,
    pdf_path: Path | None,
    metadata_path: Path,
) -> None:
    ensure_index(index_path)
    tags_text = ",".join(tags)
    pdf_text = str(pdf_path) if pdf_path else "(not generated)"
    line = (
        f"| {date_text} | {title} | {version} | {tier} | {tags_text} "
        f"| {md_path} | {pdf_text} | {metadata_path} |\n"
    )
    with index_path.open("a", encoding="utf-8") as f:
        f.write(line)


def index_contains_path(index_path: Path, md_path: Path) -> bool:
    if not index_path.exists():
        return False
    needle = str(md_path)
    return needle in index_path.read_text(encoding="utf-8")


def load_metadata_entries(metadata_dir: Path) -> list[dict]:
    entries: list[dict] = []
    if not metadata_dir.exists():
        return entries
    for fp in sorted(metadata_dir.glob("*_v*.json"), reverse=True):
        try:
            obj = json.loads(fp.read_text(encoding="utf-8"))
            entries.append(obj)
        except Exception:
            continue
    return entries
