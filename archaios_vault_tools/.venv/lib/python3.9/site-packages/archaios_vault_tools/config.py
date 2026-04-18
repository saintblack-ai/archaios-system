"""Configuration and environment loading for ARCHAIOS vault tools."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

DEFAULT_VAULT_ROOT = Path.home() / "ARCHAIOS_VAULT"


@dataclass()
class Settings:
    vault_root: Path


def _expand_path(value: str) -> Path:
    return Path(value).expanduser().resolve()


def load_dotenv(base_dir: Path | None = None) -> None:
    """Load key/value pairs from .env into os.environ if not already set."""
    root = base_dir or Path.cwd()
    env_path = root / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def get_settings(vault_root_override: str | None = None, env_dir: Path | None = None) -> Settings:
    load_dotenv(env_dir)
    root_value = vault_root_override or os.getenv("ARCHAIOS_VAULT_ROOT")
    root = _expand_path(root_value) if root_value else DEFAULT_VAULT_ROOT.resolve()
    return Settings(vault_root=root)
