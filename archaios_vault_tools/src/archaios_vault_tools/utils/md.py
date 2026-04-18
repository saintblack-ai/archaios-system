"""Markdown templating utilities."""

from __future__ import annotations

from datetime import datetime


def make_capture_markdown(
    *,
    title: str,
    project_code: str,
    version: str,
    tier: str,
    tags: list[str],
    source_notes: str,
    content: str,
) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    tags_text = ", ".join(tags) if tags else "none"
    source_notes = source_notes.strip() or "N/A"
    content = content.strip() or "(No content provided.)"

    return f"""# {title}

## Executive Summary
- Captured on: {now}
- Project focus: {project_code}
- Tier: {tier}

## Core Analysis
{content}

## Counterpoints & Risks
- Add principal challenges, unknowns, and disconfirming evidence.

## Operational Implications
- Define operational actions and timing windows.

## Citations / Anchors
- List source links, references, or internal anchors.
- Source notes: {source_notes}

## ARCHAIOS Tagging Index
- Project: {project_code}
- Version: {version}
- Tier: {tier}
- Date: {now}
- Tags: {tags_text}
"""
