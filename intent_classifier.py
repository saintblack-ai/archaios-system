from __future__ import annotations


def classify_intent(text: str) -> str:
    text = text.lower()

    if "analyze" in text or "research" in text:
        return "scholar"
    elif "guide" in text or "mentor" in text:
        return "mentor"
    elif "write" in text or "create" in text:
        return "author"
    elif "execute" in text or "build" in text:
        return "executor"
    else:
        return "scholar"
