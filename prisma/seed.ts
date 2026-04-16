import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.engagement.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.content.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@pulsefeed.com',
      role: 'ADMIN',
    },
  });

  // Create regular users
  const users = await Promise.all(
    Array.from({ length: 100 }, async () => {
      return prisma.user.create({
        data: {
          email: faker.internet.email(),
          role: 'USER',
        },
      });
    })
  );

  console.log(`Created ${users.length + 1} users`);

  // Create 10,000 content items
  const contentItems = [];
  const batchSize = 100;
  
  for (let i = 0; i < 100; i++) {
    const batch = Array.from({ length: batchSize }, (_, index) => {
      const globalIndex = i * batchSize + index;
      const isVideo = Math.random() > 0.5;
      
      return {
        title: faker.lorem.sentence({ min: 5, max: 15 }),
        description: faker.lorem.paragraph({ min: 2, max: 5 }),
        type: isVideo ? 'VIDEO' as const : 'ARTICLE' as const,
        slug: `${isVideo ? 'video' : 'article'}-${faker.lorem.slug()}-${globalIndex}`,
        viewCount: faker.number.int({ min: 0, max: 10000 }),
      };
    });

    const createdContent = await prisma.content.createMany({
      data: batch,
    });
    
    contentItems.push(...batch);
    
    if ((i + 1) % 10 === 0) {
      console.log(`Created ${(i + 1) * batchSize} content items...`);
    }
  }

  console.log(`Created ${contentItems.length} content items`);

  // Get all content IDs
  const allContent = await prisma.content.findMany({
    select: { id: true },
  });

  // Create engagements (likes and bookmarks)
  const engagementPromises = [];
  const existingEngagements = new Set<string>(); // Track existing user-content pairs
  
  for (const content of allContent) {
    // Random number of likes per content (0-50)
    const likeCount = faker.number.int({ min: 0, max: 50 });
    const likedUsers = faker.helpers.arrayElements(users, likeCount);
    
    for (const user of likedUsers) {
      const engagementKey = `${user.id}-${content.id}`;
      if (!existingEngagements.has(engagementKey)) {
        existingEngagements.add(engagementKey);
        engagementPromises.push(
          prisma.engagement.create({
            data: {
              userId: user.id,
              contentId: content.id,
              type: 'LIKE',
            },
          })
        );
      }
    }

    // Random bookmarks (0-20) - only for users who haven't already liked
    const availableUsers = users.filter(user => !existingEngagements.has(`${user.id}-${content.id}`));
    const bookmarkCount = faker.number.int({ min: 0, max: Math.min(20, availableUsers.length) });
    const bookmarkedUsers = faker.helpers.arrayElements(availableUsers, bookmarkCount);
    
    for (const user of bookmarkedUsers) {
      const engagementKey = `${user.id}-${content.id}`;
      existingEngagements.add(engagementKey);
      engagementPromises.push(
        prisma.engagement.create({
          data: {
            userId: user.id,
            contentId: content.id,
            type: 'BOOKMARK',
          },
        })
      );
    }
  }

  // Process engagements in smaller batches to avoid connection pool issues
  const batchSizeEngagements = 50;
  for (let i = 0; i < engagementPromises.length; i += batchSizeEngagements) {
    const batch = engagementPromises.slice(i, i + batchSizeEngagements);
    await Promise.all(batch);
    
    // Add a small delay to prevent overwhelming the database
    if (i % 500 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log(`Created ${Math.min(i + batchSizeEngagements, engagementPromises.length)} engagements...`);
    }
  }

  console.log(`Created ${engagementPromises.length} engagements`);

  // Create progress entries (some users have progress on some content)
  const progressPromises = [];
  
  for (const user of users.slice(0, 50)) { // Only first 50 users have progress
    const contentCount = faker.number.int({ min: 5, max: 50 });
    const userContent = faker.helpers.arrayElements(allContent, contentCount);
    
    for (const content of userContent) {
      progressPromises.push(
        prisma.progress.create({
          data: {
            userId: user.id,
            contentId: content.id,
            lastPosition: faker.number.int({ min: 0, max: 300 }),
            isCompleted: faker.datatype.boolean({ probability: 0.3 }),
          },
        })
      );
    }
  }

  await Promise.all(progressPromises);
  console.log(`Created ${progressPromises.length} progress entries`);

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
