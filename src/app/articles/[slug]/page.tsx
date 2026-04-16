import { notFound } from 'next/navigation';
import { prisma } from '~/lib/prisma';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const article = await prisma.content.findUnique({
      where: {
        slug: params.slug,
        type: 'ARTICLE',
      },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        viewCount: true,
        createdAt: true,
      },
    });

    if (!article) {
      notFound();
    }

    // Increment view count
    await prisma.content.update({
      where: { id: article.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="prose prose-lg max-w-none">
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                Article
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            {article.description && (
              <p className="text-xl text-gray-600 mb-4">{article.description}</p>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <span>Published {new Date(article.createdAt).toLocaleDateString()}</span>
              <span className="mx-2">·</span>
              <span>{article.viewCount} views</span>
            </div>
          </header>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose max-w-none">
              <h2>Article Content</h2>
              <p>
                This is a placeholder for the full article content. In a real application, 
                this would contain the complete article text, images, and other media.
              </p>
              
              <h3>What You'll Learn</h3>
              <ul>
                <li>Comprehensive understanding of the topic</li>
                <li>Practical examples and use cases</li>
                <li>Best practices and common pitfalls</li>
                <li>Advanced techniques and optimization</li>
              </ul>

              <h3>Getting Started</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>

              <h3>Advanced Concepts</h3>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
                eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>

              <h3>Conclusion</h3>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
                doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
                veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">About This Article</h3>
            <p className="text-gray-600 mb-4">
              This article is part of our comprehensive tutorial series. 
              Check out more articles in our collection for in-depth learning.
            </p>
            <div className="flex gap-4">
              <a 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Feed
              </a>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Bookmark Article
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  } catch (error) {
    console.error('Error loading article:', error);
    notFound();
  }
}
