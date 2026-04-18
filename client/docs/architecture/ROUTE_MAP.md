# Route Map

## Frontend Routes

| Route | Purpose | Status |
|---|---|---|
| `/` | Public home and conversion surface | Existing |
| `/dashboard` | Authenticated subscription dashboard | Existing |
| `/admin` | Hidden subscription/webhook oversight | Existing |
| `/book-growth` | Saint Black Book Growth Command | Existing / expanded |
| `/operator` | ARCHAIOS Operator Mode | Added as internal scaffold |

## Worker API Routes Observed

| Route | Purpose |
|---|---|
| `GET /api/health` | Worker health |
| `GET /api/subscription` | Current user subscription |
| `GET /api/alerts` | User alerts |
| `DELETE /api/alerts` | Clear alerts |
| `POST /api/leads` | Lead capture |
| `POST /api/cta-click` | Conversion event |
| `GET /api/platform/dashboard` | Dashboard payload |
| `GET /api/admin/dashboard` | Admin metrics/logs |
| `POST /api/stripe/create-checkout-session` | Stripe checkout compatibility route |
| `POST /api/stripe/checkout` | Stripe checkout |
| `POST /api/stripe/customer-portal` | Stripe customer portal |
| `POST /api/stripe/webhook` | Stripe webhook |

## Future Routes

| Route | Purpose | Permission |
|---|---|---|
| `/pricing` | Dedicated plan comparison page | Safe internal/frontend |
| `/briefings/:id` | Saved briefing detail | Safe after data model |
| `/operator/deploys` | Deployment health | Safe if read-only |
| `/api/operator/health` | Backend operator snapshot | Requires backend implementation |
| `/api/briefings/daily` | Canonical daily briefing endpoint | Requires backend alignment |
| `/api/email/subscribe` | Email provider integration | Requires provider approval |

