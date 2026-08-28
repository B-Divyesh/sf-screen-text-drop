# Screen Text Drop demo

Open [the demo](/demo/) or `https://screen-text-drop.sociobot.in/demo/`. The landing-page **Try it with sample data** action reaches the same workspace in one click.

The sample is a realistic support handoff about preserving a query string. It supplies paragraph, code, and table cleanup results so a visitor can change a mode and copy a result immediately. It never uses a visitor capture.

The demo writes only `demo:screen-text-drop:sample` in browser local storage. It never reads or writes the desktop app license key (`sb_license:screen-text-drop`) or any real-app data. **Reset demo** removes the demo key and restores the paragraph sample. **Start for real** returns home, and the installed desktop app also offers **Load sample project** on its first screen.

After the first online visit, the service worker caches `/demo/` and its local assets. The `@claim:demo-offline` browser test verifies an offline reload from a fresh browser context.
