import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { calculateReadingTimeMinutes, slugify } from '@cms/utilities';
import { ContentStatus } from '@cms/constants';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async createPost(tenantId: string, data: { title: string; content: string; summary?: string; locale?: string }) {
    const slug = slugify(data.title);
    const readingTime = calculateReadingTimeMinutes(data.content);

    return this.prisma.blogPost.create({
      data: {
        tenant_id: tenantId,
        slug,
        title: data.title,
        summary: data.summary,
        content: data.content,
        locale: data.locale || 'en',
        status: ContentStatus.PUBLISHED,
        reading_time: readingTime,
        published_at: new Date(),
      },
    });
  }

  async getPostBySlug(tenantId: string, slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { tenant_id: tenantId, slug, status: ContentStatus.PUBLISHED },
    });

    if (!post) {
      throw new NotFoundException(`Blog post '${slug}' not found`);
    }

    return post;
  }

  async getPublishedPosts(tenantId: string, limit = 10, page = 1) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: { tenant_id: tenantId, status: ContentStatus.PUBLISHED },
        orderBy: { published_at: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.blogPost.count({
        where: { tenant_id: tenantId, status: ContentStatus.PUBLISHED },
      }),
    ]);

    return { items, total, page, limit };
  }
}
