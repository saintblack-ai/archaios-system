from __future__ import annotations

from protocol_loader import load_protocol


class ArchaiosAgent:
    def __init__(self, role: str, role_instructions: str = "") -> None:
        self.role = role
        self.role_instructions = role_instructions
        self.protocol = load_protocol()

    def build_system_prompt(self) -> str:
        instructions_block = (
            f"Role directives: {self.role_instructions}\n\n" if self.role_instructions else ""
        )
        return (
            f"{self.protocol}\n\n"
            f"You are operating as: {self.role}\n\n"
            f"{instructions_block}"
            "Follow protocol strictly.\n"
            "Maintain role behavior integrity."
        )
