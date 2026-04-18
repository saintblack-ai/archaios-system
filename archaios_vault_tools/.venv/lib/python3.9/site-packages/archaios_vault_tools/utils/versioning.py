"""Versioning helpers for slug-based capture files."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

VERSION_RE = re.compile(r"_v(?P<major>\d+)\.(?P<minor>\d+)")


@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int

    def next_patch(self) -> "Version":
        return Version(self.major, self.minor + 1)

    def label(self) -> str:
        return f"v{self.major}.{self.minor}"


def parse_version_from_name(name: str) -> Version | None:
    match = VERSION_RE.search(name)
    if not match:
        return None
    return Version(major=int(match.group("major")), minor=int(match.group("minor")))


def _matching_version_files(vault_root: Path, slug: str) -> list[tuple[Version, Path]]:
    hits: list[tuple[Version, Path]] = []
    search_roots = [
        vault_root / "01_ACTIVE_RESEARCH",
        vault_root / "metadata",
        vault_root / "05_ARCHIVED_VERSIONS" / slug,
    ]
    for root in search_roots:
        if not root.exists():
            continue
        for p in root.glob(f"{slug}_v*.*"):
            version = parse_version_from_name(p.name)
            if version:
                hits.append((version, p))
    return hits


def get_latest_version(vault_root: Path, slug: str) -> Version | None:
    matches = _matching_version_files(vault_root, slug)
    if not matches:
        return None
    return sorted(matches, key=lambda item: item[0])[-1][0]


def get_next_version(vault_root: Path, slug: str) -> Version:
    latest = get_latest_version(vault_root, slug)
    if latest is None:
        return Version(1, 0)
    return latest.next_patch()


def collect_existing_current_files(vault_root: Path, slug: str) -> list[Path]:
    files: list[Path] = []
    for root in [vault_root / "01_ACTIVE_RESEARCH", vault_root / "metadata"]:
        if not root.exists():
            continue
        files.extend(root.glob(f"{slug}_v*.*"))
    return [p for p in files if p.is_file()]
