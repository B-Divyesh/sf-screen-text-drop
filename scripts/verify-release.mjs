import { createHash } from 'node:crypto';

const version = process.argv[2];
const expectedCommit = process.argv[3];
if (!/^\d+\.\d+\.\d+$/.test(version ?? '') || !/^[0-9a-f]{40}$/.test(expectedCommit ?? '')) {
  throw new Error('usage: node scripts/verify-release.mjs VERSION EXPECTED_COMMIT_SHA');
}

const repositoryApi = 'https://api.github.com/repos/B-Divyesh/sf-screen-text-drop';
const releaseBase = `https://github.com/B-Divyesh/sf-screen-text-drop/releases/download/v${version}`;
const get = async (url) => {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response;
};

const release = await (await get(`${repositoryApi}/releases/tags/v${version}`)).json();
if (release.draft || release.prerelease) throw new Error('release is not a published stable release');

let tagObject = await (await get(`${repositoryApi}/git/ref/tags/v${version}`)).json();
if (tagObject.object.type === 'tag') {
  tagObject = await (await get(`${repositoryApi}/git/tags/${tagObject.object.sha}`)).json();
}
if (tagObject.object.type !== 'commit' || tagObject.object.sha !== expectedCommit) {
  throw new Error(`v${version} resolves to ${tagObject.object.sha}, not ${expectedCommit}`);
}

const names = release.assets.map((asset) => asset.name);
for (const [label, pattern] of [
  ['macOS arm64 DMG', /^macos-arm64-.*\.dmg$/i],
  ['macOS x64 DMG', /^macos-x64-.*\.dmg$/i],
  ['Windows MSI', /^windows-x64-.*\.msi$/i],
  ['Windows EXE', /^windows-x64-.*\.exe$/i],
  ['Linux AppImage', /^linux-x64-.*\.AppImage$/i],
  ['Linux DEB', /^linux-x64-.*\.deb$/i],
  ['checksum list', /^SHA256SUMS$/],
  ['download manifest', /^latest\.json$/],
]) {
  if (!names.some((name) => pattern.test(name))) throw new Error(`missing ${label}`);
}

const [manifestResponse, sumsResponse] = await Promise.all([
  get(`${releaseBase}/latest.json`),
  get(`${releaseBase}/SHA256SUMS`),
]);
const manifest = await manifestResponse.json();
const sumsText = await sumsResponse.text();
const sums = new Map(sumsText.trim().split('\n').map((line) => {
  const match = line.match(/^([0-9a-f]{64})  (.+)$/);
  if (!match) throw new Error(`invalid SHA256SUMS line: ${line}`);
  return [match[2], match[1]];
}));

if (manifest.version !== version) throw new Error(`manifest version is ${manifest.version}`);
for (const platform of ['macos-arm64', 'macos-x64', 'windows-x64', 'linux-x64']) {
  const asset = manifest.platforms?.[platform];
  if (!asset || !names.includes(asset.name)) throw new Error(`manifest has no published ${platform} asset`);
  if (asset.url !== `${releaseBase}/${encodeURIComponent(asset.name)}`) throw new Error(`${platform} URL is not version-pinned`);
  if (sums.get(asset.name) !== asset.sha256) throw new Error(`${platform} checksum differs between manifest and SHA256SUMS`);
}

const downloadable = release.assets
  .filter((asset) => /\.(deb|msi|dmg)$/i.test(asset.name))
  .sort((left, right) => left.size - right.size)[0];
if (!downloadable) throw new Error('no installer is available for checksum verification');
const bytes = Buffer.from(await (await get(downloadable.browser_download_url)).arrayBuffer());
const actual = createHash('sha256').update(bytes).digest('hex');
if (actual !== sums.get(downloadable.name)) throw new Error(`${downloadable.name} checksum does not match`);

console.log(`Verified v${version} at ${expectedCommit}: ${names.length} assets; ${downloadable.name} (${bytes.length} bytes) matched SHA256SUMS.`);
