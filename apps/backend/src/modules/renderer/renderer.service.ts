import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IPageRenderSchema, IBlockInstance } from '@cms/shared-types';
import { ContentStatus } from '@cms/constants';

@Injectable()
export class RendererService {
  constructor(private prisma: PrismaService) {}

  async renderPageBySlug(tenantId: string, slug: string, lang = 'en'): Promise<IPageRenderSchema> {
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

    if (!page) {
      throw new NotFoundException(`Page with slug '${slug}' not found for tenant '${tenantId}'`);
    }

    const tenantConfig = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const regionMap: Record<string, IBlockInstance[]> = {
      header: [],
      sidebar: [],
      main: [],
      footer: [],
    };

    if (page.layout && page.layout.regions) {
      page.layout.regions.forEach((r) => {
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
        id: tenantConfig?.id || tenantId,
        slug: tenantConfig?.slug || 'default',
        name: tenantConfig?.name || 'Default Site',
        domain: tenantConfig?.domain || 'localhost',
      },
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        locale: lang,
        status: page.status as ContentStatus,
        publishedAt: page.published_at ? page.published_at.toISOString() : undefined,
      },
      seo: pageSeo.meta_title
        ? {
            metaTitle: pageSeo.meta_title || page.title,
            metaDescription: pageSeo.meta_description || '',
            canonicalUrl: pageSeo.canonical_url || `https://${tenantId}/${page.slug}`,
            openGraphImage: pageSeo.og_image || undefined,
          }
        : {
            metaTitle: page.title,
            metaDescription: '',
            canonicalUrl: `https://${tenantId}/${page.slug}`,
            openGraphImage: undefined,
          },
      layout: {
        id: page.layout_id,
        name: page.layout?.name || 'Default Layout',
        regions: regionMap,
      },
    };
  }

  async getRenderSchema(tenantId: string, slug: string, lang = 'en') {
    return this.renderPageBySlug(tenantId, slug, lang);
  }
}
