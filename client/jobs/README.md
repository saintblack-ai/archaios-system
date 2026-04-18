# Jobs

Deployment-facing job runner notes for Saint Black Book Growth Command.

Current local implementation:

- `src/jobs/postingJobs.js`

The current job runner enforces daily limits, minimum spacing, approval requirements, retries, and mock connector execution. For production, run this from a trusted backend process instead of the browser.
