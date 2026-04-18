from __future__ import annotations

ARCHETYPES = {
    "lyran": {
        "core_traits": ["origin", "creative", "sovereign", "builder"],
        "shadow": ["naivety", "fragmentation"],
        "energy": "creation",
    },
    "draconian": {
        "core_traits": ["control", "power", "structure", "domination"],
        "shadow": ["tyranny", "fear"],
        "energy": "authority",
    },
    "orion": {
        "core_traits": ["warrior", "conflict", "strategy", "evolution"],
        "shadow": ["endless struggle"],
        "energy": "transformation",
    },
    "bridge": {
        "core_traits": ["integration", "harmony", "balance"],
        "shadow": ["indecision"],
        "energy": "unification",
    },
}


def detect_archetype(text: str) -> str:
    text = text.lower()

    for name, data in ARCHETYPES.items():
        for trait in data["core_traits"]:
            if trait in text:
                return name

    return "bridge"
