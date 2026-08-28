# Screen Text Drop — visual thesis

## Direction

**Night-market neon signage, interpreted as a precise capture instrument.** Screen Text Drop lives in the instant between seeing a useful fragment and carrying it away. The visual system borrows the deep ink, electric sign tubes, paper tickets, and taped crop marks of a late-night market—not its visual clutter. Cyan brackets identify what is being captured; warm marigold marks the single next action; magenta is a sparing signal for Pro. The product should feel private, fast, and awake after every cloud tool has gone dark.

This is deliberately a single dark treatment. A bright theme would break the night-market metaphor and make the full-screen capture surface harder to distinguish from the source screen. High-contrast text and non-color state labels preserve clarity.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--ink-950` | `#070A12` | page and app background |
| `--ink-900` | `#0D1220` | raised surface |
| `--ink-800` | `#171E30` | controls and dividers |
| `--paper` | `#F5F1DF` | primary text, 17.1:1 on ink-950 |
| `--paper-muted` | `#B9C1C9` | secondary text, 10.4:1 on ink-950 |
| `--cyan` | `#57F1E3` | crop brackets, focus, success; 14.4:1 on ink-950 |
| `--marigold` | `#FFC857` | primary action; ink text is 12.8:1 |
| `--magenta` | `#FF5DAE` | Pro and selection accents, never body copy |
| `--danger` | `#FF7A78` | errors with icon/label, 7.4:1 on ink-950 |

Surfaces are opaque. No glassmorphism and no broad gradients. A subtle code-authored noise field and one generated environmental scene provide material texture.

## Type

- **Display:** `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, system sans-serif. Tall condensed caps echo stacked market signs without downloading a font.
- **Interface/body:** `Inter`, `Aptos`, `Segoe UI`, system sans-serif. The stack is local, quick, and clear.
- **Extracted text/code:** `ui-monospace`, `SFMono-Regular`, `Cascadia Code`, `Consolas`, monospace.
- Scale: 14 / 16 / 20 / 28 / 44 / clamp(52–88) px. Body is never below 16 px. Long copy stays within 68 characters.

## Spacing and shape

- 4 px base rhythm; common steps: 8, 12, 16, 24, 32, 48, 72, 96.
- Shell max width 1180 px. Reading measure 68ch.
- Corners are clipped, ticket-like polygons rather than generic rounded cards. Controls use 8 px radii only where their hit area needs a familiar shape.
- 1 px ink-800 rules establish layers; cyan crop-corner marks explain capture and recur in the logo, hero, and app selection surface.
- All touch targets are at least 44 × 44 px with 8 px separation.

## Interaction grammar

- The primary verb is always **Capture region**; the keyboard shortcut is displayed beside it.
- Capture progresses through a visible three-state rail: choose → read locally → copy. Loading, offline-ready, permission error, empty OCR, and copied states each name what happened and the next step.
- Segmented presets change the shape of output (paragraph, code, table), not hidden settings. Arrow keys move within each segment group.
- The app begins usable in the free tier: paragraph cleanup, English OCR, plain copy, and image import. Pro unlocks code/table cleanup, Markdown output, and additional bundled language packs.
- Mobile landing layout drops the decorative ticker and stacks the platform actions. The desktop-only capture tool is explained, never faked in the browser.

## Motion

- 180–240 ms transitions; only opacity and transform animate.
- Crop brackets enter from their geometric corners once. The capture progress marker advances from left to right. Button presses move 1 px, then return.
- Nothing loops. The marquee is a static typographic strip, not an animated ticker.
- Under `prefers-reduced-motion: reduce`, all transforms and smooth scrolling are removed and state changes are immediate; hierarchy remains through borders, scale, and labels.

## Asset plan and provenance

- `assets/src/hero-night-market.png`: original AI-generated editorial night-market scene, used to establish the product world—not as evidence of app output.
- `site/public/assets/hero-night-market.webp`: optimized responsive source, ≤300 KB.
- Logo, crop marks, platform icons, privacy shield, and workflow diagrams are hand-authored inline SVG/CSS. No stock icons or third-party visual assets.

### Prompt sheet

- **Subject:** an empty midnight street-side market booth transformed into an abstract screen-capture workbench; a luminous rectangular crop frame isolating crisp paper fragments and code-like geometric strips; no people.
- **World/materials:** dark painted steel, rain-damp pavement, rice-paper receipts, brushed aluminum, small glass neon tubes, subtle analog grain.
- **Light/lens:** cinematic 35 mm environmental view, high-angle three-quarter framing, cyan edge light, marigold practical light, very small magenta accent, deep ink shadows.
- **Palette words:** midnight ink, electric cyan, receipt cream, marigold amber, pinprick magenta.
- **Negative list:** no legible text, letters, logos, brands, UI screenshots, people, faces, hands, surveillance cameras, watermarks, cyberpunk city clichés, excessive glow, purple-blue gradient fog.
- **Production prompt:** “Use case: stylized-concept. Asset type: wide landing-page editorial hero. An empty midnight street-side market booth becomes a precise screen-capture workbench. A luminous rectangular crop frame isolates a few crisp cream paper fragments and abstract code-like geometric strips above a dark work surface. Dark painted steel, rain-damp pavement, brushed aluminum, rice paper, small glass neon tubes, restrained analog grain. Cinematic 35mm high-angle three-quarter environmental composition with useful dark negative space around the central crop frame. Cyan edge light, warm marigold practical light, one tiny magenta accent, deep near-black ink shadows. Sophisticated editorial realism, tactile and calm, privacy and focus rather than surveillance. No people, faces, hands, cameras, legible text, letters, logos, brands, watermarks, UI screenshots, purple-blue gradient fog, or excessive neon. No text, no watermark, no logos.”
- **Generator:** Azure AI Foundry factory image deployment via `/opt/fleet/lib/gen-image.sh`.
- **Date/license:** 2026-08-28; original generated asset commissioned for Screen Text Drop, project use under the repository MIT license.

## Accessibility rationale

Primary text and every actionable outline exceed WCAG AA contrast on their actual surfaces. Color is paired with labels/icons. Focus uses a 3 px cyan outer ring plus a dark offset. Decorative imagery has empty alt text; explanatory images receive concise alternatives. One h1 per page, ordered headings, skip links, live regions, and reduced-motion handling are part of the visual system rather than after-market fixes.
