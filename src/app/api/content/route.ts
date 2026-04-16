import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';

export async function GET() {
  try {
    const content = await prisma.content.findMany({
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
        createdAt: true,
      },
      take: 50, // Limit to 50 for admin dashboard
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
