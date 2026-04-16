const { PrismaClient } = require('@prisma/client');

async function seedDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Seeding database with sample content...');
    
    // Clear existing data
    await prisma.engagement.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.content.deleteMany();
    await prisma.user.deleteMany();
    
    // Create admin user
    await prisma.user.create({
      data: { email: 'admin@pulsefeed.com', role: 'ADMIN' }
    });
    
    // Create demo user with the exact ID used in the app
    const demoUser = await prisma.user.create({
      data: { 
        email: 'demo@pulsefeed.com', 
        role: 'USER',
        id: 'demo-user-id' // Explicitly set the ID to match the app
      }
    });
    
    console.log('Created users');
    
    // Create 20 diversified video entries
    const videoContent = [
      {
        title: 'Introduction to Machine Learning',
        description: 'A comprehensive introduction to machine learning concepts and algorithms.',
        type: 'VIDEO',
        slug: 'intro-machine-learning',
        viewCount: 5420
      },
      {
        title: 'Advanced JavaScript Techniques',
        description: 'Master advanced JavaScript patterns and techniques for modern web development.',
        type: 'VIDEO',
        slug: 'advanced-javascript-techniques',
        viewCount: 3210
      },
      {
        title: 'Building RESTful APIs with Node.js',
        description: 'Learn how to build scalable RESTful APIs using Node.js and Express.',
        type: 'VIDEO',
        slug: 'restful-apis-nodejs',
        viewCount: 2890
      },
      {
        title: 'React Performance Optimization',
        description: 'Discover techniques to optimize React applications for better performance.',
        type: 'VIDEO',
        slug: 'react-performance-optimization',
        viewCount: 4150
      },
      {
        title: 'Docker Containerization Basics',
        description: 'Get started with Docker and learn how to containerize your applications.',
        type: 'VIDEO',
        slug: 'docker-containerization-basics',
        viewCount: 3780
      },
      {
        title: 'GraphQL vs REST API Design',
        description: 'Compare GraphQL and REST APIs and learn when to use each approach.',
        type: 'VIDEO',
        slug: 'graphql-vs-rest-api',
        viewCount: 2560
      },
      {
        title: 'Microservices Architecture Patterns',
        description: 'Explore microservices architecture patterns and best practices.',
        type: 'VIDEO',
        slug: 'microservices-architecture-patterns',
        viewCount: 4890
      },
      {
        title: 'Vue.js 3 Composition API',
        description: 'Master the Vue.js 3 Composition API and build reactive applications.',
        type: 'VIDEO',
        slug: 'vuejs3-composition-api',
        viewCount: 2340
      },
      {
        title: 'Database Indexing Strategies',
        description: 'Learn effective database indexing strategies for query optimization.',
        type: 'VIDEO',
        slug: 'database-indexing-strategies',
        viewCount: 3670
      },
      {
        title: 'Web Security Best Practices',
        description: 'Essential web security practices every developer should know.',
        type: 'VIDEO',
        slug: 'web-security-best-practices',
        viewCount: 6120
      },
      {
        title: 'Cloud Computing with AWS',
        description: 'Introduction to cloud computing and AWS services for developers.',
        type: 'VIDEO',
        slug: 'cloud-computing-aws',
        viewCount: 5230
      },
      {
        title: 'Progressive Web Apps Development',
        description: 'Build progressive web apps that work offline and provide native-like experiences.',
        type: 'VIDEO',
        slug: 'progressive-web-apps',
        viewCount: 2980
      },
      {
        title: 'Python Data Science Essentials',
        description: 'Essential Python libraries and techniques for data science projects.',
        type: 'VIDEO',
        slug: 'python-data-science',
        viewCount: 4560
      },
      {
        title: 'Mobile Development with React Native',
        description: 'Build cross-platform mobile applications using React Native.',
        type: 'VIDEO',
        slug: 'mobile-development-react-native',
        viewCount: 3890
      },
      {
        title: 'DevOps Pipeline Automation',
        description: 'Automate your development and deployment pipelines with modern DevOps tools.',
        type: 'VIDEO',
        slug: 'devops-pipeline-automation',
        viewCount: 3340
      },
      {
        title: 'Artificial Intelligence Ethics',
        description: 'Explore the ethical implications and considerations in AI development.',
        type: 'VIDEO',
        slug: 'ai-ethics',
        viewCount: 2780
      },
      {
        title: 'Blockchain Technology Explained',
        description: 'Understanding blockchain technology and its applications beyond cryptocurrency.',
        type: 'VIDEO',
        slug: 'blockchain-technology-explained',
        viewCount: 4120
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Fundamental principles of user interface and user experience design.',
        type: 'VIDEO',
        slug: 'ui-ux-design-principles',
        viewCount: 5670
      },
      {
        title: 'Kubernetes Orchestration',
        description: 'Learn Kubernetes for container orchestration and management.',
        type: 'VIDEO',
        slug: 'kubernetes-orchestration',
        viewCount: 3450
      },
      {
        title: 'Testing Strategies for Modern Apps',
        description: 'Comprehensive testing strategies for modern web and mobile applications.',
        type: 'VIDEO',
        slug: 'testing-strategies-modern-apps',
        viewCount: 4230
      }
    ];
    
    for (const content of videoContent) {
      await prisma.content.create({ data: content });
    }
    
    console.log('Created sample content');
    
    // Get all content
    const allContent = await prisma.content.findMany();
    
    // Create sample engagements for about half of the content
    for (let i = 0; i < Math.min(10, allContent.length); i++) {
      const content = allContent[i];
      
      await prisma.engagement.create({
        data: {
          userId: demoUser.id,
          contentId: content.id,
          type: 'LIKE'
        }
      });
    }
    
    console.log('Created sample engagements');
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
