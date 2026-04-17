import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldVideos() {
  console.log('Starting cleanup of old sample videos...');
  
  try {
    // Find all content records with old sample video URLs
    const oldVideoRecords = await prisma.content.findMany({
      where: {
        OR: [
          {
            videoUrl: {
              contains: 'sample-videos.com'
            }
          },
          {
            videoUrl: {
              contains: 'test-videos.com'
            }
          },
          {
            videoUrl: {
              contains: 'w3schools.com'
            }
          }
        ]
      }
    });
    
    console.log(`Found ${oldVideoRecords.length} records with old sample video URLs`);
    
    if (oldVideoRecords.length === 0) {
      console.log('No old sample videos found. Database is already clean.');
      return;
    }
    
    // Delete all old sample video records
    const deleteResult = await prisma.content.deleteMany({
      where: {
        OR: [
          {
            videoUrl: {
              contains: 'sample-videos.com'
            }
          },
          {
            videoUrl: {
              contains: 'test-videos.com'
            }
          },
          {
            videoUrl: {
              contains: 'w3schools.com'
            }
          }
        ]
      }
    });
    
    console.log(`Deleted ${deleteResult.count} old sample video records`);
    
    // Show sample of deleted records
    console.log('\nSample of deleted records:');
    const sampleSize = Math.min(5, oldVideoRecords.length);
    for (let i = 0; i < sampleSize; i++) {
      const record = oldVideoRecords[i];
      console.log(`${i + 1}. ${record.title}`);
      console.log(`   Old URL: ${record.videoUrl}`);
      console.log(`   Category: ${record.category || 'Not set'}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup function
cleanupOldVideos()
  .then(() => {
    console.log('Cleanup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
