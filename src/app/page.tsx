'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getContentFeed } from '~/actions/content';
import { ContentCardSkeleton } from '~/components/SkeletonLoader';
import { LikeButton } from '~/components/LikeButton';
import { VideoPlayer } from '~/components/VideoPlayer';
import { BookmarkButton } from '~/components/BookmarkButton';
import { ShareButton } from '~/components/ShareButton';

// Define proper types
interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: 'VIDEO' | 'ARTICLE';
  slug: string;
  viewCount: number;
  videoUrl?: string;
  createdAt: string;
  engagements: Array<{ userId: string; type: string }>;
  _count: {
    engagements: number;
  };
  progress?: {
    lastPosition: number;
    isCompleted: boolean;
  };
}

interface ContentFeedResponse {
  items: ContentItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export default function HomePage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'ALL' | 'VIDEO' | 'ARTICLE'>('ALL');
  const [sortBy, setSortBy] = useState<'LATEST' | 'TRENDING'>('LATEST');
  const [searchQuery, setSearchQuery] = useState('');
  const observerRef = useRef<IntersectionObserver>();
  const lastItemRef = useRef<HTMLDivElement>(null);

  const loadContent = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentCursor = reset ? undefined : cursor || undefined;
      const feed = await getContentFeed(currentCursor, 20);
      
      if (reset) {
        setContent(feed.items);
      } else {
        setContent(prev => {
          const existingIds = new Set(prev.map((item: ContentItem) => item.id));
          const newItems = feed.items.filter((item: ContentItem) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(feed.hasMore);
      setCursor(feed.nextCursor);
    } catch (err) {
      console.error('Failed to load content:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  useEffect(() => {
    loadContent(true);
  }, [contentType, sortBy, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadContent();
        }
      },
      { threshold: 0.1 }
    );

    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }

    return () => {
      if (lastItemRef.current) {
        observer.unobserve(lastItemRef.current);
      }
    };
  }, [hasMore, loading, loadContent]);

  // Ensure no duplicate content items by ID
  const uniqueContent = content.filter((item, index, self) => 
    index === self.findIndex((t) => t.id === item.id)
  );

  const filteredContent = uniqueContent.filter(item => {
    const matchesType = contentType === 'ALL' || item.type === contentType;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    if (sortBy === 'TRENDING') {
      return b.viewCount - a.viewCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">PulseFeed</h1>
        <p className="text-lg text-gray-600 mb-4">High-performance content platform</p>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search content... (sub-10ms search)"
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setContentType('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  contentType === 'ALL'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Content
              </button>
              <button
                onClick={() => setContentType('VIDEO')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  contentType === 'VIDEO'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setContentType('ARTICLE')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  contentType === 'ARTICLE'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Articles
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('LATEST')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'LATEST'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy('TRENDING')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'TRENDING'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Trending
              </button>
            </div>
          </div>
        </div>
      </header>

      {error && content.length === 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 font-medium mb-2">{error}</div>
          <button 
            onClick={() => loadContent(true)}
            className="btn-primary mt-2"
          >
            Try Again
          </button>
        </div>
      ) : sortedContent.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No content found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedContent.map((item, index) => (
            <div
              key={item.id}
              ref={index === sortedContent.length - 1 ? lastItemRef : undefined}
            >
              <ContentCard content={item} />
            </div>
          ))}
          
          {loading && (
            <div className="space-y-6">
              <ContentCardSkeleton />
              <ContentCardSkeleton />
            </div>
          )}
          
          {!hasMore && sortedContent.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of the feed</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ContentCardProps {
  content: ContentItem;
}

function ContentCard({ content }: ContentCardProps) {
  // For demo purposes, we'll use a hardcoded user ID
  // In a real app, this would come from authentication
  const currentUserId = 'demo-user-id';
  const isLiked = content.engagements.some((engagement) => engagement.userId === currentUserId && engagement.type === 'LIKE');
  const likeCount = content.engagements.filter(e => e.type === 'LIKE').length;
  const isBookmarked = content.engagements.some((engagement) => engagement.userId === currentUserId && engagement.type === 'BOOKMARK');
  const bookmarkCount = content.engagements.filter(e => e.type === 'BOOKMARK').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {content.type === 'VIDEO' ? 'V' : 'A'}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {content.type === 'VIDEO' ? 'Video' : 'Article'}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(content.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {content.viewCount} views
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {content.title}
        </h2>
        {content.description && (
          <p className="text-gray-600 mb-4">{content.description}</p>
        )}

        {content.type === 'VIDEO' ? (
          <div>
            {content.progress && !content.progress.isCompleted && (
              <div className="mb-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                Continue watching: {Math.floor(content.progress.lastPosition / 60)}:{(content.progress.lastPosition % 60).toString().padStart(2, '0')}
              </div>
            )}
            <VideoPlayer
              contentId={content.id}
              userId={currentUserId}
              videoUrl={content.videoUrl}
              initialProgress={content.progress}
            />
          </div>
        ) : (
          <div>
            {content.progress && !content.progress.isCompleted && (
              <div className="mb-2 p-2 bg-green-50 rounded text-sm text-green-700">
                Continue reading
              </div>
            )}
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600">Article content would appear here</p>
              <a
                href={`/articles/${content.slug}`}
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Read full article
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <LikeButton
            contentId={content.id}
            userId={currentUserId}
            initialLiked={isLiked}
            initialLikeCount={likeCount}
          />
          
          <BookmarkButton
            contentId={content.id}
            userId={currentUserId}
            initialBookmarked={isBookmarked}
            initialBookmarkCount={bookmarkCount}
          />
          
          <ShareButton 
            slug={content.slug} 
            title={content.title}
          />
        </div>
      </div>
    </div>
  );
}
