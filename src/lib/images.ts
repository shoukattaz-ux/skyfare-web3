import heroImg from '../assets/images/hero_aviation_golden_1794654946988.jpg';
import nycImg from '../assets/images/dest_nyc_skyline_1794654946629.jpg';
import cancunImg from '../assets/images/dest_cancun_turquoise_1794654948466.jpg';
import tokyoImg from '../assets/images/dest_tokyo_twilight_1794654947914.jpg';
import parisImg from '../assets/images/dest_paris_morning_1794654949801.jpg';
import terminalImg from '../assets/images/guide_terminal_sunrise_1794654949193.jpg';
import type { ImageKey } from '../types/flight';

export const IMAGE_MAP: Record<ImageKey, string> = {
  hero: heroImg,
  nyc: nycImg,
  cancun: cancunImg,
  tokyo: tokyoImg,
  paris: parisImg,
  terminal: terminalImg,
};

export function getImageSrc(key: ImageKey): string {
  return IMAGE_MAP[key] || terminalImg;
}
