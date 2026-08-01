import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private hashIp(ip?: string): string | undefined {
    if (!ip) return undefined;
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  }

  async trackEvent(tenantId: string, eventType: string, path: string, referrer?: string, ipAddress?: string) {
    return this.prisma.analyticsEvent.create({
      data: {
        tenant_id: tenantId,
        event_type: eventType,
        path,
        referrer,
        ip_hash: this.hashIp(ipAddress),
      },
    });
  }

  async getSummary(tenantId: string) {
    const totalEvents = await this.prisma.analyticsEvent.count({
      where: { tenant_id: tenantId },
    });

    const pageviews = await this.prisma.analyticsEvent.count({
      where: { tenant_id: tenantId, event_type: 'pageview' },
    });

    return { totalEvents, pageviews };
  }
}
