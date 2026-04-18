# Frontend Environment Variables

Set these for the frontend build:

- `VITE_BACKEND_URL`
  - Example: `https://archaios-saas-worker.quandrix357.workers.dev`
  - Used for `/api/health`, `/api/platform/dashboard`, checkout, and billing calls.

- `VITE_SUPABASE_URL`
  - Your Supabase project URL.
  - Used for browser auth.

- `VITE_SUPABASE_ANON_KEY`
  - Your Supabase anon public key.
  - Used for browser auth.

- `VITE_ADMIN_EMAIL`
  - The email allowed to open `/admin`.
  - Optional for the main dashboard, required for the admin route.
