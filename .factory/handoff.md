# Screen Text Drop repair handoff

## Repair scope

Repaired every finding in independent verification report `verification-1.md` for candidate `6b29ed4`.

- Added `/demo/`, reached by the first-screen **Try it with sample data** action. It has a realistic support-handoff sample, an interactive cleanup result, persistent **Demo — sample data, nothing is saved** banner, Reset demo, Start for real, and only the `demo:screen-text-drop:sample` storage key. The desktop app now has **Load sample project** too.
- Added `.factory/claims.json`, `.factory/demo.md`, and exact Playwright claim coverage for sample behavior, isolation, offline demo reload, same-origin demo networking, and the desktop sample.
- Rewrote the first screen to the plain-language headline “Turn screen regions into text.” and named the desktop audience and first action.
- Fixed `npx tsc --noEmit` by using Vite-relative inputs/output directories and a compatible axe Page cast; added `npm run lint`.
- Moved packaged-app license verification to the Rust `verify_license` command using `reqwest`, so Linux/Windows Tauri webviews never need billing API CORS permission. `tests/license.test.ts` proves that the Tauri branch invokes Rust and does not call browser `fetch`.
- Added `staticwebapp.config.json` with CSP, Permissions-Policy, strict referrer policy, immutable asset caching, and a genuine `404.html` response override. The static deployment must publish `dist/site` for those rules to take effect.
- Added route metadata (canonical, description, Open Graph/Twitter) on landing, demo, privacy, and terms; added a sitemap demo entry; sized visible navigation/footer controls to 44px; and added `scripts/verify-url.sh`.

## Verification evidence

Run on 2026-08-28 in a fresh `npm ci` install:

- `npm ci` — 72 packages installed; `npm audit --omit=dev --audit-level=high` — 0 vulnerabilities.
- `npm test` — pass: 4 Vitest tests; Playwright: 11 passed, 5 intentionally skipped mobile duplicates of desktop-only claim or desktop-app checks. Desktop and 390×844 responsive browser coverage passed. Desktop axe found no serious/critical violations; no monitored browser console errors.
- `npm run lint` and `npx tsc --noEmit` — pass.
- `npm run build` — pass. `dist/app` and `dist/site` produced. Site JS is 4,530 bytes (1,940 gzip), CSS is 15,059 bytes (4,090 gzip), and mobile hero WebP is 24,822 bytes.
- All claim commands in `.factory/claims.json` pass through `npm test`; the five tagged tests run against the fresh demo entry point in the desktop browser project.
- `scripts/verify-url.sh http://127.0.0.1:4173/` and `/demo/` — pass for title, lang, main, one h1, and image alt attributes.
- Static response policy is present in `dist/site/staticwebapp.config.json`: CSP, Permissions-Policy, immutable `/assets/*` cache rule, and 404 status override all validated with `jq`.
- `cargo check --manifest-path src-tauri/Cargo.toml` remains environment-blocked here because `glib-2.0.pc` is not installed. This is the same host prerequisite recorded by the verifier; the existing Ubuntu release workflow installs `libwebkit2gtk-4.1-dev` and related packages before building.

## Deployment and release

Artifact class remains **Tauri 2 desktop app plus static landing site**. Build the landing with `npm run build:site` and publish `dist/site`; its checked-in `staticwebapp.config.json` is required for the live headers, cache behavior, and 404 response.

The existing tag-driven GitHub Actions workflow remains the installer release path. It builds unsigned macOS arm64/x64, Windows x64, and Linux x64 artifacts and publishes checksums/manifest. No release tag was created for this repair.

## Known gaps / operator action

- This worker has no `glib-2.0` development package, so it cannot complete a local Tauri bundle check. Use the existing release workflow for platform bundles.
- Binaries remain unsigned. Before a signed release, provide `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`, then add the corresponding signing steps.
- After static deployment, verify live `/does-not-exist` returns HTTP 404 and live headers include CSP, Permissions-Policy, and immutable cache policy for `/assets/*`; those cannot be emulated by Vite preview.
