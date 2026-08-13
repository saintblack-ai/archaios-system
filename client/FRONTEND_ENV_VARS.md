# Frontend Environment Variables

Set these for the frontend build:

- `VITE_API_BASE_URL`
  - Example: `https://archaios-saas-worker.quandrix357.workers.dev`
  - Used for `/api/health`, `/api/platform/dashboard`, checkout, and billing calls.
  - Required for production builds. `VITE_BACKEND_URL` remains supported as a compatibility alias.
  - Set this as a GitHub Actions repository variable for the GitHub Pages workflow. Do not ship production frontend builds with a localhost backend.

- `VITE_SUPABASE_URL`
  - Your Supabase project URL.
  - Used for browser auth.

- `VITE_SUPABASE_ANON_KEY`
  - Your Supabase anon public key.
  - Used for browser auth.

- `VITE_ADMIN_EMAIL`
  - The email allowed to open `/admin`.
  - Optional for the main dashboard, required for the admin route.

- `VITE_STRIPE_PRO_PRICE_ID`
  - Optional public readiness hint for the Pro checkout panel.
  - Should point to the `$49/month` Pro recurring price in test/live mode as appropriate.

- `VITE_STRIPE_ELITE_PRICE_ID`
  - Optional public readiness hint for the Elite checkout panel.
  - Should point to the `$99/month` Elite recurring price in test/live mode as appropriate.

- `VITE_PUBLIC_BUSINESS_LEGAL_NAME`
  - Public placeholder for the final legal business name.

- `VITE_PUBLIC_EIN_STATUS`
  - Public placeholder for tax setup status. Use `pending` until the EIN is issued.

- `VITE_PUBLIC_PRIVACY_POLICY_URL`
  - Public placeholder for the final Privacy Policy URL.

- `VITE_PUBLIC_TERMS_URL`
  - Public placeholder for the final Terms of Service URL.

- `VITE_PUBLIC_REFUND_POLICY_URL`
  - Public placeholder for the final Refund Policy URL.

- `VITE_PUBLIC_CONTACT_EMAIL`
  - Public contact/support email shown in launch-readiness UI.
