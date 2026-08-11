import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const APP_BASE_URL = process.env.APP_URL || 'http://localhost:4000';

const DEFAULT_SETTINGS: Record<string, Record<string, any>> = {
  identity: {
    siteTitle: 'Sandip Thapa | Academic Research, Law & Accessibility Platform',
    siteDesc: 'Personal CMS Platform of Sandip Thapa covering Legal Research, Disability Rights, Human Rights, Literature, and Academic Publications.',
    domain: 'thapasandip.com.np',
    locale: 'en',
  },
  profile: {
    name: 'Sandip Thapa',
    title: 'Legal Scholar & Disability Rights Researcher',
    bio: 'Dedicated to legal research, disability rights advocacy, accessible design, and literary translation in Nepal.',
    orcid: '',
    scholar: '',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com/sandipthapa123',
    website: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    avatarUrl: `${APP_BASE_URL}/uploads/profile/Sandip%20Thapa%20in%20KU%20background%20.jpg`,
  },
  hero: {
    title: 'Sandip Thapa',
    subtitle: 'Legal Researcher, Human Rights Advocate & Disability Accessibility Specialist',
    tagline: 'Bridging Law, Technology, Literature, and Accessibility in Nepal',
    primaryCtaLabel: 'Explore Publications',
    primaryCtaUrl: '/publications',
    secondaryCtaLabel: 'Download Curriculum Vitae',
    secondaryCtaUrl: '/about/resume',
    avatarUrl: `${APP_BASE_URL}/uploads/profile/sandip%20thapa%2C%20with%20coat%20pant.jpg`,
  },
  intro: {
    heading: 'Short Introduction',
    content: 'Welcome to my academic platform. I am a legal researcher and human rights practitioner based in Nepal, specializing in disability rights law, inclusive policy analysis, literary translation, and digital accessibility.',
  },
  stats: {
    stat1Label: 'Published Papers',
    stat1Value: '18+',
    stat2Label: 'Research Citations',
    stat2Value: '340+',
    stat3Label: 'Policy Briefs Consulted',
    stat3Value: '25+',
    stat4Label: 'Total Readers',
    stat4Value: '50,000+',
  },
  footer: {
    aboutText: 'Sandip Thapa — Legal Scholar, Human Rights Advocate, and Disability Accessibility Specialist based in Nepal. Advancing evidence-based policy, inclusive design, and academic publishing.',
    copyright: '© 2083 BS / 2026 AD Sandip Thapa. All rights reserved.',
  },
};

@Injectable()
export class TenantConfigService {
  private inMemoryCache: Record<string, Record<string, any>> = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  constructor(private prisma: PrismaService) {}

  private async getValidTenantId(providedId?: string): Promise<string | null> {
    try {
      if (providedId && providedId.length === 36 && providedId.includes('-')) {
        const existing = await this.prisma.tenant.findUnique({ where: { id: providedId } });
        if (existing) return existing.id;
      }
      const first = await this.prisma.tenant.findFirst();
      if (first) return first.id;

      const created = await this.prisma.tenant.create({
        data: {
          name: 'Sandip Thapa CMS Platform',
          slug: 'default',
          domain: 'thapasandip.com.np',
        },
      });
      return created.id;
    } catch (err) {
      return null;
    }
  }

  async getSetting(tenantId: string, category: string, key: string): Promise<any> {
    try {
      const tid = await this.getValidTenantId(tenantId);
      if (tid) {
        const setting = await this.prisma.tenantSetting.findUnique({
          where: {
            tenant_id_category_key: {
              tenant_id: tid,
              category,
              key,
            },
          },
        });
        if (setting && setting.value !== undefined && setting.value !== null) {
          return setting.value;
        }
      }
    } catch (err) {
      // Fallback
    }

    return this.inMemoryCache[category]?.[key] ?? DEFAULT_SETTINGS[category]?.[key] ?? null;
  }

  async setSetting(
    tenantId: string,
    category: string,
    key: string,
    value: any,
    isPublic = false,
  ) {
    if (!this.inMemoryCache[category]) {
      this.inMemoryCache[category] = {};
    }
    this.inMemoryCache[category][key] = value;

    try {
      const tid = await this.getValidTenantId(tenantId);
      if (tid) {
        await this.prisma.tenantSetting.upsert({
          where: {
            tenant_id_category_key: {
              tenant_id: tid,
              category,
              key,
            },
          },
          update: {
            value,
          },
          create: {
            tenant_id: tid,
            category,
            key,
            value,
          },
        });
      }
    } catch (err) {
      // Saved in memory cache
    }

    return { category, key, value };
  }

  async saveBulkSettings(tenantId: string, settings: Record<string, Record<string, any>>) {
    if (!settings || typeof settings !== 'object') return [];
    const results: any[] = [];
    for (const [category, group] of Object.entries(settings)) {
      if (typeof group === 'object' && group !== null) {
        for (const [key, value] of Object.entries(group)) {
          const res = await this.setSetting(tenantId, category, key, value);
          results.push(res);
        }
      }
    }
    return results;
  }

  async getPublicSettings(tenantId: string): Promise<Record<string, Record<string, any>>> {
    const merged: Record<string, Record<string, any>> = JSON.parse(JSON.stringify(this.inMemoryCache));

    try {
      const tid = await this.getValidTenantId(tenantId);
      if (tid) {
        const dbSettings = await this.prisma.tenantSetting.findMany({
          where: {
            tenant_id: tid,
          },
        });

        dbSettings.forEach((curr: any) => {
          if (!merged[curr.category]) {
            merged[curr.category] = {};
          }
          merged[curr.category][curr.key] = curr.value;
          this.inMemoryCache[curr.category][curr.key] = curr.value;
        });
      }
    } catch (err) {
      // Return memory cache
    }

    return merged;
  }

  async getAllTenantSettings(tenantId: string) {
    return this.getPublicSettings(tenantId);
  }
}
