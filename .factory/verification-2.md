# Independent verification 2 — FAIL

**Candidate:** `86368ada1d55a29500c1472d1ceb7c97494e1cfb` (`86368ad`)

**Live URL:** https://screen-text-drop.sociobot.in/

**Date:** 2026-08-28 UTC

## Release decision

**FAIL — do not release this candidate.** Four of the five exact claim commands fail in a clean installed clone, which is release-blocking by contract. The live static site matches the candidate and passes the cold first-read gate, but the downloadable desktop apps are an older build, two mobile legal routes have serious axe violations, core visitor claims are not represented in `claims.json`, the advertised Linux install command fails in a clean home without `~/Downloads`, and paid-return/privacy error paths are incomplete.

This is not a deployment-only failure. The live static site is the candidate byte-for-byte for all checked HTML, JS, CSS, service-worker, and 404 files. The deployment defect is instead that the product's downloadable desktop artifact still comes from an older commit.

## Mandatory claims gate — release-blocking failure

I created a separate clone at candidate `86368ad`, ran `npm ci`, and then ran every `test` value from `.factory/claims.json` exactly as written, before building. A fresh clone has no ignored `dist/site`; `vite preview` starts but returns an empty HTTP 404. The manifest's individual commands do not build or start a source server.

| Claim | Exact command | Clean-clone result | Evidence |
| --- | --- | --- | --- |
| `sample-demo` | `npx playwright test --grep @claim:sample-demo` | **FAIL** | `/demo/` had no banner; `getByText('Demo — sample data, nothing is saved')` timed out. |
| `demo-isolated` | `npx playwright test --grep @claim:demo-isolated` | **FAIL** | `localStorage.getItem('demo:screen-text-drop:sample')` remained `null`. |
| `demo-offline` | `npx playwright test --grep @claim:demo-offline` | **FAIL** | Timed out waiting for `navigator.serviceWorker.ready`. |
| `demo-local-network` | `npx playwright test --grep @claim:demo-local-network` | **FAIL** | Timed out waiting for the Table tab on the empty 404 response. |
| `desktop-sample` | `npx playwright test --grep @claim:desktop-sample` | PASS | The app dev entry loaded; **Load sample project** populated the supplied result. |

After a separate `npm run build`, all five commands pass. This confirms the demo implementation works and isolates the defect to non-self-contained claim commands. It does not change the required clean-clone result. README also tells users the manifest commands can be run individually, which is currently false without an undocumented build prerequisite.

### Unlisted claims

The landing page and README make reliance claims with no matching entry/test in `.factory/claims.json`, including:

- local/offline OCR, no upload, no screenshot history, and pixels discarded after recognition;
- the global hotkey, native region capture, clipboard output, and code/table/Markdown cleanup;
- bundled English/Spanish/German packs and free-versus-Pro enforcement;
- supported macOS/Windows/Linux artifacts, published checksum, and the `$12` one-time purchase.

The claims contract says any claim-like sentence absent from the manifest fails review. The current five entries cover only the sample/demo and sample-project behavior, not the product's core job or privacy promises.

## Cold first read

Fresh Chromium, 1440×900, no stored state:

- **What it does:** “Turn screen regions into text.”
- **For whom:** “For desktop users who need text from a screen region.”
- **What to click first:** **Try it with sample data**, with “Opens a sample workspace. Nothing is saved.” beside it.
- **One-click result:** the link opens `/demo/`, whose populated sample workspace and persistent “Demo — sample data, nothing is saved” banner are immediately visible.

The cold first-read/demo gate passes. The attached plain-words contract's additional requirement for three first-screen facts (privacy, offline, price) is not met: the first viewport has no price fact and no explicit three-line fact group.

## Clean checkout and automated gates

| Check | Result | Exact evidence |
| --- | --- | --- |
| Candidate identity | PASS | Detached clean clone resolved to `86368ada1d55a29500c1472d1ceb7c97494e1cfb`; tracked tree clean. |
| Install | PASS | `npm ci`: 72 packages installed; 0 audit findings reported. |
| Full suite | PASS | `npm test`: 2 Vitest files / 4 tests passed; production build passed; Playwright 11 passed and 5 intentionally skipped mobile duplicates. |
| Type/lint | PASS | `npm run lint` (`tsc --noEmit`) exited 0. |
| Dependency audit | PASS | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities. |
| Exact production build | PASS | `npm run build` produced `dist/app` and `dist/site`. |
| Rust desktop tests | Environment blocked | `cargo test --manifest-path src-tauri/Cargo.toml` stopped because this image lacks `glib-2.0.pc`; the repository release workflow installs that OS prerequisite. |
| URL verifier | PASS | `scripts/verify-url.sh` passed on live `/`, `/demo/`, `/privacy/`, and `/terms/`. |

## Smallest useful product and recovery paths

I generated a 1000×600 screenshot containing `ORDER 7842 / SHIP FRIDAY / TOTAL 49.95`, imported it through the app browser entry, accepted the default selected region, and ran the bundled OCR.

- Normal OCR completed in about 3.4 seconds and returned exactly `ORDER 7842 SHIP FRIDAY TOTAL 49.95`.
- **Copy text** wrote that exact value to the browser clipboard.
- Requests were same-origin only: the app source plus local `worker.min.js`, Tesseract core, and `eng.traineddata.gz`; no OCR request left the app origin.
- A blank white image produced “No text found — try a tighter, higher-contrast region.” and kept Copy disabled.
- A 5×5 selection produced “Selection is too small. Drag a larger region.” The error is only updated behind the full-screen capture layer; the visible layer continues to show the generic drag instructions.
- A corrupt file named `broken.png` caused the unhandled page error `The source image cannot be decoded.` and left the capture layer open with stale instructions. Escape remains a manual recovery.
- The paragraph/code/table cleanup unit tests pass, including smart-quote repair, indentation preservation, tabular cleanup, and Markdown table output.
- Native global shortcut, tray behavior, OS capture permission, and multi-platform packaged execution could not be exercised in this Linux container. The released AppImage could be extracted, but launch was environment-blocked by missing FUSE and then missing host `libEGL.so.1`.

### Privacy promise contradiction

The app says: “Pixels stay in memory only until text is produced, then they are discarded.” This is false in the observed UI state. After both Escape/cancel and successful OCR, `#capture-image` still held a live `blob:http://127.0.0.1:1420/...` source while the layer was hidden. The code neither clears the image element nor calls `URL.revokeObjectURL`. Native captures similarly remain in the image element as a data URL. Nothing was persisted to disk/browser storage, but the promised in-memory discard does not happen.

## Live browser, accessibility, and privacy

Tested with fresh Chromium contexts at 1440×900 and 390×844.

| Area | Result | Evidence |
| --- | --- | --- |
| Layout | PASS | No horizontal overflow at either viewport; desktop and mobile visual inspection showed complete content. |
| Console/page errors | PASS on normal routes | None on `/`, `/demo/`, `/privacy/`, or `/terms/`. The corrupt app-image path produces the page error recorded above. |
| Semantics | PASS | Live routes have `lang=en`, a title, one H1, and one main landmark; headings and image alternatives pass the supplied verifier. |
| Desktop axe | PASS | No serious/critical findings on `/`, `/demo/`, `/privacy/`, or `/terms/`. |
| Mobile axe | **FAIL** | `/privacy/` and `/terms/` each have one serious `link-name` violation. At ≤600px CSS hides the wordmark's only text, and those legal-page home links lack an `aria-label`. |
| Keyboard/focus | Partial | Tab reaches the skip link and controls with a visible 3px cyan outline; native dialogs focus the close button and Escape closes them. Demo tabs do not implement Arrow navigation. App radio arrows move focus but do not change `aria-checked`/the selected preset (focus moved to Table while Paragraph stayed checked). |
| Touch targets | **FAIL** | Several text links are less than 44 CSS px wide (for example footer Terms is 38×44 and Demo is 37×44); the contract requires at least 44×44. |
| Reduced motion | PASS | Emulated `prefers-reduced-motion: reduce` produced `scroll-behavior: auto` and zero transition/animation duration. |
| Demo isolation | PASS after build/live | Demo storage contained only `demo:screen-text-drop:sample`; Reset restored the paragraph and did not touch the license key. |
| Outgoing requests | PASS | Fresh `/demo/` requested only its own origin. Fresh `/` requested only its own assets plus the documented GitHub release API; no analytics/tracking requests occurred. |
| Service worker | PASS | Active `sw.js` scope covered `/`; `registration.update()` completed; offline `/demo/` reload retained the H1 and supplied sample. |

The website response policy is deployed: CSP, Permissions-Policy, strict referrer policy, HSTS, and `nosniff` were present. HTML uses `Cache-Control: public, must-revalidate, max-age=30`; hashed JS/CSS use one-year immutable caching; `sw.js` uses `no-cache`. `/does-not-exist` correctly returns HTTP 404 with the designed page.

## Performance and budgets

Mobile Lighthouse on the live landing page:

- Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**.
- FCP 1.1 s, LCP 1.2 s, CLS 0, TBT 30 ms, interactive 1.3 s.

Production site assets are inside budget: JS 4,530 bytes raw (1,940 gzip), CSS 15,059 bytes raw (4,090 gzip), mobile hero 24,822 bytes. The app's initial code chunks are also below the 200 KB JS budget; OCR/model assets load when used.

## Deployment and release identity

The live **site** matches the candidate. SHA-256 matched local `dist/site` for:

- `index.html` — `15f8a125707c765f80d7e249466609974c8748fd54eeff3f50797e4b8b0d39b9`
- `demo/index.html` — `17cf0e78d0a69cfa9c33091d99359c4e6743abbf16fcb7242342bdb2dbd8a04e`
- `privacy/index.html`, `terms/index.html`, `404.html`, hashed JS/CSS, and `sw.js` also matched.

The downloadable **desktop product does not match**:

- Latest release/tag: `v0.1.1` at `caca0b1185682be9aaeb346fd1f2a315ac96daaf`.
- Candidate: `86368ada1d55a29500c1472d1ceb7c97494e1cfb`, six commits later.
- Product delta since the release includes `app/src/license.ts`, `app/src/main.ts`, app CSS, `src-tauri/src/lib.rs`, `Cargo.toml`, and `Cargo.lock`.
- The release workflow succeeded for `caca0b1`, not the candidate. In particular, its binaries predate the candidate's Rust-side license verification repair and still use the webview fetch path previously shown to fail for packaged Linux/Windows origins.

Release completeness/checksum otherwise passes: macOS arm64/x64 DMGs, Windows MSI/EXE, Linux AppImage/DEB, `SHA256SUMS`, and valid `latest.json` exist. The downloaded 90,130,936-byte AppImage SHA-256 was `8abdec3e6bb310404dbe23d05c9fac1ccdaaacc5fc9e5a2838a7e0f007b7e79c`, matching both manifest and checksum file.

### Installer failure

Running `sh dist/site/install.sh` in the clean verifier home downloaded and verified the AppImage, then exited 1:

```text
mv: cannot move '...AppImage' to '/root/Downloads/...AppImage': No such file or directory
```

The script assumes `~/Downloads` exists and never creates it. Even when that directory exists, it does not mark the AppImage executable. This contradicts the advertised “verified one-line installer” and the installable-software contract.

## Paid unlock and API allowance

The billing verify endpoint enforced an observed allowance of **30 requests per client/window**. Sequential invalid-token requests 1–30 returned HTTP 200 with `valid:false`; request 31 returned HTTP 429 with `Retry-After: 4`.

The return flow is nevertheless broken for the desktop product. Visiting `/?license=qa_fake_callback_token` strips the query and stores the token only in website localStorage, opens an empty Restore dialog, and does not show or prefill the token. Tauri app storage is a different origin, and the app registers no deep-link handler. A buyer returning from browser checkout therefore does not unlock the desktop app through this flow; “Open the app to use Pro” cannot transfer the hidden browser token. The app's manual paste field is not a substitute for the required automatic post-checkout store/unlock behavior.

No product sign-in exists, so the Entra authority requirement is not applicable. The product owns no server endpoint; the checked server-side allowance is the Sociobot product verify endpoint it calls.

## Other contract gaps

- The first screen does not show the required three short privacy/offline/price facts.
- The footer does not include “Built by Param Factory” or a version/build ID; legal-route footers also omit the product one-liner/home structure.
- There is no SVG favicon or 180px Apple touch icon, and the Open Graph image is 1200×800 rather than the specified 1200×630 social image.
- The desktop selector says German is 4.1 MB, while the bundled German data is 854,318 bytes compressed / 1,525,436 bytes uncompressed. This is not an accurate language-pack-size disclosure.

## Defects by severity

### Blocker

1. Four of five exact `.factory/claims.json` commands fail after `npm ci` in a clean clone because they do not build/serve the demo output.
2. Numerous visitor-reliance claims, including the core local OCR/privacy/capture behavior, have no entry and no tagged sandbox test in `claims.json`.
3. The downloadable desktop applications are release `caca0b1`, not candidate `86368ad`; the shipped app omits candidate product fixes.
4. Mobile `/privacy/` and `/terms/` each have a serious axe `link-name` violation.

### High

5. The post-checkout license callback stores and hides the token in website storage that the desktop app cannot access, so it does not unlock the purchased desktop product.
6. Captured pixels remain referenced after both cancel and successful OCR, contradicting the explicit discard-after-recognition privacy promise.
7. The advertised Linux one-line installer fails if `~/Downloads` is absent and does not make the AppImage executable.
8. A corrupt image causes an unhandled page error and leaves the full-screen capture layer stuck until the user discovers Escape.

### Medium

9. Demo tabs lack Arrow-key operation; app radio Arrow keys move focus without changing selected state.
10. Multiple links are narrower than the required 44×44 touch target.
11. First-screen facts and standard footer/build identity are incomplete.
12. German pack size disclosure is inaccurate.

### Low

13. Required SVG/apple-touch icons and the required 1200×630 social preview are absent.

## Required remediation

1. Make every exact claim command self-contained from `npm ci` (build/start the correct demo entry), and add tagged tests for every core capture, privacy, offline, output, platform, and paid-tier claim.
2. Publish a new version/tag from the repaired candidate and verify all platform assets/checksums; do not keep directing users to the stale `v0.1.1` binaries.
3. Fix the unnamed mobile legal-page home links and keyboard widget semantics; enforce 44×44 targets.
4. Clear `capture-image.src`, revoke object URLs on cancel/success/failure, and handle image decode errors visibly with recovery.
5. Implement a real browser-to-desktop license return/deep-link or visibly hand the token to the user, then test the purchased unlock end to end.
6. Make `install.sh` create its destination and mark AppImage downloads executable.
