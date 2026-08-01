import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPageRenderSchema, IBlockInstance } from '@cms/shared-types';
import { ContentStatus, LayoutRegionKeys, BlockTypes } from '@cms/constants';

@Injectable()
export class RendererService {
  constructor(private prisma: PrismaService) {}

  async getRenderSchema(tenantId: string, slug: string, locale = 'en'): Promise<IPageRenderSchema> {
    let tenant = await this.prisma.tenant.findFirst({
      where: { OR: [{ id: tenantId }, { slug: 'default' }, { domain: 'thapasandip.com.np' }] },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          slug: 'default',
          domain: 'thapasandip.com.np',
          name: 'Sandip Thapa Personal Website',
        },
      });
    }

    let page = await this.prisma.page.findFirst({
      where: {
        tenant_id: tenant.id,
        slug,
        locale,
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

    if (!page) {
      // Seed default Home page if requesting homepage
      if (slug === 'home' || slug === 'index' || slug === '/') {
        let layout = await this.prisma.layout.findFirst({ where: { slug: 'default-layout' } });
        if (!layout) {
          layout = await this.prisma.layout.create({
            data: {
              name: 'Default Single Column Layout',
              slug: 'default-layout',
              regions: {
                create: [
                  { key: 'header', name: 'Header Region' },
                  { key: 'main', name: 'Main Content Region' },
                  { key: 'footer', name: 'Footer Region' },
                ],
              },
            },
            include: { regions: true },
          });
        }

        page = await this.prisma.page.create({
          data: {
            tenant_id: tenant.id,
            layout_id: layout.id,
            slug,
            title: 'Home - Sandip Thapa',
            locale,
            status: ContentStatus.PUBLISHED,
            published_at: new Date(),
            seo_metadata: {
              metaTitle: 'Sandip Thapa | Senior Software Architect & Researcher',
              metaDescription: 'Official enterprise backend-driven portfolio and research platform.',
            },
          },
          include: {
            layout: { include: { regions: true } },
            region_blocks: { include: { region: true, block: { include: { definition: true } } }, orderBy: { order: 'asc' } },
          },
        });
      } else {
        throw new NotFoundException(`Page '${slug}' not found for tenant`);
      }
    }

    const regionsMap: Record<string, IBlockInstance[]> = {};
    page.layout.regions.forEach((r) => {
      regionsMap[r.key] = [];
    });

    page.region_blocks.forEach((rb) => {
      const regionKey = rb.region.key;
      if (!regionsMap[regionKey]) regionsMap[regionKey] = [];

      regionsMap[regionKey].push({
        blockId: rb.block.id,
        type: rb.block.definition.type,
        props: (rb.block.json_config as Record<string, unknown>) || {},
        style: (rb.block.style_config as Record<string, string>) || {},
      });
    });

    // Provide default fallback blocks if main is empty
    if (!regionsMap[LayoutRegionKeys.MAIN] || regionsMap[LayoutRegionKeys.MAIN].length === 0) {
      regionsMap[LayoutRegionKeys.MAIN] = [
        {
          blockId: 'default-hero-1',
          type: BlockTypes.HERO,
          props: {
            headline: 'Enterprise Backend-Driven CMS',
            subheadline: 'Sandip Thapa — Senior Software Architect & Researcher',
            ctaPrimary: { text: 'Explore Architecture', url: 'http://localhost:4000/api/docs' },
          },
          style: { paddingTop: '4rem', paddingBottom: '4rem' },
        },
      ];
    }

    const seoMeta = (page.seo_metadata as any) || {};

    return {
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        domain: tenant.domain,
      },
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        locale: page.locale,
        status: page.status as ContentStatus,
        publishedAt: page.published_at?.toISOString(),
      },
      seo: {
        metaTitle: seoMeta.metaTitle || `${page.title} | thapasandip.com.np`,
        metaDescription: seoMeta.metaDescription || 'Enterprise Backend-Driven Personal Website & CMS Platform',
        canonicalUrl: seoMeta.canonicalUrl,
        openGraphImage: seoMeta.openGraphImage,
      },
      layout: {
        id: page.layout.id,
        name: page.layout.name,
        regions: regionsMap,
      },
    };
  }
}
