import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

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
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
