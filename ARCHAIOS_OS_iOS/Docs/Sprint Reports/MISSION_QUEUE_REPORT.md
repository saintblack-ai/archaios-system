# MISSION_QUEUE_REPORT

## Mission States

- Mission Ready
- Mission Active
- Paused
- Waiting
- Blocked
- Completed
- Archived

## Capabilities

- Local mission save.
- Priority assignment.
- Manual ordering with local up/down controls.
- Sort by manual order, priority, state, or updated time.
- Resume mission action.
- Mission history appended locally on state changes.

## Persistence

Mission queue data is stored locally in SwiftData through the extended `MissionRecord` model and `MissionQueueState`.
