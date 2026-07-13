# Release Notes

## ARCHAIOS OS Founder Edition - Sprint 17

Sprint 17 transforms ARCHAIOS OS into a Living Intelligence Operating System while preserving the previous Founder Edition architecture.

## Highlights

- Living Intelligence is now the primary Commander workspace.
- Commander Memory stores mission, sprint, objective, active project, and resume point locally.
- Knowledge Graph records can connect missions, research, books, albums, journals, ideas, prompts, architecture, operations, and conversations.
- Executive Decision cards preserve evidence, confidence, risks, alternatives, recommendation, final decision, and review date.
- Knowledge Engine stores searchable local collections.
- Living Timeline consolidates sprint reports, mission reports, journal entries, research sessions, books, albums, architecture, and operations.
- Intelligence Score calculates mission readiness, knowledge growth, architecture progress, and consistency locally.
- Resume Engine restores current screen, scroll marker, mission, selected research, draft prompt, open journal, and last sprint.

## Verification

Sprint 17 report recorded:

- generic iOS build passed
- physical iPhone build passed
- physical install passed
- physical launch passed
- no `URLSession`
- no production URLs
- no API keys
- no secrets

## Known Non-Blocking Warning

Xcode still reports:

- `All interface orientations must be supported unless the app requires full screen.`

This warning did not block build, install, or launch.

## Upgrade Notes

Sprint 17 adds SwiftData models. Future schema work should remain additive where possible.

## Not Included

- no production API integrations
- no authentication
- no live provider execution
- no cloud deployment
- no commits or pushes
