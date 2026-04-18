from __future__ import annotations


def classify_intent(text: str) -> str:
    text = text.lower()

    if any(bot in text for bot in ["analyze", "study", "research"]):
        return "scholar"
    if any(bot in text for bot in ["mentor", "guide", "teach"]):
        return "mentor"
    if any(bot in text for bot in ["write", "create", "generate"]):
        return "author"
    if any(bot in text for bot in ["execute", "build", "deploy"]):
        return "executor"

    return "scholar"
