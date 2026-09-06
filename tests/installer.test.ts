import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('consumer installer', () => {
  it.runIf(process.platform === 'linux')('@claim:linux-installer creates and runs a checksum-verified AppImage command in a clean home', () => {
    const output = execFileSync('sh', ['scripts/test-installer.sh'], { encoding: 'utf8' });
    expect(output).toContain('installed Screen Text Drop');
    expect(output).toContain('Linux installer created an executable');
  });
});
