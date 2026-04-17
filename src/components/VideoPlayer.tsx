'use client';

import { useEffect, useRef } from 'react';
import { useDebouncedProgress } from '~/hooks/useDebouncedProgress';

interface VideoPlayerProps {
  contentId: string;
  userId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  initialProgress?: {
    lastPosition: number;
    isCompleted: boolean;
  };
}

export function VideoPlayer({ contentId, userId, videoUrl, thumbnailUrl, initialProgress }: VideoPlayerProps) {
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

  // Debug videoUrl from props
  console.log('VideoPlayer received videoUrl:', videoUrl);

  const handleVideoError = () => {
    console.error('Video failed to load for URL:', videoUrl);
    // No fallback - just log the error
  };

  // Check if videoUrl is a YouTube embed URL
  const isYouTubeVideo = videoUrl && videoUrl.includes('youtube.com/embed/');
  
  // If no videoUrl, show "No Video Available" message
  if (!videoUrl) {
    return (
      <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center text-white">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">No Video Available</p>
        </div>
      </div>
    );
  }

  // Render YouTube video using iframe
  if (isYouTubeVideo) {
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
        {/* Video type indicator for debugging */}
        <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          YouTube Video
        </div>
        
        <iframe
          key={`${contentId}-${videoUrl}`} // Force re-render when URL or content changes
          src={videoUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
          onLoad={() => console.log('YouTube iframe loaded')}
          onError={() => console.error('YouTube iframe failed to load')}
        />
      </div>
    );
  }

  // Render direct video using video tag
  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
      {/* Video URL indicator for debugging */}
      <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        Direct Video
      </div>
      
      <video
        key={`${contentId}-${videoUrl}`} // Force re-render when URL or content changes
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
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
