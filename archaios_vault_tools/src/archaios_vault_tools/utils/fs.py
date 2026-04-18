"""Filesystem helpers for ARCHAIOS vault operations."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

VAULT_DIRS = [
    "01_ACTIVE_RESEARCH",
    "02_DOCTRINE",
    "03_BOOK_MANUSCRIPTS",
    "04_QX_TECH",
    "05_ARCHIVED_VERSIONS",
    "metadata",
    "logs",
]


def ensure_vault_dirs(vault_root: Path) -> dict[str, Path]:
    paths: dict[str, Path] = {}
    for name in VAULT_DIRS:
        p = vault_root / name
        p.mkdir(parents=True, exist_ok=True)
        paths[name] = p
    return paths


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"^-+|-+$", "", value)
    return value or "untitled"


def move_files(files: list[Path], target_dir: Path) -> list[Path]:
    target_dir.mkdir(parents=True, exist_ok=True)
    moved: list[Path] = []
    for src in files:
        if not src.exists():
            continue
        dest = target_dir / src.name
        shutil.move(str(src), str(dest))
        moved.append(dest)
    return moved
