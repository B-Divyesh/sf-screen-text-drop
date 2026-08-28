import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const [input = 'release-input', output = 'release-assets', version = '0.1.0', repository = process.env.GITHUB_REPOSITORY ?? 'B-Divyesh/sf-screen-text-drop'] = process.argv.slice(2);
const allowed = /\.(dmg|msi|exe|AppImage|deb)$/i;
const walk = (dir) => readdirSync(dir).flatMap((name) => { const path = join(dir, name); return statSync(path).isDirectory() ? walk(path) : [path]; });
rmSync(output, { recursive: true, force: true }); mkdirSync(output, { recursive: true });
const assets = walk(input).filter((path) => allowed.test(path)).map((source) => {
  const parent = source.toLowerCase();
  let platform = parent.includes('aarch64') && parent.includes('mac') ? 'macos-arm64' : parent.includes('x86_64') && parent.includes('mac') ? 'macos-x64' : parent.includes('windows') || /\.(msi|exe)$/i.test(source) ? 'windows-x64' : 'linux-x64';
  const name = `${platform}-${basename(source).replace(/\s+/g, '-')}`;
  const destination = join(output, name); cpSync(source, destination);
  return { platform, name, sha256: createHash('sha256').update(readFileSync(destination)).digest('hex') };
});
const preferred = (platform) => assets.filter((asset) => asset.platform === platform).sort((a, b) => {
  const score = (name) => /\.dmg$/i.test(name) || /\.msi$/i.test(name) || /\.AppImage$/i.test(name) ? 0 : 1;
  return score(a.name) - score(b.name);
})[0];
const base = `https://github.com/${repository}/releases/download/v${version}`;
const platforms = Object.fromEntries(['macos-arm64', 'macos-x64', 'windows-x64', 'linux-x64'].map((key) => {
  const asset = preferred(key); if (!asset) throw new Error(`Missing release asset for ${key}`);
  return [key, { name: asset.name, url: `${base}/${encodeURIComponent(asset.name)}`, sha256: asset.sha256 }];
}));
writeFileSync(join(output, 'SHA256SUMS'), assets.map((asset) => `${asset.sha256}  ${asset.name}`).join('\n') + '\n');
writeFileSync(join(output, 'latest.json'), JSON.stringify({ version, published_at: new Date().toISOString(), platforms }, null, 2) + '\n');
