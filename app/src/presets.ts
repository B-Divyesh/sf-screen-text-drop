export type Preset = 'paragraph' | 'code' | 'table';

export function cleanText(raw: string, preset: Preset): string {
  const normalized = raw.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim();
  if (!normalized) return '';
  if (preset === 'code') {
    return normalized
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/^[•·]\s?/gm, '- ');
  }
  if (preset === 'table') {
    return normalized
      .split('\n')
      .filter(Boolean)
      .map((line) => line.trim().split(/\s{2,}|\t+/).join('\t'))
      .join('\n');
  }
  return normalized
    .replace(/-\n(?=\p{Ll})/gu, '')
    .replace(/(?<![.!?:;])\n(?!\n|[-*#>])/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ');
}

export function asMarkdown(text: string, preset: Preset): string {
  if (preset === 'code') return `\`\`\`\n${text}\n\`\`\``;
  if (preset === 'table') {
    const rows = text.split('\n').map((row) => row.split('\t'));
    const width = Math.max(...rows.map((row) => row.length));
    const padded = rows.map((row) => [...row, ...Array(width - row.length).fill('')]);
    if (!padded.length) return '';
    return [padded[0], Array(width).fill('---'), ...padded.slice(1)]
      .map((row) => `| ${row.join(' | ')} |`)
      .join('\n');
  }
  return text;
}
