# Social Integrations

Deployment-facing social connector notes for Saint Black Book Growth Command.

Current local implementation:

- `src/integrations/social/connectors.js`

Prepared connectors:

- `X` / Twitter API v2
- `Facebook` Graph API
- `Instagram` Graph API

Do not hardcode keys in frontend source. Real credentials should live in server-side environment variables and be called through backend routes or workers.
