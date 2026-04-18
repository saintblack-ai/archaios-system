"""Streamlit dashboard for ARCHAIOS captured research."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
from pathlib import Path

import streamlit as st

from archaios_vault_tools.config import get_settings
from archaios_vault_tools.utils.fs import ensure_vault_dirs
from archaios_vault_tools.utils.indexing import load_metadata_entries


TIER_OPTIONS = ["All", "Research", "Doctrine", "Operational", "Unknown"]


def _safe_date(value: str | None) -> dt.date | None:
    if not value:
        return None
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def _load_entries(vault_root: Path) -> list[dict]:
    metadata_entries = load_metadata_entries(vault_root / "metadata")
    if metadata_entries:
        return metadata_entries

    active = vault_root / "01_ACTIVE_RESEARCH"
    entries: list[dict] = []
    for md in sorted(active.glob("*_v*.md"), reverse=True):
        entries.append(
            {
                "title": md.stem,
                "tier": "Unknown",
                "tags": [],
                "created_at": dt.datetime.fromtimestamp(md.stat().st_mtime).isoformat(),
                "markdown_path": str(md),
                "pdf_path": str(md.with_suffix(".pdf")) if md.with_suffix(".pdf").exists() else None,
                "metadata_path": "",
                "version": md.stem.split("_v")[-1] if "_v" in md.stem else "unknown",
            }
        )
    return entries


def _finder_open(path: str) -> None:
    subprocess.run(["open", "-R", path], check=False)


def _copy_to_clipboard(path: str) -> bool:
    try:
        proc = subprocess.run(["pbcopy"], input=path, text=True, check=False)
        return proc.returncode == 0
    except Exception:
        return False


def render_dashboard(vault_root: Path) -> None:
    st.set_page_config(page_title="ARCHAIOS Vault Dashboard", layout="wide")
    st.title("ARCHAIOS Research Capture Dashboard")
    st.caption(f"Vault root: {vault_root}")

    entries = _load_entries(vault_root)
    if not entries:
        st.warning("No captured entries found. Use archaios_capture first.")
        return

    all_tags = sorted({tag for e in entries for tag in (e.get("tags") or [])})

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        keyword = st.text_input("Search keyword", value="").strip().lower()
    with col2:
        tier = st.selectbox("Tier", TIER_OPTIONS)
    with col3:
        tag = st.selectbox("Tag", ["All"] + all_tags)
    with col4:
        date_range = st.date_input("Date range", value=())

    start_date = end_date = None
    if isinstance(date_range, tuple) and len(date_range) == 2:
        start_date, end_date = date_range

    def include(entry: dict) -> bool:
        blob = json.dumps(entry).lower()
        if keyword and keyword not in blob:
            return False
        if tier != "All" and (entry.get("tier") or "Unknown") != tier:
            return False
        if tag != "All" and tag not in (entry.get("tags") or []):
            return False
        d = _safe_date(entry.get("created_at"))
        if start_date and (d is None or d < start_date):
            return False
        if end_date and (d is None or d > end_date):
            return False
        return True

    filtered = sorted([e for e in entries if include(e)], key=lambda e: e.get("created_at", ""), reverse=True)
    st.write(f"Results: {len(filtered)}")

    for idx, entry in enumerate(filtered):
        title = entry.get("title") or "Untitled"
        created = entry.get("created_at") or "unknown"
        tier_text = entry.get("tier") or "Unknown"
        tags_text = ", ".join(entry.get("tags") or []) or "none"
        md_path = entry.get("markdown_path")
        meta_path = entry.get("metadata_path")

        with st.expander(f"{title} | {tier_text} | {created}"):
            st.markdown(f"**Version:** {entry.get('version', 'unknown')}  ")
            st.markdown(f"**Tags:** {tags_text}  ")

            if md_path and Path(md_path).exists():
                st.markdown("### Markdown")
                st.markdown(Path(md_path).read_text(encoding="utf-8"))
            else:
                st.warning("Markdown file not found.")

            action_cols = st.columns(4)
            with action_cols[0]:
                if st.button("Open in Finder", key=f"finder-{idx}") and md_path:
                    _finder_open(md_path)
            with action_cols[1]:
                if st.button("Copy Path", key=f"copy-{idx}") and md_path:
                    ok = _copy_to_clipboard(md_path)
                    st.success("Path copied") if ok else st.warning("Clipboard copy failed")
            with action_cols[2]:
                if md_path:
                    st.code(md_path)
            with action_cols[3]:
                pdf_path = entry.get("pdf_path")
                if pdf_path and Path(pdf_path).exists():
                    st.code(pdf_path)

            if meta_path and Path(meta_path).exists():
                st.markdown("### Metadata")
                st.json(json.loads(Path(meta_path).read_text(encoding="utf-8")))


def launch_streamlit() -> None:
    module_file = Path(__file__).resolve()
    cmd = [sys.executable, "-m", "streamlit", "run", str(module_file)]
    raise SystemExit(subprocess.call(cmd))


def _parse_runtime_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--vault-root", default=None)
    args, _ = parser.parse_known_args(argv)
    return args


def main() -> None:
    args = _parse_runtime_args(sys.argv[1:])
    settings = get_settings(vault_root_override=args.vault_root, env_dir=Path.cwd())
    ensure_vault_dirs(settings.vault_root)
    render_dashboard(settings.vault_root)


if __name__ == "__main__":
    main()
