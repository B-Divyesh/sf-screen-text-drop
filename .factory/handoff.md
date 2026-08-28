# Screen Text Drop verification handoff — FAIL

## Decision

**FAIL — candidate `86368ada1d55a29500c1472d1ceb7c97494e1cfb` is not releasable.**

Tested on 2026-08-28 UTC against https://screen-text-drop.sociobot.in/ and a separate clean detached clone. Full evidence and remediation are in [`verification-2.md`](verification-2.md).

## Release blockers

1. Four of five exact `.factory/claims.json` commands fail immediately after `npm ci` because the commands preview an absent `dist/site`; only the desktop sample claim passes. All five pass only after an undocumented separate build.
2. Core promises—local/offline OCR, no uploads/history, capture/hotkey/copy, cleanup modes, language packs, platforms, and paid behavior—are not listed or tagged in `claims.json`.
3. The live static site matches the candidate, but downloads point to `v0.1.1` built from `caca0b1`, six commits behind `86368ad`. The public desktop binaries omit candidate product fixes, including Rust-side license verification.
4. Axe reports a serious unnamed-link violation at 390px on both `/privacy/` and `/terms/`.

## High-severity defects

- Checkout return stores and hides the license only in website localStorage; it cannot reach the desktop app and no deep-link path exists.
- The capture image remains referenced after cancel and successful OCR, contradicting the promise that pixels are discarded after recognition.
- `install.sh` exits 1 when `~/Downloads` is absent and never marks the AppImage executable.
- A corrupt image produces the unhandled error `The source image cannot be decoded.` and leaves the capture overlay open.

## What passed

- Cold first read clearly states what it does, identifies desktop users, and offers one-click **Try it with sample data**.
- `npm test`: 4 Vitest tests + 11 Playwright tests passed; 5 intentional skips.
- `npm run lint`, `npm run build`, and production dependency audit passed.
- Real bundled English OCR returned and copied `ORDER 7842 SHIP FRIDAY TOTAL 49.95` in about 3.4 seconds using only same-origin assets; blank OCR recovery passed.
- Live demo isolation, reset, same-origin requests, service-worker update, and offline reload passed.
- Live site files match candidate output; CSP/security headers, real 404, HTML revalidation, and immutable asset caching are deployed.
- Lighthouse mobile: 100 performance, accessibility, best practices, and SEO; LCP 1.2 s, CLS 0, TBT 30 ms.
- The GitHub release has all platform asset classes and valid checksums. Downloaded AppImage checksum matched.
- Billing verify allowance observed: requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 4`.

## Environment limitation

`cargo test --manifest-path src-tauri/Cargo.toml` cannot compile here because `glib-2.0.pc` is not installed. The extracted released AppImage also could not launch in this container because FUSE and host `libEGL.so.1` are unavailable. These are recorded as environment limitations, not the basis of the FAIL.

## Re-run

```sh
npm ci
# Run each .factory/claims.json test here, before any build.
npm test
npm run lint
npm run build
scripts/verify-url.sh https://screen-text-drop.sociobot.in/
```

After repairing the claim commands and product defects, publish a new desktop release from the repaired commit and repeat packaged-app, checksum, mobile axe, paid-return, privacy-memory, and installer tests.
