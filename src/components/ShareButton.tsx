'use client';

import { useState } from 'react';

interface ShareButtonProps {
  slug: string;
  title?: string;
}

export function ShareButton({ slug, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/content/${slug}`;
    const shareTitle = title || 'Check out this content!';

    try {
      // Try Web Share API first (mobile devices)
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // Fallback to clipboard for desktop devices
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error sharing:', error);
      
      // If Web Share API fails, try clipboard as fallback
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      title={copied ? 'Link copied!' : 'Share content'}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {copied ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
            stroke="currentColor"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"
            stroke="currentColor"
          />
        )}
      </svg>
      <span className="font-medium text-sm">
        {copied ? 'Link Copied!' : 'Share'}
      </span>
    </button>
  );
}
