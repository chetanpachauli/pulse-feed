'use client';

import { useCallback, useRef } from 'react';

export function useDebouncedProgress(
  contentId: string,
  userId: string,
  updateProgress: (contentId: string, userId: string, lastPosition: number, isCompleted: boolean) => Promise<void>,
  delay: number = 10000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<number>(0);

  const debouncedUpdate = useCallback(
    (position: number, isCompleted: boolean = false) => {
      lastPositionRef.current = position;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          await updateProgress(contentId, userId, lastPositionRef.current, isCompleted);
        } catch (error) {
          console.error('Failed to update progress:', error);
        }
      }, delay);
    },
    [contentId, userId, updateProgress, delay]
  );

  const cancelPendingUpdate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    debouncedUpdate,
    cancelPendingUpdate,
  };
}
