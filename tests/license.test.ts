import { beforeEach, describe, expect, it, vi } from 'vitest';

const invoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({ invoke }));

type Store = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };

function installBrowser(tauri: boolean): Store {
  const values = new Map<string, string>();
  const store: Store = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  vi.stubGlobal('localStorage', store);
  const browserWindow: { location: { href: string }; __TAURI_INTERNALS__?: object } = { location: { href: 'http://tauri.localhost/' } };
  if (tauri) browserWindow.__TAURI_INTERNALS__ = {};
  vi.stubGlobal('window', browserWindow);
  vi.stubGlobal('history', { replaceState: vi.fn() });
  return store;
}

describe('license verification transport', () => {
  beforeEach(() => {
    vi.resetModules();
    invoke.mockReset();
  });

  it('routes packaged Tauri license checks through the Rust command, not browser fetch', async () => {
    const store = installBrowser(true);
    store.setItem('sb_license:screen-text-drop', 'desktop-token');
    invoke.mockResolvedValue({ valid: true, reason: 'ok' });
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { verifyLicense } = await import('../app/src/license');

    await expect(verifyLicense(true)).resolves.toEqual({ unlocked: true });
    expect(invoke).toHaveBeenCalledWith('verify_license', { token: 'desktop-token' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reuses a valid daily verdict without making a network request', async () => {
    const store = installBrowser(false);
    store.setItem('sb_license:screen-text-drop', 'cached-token');
    store.setItem('sb_license:screen-text-drop:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { verifyLicense } = await import('../app/src/license');

    await expect(verifyLicense()).resolves.toEqual({ unlocked: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps free tools available after an invalid verdict', async () => {
    const store = installBrowser(false);
    store.setItem('sb_license:screen-text-drop', 'invalid-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ valid: false, reason: 'invalid' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })));
    const { verifyLicense } = await import('../app/src/license');

    await expect(verifyLicense(true)).resolves.toEqual({
      unlocked: false,
      notice: 'License no longer active. Your free tools still work.',
    });
  });

  it('turns a rate limit into an actionable retry message', async () => {
    const store = installBrowser(false);
    store.setItem('sb_license:screen-text-drop', 'limited-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', {
      status: 429,
      headers: { 'Retry-After': '4' },
    })));
    const { verifyLicense } = await import('../app/src/license');

    await expect(verifyLicense(true)).resolves.toEqual({
      unlocked: false,
      notice: 'License verification is unavailable. Try again in 4 seconds.',
    });
  });
});
