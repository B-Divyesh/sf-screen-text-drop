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
  vi.stubGlobal('window', { __TAURI_INTERNALS__: tauri ? {} : undefined, location: { href: 'http://tauri.localhost/' } });
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
});
