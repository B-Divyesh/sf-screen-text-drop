const KEY = 'sb_license:screen-text-drop';
const VERDICT_KEY = `${KEY}:verdict`;
const API = 'https://api.sociobot.in/api/v1/products/screen-text-drop';
const isTauri = '__TAURI_INTERNALS__' in window;

export type LicenseState = { unlocked: boolean; notice?: string };

export function captureReturnedLicense(): string | null {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('license');
  if (!token) return localStorage.getItem(KEY);
  localStorage.setItem(KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', url.pathname + url.search + url.hash);
  return token;
}

export function saveLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedLicenseState(): LicenseState {
  const token = localStorage.getItem(KEY);
  if (!token) return { unlocked: false };
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null');
    return { unlocked: cached?.valid === true };
  } catch {
    return { unlocked: false };
  }
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(KEY);
  if (!token) return { unlocked: false };
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null');
    if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) {
      return { unlocked: cached.valid === true };
    }
  } catch { /* verify again */ }
  try {
    const verdict = isTauri
      ? await import('@tauri-apps/api/core').then(({ invoke }) => invoke<{ valid: boolean }>('verify_license', { token }))
      : await fetch(`${API}/verify?license=${encodeURIComponent(token)}`).then(async (response) => {
        if (!response.ok) throw new Error('verification unavailable');
        return response.json() as Promise<{ valid: boolean }>;
      });
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }));
    return verdict.valid
      ? { unlocked: true }
      : { unlocked: false, notice: 'License no longer active. Your free tools still work.' };
  } catch {
    return cachedLicenseState();
  }
}
