# Screen Text Drop v0.1.1 handoff

## What was built

- Tauri 2 desktop application with a tray menu and `Cmd/Ctrl + Shift + 2` global hotkey.
- Native primary-display screen capture, full-screen pointer or keyboard region selection, and screenshot paste/import fallback.
- Fully local OCR using bundled Tesseract.js WASM and English, Spanish, and German `tessdata_fast` packs. Captures exist only in memory and are discarded after recognition.
- Editable output, paragraph/code/table cleanup, plain-text/Markdown formatting, and native clipboard copy.
- Free English paragraph flow plus a $12 one-time Pro license for specialist cleanup, Markdown, and extra language packs. Checkout, returned-token storage, daily verification cache, optimistic offline behavior, invalid-license notice, and paste-to-restore follow the Sociobot billing contract.
- Product-specific night-market neon UI for the app and responsive landing site, including an original generated/optimized hero, privacy/terms pages, OS-aware download action, checksum-verifying shell/PowerShell installers, offline service worker, and immutable asset caching.
- GitHub Actions release matrix for macOS Apple silicon + Intel, Windows x64, and Linux x64; final publish job creates `SHA256SUMS` and `latest.json` and attaches all bundles to a GitHub Release.

## Verification

- `npm test`: pass — 3 unit tests and 4 Playwright tests across desktop Chromium and a 390 px mobile viewport; zero serious/critical axe violations and zero page console errors.
- `npm run build`: pass — `dist/site/index.html` and `dist/app/index.html` produced.
- `cargo check --manifest-path src-tauri/Cargo.toml`: pass.
- `npm run tauri -- build --bundles deb`: pass; generated a 13 MB Debian package.
- Offline OCR smoke: a generated 900 × 260 screenshot was imported, selected, and recognized as `PRIVATE TEXT` using only the bundled worker/core/model.
- Lighthouse 12.8.2 mobile: Performance **100**, Accessibility **100**, Best Practices **96**, SEO **100**; LCP **1.1 s**, CLS **0**, TBT **0 ms**.
- Static first load: 3.8 KB JS, 12.5 KB CSS, 63 KB hero WebP; all below budget. No runtime font, script, analytics, or OCR CDN.
- Release tag `v0.1.1` completed successfully as workflow run `33157815657`. The public release contains both DMGs, MSI/EXE, AppImage/DEB, `SHA256SUMS`, and valid `latest.json` entries for all four platform keys.
- Release verification: downloaded `macos-arm64-Screen-Text-Drop_0.1.1_aarch64.dmg`; SHA256 `81b586e6f352bea9fad77e3671eadb7e09f3fd9e931f630c9df7d6c419fec620` exactly matched `latest.json`.
- `npm audit`: zero vulnerabilities.

## Known gaps

- v1 captures the primary display. Image paste/import covers text visible on another display; automatic multi-monitor selection is a follow-up.
- Binaries are unsigned until owner certificates are supplied, so macOS Gatekeeper and Windows SmartScreen show their standard warnings. The site and README disclose this.
- OCR quality depends on source contrast and scale. The app reports an actionable empty result and allows a tighter retry.
- The one-time product and production return URL still need final registration in the Sociobot billing control plane; no product ID is hardcoded.

## Needs operator action

1. Register `screen-text-drop` as a $12 one-time product with return URL `https://screen-text-drop.sociobot.in/?license={token}` in Sociobot billing.
2. Configure deployment with build command `npm run build:site` and publish directory `dist/site`.
3. For signed builds, add macOS secrets `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`; add Windows secrets `WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`, then add the corresponding signing commands to the release workflow. The current workflow deliberately expects no signing secrets and produces unsigned packages.

## Next steps

- Add cursor-aware multi-display capture and an OS settings deep link for denied permissions.
- Add more optional `tessdata_fast` language packs after measuring installer growth.
- Submit the generated MSI metadata to winget after signing is available.
