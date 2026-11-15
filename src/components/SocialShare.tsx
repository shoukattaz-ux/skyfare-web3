import React, { useState } from 'react';
import { Check, Copy, Mail, Share2 } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  title,
  url,
  description = '',
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : 'https://skyfareusa.com');

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(`${title}\n\n${description}\n${shareUrl}`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard fallback if restricted
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch {
        // user dismissed
      }
    }
  };

  const btnCls =
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500/60 hover:text-[#0B1F3A] dark:hover:text-white transition-colors';

  return (
    <div
      aria-label="Share this page"
      className="flex flex-wrap items-center gap-2 py-3 border-y border-slate-200 dark:border-slate-800"
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Share</span>
      </span>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnCls}
      >
        X / Twitter
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnCls}
      >
        Facebook
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnCls}
      >
        LinkedIn
      </a>

      <a href={`mailto:?subject=${encodedTitle}&body=${encodedBody}`} className={btnCls}>
        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Email</span>
      </a>

      <button type="button" onClick={handleCopy} className={`${btnCls} cursor-pointer`}>
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button type="button" onClick={handleNativeShare} className={`${btnCls} cursor-pointer sm:hidden`}>
          More...
        </button>
      )}
    </div>
  );
};
