import type { TravelGuide } from '../types/flight';

/** A guide must have at least this many words of real content before it can be public. */
export const MIN_PUBLISH_WORDS = 300;

/** Counts the words a reader actually sees (headings, paragraphs, bullets, table cells, FAQs). */
export function countGuideWords(g: Pick<TravelGuide, 'sections' | 'faqs'>): number {
  const parts: string[] = [];
  for (const s of g.sections || []) {
    parts.push(s.heading, ...(s.paragraphs || []), ...(s.bullets || []));
    if (s.table) parts.push(...s.table.headers, ...s.table.rows.flat());
  }
  for (const f of g.faqs || []) parts.push(f.question, f.answer);
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

export const readMinutes = (words: number) => Math.max(1, Math.round(words / 220));
