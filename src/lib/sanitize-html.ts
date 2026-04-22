/**
 * Sanitizes HTML content pasted from ChatGPT, Google Docs, Word, etc.
 * Removes inline color, background, font-family styles that cause
 * black text on dark backgrounds.
 */
export function sanitizeContent(html: string): string {
  if (!html) return html;

  // Remove inline style attributes that override theme colors
  // This regex removes specific problematic style properties while preserving structure
  let clean = html;

  // 1. Remove entire style attributes from spans (the main culprit from ChatGPT/Google Docs)
  //    e.g. <span style="color: rgb(0,0,0); font-family: ...">
  clean = clean.replace(/<span\s+style="[^"]*">/gi, '<span>');
  clean = clean.replace(/<span\s+style='[^']*'>/gi, '<span>');

  // 2. Remove style attributes from p, li, div, td that have color/background/font
  const blockTags = ['p', 'li', 'div', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  for (const tag of blockTags) {
    // Remove style attrs that contain color/background/font (keep other styles)
    clean = clean.replace(
      new RegExp(`<${tag}\\s+style="[^"]*(?:color|background|font)[^"]*"`, 'gi'),
      `<${tag}`
    );
  }

  // 3. Remove empty spans left over (e.g. <span></span>)
  clean = clean.replace(/<span>\s*<\/span>/gi, '');

  // 4. Remove ChatGPT-specific classes and data attributes
  clean = clean.replace(/\s+class="[^"]*"/gi, '');
  clean = clean.replace(/\s+data-[a-z-]+=["'][^"']*["']/gi, '');

  // 5. Remove MSO/Word namespace junk
  clean = clean.replace(/<!--\[if[^\]]*\]>.*?<!\[endif\]-->/gis, '');
  clean = clean.replace(/<\/?o:[^>]*>/gi, '');
  clean = clean.replace(/<\/?w:[^>]*>/gi, '');
  clean = clean.replace(/<\/?m:[^>]*>/gi, '');

  // 6. Clean up extra whitespace
  clean = clean.replace(/\n\s*\n\s*\n/g, '\n\n');

  return clean.trim();
}
