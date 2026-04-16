import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting basic database seeding...');

  // Clear existing data
  await prisma.engagement.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.content.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user FIRST to prevent foreign key constraint violations
  await prisma.user.create({
    data: {
      id: 'demo-user-id',
      email: 'demo@example.com',
      role: 'USER',
    },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@pulsefeed.com',
      role: 'ADMIN',
    },
  });

  // Create 10 regular users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@pulsefeed.com`,
        role: 'USER',
      },
    });
    users.push(user);
  }

  console.log(`Created ${users.length + 1} users`);

  // Sample video URLs for diversity - using more reliable sources
  const sampleVideoUrls = [
    'https://w3schools.com/html/mov_bbb.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_1mb.mp4',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_5mb.mp4',
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
  ];

  // Diverse title templates
  const videoTitles = [
    'Advanced {topic} Tutorial',
    'Mastering {topic} in {time}',
    '{topic} Best Practices',
    'Building {topic} Applications',
    '{topic} Performance Guide',
    '{topic} Security Essentials',
    'Modern {topic} Development',
    '{topic} Architecture Patterns',
    'Scaling {topic} Systems',
    '{topic} Optimization Techniques'
  ];

  const articleTitles = [
    'Complete Guide to {topic}',
    '{topic} Deep Dive',
    'Understanding {topic} Fundamentals',
    '{topic} vs {alternative}',
    'Top 10 {topic} Tips',
    '{topic} Mistakes to Avoid',
    '{topic} for Beginners',
    'Advanced {topic} Concepts',
    '{topic} Trends {year}',
    '{topic} Case Study'
  ];

  const topics = ['React', 'Node.js', 'TypeScript', 'Python', 'Docker', 'AWS', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Kubernetes', 'Vue.js', 'Angular', 'Next.js', 'Prisma', 'TailwindCSS'];
  const alternatives = ['Traditional Methods', 'Legacy Systems', 'Old Approaches', 'Competing Solutions'];
  const times = ['30 Minutes', '1 Hour', '2 Hours', 'Half Day', 'Full Course'];

  // Create 1,000+ content items
  for (let i = 0; i < 1000; i++) {
    const isVideo = i % 2 === 0;
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    let title;
    if (isVideo) {
      const titleTemplate = videoTitles[Math.floor(Math.random() * videoTitles.length)];
      const time = times[Math.floor(Math.random() * times.length)];
      title = titleTemplate.replace('{topic}', topic).replace('{time}', time);
    } else {
      const titleTemplate = articleTitles[Math.floor(Math.random() * articleTitles.length)];
      const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
      const year = 2024 + Math.floor(Math.random() * 3);
      title = titleTemplate.replace('{topic}', topic).replace('{alternative}', alternative).replace('{year}', year.toString());
    }
    
    const contentData: any = {
      title,
      description: `Comprehensive ${isVideo ? 'video tutorial' : 'article'} covering ${topic} with practical examples and best practices.`,
      type: isVideo ? 'VIDEO' : 'ARTICLE',
      slug: `${isVideo ? 'video' : 'article'}-${topic.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      viewCount: Math.floor(Math.random() * 10000) + 100,
    };

    // Add video URL for video content
    if (isVideo) {
      contentData.videoUrl = sampleVideoUrls[Math.floor(Math.random() * sampleVideoUrls.length)];
    }
    
    await prisma.content.create({ data: contentData });
    
    if ((i + 1) % 100 === 0) {
      console.log(`Created ${i + 1} content items...`);
    }
  }

  console.log('Created 1000 content items');

  // Get all content
  const allContent = await prisma.content.findMany();

  // Create some engagements
  let engagementCount = 0;
  for (let i = 0; i < 50; i++) { // Only first 50 items
    const content = allContent[i];
    const user = users[i % users.length];
    
    // Add a like using upsert to handle duplicates
    try {
      await prisma.engagement.upsert({
        where: {
          userId_contentId: {
            userId: user.id,
            contentId: content.id,
          },
          type: 'LIKE',
        },
        update: {},
        create: {
          userId: user.id,
          contentId: content.id,
          type: 'LIKE',
        },
      });
      engagementCount++;
    } catch (error) {
      // Ignore errors
    }

    // Add a bookmark for some items using upsert
    if (i % 3 === 0) {
      try {
        await prisma.engagement.upsert({
          where: {
            userId_contentId: {
              userId: users[(i + 1) % users.length].id,
              contentId: content.id,
            },
            type: 'BOOKMARK',
          },
          update: {},
          create: {
            userId: users[(i + 1) % users.length].id,
            contentId: content.id,
            type: 'BOOKMARK',
          },
        });
        engagementCount++;
      } catch (error) {
        // Ignore errors
      }
    }
  }

  console.log(`Created ${engagementCount} engagements`);

  // Create some progress entries
  for (let i = 0; i < 20; i++) {
    const user = users[i % users.length];
    const content = allContent[i];
    
    await prisma.progress.create({
      data: {
        userId: user.id,
        contentId: content.id,
        lastPosition: Math.floor(Math.random() * 100),
        isCompleted: Math.random() > 0.7,
      },
    });
  }

  console.log('Created 20 progress entries');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
