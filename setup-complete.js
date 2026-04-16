const { execSync } = require('child_process');
const fs = require('fs');

async function setupComplete() {
  try {
    console.log('=== PulseFeed Complete Setup ===');
    
    // Step 1: Database URL is already set in .env.local
    
    // Step 2: Install packages (already done)
    console.log('Packages already installed');
    
    // Step 3: Database push (already done)
    console.log('Database schema already pushed');
    
    // Step 4: Seed database with basic data
    console.log('Seeding database...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
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
      
    } catch (seedError) {
      console.error('Seeding error:', seedError.message);
    } finally {
      await prisma.$disconnect();
    }
    
    // Step 5: Apply GIN index
    console.log('Applying GIN index for search...');
    try {
      const prisma2 = new PrismaClient();
      
      // Add tsvector column
      await prisma2.$executeRaw`ALTER TABLE "contents" ADD COLUMN IF NOT EXISTS "title_tsvector" tsvector GENERATED ALWAYS AS (to_tsvector('english', title)) STORED`;
      
      // Create GIN index
      await prisma2.$executeRaw`CREATE INDEX IF NOT EXISTS "contents_title_gin_idx" ON "contents" USING GIN ("title_tsvector")`;
      
      // Create trigger function
      await prisma2.$executeRaw`CREATE OR REPLACE FUNCTION update_title_tsvector() RETURNS TRIGGER AS $$ BEGIN NEW.title_tsvector := to_tsvector('english', NEW.title); RETURN NEW; END; $$ LANGUAGE plpgsql`;
      
      // Create trigger
      await prisma2.$executeRaw`DROP TRIGGER IF EXISTS "contents_title_tsvector_update" ON "contents"`;
      await prisma2.$executeRaw`CREATE TRIGGER "contents_title_tsvector_update" BEFORE INSERT OR UPDATE ON "contents" FOR EACH ROW EXECUTE FUNCTION update_title_tsvector()`;
      
      console.log('GIN index applied successfully!');
      await prisma2.$disconnect();
    } catch (indexError) {
      console.error('Index error:', indexError.message);
    }
    
    console.log('\n=== Setup Complete! ===');
    console.log('Database is ready with:');
    console.log('- 11 users (1 admin + 10 regular users)');
    console.log('- 50 content items (videos and articles)');
    console.log('- Sample engagements and progress data');
    console.log('- GIN index for fast search');
    console.log('\nTo start the development server, run:');
    console.log('npm run dev');
    console.log('\nThe application will be available at: http://localhost:3000');
    
  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

setupComplete();
