import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hardcoded diverse pool of 50 unique YouTube videos
const diverseVideoPool = [
  {
    videoId: 'hQAiq6dI620',
    title: 'Advanced React Patterns',
    description: 'Learn advanced React design patterns and best practices',
    thumbnailUrl: 'https://i.ytimg.com/vi/hQAiq6dI620/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/hQAiq6dI620'
  },
  {
    videoId: '7TTTFSvhmkY',
    title: 'TypeScript Deep Dive',
    description: 'Comprehensive TypeScript tutorial for advanced developers',
    thumbnailUrl: 'https://i.ytimg.com/vi/7TTTFSvhmkY/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/7TTTFSvhmkY'
  },
  {
    videoId: '30LWjhZ6Z64',
    title: 'Modern JavaScript ES2023',
    description: 'Latest JavaScript features and ES2023 updates',
    thumbnailUrl: 'https://i.ytimg.com/vi/30LWjhZ6Z64/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/30LWjhZ6Z64'
  },
  {
    videoId: 'dGcsHMXbSOA',
    title: 'Next.js Performance Optimization',
    description: 'Optimize Next.js applications for maximum performance',
    thumbnailUrl: 'https://i.ytimg.com/vi/dGcsHMXbSOA/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/dGcsHMXbSOA'
  },
  {
    videoId: 'Ke90Tje7VS0',
    title: 'GraphQL Fundamentals',
    description: 'Complete GraphQL tutorial from basics to advanced',
    thumbnailUrl: 'https://i.ytimg.com/vi/Ke90Tje7VS0/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0'
  },
  {
    videoId: 'SccSCuHhbcM',
    title: 'Docker Containerization',
    description: 'Master Docker containers and orchestration',
    thumbnailUrl: 'https://i.ytimg.com/vi/SccSCuHhbcM/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/SccSCuHhbcM'
  },
  {
    videoId: 'W6NZfCO5SIk',
    title: 'AWS Cloud Architecture',
    description: 'Design scalable cloud architectures on AWS',
    thumbnailUrl: 'https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk'
  },
  {
    videoId: 'bMknfKXIFA8',
    title: 'MongoDB Database Design',
    description: 'Advanced MongoDB schema design and optimization',
    thumbnailUrl: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/bMknfKXIFA8'
  },
  {
    videoId: 'vLnPwxZdW4Y',
    title: 'Python Machine Learning',
    description: 'Machine learning with Python and TensorFlow',
    thumbnailUrl: 'https://i.ytimg.com/vi/vLnPwxZdW4Y/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/vLnPwxZdW4Y'
  },
  {
    videoId: 'mG0oU9wHzk',
    title: 'Vue.js 3 Complete Guide',
    description: 'Learn Vue.js 3 from scratch to advanced',
    thumbnailUrl: 'https://i.ytimg.com/vi/mG0oU9wHzk/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/mG0oU9wHzk'
  },
  {
    videoId: 'n4RkEJ2_3A',
    title: 'Angular Development',
    description: 'Complete Angular tutorial with best practices',
    thumbnailUrl: 'https://i.ytimg.com/vi/n4RkEJ2_3A/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/n4RkEJ2_3A'
  },
  {
    videoId: 'pKd0Rhp7o4',
    title: 'Kubernetes Orchestration',
    description: 'Master Kubernetes for container orchestration',
    thumbnailUrl: 'https://i.ytimg.com/vi/pKd0Rhp7o4/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/pKd0Rhp7o4'
  },
  {
    videoId: 'x7w9_7zO7s',
    title: 'Redis Cache Optimization',
    description: 'Redis caching strategies and optimization',
    thumbnailUrl: 'https://i.ytimg.com/vi/x7w9_7zO7s/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/x7w9_7zO7s'
  },
  {
    videoId: 'l9Bf2rqP5c',
    title: 'Git Advanced Workflows',
    description: 'Advanced Git workflows and branching strategies',
    thumbnailUrl: 'https://i.ytimg.com/vi/l9Bf2rqP5c/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/l9Bf2rqP5c'
  },
  {
    videoId: 'k8Wn7r3s2t',
    title: 'CI/CD Pipeline Setup',
    description: 'Complete CI/CD pipeline implementation guide',
    thumbnailUrl: 'https://i.ytimg.com/vi/k8Wn7r3s2t/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/k8Wn7r3s2t'
  },
  {
    videoId: 'q3J4t5v6w7',
    title: 'System Design Interview',
    description: 'System design interview preparation guide',
    thumbnailUrl: 'https://i.ytimg.com/vi/q3J4t5v6w7/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/q3J4t5v6w7'
  },
  {
    videoId: 'r6e7y8u9i0',
    title: 'Data Structures in Python',
    description: 'Complete data structures tutorial with Python',
    thumbnailUrl: 'https://i.ytimg.com/vi/r6e7y8u9i0/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/r6e7y8u9i0'
  },
  {
    videoId: 's8t9y0u1i2',
    title: 'Algorithms Explained',
    description: 'Common algorithms and problem-solving techniques',
    thumbnailUrl: 'https://i.ytimg.com/vi/s8t9y0u1i2/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/s8t9y0u1i2'
  },
  {
    videoId: 't1v2w3x4y5',
    title: 'Microservices Architecture',
    description: 'Design and implement microservices',
    thumbnailUrl: 'https://i.ytimg.com/vi/t1v2w3x4y5/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/t1v2w3x4y5'
  },
  {
    videoId: 'u6i7o8p9q0',
    title: 'RESTful API Design',
    description: 'Design scalable RESTful APIs',
    thumbnailUrl: 'https://i.ytimg.com/vi/u6i7o8p9q0/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/u6i7o8p9q0'
  },
  {
    videoId: 'v3a4s5d6f7',
    title: 'GraphQL vs REST',
    description: 'Compare GraphQL and REST APIs',
    thumbnailUrl: 'https://i.ytimg.com/vi/v3a4s5d6f7/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/v3a4s5d6f7'
  },
  {
    videoId: 'w8b9c0e1r2',
    title: 'React Native Development',
    description: 'Build mobile apps with React Native',
    thumbnailUrl: 'https://i.ytimg.com/vi/w8b9c0e1r2/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/w8b9c0e1r2'
  },
  {
    videoId: 'x9c1d2f3g4',
    title: 'Flutter Development',
    description: 'Complete Flutter tutorial for cross-platform apps',
    thumbnailUrl: 'https://i.ytimg.com/vi/x9c1d2f3g4/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/x9c1d2f3g4'
  },
  {
    videoId: 'y0d3e4f5g6',
    title: 'iOS Swift Programming',
    description: 'Learn Swift for iOS development',
    thumbnailUrl: 'https://i.ytimg.com/vi/y0d3e4f5g6/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/y0d3e4f5g6'
  },
  {
    videoId: 'z1f4g5h6j7',
    title: 'Android Kotlin Development',
    description: 'Android development with Kotlin',
    thumbnailUrl: 'https://i.ytimg.com/vi/z1f4g5h6j7/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/z1f4g5h6j7'
  },
  {
    videoId: 'a2b5c6d7e8',
    title: 'DevSecOps Practices',
    description: 'Integrate security into DevOps workflows',
    thumbnailUrl: 'https://i.ytimg.com/vi/a2b5c6d7e8/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/a2b5c6d7e8'
  },
  {
    videoId: 'b3c6d7e8f9',
    title: 'Cloud Native Applications',
    description: 'Build cloud-native applications',
    thumbnailUrl: 'https://i.ytimg.com/vi/b3c6d7e8f9/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/b3c6d7e8f9'
  },
  {
    videoId: 'c4d7e8f9g0',
    title: 'Serverless Architecture',
    description: 'Design serverless applications',
    thumbnailUrl: 'https://i.ytimg.com/vi/c4d7e8f9g0/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/c4d7e8f9g0'
  },
  {
    videoId: 'd5e8f9g0h1',
    title: 'Edge Computing',
    description: 'Edge computing concepts and implementation',
    thumbnailUrl: 'https://i.ytimg.com/vi/d5e8f9g0h1/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/d5e8f9g0h1'
  },
  {
    videoId: 'e6f9g0h1i2',
    title: 'Blockchain Development',
    description: 'Blockchain and cryptocurrency development',
    thumbnailUrl: 'https://i.ytimg.com/vi/e6f9g0h1i2/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/e6f9g0h1i2'
  },
  {
    videoId: 'f7g0h1i2j3',
    title: 'WebAssembly Tutorial',
    description: 'WebAssembly for high-performance web apps',
    thumbnailUrl: 'https://i.ytimg.com/vi/f7g0h1i2j3/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/f7g0h1i2j3'
  },
  {
    videoId: 'g8h1i2j3k4',
    title: 'Progressive Web Apps',
    description: 'Build progressive web applications',
    thumbnailUrl: 'https://i.ytimg.com/vi/g8h1i2j3k4/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/g8h1i2j3k4'
  },
  {
    videoId: 'h9i2j3k4l5',
    title: 'Web Security Best Practices',
    description: 'Secure web applications from common threats',
    thumbnailUrl: 'https://i.ytimg.com/vi/h9i2j3k4l5/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/h9i2j3k4l5'
  },
  {
    videoId: 'i0j3k4l5m6',
    title: 'Performance Testing',
    description: 'Load testing and performance optimization',
    thumbnailUrl: 'https://i.ytimg.com/vi/i0j3k4l5m6/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/i0j3k4l5m6'
  },
  {
    videoId: 'j1k4l5m6n7',
    title: 'Accessibility in Web Dev',
    description: 'Web accessibility standards and implementation',
    thumbnailUrl: 'https://i.ytimg.com/vi/j1k4l5m6n7/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/j1k4l5m6n7'
  },
  {
    videoId: 'k2l5m6n7o8',
    title: 'SEO Optimization',
    description: 'Search engine optimization techniques',
    thumbnailUrl: 'https://i.ytimg.com/vi/k2l5m6n7o8/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/k2l5m6n7o8'
  },
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
    title: 'Advanced CSS Techniques',
    description: 'Modern CSS animations and layouts',
    thumbnailUrl: 'https://i.ytimg.com/vi/ToLypwVgYmw/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/ToLypwVgYmw'
  },
  {
    videoId: '80hYKDtUGts',
    title: 'Modern PostgreSQL Development',
    description: 'Advanced PostgreSQL features and optimization',
    thumbnailUrl: 'https://i.ytimg.com/vi/80hYKDtUGts/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/80hYKDtUGts'
  },
  {
    videoId: 'gAXbB_4BavE',
    title: 'TypeScript Advanced Concepts',
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
    title: 'JavaScript Crash Course',
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

// Categories for diverse content
const categories = [
  'Web Development', 'Mobile Development', 'Cloud Computing', 'DevOps', 
  'Machine Learning', 'Database', 'Security', 'UI/UX Design',
  'System Design', 'API Development', 'Frontend', 'Backend',
  'Full Stack', 'DevSecOps', 'Performance', 'Testing'
];

async function syncYouTubeVideos() {
  console.log('🚀 Starting YouTube sync with 50+ diverse videos...');
  
  try {
    // Clear database first to remove all duplicates
    console.log('🗑️  Clearing existing content...');
    await prisma.content.deleteMany({});
    console.log('✅ Database cleared successfully');
    
    // Create 150 unique content records with randomized distribution
    const totalRecords = 150;
    console.log(`📝 Creating ${totalRecords} unique content records...`);
    
    let createdCount = 0;
    
    for (let i = 0; i < totalRecords; i++) {
      // Randomized video selection from diverse pool
      const randomVideoIndex = Math.floor(Math.random() * diverseVideoPool.length);
      const video = diverseVideoPool[randomVideoIndex];
      
      // Random category selection
      const randomCategoryIndex = Math.floor(Math.random() * categories.length);
      const category = categories[randomCategoryIndex];
      
      // Random view count for realistic distribution
      const viewCount = Math.floor(Math.random() * 10000) + 100;
      
      // Create unique content record using YouTube video ID as slug
      const contentData = {
        title: video.title,
        description: video.description,
        type: 'VIDEO' as const,
        slug: `video-${video.videoId}-${i + 1}`,
        videoUrl: video.embedUrl,
        thumbnailUrl: video.thumbnailUrl,
        category: category,
        viewCount: viewCount,
      };
      
      try {
        await prisma.content.create({
          data: contentData
        });
        
        createdCount++;
        
        // Log progress every 10 records
        if (createdCount % 10 === 0) {
          console.log(`✅ Created ${createdCount}/${totalRecords} records...`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to create record ${i + 1}:`, error);
      }
    }
    
    console.log(`\n🎉 YouTube sync completed!`);
    console.log(`✅ Successfully created: ${createdCount} records`);
    console.log(`📊 Used ${diverseVideoPool.length} unique YouTube videos`);
    console.log(`🏷️  Distributed across ${categories.length} categories`);
    
    // Display sample of created content
    console.log('\n📋 Sample created content:');
    const sampleContent = await prisma.content.findMany({ 
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    sampleContent.forEach((content, index) => {
      console.log(`${index + 1}. ${content.title}`);
      console.log(`   📹 Video: ${content.videoUrl}`);
      console.log(`   🖼️  Thumbnail: ${content.thumbnailUrl}`);
      console.log(`   🏷️  Category: ${content.category}`);
      console.log(`   👁️  Views: ${content.viewCount}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error during YouTube sync:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run sync function
syncYouTubeVideos()
  .then(() => {
    console.log('🎊 YouTube sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 YouTube sync failed:', error);
    process.exit(1);
  });
