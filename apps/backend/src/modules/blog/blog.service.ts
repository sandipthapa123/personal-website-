import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { calculateReadingTimeMinutes, slugify } from '@cms/utilities';
import { ContentStatus } from '@cms/constants';

@Injectable()
export class BlogService {
  private inMemoryPosts: any[] = [
    {
      id: 'post-1',
      tenant_id: 'default-tenant-id',
      slug: 'legal-capacity-nepal',
      title: 'Legal Capacity & Supported Decision-Making under UN CRPD in Nepal',
      summary: 'An in-depth analysis of Article 12 of the Convention on the Rights of Persons with Disabilities.',
      content: 'Detailed legal research content on supported decision-making frameworks in Nepalese jurisprudence...',
      locale: 'en',
      status: ContentStatus.PUBLISHED,
      reading_time: 9,
      word_count: 2150,
      views: 4890,
      author_name: 'Sandip Thapa',
      published_at: new Date('2026-07-30T14:20:00Z'),
      seo_metadata: {
        metaTitle: 'Legal Capacity & Supported Decision-Making in Nepal',
        metaDescription: 'Analysis of UN CRPD Article 12 in Nepalese legal framework.',
      },
    },
    {
      id: 'post-2',
      tenant_id: 'default-tenant-id',
      slug: 'digital-accessibility-public-institutions',
      title: 'Digital Accessibility in Public Institutions: A Right, Not a Luxury',
      summary: 'Evaluating web accessibility compliance across municipal portals in Nepal.',
      content: 'Comprehensive review of WCAG 2.1 AAA standards applied to Nepalese e-governance websites...',
      locale: 'en',
      status: ContentStatus.PUBLISHED,
      reading_time: 7,
      word_count: 1420,
      views: 3420,
      author_name: 'Sandip Thapa',
      published_at: new Date('2026-07-25T18:35:00Z'),
    },
  ];

  private inMemoryCategories: any[] = [
    { id: 'cat-1', name: 'Legal Research', slug: 'legal-research' },
    { id: 'cat-2', name: 'Disability Rights', slug: 'disability-rights' },
    { id: 'cat-3', name: 'Human Rights', slug: 'human-rights' },
    { id: 'cat-4', name: 'Digital Accessibility', slug: 'digital-accessibility' },
  ];

  private inMemoryTags: any[] = [
    { id: 'tag-1', name: 'UN CRPD', slug: 'un-crpd' },
    { id: 'tag-2', name: 'Nepal Law', slug: 'nepal-law' },
    { id: 'tag-3', name: 'WCAG 2.2', slug: 'wcag-2-2' },
  ];

  private inMemoryPoems: any[] = [
    {
      id: 'poem-1',
      tenant_id: 'default-tenant-id',
      slug: 'echoes-of-silence',
      title: 'Echoes of Silence (मौनताका प्रतिध्वनिहरू)',
      collection: 'Nepalese Contemporary Poetry Collection',
      content: 'मौनताका प्रतिध्वनिहरूमा...\nकहीँ न्यायको गुन्जन छ,\nकहीँ अधिकारको आह्वान।',
      author_name: 'Sandip Thapa',
      published_at: new Date('2026-07-25T10:00:00Z'),
    },
  ];

  constructor(private prisma: PrismaService) {}

  async createPost(tenantId: string, data: any) {
    const slug = data.slug || slugify(data.title);
    const readingTime = calculateReadingTimeMinutes(data.content || '');
    const wordCount = (data.content || '').trim().split(/\s+/).length;

    try {
      return await this.prisma.blogPost.create({
        data: {
          tenant_id: tenantId,
          slug,
          title: data.title,
          subtitle: data.subtitle,
          summary: data.summary,
          content: data.content,
          cover_image: data.coverImage,
          locale: data.locale || 'en',
          status: (data.status as ContentStatus) || ContentStatus.PUBLISHED,
          reading_time: readingTime,
          word_count: wordCount,
          author_name: data.authorName || 'Sandip Thapa',
          published_at: data.publishedAt ? new Date(data.publishedAt) : new Date(),
          seo_metadata: data.seoMetadata || null,
        },
      });
    } catch (err) {
      // In-memory fallback
      const newPost = {
        id: `post-${Date.now()}`,
        tenant_id: tenantId,
        slug,
        title: data.title,
        subtitle: data.subtitle,
        summary: data.summary,
        content: data.content,
        cover_image: data.coverImage,
        locale: data.locale || 'en',
        status: data.status || ContentStatus.PUBLISHED,
        reading_time: readingTime,
        word_count: wordCount,
        views: 0,
        author_name: data.authorName || 'Sandip Thapa',
        published_at: new Date(),
      };
      this.inMemoryPosts.unshift(newPost);
      return newPost;
    }
  }

  async updatePost(tenantId: string, id: string, data: any) {
    const readingTime = data.content ? calculateReadingTimeMinutes(data.content) : undefined;
    const wordCount = data.content ? data.content.trim().split(/\s+/).length : undefined;

    try {
      return await this.prisma.blogPost.update({
        where: { id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          summary: data.summary,
          content: data.content,
          cover_image: data.coverImage,
          status: data.status,
          reading_time: readingTime,
          word_count: wordCount,
          seo_metadata: data.seoMetadata,
          updated_at: new Date(),
        },
      });
    } catch (err) {
      const idx = this.inMemoryPosts.findIndex((p) => p.id === id || p.slug === id);
      if (idx !== -1) {
        this.inMemoryPosts[idx] = { ...this.inMemoryPosts[idx], ...data, updated_at: new Date() };
        return this.inMemoryPosts[idx];
      }
      throw new NotFoundException(`Post '${id}' not found`);
    }
  }

  async deletePost(tenantId: string, id: string) {
    try {
      await this.prisma.blogPost.delete({ where: { id } });
      return { success: true, message: `Post ${id} deleted successfully` };
    } catch (err) {
      this.inMemoryPosts = this.inMemoryPosts.filter((p) => p.id !== id && p.slug !== id);
      return { success: true, message: `Post ${id} deleted successfully` };
    }
  }

  async getPostBySlug(tenantId: string, slug: string) {
    try {
      const post = await this.prisma.blogPost.findFirst({
        where: { tenant_id: tenantId, slug },
      });
      if (post) return post;
    } catch (err) {}

    const memoryMatch = this.inMemoryPosts.find((p) => p.slug === slug || p.id === slug);
    if (memoryMatch) return memoryMatch;

    throw new NotFoundException(`Blog post '${slug}' not found`);
  }

  async getPublishedPosts(tenantId: string, limit = 10, page = 1, statusFilter?: string) {
    const skip = (page - 1) * limit;

    try {
      const whereCondition = statusFilter
        ? { tenant_id: tenantId, status: statusFilter as ContentStatus }
        : { tenant_id: tenantId, status: ContentStatus.PUBLISHED };

      const [items, total] = await Promise.all([
        this.prisma.blogPost.findMany({
          where: whereCondition,
          orderBy: { published_at: 'desc' },
          take: limit,
          skip,
        }),
        this.prisma.blogPost.count({ where: whereCondition }),
      ]);

      return { items, total, page, limit };
    } catch (err) {
      const filtered = statusFilter
        ? this.inMemoryPosts.filter((p) => p.status === statusFilter)
        : this.inMemoryPosts;
      const paginated = filtered.slice(skip, skip + limit);
      return { items: paginated, total: filtered.length, page, limit };
    }
  }

  // Categories & Tags
  async getCategories() {
    try {
      return await this.prisma.category.findMany();
    } catch (err) {
      return this.inMemoryCategories;
    }
  }

  async createCategory(name: string) {
    const slug = slugify(name);
    try {
      return await this.prisma.category.create({ data: { name, slug } });
    } catch (err) {
      const cat = { id: `cat-${Date.now()}`, name, slug };
      this.inMemoryCategories.push(cat);
      return cat;
    }
  }

  async getTags() {
    try {
      return await this.prisma.tag.findMany();
    } catch (err) {
      return this.inMemoryTags;
    }
  }

  async createTag(name: string) {
    const slug = slugify(name);
    try {
      return await this.prisma.tag.create({ data: { name, slug } });
    } catch (err) {
      const tag = { id: `tag-${Date.now()}`, name, slug };
      this.inMemoryTags.push(tag);
      return tag;
    }
  }

  // Poems Domain
  async getPoems(tenantId: string) {
    try {
      return await this.prisma.poem.findMany({ where: { tenant_id: tenantId } });
    } catch (err) {
      return this.inMemoryPoems;
    }
  }

  async createPoem(tenantId: string, data: any) {
    const slug = data.slug || slugify(data.title);
    try {
      return await this.prisma.poem.create({
        data: {
          tenant_id: tenantId,
          title: data.title,
          slug,
          collection: data.collection || 'General',
          content: data.content,
          author_name: data.authorName || 'Sandip Thapa',
          published_at: new Date(),
        },
      });
    } catch (err) {
      const poem = {
        id: `poem-${Date.now()}`,
        tenant_id: tenantId,
        slug,
        title: data.title,
        collection: data.collection || 'General',
        content: data.content,
        author_name: data.authorName || 'Sandip Thapa',
        published_at: new Date(),
      };
      this.inMemoryPoems.push(poem);
      return poem;
    }
  }
}
