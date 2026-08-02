import { Injectable, NotFoundException } from '@nestjs/common';
import { slugify, calculateReadingTimeMinutes } from '@cms/utilities';

export interface IUniversalContentItem {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  slugMode: 'AUTO' | 'MANUAL';
  summary: string;
  content: string;
  blocks?: any[];
  coverImage?: string;
  galleryImages?: string[];
  contentTypes: string[]; // e.g. ['Article', 'Poem', 'Featured', 'Homepage', 'Research', 'Publication']
  categories: string[];
  tags: string[];
  series?: string;
  collection?: string;
  authors: string[];
  locale: string; // 'en' | 'ne'
  status: 'DRAFT' | 'PREVIEW' | 'REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  views: number;
  wordCount: number;
  readingTime: number;
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  accessibilityStatus?: {
    score: number;
    wcagLevel: string;
    compliant: boolean;
  };
  customFields?: Record<string, any>;
  version: number;
  isDeleted: boolean;
  deletedAt?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IContentTypeDefinition {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  count: number;
}

@Injectable()
export class UniversalContentService {
  private contentTypes: Map<string, IContentTypeDefinition> = new Map([
    ['Article', { id: 'type-1', name: 'Article', slug: 'article', description: 'In-depth articles, essays, and legal critiques', isSystem: true, count: 0 }],
    ['Poem', { id: 'type-2', name: 'Poem', slug: 'poem', description: 'Poetry, literary works, and anthologies', isSystem: true, count: 0 }],
    ['Research', { id: 'type-3', name: 'Research', slug: 'research', description: 'Legal research projects, policy briefs, and working papers', isSystem: true, count: 0 }],
    ['Publication', { id: 'type-4', name: 'Publication', slug: 'publication', description: 'Academic journal articles, books, and conference papers', isSystem: true, count: 0 }],
    ['Project', { id: 'type-5', name: 'Project', slug: 'project', description: 'Active disability rights projects and legal initiatives', isSystem: true, count: 0 }],
    ['Portfolio', { id: 'type-6', name: 'Portfolio', slug: 'portfolio', description: 'Selected academic and advocacy portfolio items', isSystem: true, count: 0 }],
    ['News', { id: 'type-7', name: 'News', slug: 'news', description: 'Press releases, announcements, and media coverages', isSystem: true, count: 0 }],
    ['Event', { id: 'type-8', name: 'Event', slug: 'event', description: 'Speaking engagements, conferences, and workshops', isSystem: true, count: 0 }],
    ['Resource', { id: 'type-9', name: 'Resource', slug: 'resource', description: 'Downloadable legal toolkits, guides, and reference documents', isSystem: true, count: 0 }],
    ['Download', { id: 'type-10', name: 'Download', slug: 'download', description: 'PDF downloads, whitepapers, and legal drafts', isSystem: true, count: 0 }],
    ['Announcement', { id: 'type-11', name: 'Announcement', slug: 'announcement', description: 'Official announcements and policy updates', isSystem: true, count: 0 }],
    ['Testimonial', { id: 'type-12', name: 'Testimonial', slug: 'testimonial', description: 'Endorsements and peer testimonials', isSystem: true, count: 0 }],
    ['FAQ', { id: 'type-13', name: 'FAQ', slug: 'faq', description: 'Frequently asked questions on legal capacity and accessibility', isSystem: true, count: 0 }],
    ['Documentation', { id: 'type-14', name: 'Documentation', slug: 'documentation', description: 'CMS user manuals and API documentation', isSystem: true, count: 0 }],
    ['Featured', { id: 'type-15', name: 'Featured', slug: 'featured', description: 'Featured homepage highlights', isSystem: true, count: 0 }],
  ]);

  // SINGLE SOURCE OF TRUTH REPOSITORY
  private repository: Map<string, IUniversalContentItem> = new Map();

  constructor() {
    this.seedDefaultContent();
  }

  private seedDefaultContent() {
    const defaultItems: Partial<IUniversalContentItem>[] = [
      {
        id: 'item-1',
        title: 'Legal Capacity & Supported Decision-Making under UN CRPD in Nepal',
        slug: 'legal-capacity-nepal',
        summary: 'An in-depth analysis of Article 12 of the Convention on the Rights of Persons with Disabilities.',
        content: 'Detailed legal research content on supported decision-making frameworks in Nepalese jurisprudence...',
        contentTypes: ['Article', 'Research', 'Featured'],
        categories: ['Legal Research', 'Disability Rights'],
        tags: ['UN CRPD', 'Nepal Law'],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
        publishedAt: new Date('2026-07-30T14:20:00Z').toISOString(),
      },
      {
        id: 'item-2',
        title: 'The Journey of Hope',
        slug: 'the-journey-of-hope',
        summary: 'A poetic reflection on rights, justice, and human dignity in Nepal.',
        content: 'Soft echoes in the quiet hall of justice...\nWhere every voice demands equal right to be heard.',
        contentTypes: ['Poem', 'Article', 'Featured'],
        categories: ['Human Rights', 'Literature'],
        tags: ['Poetry', 'Justice'],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
        publishedAt: new Date('2026-07-28T10:00:00Z').toISOString(),
      },
      {
        id: 'item-3',
        title: 'Harmonizing Nepalese Disability Legislation with CRPD Article 12',
        slug: 'harmonizing-nepalese-disability-legislation-crpd',
        summary: 'Evaluation of Rights of Persons with Disabilities Act 2074 against international standards.',
        content: 'Research evaluation examining statutory provisions in Nepal...',
        contentTypes: ['Research', 'Publication'],
        categories: ['Legal Research', 'Policy'],
        tags: ['UN CRPD', 'Policy Brief'],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
        publishedAt: new Date('2026-07-25T16:45:00Z').toISOString(),
      },
      {
        id: 'item-4',
        title: 'Digital Accessibility in Public Institutions: WCAG 2.2 Standard',
        slug: 'digital-accessibility-public-institutions-wcag-2-2',
        summary: 'Audit report on e-governance website compliance in Nepal.',
        content: 'Technical audit report evaluating 45 government portals for WCAG 2.2 AAA compliance...',
        contentTypes: ['Article', 'Resource', 'Documentation'],
        categories: ['Digital Accessibility', 'Tech Policy'],
        tags: ['WCAG 2.2', 'E-Governance'],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
        publishedAt: new Date('2026-07-20T11:15:00Z').toISOString(),
      },
    ];

    defaultItems.forEach((item) => {
      const fullItem: IUniversalContentItem = {
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        tenantId: 'default-tenant-id',
        title: item.title || 'Untitled Content',
        slug: item.slug || slugify(item.title || 'untitled'),
        slugMode: 'AUTO',
        summary: item.summary || '',
        content: item.content || '',
        contentTypes: item.contentTypes || ['Article'],
        categories: item.categories || ['General'],
        tags: item.tags || [],
        authors: item.authors || ['Sandip Thapa'],
        locale: item.locale || 'en',
        status: item.status || 'DRAFT',
        views: item.views || Math.floor(Math.random() * 3000) + 200,
        wordCount: item.content ? item.content.split(/\s+/).length : 0,
        readingTime: item.content ? calculateReadingTimeMinutes(item.content) : 1,
        version: 1,
        isDeleted: false,
        publishedAt: item.publishedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.repository.set(fullItem.id, fullItem);
    });
  }

  // ----------------------------------------------------
  // UNIVERSAL CONTENT CRUD (SINGLE SOURCE OF TRUTH)
  // ----------------------------------------------------

  getAllContent(query?: {
    contentType?: string;
    category?: string;
    tag?: string;
    status?: string;
    search?: string;
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    let items = Array.from(this.repository.values());

    const includeDeleted = query?.includeDeleted === true || query?.status === 'RECYCLE_BIN';
    if (!includeDeleted) {
      items = items.filter((item) => !item.isDeleted);
    } else if (query?.status === 'RECYCLE_BIN') {
      items = items.filter((item) => item.isDeleted);
    }

    if (query?.contentType && query.contentType !== 'ALL') {
      items = items.filter((item) =>
        item.contentTypes.some((t) => t.toLowerCase() === query.contentType!.toLowerCase())
      );
    }

    if (query?.category) {
      items = items.filter((item) =>
        item.categories.some((c) => c.toLowerCase() === query.category!.toLowerCase())
      );
    }

    if (query?.tag) {
      items = items.filter((item) =>
        item.tags.some((t) => t.toLowerCase() === query.tag!.toLowerCase())
      );
    }

    if (query?.status && query.status !== 'ALL' && query.status !== 'RECYCLE_BIN') {
      items = items.filter((item) => item.status === query.status);
    }

    if (query?.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(s) ||
          item.summary.toLowerCase().includes(s) ||
          item.slug.toLowerCase().includes(s)
      );
    }

    // Sorting
    const sortBy = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder || 'desc';
    items.sort((a: any, b: any) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = Math.max(1, Number(query?.page || 1));
    const limit = Math.max(1, Number(query?.limit || 20));
    const total = items.length;
    const paginated = items.slice((page - 1) * limit, page * limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  getContentById(id: string): IUniversalContentItem {
    const item = this.repository.get(id);
    if (!item) {
      throw new NotFoundException(`Content item with ID "${id}" not found.`);
    }
    return item;
  }

  getContentBySlug(slug: string): IUniversalContentItem {
    const item = Array.from(this.repository.values()).find((i) => i.slug === slug);
    if (!item) {
      throw new NotFoundException(`Content item with slug "${slug}" not found.`);
    }
    return item;
  }

  createContent(dto: Partial<IUniversalContentItem>): IUniversalContentItem {
    const id = dto.id || `content-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const title = dto.title || 'Untitled Content';
    const slug = dto.slug || slugify(title);
    const contentTypes = dto.contentTypes && dto.contentTypes.length > 0 ? dto.contentTypes : ['Article'];

    const newItem: IUniversalContentItem = {
      id,
      tenantId: dto.tenantId || 'default-tenant-id',
      title,
      slug,
      slugMode: dto.slugMode || 'AUTO',
      summary: dto.summary || '',
      content: dto.content || '',
      blocks: dto.blocks || [],
      coverImage: dto.coverImage,
      galleryImages: dto.galleryImages || [],
      contentTypes,
      categories: dto.categories || ['General'],
      tags: dto.tags || [],
      series: dto.series,
      collection: dto.collection,
      authors: dto.authors || ['Sandip Thapa'],
      locale: dto.locale || 'en',
      status: dto.status || 'DRAFT',
      views: 0,
      wordCount: dto.content ? dto.content.split(/\s+/).length : 0,
      readingTime: dto.content ? calculateReadingTimeMinutes(dto.content) : 1,
      seoMetadata: dto.seoMetadata || { metaTitle: title, metaDescription: dto.summary },
      accessibilityStatus: dto.accessibilityStatus || { score: 100, wcagLevel: 'AAA', compliant: true },
      customFields: dto.customFields || {},
      version: 1,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.repository.set(id, newItem);
    return newItem;
  }

  updateContent(id: string, dto: Partial<IUniversalContentItem>): IUniversalContentItem {
    const existing = this.getContentById(id);
    const updated: IUniversalContentItem = {
      ...existing,
      ...dto,
      contentTypes: dto.contentTypes !== undefined ? dto.contentTypes : existing.contentTypes,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    if (dto.content) {
      updated.wordCount = dto.content.split(/\s+/).length;
      updated.readingTime = calculateReadingTimeMinutes(dto.content);
    }

    this.repository.set(id, updated);
    return updated;
  }

  softDeleteContent(id: string): IUniversalContentItem {
    const existing = this.getContentById(id);
    existing.isDeleted = true;
    existing.deletedAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    this.repository.set(id, existing);
    return existing;
  }

  restoreContent(id: string): IUniversalContentItem {
    const existing = this.getContentById(id);
    existing.isDeleted = false;
    existing.deletedAt = undefined;
    existing.updatedAt = new Date().toISOString();
    this.repository.set(id, existing);
    return existing;
  }

  permanentDeleteContent(id: string): boolean {
    const existing = this.getContentById(id);
    return this.repository.delete(existing.id);
  }

  addContentTypeToItem(id: string, contentType: string): IUniversalContentItem {
    const existing = this.getContentById(id);
    if (!existing.contentTypes.includes(contentType)) {
      existing.contentTypes.push(contentType);
      existing.updatedAt = new Date().toISOString();
      this.repository.set(id, existing);
    }
    return existing;
  }

  removeContentTypeFromItem(id: string, contentType: string): IUniversalContentItem {
    const existing = this.getContentById(id);
    existing.contentTypes = existing.contentTypes.filter((t) => t !== contentType);
    existing.updatedAt = new Date().toISOString();
    this.repository.set(id, existing);
    return existing;
  }

  // ----------------------------------------------------
  // DYNAMIC CONTENT TYPES ENGINE
  // ----------------------------------------------------

  getContentTypes(): IContentTypeDefinition[] {
    const all = Array.from(this.contentTypes.values());
    const items = Array.from(this.repository.values()).filter((i) => !i.isDeleted);

    return all.map((ct) => {
      const count = items.filter((i) =>
        i.contentTypes.some((t) => t.toLowerCase() === ct.name.toLowerCase())
      ).length;
      return { ...ct, count };
    });
  }

  registerContentType(name: string, description?: string): IContentTypeDefinition {
    const slug = slugify(name);
    const existing = Array.from(this.contentTypes.values()).find((ct) => ct.slug === slug);
    if (existing) return existing;

    const newType: IContentTypeDefinition = {
      id: `type-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      slug,
      description: description || `Custom administrator-defined content type: ${name}`,
      isSystem: false,
      count: 0,
    };

    this.contentTypes.set(name, newType);
    return newType;
  }
}
