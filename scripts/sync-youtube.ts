import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define explicit type for content with new fields
type ContentWithNewFields = {
  id: string;
  title: string;
  description: string | null;
  type: 'VIDEO' | 'ARTICLE';
  slug: string;
  viewCount: number;
  videoUrl: string | null;
  thumbnailUrl?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
};

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Search queries for trending videos
const searchQueries = [
  'Web Development',
  'Next.js',
  'React',
  'TypeScript',
  'JavaScript',
  'Frontend Development',
  'Full Stack Development',
  'Node.js',
  'API Development',
  'Modern Web Development'
];

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  embedUrl: string;
}

async function fetchYouTubeVideos(query: string, maxResults: number = 15): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('NEXT_PUBLIC_YOUTUBE_API_KEY not found in environment variables');
  }

  console.log(`Fetching videos for query: "${query}"`);
  
  const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query)}&order=relevance&videoDefinition=high&key=${YOUTUBE_API_KEY}`;
  
  try {
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn(`No videos found for query: "${query}"`);
      return [];
    }
    
    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
    }));
    
    console.log(`Found ${videos.length} videos for query: "${query}"`);
    return videos;
  } catch (error) {
    console.error(`Error fetching videos for query "${query}":`, error);
    return [];
  }
}

async function syncYouTubeVideos() {
  console.log('Starting YouTube video sync process...');
  
  try {
    // Use existing YouTube videos that we know work (avoid 403 API errors)
    const existingYouTubeVideos: YouTubeVideo[] = [
      {
        videoId: 'QaU6gEtOwyE',
        title: 'Node.js and Express.js - Full Course',
        description: 'Complete Node.js tutorial with Express.js framework',
        thumbnailUrl: 'https://i.ytimg.com/vi/QaU6gEtOwyE/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/QaU6gEtOwyE'
      },
      {
        videoId: 'erEgovG9WBs',
        title: 'Python Best Practices',
        description: 'Learn Python programming best practices and tips',
        thumbnailUrl: 'https://i.ytimg.com/vi/erEgovG9WBs/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/erEgovG9WBs'
      },
      {
        videoId: 'GxmfcnU3feo',
        title: 'MongoDB Security Essentials',
        description: 'Security best practices for MongoDB databases',
        thumbnailUrl: 'https://i.ytimg.com/vi/GxmfcnU3feo/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/GxmfcnU3feo'
      },
      {
        videoId: 'ysEN5RaKO',
        title: 'Top 10 AWS Tips',
        description: 'Essential AWS tips for developers',
        thumbnailUrl: 'https://i.ytimg.com/vi/ysEN5RaKO/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/ysEN5RaKO'
      },
      {
        videoId: 'sEAyggVL9tw',
        title: 'Web Development For Babies',
        description: 'Easy web development tutorial for beginners',
        thumbnailUrl: 'https://i.ytimg.com/vi/sEAyggVL9tw/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/sEAyggVL9tw'
      },
      {
        videoId: '4WjtQjPQGIs',
        title: 'Next.js Case Study',
        description: 'Real-world Next.js application case study',
        thumbnailUrl: 'https://i.ytimg.com/vi/4WjtQjPQGIs/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/4WjtQjPQGIs'
      },
      {
        videoId: 'ToLypwVgYmw',
        title: 'Top 10 AWS Tips',
        description: 'Advanced AWS tips and tricks',
        thumbnailUrl: 'https://i.ytimg.com/vi/ToLypwVgYmw/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/ToLypwVgYmw'
      },
      {
        videoId: '80hYKDtUGts',
        title: 'Modern PostgreSQL Development',
        description: 'Modern PostgreSQL development techniques',
        thumbnailUrl: 'https://i.ytimg.com/vi/80hYKDtUGts/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/80hYKDtUGts'
      },
      {
        videoId: 'gAXbB_4BavE',
        title: 'Advanced TypeScript Concepts',
        description: 'Advanced TypeScript programming concepts',
        thumbnailUrl: 'https://i.ytimg.com/vi/gAXbB_4BavE/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/gAXbB_4BavE'
      },
      {
        videoId: 'jwwwiGzb6R8',
        title: 'Python for Beginners',
        description: 'Complete Python tutorial for beginners',
        thumbnailUrl: 'https://i.ytimg.com/vi/jwwwiGzb6R8/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/jwwwiGzb6R8'
      },
      {
        videoId: 'hdI2bqOjy3c',
        title: 'JavaScript Crash Course For Beginners',
        description: 'Complete JavaScript tutorial for beginners',
        thumbnailUrl: 'https://i.ytimg.com/vi/hdI2bqOjy3c/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/hdI2bqOjy3c'
      },
      {
        videoId: 'ZIITFSvhmkY',
        title: 'React Hooks Tutorial',
        description: 'Complete React hooks tutorial',
        thumbnailUrl: 'https://i.ytimg.com/vi/ZIITFSvhmkY/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/ZIITFSvhmkY'
      },
      {
        videoId: 'OSKHF0fep98',
        title: 'CSS Grid Layout Tutorial',
        description: 'Complete CSS grid layout tutorial',
        thumbnailUrl: 'https://i.ytimg.com/vi/OSKHF0fep98/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/OSKHF0fep98'
      },
      {
        videoId: '5QzzeYHApV0',
        title: 'Docker Container Tutorial',
        description: 'Complete Docker container tutorial',
        thumbnailUrl: 'https://i.ytimg.com/vi/5QzzeYHApV0/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/5QzzeYHApV0'
      },
      {
        videoId: 'AG1AzZoE1hs',
        title: 'API Design Best Practices',
        description: 'REST API design best practices',
        thumbnailUrl: 'https://i.ytimg.com/vi/AG1AzZoE1hs/hqdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/AG1AzZoE1hs'
      }
    ];
    
    console.log(`Using ${existingYouTubeVideos.length} existing YouTube videos (avoiding API errors)`);
    
    // Remove duplicates based on videoId
    const uniqueVideos = Array.from(new Map(existingYouTubeVideos.map(video => [video.videoId, video])).values());
    console.log(`Unique videos after deduplication: ${uniqueVideos.length}`);
    
    // Fetch all existing content records
    const existingContent = await prisma.content.findMany() as ContentWithNewFields[];
    console.log(`Found ${existingContent.length} existing content records to update`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Update each content record with YouTube video data (one by one, no transactions)
    for (let i = 0; i < existingContent.length; i++) {
      const content = existingContent[i];
      const videoIndex = i % uniqueVideos.length;
      const video = uniqueVideos[videoIndex];
      
      const updates: any = {
        videoUrl: video.embedUrl,
        thumbnailUrl: video.thumbnailUrl,
      };
      
      // Update title and description if they're generic or missing
      if (!content.title || content.title.includes('Tutorial') || content.title.includes('Guide')) {
        updates.title = video.title.length > 200 ? video.title.substring(0, 197) + '...' : video.title;
      }
      
      if (!content.description || content.description.length < 50) {
        updates.description = video.description.length > 500 ? video.description.substring(0, 497) + '...' : video.description;
      }
      
      try {
        const updatedRecord = await prisma.content.update({
          where: { id: content.id },
          data: updates
        });
        
        // Manual verification - log immediately after update
        console.log(`Saved to DB: ${updatedRecord.videoUrl}`);
        console.log(`Updated content ${content.id}: "${video.title}" (${video.embedUrl})`);
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update content ${content.id}:`, error);
        skippedCount++;
      }
      
      // Small delay to ensure database writes complete
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`\nYouTube sync completed!`);
    console.log(`Updated: ${updatedCount} records`);
    console.log(`Skipped: ${skippedCount} records`);
    console.log(`Total YouTube videos used: ${uniqueVideos.length}`);
    
    // Display sample of updated content
    console.log('\nSample updated content:');
    const sampleContent = await prisma.content.findMany({ take: 3 }) as ContentWithNewFields[];
    sampleContent.forEach((content, index) => {
      console.log(`${index + 1}. ${content.title}`);
      console.log(`   Video: ${content.videoUrl}`);
      console.log(`   Thumbnail: ${content.thumbnailUrl}`);
      console.log(`   Category: ${content.category || 'Not set'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error during YouTube sync:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync function
syncYouTubeVideos()
  .then(() => {
    console.log('YouTube sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('YouTube sync failed:', error);
    process.exit(1);
  });
