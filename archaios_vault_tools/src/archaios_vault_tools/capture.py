"""CLI for initializing and capturing ARCHAIOS research documents."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path

from archaios_vault_tools.config import get_settings
from archaios_vault_tools.models import CaptureInput, CaptureRecord, utc_now_iso
from archaios_vault_tools.utils.fs import ensure_vault_dirs, move_files, slugify
from archaios_vault_tools.utils.indexing import append_index_line
from archaios_vault_tools.utils.md import make_capture_markdown
from archaios_vault_tools.utils.pdf import generate_pdf
from archaios_vault_tools.utils.versioning import collect_existing_current_files, get_next_version


VALID_TIERS = {"Research", "Doctrine", "Operational"}


def _parse_tags(raw: str) -> list[str]:
    return [t.strip() for t in raw.split(",") if t.strip()]


def _collect_content(args: argparse.Namespace) -> str:
    if args.content:
        return args.content
    if args.input_file:
        return Path(args.input_file).expanduser().read_text(encoding="utf-8")
    user = input("Content (single line; use --input_file for long text): ").strip()
    return user


def _prompt_if_missing(args: argparse.Namespace) -> CaptureInput:
    title = args.title or input("Title: ").strip()
    project_code = args.project_code or input("Project code: ").strip()
    tier = args.tier or input("Tier (Research|Doctrine|Operational): ").strip()
    tags_raw = args.tags or input("Tags (comma separated): ").strip()
    source_notes = args.source_notes if args.source_notes is not None else input("Source notes (optional): ").strip()
    content = _collect_content(args)

    if tier not in VALID_TIERS:
        raise ValueError(f"Invalid tier '{tier}'. Must be one of: {', '.join(sorted(VALID_TIERS))}")

    return CaptureInput(
        title=title,
        project_code=project_code,
        tier=tier,
        tags=_parse_tags(tags_raw),
        source_notes=source_notes,
        content=content,
    )


def init_vault(vault_root: Path) -> None:
    ensure_vault_dirs(vault_root)
    index_path = vault_root / "INDEX_MASTER_LOG.md"
    if not index_path.exists():
        index_path.write_text(
            "# ARCHAIOS Master Log\n\n| Date | Title | Version | Tier | Tags | Markdown | PDF | Metadata |\n|---|---|---|---|---|---|---|---|\n",
            encoding="utf-8",
        )


def init_main() -> None:
    parser = argparse.ArgumentParser(description="Initialize ARCHAIOS vault folders")
    parser.add_argument("--vault-root", default=None)
    args = parser.parse_args()
    settings = get_settings(vault_root_override=args.vault_root, env_dir=Path.cwd())
    init_vault(settings.vault_root)
    print(f"Initialized vault at {settings.vault_root}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Capture ARCHAIOS research")
    parser.add_argument("--vault-root", default=None, help="Override vault root path")
    parser.add_argument("--title", default=None)
    parser.add_argument("--project_code", default=None)
    parser.add_argument("--tier", default=None, choices=sorted(VALID_TIERS))
    parser.add_argument("--tags", default=None, help="Comma separated tags")
    parser.add_argument("--source_notes", default="")
    parser.add_argument("--input_file", default=None)
    parser.add_argument("--content", default=None)
    return parser


def run_capture(args: argparse.Namespace) -> CaptureRecord:
    settings = get_settings(vault_root_override=args.vault_root, env_dir=Path.cwd())
    init_vault(settings.vault_root)
    capture_input = _prompt_if_missing(args)

    slug = slugify(capture_input.title)
    version = get_next_version(settings.vault_root, slug)
    version_label = version.label()

    dirs = ensure_vault_dirs(settings.vault_root)
    archive_dir = dirs["05_ARCHIVED_VERSIONS"] / slug

    old_files = collect_existing_current_files(settings.vault_root, slug)
    moved = move_files(old_files, archive_dir) if old_files else []

    stem = f"{slug}_{version_label}"
    md_path = dirs["01_ACTIVE_RESEARCH"] / f"{stem}.md"
    pdf_path = dirs["01_ACTIVE_RESEARCH"] / f"{stem}.pdf"
    meta_path = dirs["metadata"] / f"{stem}.json"

    markdown = make_capture_markdown(
        title=capture_input.title,
        project_code=capture_input.project_code,
        version=version_label,
        tier=capture_input.tier,
        tags=capture_input.tags,
        source_notes=capture_input.source_notes,
        content=capture_input.content,
    )
    md_path.write_text(markdown, encoding="utf-8")

    pdf_ok, pdf_engine = generate_pdf(md_path, pdf_path)
    effective_pdf_path = pdf_path if pdf_ok else None
    if not pdf_ok and pdf_path.exists():
        pdf_path.unlink(missing_ok=True)

    record = CaptureRecord(
        slug=slug,
        version=version_label,
        title=capture_input.title,
        project_code=capture_input.project_code,
        tier=capture_input.tier,
        tags=capture_input.tags,
        source_notes=capture_input.source_notes,
        created_at=utc_now_iso(),
        markdown_path=str(md_path),
        pdf_path=str(effective_pdf_path) if effective_pdf_path else None,
        metadata_path=str(meta_path),
        content_hash=hashlib.sha256(capture_input.content.encode("utf-8")).hexdigest(),
        notes=[
            f"pdf_engine={pdf_engine}",
            f"archived_previous_versions={len(moved)}",
        ],
    )
    meta_path.write_text(json.dumps(record.to_dict(), indent=2), encoding="utf-8")

    append_index_line(
        settings.vault_root / "INDEX_MASTER_LOG.md",
        date_text=datetime.now().strftime("%Y-%m-%d"),
        title=record.title,
        version=record.version,
        tier=record.tier,
        tags=record.tags,
        md_path=md_path,
        pdf_path=effective_pdf_path,
        metadata_path=meta_path,
    )

    return record


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        record = run_capture(args)
        print(f"Created markdown: {record.markdown_path}")
        if record.pdf_path:
            print(f"Created PDF: {record.pdf_path}")
        else:
            print("PDF not generated (install pandoc or wkhtmltopdf)")
        print(f"Created metadata: {record.metadata_path}")
    except Exception as exc:
        print(f"Capture failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
