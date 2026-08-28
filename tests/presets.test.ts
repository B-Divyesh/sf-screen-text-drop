import { describe, expect, it } from 'vitest';
import { asMarkdown, cleanText } from '../app/src/presets';

describe('cleanup presets', () => {
  it('repairs paragraph wraps and hyphenation', () => {
    expect(cleanText('A private extrac-\ntion tool\nkeeps pixels local.', 'paragraph'))
      .toBe('A private extraction tool keeps pixels local.');
  });
  it('preserves code lines and repairs smart quotes', () => {
    expect(cleanText('const x = “local”;\n  return x;', 'code')).toBe('const x = "local";\n  return x;');
  });
  it('turns spaced columns into tabs and Markdown', () => {
    const table = cleanText('Name  Size\nEnglish  4 MB', 'table');
    expect(table).toBe('Name\tSize\nEnglish\t4 MB');
    expect(asMarkdown(table, 'table')).toContain('| --- | --- |');
  });
});
