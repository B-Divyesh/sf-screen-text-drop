import './styles.css';
import { asMarkdown, cleanText, type Preset } from './presets';
import { cachedLicenseState, captureReturnedLicense, saveLicense, verifyLicense } from './license';
import { recognizeImage } from './ocr';

type Point = { x: number; y: number };
const isTauri = '__TAURI_INTERNALS__' in window;
const app = document.querySelector<HTMLDivElement>('#app')!;
let preset: Preset = 'paragraph';
let markdown = false;
let pro = cachedLicenseState().unlocked;
let sourceImage = '';
let start: Point | null = null;
let end: Point | null = null;

app.innerHTML = `
  <header class="app-header">
    <a class="wordmark" href="#main" aria-label="Screen Text Drop home">
      <span class="mark" aria-hidden="true"><i></i></span>
      <span>Screen Text Drop</span>
    </a>
    <span class="local-badge"><span aria-hidden="true">●</span> Local only</span>
  </header>
  <main id="main" tabindex="-1">
    <section class="workbench" aria-labelledby="app-title">
      <div class="eyebrow">One hotkey · no upload</div>
      <h1 id="app-title">Take the text.<br><em>Leave the pixels.</em></h1>
      <p class="intro">Choose any region of your screen. Text is read on this device, cleaned, and ready to paste.</p>
      <div class="primary-actions">
        <button class="capture-button" id="capture" type="button">
          <span>Capture region</span><kbd>${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} ⇧ 2</kbd>
        </button>
        <label class="import-button" for="image-file">Use an image</label>
        <input class="visually-hidden" id="image-file" type="file" accept="image/png,image/jpeg,image/webp" />
      </div>
      <p class="hint">Tip: paste a screenshot here with ${navigator.platform.includes('Mac') ? '⌘V' : 'Ctrl+V'}.</p>
    </section>

    <section class="output-panel" aria-labelledby="result-title">
      <div class="panel-heading">
        <div><span class="step">02 / RESULT</span><h2 id="result-title">Text drop</h2></div>
        <span class="status" id="status"><span aria-hidden="true">●</span> Ready offline</span>
      </div>
      <div class="preset-row">
        <div>
          <span class="control-label" id="cleanup-label">Clean up as</span>
          <div class="segments" role="radiogroup" aria-labelledby="cleanup-label">
            <button type="button" role="radio" aria-checked="true" data-preset="paragraph">Paragraph</button>
            <button type="button" role="radio" aria-checked="false" data-preset="code">Code <small>Pro</small></button>
            <button type="button" role="radio" aria-checked="false" data-preset="table">Table <small>Pro</small></button>
          </div>
        </div>
        <label class="switch-row"><input id="markdown" type="checkbox" /> Markdown <small>Pro</small></label>
      </div>
      <div class="result-wrap">
        <textarea id="result" aria-label="Extracted text" spellcheck="false" placeholder="Your local text will land here…"></textarea>
        <div class="empty-note" id="empty-note"><span class="empty-mark" aria-hidden="true">⌗</span><b>Nothing captured yet</b><span>Press the hotkey or import a screenshot.</span></div>
      </div>
      <div class="output-actions">
        <label class="language-label" for="language">OCR language
          <select id="language">
            <option value="eng">English · 4.1 MB</option>
            <option value="spa">Spanish · Pro · 2.2 MB</option>
            <option value="deu">German · Pro · 4.1 MB</option>
          </select>
        </label>
        <button id="copy" class="copy-button" type="button" disabled>Copy text</button>
      </div>
      <div class="progress-shell" id="progress-shell" hidden><span id="progress-bar"></span></div>
      <p class="live" id="live" aria-live="polite"></p>
    </section>

    <section class="privacy-note" aria-label="Privacy promise">
      <span class="shield" aria-hidden="true">◇</span>
      <div><strong>No screenshot history. No network OCR.</strong><br><span>Pixels stay in memory only until text is produced, then they are discarded.</span></div>
      <button type="button" id="license-open">${pro ? 'Pro unlocked' : 'Unlock Pro'}</button>
    </section>
  </main>

  <div class="capture-layer" id="capture-layer" hidden>
    <img id="capture-image" alt="Your captured screen; drag to select a text region" draggable="false" />
    <div class="capture-shade" aria-hidden="true"></div>
    <div class="selection" id="selection" aria-hidden="true"></div>
    <div class="capture-instructions"><strong>Drag around the text</strong><span>Esc to cancel · Enter to read selection</span></div>
  </div>

  <dialog id="license-dialog" aria-labelledby="license-title">
    <form method="dialog" class="dialog-card">
      <button class="dialog-close" value="cancel" aria-label="Close license window">×</button>
      <span class="step">ONE-TIME LICENSE</span>
      <h2 id="license-title">Sharper cleanup, still local.</h2>
      <p>Unlock code and table cleanup, Markdown output, and Spanish/German language packs for <strong>$12 once</strong>.</p>
      <a class="buy-button" href="https://api.sociobot.in/api/v1/products/screen-text-drop/checkout">Buy Screen Text Drop Pro</a>
      <label for="license-token">Have a license? Paste it</label>
      <div class="restore-row"><input id="license-token" autocomplete="off" /><button type="button" id="restore">Verify</button></div>
      <p id="license-status" aria-live="polite"></p>
      <p class="legal-note">Sociobot/Dodo is the merchant of record. Refunds revoke the license automatically. <a href="https://screen-text-drop.sociobot.in/privacy">Privacy</a> · <a href="https://screen-text-drop.sociobot.in/terms">Terms</a></p>
    </form>
  </dialog>`;

const result = document.querySelector<HTMLTextAreaElement>('#result')!;
const live = document.querySelector<HTMLParagraphElement>('#live')!;
const status = document.querySelector<HTMLSpanElement>('#status')!;
const empty = document.querySelector<HTMLDivElement>('#empty-note')!;
const copy = document.querySelector<HTMLButtonElement>('#copy')!;
const progressShell = document.querySelector<HTMLDivElement>('#progress-shell')!;
const progress = document.querySelector<HTMLSpanElement>('#progress-bar')!;
const layer = document.querySelector<HTMLDivElement>('#capture-layer')!;
const captureImage = document.querySelector<HTMLImageElement>('#capture-image')!;
const selection = document.querySelector<HTMLDivElement>('#selection')!;

function announce(message: string, kind: 'ready' | 'working' | 'error' = 'ready') {
  live.textContent = message;
  status.className = `status ${kind}`;
  status.innerHTML = `<span aria-hidden="true">●</span> ${message}`;
}

function setOutput(text: string) {
  result.value = text;
  empty.hidden = Boolean(text);
  copy.disabled = !text;
}

async function cropAndRead() {
  if (!start || !end || !sourceImage) return;
  const left = Math.min(start.x, end.x), top = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x), height = Math.abs(end.y - start.y);
  if (width < 12 || height < 12) { announce('Selection is too small. Drag a larger region.', 'error'); return; }
  const image = new Image();
  image.src = sourceImage;
  await image.decode();
  const scaleX = image.naturalWidth / window.innerWidth;
  const scaleY = image.naturalHeight / window.innerHeight;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scaleX);
  canvas.height = Math.round(height * scaleY);
  canvas.getContext('2d')!.drawImage(image, left * scaleX, top * scaleY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  await closeCapture();
  progressShell.hidden = false;
  progress.style.width = '4%';
  announce('Reading locally…', 'working');
  try {
    const language = document.querySelector<HTMLSelectElement>('#language')!.value;
    const raw = await recognizeImage(canvas.toDataURL('image/png'), language, (value) => progress.style.width = `${Math.max(4, value * 100)}%`);
    sourceImage = '';
    const cleaned = cleanText(raw, preset);
    setOutput(cleaned);
    announce(cleaned ? 'Text ready' : 'No text found — try a tighter, higher-contrast region.', cleaned ? 'ready' : 'error');
  } catch (error) {
    announce(`OCR could not start. ${error instanceof Error ? error.message : 'Try another image.'}`, 'error');
  } finally {
    progressShell.hidden = true;
  }
}

async function openCapture(dataUrl: string) {
  sourceImage = dataUrl;
  start = end = null;
  selection.style.display = 'none';
  captureImage.src = dataUrl;
  layer.hidden = false;
  if (isTauri) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().setFullscreen(true);
  }
  layer.focus();
}

async function closeCapture() {
  layer.hidden = true;
  if (isTauri) {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().setFullscreen(false);
  }
}

async function captureScreen() {
  if (!isTauri) {
    document.querySelector<HTMLInputElement>('#image-file')!.click();
    announce('Browser preview: choose a screenshot. Installed app capture uses the hotkey.', 'working');
    return;
  }
  announce('Waiting for screen permission…', 'working');
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().hide();
    await new Promise((resolve) => setTimeout(resolve, 220));
    const dataUrl = await invoke<string>('capture_primary_screen');
    await getCurrentWindow().show();
    await openCapture(dataUrl);
  } catch {
    if (isTauri) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().show();
    }
    announce('Screen access was blocked. Allow Screen Recording in system settings, or use an image.', 'error');
  }
}

document.querySelector('#capture')!.addEventListener('click', captureScreen);
document.querySelector<HTMLInputElement>('#image-file')!.addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) await openCapture(URL.createObjectURL(file));
});
window.addEventListener('paste', async (event) => {
  const image = [...(event.clipboardData?.files ?? [])].find((file) => file.type.startsWith('image/'));
  if (image) await openCapture(URL.createObjectURL(image));
});

layer.tabIndex = -1;
layer.addEventListener('pointerdown', (event) => {
  start = end = { x: event.clientX, y: event.clientY };
  selection.style.display = 'block';
  selection.style.left = `${start.x}px`; selection.style.top = `${start.y}px`;
  selection.style.width = selection.style.height = '0';
  layer.setPointerCapture(event.pointerId);
});
layer.addEventListener('pointermove', (event) => {
  if (!start) return;
  end = { x: event.clientX, y: event.clientY };
  selection.style.left = `${Math.min(start.x, end.x)}px`;
  selection.style.top = `${Math.min(start.y, end.y)}px`;
  selection.style.width = `${Math.abs(end.x - start.x)}px`;
  selection.style.height = `${Math.abs(end.y - start.y)}px`;
});
layer.addEventListener('pointerup', (event) => { if (start) { end = { x: event.clientX, y: event.clientY }; void cropAndRead(); } });
window.addEventListener('keydown', (event) => {
  if (!layer.hidden && event.key === 'Escape') { void closeCapture(); announce('Capture cancelled.'); }
  if (!layer.hidden && event.key === 'Enter') void cropAndRead();
});

document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => button.addEventListener('click', () => {
  const next = button.dataset.preset as Preset;
  if (next !== 'paragraph' && !pro) { (document.querySelector('#license-dialog') as HTMLDialogElement).showModal(); return; }
  preset = next;
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((item) => item.setAttribute('aria-checked', String(item === button)));
}));

document.querySelector<HTMLInputElement>('#markdown')!.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement;
  if (input.checked && !pro) { input.checked = false; (document.querySelector('#license-dialog') as HTMLDialogElement).showModal(); }
  markdown = input.checked;
});
document.querySelector<HTMLSelectElement>('#language')!.addEventListener('change', (event) => {
  const select = event.target as HTMLSelectElement;
  if (select.value !== 'eng' && !pro) { select.value = 'eng'; (document.querySelector('#license-dialog') as HTMLDialogElement).showModal(); }
});
copy.addEventListener('click', async () => {
  const text = markdown ? asMarkdown(result.value, preset) : result.value;
  try {
    if (isTauri) {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('copy_text', { text });
    } else await navigator.clipboard.writeText(text);
    announce('Copied to clipboard');
    copy.textContent = 'Copied'; setTimeout(() => copy.textContent = 'Copy text', 1400);
  } catch { announce('Clipboard access was blocked. Select the text and copy manually.', 'error'); }
});

const dialog = document.querySelector<HTMLDialogElement>('#license-dialog')!;
document.querySelector('#license-open')!.addEventListener('click', () => dialog.showModal());
document.querySelector('#restore')!.addEventListener('click', async () => {
  const token = document.querySelector<HTMLInputElement>('#license-token')!.value;
  const message = document.querySelector<HTMLParagraphElement>('#license-status')!;
  if (!token.trim()) { message.textContent = 'Paste a license token first.'; return; }
  saveLicense(token); message.textContent = 'Checking license…';
  const state = await verifyLicense(true); pro = state.unlocked;
  message.textContent = pro ? 'Pro is unlocked on this device.' : state.notice ?? 'That license could not be verified.';
});

captureReturnedLicense();
void verifyLicense().then((state) => { pro = state.unlocked; if (state.notice) announce(state.notice, 'error'); });
if (isTauri) {
  void import('@tauri-apps/api/event').then(({ listen }) => listen('capture-requested', captureScreen));
  document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((anchor) => anchor.addEventListener('click', async (event) => {
    event.preventDefault();
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(anchor.href);
  }));
}
