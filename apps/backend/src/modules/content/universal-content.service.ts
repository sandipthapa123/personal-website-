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

  /**
   * Maps the camelCase sort keys the admin console and public API send onto real
   * database columns. Anything unrecognised falls back to `updated_at` — without
   * this whitelist an unknown key reaches Prisma's `orderBy` verbatim and throws,
   * which surfaced as a 500 on every content list (and so an empty admin table).
   */
  private static readonly SORTABLE_COLUMNS: Record<string, string> = {
    updatedAt: 'updated_at',
    updated_at: 'updated_at',
    createdAt: 'created_at',
    created_at: 'created_at',
    publishedAt: 'published_at',
    published_at: 'published_at',
    scheduledAt: 'scheduled_at',
    scheduled_at: 'scheduled_at',
    title: 'title',
    slug: 'slug',
    status: 'status',
    locale: 'locale',
    views: 'views',
    wordCount: 'word_count',
    word_count: 'word_count',
    readingTime: 'reading_time',
    reading_time: 'reading_time',
    contentType: 'content_type',
    content_type: 'content_type',
  };

  private resolveOrderBy(sortBy?: string, sortOrder?: string) {
    const column = UniversalContentService.SORTABLE_COLUMNS[sortBy || ''] || 'updated_at';
    const direction = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
    return { [column]: direction };
  }

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
      where.OR = [
        { title: { contains: searchQ } },
        { summary: { contains: searchQ } },
        { slug: { contains: searchQ } },
      ];
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 20));

    const total = await this.prisma.universalContent.count({ where });
    const items = await this.prisma.universalContent.findMany({
      where,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      orderBy: this.resolveOrderBy(sortBy, sortOrder),
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } }
      }
    });

    return {
      items: items.map(i => this.mapPrismaToDto(i)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
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
    const existing = await this.prisma.universalContent.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Content item with ID "${id}" not found.`);

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
        // Keep the original publication date across later edits — only stamp it the
        // first time an item actually goes live.
        if (!existing.published_at) data.published_at = new Date();
      } else if (dto.status === 'DRAFT' || dto.status === 'ARCHIVED') {
        // Unpublishing must clear the publication date, otherwise the item keeps
        // advertising a published date the public site no longer honours.
        data.published_at = null;
      }
      if (dto.status !== 'SCHEDULED') {
        data.scheduled_at = null;
      }
    }

    // The editor posts the whole item on save; every field it can change has to be
    // persisted here or the change is silently dropped (content type, locale and
    // visibility edits used to disappear on save for exactly this reason).
    if (dto.contentTypes !== undefined && dto.contentTypes.length > 0) data.content_type = dto.contentTypes[0];
    if (dto.slugMode !== undefined) data.slug_mode = dto.slugMode;
    if (dto.locale !== undefined) data.locale = dto.locale;
    if (dto.visibility !== undefined) data.visibility = dto.visibility;
    if (dto.password !== undefined) data.password = dto.password || null;
    if (dto.isSticky !== undefined) data.is_sticky = !!dto.isSticky;
    if (dto.allowComments !== undefined) data.allow_comments = dto.allowComments !== false;
    if (dto.postFormat !== undefined) data.post_format = dto.postFormat;

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
    // Uniquified rather than a bare '-copy' suffix, which collided on the second
    // duplicate of the same item and failed the whole request.
    data.slug = await this.slugGenerator.ensureUniqueSlug(slugify(existing.slug + '-copy'), existing.tenant_id);
    data.status = 'DRAFT';
    data.published_at = null;
    data.scheduled_at = null;
    data.deleted_at = null;
    data.views = 0;
    data.version = 1;
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

  /** The content types the admin console ships navigation and editor entries for. */
  static readonly SYSTEM_CONTENT_TYPES = [
    'Article', 'Poem', 'Research', 'Publication', 'Project', 'Portfolio', 'News',
    'Event', 'Resource', 'Download', 'Announcement', 'Testimonial', 'FAQ', 'Page',
  ];

  /** Live per-type counts of non-deleted content, keyed by content type name. */
  private async countByContentType(): Promise<Record<string, number>> {
    const grouped = await this.prisma.universalContent.groupBy({
      by: ['content_type'],
      where: { deleted_at: null },
      _count: { _all: true },
    });

    const counts: Record<string, number> = {};
    UniversalContentService.SYSTEM_CONTENT_TYPES.forEach((t) => { counts[t] = 0; });
    grouped.forEach((row) => { counts[row.content_type] = row._count._all; });
    return counts;
  }

  async getContentTypes() {
    const counts = await this.countByContentType();
    const systemTypes = UniversalContentService.SYSTEM_CONTENT_TYPES;

    // Any type present in the data but not in the system list was registered by an
    // administrator as a custom type — surface it so it stays manageable.
    const customTypes = Object.keys(counts).filter((name) => !systemTypes.includes(name));

    return [...systemTypes, ...customTypes].map((name, index) => ({
      id: `type-${index + 1}`,
      name,
      slug: slugify(name),
      isSystem: systemTypes.includes(name),
      count: counts[name] || 0,
    }));
  }

  async registerContentType(name: string, description?: string) {
    return { name, slug: slugify(name), description, isSystem: false, count: 0 };
  }

  // ----------------------------------------------------
  // STATS & ACTIVITY
  // ----------------------------------------------------

  /**
   * Live counts backing the admin dashboard tiles and every sidebar badge
   * (`Articles (1)` and friends). Trashed items are excluded everywhere except
   * the dedicated `trash` figure, so the numbers agree with what the tables list.
   */
  async getContentStats() {
    const active = { deleted_at: null };

    const [total, published, drafts, review, scheduled, archived, trash, categoriesCount, tagsCount, aggregates, byType] =
      await Promise.all([
        this.prisma.universalContent.count({ where: active }),
        this.prisma.universalContent.count({ where: { ...active, status: 'PUBLISHED' } }),
        this.prisma.universalContent.count({ where: { ...active, status: 'DRAFT' } }),
        this.prisma.universalContent.count({ where: { ...active, status: 'REVIEW' } }),
        this.prisma.universalContent.count({ where: { ...active, status: 'SCHEDULED' } }),
        this.prisma.universalContent.count({ where: { ...active, status: 'ARCHIVED' } }),
        this.prisma.universalContent.count({ where: { deleted_at: { not: null } } }),
        this.prisma.category.count(),
        this.prisma.tag.count(),
        this.prisma.universalContent.aggregate({
          where: active,
          _sum: { views: true, word_count: true },
        }),
        this.countByContentType(),
      ]);

    return {
      total,
      published,
      drafts,
      review,
      scheduled,
      archived,
      trash,
      categoriesCount,
      tagsCount,
      totalViews: aggregates._sum.views || 0,
      totalWords: aggregates._sum.word_count || 0,
      byType,
    };
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
    const where: any = { deleted_at: null };
    if (types && types.length > 0) where.content_type = { in: types };

    const items = (
      await this.prisma.universalContent.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        include: { categories: { include: { category: true } }, tags: { include: { tag: true } } },
      })
    ).map((i) => this.mapPrismaToDto(i));

    if (format !== 'csv') return items;

    const columns = ['id', 'title', 'slug', 'contentTypes', 'status', 'locale', 'publishedAt', 'updatedAt'];
    const escapeCell = (value: unknown) => {
      const str = Array.isArray(value) ? value.join('|') : value === null || value === undefined ? '' : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    return [
      columns.join(','),
      ...items.map((item) => columns.map((c) => escapeCell((item as any)[c])).join(',')),
    ].join('\n');
  }

  /** Imports items by slug: existing slugs are skipped so a re-run is non-destructive. */
  async importContent(items: any[]) {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const raw of items || []) {
      try {
        const title = (raw?.title || '').trim();
        if (!title) { skipped++; continue; }

        const candidateSlug = raw.slug ? slugify(raw.slug) : slugify(title);
        const clash = await this.prisma.universalContent.findUnique({ where: { slug: candidateSlug } });
        if (clash) { skipped++; continue; }

        await this.createContent({
          title,
          slug: candidateSlug,
          summary: raw.summary || '',
          content: raw.content || '',
          contentTypes: raw.contentTypes?.length ? raw.contentTypes : [raw.contentType || 'Article'],
          locale: raw.locale || 'en',
          status: raw.status || 'DRAFT',
          visibility: raw.visibility || 'PUBLIC',
          seoMetadata: raw.seoMetadata,
          customFields: raw.customFields,
        });
        imported++;
      } catch (err) {
        skipped++;
        errors.push(`${raw?.title || 'untitled'}: ${(err as Error).message}`);
      }
    }

    return { imported, skipped, errors };
  }

  /**
   * Applies one action across many items. Runs per-item rather than as a single
   * `updateMany` so publish/unpublish reuse the same date-stamping rules as a
   * single-item action and one bad id cannot fail the whole batch.
   */
  async bulkOperation(operation: string, ids: string[]) {
    const targetIds = Array.isArray(ids) ? ids.filter(Boolean) : [];
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of targetIds) {
      try {
        switch (operation) {
          case 'publish': await this.publishContent(id); break;
          case 'unpublish': await this.unpublishContent(id); break;
          case 'archive': await this.archiveContent(id); break;
          case 'delete': await this.deleteContent(id); break;
          case 'restore': await this.restoreContent(id); break;
          case 'permanent-delete': await this.permanentDeleteContent(id); break;
          case 'duplicate': await this.duplicateContent(id); break;
          default: throw new Error(`Unsupported bulk operation "${operation}"`);
        }
        processed++;
      } catch (err) {
        failed++;
        errors.push(`${id}: ${(err as Error).message}`);
      }
    }

    return { processed, failed, errors };
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
