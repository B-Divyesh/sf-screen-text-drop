# Screen Text Drop verification 3 handoff — FAIL

Independent verification is complete. The detailed report is in [.factory/verification-3.md](verification-3.md).

## Result

**FAIL: 5 findings, 0 untested claims.** Product code was not changed.

- Blocker: the installed v0.1.2 Linux app accepts a real `Ctrl+Shift+2` capture but stays at **Reading locally…** for more than 170 seconds.
- High: **Copy text** reports success in the installed Linux app while a separate X11/DBus consumer reads an empty clipboard.
- High: the relevant claim commands exercise Chromium preview branches rather than the packaged Tauri/WebKit and Rust clipboard paths.
- Medium: the live demo crushes its supplied sample to 58 px on desktop and horizontally overflows at 1024 px.
- Low: the Privacy contact link is 164.2×19 px on desktop, below the required 44 px target height.

## Versions reviewed

- Desktop implementation: `3b4947c234cab52834e6a49374213dcd4946da54`
- Release: `v0.1.2` at `2263f50a1fd900f84f84b85ec1d844f74457a81b`
- Live-site implementation: `565edb161c674c968abbe0548b2ea4444baacbc9`
- Documentation baseline before this report: `51118c414c0984acf8018985a5d349b3fc68421b`
- Live URL: https://screen-text-drop.sociobot.in/

Live HTML, CSS, JavaScript, and service-worker hashes match the clean local build. Desktop app source does not differ between `3b4947c` and the release tag.

## Checks completed

- All 16 exact claim commands passed from a fresh clone after only `npm ci`.
- `npm test`, `npm run lint`, audit, build, Rust formatting, and Rust tests passed.
- Desktop and phone live routes had zero serious/critical Axe findings and no console errors.
- Lighthouse scored 100 in all four categories; LCP was 1.1 s and CLS was 0.
- Demo isolation, reset, exit, same-origin traffic, offline reload, route titles, links, legal pages, response headers, and deliberate 404 passed.
- The license API returned 429 on request 31 with `Retry-After: 4`.
- The public AppImage checksum matched; it launched, loaded sample data, and its native shortcut opened the region selector.

## Evidence

- Report copy: `/work/.evidence/qa-report.md`
- Machine result: `/work/.evidence/qa-result.json`
- Live screenshots: `/work/.evidence/live-desktop-landing.png`, `/work/.evidence/live-phone-landing.png`, `/work/.evidence/live-demo-populated.png`, `/work/.evidence/live-demo-1024.png`
- Installed app: `/work/.evidence/installed-app-first-run.png`, `/work/.evidence/installed-app-sample.png`, `/work/.evidence/installed-app-copied.png`, `/work/.evidence/installed-native-hotkey.png`, `/work/.evidence/installed-native-ocr-late.png`
- Lighthouse JSON: `/work/.evidence/lighthouse.json`

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

## Operator action still needed

macOS notarization and Windows Authenticode remain blocked on the owner's signing certificates (`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their related passwords). Do not sign or release another version until the five verification findings are repaired and the packaged-app checks pass.
