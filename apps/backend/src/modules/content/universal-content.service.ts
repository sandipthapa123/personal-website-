import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { slugify, calculateReadingTimeMinutes } from '@cms/utilities';
import { SlugGeneratorService } from '../seo/slug-generator.service';

export interface IUniversalContentItem {
  id?: string;
  tenantId?: string;
  title: string;
  slug?: string;
  slugMode?: 'AUTO' | 'MANUAL';
  summary?: string;
  content: string;
  contentTypes?: string[];
  categories?: string[];
  tags?: string[];
  authors?: string[];
  locale?: string;
  status?: string; // DRAFT, IN_TRANSLATION, REVIEW, APPROVED, SCHEDULED, PUBLISHED, ARCHIVED
  visibility?: string;
  password?: string;
  isSticky?: boolean;
  allowComments?: boolean;
  postFormat?: string;
  featuredImage?: any;
  seoMetadata?: any;
  customFields?: any;
  scheduledAt?: string;
  publishedAt?: string;
}

@Injectable()
export class UniversalContentService {
  constructor(
    private prisma: PrismaService,
    private slugGenerator: SlugGeneratorService,
  ) {}

  /** True for a non-empty, already-clean, ASCII-only slug — safe to use as-is. */
  private isValidEnglishSlug(candidate?: string): boolean {
    if (!candidate) return false;
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(candidate.trim());
  }

  /**
   * Resolves the slug to persist for a piece of content. A candidate slug that
   * already looks like a clean English slug is trusted as-is (e.g. a manual
   * edit, or a slug the "Generate English Slug" button already translated
   * client-side) — this avoids re-translating on every save. Anything missing,
   * empty, or non-English (Nepali title with no candidate/garbage candidate)
   * is regenerated through the translate-and-slugify pipeline and then made
   * unique against existing content.
   */
  private async resolveSlug(candidateSlug: string | undefined, title: string | undefined, contentId?: string): Promise<string> {
    if (candidateSlug) {
      const cleaned = slugify(candidateSlug);
      if (this.isValidEnglishSlug(cleaned)) {
        return this.slugGenerator.ensureUniqueSlug(cleaned, 'default-tenant-id', contentId);
      }
    }

    let effectiveTitle = title;
    if (!effectiveTitle && contentId) {
      const existing = await this.prisma.universalContent.findUnique({ where: { id: contentId }, select: { title: true } });
      effectiveTitle = existing?.title;
    }

    const generated = await this.slugGenerator.generateSlug(effectiveTitle || candidateSlug || 'untitled');
    return this.slugGenerator.ensureUniqueSlug(generated, 'default-tenant-id', contentId);
  }

  // ----------------------------------------------------
  // CATEGORIES MANAGEMENT
  // ----------------------------------------------------

  async getAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { display_order: 'asc' },
    });
  }

  async getCategoryTree() {
    const flat = await this.getAllCategories();
    const map = new Map<string, any>();
    const roots: any[] = [];

    flat.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    flat.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async createCategory(dto: any) {
    const name = (dto.name || '').trim();
    if (!name) throw new Error('Category name is required.');
    const slug = dto.slug ? slugify(dto.slug) : slugify(name);

    return this.prisma.category.create({
      data: {
        name,
        slug,
        description: dto.description || '',
        parent_id: dto.parentId || null,
        display_order: dto.displayOrder || 0,
        icon: dto.icon || '',
        status: dto.status || 'ACTIVE',
        seo_title: dto.seoTitle || '',
        seo_description: dto.seoDescription || '',
      }
    });
  }

  async updateCategory(id: string, dto: any) {
    const data: any = {};
    if (dto.name) {
      data.name = dto.name.trim();
      data.slug = dto.slug ? slugify(dto.slug) : slugify(data.name);
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.parentId !== undefined) data.parent_id = dto.parentId;
    if (dto.displayOrder !== undefined) data.display_order = dto.displayOrder;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return true;
  }

  async mergeCategories(targetId: string, sourceIds: string[]) {
    await this.prisma.category.deleteMany({ where: { id: { in: sourceIds } } });
    return this.prisma.category.findUnique({ where: { id: targetId } });
  }

  // ----------------------------------------------------
  // TAGS
  // ----------------------------------------------------

  async getAllTags() {
    return this.prisma.tag.findMany();
  }

  // ----------------------------------------------------
  // UNIVERSAL CONTENT CRUD
  // ----------------------------------------------------

  async searchContent(query: any) {
    const { type, contentType, status, includeDeleted, page = 1, limit = 20, sortBy = 'updated_at', sortOrder = 'desc', query: searchQ } = query;
    const effectiveType = type || contentType;
    const where: any = {};

    if (effectiveType && effectiveType !== 'ALL') {
      where.content_type = effectiveType;
    }
    if (status && status !== 'ALL' && status !== 'RECYCLE_BIN') {
      where.status = status;
    }
    if (!includeDeleted && status !== 'RECYCLE_BIN') {
      where.deleted_at = null;
    } else if (status === 'RECYCLE_BIN') {
      where.deleted_at = { not: null };
    }
    if (searchQ) {
      where.title = { contains: searchQ };
    }

    const total = await this.prisma.universalContent.count({ where });
    const items = await this.prisma.universalContent.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } }
      }
    });

    return {
      items: items.map(i => this.mapPrismaToDto(i)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAllContent(query?: any) {
    return this.searchContent(query || {});
  }

  async getContentById(id: string) {
    const item = await this.prisma.universalContent.findUnique({
      where: { id },
      include: { categories: { include: { category: true } }, tags: { include: { tag: true } } }
    });
    if (!item) throw new NotFoundException(`Content item with ID "${id}" not found.`);
    return this.mapPrismaToDto(item);
  }

  async getContentBySlug(slug: string) {
    const item = await this.prisma.universalContent.findUnique({
      where: { slug: slug.toLowerCase() },
      include: { categories: { include: { category: true } }, tags: { include: { tag: true } } }
    });
    if (!item) throw new NotFoundException(`Content item with slug "${slug}" not found.`);
    return this.mapPrismaToDto(item);
  }

  async createContent(dto: IUniversalContentItem) {
    const title = (dto.title || '').trim();
    if (!title) throw new Error('Title is required.');
    
    // We need a tenant id. If not provided, use default
    let tenantId = dto.tenantId || 'default-tenant-id';
    const resolvedSlug = await this.resolveSlug(dto.slug, title);

    const created = await this.prisma.universalContent.create({
      data: {
        tenant: {
          connectOrCreate: {
            where: { slug: 'default' },
            create: { id: tenantId, name: 'Default Tenant', slug: 'default', domain: 'localhost' }
          }
        },
        title,
        slug: resolvedSlug,
        slug_mode: dto.slugMode || 'AUTO',
        summary: dto.summary || '',
        content: dto.content || '',
        content_type: (dto.contentTypes && dto.contentTypes[0]) || 'Article',
        locale: dto.locale || 'en',
        status: dto.status || 'DRAFT',
        visibility: dto.visibility || 'PUBLIC',
        password: dto.password,
        is_sticky: dto.isSticky || false,
        allow_comments: dto.allowComments !== false,
        post_format: dto.postFormat || 'standard',
        word_count: dto.content ? dto.content.split(/\s+/).length : 0,
        reading_time: dto.content ? calculateReadingTimeMinutes(dto.content) : 1,
        seo_metadata: dto.seoMetadata ? JSON.stringify(dto.seoMetadata) : null,
        custom_fields: dto.customFields ? JSON.stringify(dto.customFields) : null,
        published_at: dto.status === 'PUBLISHED' ? new Date() : undefined,
        scheduled_at: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      }
    });

    return this.mapPrismaToDto(created);
  }

  async updateContent(id: string, dto: Partial<IUniversalContentItem>) {
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = await this.resolveSlug(dto.slug, dto.title, id);
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.content !== undefined) {
      data.content = dto.content;
      data.word_count = dto.content.split(/\s+/).length;
      data.reading_time = calculateReadingTimeMinutes(dto.content);
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'PUBLISHED') {
        data.published_at = new Date();
      }
    }
    
    // Convert objects to JSON strings
    if (dto.seoMetadata) data.seo_metadata = JSON.stringify(dto.seoMetadata);
    if (dto.customFields) data.custom_fields = JSON.stringify(dto.customFields);
    
    if (dto.scheduledAt) data.scheduled_at = new Date(dto.scheduledAt);

    const updated = await this.prisma.universalContent.update({
      where: { id },
      data,
    });
    
    return this.mapPrismaToDto(updated);
  }

  async deleteContent(id: string) {
    await this.prisma.universalContent.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
    return true;
  }

  async restoreContent(id: string) {
    const restored = await this.prisma.universalContent.update({
      where: { id },
      data: { deleted_at: null }
    });
    return this.mapPrismaToDto(restored);
  }

  async permanentDeleteContent(id: string) {
    await this.prisma.universalContent.delete({ where: { id } });
    return true;
  }

  async publishContent(id: string) {
    return this.updateContent(id, { status: 'PUBLISHED' });
  }

  async unpublishContent(id: string) {
    return this.updateContent(id, { status: 'DRAFT' });
  }

  async archiveContent(id: string) {
    return this.updateContent(id, { status: 'ARCHIVED' });
  }
  
  async duplicateContent(id: string) {
    const existing = await this.prisma.universalContent.findUnique({ where: { id }});
    if (!existing) throw new NotFoundException();
    const data = { ...existing } as any;
    delete data.id;
    delete data.created_at;
    delete data.updated_at;
    data.title = data.title + ' (Copy)';
    data.slug = data.slug + '-copy';
    data.status = 'DRAFT';
    const created = await this.prisma.universalContent.create({ data });
    return this.mapPrismaToDto(created);
  }

  async scheduleContent(id: string, scheduledAt: string) {
    return this.updateContent(id, { status: 'SCHEDULED', scheduledAt });
  }

  // ----------------------------------------------------
  // REVISIONS
  // ----------------------------------------------------

  async getRevisions(id: string) {
    return this.prisma.contentRevision.findMany({ where: { content_id: id }, orderBy: { created_at: 'desc' } });
  }

  async restoreRevision(id: string, revId: string) {
    const rev = await this.prisma.contentRevision.findUnique({ where: { id: revId } });
    if (!rev) throw new NotFoundException();
    return this.updateContent(id, { title: rev.title, content: rev.content });
  }

  // ----------------------------------------------------
  // DYNAMIC CONTENT TYPES
  // ----------------------------------------------------

  async getContentTypes() {
    // This is fixed in this version.
    return [
      { id: 'type-1', name: 'Article', slug: 'article', isSystem: true, count: 0 },
      { id: 'type-2', name: 'Poem', slug: 'poem', isSystem: true, count: 0 },
      { id: 'type-3', name: 'Research', slug: 'research', isSystem: true, count: 0 },
      { id: 'type-4', name: 'Publication', slug: 'publication', isSystem: true, count: 0 },
      { id: 'type-5', name: 'Event', slug: 'event', isSystem: true, count: 0 },
      { id: 'type-6', name: 'Page', slug: 'page', isSystem: true, count: 0 },
    ];
  }

  async registerContentType(name: string, description?: string) {
    return { name, slug: slugify(name), description, isSystem: false, count: 0 };
  }

  // ----------------------------------------------------
  // STATS & ACTIVITY
  // ----------------------------------------------------

  async getContentStats() {
    return { total: await this.prisma.universalContent.count(), published: await this.prisma.universalContent.count({ where: { status: 'PUBLISHED' }}) };
  }

  async getRecentActivity(limit: number) {
    const items = await this.prisma.universalContent.findMany({ take: limit, orderBy: { updated_at: 'desc' }});
    return items.map(i => this.mapPrismaToDto(i));
  }

  // ----------------------------------------------------
  // SCHEDULE PROCESSING
  // ----------------------------------------------------

  async processScheduledPublishing() {
    const now = new Date();
    const scheduled = await this.prisma.universalContent.findMany({
      where: { status: 'SCHEDULED', scheduled_at: { lte: now } }
    });
    for (const item of scheduled) {
      await this.prisma.universalContent.update({
        where: { id: item.id },
        data: { status: 'PUBLISHED', published_at: now }
      });
    }
    return scheduled.length;
  }
  
  async exportContent(format: string, types?: string[]) {
      return [];
  }
  
  async importContent(items: any[]) {
      return { success: true, count: 0 };
  }
  
  async bulkOperation(operation: string, ids: string[]) {
      return { processed: 0, failed: 0 };
  }

  private mapPrismaToDto(item: any): IUniversalContentItem {
    return {
      id: item.id,
      tenantId: item.tenant_id,
      title: item.title,
      slug: item.slug,
      slugMode: item.slug_mode as any,
      summary: item.summary,
      content: item.content,
      contentTypes: [item.content_type],
      categories: item.categories?.map((c: any) => c.category?.name) || [],
      tags: item.tags?.map((t: any) => t.tag?.name) || [],
      locale: item.locale,
      status: item.status as any,
      visibility: item.visibility as any,
      password: item.password,
      isSticky: item.is_sticky,
      allowComments: item.allow_comments,
      postFormat: item.post_format as any,
      views: item.views,
      wordCount: item.word_count,
      readingTime: item.reading_time,
      seoMetadata: item.seo_metadata ? JSON.parse(item.seo_metadata as string) : undefined,
      customFields: item.custom_fields ? JSON.parse(item.custom_fields as string) : undefined,
      version: item.version,
      isDeleted: !!item.deleted_at,
      publishedAt: item.published_at?.toISOString(),
      scheduledAt: item.scheduled_at?.toISOString(),
      createdAt: item.created_at?.toISOString(),
      updatedAt: item.updated_at?.toISOString(),
    } as IUniversalContentItem;
  }
}
