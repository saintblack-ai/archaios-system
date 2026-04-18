# Scheduler

Deployment-facing scheduler notes for Saint Black Book Growth Command.

Current local implementation:

- `src/scheduler/cronRunner.js`

This layer supports manual, scheduled, and auto-post modes in browser-local development. For production, move execution to a server-side worker, cron job, or queue processor so scheduled posting does not depend on an open browser tab.
