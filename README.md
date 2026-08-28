# Screen Text Drop

Screen Text Drop is a tiny, privacy-first desktop utility that turns a selected screen region into clean text. Press `Ctrl/Cmd + Shift + 2`, drag around text, choose paragraph/code/table cleanup, then copy plain text or Markdown. Screenshots and OCR never leave the device.

It is for people who regularly retype text from locked PDFs, videos, remote desktops, images, or applications that do not expose selectable text.

## Install

Download the detected installer at [screen-text-drop.sociobot.in](https://screen-text-drop.sociobot.in), or use the verified one-line installer:

```sh
curl -fsSL https://screen-text-drop.sociobot.in/install.sh | sh
```

On Windows PowerShell:

```powershell
irm https://screen-text-drop.sociobot.in/install.ps1 | iex
```

The v1 binaries are unsigned. On macOS, right-click the downloaded app/package and choose **Open**. On Windows, review the publisher warning and choose **Run anyway**. Release checksums are published as `SHA256SUMS` beside every build.

## What ships

- Tauri 2 app for macOS (Apple silicon and Intel), Windows, and Linux
- Native primary-display capture, tray menu, and global hotkey
- Region selection plus screenshot paste/import fallback
- Bundled Tesseract.js WASM and English, Spanish, and German models
- Paragraph, code, and table cleanup; plain text and Markdown copy
- Free tier with English paragraph OCR and copy
- $12 one-time Pro unlock through the Sociobot billing API
- Static product, privacy, and terms pages in `dist/site`

No capture history, telemetry, account, cloud OCR, or background recording is included.

## Develop

Requirements: Node 22+, Rust stable, and the Tauri 2 system prerequisites.

```sh
npm ci
npm run dev          # landing site
npm run dev:app      # app UI in a browser
npm run tauri dev    # complete desktop app
npm test             # unit, build, desktop + 390 px E2E/axe checks
npm run build        # dist/app and deployable dist/site
```

The exact static deployment command is `npm run build:site`; its output root is `dist/site` and contains `index.html`.

Production desktop artifacts are built only by [the release workflow](.github/workflows/release.yml) after a `v*` tag. It builds both macOS architectures, Windows, and Linux, then publishes installers, `SHA256SUMS`, and `latest.json`.

## Privacy and licensing

Capture pixels remain in memory only until OCR completes. License verification sends only the pasted license token to `api.sociobot.in` and is cached for 24 hours. See [Privacy](site/privacy/index.html), [Terms](site/terms/index.html), and [third-party OCR notices](THIRD_PARTY_NOTICES.md).

Source code is MIT licensed. Tesseract components and language data retain their Apache-2.0 licenses.
