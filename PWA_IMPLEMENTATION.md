# PWA Implementation

The YES INDIA SCHOOLS ERP is an installable PWA with an offline app shell. **ERP data is deliberately not stored on the device.** Offline, the app opens and explains its state, and any data already loaded in the session stays on screen with its age shown.

## Architecture

| Concern | Implementation |
|---|---|
| Manifest and service worker | `vite-plugin-pwa` (`generateSW`), configured in `vite.config.ts` |
| Registration and updates | `src/hooks/useServiceWorkerUpdate.ts` |
| Install | `src/hooks/usePWAInstall.ts` |
| Connectivity | `src/hooks/useNetworkStatus.ts` |
| Expired sessions | `src/auth/sessionExpiry.ts`, `src/hooks/useSessionExpiry.ts` |
| Offline, install and update UI | `src/components/PWA/PWAStatus.tsx`, mounted in `main.tsx` |
| Offline fallback page | `src/components/PWA/OfflineGate.tsx`, wrapping both route blocks in `App.tsx` |
| Styles | `src/components/PWA/PWA.scss` |

## Dependencies

Dev dependencies only: `vite-plugin-pwa` and its required peer `workbox-window`. Dexie was not added because nothing needs it.

## Vite configuration

- `VitePWA` with `registerType: "prompt"` and `injectRegister: false`.
- `manualChunks` splits `vendor-react` and `vendor-data`, so releases don't re-download unchanged libraries.
- `exceljs` now loads on demand in `BulkUpload.tsx` and `StaffBulkUpload.tsx`. The main chunk dropped from 2.5 MB to 1.1 MB.

Route-level lazy loading does not exist and was not added. Page SCSS is global, so splitting routes changes CSS load order and could change styling across pages. Add it only with a visual regression pass.

## Manifest

| Field | Value |
|---|---|
| Name / short name | YES INDIA SCHOOLS ERP / YES ERP |
| `start_url` / `scope` | `/dashboard` / `/` |
| `display` / `orientation` | `standalone` / `any` (tablets and desktops) |
| Theme / background | `#605dec` / `#f4f3fe` (existing ERP colors) |
| Icons | 192 and 512, normal and maskable, in `public/pwa/`, generated from `public/favicon.png` |

## Service worker and caching

Runtime rules are ordered and the first match wins, so the API rule must stay first.

| Resource | Strategy | Notes |
|---|---|---|
| JS, CSS, HTML, SVGs, icons | Precache | 71 files, 2.27 MB. Stays under Workbox's default 2 MiB per-file limit |
| Anything under `/api/` (auth, ERP data, uploaded files) | **Network Only** | Nothing is stored |
| Same-origin images | Cache First | 60 entries, 30 days |
| Google Fonts CSS | Stale While Revalidate | 30 days |
| Google Fonts files | Cache First | 1 year |
| `dash`, `hls` and `exceljs` chunks | Cache First | Downloaded when first used, 30 days |

Precache versioning is automatic from file hashes. Runtime caches carry a `-v1` suffix; bump it to discard one. `cleanupOutdatedCaches` removes old precaches.

Uploaded files outside `/api/` (for example `/public/uploads`) are cross-origin, match no rule and are not cached.

## TanStack Query integration

Query keys, query functions and invalidation are unchanged, and there is no query persistence. TanStack Query's in-memory cache is the only API cache, so nothing is duplicated in Workbox.

`main.tsx` sets `networkMode: "always"` for queries and mutations. The default mode pauses work offline, which leaves loaders spinning and sends paused mutations later without the user knowing. Now requests fail at once and existing error handling runs.

`refetchOnReconnect` stays `false`. On reconnect, `PWAStatus` refetches only active queries that are in an error state.

## Offline behaviour

- **Going offline during a session:** the page stays and a small indicator appears. It shows the time of the *oldest* data on screen, so the age is never overstated.
- **Opening the app offline:** the shell loads and the fallback page replaces the content. Users stay signed in.
- **Writes offline:** they fail immediately with the page's existing error message and are never replayed.
- **Reconnecting:** a toast appears and failed queries refetch.

## Attendance offline: not implemented

Offline attendance was analyzed and **deliberately left out**.

- `POST /student-attendances` takes a bulk array and has no idempotency key, so a retry after a lost response could duplicate records.
- The backend is not in this repository, so its overwrite and conflict rules are unknown.
- Marking attendance needs the student roster offline, which means storing children's personal data on the device. That needs a security decision first.

**Backend work required before this can be built:**

1. Accept a client-generated operation ID, such as an `Idempotency-Key` header, and return the original result for repeats.
2. Define the behaviour for an existing record: reject, overwrite or merge.
3. Return per-row results for a bulk submission so partial failures can be shown.
4. Enforce a unique attendance record per student and date.
5. Decide whether attendance marked offline can be accepted after an edit window closes.

## IndexedDB

The application stores nothing in IndexedDB. The only database is `workbox-expiration`, which Workbox creates to track cache URLs and timestamps. It holds no tokens or API data.

## Installation

- **Chrome, Edge and Android:** an in-app card appears on signed-in pages, using the browser's install prompt.
- **iOS Safari:** the card shows Add to Home Screen instructions.
- **Not now** hides the card for 30 days. It is hidden when installed, in standalone mode, offline and on login pages.

## Update mechanism

1. The app checks hourly while online, and on page load.
2. A new version waits and one notification appears.
3. **Update Now** is disabled while any mutation is running.
4. Only the tab that clicks it reloads. Other tabs keep working until their next reload.
5. **Later** hides the notification until the next page load. Nobody is ever force-refreshed.

The check covers API saves in progress, not unsaved text in a form, so the notification tells users to save first.

## Security

- No JWTs, auth responses or API data pass into any cache.
- Logout keeps its existing behaviour: it removes `auth` and clears TanStack Query. No user data remains in Cache Storage, so accounts cannot see each other's data on a shared device.
- **Expired sessions:** a 401 now signs the user out once, clears cached queries and returns to login. It ignores `/login`, `/logout`, `/forgot-password`, `/reset-password`, `/password/` and `/2fa/`, plus late responses from an older token.

**Existing risks not changed by this work:**

- The JWT is stored in `localStorage`, where any XSS could read it.
- Logout does not call `/logout`, so the token stays valid on the server until it expires.

## Testing

Tested on 2026-10-31 with a production build served by `vite preview`, driven in Chrome with a mocked API and a real service worker.

| Scenario | Result |
|---|---|
| Normal use, refresh, 56 ERP routes | Pass |
| Chrome installability, manifest, icons | Pass, normal profile reports no errors |
| Offline launch, deep links, login offline | Pass |
| Online and offline switching, reconnect refetch | Pass |
| Offline write fails and is not replayed | Pass |
| Update flow, including blocking during a save | Pass |
| Logout, expired JWT | Pass |
| Install prompt, dismissal, iOS, standalone (simulated events and user agent) | Pass |
| No API data or tokens in Cache Storage or IndexedDB | Pass |
| 401 rules, 13 unit cases | Pass |

Lighthouse 13 on the login page:

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 92 | 98 | 100 | 92 |
| Mobile | 69 | 98 | 100 | 92 |

Lighthouse no longer has a PWA category, so installability was checked through Chrome directly. Mobile LCP is 9.0 s and is the main performance gap. The accessibility deduction is a missing `<main>` landmark, and the SEO deduction is a missing `robots.txt`.

**Not tested:**

- The real API, or a real install on a phone, tablet or desktop.
- iOS Safari itself; only its user agent was simulated.
- HTTPS deployment.
- Signing in as a second user through the login form, because Turnstile blocks automation. Logout clearing was verified instead.
- Attendance sync and IndexedDB cleanup, because neither feature exists.

To retest, run `npm run build && npm run preview`, then use the Application tab in Chrome DevTools.

## Production deployment

1. Serve over **HTTPS**. Service workers do not run on plain HTTP, except on localhost.
2. Rewrite unknown paths to `index.html` so deep links work.
3. Send `Cache-Control: no-cache` for `sw.js`, `index.html` and `manifest.webmanifest`.
4. Send long-lived caching for `/assets/*`, whose filenames are hashed.
5. Serve `manifest.webmanifest` as `application/manifest+json`.
6. If the API moves to the same origin, keep it under `/api/` so the Network Only rule still applies.

To remove the PWA, ship a service worker that unregisters itself. Deleting `sw.js` alone leaves the old worker running in existing browsers.

## Known limitations

- Only English text exists for the new UI. Other languages fall back to it until keys are added to `translations.ts`.
- `navigator.onLine` cannot detect a connection with no real internet, such as a captive portal. Those failures appear as normal API errors.
- The dynamic favicon from General Settings does not change the installed app icon.
- `login_bg_banner.png` (971 KB) and `logo.png` (402 KB) are unoptimized. Converting them to WebP would help mobile LCP.
- Video and bulk upload need a connection the first time they are used.
