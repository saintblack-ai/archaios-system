# ARCHAIOS Mobile And iPhone Compatibility

## Added iPhone Support
- PWA manifest: `client/public/manifest.json`
- Service worker: `client/public/service-worker.js`
- Offline fallback: `client/public/offline.html`
- App icon: `client/public/icons/archaios-icon.svg`
- Apple touch icon link: `client/public/apple-touch-icon.svg`
- iOS standalone metadata in `client/index.html`
- `viewport-fit=cover` for notched iPhones.
- Safe-area padding added to primary shells.
- Supabase auth now explicitly enables PKCE and session persistence through browser local storage.

## Verified Locally
- Vite build includes manifest, icon, offline page, and service worker.
- GitHub Pages-style build succeeds with project-path routing.
- Runtime tests assert PWA metadata and service worker registration.

## iPhone Checklist
- Safari compatibility: ready for static app shell.
- PWA manifest: present.
- Service Worker: present.
- Apple touch icon: present as SVG asset.
- Viewport: `viewport-fit=cover` present.
- HTTPS: required and provided by GitHub Pages/Vercel/Cloudflare.
- Session persistence: Supabase client configured for persisted PKCE sessions.
- Auth redirects: still require live Supabase URL/anon key verification.
- API requests: currently blocked in production by Worker identity mismatch.
- Add to Home Screen: supported after the updated build is deployed.

## Remaining Mobile Blocker
The iPhone app shell can install after deployment, but live API functionality will remain impaired until the canonical Worker hostname returns `archaios-core-api`.
