import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantConfigService {
  constructor(private prisma: PrismaService) {}

  async getSetting(tenantId: string, category: string, key: string) {
    const setting = await this.prisma.tenantSetting.findUnique({
      where: {
        tenant_id_category_key: {
          tenant_id: tenantId,
          category,
          key,
        },
      },
    });

    return setting ? setting.value : null;
  }

  async setSetting(tenantId: string, category: string, key: string, value: any) {
    return this.prisma.tenantSetting.upsert({
      where: {
        tenant_id_category_key: {
          tenant_id: tenantId,
          category,
          key,
        },
      },
      update: { value },
      create: {
        tenant_id: tenantId,
        category,
        key,
        value,
      },
    });
  }

  async getAllTenantSettings(tenantId: string) {
    const settings = await this.prisma.tenantSetting.findMany({
      where: { tenant_id: tenantId },
    });

    return settings.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = {};
      acc[curr.category][curr.key] = curr.value;
      return acc;
    }, {} as Record<string, Record<string, any>>);
  }
}
