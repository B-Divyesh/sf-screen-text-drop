import './styles.css';

const releaseBase = 'https://github.com/B-Divyesh/sf-screen-text-drop/releases/latest';
const demoKey = 'demo:screen-text-drop:sample';
const demoText: Record<string, string> = {
  paragraph: 'The route parser strips the utm_source value. Keep the query string when you copy the support link.',
  code: 'const cleanLink = keepQueryString(supportLink);\nclipboard.writeText(cleanLink);',
  table: 'Item\tOwner\tStatus\nSupport link\tMina\tKeep query string',
};

function platformKey(): 'macos-arm64' | 'macos-x64' | 'windows-x64' | 'linux-x64' {
  const value = ((navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform ?? navigator.platform ?? '').toLowerCase();
  const arm = /arm|aarch64/.test(value);
  if (/mac/.test(value)) return arm ? 'macos-arm64' : 'macos-x64';
  if (/win/.test(value)) return 'windows-x64';
  return 'linux-x64';
}

async function resolveDownload() {
  const button = document.querySelector<HTMLAnchorElement>('#platform-download');
  if (!button) return;
  const key = platformKey();
  const names: Record<string, string> = { 'macos-arm64': 'macOS (Apple silicon)', 'macos-x64': 'macOS (Intel)', 'windows-x64': 'Windows', 'linux-x64': 'Linux' };
  const platformName = document.querySelector('#platform-name');
  if (platformName) platformName.textContent = names[key];
  if (['localhost', '127.0.0.1'].includes(location.hostname)) return;
  try {
    const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-screen-text-drop/releases/latest', { cache: 'no-store' });
    if (!response.ok) throw new Error('release lookup failed');
    const release = await response.json() as { tag_name: string; assets: { name: string; browser_download_url: string }[] };
    const patterns: Record<string, RegExp> = { 'macos-arm64': /^macos-arm64-.*\.dmg$/i, 'macos-x64': /^macos-x64-.*\.dmg$/i, 'windows-x64': /^windows-x64-.*\.msi$/i, 'linux-x64': /^linux-x64-.*\.AppImage$/i };
    const asset = release.assets.find((item) => patterns[key].test(item.name));
    if (!asset) throw new Error('matching asset unavailable');
    button.href = asset.browser_download_url;
    const note = document.querySelector('#release-note');
    if (note) note.textContent = `Version ${release.tag_name.replace(/^v/, '')} · unsigned build · checksum published`;
  } catch {
    button.href = releaseBase;
    const note = document.querySelector('#release-note');
    if (note) note.textContent = 'Downloads are being published. Open the release page.';
  }
}

function setupDemo() {
  const output = document.querySelector<HTMLElement>('#demo-output');
  if (!output) return;
  const feedback = document.querySelector<HTMLElement>('#demo-feedback');
  const state = document.querySelector<HTMLElement>('#demo-state');
  const render = (kind = 'paragraph') => {
    output.textContent = demoText[kind];
    localStorage.setItem(demoKey, kind);
    document.querySelectorAll<HTMLButtonElement>('[data-demo]').forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.demo === kind)));
  };
  render(localStorage.getItem(demoKey) ?? 'paragraph');
  document.querySelectorAll<HTMLButtonElement>('[data-demo]').forEach((button) => button.addEventListener('click', () => render(button.dataset.demo ?? 'paragraph')));
  document.querySelector<HTMLButtonElement>('#reset-demo')?.addEventListener('click', () => {
    localStorage.removeItem(demoKey);
    render();
    if (feedback) feedback.textContent = 'Sample reset. Your app data was not touched.';
    if (state) state.textContent = '● Reset';
  });
  document.querySelector<HTMLButtonElement>('#demo-copy')?.addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText(output.textContent ?? '');
      (event.currentTarget as HTMLButtonElement).textContent = 'Copied sample text';
      if (feedback) feedback.textContent = 'Sample text copied.';
    } catch {
      if (feedback) feedback.textContent = 'Select the sample text and copy it.';
    }
  });
}

function setupRestoreDialog() {
  const dialog = document.querySelector<HTMLDialogElement>('#restore-dialog');
  document.querySelector('#restore-open')?.addEventListener('click', () => dialog?.showModal());
  document.querySelector('#verify-license')?.addEventListener('click', async () => {
    const token = document.querySelector<HTMLInputElement>('#license-token')?.value.trim() ?? '';
    const message = document.querySelector<HTMLElement>('#license-message');
    if (!token) { if (message) message.textContent = 'Paste a license token first.'; return; }
    if (message) message.textContent = 'Checking…';
    try {
      const response = await fetch(`https://api.sociobot.in/api/v1/products/screen-text-drop/verify?license=${encodeURIComponent(token)}`);
      const verdict = await response.json() as { valid: boolean };
      if (!response.ok || !verdict.valid) throw new Error('invalid license');
      localStorage.setItem('sb_license:screen-text-drop', token);
      localStorage.setItem('sb_license:screen-text-drop:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
      if (message) message.textContent = 'License saved. Open the app to use Pro.';
    } catch {
      if (message) message.textContent = 'That license could not be verified. Check the token and try again.';
    }
  });
  const queryLicense = new URL(location.href).searchParams.get('license');
  if (queryLicense) {
    localStorage.setItem('sb_license:screen-text-drop', queryLicense);
    history.replaceState({}, '', location.pathname);
    dialog?.showModal();
  }
}

void resolveDownload();
setupDemo();
setupRestoreDialog();
if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js');
