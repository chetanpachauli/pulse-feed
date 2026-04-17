'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebouncedProgress } from '~/hooks/useDebouncedProgress';

// Helper function to validate if a YouTube thumbnail URL is likely to work
const getValidThumbnailUrl = (thumbnailUrl?: string): string => {
  if (!thumbnailUrl) return 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&q=80';
  
  // Check if it's a YouTube thumbnail with a dummy video ID
  if (thumbnailUrl.includes('i.ytimg.com/vi/')) {
    const videoId = thumbnailUrl.match(/\/vi\/([^\/]+)/)?.[1];
    if (videoId && (
      // These are our dummy/fake video IDs that will 404
      ['w8b9c0e1r2', 'b3c6d7e8f9', 'n4RkEJ2_3A', 'x7w9_7zO7s', 'e6f9g0h1i2', 
       'mG0oU9wHzk', '7TTTFSvhmkY', '30LWjhZ6Z64', 'dGcsHMXbSOA', 'Ke90Tje7VS0',
       'SccSCuHhbcM', 'W6NZfCO5SIk', 'bMknfKXIFA8', 'vLnPwxZdW4Y', 'l9Bf2rqP5c',
       'k8Wn7r3s2t', 'q3J4t5v6w7', 'r6e7y8u9i0', 's8t9y0u1i2', 't1v2w3x4y5',
       'u6i7o8p9q0', 'v3a4s5d6f7', 'w8b9c0e1r2', 'x9c1d2f3g4', 'y0d3e4f5g6',
       'z1f4g5h6j7', 'a2b5c6d7e8', 'c4d7e8f9g0', 'd5e8f9g0h1', 'f7g0h1i2j3',
       'g8h1i2j3k4', 'h9i2j3k4l5', 'i0j3k4l5m6', 'j1k4l5m6n7', 'k2l5m6n7o8',
       'hQAiq6dI620', 'pKd0Rhp7o4', 'ToLypwVgYmw', '80hYKDtUGts', 'gAXbB_4BavE',
       'jwwwiGzb6R8', 'hdI2bqOjy3c', 'ZIITFSvhmkY', 'OSKHF0fep98', '5QzzeYHApV0',
       'AG1AzZoE1hs', 'ysEN5RaKO', 'sEAyggVL9tw', '4WjtQjPQGIs', 'erEgovG9WBs',
       'GxmfcnU3feo', 'QaU6gEtOwyE'].includes(videoId)
    )) {
      return 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&q=80';
    }
  }
  
  return thumbnailUrl;
};

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasError, setHasError] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { debouncedUpdate, cancelPendingUpdate } = useDebouncedProgress(
    contentId,
    userId,
    async (contentId, userId, lastPosition, isCompleted) => {
      try {
        const { updateProgress } = await import('~/actions/content');
        await updateProgress(contentId, userId, lastPosition, isCompleted);
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (initialProgress?.lastPosition) {
      video.currentTime = initialProgress.lastPosition;
    }

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      const duration = Math.floor(video.duration);
      const isCompleted = currentTime >= duration * 0.9;
      debouncedUpdate(currentTime, isCompleted);
    };

    const handleEnded = () => {
      debouncedUpdate(Math.floor(video.duration), true);
    };

    const handlePause = () => {
      cancelPendingUpdate();
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

  const handleVideoError = () => {
    console.error('Video failed to load for URL:', videoUrl);
    setHasError(true);
  };

  const handleIframeError = () => {
    console.error('YouTube iframe failed to load for URL:', videoUrl);
    setHasError(true);
  };

  const handlePlayClick = () => {
    setShowPlayOverlay(false);
    setIsPlaying(true);
  };

  const isYouTubeVideo = videoUrl && videoUrl.includes('youtube.com/embed/');
  
  // If no videoUrl, show thumbnail with message
  if (!videoUrl) {
    const validThumbnailUrl = getValidThumbnailUrl(thumbnailUrl);
    
    return (
      <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <img 
          src={validThumbnailUrl} 
          alt="Video thumbnail" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-300">Preview not available</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with thumbnail fallback
  if (hasError) {
    const validThumbnailUrl = getValidThumbnailUrl(thumbnailUrl);
    
    return (
      <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <img 
          src={validThumbnailUrl} 
          alt="Video thumbnail" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300">Video unavailable</p>
          </div>
        </div>
      </div>
    );
  }

  // YouTube video with play overlay
  if (isYouTubeVideo) {
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
        {/* Thumbnail background */}
        {showPlayOverlay && (() => {
          const validThumbnailUrl = getValidThumbnailUrl(thumbnailUrl);
          return (
            <img 
              src={validThumbnailUrl} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover"
            />
          );
        })()}
        
        {/* Play overlay */}
        {showPlayOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer"
               onClick={handlePlayClick}>
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center mb-4 hover:bg-opacity-100 transition-all">
                <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-sm font-medium drop-shadow-lg">Click to play</p>
            </div>
          </div>
        )}
        
        {/* YouTube iframe */}
        {isPlaying && (
          <iframe
            ref={iframeRef}
            key={`${contentId}-${videoUrl}`}
            src={videoUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
            onError={handleIframeError}
          />
        )}
      </div>
    );
  }

  // Direct video with video tag
  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
      {showPlayOverlay && (() => {
        const validThumbnailUrl = getValidThumbnailUrl(thumbnailUrl);
        return (
          <img 
            src={validThumbnailUrl} 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
          />
        );
      })()}
      
      {/* Play overlay for direct video */}
      {showPlayOverlay && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer"
             onClick={handlePlayClick}>
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center mb-4 hover:bg-opacity-100 transition-all">
              <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p className="text-sm font-medium drop-shadow-lg">Click to play</p>
          </div>
        </div>
      )}
      
      {isPlaying && (
        <video
          key={`${contentId}-${videoUrl}`}
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay={false}
          muted={false}
          className="w-full h-full object-cover"
          preload="metadata"
          playsInline
          onError={handleVideoError}
        />
      )}
    </div>
  );
}
