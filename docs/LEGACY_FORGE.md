# ARCHAIOS Legacy Forge

## Purpose and routes

Legacy Forge is a public-safe overview of the founder-and-AI command system used to organize four long-horizon divisions: ARCHAIOS Platform, Saint Black Media, QX Research, and Institutional Legacy.

- Normal route: `/legacy-forge`
- Presentation route: `/legacy-forge?presentation=1`

The page states the collaboration model directly: human vision establishes the mission, ARCHAIOS AI organizes the operation, and documented execution preserves continuity. The presentation route removes navigation, Mission Forge controls, and the detailed system-status panel so the four divisions, founder statement, collaboration statement, and Black Vault can form a clean 16:9 public screenshot.

## Public-safe architecture

The feature is a lazy-loaded React route. Its content and mission-planning rules live entirely in the frontend:

- `client/src/pages/legacy/LegacyForge.jsx` renders the route.
- `client/src/pages/legacy/legacyForgeModel.js` contains public labels and deterministic mission rules.
- `client/src/pages/legacy/legacyForge.css` provides responsive and presentation layouts.

Mission Forge creates a three-step plan from the selected division, time, energy, and outcome. It is local-only and deterministic. It does not call an API, run AI inference, read or write persistent browser storage, require login, or depend on Supabase or Stripe.

## Operational and restricted labels

The public preview labels the frontend, production build pipeline, runtime contracts, Cloudflare Worker, GitHub Actions, responsive interface, and local mission generator as operational capabilities.

Supabase-authenticated access, persistent personal dashboards, subscription synchronization, Stripe checkout, and private Black Vault records remain restricted or in restoration. The Black Vault shown on this page is a public-preview concept only; no private archive is connected.

## Responsive behavior and screenshots

The normal route supports desktop, tablet, and phone layouts. Division cards collapse from four columns to two and then one. Mission Forge controls collapse from four columns to two and then one, retaining at least 44px touch targets. Presentation mode is tuned for a 1600×900 capture and hides division initiative lists while retaining each division's name, purpose, and public status.

For a public screenshot:

1. Run `npm --prefix client run dev -- --host 127.0.0.1`.
2. Open `http://127.0.0.1:5173/legacy-forge?presentation=1`.
3. Set the viewport to 1600×900 and keep the page at the top.
4. Capture the browser viewport only. Exclude browser chrome, other tabs, credentials, environment values, and unrelated desktop content.

## Known limitations

- Mission progress is intentionally reset by a refresh or navigation because no persistent storage is used.
- Presentation mode intentionally omits interactive controls and detailed operational-status lists.
- Presentation mode has no on-screen exit control so public screenshots stay clean; remove the query parameter or navigate to `/legacy-forge` to return to normal mode.
- Restricted services remain unavailable from Legacy Forge until their separate security and restoration gates are satisfied.

## Security boundaries

- Do not add secrets, private project URLs, service-role credentials, or private archive records to the feature model or documentation.
- Do not connect Mission Forge to Supabase, Stripe, the Worker, persistent storage, or network APIs without a separate reviewed contract.
- Keep research, creative source assets, and private founder records outside the public bundle.
- Treat every operational claim as a public, verifiable capability and retain explicit restricted/restoration wording for unavailable systems.

## Local validation

From the repository root:

```sh
(cd client && node --test tests/legacy-forge.test.js)
npm --prefix client test
npm test
npm --prefix client run typecheck
npm --prefix client run build
npm run check:runtime-contract
git diff --check
```

After starting the local Vite server, validate both routes directly:

```sh
curl --fail --silent --show-error http://127.0.0.1:5173/legacy-forge
curl --fail --silent --show-error 'http://127.0.0.1:5173/legacy-forge?presentation=1'
```

Inspect the production bundle and Legacy Forge source for credential patterns, Supabase or Stripe imports, network-call primitives, and persistent-storage primitives before release.

## RouteFallback regression repair

The first runtime visual gate found that the Legacy Forge branch in `client/src/App.jsx` referenced an undefined `RouteFallback`, causing both URLs to render blank. The route now uses the same inline `Suspense` loading pattern as neighboring routes. The focused regression test renders the application at `/legacy-forge` and requires a nonblank result without a runtime exception.
