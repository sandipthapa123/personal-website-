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
      acc[flag.key] = flag.is_enabled;
      return acc;
    }, {});
  }

  async isFeatureEnabled(tenantId: string, flagKey: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: {
        key: flagKey,
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
        key: flagKey,
      },
      update: {
        is_enabled: isEnabled,
        description,
      },
      create: {
        tenant_id: tenantId,
        key: flagKey,
        name: flagKey,
        is_enabled: isEnabled,
        description,
      },
    });
  }
}
