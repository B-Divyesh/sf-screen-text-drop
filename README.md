# Screen Text Drop

Screen Text Drop is a desktop tool for turning a selected screen region into text. It is for people who need to reuse text shown in a PDF, video, remote desktop, image, or non-selectable application.

Try the sample workspace at [screen-text-drop.sociobot.in/demo/](https://screen-text-drop.sociobot.in/demo/). It changes a supplied support handoff between paragraph, code, and table output. The demo uses its own `demo:` browser-storage key. Reset does not change app or license data. The demo works offline after its first visit.

## Install

Download the detected installer at [screen-text-drop.sociobot.in](https://screen-text-drop.sociobot.in), or use the verified one-line installer:

```sh
curl -fsSL https://screen-text-drop.sociobot.in/install.sh | sh
```

On Windows PowerShell:

```powershell
irm https://screen-text-drop.sociobot.in/install.ps1 | iex
```

On Linux, the command verifies the AppImage and installs it as `~/.local/bin/screen-text-drop`. On macOS, it creates `~/Downloads` when needed and saves the verified package there.

The v1 binaries are unsigned. On macOS, right-click the package and choose **Open**. On Windows, review the publisher warning and choose **Run anyway**. Release v0.1.2 publishes `SHA256SUMS` beside the builds.

## What ships

- Tauri 2 app for macOS (Apple silicon and Intel), Windows, and Linux
- Primary-display capture from `Cmd/Ctrl + Shift + 2`
- Region selection plus screenshot paste/import fallback
- Load sample project on the first screen for a safe walkthrough
- Bundled local Tesseract.js OCR with English, Spanish, and German data
- Paragraph, code, and table cleanup; plain text and Markdown copy
- Free tier with English paragraph OCR and copy
- $12 one-time Pro unlock through the Sociobot billing API
- Static product, privacy, and terms pages in `dist/site`

OCR requests only bundled app files. The tested capture flow creates no capture history or telemetry. Capture pixels are discarded after recognition or cancellation.

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

Production desktop artifacts are built only by [the release workflow](.github/workflows/release.yml) after a `v*` tag. It builds both macOS architectures, Windows, and Linux. The publish job creates `SHA256SUMS` and `latest.json`.

## Privacy and licensing

Read the complete [Privacy policy](site/privacy/index.html), [Terms](site/terms/index.html), and [third-party OCR notices](THIRD_PARTY_NOTICES.md). The app verifies a pasted Pro license through the Sociobot billing API; packaged desktop builds perform that request in the Rust core instead of the browser webview.

## Demo and claim checks

The demo entry point, sample, reset behavior, and isolated storage are documented in [.factory/demo.md](.factory/demo.md). Every public product claim and its exact regression command is listed in [.factory/claims.json](.factory/claims.json). Each browser claim command builds its own preview, so it works directly after `npm ci`. Run the complete local suite with `npm test`.

Source code is MIT licensed. Tesseract components and language data retain their Apache-2.0 licenses.
