import React from 'react';
import { getAirlineBySlug } from '../data/airlines';

interface AirlineLogoProps {
  airlineSlug: string;
  airlineCode: string;
  size?: 'sm' | 'md';
}

export const AirlineLogo: React.FC<AirlineLogoProps> = ({
  airlineSlug,
  airlineCode,
  size = 'md',
}) => {
  const info = getAirlineBySlug(airlineSlug);
  const bg = info?.colorHex ?? '#0B1F3A';
  const accent = info?.accentHex ?? '#0EA5E9';
  const dim = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-xs';

  return (
    <div
      className={`${dim} relative shrink-0 overflow-hidden rounded-lg flex items-center justify-center font-mono-tabular font-semibold text-white border border-black/10 dark:border-white/10`}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        className="absolute inset-0 h-full w-full opacity-90"
        fill="none"
      >
        <path d="M24 40L40 8V40H24Z" fill={accent} fillOpacity="0.85" />
      </svg>
      <span className="relative z-10 tracking-tight">{airlineCode}</span>
    </div>
  );
};
