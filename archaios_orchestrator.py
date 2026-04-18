from __future__ import annotations

from author_agent import AuthorAgent
from executor_agent import ExecutorAgent
from intent_classifier import classify_intent
from mentor_agent import MentorAgent
from scholar_agent import ScholarAgent

class ArchaiosOrchestrator:
    def __init__(self) -> None:
        self.agents = {
            "scholar": ScholarAgent(),
            "mentor": MentorAgent(),
            "author": AuthorAgent(),
            "executor": ExecutorAgent(),
        }

    def route(self, intent: str, input_text: str) -> str:
        agent = self.agents.get(intent.lower())

        if not agent:
            return "No matching agent found."

        return agent.process(input_text)

    def auto_route(self, input_text: str) -> str:
        intent = classify_intent(input_text)
        return self.route(intent, input_text)

    def route_auto(self, input_text: str) -> str:
        return self.auto_route(input_text)
