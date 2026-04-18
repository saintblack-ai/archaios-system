from __future__ import annotations

from archaios.core.archetypes import ARCHETYPES, detect_archetype


def simulate_conflict(text: str) -> dict:
    archetype = detect_archetype(text)
    profile = ARCHETYPES[archetype]

    return {
        "detected_archetype": archetype,
        "energy": profile["energy"],
        "core_traits": profile["core_traits"],
        "shadow_traits": profile["shadow"],
        "interpretation": f"This input reflects {archetype} archetypal energy.",
    }
