import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Predefined list of working video URLs
const videoUrls = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackAds.mp4"
];

async function updateVideos() {
  console.log('Starting video URL update process...');
  
  try {
    // Fetch all content records
    const allContent = await prisma.content.findMany({
      where: {
        videoUrl: {
          not: null
        }
      }
    });

    console.log(`Found ${allContent.length} content records to update`);

    // Update each content with a unique video URL
    for (let i = 0; i < allContent.length; i++) {
      const content = allContent[i];
      const videoUrl = videoUrls[i % videoUrls.length];
      
      await prisma.content.update({
        where: {
          id: content.id
        },
        data: {
          videoUrl: videoUrl
        }
      });
      
      console.log(`Updated content ${content.id} (${content.title}) with URL: ${videoUrl}`);
    }

    console.log('Video URL update completed successfully!');
  } catch (error) {
    console.error('Error updating video URLs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update function
updateVideos()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
