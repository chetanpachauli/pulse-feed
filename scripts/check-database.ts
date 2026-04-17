import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('Checking database content...');
  
  try {
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

// Fetch all content records
    const allContent = await prisma.content.findMany() as ContentWithNewFields[];
    
    console.log(`Total content records: ${allContent.length}`);
    
    // Count video types
    let youtubeCount = 0;
    let directCount = 0;
    let noVideoCount = 0;
    let totalCount = 0;
    
    // Sample first 10 records
    const sampleSize = Math.min(10, allContent.length);
    console.log(`\nSample of first ${sampleSize} records:`);
    
    for (let i = 0; i < sampleSize; i++) {
      const content = allContent[i];
      totalCount++;
      
      if (content.videoUrl) {
        if (content.videoUrl.includes('youtube.com/embed/')) {
          youtubeCount++;
        } else {
          directCount++;
        }
      } else {
        noVideoCount++;
      }
      
      console.log(`${i + 1}. ${content.title}`);
      console.log(`   Type: ${content.type}`);
      console.log(`   Category: ${content.category || 'Not set'}`);
      console.log(`   Video URL: ${content.videoUrl || 'Not set'}`);
      console.log(`   Thumbnail: ${content.thumbnailUrl || 'Not set'}`);
      console.log('');
    }
    
    console.log(`\nSummary:`);
    console.log(`Total records: ${totalCount}`);
    console.log(`YouTube videos: ${youtubeCount}`);
    console.log(`Direct videos: ${directCount}`);
    console.log(`No videos: ${noVideoCount}`);
    console.log(`YouTube percentage: ${((youtubeCount / totalCount) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run check function
checkDatabase()
  .then(() => {
    console.log('Database check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database check failed:', error);
    process.exit(1);
  });
