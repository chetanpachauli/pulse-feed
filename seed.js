const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await prisma.engagement.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.content.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    await prisma.user.create({
      data: { email: 'admin@pulsefeed.com', role: 'ADMIN' }
    });

    // Create 10 users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = await prisma.user.create({
        data: { email: `user${i}@pulsefeed.com`, role: 'USER' }
      });
      users.push(user);
    }

    console.log(`Created ${users.length + 1} users`);

    // Create 50 content items
    for (let i = 0; i < 50; i++) {
      const isVideo = i % 2 === 0;
      await prisma.content.create({
        data: {
          title: `Sample ${isVideo ? 'Video' : 'Article'} ${i}`,
          description: `This is a sample ${isVideo ? 'video' : 'article'} description for item number ${i}.`,
          type: isVideo ? 'VIDEO' : 'ARTICLE',
          slug: `${isVideo ? 'video' : 'article'}-sample-${i}`,
          viewCount: Math.floor(Math.random() * 1000)
        }
      });
    }

    console.log('Created 50 content items');

    // Get all content
    const allContent = await prisma.content.findMany();

    // Create some engagements
    let engagementCount = 0;
    for (let i = 0; i < 30; i++) {
      const content = allContent[i];
      const user = users[i % users.length];
      
      // Add a like
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
        // Ignore errors
      }
    }

    console.log(`Created ${engagementCount} engagements`);

    // Create some progress entries
    for (let i = 0; i < 15; i++) {
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

    console.log('Created 15 progress entries');
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
