/**
 * Minimal, safe markdown for CMS-managed pages.
 * Supports: "## " and "### " headings, "- " lists, paragraphs, **bold**, `code`, [text](url).
 * Raw HTML is never interpreted: everything is escaped (server) or rendered as React text (client).
 */

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'code'; v: string }
  | { t: 'link'; v: string; href: string };

export type Block =
  | { t: 'h2' | 'h3'; inline: Inline[] }
  | { t: 'p'; inline: Inline[] }
  | { t: 'ul'; items: Inline[][] };

export interface SiteTokens {
  siteName?: string;
  supportEmail?: string;
  publisherName?: string;
  companyAddress?: string;
}

export function fillTokens(text: string, tokens: SiteTokens): string {
  const siteName = tokens.siteName || 'SkyFare';
  const email = tokens.supportEmail || '';
  const publisherLine = tokens.publisherName
    ? `${siteName} is published by ${tokens.publisherName}${tokens.companyAddress ? `, ${tokens.companyAddress}` : ''}.`
    : `${siteName} is an independent publication. You can reach whoever runs it through the contact details on this site.`;
  return text
    .replace(/\{\{siteName\}\}/g, siteName)
    .replace(/\{\{supportEmail\}\}/g, email || 'the contact form')
    .replace(/\{\{publisherLine\}\}/g, publisherLine);
}

const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i;

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ t: 'text', v: src.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: 'bold', v: m[1] });
    else if (m[2] !== undefined) out.push({ t: 'code', v: m[2] });
    else if (SAFE_HREF.test(m[4])) out.push({ t: 'link', v: m[3], href: m[4] });
    else out.push({ t: 'text', v: m[3] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ t: 'text', v: src.slice(last) });
  return out;
}

export function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const chunks = md.replace(/\r\n/g, '\n').split(/\n{2,}/);
  for (const raw of chunks) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const lines = chunk.split('\n');
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => {
      if (para.length) blocks.push({ t: 'p', inline: parseInline(para.join(' ')) });
      para = [];
    };
    const flushList = () => {
      if (list.length) blocks.push({ t: 'ul', items: list.map(parseInline) });
      list = [];
    };
    for (const line of lines) {
      const l = line.trimEnd();
      const h = /^(#{2,3})\s+(.*)$/.exec(l);
      if (h) {
        flushPara();
        flushList();
        blocks.push({ t: h[1].length === 2 ? 'h2' : 'h3', inline: parseInline(h[2]) });
      } else if (/^[-*]\s+/.test(l)) {
        flushPara();
        list.push(l.replace(/^[-*]\s+/, ''));
      } else if (l.trim() === '') {
        flushPara();
        flushList();
      } else {
        flushList();
        para.push(l.trim());
      }
    }
    flushPara();
    flushList();
  }
  return blocks;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineToHtml(parts: Inline[]): string {
  return parts
    .map((p) => {
      if (p.t === 'bold') return `<strong>${escapeHtml(p.v)}</strong>`;
      if (p.t === 'code') return `<code>${escapeHtml(p.v)}</code>`;
      if (p.t === 'link') return `<a href="${escapeHtml(p.href)}">${escapeHtml(p.v)}</a>`;
      return escapeHtml(p.v);
    })
    .join('');
}

export function markdownToHtml(md: string): string {
  return parseMarkdown(md)
    .map((b) => {
      if (b.t === 'ul') return `<ul>${b.items.map((i) => `<li>${inlineToHtml(i)}</li>`).join('')}</ul>`;
      return `<${b.t}>${inlineToHtml(b.inline)}</${b.t}>`;
    })
    .join('\n');
}
