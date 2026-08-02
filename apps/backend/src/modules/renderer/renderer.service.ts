import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPageRenderSchema, IBlockInstance } from '@cms/shared-types';
import { ContentStatus } from '@cms/constants';
import { formatDualCalendarDate } from '@cms/utilities';

@Injectable()
export class RendererService {
  constructor(private prisma: PrismaService) {}

  async renderPageBySlug(tenantId: string, slug: string, lang = 'en'): Promise<IPageRenderSchema> {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '') || 'home';

    try {
      const page = await this.prisma.page.findFirst({
        where: {
          tenant_id: tenantId,
          slug: cleanSlug,
          status: 'PUBLISHED',
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
        return this.formatPageResponse(page, tenantId, lang);
      }
    } catch (err) {
      // Fallback to dynamic schema generator
    }

    // Dynamic Backend-Driven Section Route Resolvers
    return this.getDynamicSectionSchema(cleanSlug, tenantId, lang);
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

  private getDynamicSectionSchema(slug: string, tenantId: string, lang: string): IPageRenderSchema {
    const formattedTitle = slug
      .split('/')
      .pop()!
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const isHomepage = slug === 'home' || slug === '' || slug === '/';

    if (isHomepage) {
      return this.get14SectionHomepageSchema(tenantId, lang);
    }

    if (slug.startsWith('dashboard')) {
      return this.getPersonalDashboardSchema(tenantId, lang);
    }

    return {
      tenant: {
        id: tenantId,
        slug: 'default',
        name: 'Sandip Thapa - Legal Scholar & Academic Researcher',
        domain: 'thapasandip.com.np',
      },
      page: {
        id: `page-${slug}`,
        slug: `/${slug}`,
        title: `${formattedTitle} | Sandip Thapa`,
        locale: lang,
        status: 'PUBLISHED' as ContentStatus,
        publishedAt: new Date().toISOString(),
      },
      seo: {
        metaTitle: `${formattedTitle} | Sandip Thapa Legal & Academic Engine`,
        metaDescription: `Explore ${formattedTitle} on the personal academic CMS platform of Sandip Thapa.`,
        canonicalUrl: `https://thapasandip.com.np/${slug}`,
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
                name: 'Sandip Thapa',
                title: 'Legal Scholar & Disability Rights Researcher',
                bio: 'Specializing in legal research, UN CRPD harmonization, inclusive education, and accessible digital standards.',
                orcid: '0000-0002-1234-5678',
                scholar: 'https://scholar.google.com',
                linkedin: 'https://linkedin.com',
                website: 'https://thapasandip.com.np',
              },
            },
          ],
          main: [
            {
              blockId: `hero-section-${slug}`,
              type: 'HERO',
              props: {
                title: formattedTitle,
                subtitle: `Backend-Driven Section: /${slug}`,
                tagline: 'Academic Research, Legal Precedents & Inclusive Policy',
                primaryCta: { label: 'Explore Content', url: '#content' },
              },
            },
            {
              blockId: `content-grid-${slug}`,
              type: 'CARD_GRID',
              props: {
                heading: `All Items under ${formattedTitle}`,
                items: [
                  {
                    title: `Harmonizing Nepalese Disability Legislation with International Standards`,
                    summary: `Evaluation of the Rights of Persons with Disabilities Act 2074 (2017) against global UN CRPD mandates.`,
                    publishedBs: '2083 Shrawan 17',
                    publishedAd: '1 August 2026',
                    timeNpt: '18:35 NPT',
                    wordCount: 1420,
                    readingTime: 7,
                    views: 3420,
                    uniqueVisitors: 1890,
                    citationApa: 'Thapa, S. (2026). Harmonizing Nepalese Disability Legislation. Kathmandu Law Review, 14(2), 45-68.',
                  },
                ],
              },
            },
          ],
          footer: [],
        },
      },
    };
  }

  private get14SectionHomepageSchema(tenantId: string, lang: string): IPageRenderSchema {
    return {
      tenant: {
        id: tenantId,
        slug: 'default',
        name: 'Sandip Thapa - Legal Scholar, Researcher & Human Rights Consultant',
        domain: 'thapasandip.com.np',
      },
      page: {
        id: 'home-page-id',
        slug: '/',
        title: 'Sandip Thapa | Academic Research, Law & Accessibility',
        locale: lang,
        status: 'PUBLISHED' as ContentStatus,
        publishedAt: new Date().toISOString(),
      },
      seo: {
        metaTitle: 'Sandip Thapa | Academic Research, Law & Accessibility Platform',
        metaDescription: 'Personal CMS Platform of Sandip Thapa covering Legal Research, Disability Rights, Human Rights, Literature, and Academic Publications.',
        canonicalUrl: 'https://thapasandip.com.np',
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
                name: 'Sandip Thapa',
                title: 'Legal Scholar & Disability Rights Researcher',
                bio: 'Dedicated to legal research, disability rights advocacy, accessible design, and literary translation in Nepal.',
                orcid: '0000-0002-1234-5678',
                scholar: 'https://scholar.google.com',
                linkedin: 'https://linkedin.com',
                website: 'https://thapasandip.com.np',
              },
            },
          ],
          main: [
            {
              blockId: 'hero-1',
              type: 'HERO',
              props: {
                title: 'Sandip Thapa',
                subtitle: 'Legal Researcher, Human Rights Advocate & Disability Accessibility Specialist',
                tagline: 'Bridging Law, Technology, Literature, and Accessibility in Nepal',
                primaryCta: { label: 'Explore Publications', url: '/publications' },
                secondaryCta: { label: 'Download Curriculum Vitae', url: '/about/resume' },
              },
            },
            {
              blockId: 'intro-2',
              type: 'TEXT_BLOCK',
              props: {
                heading: 'Short Introduction',
                content: 'Welcome to my academic platform. I am a legal researcher and human rights practitioner based in Nepal, specializing in disability rights law, inclusive policy analysis, literary translation, and digital accessibility.',
              },
            },
            {
              blockId: 'featured-article-3',
              type: 'CARD_GRID',
              props: {
                heading: 'Featured Article',
                items: [
                  {
                    title: 'Legal Capacity & Supported Decision-Making in Nepalese Jurisprudence',
                    summary: 'An analysis of Article 12 of the UN Convention on the Rights of Persons with Disabilities (CRPD) and its implementation in Nepalese courts.',
                    publishedBs: '2083 Shrawan 15',
                    publishedAd: '30 July 2026',
                    timeNpt: '14:20 NPT',
                    readingTime: 9,
                    wordCount: 2150,
                    views: 4890,
                    uniqueVisitors: 2310,
                  },
                ],
              },
            },
            {
              blockId: 'latest-articles-4',
              type: 'CARD_GRID',
              props: {
                heading: 'Latest Articles & Essays',
                items: [
                  {
                    title: 'Harmonizing Nepalese Disability Legislation with International Standards',
                    summary: 'An evaluation of the Rights of Persons with Disabilities Act 2074 (2017) against global UN CRPD mandates.',
                    publishedBs: '2083 Shrawan 17',
                    publishedAd: '1 August 2026',
                    timeNpt: '18:35 NPT',
                    readingTime: 7,
                    wordCount: 1420,
                  },
                ],
              },
            },
            {
              blockId: 'featured-research-5',
              type: 'RESEARCH_LIST',
              props: {
                heading: 'Featured Research Projects',
                items: [
                  {
                    title: 'Disability Rights & Legal Capacity under UN CRPD in Nepal',
                    status: 'Ongoing Project',
                    timeline: '2025 - 2026',
                    description: 'Comprehensive analysis of legal capacity frameworks and supported decision-making models in Nepalese jurisprudence.',
                  },
                ],
              },
            },
            {
              blockId: 'latest-publications-6',
              type: 'PUBLICATION_LIST',
              props: {
                heading: 'Latest Publications & Citations',
                items: [
                  {
                    title: 'A Critical Examination of Inclusive Education Policies for Persons with Disabilities in Nepal',
                    journal: 'Kathmandu Law Review',
                    citationApa: 'Thapa, S. (2026). A Critical Examination of Inclusive Education Policies in Nepal. Kathmandu Law Review, 14(2), 45-68.',
                    pdfUrl: '/publications/inclusive-education.pdf',
                  },
                ],
              },
            },
            {
              blockId: 'featured-poem-7',
              type: 'CARD_GRID',
              props: {
                heading: 'Featured Poem',
                items: [
                  {
                    title: 'Echoes of Silence (मौनताका प्रतिध्वनिहरू)',
                    collection: 'Nepalese Contemporary Poetry Collection',
                    publishedBs: '2083 Shrawan 10',
                    publishedAd: '25 July 2026',
                  },
                ],
              },
            },
            {
              blockId: 'featured-project-8',
              type: 'CARD_GRID',
              props: {
                heading: 'Featured Project & Software',
                items: [
                  {
                    title: 'Nepal Legal Accessibility Knowledge Engine',
                    description: 'An open-access digital portal converting Nepalese statutory laws and court precedents into braille-friendly, screen-reader accessible web standards.',
                  },
                ],
              },
            },
            {
              blockId: 'stats-9',
              type: 'STATS',
              props: {
                heading: 'Statistics & Impact',
                stats: [
                  { label: 'Published Papers', value: '18+' },
                  { label: 'Research Citations', value: '340+' },
                  { label: 'Policy Briefs Consulted', value: '25+' },
                  { label: 'Total Readers', value: '50,000+' },
                ],
              },
            },
            {
              blockId: 'upcoming-events-10',
              type: 'CARD_GRID',
              props: {
                heading: 'Upcoming Events & Speaking',
                items: [
                  {
                    title: 'National Symposium on Disability Rights & Constitutional Reforms',
                    location: 'Kathmandu, Nepal',
                    date: '2083 Bhadra 15 / September 2026',
                  },
                ],
              },
            },
            {
              blockId: 'media-11',
              type: 'CARD_GRID',
              props: {
                heading: 'Media & Interviews',
                items: [
                  {
                    title: 'Keynote Address: Digital Accessibility & Human Rights in South Asia',
                    type: 'Video Keynote',
                    date: '2026 AD',
                  },
                ],
              },
            },
            {
              blockId: 'testimonials-12',
              type: 'CARD_GRID',
              props: {
                heading: 'Testimonials',
                items: [
                  {
                    name: 'Dr. Ramesh Adhikari',
                    role: 'Professor of Constitutional Law',
                    quote: 'Sandip Thapa is a meticulous researcher whose legal analysis on disability rights has set a benchmark for policy reform in Nepal.',
                  },
                ],
              },
            },
            {
              blockId: 'newsletter-13',
              type: 'CONTACT_FORM',
              props: {
                heading: 'Newsletter Subscription',
                description: 'Receive quarterly updates on legal research, policy papers, and literary translations.',
              },
            },
            {
              blockId: 'contact-14',
              type: 'CONTACT_FORM',
              props: {
                heading: 'Contact',
                description: 'For research inquiries, keynote speaking, or legal consulting, reach out via the secure portal.',
              },
            },
          ],
          footer: [],
        },
      },
    };
  }

  private getPersonalDashboardSchema(tenantId: string, lang: string): IPageRenderSchema {
    return {
      tenant: {
        id: tenantId,
        slug: 'default',
        name: 'Sandip Thapa Personal CMS Platform',
        domain: 'thapasandip.com.np',
      },
      page: {
        id: 'user-dashboard-id',
        slug: '/dashboard',
        title: 'Personal Dashboard | Sandip Thapa',
        locale: lang,
        status: 'PUBLISHED' as ContentStatus,
        publishedAt: new Date().toISOString(),
      },
      seo: {
        metaTitle: 'Personal Dashboard | Sandip Thapa',
        metaDescription: 'User account dashboard for saved articles, bookmarks, downloads, and accessibility preferences.',
        canonicalUrl: 'https://thapasandip.com.np/dashboard',
      },
      layout: {
        id: 'user-dashboard-layout',
        name: 'Personal User Dashboard Layout',
        regions: {
          header: [],
          sidebar: [
            {
              blockId: 'user-profile-widget',
              type: 'AUTHOR_CARD',
              props: {
                name: 'Sandip Thapa User Account',
                title: 'Registered Academic Scholar',
                bio: 'Manage saved research papers, reading history, notifications, and WCAG 2.2 AAA accessibility controls.',
              },
            },
          ],
          main: [
            {
              blockId: 'dash-hero',
              type: 'HERO',
              props: {
                title: 'Personal Account Dashboard',
                subtitle: 'Manage your saved research, reading history, bookmarks, and preferences.',
                tagline: 'Backend-Driven User Account Engine',
              },
            },
            {
              blockId: 'dash-features',
              type: 'CARD_GRID',
              props: {
                heading: 'Dashboard Navigation & Tools',
                items: [
                  { title: '📌 Saved Articles', summary: '3 Articles saved to your reading list.' },
                  { title: '📖 Reading History', summary: '12 Items viewed in the last 30 days.' },
                  { title: '🔖 Bookmarks', summary: 'Quick access to key legal capacity research papers.' },
                  { title: '📥 Downloads', summary: 'PDF downloads of journal papers and policy briefs.' },
                  { title: '🔔 Notifications', summary: '2 Unread alerts on new publication releases.' },
                  { title: '👤 User Profile', summary: 'Manage account credentials and contact info.' },
                  { title: '♿ Accessibility Preferences', summary: 'Customize high-contrast mode, font scale, and dyslexia font.' },
                ],
              },
            },
          ],
          footer: [],
        },
      },
    };
  }

  async getRenderSchema(tenantId: string, slug: string, lang = 'en') {
    return this.renderPageBySlug(tenantId, slug, lang);
  }
}
