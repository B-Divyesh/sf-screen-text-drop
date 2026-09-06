# Screen Text Drop repair handoff — PASS

## Release decision

**PASS.** Screen Text Drop 0.1.2 now completes its local OCR job, publishes current desktop installers, and passes the declared claims from a clean clone.

- Desktop implementation: `3b4947c234cab52834e6a49374213dcd4946da54`
- Desktop release tag: `v0.1.2` at `2263f50a1fd900f84f84b85ec1d844f74457a81b`
- Live static-site implementation: `565edb161c674c968abbe0548b2ea4444baacbc9` (post-tag changes discard demo state on exit and limit platform copy to the tested claim)
- Verification test/documentation baseline: `ed979e9ce0451901ea9988311327dd3951cca990`
- Live URL: https://screen-text-drop.sociobot.in/
- Release workflow: https://github.com/B-Divyesh/sf-screen-text-drop/actions/runs/34013461962

The release tag contains the complete repaired desktop source. Later commits do not change the desktop app or its binaries.

## What changed

- Capture sources are revoked and cleared after recognition, cancellation, and errors.
- Corrupt images and small selections now show visible recovery instructions without trapping the user.
- The checkout callback displays and copies the returned license for transfer into the desktop app. The app verifies it through its Rust command, caches a valid verdict for one day, and handles invalid, offline, and rate-limited replies.
- Linux installation now creates `~/.local/bin`, verifies SHA-256, installs an executable `screen-text-drop` command, and explains PATH when needed. macOS and Windows download destinations are created when absent.
- Demo data uses only its `demo:` key. Reset restores the supplied sample. Start for real discards demo state without changing app or license data.
- Demo tabs and app cleanup radios use roving focus and Arrow-key selection. Links meet the 44 by 44 pixel target baseline.
- Mobile legal-page home links have accessible names. All routes now have complete metadata, a 1200 by 630 social image, SVG favicon, Apple touch icon, consistent footer, and plain headings.
- The first screen names the job, audience, sample action, local processing, offline use, and the $12 one-time Pro price.
- Language-pack labels now report the bundled compressed sizes: English 1.89 MiB, Spanish 1.08 MiB, and German 0.81 MiB.
- Reqwest's `query` feature is enabled, fixing the packaged Rust license-verification build.

## Verification results

### Clean checkout and claims

A new shallow clone of final `main` received only `npm ci` before its claim loop. All 16 exact `test` commands in `.factory/claims.json` passed independently. This includes real bundled English, Spanish, and German OCR; offline reload; same-origin request recording; clipboard output; revoked capture URLs; recovery paths; paid gating; Linux installation; and public release artifacts.

### Local product gates

- `npm test`: 3 Vitest files / 9 tests and 22 Playwright tests passed; 10 intentional duplicate mobile claim runs skipped.
- `npm run lint`: passed.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `npm run build`: produced `dist/app` and `dist/site`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed. The application crates contain no separate Rust unit cases; the command compiles and links both Rust targets and doc tests.
- `npm run tauri -- build --bundles deb`: produced a 14,840,642-byte version 0.1.2 Debian package before generated Cargo artifacts were cleaned.
- An extracted local Debian package stayed running for its eight-second Xvfb smoke window.

### Published desktop release

The GitHub Actions matrix and publish job passed for macOS arm64, macOS x64, Windows x64, and Linux x64. The stable release contains two DMGs, MSI, EXE, AppImage, DEB, `latest.json`, and `SHA256SUMS`.

The release claim resolved the annotated tag to `2263f50`, checked all required asset classes and four manifest platform entries, then downloaded the 11,771,904-byte Windows MSI. Its SHA-256 matched `SHA256SUMS`.

The public Linux one-line installer was also run against the live v0.1.2 release in a new consumer directory. It downloaded the 91,961,848-byte AppImage, matched the manifest checksum, installed mode `755`, and the installed app stayed running for a ten-second headless smoke window. Portal, accessibility-bus, PipeWire, and EGL warnings are expected in this container without a desktop session.

### Live site

- Deployed to the existing `sf-screen-text-drop` Azure Static Web App production environment. No infrastructure settings were changed.
- Local and live SHA-256 values match for `/`, `/demo/`, `/privacy/`, `/terms/`, and `/sw.js`.
- The URL verifier passes all four normal routes.
- An unknown route returns the designed page with deliberate HTTP 404.
- Fresh 1440 by 900 and 390 by 844 browser contexts both show the job, audience, first action, and three facts before scrolling. Neither has horizontal overflow.
- The sample opens in one click with a persistent demo label and populated table output. Reset restores the supplied paragraph. Start for real deletes the demo key. A separate real-data sentinel and the license namespace remain unchanged.
- Serious and critical Axe findings: 0 on all four routes in both desktop and phone contexts.
- Console errors: 0 on the checked live routes, paid return, and offline demo reload.
- The paid callback strips the license query, opens the transfer dialog, prefills the token, and copies it for the app.
- The service worker reloads the populated demo offline.
- Security headers include CSP, HSTS, `nosniff`, strict referrer policy, and a restrictive permissions policy.
- The detected Linux download points to the v0.1.2 AppImage and reports its published checksum.

### Performance

Lighthouse mobile results on the live landing page:

- Performance: 100
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- FCP: 0.9 s
- LCP: 1.1 s
- CLS: 0
- TBT: 70 ms

Production site assets remain below budget: entry JavaScript is 6,050 bytes raw / 2.45 KB gzip, CSS is 15,650 bytes raw / 4.19 KB gzip, the mobile hero is 24,822 bytes, and the social image is 57,666 bytes.

## Earlier findings disposition

| Verification 2 finding | Disposition |
| --- | --- |
| Claim commands failed without a prior build | Fixed; all 16 pass after only `npm ci` in a clean clone. |
| Core and privacy claims lacked tests | Fixed with observable OCR, network, clipboard, disposal, recovery, licensing, language, and installer checks. |
| Desktop binaries were six commits stale | Fixed by v0.1.2 from the repaired desktop source. |
| Mobile Privacy and Terms Axe failures | Fixed; both viewports have zero serious/critical findings on all routes. |
| Paid return hid the license from the app | Fixed with visible, copyable transfer and tested app verification/unlock. |
| Capture pixels stayed referenced | Fixed; object URLs are revoked and the image source is cleared on every exit path. |
| Linux installer failed in a clean home | Fixed and exercised with the real public AppImage. |
| Corrupt images left a stuck overlay | Fixed with decode validation, cleanup, and an actionable status. |
| Demo/app Arrow keys did not select | Fixed with roving selection behavior. |
| Narrow touch targets | Fixed and measured on every route. |
| Missing first-screen facts/footer identity | Fixed. |
| German model size was inaccurate | Fixed and checked byte-for-byte for all three models. |
| Missing required social/icon assets | Fixed with documented original-art derivatives. |

Earlier minor checks remain passing: reduced motion, focus visibility, route titles, metadata, privacy and terms routes, real 404, service-worker update/offline behavior, internal links, response headers, and output budgets.

## Paid offer

The live offer is **Screen Text Drop Pro, $12 USD once**. It includes code and table cleanup, Markdown output, and Spanish and German OCR data. Public registration metadata is in `.factory/billing-offer.json` and `/work/.evidence/billing-offer.json`.

The public checkout is registered and the invalid-license endpoint responds normally. A successful paid transaction was not performed because no customer credential was available and none was invented. Automated entitlement coverage uses a recorded valid gateway response and exercises the complete browser-to-app transfer and Pro gate.

## Known gaps and operator action

- Binaries are unsigned. macOS notarization requires `APPLE_CERTIFICATE` and related Apple signing values. Windows Authenticode requires `WINDOWS_CERT_PFX` and its password.
- Native capture permission prompts and the global shortcut cannot be interactively exercised in this headless Linux worker. They compile in every release target; the browser harness covers the same capture invocation, selection, OCR, copy, and recovery state machine.
- The `screenshots` Rust dependency emits a future-incompatibility warning. It does not fail the current stable Rust build, but should be upgraded when an API-compatible release is available.

## Re-run

```sh
npm ci
npm test
npm run lint
npm audit --omit=dev --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --manifest-path src-tauri/Cargo.toml
node -e "const {spawnSync}=require('node:child_process');const claims=require('./.factory/claims.json');for(const item of claims){const result=spawnSync(item.test,{shell:true,stdio:'inherit'});if(result.status)process.exit(result.status)}"
scripts/verify-url.sh https://screen-text-drop.sociobot.in/
```
