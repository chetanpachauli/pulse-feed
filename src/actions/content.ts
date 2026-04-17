'use server';

import { prisma } from '~/lib/prisma';
import { ContentSchema, PaginationSchema } from '~/lib/zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Atomic increment for likes
export async function toggleLike(contentId: string, userId: string) {
  try {
    // Ensure user exists before creating engagement
    if (userId === 'demo-user-id') {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: 'demo@example.com',
          role: 'USER',
        },
      });
    }

    const existingLike = await prisma.engagement.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
        type: 'LIKE',
      },
    });

    if (existingLike) {
      // Remove like
      await prisma.engagement.delete({
        where: {
          id: existingLike.id,
        },
      });
      
      const updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          viewCount: {
            decrement: 1,
          },
        },
      });
      
      return { liked: false, likeCount: updatedContent.viewCount };
    } else {
      // Add like
      await prisma.engagement.create({
        data: {
          userId,
          contentId,
          type: 'LIKE',
        },
      });
      
      const updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
      
      return { liked: true, likeCount: updatedContent.viewCount };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    // Don't throw error to prevent server crash
    return { liked: false, likeCount: 0, error: 'Failed to toggle like' };
  }
}


// Admin content creation
export async function createContent(formData: FormData, userId: string) {
  const validatedData = ContentSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    type: formData.get('type'),
    slug: formData.get('slug'),
    videoUrl: formData.get('videoUrl'),
    thumbnailUrl: formData.get('thumbnailUrl'),
    category: formData.get('category'),
  });

  try {
    const content = await prisma.content.create({
      data: validatedData,
    });

    revalidatePath('/admin');
    revalidatePath('/');
    
    return content;
  } catch (error) {
    console.error('Error creating content:', error);
    throw new Error('Failed to create content');
  }
}

// Toggle bookmark with idempotency
export async function toggleBookmark(contentId: string, userId: string) {
  try {
    // Ensure user exists before creating engagement
    if (userId === 'demo-user-id') {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: 'demo@example.com',
          role: 'USER',
        },
      });
    }

    const existingBookmark = await prisma.engagement.findFirst({
      where: {
        userId,
        contentId,
        type: 'BOOKMARK',
      },
    });

    // Use upsert to handle bookmark toggle atomically with correct constraint
    const bookmarkCount = await prisma.engagement.count({
      where: {
        contentId,
        type: 'BOOKMARK',
      },
    });

    if (existingBookmark) {
      // Remove bookmark using delete
      await prisma.engagement.delete({
        where: {
          id: existingBookmark.id,
        },
      });
      
      return { bookmarked: false, bookmarkCount: bookmarkCount - 1 };
    } else {
      // Add bookmark using create with proper error handling
      try {
        await prisma.engagement.create({
          data: {
            userId,
            contentId,
            type: 'BOOKMARK',
          },
        });
      } catch (error: any) {
        // If duplicate, just ignore (bookmark already exists)
        if (error.code !== 'P2002') {
          throw error;
        }
      }
      
      return { bookmarked: true, bookmarkCount: bookmarkCount + 1 };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    // Don't throw error to prevent server crash
    return { bookmarked: false, bookmarkCount: 0, error: 'Failed to toggle bookmark' };
  }
}

// Update progress
export async function updateProgress(contentId: string, userId: string, lastPosition: number, isCompleted: boolean) {
  try {
    // For demo purposes, create the demo user if it doesn't exist
    if (userId === 'demo-user-id') {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: 'demo@example.com',
          role: 'USER',
        },
      });
    }

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true }
    });

    if (!content) {
      console.warn(`Content ${contentId} not found, skipping progress update`);
      return null;
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
      update: {
        lastPosition,
        isCompleted,
      },
      create: {
        userId,
        contentId,
        lastPosition,
        isCompleted,
      },
    });

    return progress;
  } catch (error) {
    console.error('Error updating progress:', error);
    // Don't throw error to prevent breaking the video player
    return null;
  }
}

// Cursor-based pagination
export async function getContentFeed(cursor?: string, limit: number = 20) {
  try {
    const content = await prisma.content.findMany({
      take: limit,
      skip: cursor ? 1 : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        engagements: {
          where: {
            type: 'LIKE'
          }
        },
        progress: {
          where: {
            userId: 'demo-user-id'
          }
        }
      }
    });
    
    // Force fresh data by adding timestamp to prevent caching
    revalidatePath('/');
    
    return {
      items: content.map((item: any) => ({
        ...item,
        progress: item.progress?.length > 0 ? item.progress[0] : undefined,
      })),
      nextCursor: content.length > limit ? content[content.length - 1].id : null,
      hasMore: content.length > limit,
    };
  } catch (error) {
    console.error('Error fetching content feed:', error);
    throw new Error('Failed to fetch content');
  }
}
