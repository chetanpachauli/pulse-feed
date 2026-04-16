import Link from 'next/link';

export default function ArticleNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the article you're looking for.
        </p>
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Feed
          </Link>
          <div className="text-sm text-gray-500">
            Or try searching for articles in our main feed
          </div>
        </div>
      </div>
    </div>
  );
}
