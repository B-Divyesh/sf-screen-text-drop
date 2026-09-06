# Screen Text Drop repair handoff — release candidate

## Status

The repair implementation is complete and passes the local product gates. Version `0.1.2` is ready to tag. Release publication, static deployment, clean-clone claim checks, and live browser checks are the remaining work in this repair session.

## Repairs made

- Made every browser claim command build and serve its own production preview after `npm ci`.
- Added outcome-based coverage for local OCR and copy, offline operation, request privacy, capture disposal, keyboard capture and selection, recovery paths, cleanup output, language packs, licensing, demo isolation, and the Linux installer.
- Released capture memory on success, cancellation, and decode failure. Corrupt images now return to the app with a visible recovery message.
- Added a visible browser-to-desktop license transfer after checkout return and verified the paid gate through the app's restore field.
- Made the Linux installer create `~/.local/bin/screen-text-drop`, verify its checksum, set executable mode, and run from a clean home.
- Fixed mobile legal-page accessible names, 44 by 44 pixel targets, radio/tab keyboard behavior, route metadata, social assets, first-screen facts, and footer identity.
- Corrected bundled OCR data sizes and enabled Reqwest's `query` feature so the Rust license-verification command compiles.

## Local verification

```sh
npm ci
npm test
npm run lint
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --manifest-path src-tauri/Cargo.toml
npm run tauri -- build --bundles deb
```

- `npm test`: 9 unit/integration checks and 22 browser checks passed; 10 duplicate mobile claim runs were intentionally skipped.
- `npm run lint`: passed.
- `npm run build`: produced `dist/app` and `dist/site`; site entry JavaScript is 2.43 KB gzip and CSS is 4.19 KB gzip.
- Rust tests/checks: passed after installing the same Linux prerequisites declared by the release workflow.
- Local Debian bundle: built as version `0.1.2`, extracted into a clean consumer directory, and stayed running under Xvfb until the smoke-test timeout.

## Release identity

The implementation SHA, final release assets, deployment identity, Lighthouse results, and clean-clone claim results will be recorded here after the tag and deployment complete. Historical verification remains in `verification-1.md` and `verification-2.md`.

## Operator action

The builds are unsigned. macOS notarization needs `APPLE_CERTIFICATE` and related Apple signing values. Windows Authenticode needs `WINDOWS_CERT_PFX` and its password. No signing credentials were added to this repository.
