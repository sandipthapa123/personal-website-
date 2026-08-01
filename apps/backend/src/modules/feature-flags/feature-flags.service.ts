import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FeatureFlagsService {
  constructor(private prisma: PrismaService) {}

  async getAllFlags(tenantId: string): Promise<Record<string, boolean>> {
    const flags = await this.prisma.featureFlag.findMany({
      where: { tenant_id: tenantId },
    });

    return flags.reduce((acc: Record<string, boolean>, flag: any) => {
      acc[flag.flag_key] = flag.is_enabled;
      return acc;
    }, {});
  }

  async isFeatureEnabled(tenantId: string, flagKey: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: {
        tenant_id_flag_key: {
          tenant_id: tenantId,
          flag_key: flagKey,
        },
      },
    });

    return flag?.is_enabled ?? false;
  }

  async setFeatureFlag(
    tenantId: string,
    flagKey: string,
    isEnabled: boolean,
    description?: string,
  ) {
    return this.prisma.featureFlag.upsert({
      where: {
        tenant_id_flag_key: {
          tenant_id: tenantId,
          flag_key: flagKey,
        },
      },
      update: {
        is_enabled: isEnabled,
        description,
      },
      create: {
        tenant_id: tenantId,
        flag_key: flagKey,
        is_enabled: isEnabled,
        description,
      },
    });
  }
}
