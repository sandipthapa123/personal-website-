import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DEFAULT_ACCESSIBILITY_PREFERENCES, IAccessibilityPreferences } from '@cms/accessibility';

@Injectable()
export class AccessibilityBackendService {
  constructor(private prisma: PrismaService) {}

  async getPreferences(tenantId: string): Promise<IAccessibilityPreferences> {
    const setting = await this.prisma.tenantSetting.findUnique({
      where: {
        tenant_id_category_key: {
          tenant_id: tenantId,
          category: 'accessibility',
          key: 'preferences',
        },
      },
    });

    if (!setting) return DEFAULT_ACCESSIBILITY_PREFERENCES;
    return setting.value as unknown as IAccessibilityPreferences;
  }

  async updatePreferences(tenantId: string, prefs: Partial<IAccessibilityPreferences>) {
    const current = await this.getPreferences(tenantId);
    const updated = { ...current, ...prefs };

    await this.prisma.tenantSetting.upsert({
      where: {
        tenant_id_category_key: {
          tenant_id: tenantId,
          category: 'accessibility',
          key: 'preferences',
        },
      },
      update: { value: updated as any },
      create: {
        tenant_id: tenantId,
        category: 'accessibility',
        key: 'preferences',
        value: updated as any,
      },
    });

    return updated;
  }
}
