import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if database is available (especially for build time)
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable',
          items: [],
          nextCursor: null,
          hasMore: false 
        },
        { status: 503 }
      );
    }

    // Get content with cursor-based pagination
    const content = await prisma.content.findMany({
      take: limit + 1, // Take one extra to check if there's more
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        slug: true,
        viewCount: true,
        videoUrl: true,
        thumbnailUrl: true,
        category: true,
        createdAt: true,
      },
    });

    const hasMore = content.length > limit;
    const items = hasMore ? content.slice(0, -1) : content;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch content',
        items: [],
        nextCursor: null,
        hasMore: false 
      },
      { status: 500 }
    );
  }
}
