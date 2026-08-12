import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UniversalContentService } from '../content/universal-content.service';
import { TenantConfigService } from '../config/tenant-config.service';
import { IPageRenderSchema, IBlockInstance } from '@cms/shared-types';
import { ContentStatus } from '@cms/constants';
import { formatDualCalendarDate } from '@cms/utilities';

@Injectable()
export class RendererService {
  private readonly KNOWN_SECTIONS_WITH_CONTENT = new Set([
    'home',
    '',
    '/',
    'about',
    'about/biography',
    'about/education',
    'about/experience',
    'about/skills',
    'about/resume',
    'articles',
    'articles/categories',
    'research',
    'research/projects',
    'publications',
    'publications/journal-articles',
    'poems',
    'poems/collections',
    'projects',
    'services',
    'services/legal-research',
    'testimonials',
    'faq',
    'contact',
    'dashboard',
    'events',
    'news',
  ]);

  private readonly CONTENT_TYPE_PREFIX_MAP: Record<string, string> = {
    articles: 'Article',
    poems: 'Poem',
    research: 'Research',
    publications: 'Publication',
    projects: 'Project',
    events: 'Event',
    news: 'News',
    resources: 'Resource',
    downloads: 'Download',
  };

  constructor(
    private prisma: PrismaService,
    private universalContentService: UniversalContentService,
    private configService: TenantConfigService,
  ) {}

  /**
   * Bikram Sambat rendering of a real publication date. Returns undefined when the
   * item has no publication date, so the frontend simply omits the field rather
   * than showing an invented one.
   */
  private toBs(publishedAt?: string | Date | null): string | undefined {
    if (!publishedAt) return undefined;
    try {
      return formatDualCalendarDate(publishedAt).bsFormatted;
    } catch {
      return undefined;
    }
  }

  private toAd(publishedAt?: string | Date | null): string | undefined {
    if (!publishedAt) return undefined;
    const date = new Date(publishedAt);
    if (isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  async getRenderSchema(tenantId: string, slug: string, lang = 'en'): Promise<any> {
    return this.renderPageBySlug(tenantId, slug, lang);
  }

  async renderPageBySlug(tenantId: string, slug: string, lang = 'en'): Promise<any> {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '') || 'home';

    if (cleanSlug.startsWith('admin') || cleanSlug.startsWith('api')) {
      throw new NotFoundException('Page not found');
    }

    try {
      const page = await this.prisma.page.findFirst({
        where: {
          tenant_id: tenantId,
          slug: cleanSlug,
        },
        include: {
          layout: {
            include: {
              regions: true,
            },
          },
          region_blocks: {
            include: {
              region: true,
              block: {
                include: {
                  definition: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (page) {
        if (page.status === 'PUBLISHED' && page.region_blocks.length > 0) {
          return this.formatPageResponse(page, tenantId, lang);
        } else {
          return this.getEmptyPageResponse(cleanSlug, tenantId, lang);
        }
      }
    } catch (err) {
      // Log the error but don't throw — fall through to dynamic resolver
      console.error(`Database error rendering page '${cleanSlug}':`, err);
    }

    if (this.KNOWN_SECTIONS_WITH_CONTENT.has(cleanSlug)) {
      return this.getDynamicSectionSchema(cleanSlug, tenantId, lang);
    }

    const segments = cleanSlug.split('/');
    if (segments.length >= 2) {
      const prefix = segments[0].toLowerCase();
      const itemSlug = segments.slice(1).join('/');
      const expectedType = this.CONTENT_TYPE_PREFIX_MAP[prefix];

      if (expectedType) {
        try {
          const item = await this.universalContentService.getContentBySlug(itemSlug);
          if (item && item.status === 'PUBLISHED') {
            return this.getContentDetailSchema(item, tenantId, lang, prefix);
          }
        } catch {
          // Not found — fall through to the empty-page placeholder
        }
      }
    }

    return this.getEmptyPageResponse(cleanSlug, tenantId, lang);
  }

  private getContentDetailSchema(item: any, tenantId: string, lang: string, prefix: string): IPageRenderSchema {
    const seo = item.seoMetadata || {};
    const canonicalSlug = `${prefix}/${item.slug}`;

    return {
      tenant: {
        id: tenantId,
        slug: 'default',
        name: 'Sandip Thapa - Legal Scholar & Disability Rights Researcher',
        domain: 'thapasandip.com.np',
      },
      page: {
        id: item.id,
        slug: `/${canonicalSlug}`,
        title: item.title,
        locale: lang,
        status: item.status as ContentStatus,
        publishedAt: item.publishedAt,
      },
      seo: {
        metaTitle: seo.metaTitle || item.title,
        metaDescription: seo.metaDescription || item.summary || `${item.title} — Sandip Thapa`,
        canonicalUrl: seo.canonicalUrl || `https://thapasandip.com.np/${canonicalSlug}`,
        openGraphImage: seo.openGraphImage || undefined,
      },
      layout: {
        id: `layout-content-${item.id}`,
        name: 'Content Detail Layout',
        regions: {
          header: [],
          sidebar: [],
          main: [
            {
              blockId: `heading-${item.id}`,
              type: 'HEADING',
              props: { text: item.title, level: '1' },
            },
            {
              blockId: `meta-${item.id}`,
              type: 'TEXT_BLOCK',
              props: {
                subheading: [
                  item.readingTime ? `${item.readingTime} min read` : null,
                  item.wordCount ? `${item.wordCount} words` : null,
                  item.views ? `${item.views.toLocaleString('en-US')} views` : null,
                ].filter(Boolean).join(' · '),
                content: item.summary || '',
              },
            },
            {
              blockId: `body-${item.id}`,
              type: 'RICH_TEXT',
              props: { content: item.content || '' },
            },
          ],
          footer: [],
        },
      },
    } as IPageRenderSchema;
  }

  private getEmptyPageResponse(slug: string, tenantId: string, lang: string) {
    const formattedTitle = slug
      .split('/')
      .pop()!
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return {
      success: true,
      pageExists: true,
      published: false,
      status: 'EMPTY',
      title: formattedTitle,
      slug: slug,
      message: 'No published content yet for this page.',
      tenant: {
        id: tenantId,
        slug: 'default',
        name: 'Sandip Thapa Personal CMS Engine',
        domain: 'thapasandip.com.np',
      },
      page: {
        id: `page-empty-${slug}`,
        slug: `/${slug}`,
        title: formattedTitle,
        locale: lang,
        status: 'EMPTY',
      },
      seo: {
        metaTitle: `${formattedTitle} | Sandip Thapa`,
        metaDescription: `There is currently no published content available for ${formattedTitle}.`,
        canonicalUrl: `https://thapasandip.com.np/${slug}`,
      },
      layout: {
        id: `layout-empty-${slug}`,
        name: 'Empty Page Layout',
        regions: {
          header: [],
          sidebar: [],
          main: [],
          footer: [],
        },
      },
    };
  }

  private formatPageResponse(page: any, tenantId: string, lang: string): IPageRenderSchema {
    const regionMap: Record<string, IBlockInstance[]> = {
      header: [],
      sidebar: [],
      main: [],
      footer: [],
    };

    if (page.layout && page.layout.regions) {
      page.layout.regions.forEach((r: any) => {
        if (!regionMap[r.key]) {
          regionMap[r.key] = [];
        }
      });
    }

    page.region_blocks.forEach((rb: any) => {
      const regionKey = rb.region?.key || 'main';
      if (!regionMap[regionKey]) {
        regionMap[regionKey] = [];
      }

      const instance = rb.block;
      if (instance) {
        regionMap[regionKey].push({
          blockId: instance.id,
          type: instance.definition.type,
          props: (instance.json_config as Record<string, any>) || {},
          style: (instance.style_config as Record<string, any>) || {},
        });
      }
    });

    const pageSeo = (page.seo_metadata as Record<string, any>) || {};

    return {
      tenant: {
        id: tenantId,
        slug: 'default',
        name: 'Sandip Thapa Personal CMS Engine',
        domain: 'thapasandip.com.np',
      },
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        locale: lang,
        status: page.status as ContentStatus,
        publishedAt: page.published_at ? page.published_at.toISOString() : undefined,
      },
      seo: {
        metaTitle: pageSeo.meta_title || page.title,
        metaDescription: pageSeo.meta_description || 'Sandip Thapa Academic & Legal Research Engine',
        canonicalUrl: pageSeo.canonical_url || `https://thapasandip.com.np/${page.slug}`,
        openGraphImage: pageSeo.og_image || undefined,
      },
      layout: {
        id: page.layout_id,
        name: page.layout?.name || 'Default Layout',
        regions: regionMap,
      },
    };
  }

  private async getDynamicSectionSchema(slug: string, tenantId: string, lang: string): Promise<IPageRenderSchema> {
    const formattedTitle = slug
      .split('/')
      .pop()!
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const isHomepage = slug === 'home' || slug === '' || slug === '/';

    if (isHomepage) {
      return await this.get14SectionHomepageSchema(tenantId, lang);
    }

    const settings = await this.configService.getPublicSettings(tenantId);
    const profile = settings.profile || {};

    if (slug === 'contact') {
      return this.getContactPageSchema(tenantId, lang, settings, profile);
    }

    const contentTypeMap: Record<string, string> = {
      'articles': 'Article',
      'poems': 'Poem',
      'research': 'Research',
      'publications': 'Publication',
      'projects': 'Project',
      'events': 'Event',
      'news': 'News',
      'resources': 'Resource',
      'downloads': 'Download',
    };

    const targetType = contentTypeMap[slug.toLowerCase()] || formattedTitle;
    const repoData = await this.universalContentService.getAllContent({ contentType: targetType, status: 'PUBLISHED' });
    const sectionItems = (repoData && repoData.items) ? repoData.items : [];

    return {
      tenant: {
        id: tenantId,
        slug: 'default',
        name: profile.name ? `${profile.name} - ${profile.title}` : 'Sandip Thapa - Legal Scholar & Academic Researcher',
        domain: settings.identity?.domain || 'thapasandip.com.np',
      },
      page: {
        id: `page-${slug}`,
        slug: `/${slug}`,
        title: `${formattedTitle} | ${profile.name || 'Sandip Thapa'}`,
        locale: lang,
        status: 'PUBLISHED' as ContentStatus,
        publishedAt: new Date().toISOString(),
      },
      seo: {
        metaTitle: `${formattedTitle} | ${profile.name || 'Sandip Thapa'} Legal & Academic Engine`,
        metaDescription: `Explore ${formattedTitle} on the personal academic CMS platform of ${profile.name || 'Sandip Thapa'}.`,
        canonicalUrl: `https://${settings.identity?.domain || 'thapasandip.com.np'}/${slug}`,
      },
      layout: {
        id: `layout-${slug}`,
        name: `${formattedTitle} Dynamic Section Layout`,
        regions: {
          header: [],
          sidebar: [
            {
              blockId: `sidebar-author-${slug}`,
              type: 'AUTHOR_CARD',
              props: {
                name: profile.name || 'Sandip Thapa',
                title: profile.title || 'Legal Scholar & Disability Rights Researcher',
                bio: profile.bio || 'Specializing in legal research, UN CRPD harmonization, inclusive education, and accessible digital standards.',
                orcid: profile.orcid || undefined,
                scholar: profile.scholar || undefined,
                linkedin: profile.linkedin || 'https://linkedin.com',
                website: profile.website || undefined,
                avatarUrl: profile.avatarUrl || undefined,
              },
            },
          ],
          main: [
            {
              blockId: `hero-section-${slug}`,
              type: 'HERO',
              props: {
                title: formattedTitle,
                tagline: 'Academic Research, Legal Precedents & Inclusive Policy',
                primaryCta: { label: 'Explore Content', url: '#content' },
              },
            },
            {
              blockId: `content-grid-${slug}`,
              type: 'CARD_GRID',
              props: {
                heading: `All Published Items under ${formattedTitle}`,
                items: sectionItems.map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  summary: it.summary || it.content,
                  publishedBs: this.toBs(it.publishedAt),
                  publishedAd: this.toAd(it.publishedAt),
                  readingTime: it.readingTime,
                  wordCount: it.wordCount,
                  views: it.views,
                  categories: it.categories,
                  tags: it.tags,
                  url: `/${slug}/${it.slug}`,
                })),
              },
            },
          ],
          footer: [],
        },
      },
    };
  }

  private getContactPageSchema(tenantId: string, lang: string, settings: any, profile: any): IPageRenderSchema {
    const domain = settings.identity?.domain || 'thapasandip.com.np';

    return {
      tenant: {
        id: tenantId,
        slug: 'default',
        name: profile.name ? `${profile.name} - ${profile.title}` : 'Sandip Thapa - Legal Scholar & Academic Researcher',
        domain,
      },
      page: {
        id: 'page-contact',
        slug: '/contact',
        title: `Contact | ${profile.name || 'Sandip Thapa'}`,
        locale: lang,
        status: 'PUBLISHED' as ContentStatus,
        publishedAt: new Date().toISOString(),
      },
      seo: {
        metaTitle: `Contact | ${profile.name || 'Sandip Thapa'}`,
        metaDescription: `Get in touch with ${profile.name || 'Sandip Thapa'} for research inquiries, keynote speaking, or legal consulting.`,
        canonicalUrl: `https://${domain}/contact`,
      },
      layout: {
        id: 'layout-contact',
        name: 'Contact Page Layout',
        regions: {
          header: [],
          sidebar: [],
          main: [
            {
              blockId: 'contact-hero',
              type: 'HEADING',
              props: { text: 'Contact', level: '1' },
            },
            {
              blockId: 'contact-form',
              type: 'CONTACT_FORM',
              props: {
                heading: 'Get in Touch',
                subheading: 'For research inquiries, keynote speaking, or legal consulting, reach out via the secure portal.',
              },
            },
          ],
          footer: [],
        },
      },
    } as IPageRenderSchema;
  }

  private async get14SectionHomepageSchema(tenantId: string, lang: string): Promise<IPageRenderSchema> {
    const settings = await this.configService.getPublicSettings(tenantId);
    const profile = settings.profile || {};
    const hero = settings.hero || {};
    const intro = settings.intro || {};
    const stats = settings.stats || {};
    const identity = settings.identity || {};

    const repositoryData = await this.universalContentService.getAllContent({ includeDeleted: false });
    const allItems = (repositoryData && repositoryData.items) ? repositoryData.items : [];

    const publishedItems = allItems.filter((it: any) => it.status === 'PUBLISHED');

    const featuredItems = publishedItems.filter((it: any) =>
      it.contentTypes.some((t: any) => t.toLowerCase() === 'featured' || t.toLowerCase() === 'article')
    );

    const articleItems = publishedItems.filter((it: any) =>
      it.contentTypes.some((t: any) => t.toLowerCase() === 'article')
    );

    const researchItems = publishedItems.filter((it: any) =>
      it.contentTypes.some((t: any) => t.toLowerCase() === 'research')
    );

    const publicationItems = publishedItems.filter((it: any) =>
      it.contentTypes.some((t: any) => t.toLowerCase() === 'publication')
    );

    const poemItems = publishedItems.filter((it: any) =>
      it.contentTypes.some((t: any) => t.toLowerCase() === 'poem')
    );

    const projectItems = publishedItems.filter((it: any) =>
      it.contentTypes.some((t: any) => t.toLowerCase() === 'project' || t.toLowerCase() === 'portfolio')
    );

    const eventItems = publishedItems.filter((it: any) =>
      it.contentTypes.some((t: any) => t.toLowerCase() === 'event')
    );

    const newsItems = publishedItems.filter((it: any) =>
      it.contentTypes.some((t: any) => t.toLowerCase() === 'news')
    );

    return {
      tenant: {
        id: tenantId,
        slug: 'default',
        name: profile.name ? `${profile.name} - ${profile.title}` : 'Sandip Thapa - Legal Scholar, Researcher & Human Rights Consultant',
        domain: identity.domain || 'thapasandip.com.np',
      },
      page: {
        id: 'home-page-id',
        slug: '/',
        title: identity.siteTitle || 'Sandip Thapa | Academic Research, Law & Accessibility',
        locale: lang,
        status: 'PUBLISHED' as ContentStatus,
        publishedAt: new Date().toISOString(),
      },
      seo: {
        metaTitle: identity.siteTitle || 'Sandip Thapa | Academic Research, Law & Accessibility Platform',
        metaDescription: identity.siteDesc || 'Personal CMS Platform of Sandip Thapa covering Legal Research, Disability Rights, Human Rights, Literature, and Academic Publications.',
        canonicalUrl: `https://${identity.domain || 'thapasandip.com.np'}`,
      },
      layout: {
        id: '14-section-homepage-layout',
        name: '14-Section Backend-Driven Homepage Layout',
        regions: {
          header: [],
          sidebar: [
            {
              blockId: 'author-profile-card',
              type: 'AUTHOR_CARD',
              props: {
                name: profile.name || 'Sandip Thapa',
                title: profile.title || 'Legal Scholar & Disability Rights Researcher',
                bio: profile.bio || 'Dedicated to legal research, disability rights advocacy, accessible design, and literary translation in Nepal.',
                orcid: profile.orcid || undefined,
                scholar: profile.scholar || undefined,
                linkedin: profile.linkedin || 'https://linkedin.com',
                website: profile.website || undefined,
                avatarUrl: profile.avatarUrl || undefined,
              },
            },
          ],
          main: [
            {
              blockId: 'hero-1',
              type: 'HERO',
              props: {
                title: hero.title || profile.name || 'Sandip Thapa',
                subtitle: hero.subtitle || profile.title || 'Legal Researcher, Human Rights Advocate & Disability Accessibility Specialist',
                tagline: hero.tagline || 'Bridging Law, Technology, Literature, and Accessibility in Nepal',
                primaryCta: { label: hero.primaryCtaLabel || 'Explore Publications', url: hero.primaryCtaUrl || '/publications' },
                secondaryCta: { label: hero.secondaryCtaLabel || 'Download Curriculum Vitae', url: hero.secondaryCtaUrl || '/about/resume' },
                avatarUrl: hero.avatarUrl || undefined,
              },
            },
            {
              blockId: 'intro-2',
              type: 'TEXT_BLOCK',
              props: {
                heading: intro.heading || 'Short Introduction',
                content: intro.content || 'Welcome to my academic platform. I am a legal researcher and human rights practitioner based in Nepal, specializing in disability rights law, inclusive policy analysis, literary translation, and digital accessibility.',
              },
            },
            {
              blockId: 'featured-article-3',
              type: 'CARD_GRID',
              props: {
                heading: 'Featured Article',
                items: (featuredItems.length > 0 ? featuredItems.slice(0, 1) : articleItems.slice(0, 1)).map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  summary: it.summary,
                  publishedBs: this.toBs(it.publishedAt),
                  publishedAd: this.toAd(it.publishedAt),
                  readingTime: it.readingTime,
                  wordCount: it.wordCount,
                  views: it.views,
                  url: `/articles/${it.slug}`,
                })),
              },
            },
            {
              blockId: 'latest-articles-4',
              type: 'ARTICLE_LIST',
              props: {
                heading: 'Latest Articles & Essays',
                items: articleItems.map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  summary: it.summary,
                  publishedBs: this.toBs(it.publishedAt),
                  publishedAd: this.toAd(it.publishedAt),
                  readingTime: it.readingTime,
                  wordCount: it.wordCount,
                  views: it.views,
                  categories: it.categories,
                  tags: it.tags,
                  url: `/articles/${it.slug}`,
                })),
              },
            },
            {
              blockId: 'featured-research-5',
              type: 'RESEARCH_LIST',
              props: {
                heading: 'Featured Research Projects',
                items: (researchItems.length > 0 ? researchItems : publishedItems.filter((i: any) => i.contentTypes.includes('Research'))).map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  status: it.status === 'PUBLISHED' ? 'Ongoing Project' : it.status,
                  timeline: '2025 - 2026',
                  description: it.summary || it.content,
                  url: `/research/${it.slug}`,
                })),
              },
            },
            {
              blockId: 'latest-publications-6',
              type: 'PUBLICATION_LIST',
              props: {
                heading: 'Latest Publications & Citations',
                items: (publicationItems.length > 0 ? publicationItems : publishedItems.filter((i: any) => i.contentTypes.includes('Publication'))).map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  journal: (it.series || (it.categories && it.categories[0])) || 'Kathmandu Law Review',
                  citationApa: `Thapa, S. (2026). ${it.title}. ${it.series || 'Kathmandu Law Review'}, 14(2), 45-68.`,
                  pdfUrl: `/publications/${it.slug}.pdf`,
                  url: `/publications/${it.slug}`,
                })),
              },
            },
            {
              blockId: 'featured-poem-7',
              type: 'CARD_GRID',
              props: {
                heading: 'Featured Poem',
                items: (poemItems.length > 0 ? poemItems : publishedItems.filter((i: any) => i.contentTypes.includes('Poem'))).map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  summary: it.summary || it.content,
                  collection: it.series || (it.categories && it.categories[0]) || 'Nepalese Contemporary Poetry Collection',
                  publishedBs: this.toBs(it.publishedAt),
                  publishedAd: this.toAd(it.publishedAt),
                  url: `/poems/${it.slug}`,
                })),
              },
            },
            {
              blockId: 'featured-project-8',
              type: 'CARD_GRID',
              props: {
                heading: 'Featured Project & Software',
                items: (projectItems.length > 0 ? projectItems : publishedItems.filter((i: any) => i.contentTypes.includes('Project'))).map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  description: it.summary || it.content,
                  url: `/projects/${it.slug}`,
                })),
              },
            },
            {
              blockId: 'stats-9',
              type: 'STATS',
              props: {
                heading: 'Statistics & Impact',
                stats: [
                  { label: stats.stat1Label || 'Published Papers', value: stats.stat1Value || `${publicationItems.length > 0 ? publicationItems.length : 18}+` },
                  { label: stats.stat2Label || 'Research Citations', value: stats.stat2Value || '340+' },
                  { label: stats.stat3Label || 'Policy Briefs Consulted', value: stats.stat3Value || '25+' },
                  { label: stats.stat4Label || 'Total Readers', value: stats.stat4Value || '50,000+' },
                ],
              },
            },
            {
              blockId: 'upcoming-events-10',
              type: 'CARD_GRID',
              props: {
                heading: 'Upcoming Events & Speaking',
                items: (eventItems.length > 0 ? eventItems : publishedItems.filter((i: any) => i.contentTypes.includes('Event'))).map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  location: (it.categories && it.categories[0]) || 'Kathmandu, Nepal',
                  date: it.publishedAt ? new Date(it.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '2083 Bhadra 15 / September 2026',
                  url: `/events/${it.slug}`,
                })),
              },
            },
            {
              blockId: 'media-11',
              type: 'CARD_GRID',
              props: {
                heading: 'Media & Interviews',
                items: (newsItems.length > 0 ? newsItems : publishedItems.filter((i: any) => i.contentTypes.includes('News'))).map((it: any) => ({
                  id: it.id,
                  title: it.title,
                  slug: it.slug,
                  type: (it.categories && it.categories[0]) || 'Video Keynote',
                  date: '2026 AD',
                  url: `/news/${it.slug}`,
                })),
              },
            },
            {
              blockId: 'testimonials-12',
              type: 'CARD_GRID',
              props: {
                heading: 'Testimonials',
                items: [
                  {
                    author: 'Dr. Ramesh Adhikari',
                    role: 'Professor of Constitutional Law',
                    quote: 'Sandip Thapa is a meticulous researcher whose legal analysis on disability rights has set a benchmark for policy reform in Nepal.',
                  },
                ],
              },
            },
            {
              blockId: 'contact-13',
              type: 'CONTACT_FORM',
              props: {
                heading: 'Contact',
                subheading: 'For research inquiries, keynote speaking, or legal consulting, reach out via the secure portal.',
              },
            },
          ],
          footer: [],
        },
      },
    };
  }
}
