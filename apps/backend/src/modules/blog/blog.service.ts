import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UniversalContentService, IUniversalContentItem } from '../content/universal-content.service';
import { slugify, calculateReadingTimeMinutes } from '@cms/utilities';
import { ContentStatus } from '@cms/constants';

@Injectable()
export class BlogService {
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

  constructor(
    private prisma: PrismaService,
    private universalService: UniversalContentService,
  ) {}

  async createPost(tenantId: string, data: any) {
    const slug = data.slug || slugify(data.title || 'untitled');
    const contentTypes = data.contentTypes || ['Article'];

    const item = this.universalService.createContent({
      tenantId,
      title: data.title,
      slug,
      summary: data.summary,
      content: data.content,
      contentTypes,
      categories: data.categories || ['General'],
      tags: data.tags || [],
      authors: [data.authorName || 'Sandip Thapa'],
      locale: data.locale || 'en',
      status: (data.status as any) || 'PUBLISHED',
      seoMetadata: data.seoMetadata,
    });

    return item;
  }

  async updatePost(tenantId: string, id: string, data: any) {
    return this.universalService.updateContent(id, data);
  }

  async deletePost(tenantId: string, id: string) {
    this.universalService.softDeleteContent(id);
    return { success: true, message: `Post ${id} moved to Recycle Bin` };
  }

  async getPostBySlug(tenantId: string, slug: string) {
    try {
      return this.universalService.getContentBySlug(slug);
    } catch (err) {
      throw new NotFoundException(`Blog post '${slug}' not found`);
    }
  }

  async getPublishedPosts(tenantId: string, limit = 10, page = 1, statusFilter?: string) {
    const res = this.universalService.getAllContent({
      contentType: 'Article',
      status: statusFilter || 'PUBLISHED',
      page,
      limit,
    });
    return { items: res.items, total: res.total, page: res.page, limit: res.limit };
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
    const res = this.universalService.getAllContent({
      contentType: 'Poem',
      limit: 100,
    });
    return res.items;
  }

  async createPoem(tenantId: string, data: any) {
    return this.universalService.createContent({
      tenantId,
      title: data.title,
      slug: data.slug || slugify(data.title || 'untitled-poem'),
      summary: data.collection || 'General',
      content: data.content,
      contentTypes: ['Poem'],
      authors: [data.authorName || 'Sandip Thapa'],
      status: 'PUBLISHED',
    });
  }
}
