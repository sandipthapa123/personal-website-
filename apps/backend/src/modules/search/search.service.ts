import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(tenantId: string, query: string, locale = 'en', category?: string, type?: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const results = await this.prisma.searchIndex.findMany({
        where: {
          tenant_id: tenantId,
          locale,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
        take: 25,
      });

      if (results && results.length > 0) {
        return results;
      }
    } catch (err) {
      console.error('Search failed', err);
      // Fall through to the live content query below.
    }

    // The SearchIndex table is only populated by explicit indexEntity() calls, so on
    // this deployment it is empty and site search always returned nothing. Query the
    // published content repository directly as the source of truth.
    try {
      const items = await this.prisma.universalContent.findMany({
        where: {
          deleted_at: null,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          locale,
          ...(type ? { content_type: type } : {}),
          OR: [
            { title: { contains: query } },
            { summary: { contains: query } },
            { content: { contains: query } },
          ],
        },
        orderBy: { published_at: 'desc' },
        take: 25,
        select: { id: true, title: true, slug: true, summary: true, content_type: true, published_at: true },
      });

      const urlPrefix: Record<string, string> = {
        Article: 'articles', Poem: 'poems', Research: 'research', Publication: 'publications',
        Project: 'projects', Event: 'events', News: 'news', Resource: 'resources', Download: 'downloads',
      };

      return items.map((i) => ({
        id: i.id,
        entity_type: i.content_type,
        entity_id: i.id,
        title: i.title,
        content: i.summary || '',
        url: `/${urlPrefix[i.content_type] || 'content'}/${i.slug}`,
        locale,
        publishedAt: i.published_at,
      }));
    } catch (err) {
      console.error('Content search failed', err);
      return [];
    }
  }

  async indexEntity(tenantId: string, entityType: string, entityId: string, title: string, content: string, url: string, locale = 'en') {
    return this.prisma.searchIndex.upsert({
      where: {
        entity_type_entity_id: {
          entity_type: entityType,
          entity_id: entityId,
        },
      },
      update: {
        title,
        content,
        url,
        locale,
      },
      create: {
        tenant_id: tenantId,
        entity_type: entityType,
        entity_id: entityId,
        title,
        content,
        url,
        locale,
      },
    });
  }
}
