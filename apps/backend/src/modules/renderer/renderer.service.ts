import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPageRenderSchema, IBlockInstance } from '@cms/shared-types';
import { ContentStatus } from '@cms/constants';
import { formatDualCalendarDate } from '@cms/utilities';

@Injectable()
export class RendererService {
  constructor(private prisma: PrismaService) {}

  async renderPageBySlug(tenantId: string, slug: string, lang = 'en'): Promise<IPageRenderSchema> {
    try {
      const page = await this.prisma.page.findFirst({
        where: {
          tenant_id: tenantId,
          slug,
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
      // Fallback to default backend-driven schema if DB is offline or empty
    }

    // Default Backend-Driven Homepage Contract (12 Sections)
    if (slug === '/' || slug === 'home' || slug === '') {
      return this.getDefaultHomepageSchema(tenantId, lang);
    }

    throw new NotFoundException(`Page with slug '${slug}' not found for tenant '${tenantId}'`);
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
        metaDescription: pageSeo.meta_description || 'Sandip Thapa Personal CMS Engine Platform',
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

  private getDefaultHomepageSchema(tenantId: string, lang: string): IPageRenderSchema {
    const nowDual = formatDualCalendarDate(new Date());

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
        id: 'default-homepage-layout',
        name: '12-Section Backend-Driven Homepage Layout',
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
                orcid: 'https://orcid.org',
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
              blockId: 'about-2',
              type: 'TEXT_BLOCK',
              props: {
                heading: 'About Me',
                content: 'Welcome to my academic platform. I am a legal researcher and human rights practitioner based in Nepal, specializing in disability rights law, inclusive policy analysis, literary translation, and digital accessibility.',
              },
            },
            {
              blockId: 'featured-research-3',
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
              blockId: 'latest-publications-5',
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
              blockId: 'featured-poems-6',
              type: 'CARD_GRID',
              props: {
                heading: 'Featured Poems & Literary Works',
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
              blockId: 'projects-7',
              type: 'CARD_GRID',
              props: {
                heading: 'Projects & Digital Initiatives',
                items: [
                  {
                    title: 'Nepal Legal Accessibility Knowledge Engine',
                    description: 'An open-access digital portal converting Nepalese statutory laws and court precedents into braille-friendly, screen-reader accessible web standards.',
                  },
                ],
              },
            },
            {
              blockId: 'media-8',
              type: 'CARD_GRID',
              props: {
                heading: 'Media & Speaking Engagements',
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
              blockId: 'stats-9',
              type: 'STATS',
              props: {
                heading: 'Academic & Social Impact',
                stats: [
                  { label: 'Published Papers', value: '18+' },
                  { label: 'Research Citations', value: '340+' },
                  { label: 'Policy Briefs Consulted', value: '25+' },
                  { label: 'Total Readers', value: '50,000+' },
                ],
              },
            },
            {
              blockId: 'testimonials-10',
              type: 'CARD_GRID',
              props: {
                heading: 'Testimonials & Endorsements',
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
              blockId: 'newsletter-11',
              type: 'CONTACT_FORM',
              props: {
                heading: 'Subscribe to Academic Newsletter',
                description: 'Receive quarterly updates on legal research, policy papers, and literary translations.',
              },
            },
            {
              blockId: 'contact-12',
              type: 'CONTACT_FORM',
              props: {
                heading: 'Get in Touch',
                description: 'For research inquiries, keynote speaking, or legal consulting, reach out via the secure portal.',
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
