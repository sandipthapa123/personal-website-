import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantConfigService {
  constructor(private prisma: PrismaService) {}

  async getSetting(tenantId: string, namespace: string, key: string): Promise<any> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: {
        tenant_id_namespace_key: {
          tenant_id: tenantId,
          namespace,
          key,
        },
      },
    });
    return setting?.value ?? null;
  }

  async setSetting(
    tenantId: string,
    namespace: string,
    key: string,
    value: any,
    isPublic = false,
  ) {
    return this.prisma.systemSetting.upsert({
      where: {
        tenant_id_namespace_key: {
          tenant_id: tenantId,
          namespace,
          key,
        },
      },
      update: {
        value,
        is_public: isPublic,
      },
      create: {
        tenant_id: tenantId,
        namespace,
        key,
        value,
        is_public: isPublic,
      },
    });
  }

  async getPublicSettings(tenantId: string): Promise<Record<string, Record<string, any>>> {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        tenant_id: tenantId,
        is_public: true,
      },
    });

    return settings.reduce((acc: Record<string, Record<string, any>>, curr: any) => {
      if (!acc[curr.namespace]) {
        acc[curr.namespace] = {};
      }
      acc[curr.namespace][curr.key] = curr.value;
      return acc;
    }, {});
  }

  async getAllTenantSettings(tenantId: string) {
    return this.getPublicSettings(tenantId);
  }
}
