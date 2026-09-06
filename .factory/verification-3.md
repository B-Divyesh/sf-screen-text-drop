# Turn a screen region into text — independent verification 3

## Verdict

**FAIL.** The published Linux desktop app does not complete the core capture-to-text job in a clean consumer session, and its **Copy text** action reports success without leaving text on the clipboard. The one-click web demo also has a broken desktop/tablet layout. There are **5 findings** and **0 untested claims**.

Date: 2026-09-06 UTC

Live URL: https://screen-text-drop.sociobot.in/

Desktop implementation: `3b4947c234cab52834e6a49374213dcd4946da54`

Release: `v0.1.2` at `2263f50a1fd900f84f84b85ec1d844f74457a81b`

Live-site implementation: `565edb161c674c968abbe0548b2ea4444baacbc9`

Documentation baseline: `51118c414c0984acf8018985a5d349b3fc68421b`

The live files match a clean build of the documentation baseline byte-for-byte. There are no desktop-app source changes between `3b4947c` and the release tag. Commits after `565edb1` change tests or reports, not the live product.

## Cold first read

Before scrolling in fresh 1440×900 and 390×844 Chromium contexts:

- Job: **Turn screen regions into text.**
- Audience: desktop users who need text from a screen region.
- First action: **Try it with sample data**; the adjacent text says nothing is saved.
- Facts: OCR runs on the device, installed use works offline, and Pro costs $12 once.

All of these were visible in both first viewports with no horizontal overflow or console error.

## Findings

### Blocker

1. **The published Linux app does not finish native OCR.** I installed the public v0.1.2 AppImage, launched it in a fresh X11/DBus consumer session, placed a window containing `NATIVE CAPTURE 7842` behind it, and pressed `Ctrl+Shift+2`. The installed global shortcut worked and the region selector contained the supplied text. After Enter, the app stayed at **Reading locally…** with the progress bar at its initial position for more than 170 seconds. It produced no text or error. This fails the core job, the `offline-installed` claim, and the brief's under-15-second target. Evidence: `/work/.evidence/installed-native-hotkey.png` and `/work/.evidence/installed-native-ocr-late.png`.

### High

2. **The published Linux app reports a successful copy while the clipboard is empty.** In two fresh X11 runs, including one with a DBus session, I loaded the bundled sample and selected **Copy text**. The app announced **Copied to clipboard**, but both `xsel --clipboard --output` and `xclip` returned no clipboard data or available targets. The Rust command creates an `arboard::Clipboard`, writes once, and immediately drops it; arboard documents that Linux clipboard content may become unavailable when the last instance is dropped. This makes the advertised paste result unreliable and gives false success feedback. Evidence: `/work/.evidence/installed-app-copied.png` and `/work/.evidence/installed-dbus-copy.png`.

3. **Installed-runtime claim tests use a browser preview and cannot detect the two failures above.** The exact commands for `local-ocr-copy-disposal` and `offline-installed` run the app at `http://127.0.0.1:1420` in Chromium. That takes the `navigator.clipboard` branch and a Chromium Web Worker path, not the Tauri Rust clipboard command or packaged WebKit runtime. `capture-hotkey` likewise checks the browser file-picker fallback rather than the native global shortcut. The declared commands pass while the shipped app fails, so these claim tests are incomplete under the claims contract. I independently exercised the native shortcut, so no public claim remains untested; the installed OCR and copy claims are tested and false.

### Medium

4. **The demo workspace collapses at desktop widths and overflows at 1024 px.** At 1440 px, the default `<pre>` uses `white-space: pre`, forcing the output column to about 1,012 px and crushing the captured-sample column to 58 px; its content is unreadable. At 1024 px, the document is 1,131 px wide, the output panel extends beyond the viewport, and the sample remains 58 px wide. The corrective single-column and wrapping rules apply only at 900 px and below. This breaks the required realistic populated demo at common desktop/tablet widths. Evidence: `/work/.evidence/live-demo-populated.png` and `/work/.evidence/live-demo-1024.png`.

### Low

5. **The Privacy page's public-issue-tracker link misses the required 44 px target size on desktop.** Its measured clickable box is 164.2×19 px at 1440 px. The release repair added 44 px sizing to header/footer links but not inline legal-page links. Axe does not flag the WCAG inline-link exception, but the attached product accessibility contract requires every interactive target to be at least 44×44 px.

## Declared claims

A separate clone was checked out at `51118c414c0984acf8018985a5d349b3fc68421b`. After only `npm ci`, every exact `test` value in `.factory/claims.json` was run independently.

| Claim | Exact-command result | Independent disposition |
| --- | --- | --- |
| `sample-demo` | PASS | One click opens populated sample. |
| `demo-isolated` | PASS | Reset/exit preserve real and license sentinels. |
| `demo-offline` | PASS | Fresh service-worker context reloads populated demo offline. |
| `demo-local-network` | PASS | Demo requests only its own origin. |
| `desktop-sample` | PASS | Also passed in the installed AppImage. |
| `local-ocr-copy-disposal` | PASS | **False for packaged Linux copy; Finding 2.** |
| `offline-installed` | PASS | **False for packaged Linux OCR; Finding 1.** |
| `no-history-tracking` | PASS | Browser sandbox emitted no cross-origin OCR request or storage history. |
| `capture-hotkey` | PASS | Native shortcut independently opened the installed selector. Declared test coverage is incomplete; Finding 3. |
| `keyboard-region-selection` | PASS | Arrow, Shift+Arrow, Enter, and Escape paths passed. |
| `capture-recovery` | PASS | Cancel, small region, and corrupt-image recovery passed in the app harness. |
| `cleanup-presets` | PASS | Paragraph, code, table, and Markdown fixtures passed. |
| `language-packs` | PASS | Three bundled files, exact sizes, local requests, and Pro gating passed. |
| `pro-license-return` | PASS | Returned token was visible, stripped from URL, copied, and gated as specified. |
| `linux-installer` | PASS | Fixture installer verified checksum, mode, and execution. |
| `release-artifacts` | PASS | Eight v0.1.2 assets; downloaded MSI matched `SHA256SUMS`. |

Claim command totals: **16 passed, 0 command failures, 0 untested**. Findings 1–3 show why command success is not sufficient acceptance evidence.

## Live browser evidence

- Fresh desktop and phone contexts showed the job, audience, action, and all three facts before scrolling.
- The sample opened in one click. Paragraph output was populated; Table output was `Item / Owner / Status` with a realistic support row.
- The persistent demo label remained visible after scrolling. Reset restored `paragraph`. Start for real removed only `demo:screen-text-drop:sample`; real-data and license sentinels remained unchanged.
- `/demo/` made same-origin requests only. Service-worker update and offline reload both succeeded with no console errors.
- `/`, `/demo/`, `/privacy/`, and `/terms/` each returned 200 with their own title, `lang=en`, one H1, one main landmark, ordered headings, and no horizontal overflow at 1440×900 or 390×844.
- Axe found zero serious or critical issues on all four routes in both viewports.
- Tab exposed a 3 px cyan focus ring. Activating the skip link made the next Tab land on the first main action. Demo Arrow keys changed selection. The restore dialog focused Close and Escape closed it.
- Reduced-motion emulation produced `scroll-behavior: auto` and no non-zero animation or transition durations.
- `/does-not-exist-qa3` deliberately returned HTTP 404 with the designed **Page not found — Screen Text Drop** page and a route home.
- Every discovered internal link/fragment resolved. GitHub links returned 200, the release asset returned its expected 302 download redirect, and checkout returned its expected 303 hosted-checkout redirect.
- A fake paid return stripped the query, opened the transfer dialog, displayed and stored the token, and copied it without console errors.
- The billing verification endpoint returned invalid-license HTTP 200 responses for requests 1–30 and HTTP 429 with `Retry-After: 4` on request 31.
- Live response headers include CSP, HSTS, `nosniff`, strict referrer policy, and a restrictive permissions policy.
- `scripts/verify-url.sh https://screen-text-drop.sociobot.in/` passed.

This product has no product backend, tenant state, or server-side SQLite, so tenant-isolation, restart-persistence, and product health-endpoint checks do not apply. The only live server allowance in scope is the Sociobot license verifier, checked above.

## Build, quality, release, and performance

- `npm ci`: PASS; 74 packages installed, 0 vulnerabilities.
- `npm test`: PASS; 9 Vitest tests and 22 Playwright tests passed, with 10 declared mobile duplicates skipped.
- `npm run lint`: PASS.
- `npm audit --omit=dev --audit-level=high`: PASS; 0 vulnerabilities.
- `npm run build`: PASS; created `dist/app` and `dist/site`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: PASS.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS after installing the documented Tauri Linux prerequisites; both targets and doc tests compiled, with 0 Rust unit tests defined. The existing future-incompatibility warning for `screenshots 0.8.10` remains.
- Live/local SHA-256: exact match for landing, demo, Privacy, Terms, service worker, hashed CSS, and hashed JavaScript.
- Site assets: 6,050-byte JS, 15,650-byte CSS, 24,822-byte mobile hero. Social image is 1200×630; Apple icon is 180×180.
- Fresh Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 30 ms. Evidence: `/work/.evidence/lighthouse.json`.
- Public installer: downloaded 91,961,848-byte AppImage, installed it executable, and matched SHA-256 `8156f3edf1402be06b4018656d94cfa04c12858384be41ddd6af69ba6281b3b5`.
- The installed app launched after the documented Linux runtime packages were installed, stayed running for the smoke window, loaded its bundled sample, and exposed the native global shortcut. Its core OCR/copy failures are Findings 1 and 2.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims manifest and claim tests | Fixed: 16 entries and exact commands exist and pass. Installed-runtime coverage is incomplete (Finding 3). |
| Missing one-click isolated demo | Fixed functionally; layout remains broken above 900 px (Finding 4). |
| Metaphorical first screen / audience missing | Fixed. |
| Type check failed | Fixed. |
| Tauri license verification blocked by CORS | Fixed through the Rust command; callback transfer is visible and copyable. |
| Missing live security/cache policy | Fixed. |
| Missing real 404 | Fixed; deliberate HTTP 404 confirmed. |
| 44 px targets | Partially fixed; one legal-page link remains 19 px high (Finding 5). |
| Missing route metadata and verifier helper | Fixed. |
| Claim commands required an undeclared prior build | Fixed. |
| Core/privacy claims absent from manifest | Fixed in the manifest; packaged-runtime tests remain incomplete (Finding 3). |
| Published desktop binaries were stale | Fixed; v0.1.2 contains the `3b4947c` desktop source. |
| Mobile legal-page accessible names failed Axe | Fixed; zero serious/critical findings. |
| Paid return hid the license from the app | Fixed with visible browser-to-app transfer. |
| Capture pixels stayed referenced | Fixed in the tested state machine. |
| Linux installer failed in a clean home | Fixed; public AppImage installed and checksum matched. |
| Corrupt image trapped the user | Fixed in the recovery test. |
| Demo/app Arrow keys did not select | Fixed. |
| First-screen facts/footer identity missing | Fixed. |
| German pack size inaccurate | Fixed and measured byte-for-byte. |
| Social/icon assets missing | Fixed at required dimensions. |

## Required repair

1. Exercise the packaged Tauri WebKit app in CI and fix bundled OCR initialization so a native capture or imported image reaches text or a timed, actionable error.
2. Keep the Linux `arboard::Clipboard` owner alive in application state, then verify the copied text from a separate consumer process before showing success.
3. Make the installed-runtime claims execute the packaged application, not only the Chromium preview.
4. Give demo grid children `min-width: 0` and wrap/contain the output at all widths; add 1024 px and 1440 px visual assertions.
5. Give the Privacy contact link a 44 px target without reducing paragraph readability.

Unsigned binaries remain an acknowledged operator-signing limitation; it is not a new defect in this verification.
