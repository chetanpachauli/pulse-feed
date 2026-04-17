import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';

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

// Predefined datasets by category
const categoryVideos = {
  frontend: [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  ],
  backend: [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
  ],
  devops: [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackAds.mp4"
  ],
  ai: [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  ]
};

const thumbnails = [
  "https://picsum.photos/400/300?random=1",
  "https://picsum.photos/400/300?random=2",
  "https://picsum.photos/400/300?random=3",
  "https://picsum.photos/400/300?random=4"
];

const categories = ["frontend", "backend", "devops", "ai"];

async function seedContent() {
  console.log('Starting content seeding process...');
  
  try {
    // Fetch all content records
    const allContent = await prisma.content.findMany({
      where: {
        videoUrl: {
          not: null
        }
      }
    }) as ContentWithNewFields[];
    console.log(`Found ${allContent.length} content records to process`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const content of allContent) {
      const updates: any = {};
      
      // Only assign category if not present
      if (!content.category) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        updates.category = randomCategory;
      }

      // Only assign videoUrl if not present
      if (!content.videoUrl) {
        const category = updates.category || content.category;
        if (category && categoryVideos[category as keyof typeof categoryVideos]) {
          const categoryVideoList = categoryVideos[category as keyof typeof categoryVideos];
          const randomVideo = categoryVideoList[Math.floor(Math.random() * categoryVideoList.length)];
          updates.videoUrl = randomVideo;
        }
      }

      // Only assign thumbnailUrl if not present
      if (!content.thumbnailUrl) {
        const randomThumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)];
        updates.thumbnailUrl = randomThumbnail;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await prisma.content.update({
          where: { id: content.id },
          data: updates
        });
        
        console.log(`Updated content ${content.id} (${content.title}):`, {
          category: updates.category || content.category,
          videoUrl: updates.videoUrl ? 'Assigned' : 'Already exists',
          thumbnailUrl: updates.thumbnailUrl ? 'Assigned' : 'Already exists'
        });
        
        updatedCount++;
      } else {
        console.log(`Skipped content ${content.id} (${content.title}) - all fields already present`);
        skippedCount++;
      }
    }

    console.log(`\nContent seeding completed!`);
    console.log(`Updated: ${updatedCount} records`);
    console.log(`Skipped: ${skippedCount} records`);
  } catch (error) {
    console.error('Error seeding content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedContent()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
