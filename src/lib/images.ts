import hero1280 from '../assets/images/hero-1280.webp';
import hero720 from '../assets/images/hero-720.webp';
import nyc1280 from '../assets/images/nyc-1280.webp';
import nyc720 from '../assets/images/nyc-720.webp';
import cancun1280 from '../assets/images/cancun-1280.webp';
import cancun720 from '../assets/images/cancun-720.webp';
import tokyo1280 from '../assets/images/tokyo-1280.webp';
import tokyo720 from '../assets/images/tokyo-720.webp';
import paris1280 from '../assets/images/paris-1280.webp';
import paris720 from '../assets/images/paris-720.webp';
import terminal1280 from '../assets/images/terminal-1280.webp';
import terminal720 from '../assets/images/terminal-720.webp';
import type { ImageKey } from '../types/flight';

// Optimised WebP renditions (720w for cards, 1280w for hero/article). Originals are kept in design-assets/original.
const FILES: Record<ImageKey, { w720: string; w1280: string; alt: string }> = {
  hero: { w720: hero720, w1280: hero1280, alt: 'Wing of a passenger aircraft above clouds at golden hour' },
  nyc: { w720: nyc720, w1280: nyc1280, alt: 'Manhattan skyline at twilight' },
  cancun: { w720: cancun720, w1280: cancun1280, alt: 'Turquoise Caribbean water and a white-sand beach' },
  tokyo: { w720: tokyo720, w1280: tokyo1280, alt: 'Tokyo skyline at twilight' },
  paris: { w720: paris720, w1280: paris1280, alt: 'Paris rooftops in morning light' },
  terminal: { w720: terminal720, w1280: terminal1280, alt: 'Airport departure concourse at sunrise' },
};

export const IMAGE_MAP: Record<ImageKey, string> = Object.fromEntries(
  (Object.keys(FILES) as ImageKey[]).map((k) => [k, FILES[k].w720])
) as Record<ImageKey, string>;

/** Card-size image. */
export function getImageSrc(key: ImageKey): string {
  return (FILES[key] || FILES.terminal).w720;
}

/** Large image (hero, article header). */
export function getLargeImageSrc(key: ImageKey): string {
  return (FILES[key] || FILES.terminal).w1280;
}

/** Responsive attributes for an <img>. */
export function getImageSet(key: ImageKey): { src: string; srcSet: string; sizes: string } {
  const f = FILES[key] || FILES.terminal;
  return { src: f.w720, srcSet: `${f.w720} 720w, ${f.w1280} 1280w`, sizes: '(min-width: 1024px) 800px, 100vw' };
}

/** Honest alt text describing the picture itself (not the page title). */
export function getImageAlt(key: ImageKey): string {
  return (FILES[key] || FILES.terminal).alt;
}
