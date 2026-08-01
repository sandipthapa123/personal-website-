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
        layout: true,
        region_blocks: {
          include: {
            block_instance: {
              include: {
                component_definition: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        seo_metadata: true,
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
      (page.layout.regions as string[]).forEach((r: string) => {
        if (!regionMap[r]) {
          regionMap[r] = [];
        }
      });
    }

    page.region_blocks.forEach((rb: any) => {
      const regionKey = rb.region_key || 'main';
      if (!regionMap[regionKey]) {
        regionMap[regionKey] = [];
      }

      const instance = rb.block_instance;
      if (instance) {
        regionMap[regionKey].push({
          blockId: instance.id,
          type: instance.component_definition.type,
          props: (instance.props as Record<string, any>) || {},
          style: (instance.styles as Record<string, any>) || {},
        });
      }
    });

    const pageSeo = page.seo_metadata;

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
      seo: pageSeo
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
