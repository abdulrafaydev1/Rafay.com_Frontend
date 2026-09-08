# Admin dashboard integration

Implemented in the existing React/Vite frontend and Express backend, using the supplied Stitch `code.html`, `DESIGN.md`, and screenshot as the visual reference. The dashboard keeps the reference's 256px sidebar, 64px header, indigo controls, white cards, pale surfaces, compact tables, and Geist/Inter typography.

## Start locally

Use Node 24 and the existing npm installations.

In `backend`:

```powershell
npm.cmd start
```

In `frontend`:

```powershell
npm.cmd run dev
```

Open `http://localhost:5173`. Double-click **Admin Login** in the existing account/navigation area. A single pointer click does nothing. Enter or Space activates the focused button.

The requested credentials are configured in the ignored `backend/.env` file. They are validated by the backend and are never shown on the login page or included in the browser bundle. An example is provided in `backend/.env.example`.

The existing frontend environment still points customer product requests at its existing backend URL. Admin requests use `/api/admin` through the existing Vite proxy to the local backend on port 5000. Backend startup now loads its existing `.env` with Node's built-in environment loader.

## Files added

Frontend:

- `src/admin/AdminApp.jsx` — session verification and all admin routes.
- `src/admin/Login.jsx` — email/password form, validation, password visibility, loading and error states.
- `src/admin/Layout.jsx` — sidebar, mobile drawer, header, search, profile/logout, refresh and notifications.
- `src/admin/Overview.jsx` — Stitch overview layout and operational panels.
- `src/admin/Products.jsx` — shared product, inventory, discount and rating views.
- `src/admin/ProductImage.jsx` — local fallback for unavailable catalog images.
- `src/admin/pages.jsx` — categories, analytics, staff, settings and unconnected service pages.
- `src/admin/components.jsx` — cards, badges, buttons, tables, pagination, search, modal, menus and states.
- `src/admin/charts.jsx` — responsive SVG catalog history and category distribution.
- `src/admin/icons.jsx` — local SVG icon components.
- `src/admin/api.js` — same-origin authenticated API client and CSV export.
- `src/admin/admin.css` — styles scoped to `.ad-root`.
- `vercel.json` — admin API proxy and SPA deep-link rewrites.
- `ADMIN_INTEGRATION.md` — this implementation and verification report.

Backend:

- `admin/config.js` — backend environment loading.
- `admin/auth.js` — credential verification, session middleware, login/logout, origin checks and rate limiting.
- `admin/session-store.js` — development memory store and shared production Redis REST store.
- `admin/router.js` — isolated admin API backed by the existing normalized catalog.
- `admin/admin.test.js` — 13 security and API regression tests.
- `admin/browser-check.mjs` — dependency-free Chrome browser verification.
- `.env.example` — admin configuration examples.

Browser screenshots and test results are saved in the workspace's `.admin-verification/` directory, outside both repositories.

## Files modified

- `frontend/src/App.jsx` — lazy-loads the separate admin route tree; the existing customer route definitions remain unchanged.
- `frontend/src/components/navbar/Navbar.jsx` — adds the Admin Login button with double-click and keyboard behavior.
- `frontend/src/components/navbar/Navbar.css` — styles only the new button, including small-screen sizing.
- `backend/server.js` — four added lines import config and mount the isolated admin router before the existing public CORS middleware.
- `backend/package.json` — replaces the placeholder test command with the new Node test suite.
- `backend/.env` — local credentials/configuration; remains ignored by git.

No dependencies were installed or changed. Product datasets, IDs, customer authentication, cart, existing controllers and public API response shapes were preserved.

## Routes

Public login: `/admin/login`.

Protected routes:

- `/admin`; `/admin/dashboard` redirects to `/admin`.
- `/admin/products`.
- `/admin/products/categories`, alias `/admin/categories`.
- `/admin/products/inventory`, alias `/admin/inventory`.
- `/admin/orders`, `/admin/customers`, `/admin/analytics`.
- `/admin/payments`, `/admin/returns`, `/admin/shipping`, `/admin/taxes`.
- `/admin/discounts`, `/admin/marketing`, `/admin/reviews`.
- `/admin/staff`, `/admin/apps`, `/admin/settings`, `/admin/notifications`.

Unknown admin paths also pass through authentication before showing the admin not-found page.

API endpoints: `POST /api/admin/login`, `GET /api/admin/session`, `POST /api/admin/logout`, `GET /api/admin/overview`, `GET /api/admin/settings`.

## Authentication and protection

Credentials are checked with Node scrypt and timing-safe comparisons. Successful login creates a random 256-bit opaque token. Only its SHA-256 digest is used as the server-side session lookup key. The cookie is HTTP-only, SameSite=Lax, host-only, and Secure with a `__Host-` name in production. The default absolute session lifetime is eight hours.

Every admin data endpoint verifies the server-side session. The React route boundary verifies that same session before rendering protected content. HTML/JavaScript for the SPA is public application code; admin data and permissions require the server session.

Login accepts JSON with an explicit custom request header and allows only exact configured browser origins. Logout additionally requires the session's CSRF token and deletes the server record, so replaying a logged-out cookie fails. Existing sessions rotate on login; changing the configured credentials invalidates older sessions.

Login attempts are limited to 10 per client address per 15 minutes, plus a global cap of 100. Untrusted forwarded-IP headers do not bypass this. Admin responses disable caching and omit internal errors and secrets.

The session design uses [Node's crypto primitives](https://nodejs.org/api/crypto.html) and the cookie/session protections described by [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## Real backend connections and limits

The provided backend is a static JavaScript product catalog with Express product endpoints. It has no database, server-side orders, customer directory, stock quantities, payment provider, or product-write API. Customer registration/sign-in is implemented in the existing browser localStorage flow.

The new overview endpoint receives the existing `allProducts` collection after its existing normalization/deduplication. It covers all 304 products, including category catalogs, and does not create a second dataset. Existing public product endpoints still return their original shapes.

Available features:

- Product listing, name/ID/category search, category filtering, sorting, pagination and CSV export.
- Product details, sizes/colors, existing prices/markdowns, rating summaries and storefront links.
- Categories, product creation history, category distribution and catalog analytics.
- Account/session details, logout, sidebar collapse, mobile drawer, help and optional 30-second catalog refresh.

Sales counters and review counts are explicitly labeled as catalog metadata. Product creation dates drive catalog history charts; they are not presented as sales dates. Discounts are derived from existing current/previous product prices.

Revenue, orders, customers, conversion, refunds, inventory quantities, individual review moderation and the other absent services show clear unavailable states. They are not represented as fake records or measured zeroes. Product publishing, editing, stock changes, invitations and other absent write operations were not invented. The Create control explains that product publishing is unavailable and links to the catalog.

## Environment variables

All admin secrets are backend-only. Do not use a `VITE_`, `PUBLIC_` or `NEXT_PUBLIC_` prefix.

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAIL` | Administrator email; local requested value is configured. |
| `ADMIN_PASSWORD` | Administrator password; local requested value is configured in ignored .env. |
| `ADMIN_PASSWORD_HASH` | Optional `scrypt$<32 hex salt>$<128 hex key>`; takes precedence over plaintext configuration. |
| `ADMIN_SESSION_TTL_SECONDS` | Optional session lifetime; default 28800, bounded to 300–86400. |
| `ADMIN_ALLOWED_ORIGINS` | Comma-separated exact frontend origins. |
| `ADMIN_REDIS_REST_URL` | Shared Redis-compatible HTTPS REST endpoint; required in production/Vercel. |
| `ADMIN_REDIS_REST_TOKEN` | Token for that shared session/rate-limit store; required in production/Vercel. |

Existing `FRONTEND_URL` and `VERCEL_FRONTEND_URL`, when supplied, are also accepted as exact admin origins.

Development uses memory sessions; normal page refreshes retain login, but restarting the development backend clears sessions. Production/Vercel deliberately requires shared Redis storage so logout, expiration and rate limits work across instances and cold starts. If production storage/credentials are missing, admin access returns a generic 503; public customer product APIs remain available.

For the existing Vercel deployment, configure the admin credentials, shared Redis variables and `ADMIN_ALLOWED_ORIGINS=https://rafay-com-frontend.vercel.app` on the backend. The frontend rewrite forwards admin requests to `https://rafay-com-backend.vercel.app`. Update the rewrite and exact origin list if deployment hostnames change. Keep cookies first-party through this proxy and use HTTPS in production. Deployment was not performed.

## Verification

- **Production build:** `npm.cmd run build` in frontend passes. Admin code/CSS is emitted as separate lazy-loaded assets.
- **Admin lint:** `node node_modules/eslint/bin/eslint.js src/admin src/App.jsx src/components/navbar/Navbar.jsx` passes with no warnings.
- **Full frontend lint:** `npm.cmd run lint` reports the same six pre-existing errors seen before changes: AuthModal (one), CartContext (one), Shop (two), ShopCategory (two). Those unrelated customer files were not changed.
- **Typecheck:** not applicable; this is a JavaScript project with no typecheck script.
- **Backend tests:** `npm.cmd test` passes all 13 tests.
- **Browser:** 20 recorded checks pass across admin authentication, double-click behavior, Enter/Space activation, refresh, logout/direct-route protection, all modules, product search/details/pagination, drawer/collapse, and customer cart/registration/sign-in flows. No uncaught browser exceptions or admin 5xx responses were recorded.
- **Responsive:** dashboard checked at 1440, 1024, 768, 390 and 320 pixels. Storefront inspected at 1440 and 390; the new header button was additionally verified to fit at 320.
- **Public API regression:** listing, search, category listings, new arrivals, top selling and product details pass; admin records match existing storefront product responses.
- **Secret scan:** no admin password or private admin configuration appears in frontend source/built JavaScript.
- **Existing limitation:** customer checkout navigates to `/checkout`, but the supplied App has no checkout route/page. That behavior was preserved. The existing navbar search field also has no search handler; the existing product API search remains functional.

To rerun browser checks, run the local frontend/backend and launch an isolated hidden Chrome profile with remote debugging on port 9224, then run `node admin/browser-check.mjs` from backend. The script uses that isolated profile, clears its test-origin cookies/localStorage, and writes screenshots/results to `.admin-verification/`. It uses the locally configured admin credentials; it does not embed them in frontend code. Avoid repeated full authentication runs within the login rate-limit window.

Production Redis connectivity against a live provider and a live Vercel deployment were not exercised; production fail-closed behavior and cookie flags were tested locally.
