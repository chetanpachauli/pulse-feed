'use client';

import { useState } from 'react';
import { toggleBookmark } from '~/actions/content';

interface BookmarkButtonProps {
  contentId: string;
  userId: string;
  initialBookmarked?: boolean;
  initialBookmarkCount?: number;
}

export function BookmarkButton({ 
  contentId, 
  userId, 
  initialBookmarked = false,
  initialBookmarkCount = 0
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic UI update
    const newBookmarkedState = !bookmarked;
    setBookmarked(newBookmarkedState);
    setBookmarkCount(prev => newBookmarkedState ? prev + 1 : prev - 1);
    
    try {
      const result = await toggleBookmark(contentId, userId);
      // Update with actual count from server
      if (result.bookmarkCount !== undefined) {
        setBookmarkCount(result.bookmarkCount);
      }
      // Handle server error gracefully
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      // Revert on error
      setBookmarked(!newBookmarkedState);
      setBookmarkCount(prev => newBookmarkedState ? prev - 1 : prev + 1);
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`btn-secondary flex items-center gap-2 transition-colors ${
        bookmarked ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-600 hover:text-gray-700'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg 
        className="w-5 h-5" 
        fill={bookmarked ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      {bookmarkCount > 0 && (
        <span className="text-sm text-gray-500">({bookmarkCount})</span>
      )}
    </button>
  );
}
