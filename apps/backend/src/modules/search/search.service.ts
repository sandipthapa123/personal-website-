import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(tenantId: string, query: string, locale = 'en') {
    if (!query || query.trim().length === 0) return [];

    const results = await this.prisma.searchIndex.findMany({
      where: {
        tenant_id: tenantId,
        locale,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });

    return results;
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
