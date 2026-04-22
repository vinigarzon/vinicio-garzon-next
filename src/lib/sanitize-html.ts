/**
 * Aggressive HTML sanitizer for blog content.
 * Removes ALL inline styles that override theme colors.
 * Specifically targets ChatGPT, Google Docs, Word paste artifacts.
 */
export function sanitizeContent(html: string): string {
  if (!html) return html;
  let clean = html;

  // 1. Strip ALL style attributes completely from ALL tags
  //    This is the nuclear option — removes every inline style
  clean = clean.replace(/\s+style\s*=\s*"[^"]*"/gi, '');
  clean = clean.replace(/\s+style\s*=\s*'[^']*'/gi, '');

  // 2. Strip class attributes (often carry color classes from external tools)
  clean = clean.replace(/\s+class\s*=\s*"[^"]*"/gi, '');
  clean = clean.replace(/\s+class\s*=\s*'[^']*'/gi, '');

  // 3. Remove data-* attributes
  clean = clean.replace(/\s+data-[a-z][a-z0-9-]*\s*=\s*["'][^"']*["']/gi, '');

  // 4. Remove empty spans
  clean = clean.replace(/<span>\s*<\/span>/gi, '');
  clean = clean.replace(/<span\s*\/>/gi, '');

  // 5. Remove Word/MSO junk
  clean = clean.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '');
  clean = clean.replace(/<\/?o:[^>]*>/gi, '');
  clean = clean.replace(/<\/?w:[^>]*>/gi, '');
  clean = clean.replace(/<\/?m:[^>]*>/gi, '');

  // 6. Remove font tags
  clean = clean.replace(/<font[^>]*>/gi, '');
  clean = clean.replace(/<\/font>/gi, '');

  // 7. Normalize whitespace
  clean = clean.replace(/\u00a0/g, ' '); // non-breaking spaces
  clean = clean.replace(/\n{3,}/g, '\n\n');

  return clean.trim();
}
