# Queues

Deployment-facing queue notes for Saint Black Book Growth Command.

Current local implementation:

- `src/queues/postQueue.js`

The queue tracks pending, scheduled, posted, failed, approval, retry, and attempt state. For production, persist this state in Supabase, Cloudflare D1, or another durable store.
