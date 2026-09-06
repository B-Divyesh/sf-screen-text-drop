import './styles.css';

const releaseBase = 'https://github.com/B-Divyesh/sf-screen-text-drop/releases/latest';
const releaseApi = 'https://api.github.com/repos/B-Divyesh/sf-screen-text-drop/releases/latest';
const releaseCacheKey = 'screen-text-drop:release';
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
    type Release = { tag_name: string; assets: { name: string; browser_download_url: string }[] };
    type CachedRelease = { checkedAt: number; release: Release };
    let release: Release | null = null;
    try {
      const cached = JSON.parse(localStorage.getItem(releaseCacheKey) ?? 'null') as CachedRelease | null;
      if (cached && Date.now() - cached.checkedAt < 3_600_000) release = cached.release;
    } catch { /* fetch a fresh release */ }
    if (!release) {
      const response = await fetch(releaseApi, { cache: 'no-store' });
      if (!response.ok) throw new Error('release lookup failed');
      release = await response.json() as Release;
      localStorage.setItem(releaseCacheKey, JSON.stringify({ checkedAt: Date.now(), release }));
    }
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
  const isSandbox = Boolean(document.querySelector('#reset-demo'));
  const render = (kind = 'paragraph') => {
    output.textContent = demoText[kind];
    if (isSandbox) localStorage.setItem(demoKey, kind);
    document.querySelectorAll<HTMLButtonElement>('[data-demo]').forEach((tab) => {
      const selected = tab.dataset.demo === kind;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  };
  render(isSandbox ? localStorage.getItem(demoKey) ?? 'paragraph' : 'paragraph');
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-demo]')];
  tabs.forEach((button) => button.addEventListener('click', () => render(button.dataset.demo ?? 'paragraph')));
  document.querySelector('.demo-tabs')?.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent) || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = Math.max(0, tabs.indexOf(document.activeElement as HTMLButtonElement));
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
        : (current + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    render(tabs[nextIndex].dataset.demo ?? 'paragraph');
  });
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
  const input = document.querySelector<HTMLInputElement>('#license-token');
  const message = document.querySelector<HTMLElement>('#license-message');
  const copyButton = document.querySelector<HTMLButtonElement>('#copy-returned-license');
  const showTransfer = (token: string, text: string) => {
    if (input) input.value = token;
    if (copyButton) copyButton.hidden = false;
    if (message) message.textContent = text;
  };
  document.querySelector('#restore-open')?.addEventListener('click', () => dialog?.showModal());
  document.querySelector('#verify-license')?.addEventListener('click', async () => {
    const token = input?.value.trim() ?? '';
    if (!token) { if (message) message.textContent = 'Paste a license token first.'; return; }
    if (message) message.textContent = 'Checking…';
    try {
      const response = await fetch(`https://api.sociobot.in/api/v1/products/screen-text-drop/verify?license=${encodeURIComponent(token)}`);
      const verdict = await response.json() as { valid: boolean };
      if (!response.ok || !verdict.valid) throw new Error('invalid license');
      localStorage.setItem('sb_license:screen-text-drop', token);
      localStorage.setItem('sb_license:screen-text-drop:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
      showTransfer(token, 'License verified. Copy it, open Screen Text Drop, choose Unlock Pro, and paste it there.');
    } catch {
      if (message) message.textContent = 'That license could not be verified. Check the token and try again.';
    }
  });
  copyButton?.addEventListener('click', async () => {
    const token = input?.value.trim() ?? '';
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      if (message) message.textContent = 'License copied. Open Screen Text Drop, choose Unlock Pro, paste it, then select Verify.';
    } catch {
      if (message) message.textContent = 'Select the license above and copy it. Then paste it in the app under Unlock Pro.';
    }
  });
  const queryLicense = new URL(location.href).searchParams.get('license');
  if (queryLicense) {
    localStorage.setItem('sb_license:screen-text-drop', queryLicense);
    const cleanUrl = new URL(location.href);
    cleanUrl.searchParams.delete('license');
    history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
    showTransfer(queryLicense, 'Purchase returned. Copy this license, open Screen Text Drop, choose Unlock Pro, and paste it there.');
    dialog?.showModal();
  }
}

void resolveDownload();
setupDemo();
setupRestoreDialog();
if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js');
