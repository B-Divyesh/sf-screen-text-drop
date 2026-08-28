# Independent verification 1 — FAIL

**Candidate:** `6b29ed4e13c10e3f5ffc6663fd312d539cb6de75` (`6b29ed4`)

**Live URL:** https://screen-text-drop.sociobot.in/

**Date:** 2026-08-28 UTC

## Release decision

**FAIL — do not release this candidate.** The claims contract is missing, the mandatory one-click demo sandbox is absent, and the available TypeScript check fails. The deployed site was freshly verified to be this candidate; these are candidate/deployment defects, not evidence of a stale deployment.

## Required claim-test gate — failed before functional QA

`.factory/claims.json` does not exist in the clean checkout. Therefore there were no claim tests to run from the product demo entry point. This is explicitly release-blocking under the claims acceptance contract.

There is also no `.factory/demo.md`, `/demo` route, `?demo=1` entry point, sample project, or sample-data storage namespace. The existing landing-page “AFTER CAPTURE” panel is a static copy/tab illustration, not an executable sandbox.

The landing page and README make many visitor-reliance claims—local/offline OCR, no uploads/history/analytics, clipboard output, 15-second workflow, language availability, and $12 one-time licensing—but none can be listed or proven because the required manifest is absent.

## Cold first read

I opened the production URL in a fresh Chromium context at 1440×900 before interacting.

The first screen says **“Take the text. Leave the pixels.”** and explains that a user can draw a box around something on screen to put clean text in the clipboard. It shows a platform download action and “See how it works.” It does **not** plainly name the intended desktop user on the first screen, does not provide **“Try it with sample data”**, and offers no equivalent one-click executable demo. This independently fails the plain-words/demo-sandbox acceptance gate.

## Checks performed

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci`: 72 packages installed; `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities. |
| Repository test suite | PASS | `npm test`: 3 Vitest tests and 4 Playwright tests passed; production Vite build completed within the test command. |
| Exact production build | PASS | `npm run build`: produced `dist/app` and `dist/site`. Site initial JS is 3,883 bytes (1,720 gzip); CSS 12,457 bytes (3,580 gzip); largest hero WebP 63,148 bytes. |
| Type check available in repo | **FAIL** | `npx tsc --noEmit` exits non-zero with 8 errors: incompatible Playwright `Page` types in `tests/e2e/site.spec.ts:13`, missing `node:path` types, and unsupported `import.meta.dirname` typings in both Vite configs. No lint script is provided. |
| Rust desktop check | Environment blocked | `cargo check --manifest-path src-tauri/Cargo.toml` cannot complete because this verifier image lacks `glib-2.0` development metadata. The release workflow installs the needed Linux packages. This is not scored as a product build failure. |
| App normal flow | PASS | Local Vite app UI: imported a generated 1200×700 image containing `PRIVATE TEXT 123`, drew the full region, got exact `PRIVATE TEXT 123`, then copied that exact text to the clipboard. Only same-origin OCR assets were requested. |
| Boundary/recovery | PASS | A zero-size capture reported “Selection is too small. Drag a larger region.”; Escape then reported “Capture cancelled.” and closed the overlay. Empty license input reported “Paste a license token first.” |
| Live desktop + 390px mobile | Partial | No console/page errors; no serious/critical axe findings in either viewport; skip link gets a visible 3px cyan focus ring. Multiple visible links are under the 44px target baseline (for example header nav 25px high, footer legal links 22px). |
| Reduced motion | PASS by inspection | Both app and site include `prefers-reduced-motion: reduce` rules disabling animation/transition and smooth scroll. |
| PWA offline reload | PASS | On live site after first load: active controlling service worker; `context.setOffline(true)` then reload returned 200 and rendered the landing H1 without errors. |
| Privacy/outbound requests | Partial | Cold live load made only same-origin requests plus `https://api.github.com/.../releases/latest` to resolve a download. App OCR flow made only same-origin requests. Privacy/no-network claims remain unproven without required claim tests. |
| Accessibility verifier script | Unavailable | No `verify-url.sh` exists in the checkout, so the attached accessibility skill’s named script could not be run. Direct Playwright + `@axe-core/playwright` testing was run instead. |
| Release artifact | PASS | Downloaded `windows-x64-Screen-Text-Drop_0.1.1_x64_en-US.msi` (9.7 MB) and `sha256sum -c --ignore-missing SHA256SUMS` returned `OK`. GitHub release `v0.1.1` contains macOS arm64/x64, Windows, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`. |
| Billing rate limiting | PASS | 40 concurrent invalid-token requests to `/api/v1/products/screen-text-drop/verify` produced 429 responses as early as request 5, each with `Retry-After: 4`; successful responses were 200 `{"valid":false,"reason":"invalid"...}`. Concurrent scheduling means request 5 is the earliest observed 429, not a precise fixed threshold. |
| Live/candidate identity | PASS | Local production output and live responses have identical SHA-256 hashes for `index.html`, JS, CSS, both hero WebPs, and `sw.js`. For example: `index.html` `133fe0ea6beb17c5aab202cf64316fe133885aa61360214b34529cbe0220ea64`. |

## Defects

### Blocker

1. **Missing `.factory/claims.json` and all claim tests.** Required as the first gate; any missing manifest is release-blocking. Every privacy/offline/performance/copy claim therefore lacks required observable demo proof.
2. **No mandatory one-click sample-data demo sandbox.** The first screen has no “Try it with sample data” action; there is no `/demo`/`?demo=1`, demo banner/reset/start-for-real control, isolated namespace, shipped sample, or demo documentation. The cold first-read requirement consequently fails.
3. **First screen is not plain words for the stated audience.** “Take the text. Leave the pixels.” is a slogan rather than the required ≤9-word job headline, and it does not identify desktop users who need text from a selected screen region.

### High

4. **Type check fails.** `npx tsc --noEmit` reports eight errors, so a type-quality gate available in the repository does not pass.
5. **Desktop Pro license verification/restoration will fail for production Tauri webviews on Linux/Windows.** API `OPTIONS` preflight grants `Access-Control-Allow-Origin: https://screen-text-drop.sociobot.in`, but sends no ACAO header for `http://tauri.localhost` or `https://tauri.localhost`. The app uses browser `fetch` for verification. Its local browser preview demonstrably logs a CORS failure and falls back to “That license could not be verified.” The contract requires a working restore/verify flow.
6. **Deployed security and cache policy does not match the required configuration.** Live `/`, JS, CSS and `sw.js` responses have no `Content-Security-Policy` or `Permissions-Policy`; all return `Cache-Control: public, must-revalidate, max-age=30`, including hashed assets despite the repository `_headers` specifying immutable asset caching. The repo file alone is not deployed policy.
7. **No real 404 route.** `https://screen-text-drop.sociobot.in/does-not-exist` responds HTTP 200 with the landing page instead of a designed 404 with a way back.

### Medium

8. **44px target baseline is not met.** On desktop and 390px mobile, e.g. “How it works” is 91×25px, “Pricing” 49×25px, footer Privacy 46×22px, and header wordmark 198×30px.
9. **Required route metadata is incomplete.** Landing, privacy, and terms lack canonical links, Open Graph/Twitter metadata; privacy/terms also lack meta descriptions. This conflicts with the site-structure contract.
10. **Accessibility verifier helper is missing.** There is no repository `verify-url.sh` even though the acceptance skill requires running it.

## Deployment evidence

The deployment is live and is the tested candidate—not a deployment-only failure:

- Live `/` was HTTP 200, title `Screen Text Drop — offline screen OCR`, one H1, no console errors.
- Hashes matched freshly built candidate output for HTML, JS, CSS, worker and hero images.
- Service-worker offline reload passed.
- Live headers do include HSTS, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`; the missing CSP/Permissions-Policy and short general cache policy are recorded above.

## Required remediation before re-verification

1. Add `.factory/claims.json` and one isolated-demo observable test per claim; run every listed command successfully from a fresh checkout.
2. Implement and document `/demo` or `?demo=1` with shipped realistic sample input, separate storage namespace, persistent demo banner, Reset demo and Start for real controls; place the required one-click action on the first screen.
3. Rewrite the first screen in plain words for desktop users, then repair the TypeScript configuration/tests.
4. Make the billing verify endpoint permit the actual Tauri production origins (or perform the verification in a Tauri command), and test restore on packaged Linux/Windows app builds.
5. Deploy the configured CSP, Permissions-Policy, immutable hashed-asset cache rules, and a real 404; add missing metadata and 44px targets.

