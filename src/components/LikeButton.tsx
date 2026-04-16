'use client';

import { useState, useTransition } from 'react';
import { toggleLike } from '~/actions/content';

interface LikeButtonProps {
  contentId: string;
  userId: string;
  initialLiked: boolean;
  initialLikeCount: number;
}

export function LikeButton({ contentId, userId, initialLiked, initialLikeCount }: LikeButtonProps) {
  // Local state for immediate UI feedback
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const handleLike = async () => {
    if (isPending) return;

    // 1. UI ko turant update karo
    const nextLikedState = !isLiked;
    setIsLiked(nextLikedState);
    setLikeCount((prev) => (nextLikedState ? prev + 1 : prev - 1));

    // 2. Server action ko background mein chalao
    startTransition(async () => {
      try {
        const result = await toggleLike(contentId, userId);
        
        if (result.error) {
          // Error aaye toh wapas purani state par le jao
          setIsLiked(!nextLikedState);
          setLikeCount((prev) => (!nextLikedState ? prev + 1 : prev - 1));
          return;
        }

        // 3. Server se aayi final values set karo
        if (result.liked !== undefined) setIsLiked(result.liked);
        if (result.likeCount !== undefined) setLikeCount(result.likeCount);
        
      } catch (error) {
        console.error('Like toggle failed:', error);
        // Rollback on crash
        setIsLiked(!nextLikedState);
        setLikeCount((prev) => (!nextLikedState ? prev + 1 : prev - 1));
      }
    });
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isLiked
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${isPending ? 'scale-95 opacity-80' : 'scale-100'}`}
      disabled={isPending}
    >
      <svg
        className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current scale-110' : 'stroke-current fill-none'}`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="font-medium">{likeCount}</span>
    </button>
  );
}