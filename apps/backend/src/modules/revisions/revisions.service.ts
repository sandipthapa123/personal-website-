import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RevisionsService {
  constructor(private prisma: PrismaService) {}

  async createPageRevision(pageId: string, layoutJson: any, userId?: string) {
    const latest = await this.prisma.pageVersion.findFirst({
      where: { page_id: pageId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latest?.version || 0) + 1;

    return this.prisma.pageVersion.create({
      data: {
        page_id: pageId,
        version: nextVersion,
        layout_json: layoutJson,
        created_by: userId,
      },
    });
  }

  async getPageRevisions(pageId: string) {
    return this.prisma.pageVersion.findMany({
      where: { page_id: pageId },
      orderBy: { version: 'desc' },
    });
  }

  async rollbackPage(pageId: string, targetVersion: number) {
    const revision = await this.prisma.pageVersion.findFirst({
      where: { page_id: pageId, version: targetVersion },
    });

    if (!revision) {
      throw new NotFoundException(`Revision version ${targetVersion} not found for page ${pageId}`);
    }

    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        version: revision.version,
        seo_metadata: (revision.layout_json as any)?.seoMetadata,
      },
    });
  }
}
