"""Data models for captured ARCHAIOS research entries."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone


@dataclass()
class CaptureInput:
    title: str
    project_code: str
    tier: str
    tags: list[str]
    source_notes: str = ""
    content: str = ""


@dataclass()
class CaptureRecord:
    slug: str
    version: str
    title: str
    project_code: str
    tier: str
    tags: list[str]
    source_notes: str
    created_at: str
    markdown_path: str
    pdf_path: str | None
    metadata_path: str
    content_hash: str = ""
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
