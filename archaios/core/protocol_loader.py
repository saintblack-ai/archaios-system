from __future__ import annotations

from pathlib import Path

PROTOCOL_PATH = Path(__file__).resolve().parent.parent / "protocol" / "ARCHAIOS_PROTOCOL_v1.0.md"


def load_protocol() -> str:
    try:
        return PROTOCOL_PATH.read_text(encoding="utf-8")
    except Exception as e:
        raise RuntimeError(f"Failed to load ARCHAIOS protocol: {e}")
