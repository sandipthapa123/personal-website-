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
  primaryCategory?: string;
  tags: string[];
  series?: string;
  collection?: string;
  authors: string[];
  locale: string; // 'en' | 'ne'
  status: 'DRAFT' | 'PREVIEW' | 'REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  visibility?: 'PUBLIC' | 'PRIVATE' | 'PASSWORD';
  password?: string;
  isSticky?: boolean;
  allowComments?: boolean;
  postFormat?: 'standard' | 'aside' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio';
  views: number;
  wordCount: number;
  readingTime: number;
  featuredImage?: {
    url?: string;
    alt?: string;
    caption?: string;
    description?: string;
    title?: string;
  };
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogImage?: string;
    robots?: string;
    jsonLd?: Record<string, any>;
  };
  accessibilityStatus?: {
    score: number;
    wcagLevel: string;
    compliant: boolean;
  };
  customFields?: Record<string, any>;
  revisions?: Array<{
    id: string;
    title: string;
    content: string;
    updatedAt: string;
  }>;
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

export interface ICategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  displayOrder: number;
  icon?: string;
  status: 'ACTIVE' | 'INACTIVE';
  seoTitle?: string;
  seoDescription?: string;
  count: number;
  children?: ICategoryItem[];
  createdAt: string;
  updatedAt: string;
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
    ['Page', { id: 'type-16', name: 'Page', slug: 'page', description: 'Standalone pages (Home, About, Contact)', isSystem: true, count: 0 }],
  ]);

  // MASTER CATEGORY REPOSITORY (SINGLE SOURCE OF TRUTH)
  private categoriesRepository: Map<string, ICategoryItem> = new Map();

  // SINGLE SOURCE OF TRUTH REPOSITORY FOR CONTENT
  private repository: Map<string, IUniversalContentItem> = new Map();

  constructor() {
    this.seedMasterCategories();
    this.seedDefaultContent();
  }

  private seedMasterCategories() {
    const defaultCategories: Partial<ICategoryItem>[] = [
      { id: 'cat-1', name: 'Legal Research', slug: 'legal-research', description: 'Legal analysis, CRPD studies, and statutory reviews', parentId: null, displayOrder: 1, icon: '⚖️', status: 'ACTIVE' },
      { id: 'cat-2', name: 'UN CRPD Analysis', slug: 'un-crpd-analysis', description: 'Article 12 and legal capacity frameworks', parentId: 'cat-1', displayOrder: 1, icon: '📜', status: 'ACTIVE' },
      { id: 'cat-3', name: 'Constitutional Reforms', slug: 'constitutional-reforms', description: 'Nepalese constitutional rights and amendments', parentId: 'cat-1', displayOrder: 2, icon: '🏛️', status: 'ACTIVE' },
      { id: 'cat-4', name: 'Disability Rights', slug: 'disability-rights', description: 'Advocacy, policy briefs, and inclusive governance', parentId: null, displayOrder: 2, icon: '♿', status: 'ACTIVE' },
      { id: 'cat-5', name: 'Inclusive Education', slug: 'inclusive-education', description: 'Accessible learning standards and educational policy', parentId: 'cat-4', displayOrder: 1, icon: '🎓', status: 'ACTIVE' },
      { id: 'cat-6', name: 'Human Rights', slug: 'human-rights', description: 'International human rights law and treaties', parentId: null, displayOrder: 3, icon: '🕊️', status: 'ACTIVE' },
      { id: 'cat-7', name: 'Literature & Poetry', slug: 'literature-poetry', description: 'Literary works, translations, and poems', parentId: null, displayOrder: 4, icon: '✒️', status: 'ACTIVE' },
      { id: 'cat-8', name: 'Digital Accessibility', slug: 'digital-accessibility', description: 'WCAG 2.2 AAA compliance, braille engines, and screen reader standards', parentId: null, displayOrder: 5, icon: '🌐', status: 'ACTIVE' },
      { id: 'cat-9', name: 'Academic Publishing', slug: 'academic-publishing', description: 'Journal articles, citations, and books', parentId: null, displayOrder: 6, icon: '📖', status: 'ACTIVE' },
    ];

    defaultCategories.forEach((cat) => {
      const fullCat: ICategoryItem = {
        id: cat.id || `cat-${Date.now()}`,
        name: cat.name || 'Untitled Category',
        slug: cat.slug || slugify(cat.name || 'untitled'),
        description: cat.description || '',
        parentId: cat.parentId || null,
        displayOrder: cat.displayOrder || 0,
        icon: cat.icon || '📁',
        status: cat.status || 'ACTIVE',
        seoTitle: `${cat.name} | Category Archive`,
        seoDescription: cat.description,
        count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.categoriesRepository.set(fullCat.id, fullCat);
    });
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
        categories: ['Legal Research', 'Disability Rights', 'UN CRPD Analysis'],
        primaryCategory: 'UN CRPD Analysis',
        tags: ['UN CRPD', 'Nepal Law', 'Legal Capacity'],
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
        categories: ['Literature & Poetry', 'Human Rights'],
        primaryCategory: 'Literature & Poetry',
        tags: ['Poetry', 'Justice', 'Nepal Literature'],
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
        categories: ['Legal Research', 'Academic Publishing'],
        primaryCategory: 'Legal Research',
        tags: ['UN CRPD', 'Policy Brief', 'Kathmandu Law Review'],
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
        categories: ['Digital Accessibility'],
        primaryCategory: 'Digital Accessibility',
        tags: ['WCAG 2.2', 'E-Governance', 'Accessibility Audit'],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
        publishedAt: new Date('2026-07-20T11:15:00Z').toISOString(),
      },
      {
        id: 'page-home',
        title: 'Home',
        slug: 'home',
        summary: 'Welcome to the platform',
        content: 'Home page content',
        contentTypes: ['Page'],
        categories: [],
        primaryCategory: undefined,
        tags: [],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
      },
      {
        id: 'page-about',
        title: 'About',
        slug: 'about',
        summary: 'About Sandip Thapa',
        content: 'About me content',
        contentTypes: ['Page'],
        categories: [],
        primaryCategory: undefined,
        tags: [],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
      },
      {
        id: 'page-contact',
        title: 'Contact',
        slug: 'contact',
        summary: 'Contact Sandip Thapa',
        content: 'Contact form and details',
        contentTypes: ['Page'],
        categories: [],
        primaryCategory: undefined,
        tags: [],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
      },
      {
        id: 'page-biography',
        title: 'Biography',
        slug: 'biography',
        summary: 'Detailed Biography',
        content: 'Biography content',
        contentTypes: ['Page'],
        categories: [],
        primaryCategory: undefined,
        tags: [],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
      },
      {
        id: 'page-education',
        title: 'Education & Credentials',
        slug: 'education',
        summary: 'Educational background',
        content: 'Education content',
        contentTypes: ['Page'],
        categories: [],
        primaryCategory: undefined,
        tags: [],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
      },
      {
        id: 'page-experience',
        title: 'Experience & Roles',
        slug: 'experience',
        summary: 'Professional experience',
        content: 'Experience content',
        contentTypes: ['Page'],
        categories: [],
        primaryCategory: undefined,
        tags: [],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
      },
      {
        id: 'page-resume',
        title: 'Curriculum Vitae',
        slug: 'resume',
        summary: 'Downloadable CV',
        content: 'Resume content',
        contentTypes: ['Page'],
        categories: [],
        primaryCategory: undefined,
        tags: [],
        authors: ['Sandip Thapa'],
        locale: 'en',
        status: 'PUBLISHED',
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
        categories: item.categories || ['Legal Research'],
        primaryCategory: item.primaryCategory || (item.categories && item.categories[0]) || 'Legal Research',
        tags: item.tags || [],
        authors: item.authors || ['Sandip Thapa'],
        locale: item.locale || 'en',
        status: item.status || 'DRAFT',
        visibility: 'PUBLIC',
        isSticky: false,
        allowComments: true,
        postFormat: 'standard',
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
  // MASTER CATEGORIES MANAGEMENT (SINGLE SOURCE OF TRUTH)
  // ----------------------------------------------------

  getAllCategories(): ICategoryItem[] {
    const categories = Array.from(this.categoriesRepository.values());
    const contentItems = Array.from(this.repository.values()).filter((i) => !i.isDeleted);

    return categories.map((cat) => {
      const count = contentItems.filter((i) =>
        i.categories.some((c) => c.toLowerCase() === cat.name.toLowerCase() || c.toLowerCase() === cat.slug.toLowerCase())
      ).length;
      return { ...cat, count };
    });
  }

  getCategoryTree(): ICategoryItem[] {
    const flat = this.getAllCategories();
    const map = new Map<string, ICategoryItem>();
    const roots: ICategoryItem[] = [];

    flat.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    flat.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  createCategory(dto: Partial<ICategoryItem>): ICategoryItem {
    const name = (dto.name || '').trim();
    if (!name) throw new Error('Category name is required.');

    const slug = dto.slug ? slugify(dto.slug) : slugify(name);
    const existing = Array.from(this.categoriesRepository.values()).find((c) => c.slug === slug);
    if (existing) return existing;

    const newCat: ICategoryItem = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      slug,
      description: dto.description || '',
      parentId: dto.parentId || null,
      displayOrder: dto.displayOrder || 0,
      icon: dto.icon || '📁',
      status: dto.status || 'ACTIVE',
      seoTitle: dto.seoTitle || `${name} | Category Archive`,
      seoDescription: dto.seoDescription || dto.description || '',
      count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.categoriesRepository.set(newCat.id, newCat);
    return newCat;
  }

  updateCategory(id: string, dto: Partial<ICategoryItem>): ICategoryItem {
    const existing = this.categoriesRepository.get(id);
    if (!existing) throw new NotFoundException(`Category with ID "${id}" not found.`);

    if (dto.name) {
      const oldName = existing.name;
      existing.name = dto.name.trim();
      existing.slug = dto.slug ? slugify(dto.slug) : slugify(existing.name);

      // PROPAGATE NAME CHANGES AUTOMATICALLY ACROSS ALL CONTENT
      for (const [itemId, item] of this.repository.entries()) {
        let updated = false;
        if (item.categories.includes(oldName)) {
          item.categories = item.categories.map((c) => (c === oldName ? existing.name : c));
          updated = true;
        }
        if (item.primaryCategory === oldName) {
          item.primaryCategory = existing.name;
          updated = true;
        }
        if (updated) {
          item.updatedAt = new Date().toISOString();
          this.repository.set(itemId, item);
        }
      }
    }

    if (dto.description !== undefined) existing.description = dto.description;
    if (dto.parentId !== undefined) existing.parentId = dto.parentId;
    if (dto.displayOrder !== undefined) existing.displayOrder = dto.displayOrder;
    if (dto.icon !== undefined) existing.icon = dto.icon;
    if (dto.status !== undefined) existing.status = dto.status;
    if (dto.seoTitle !== undefined) existing.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) existing.seoDescription = dto.seoDescription;

    existing.updatedAt = new Date().toISOString();
    this.categoriesRepository.set(id, existing);
    return existing;
  }

  deleteCategory(id: string): boolean {
    const existing = this.categoriesRepository.get(id);
    if (!existing) return false;
    this.categoriesRepository.delete(id);
    return true;
  }

  mergeCategories(targetId: string, sourceIds: string[]): ICategoryItem {
    const target = this.categoriesRepository.get(targetId);
    if (!target) throw new NotFoundException(`Target category ID "${targetId}" not found.`);

    sourceIds.forEach((srcId) => {
      const src = this.categoriesRepository.get(srcId);
      if (src && srcId !== targetId) {
        // Re-assign items from source to target
        for (const [itemId, item] of this.repository.entries()) {
          if (item.categories.includes(src.name)) {
            item.categories = item.categories.map((c) => (c === src.name ? target.name : c)).filter((v, i, a) => a.indexOf(v) === i);
            if (item.primaryCategory === src.name) item.primaryCategory = target.name;
            item.updatedAt = new Date().toISOString();
            this.repository.set(itemId, item);
          }
        }
        this.categoriesRepository.delete(srcId);
      }
    });

    return this.getAllCategories().find((c) => c.id === targetId)!;
  }

  // ----------------------------------------------------
  // MASTER TAGS ENGINE
  // ----------------------------------------------------

  getAllTags(): Array<{ name: string; count: number }> {
    const tagMap = new Map<string, number>();
    for (const item of this.repository.values()) {
      if (!item.isDeleted && item.tags) {
        item.tags.forEach((t) => {
          const clean = t.trim();
          if (clean) tagMap.set(clean, (tagMap.get(clean) || 0) + 1);
        });
      }
    }
    return Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }));
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
      items = items.filter((item) => (
        item.title.toLowerCase().includes(s) ||
        item.summary.toLowerCase().includes(s) ||
        item.content.toLowerCase().includes(s) ||
        item.slug.toLowerCase().includes(s)
      ));
    }

    const total = items.length;
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const startIndex = (page - 1) * limit;
    const sliced = items.slice(startIndex, startIndex + limit);

    return {
      items: sliced,
      total,
      page,
      limit,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
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
    const cleanSlug = slug.toLowerCase().trim();
    const item = Array.from(this.repository.values()).find((i) => !i.isDeleted && (i.slug.toLowerCase() === cleanSlug || i.slug.toLowerCase() === slugify(cleanSlug)));
    if (!item) {
      throw new NotFoundException(`Content item with slug "${slug}" not found.`);
    }
    return item;
  }

  createContent(dto: Partial<IUniversalContentItem>): IUniversalContentItem {
    const title = (dto.title || '').trim();
    if (!title) throw new Error('Title is required.');

    const slug = dto.slug ? slugify(dto.slug) : slugify(title);
    const now = new Date().toISOString();

    const newItem: IUniversalContentItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      tenantId: dto.tenantId || 'default-tenant-id',
      title,
      slug,
      slugMode: dto.slugMode || 'AUTO',
      summary: dto.summary || '',
      content: dto.content || '',
      contentTypes: dto.contentTypes && dto.contentTypes.length ? dto.contentTypes : ['Article'],
      categories: dto.categories && dto.categories.length ? dto.categories : ['Legal Research'],
      primaryCategory: dto.primaryCategory || (dto.categories && dto.categories[0]) || 'Legal Research',
      tags: dto.tags || [],
      series: dto.series,
      collection: dto.collection,
      authors: dto.authors && dto.authors.length ? dto.authors : ['Sandip Thapa'],
      locale: dto.locale || 'en',
      status: dto.status || 'DRAFT',
      visibility: dto.visibility || 'PUBLIC',
      password: dto.password,
      isSticky: dto.isSticky || false,
      allowComments: dto.allowComments !== false,
      postFormat: dto.postFormat || 'standard',
      views: 0,
      wordCount: dto.content ? dto.content.split(/\s+/).length : 0,
      readingTime: dto.content ? calculateReadingTimeMinutes(dto.content) : 1,
      featuredImage: dto.featuredImage,
      seoMetadata: dto.seoMetadata,
      accessibilityStatus: {
        score: 100,
        wcagLevel: 'AAA',
        compliant: true,
      },
      customFields: dto.customFields || {},
      revisions: [
        {
          id: `rev-${Date.now()}`,
          title: title,
          content: dto.content || '',
          updatedAt: now,
        },
      ],
      version: 1,
      isDeleted: false,
      publishedAt: dto.status === 'PUBLISHED' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.repository.set(newItem.id, newItem);
    return newItem;
  }

  updateContent(id: string, dto: Partial<IUniversalContentItem>): IUniversalContentItem {
    const existing = this.getContentById(id);
    const now = new Date().toISOString();

    if (dto.title !== undefined) existing.title = dto.title;
    if (dto.slug !== undefined) existing.slug = slugify(dto.slug);
    if (dto.slugMode !== undefined) existing.slugMode = dto.slugMode;
    if (dto.summary !== undefined) existing.summary = dto.summary;
    if (dto.content !== undefined) {
      existing.content = dto.content;
      existing.wordCount = dto.content.split(/\s+/).length;
      existing.readingTime = calculateReadingTimeMinutes(dto.content);
    }
    if (dto.contentTypes !== undefined && dto.contentTypes.length) existing.contentTypes = dto.contentTypes;
    if (dto.categories !== undefined) existing.categories = dto.categories;
    if (dto.primaryCategory !== undefined) existing.primaryCategory = dto.primaryCategory;
    if (dto.tags !== undefined) existing.tags = dto.tags;
    if (dto.series !== undefined) existing.series = dto.series;
    if (dto.collection !== undefined) existing.collection = dto.collection;
    if (dto.authors !== undefined) existing.authors = dto.authors;
    if (dto.locale !== undefined) existing.locale = dto.locale;
    if (dto.status !== undefined) {
      existing.status = dto.status;
      if (dto.status === 'PUBLISHED' && !existing.publishedAt) {
        existing.publishedAt = now;
      }
    }
    if (dto.visibility !== undefined) existing.visibility = dto.visibility;
    if (dto.password !== undefined) existing.password = dto.password;
    if (dto.isSticky !== undefined) existing.isSticky = dto.isSticky;
    if (dto.allowComments !== undefined) existing.allowComments = dto.allowComments;
    if (dto.postFormat !== undefined) existing.postFormat = dto.postFormat;
    if (dto.featuredImage !== undefined) existing.featuredImage = dto.featuredImage;

    // NON-DESTRUCTIVE SEO UPDATE: Only update if new values are provided and non-empty
    if (dto.seoMetadata) {
      existing.seoMetadata = existing.seoMetadata || {};
      if (dto.seoMetadata.metaTitle) existing.seoMetadata.metaTitle = dto.seoMetadata.metaTitle;
      if (dto.seoMetadata.metaDescription) existing.seoMetadata.metaDescription = dto.seoMetadata.metaDescription;
      if (dto.seoMetadata.focusKeyword) existing.seoMetadata.focusKeyword = dto.seoMetadata.focusKeyword;
      if (dto.seoMetadata.canonicalUrl) existing.seoMetadata.canonicalUrl = dto.seoMetadata.canonicalUrl;
      if (dto.seoMetadata.ogImage) existing.seoMetadata.ogImage = dto.seoMetadata.ogImage;
      if (dto.seoMetadata.robots) existing.seoMetadata.robots = dto.seoMetadata.robots;
      if (dto.seoMetadata.jsonLd) existing.seoMetadata.jsonLd = dto.seoMetadata.jsonLd;
    }

    if (dto.customFields) existing.customFields = { ...existing.customFields, ...dto.customFields };

    existing.version += 1;
    existing.updatedAt = now;

    existing.revisions = existing.revisions || [];
    existing.revisions.unshift({
      id: `rev-${Date.now()}`,
      title: existing.title,
      content: existing.content,
      updatedAt: now,
    });
    if (existing.revisions.length > 10) existing.revisions.pop();

    this.repository.set(id, existing);
    return existing;
  }

  deleteContent(id: string): boolean {
    const existing = this.getContentById(id);
    existing.isDeleted = true;
    existing.deletedAt = new Date().toISOString();
    this.repository.set(id, existing);
    return true;
  }

  softDeleteContent(id: string): boolean {
    return this.deleteContent(id);
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

  // ─── ENTERPRISE WORKFLOW OPERATIONS ─────────────────────────────────────────

  publishContent(id: string): IUniversalContentItem {
    const item = this.getContentById(id);
    const now = new Date().toISOString();
    item.status = 'PUBLISHED';
    item.publishedAt = item.publishedAt || now;
    item.updatedAt = now;
    item.version += 1;
    item.revisions = item.revisions || [];
    item.revisions.unshift({ id: `rev-${Date.now()}`, title: item.title, content: item.content, updatedAt: now });
    if (item.revisions.length > 25) item.revisions.pop();
    this.repository.set(id, item);
    return item;
  }

  unpublishContent(id: string): IUniversalContentItem {
    const item = this.getContentById(id);
    const now = new Date().toISOString();
    item.status = 'DRAFT';
    item.updatedAt = now;
    item.version += 1;
    item.revisions = item.revisions || [];
    item.revisions.unshift({ id: `rev-${Date.now()}`, title: item.title, content: item.content, updatedAt: now });
    if (item.revisions.length > 25) item.revisions.pop();
    this.repository.set(id, item);
    return item;
  }

  archiveContent(id: string): IUniversalContentItem {
    const item = this.getContentById(id);
    const now = new Date().toISOString();
    item.status = 'ARCHIVED';
    item.updatedAt = now;
    item.version += 1;
    this.repository.set(id, item);
    return item;
  }

  scheduleContent(id: string, scheduledAt: string): IUniversalContentItem {
    const item = this.getContentById(id);
    const now = new Date().toISOString();
    item.status = 'SCHEDULED';
    item.scheduledAt = scheduledAt;
    item.updatedAt = now;
    item.version += 1;
    this.repository.set(id, item);
    return item;
  }

  duplicateContent(id: string): IUniversalContentItem {
    const source = this.getContentById(id);
    const now = new Date().toISOString();
    const copy: IUniversalContentItem = {
      ...JSON.parse(JSON.stringify(source)),
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: `Copy of ${source.title}`,
      slug: slugify(`copy-of-${source.slug}-${Date.now()}`),
      status: 'DRAFT',
      publishedAt: undefined,
      scheduledAt: undefined,
      views: 0,
      version: 1,
      isDeleted: false,
      deletedAt: undefined,
      revisions: [{ id: `rev-${Date.now()}`, title: `Copy of ${source.title}`, content: source.content, updatedAt: now }],
      createdAt: now,
      updatedAt: now,
    };
    this.repository.set(copy.id, copy);
    return copy;
  }

  cloneContent(id: string, overrides: Partial<IUniversalContentItem> = {}): IUniversalContentItem {
    return this.duplicateContent(id);
  }

  // ─── BULK OPERATIONS ─────────────────────────────────────────────────────────

  async bulkOperation(
    operation: 'publish' | 'unpublish' | 'archive' | 'delete' | 'restore' | 'permanent-delete' | 'export',
    ids: string[],
  ): Promise<{ processed: number; failed: number; results: Array<{ id: string; success: boolean; error?: string }> }> {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    let processed = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        switch (operation) {
          case 'publish': this.publishContent(id); break;
          case 'unpublish': this.unpublishContent(id); break;
          case 'archive': this.archiveContent(id); break;
          case 'delete': this.softDeleteContent(id); break;
          case 'restore': this.restoreContent(id); break;
          case 'permanent-delete': this.permanentDeleteContent(id); break;
          case 'export': break; // handled by caller
        }
        results.push({ id, success: true });
        processed++;
      } catch (err: any) {
        results.push({ id, success: false, error: err?.message || 'Unknown error' });
        failed++;
      }
    }

    return { processed, failed, results };
  }

  // ─── REVISIONS / VERSION HISTORY ─────────────────────────────────────────────

  getRevisions(id: string): Array<{ id: string; title: string; content: string; updatedAt: string; version?: number }> {
    const item = this.getContentById(id);
    return (item.revisions || []).map((r, i) => ({
      ...r,
      version: (item.version || 1) - i,
    }));
  }

  restoreRevision(contentId: string, revisionId: string): IUniversalContentItem {
    const item = this.getContentById(contentId);
    const revision = (item.revisions || []).find((r) => r.id === revisionId);
    if (!revision) throw new NotFoundException(`Revision ${revisionId} not found`);

    const now = new Date().toISOString();
    // Save current state as new revision before restoring
    item.revisions = item.revisions || [];
    item.revisions.unshift({ id: `rev-${Date.now()}`, title: item.title, content: item.content, updatedAt: now });

    // Restore
    item.title = revision.title;
    item.content = revision.content;
    item.wordCount = revision.content ? revision.content.split(/\s+/).length : 0;
    item.readingTime = revision.content ? calculateReadingTimeMinutes(revision.content) : 1;
    item.version += 1;
    item.updatedAt = now;
    if (item.revisions.length > 25) item.revisions.pop();

    this.repository.set(contentId, item);
    return item;
  }

  // ─── STATS & DASHBOARD ───────────────────────────────────────────────────────

  getContentStats(): Record<string, any> {
    const all = Array.from(this.repository.values());
    const live = all.filter((i) => !i.isDeleted);
    const deleted = all.filter((i) => i.isDeleted);

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const item of live) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      for (const t of item.contentTypes) {
        byType[t] = (byType[t] || 0) + 1;
      }
    }

    return {
      total: live.length,
      trash: deleted.length,
      published: byStatus['PUBLISHED'] || 0,
      drafts: byStatus['DRAFT'] || 0,
      scheduled: byStatus['SCHEDULED'] || 0,
      archived: byStatus['ARCHIVED'] || 0,
      pending: byStatus['REVIEW'] || 0,
      byType,
      byStatus,
      totalViews: live.reduce((sum, i) => sum + (i.views || 0), 0),
      totalWords: live.reduce((sum, i) => sum + (i.wordCount || 0), 0),
      categoriesCount: this.categoriesRepository.size,
      tagsCount: this.getAllTags().length,
    };
  }

  getRecentActivity(limit = 10): IUniversalContentItem[] {
    return Array.from(this.repository.values())
      .filter((i) => !i.isDeleted)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  // ─── ADVANCED SEARCH / FILTER / SORT / PAGINATE ─────────────────────────────

  searchContent(opts: {
    query?: string;
    type?: string;
    status?: string;
    locale?: string;
    category?: string;
    tag?: string;
    author?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'status' | 'createdAt' | 'updatedAt' | 'views';
    sortOrder?: 'asc' | 'desc';
    includeDeleted?: boolean;
  }): { items: IUniversalContentItem[]; total: number; page: number; limit: number; totalPages: number } {
    const {
      query = '',
      type = '',
      status = '',
      locale = '',
      category = '',
      tag = '',
      author = '',
      dateFrom = '',
      dateTo = '',
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      includeDeleted = false,
    } = opts;

    let items = Array.from(this.repository.values());

    if (!includeDeleted) items = items.filter((i) => !i.isDeleted);
    if (type && type !== 'ALL') items = items.filter((i) => i.contentTypes.some((t) => t.toLowerCase() === type.toLowerCase()));
    if (status && status !== 'ALL') items = items.filter((i) => i.status === status);
    if (locale) items = items.filter((i) => i.locale === locale);
    if (category) items = items.filter((i) => i.categories.some((c) => c.toLowerCase().includes(category.toLowerCase())));
    if (tag) items = items.filter((i) => i.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())));
    if (author) items = items.filter((i) => i.authors.some((a) => a.toLowerCase().includes(author.toLowerCase())));
    if (dateFrom) items = items.filter((i) => new Date(i.createdAt) >= new Date(dateFrom));
    if (dateTo) items = items.filter((i) => new Date(i.createdAt) <= new Date(dateTo));
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((i) =>
        (i.title || '').toLowerCase().includes(q) ||
        (i.summary || '').toLowerCase().includes(q) ||
        (i.content || '').toLowerCase().includes(q) ||
        (i.slug || '').toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q)) ||
        i.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    // Sort
    items.sort((a, b) => {
      let va: any = a[sortBy] || '';
      let vb: any = b[sortBy] || '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const pageNum = Math.max(1, Math.min(page, totalPages || 1));
    const sliced = items.slice((pageNum - 1) * limit, pageNum * limit);

    return { items: sliced, total, page: pageNum, limit, totalPages };
  }

  getContentByStatus(status: string): IUniversalContentItem[] {
    return Array.from(this.repository.values()).filter((i) => !i.isDeleted && i.status === status);
  }

  getScheduledDue(): IUniversalContentItem[] {
    const now = new Date();
    return Array.from(this.repository.values()).filter(
      (i) => !i.isDeleted && i.status === 'SCHEDULED' && i.scheduledAt && new Date(i.scheduledAt) <= now,
    );
  }

  processScheduledPublishing(): number {
    const due = this.getScheduledDue();
    for (const item of due) {
      this.publishContent(item.id);
    }
    return due.length;
  }

  // ─── EXPORT / IMPORT ─────────────────────────────────────────────────────────

  exportContent(format: 'json' | 'csv' | 'markdown', types?: string[]): string {
    let items = Array.from(this.repository.values()).filter((i) => !i.isDeleted);
    if (types && types.length) {
      items = items.filter((i) => i.contentTypes.some((t) => types.includes(t)));
    }

    if (format === 'json') {
      return JSON.stringify({ exported: new Date().toISOString(), count: items.length, items }, null, 2);
    }

    if (format === 'csv') {
      const headers = 'id,title,slug,status,contentTypes,categories,locale,createdAt,publishedAt';
      const rows = items.map((i) =>
        [i.id, `"${i.title}"`, i.slug, i.status, i.contentTypes.join('|'), i.categories.join('|'), i.locale, i.createdAt, i.publishedAt || ''].join(',')
      );
      return [headers, ...rows].join('\n');
    }

    if (format === 'markdown') {
      return items
        .map((i) => `# ${i.title}\n\n**Status:** ${i.status} | **Types:** ${i.contentTypes.join(', ')}\n\n${i.content || ''}`)
        .join('\n\n---\n\n');
    }

    return '';
  }

  importContent(items: Partial<IUniversalContentItem>[]): { imported: number; skipped: number; errors: string[] } {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const dto of items) {
      try {
        if (!dto.title) { skipped++; errors.push('Missing title'); continue; }
        const existing = dto.slug ? this.getContentBySlug(dto.slug) : null;
        if (existing) { skipped++; errors.push(`Slug ${dto.slug} already exists`); continue; }
        this.createContent(dto);
        imported++;
      } catch (err: any) {
        errors.push(err?.message || 'Unknown error');
        skipped++;
      }
    }

    return { imported, skipped, errors };
  }
}

