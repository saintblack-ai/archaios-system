from pathlib import Path

from archaios_vault_tools.utils.versioning import Version, get_latest_version, get_next_version, parse_version_from_name


def test_parse_version_from_name() -> None:
    v = parse_version_from_name("north-corridor_v1.2.md")
    assert v == Version(1, 2)


def test_next_version_reads_archived(tmp_path: Path) -> None:
    vault = tmp_path / "vault"
    active = vault / "01_ACTIVE_RESEARCH"
    archived = vault / "05_ARCHIVED_VERSIONS" / "alpha"
    metadata = vault / "metadata"
    active.mkdir(parents=True)
    archived.mkdir(parents=True)
    metadata.mkdir(parents=True)

    (archived / "alpha_v1.3.md").write_text("x", encoding="utf-8")
    assert get_latest_version(vault, "alpha") == Version(1, 3)
    assert get_next_version(vault, "alpha") == Version(1, 4)


def test_next_version_defaults_to_1_0(tmp_path: Path) -> None:
    vault = tmp_path / "vault"
    (vault / "01_ACTIVE_RESEARCH").mkdir(parents=True)
    (vault / "metadata").mkdir(parents=True)
    assert get_next_version(vault, "new-doc") == Version(1, 0)
