"""Watch active research folder and auto-index new markdown files."""

from __future__ import annotations

import argparse
import json
import logging
import time
from datetime import datetime
from pathlib import Path

from archaios_vault_tools.config import get_settings
from archaios_vault_tools.utils.fs import ensure_vault_dirs
from archaios_vault_tools.utils.indexing import append_index_line, index_contains_path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Watch active research folder and auto-index markdown")
    parser.add_argument("--vault-root", default=None)
    parser.add_argument("--interval", type=float, default=3.0)
    return parser


def _setup_logger(log_path: Path) -> logging.Logger:
    logger = logging.getLogger("archaios_watch")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()
    handler = logging.FileHandler(log_path, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)
    return logger


def _extract_fields(md_path: Path, metadata_dir: Path) -> tuple[str, str, str, list[str], Path | None]:
    stem = md_path.stem
    title = stem
    version = "unknown"
    tier = "Unknown"
    tags: list[str] = []
    meta_path = metadata_dir / f"{stem}.json"
    if meta_path.exists():
        try:
            obj = json.loads(meta_path.read_text(encoding="utf-8"))
            title = obj.get("title") or title
            version = obj.get("version") or version
            tier = obj.get("tier") or tier
            tags = obj.get("tags") or []
            return title, version, tier, tags, meta_path
        except Exception:
            pass

    if "_v" in stem:
        title = stem.split("_v", 1)[0].replace("-", " ").title()
        version = f"v{stem.split('_v', 1)[1]}"
    return title, version, tier, tags, None


def ensure_indexed(md_path: Path, vault_root: Path, logger: logging.Logger) -> bool:
    index_path = vault_root / "INDEX_MASTER_LOG.md"
    if index_contains_path(index_path, md_path):
        return False

    metadata_dir = vault_root / "metadata"
    title, version, tier, tags, meta_path = _extract_fields(md_path, metadata_dir)
    append_index_line(
        index_path,
        date_text=datetime.now().strftime("%Y-%m-%d"),
        title=title,
        version=version,
        tier=tier,
        tags=tags,
        md_path=md_path,
        pdf_path=md_path.with_suffix(".pdf") if md_path.with_suffix(".pdf").exists() else None,
        metadata_path=meta_path or metadata_dir / f"{md_path.stem}.json",
    )
    logger.info("Indexed markdown: %s", md_path)
    return True


def main() -> None:
    args = build_parser().parse_args()
    settings = get_settings(vault_root_override=args.vault_root, env_dir=Path.cwd())
    dirs = ensure_vault_dirs(settings.vault_root)
    active = dirs["01_ACTIVE_RESEARCH"]
    logger = _setup_logger(dirs["logs"] / "watch.log")

    known: dict[Path, float] = {}
    logger.info("Watching %s", active)
    print(f"Watching {active} (Ctrl+C to stop)")

    try:
        while True:
            for md_path in active.glob("*.md"):
                stat = md_path.stat()
                mtime = stat.st_mtime
                if md_path not in known or known[md_path] < mtime:
                    ensure_indexed(md_path, settings.vault_root, logger)
                    known[md_path] = mtime
            time.sleep(args.interval)
    except KeyboardInterrupt:
        logger.info("Watcher stopped by user")
        print("Watcher stopped")
