import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FeatureFlagService {
  constructor(private prisma: PrismaService) {}

  async isFeatureEnabled(key: string, tenantId?: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) return false;
    return flag.is_enabled;
  }

  async getAllFlags(tenantId?: string) {
    const flags = await this.prisma.featureFlag.findMany();
    return flags.reduce((acc, flag) => {
      acc[flag.key] = flag.is_enabled;
      return acc;
    }, {} as Record<string, boolean>);
  }

  async toggleFlag(key: string, isEnabled: boolean, name?: string) {
    return this.prisma.featureFlag.upsert({
      where: { key },
      update: { is_enabled: isEnabled },
      create: {
        key,
        name: name || key,
        is_enabled: isEnabled,
      },
    });
  }
}
