import React from 'react';

/**
 * A real <a href> that navigates inside the single-page app on a normal click, but keeps
 * working as an ordinary link for crawlers, middle-click, "open in new tab" and no-JS.
 */
interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  href: string;
  onNavigate: (path: string) => void;
  onAfterNavigate?: () => void;
}

export const Link: React.FC<LinkProps> = ({ href, onNavigate, onAfterNavigate, children, ...rest }) => (
  <a
    href={href}
    {...rest}
    onClick={(e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      onNavigate(href);
      onAfterNavigate?.();
    }}
  >
    {children}
  </a>
);
