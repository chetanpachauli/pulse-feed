'use client';

import { useEffect, useRef } from 'react';
import { useDebouncedProgress } from '~/hooks/useDebouncedProgress';

interface VideoPlayerProps {
  contentId: string;
  userId: string;
  videoUrl?: string;
  initialProgress?: {
    lastPosition: number;
    isCompleted: boolean;
  };
}

export function VideoPlayer({ contentId, userId, videoUrl, initialProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { debouncedUpdate, cancelPendingUpdate } = useDebouncedProgress(
    contentId,
    userId,
    async (contentId, userId, lastPosition, isCompleted) => {
      try {
        // This would call your server action
        const { updateProgress } = await import('~/actions/content');
        await updateProgress(contentId, userId, lastPosition, isCompleted);
      } catch (error) {
        console.error('Failed to update progress:', error);
        // Don't throw the error to prevent breaking the video player
      }
    }
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial position
    if (initialProgress?.lastPosition) {
      video.currentTime = initialProgress.lastPosition;
    }

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);
      const isCompleted = currentTime >= duration * 0.9; // Consider 90% as completed

      debouncedUpdate(currentTime, isCompleted);
    };

    const handleEnded = () => {
      debouncedUpdate(Math.floor(video.duration), true);
    };

    const handlePause = () => {
      // Cancel pending update when user pauses
      cancelPendingUpdate();
      // Immediately update current position
      if (video.currentTime) {
        debouncedUpdate(Math.floor(video.currentTime), false);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', handlePause);
      cancelPendingUpdate();
    };
  }, [contentId, userId, initialProgress, debouncedUpdate, cancelPendingUpdate]);

  // Use: videoUrl from database or fallback to reliable sample MP4
  const getVideoUrl = () => {
    // Use only the most reliable video URLs that won't be blocked
    const fallbackUrls = [
      'https://w3schools.com/html/mov_bbb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ];
    
    // Always use fallback for now to ensure videos work
    const finalUrl = videoUrl && videoUrl.startsWith('http') 
      ? videoUrl 
      : fallbackUrls[0]; // Always use first fallback to avoid blocked URLs
    
    console.log('Using video URL:', finalUrl);
    return finalUrl;
  };

  const handleVideoError = () => {
    console.error('Video failed to load, trying fallback...');
    // Try a different video URL on error
    const video = videoRef.current;
    if (video) {
      const fallbackUrls = [
        'https://w3schools.com/html/mov_bbb.mp4',
        'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
      ];
      const newSrc = fallbackUrls[0]; // Always use first fallback
      video.src = newSrc;
      console.log('Switched to fallback URL:', newSrc);
    }
  };

  const videoSrc = getVideoUrl();

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
      {/* Video URL indicator for debugging */}
      <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {videoUrl ? 'Database Video' : 'Fallback Video'}
      </div>
      
      <video
        key={`${contentId}-${videoSrc}`} // Force re-render when URL or content changes
        ref={videoRef}
        src={videoSrc}
        controls
        autoPlay={false}
        muted={false}
        className="w-full h-full object-cover"
        preload="metadata"
        playsInline
        onError={handleVideoError}
        onLoadStart={() => console.log('Video loading started...')}
        onCanPlay={() => console.log('Video can play')}
        onLoadedData={() => console.log('Video data loaded')}
      />
    </div>
  );
}
