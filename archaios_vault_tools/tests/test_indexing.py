from pathlib import Path

from archaios_vault_tools.utils.indexing import append_index_line, ensure_index, index_contains_path


def test_append_and_contains(tmp_path: Path) -> None:
    index_path = tmp_path / "INDEX_MASTER_LOG.md"
    md = tmp_path / "doc_v1.0.md"
    md.write_text("# x", encoding="utf-8")
    meta = tmp_path / "doc_v1.0.json"
    meta.write_text("{}", encoding="utf-8")

    ensure_index(index_path)
    append_index_line(
        index_path,
        date_text="2026-02-17",
        title="Doc",
        version="v1.0",
        tier="Research",
        tags=["demo"],
        md_path=md,
        pdf_path=None,
        metadata_path=meta,
    )

    assert index_contains_path(index_path, md)
