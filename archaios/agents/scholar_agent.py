from __future__ import annotations

from archaios.core.agent_core import ArchaiosAgent
from archaios.core.archetypes import detect_archetype
from archaios.memory.memory_store import retrieve_memory, store_memory


class ScholarAgent(ArchaiosAgent):
    def __init__(self) -> None:
        super().__init__(role="Scholar")

    def process(self, text: str) -> dict:
        archetype = detect_archetype(text)
        store_memory(text, {"role": self.role, "archetype": archetype})
        system_prompt = self.build_system_prompt()
        relevant_memory = retrieve_memory(text)

        return {
            "prompt": system_prompt,
            "relevant_memory": relevant_memory,
            "input": text,
            "archetype": archetype,
        }
