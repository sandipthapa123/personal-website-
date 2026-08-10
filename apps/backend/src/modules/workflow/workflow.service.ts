import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ContentStatus } from '@cms/constants';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  private allowedTransitions: Record<ContentStatus, ContentStatus[]> = {
    [ContentStatus.DRAFT]: [ContentStatus.PREVIEW, ContentStatus.REVIEW, ContentStatus.ARCHIVED],
    [ContentStatus.PREVIEW]: [ContentStatus.REVIEW, ContentStatus.DRAFT],
    [ContentStatus.REVIEW]: [ContentStatus.APPROVED, ContentStatus.DRAFT],
    [ContentStatus.APPROVED]: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED, ContentStatus.DRAFT],
    [ContentStatus.SCHEDULED]: [ContentStatus.PUBLISHED, ContentStatus.DRAFT],
    [ContentStatus.PUBLISHED]: [ContentStatus.ARCHIVED, ContentStatus.DRAFT],
    [ContentStatus.ARCHIVED]: [ContentStatus.DRAFT],
  };

  validateTransition(currentStatus: ContentStatus, targetStatus: ContentStatus): boolean {
    const allowed = this.allowedTransitions[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  async transitionPageStatus(pageId: string, targetStatus: ContentStatus, userId?: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new BadRequestException('Page not found');

    const currentStatus = page.status as ContentStatus;
    if (!this.validateTransition(currentStatus, targetStatus)) {
      throw new BadRequestException(`Invalid workflow transition from ${currentStatus} to ${targetStatus}`);
    }

    const updated = await this.prisma.page.update({
      where: { id: pageId },
      data: {
        status: targetStatus,
        published_at: targetStatus === ContentStatus.PUBLISHED ? new Date() : page.published_at,
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: page.tenant_id,
        user_id: userId,
        action: `workflow:transition:${targetStatus}`,
        entity_type: 'Page',
        entity_id: pageId,
        payload: JSON.stringify({ from: currentStatus, to: targetStatus }),
      },
    });

    return updated;
  }
}
