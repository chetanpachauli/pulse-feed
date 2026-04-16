import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting simple database seeding...');

  // Clear existing data
  await prisma.engagement.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.content.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@pulsefeed.com',
      role: 'ADMIN',
    },
  });

  // Create 100 regular users
  const users = [];
  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        role: 'USER',
      },
    });
    users.push(user);
  }

  console.log(`Created ${users.length + 1} users`);

  // Create 1000 content items (smaller for testing)
  for (let i = 0; i < 1000; i++) {
    const isVideo = Math.random() > 0.5;
    
    await prisma.content.create({
      data: {
        title: faker.lorem.sentence({ min: 5, max: 15 }),
        description: faker.lorem.paragraph({ min: 2, max: 5 }),
        type: isVideo ? 'VIDEO' : 'ARTICLE',
        slug: `${isVideo ? 'video' : 'article'}-${faker.lorem.slug()}-${i}`,
        viewCount: faker.number.int({ min: 0, max: 10000 }),
      },
    });
    
    if ((i + 1) % 100 === 0) {
      console.log(`Created ${i + 1} content items...`);
    }
  }

  console.log('Created 1000 content items');

  // Get all content
  const allContent = await prisma.content.findMany();

  // Create some engagements (likes and bookmarks)
  let engagementCount = 0;
  for (const content of allContent.slice(0, 500)) { // Only first 500 items
    // Random likes (0-10 per content)
    const likeCount = faker.number.int({ min: 0, max: 10 });
    const likedUsers = faker.helpers.arrayElements(users, likeCount);
    
    for (const user of likedUsers) {
      try {
        await prisma.engagement.create({
          data: {
            userId: user.id,
            contentId: content.id,
            type: 'LIKE',
          },
        });
        engagementCount++;
      } catch (error) {
        // Ignore unique constraint errors
      }
    }

    // Random bookmarks (0-5 per content)
    const bookmarkCount = faker.number.int({ min: 0, max: 5 });
    const bookmarkedUsers = faker.helpers.arrayElements(users, bookmarkCount);
    
    for (const user of bookmarkedUsers) {
      try {
        await prisma.engagement.create({
          data: {
            userId: user.id,
            contentId: content.id,
            type: 'BOOKMARK',
          },
        });
        engagementCount++;
      } catch (error) {
        // Ignore unique constraint errors
      }
    }
  }

  console.log(`Created ${engagementCount} engagements`);

  // Create some progress entries
  let progressCount = 0;
  for (const user of users.slice(0, 20)) { // Only first 20 users
    const contentCount = faker.number.int({ min: 1, max: 10 });
    const userContent = faker.helpers.arrayElements(allContent, contentCount);
    
    for (const content of userContent) {
      await prisma.progress.create({
        data: {
          userId: user.id,
          contentId: content.id,
          lastPosition: faker.number.int({ min: 0, max: 300 }),
          isCompleted: faker.datatype.boolean({ probability: 0.3 }),
        },
      });
      progressCount++;
    }
  }

  console.log(`Created ${progressCount} progress entries`);
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
