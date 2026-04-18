from __future__ import annotations

from myth_simulator import simulate_conflict


def build_story(prompt: str) -> str:
    analysis = simulate_conflict(prompt)

    return f"""
ARCHAIOS NARRATIVE ENGINE

Detected Archetype: {analysis['detected_archetype']}
Energy: {analysis['energy']}

Story Framework:
A force embodying {analysis['core_traits']} confronts the shadow of {analysis['shadow_traits']}.

Conflict catalyzes transformation.
Resolution depends on integration.
"""
